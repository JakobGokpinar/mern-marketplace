const AWS = require('aws-sdk'); //call AWS services using APIs.
require("dotenv").config();
const multer = require('multer');   //dosya yükleme işlemi için kullanılır
const multerS3 = require('multer-s3');
const mongoose = require('mongoose');
const express = require('express');
const crypto = require('crypto');   //to create annonce id 
const ObjectId = require('mongoose').Types.ObjectId;

const AnnonceModel = require('./models/AnnonceModel.js');
const UserModel = require('./models/UserModel.js');

const BUCKET_NAME = process.env.AWS_BUCKET_NAME;
const ACCESS_KEY = process.env.AWS_ACCESS_KEY;
const SECRET_KEY = process.env.AWS_SECRET_ACCESS_KEY;
const REGION = process.env.AWS_BUCKET_REGION;

// configure s3
const s3 = new AWS.S3({
    accessKeyId: ACCESS_KEY,
    secretAccessKey: SECRET_KEY,
    region: REGION,
  });

  const checkFileType = (req, file, cb) => {
    if (file.mimetype === "image/jpeg" || file.mimetype === "image/jpg" || file.mimetype === "image/png") {
      cb(null, true);
    } else {
      cb('file type is wrong', false);
    }
  };

  const uploadImagesToMulter = (bucketName) => multer({
    storage: multerS3({
      s3: s3,
      bucket: bucketName,
      metadata: function (req, file, cb) {
        cb(null, { fieldName: file.fieldname });
      },
      key: function (req, file, cb) {
        cb(null, file.originalname);    //dosyanın s3'ye yüklenirken kullanılacak adı
      },
    }),
    fileFilter: checkFileType
  }).array('annonceImages',10);  //post request atarken kullanılması gerekn key değeri ve aynı anda maks. kaç dosya yüklenebilir

uploadImagesToAws = (req, res, info) => {
    if (!req.isAuthenticated()) return res.json({message: 'You have to login to upload files'});
    const user = req.user.email;  //bucket'da her kullanıcı için bir klasör var.
   
    var annonceId = null;
    if(req.query.annonceid) {
      annonceId = req.query.annonceid
    } else {
      annonceId = crypto.randomBytes(12).toString('hex')
    }
    const fileLocation = user + '/annonce-' + annonceId
    const uploadImages = uploadImagesToMulter(`${BUCKET_NAME}/${fileLocation}`)

    uploadImages(req, res, err => {
        if (err){
            res.json({message: 'files could not uploaded', error: err})
            return;
        }
        res.status(200).json({ files: req.files, message: 'images uploaded', annonceId})
    })
}

saveAnnonceToDatabase = (req, res) => {
  if(!req.isAuthenticated()) return res.send('user not logged in')

    const user = req.user;
    const annonceProps = req.body.annonceproperties;
    const annonceImages = req.body.imagelocations;
    const annonceId = req.body.annonceid;

    let newAnnonce = AnnonceModel(annonceProps)
    newAnnonce._id = new ObjectId(annonceId);
    newAnnonce.annonceImages = annonceImages;
    newAnnonce.sellerId = new ObjectId(user._id)

    uploadToUser(user, newAnnonce);
    uploadToAnnonces(newAnnonce, res)
}

// save  annonce to the user's annonces
uploadToUser = (user, newAnnonce, res) => {
  mongoose.connection.useDb('user').collection('users')
  .updateOne({ _id: user._id}, { $push: { annonces: newAnnonce } })
  .then(() => {
      // console.log('annonce saved to the user')
  })
  .catch (error => {
    res.json(error)
  })
}

//  save annonce to the general annonces database
uploadToAnnonces = (newAnnonce, res) => {
  mongoose.connection.useDb('announcements').collection('annonces')
        .insertOne(newAnnonce)
        .then(result => {
          // console.log('annonce saved to the annonce collection')
          res.json({ message: 'annonce created', result})
        })
        .catch (error => {
          res.json(error)
      })
}

removeAnnonce = async (req, res) => {
  if (!req.isAuthenticated()) return;

  const email = req.user.email;
  const userId = req.user.id;
  const annonceId = req.body.annonceid;
  let awsKey = email + "/annonce-" + annonceId + "/";

  let params = {
    Bucket: BUCKET_NAME,
    Prefix: awsKey
  }
  
  s3.listObjectsV2(params, async (err, data) => {
    if(err) {
      console.log(err);
      res.json({error: err, message: 'Error occured'})
      return;
    }

    const files = data.Contents;

    if (files.length === 0) {
      res.status(200).json({message: 'File already been deleted'})
      return;
    }

    const deleteParams = {
      Bucket: BUCKET_NAME,
      Delete: { Objects: [] }
    };
  
    files.forEach(file => {
      deleteParams.Delete.Objects.push({ Key: file.Key });
    });
  
    s3.deleteObjects(deleteParams, async (err, data) => {
      if (err) {
        console.log(err, err.stack);
        res.json({error: err, message: 'Error occured while deleting objects'})
        return;
      }
      
      try {
        var response = await AnnonceModel.deleteOne({_id: ObjectId(annonceId)})
        response = await UserModel.updateMany({_id: ObjectId(userId)}, 
          {
            $pull: {
              annonces: {
                 _id: ObjectId(annonceId)
              }
            }
          })

          return res.status(200).json({message: 'Annonce deleted from database'})
      } catch (error) {
        console.log(error);
        return res.json({error, message: 'Error occured'})
      }
    });
  })
}

removeAnnonceImagesFromAWS = async (req, res) => {
  if(!req.isAuthenticated()) return res.status(300);
  console.log("sa")

  try {
      const userEmail = req.user.email;
      const annonceId = req.body.annonceId;
      const awsPrefix = userEmail + "/annonce-" + annonceId + "/";

      let response = await s3.listObjectsV2({
        Bucket: BUCKET_NAME, 
        Prefix: awsPrefix
      })
      .promise();

      const bucketFiles = response.Contents;
      const deleteParams = {
        Bucket: BUCKET_NAME,
        Delete: { Objects: [] }
      };

      bucketFiles.forEach(file => {
        deleteParams.Delete.Objects.push({ Key: file.Key });
      });

      response = await s3.deleteObjects(deleteParams).promise();
      return res.status(200).json({message: 'annonce images deleted successfully'})
  } catch (error) {
      console.log(error);
      return res.status(300).json({error, message: 'Error occured while deleting s3 objects'})
  }
}

updateAnnonce = async (req, res) => {
  if(!req.isAuthenticated()) return;

  const userId = req.user.id;
  const annonceId = req.body.annonceId;
  const annonceImages = req.body.annonceImages;
  const annonceProperties = req.body.annonceproperties;

  try {
      let newAnnonce = AnnonceModel(annonceProperties)
      newAnnonce._id = new ObjectId(annonceId);
      newAnnonce.annonceImages = annonceImages;
      newAnnonce.sellerId = new ObjectId(userId)

      const query = { _id: ObjectId(userId), "annonces._id": ObjectId(annonceId) };
      const updateDocument = {
        $set: { "annonces.$": newAnnonce }
      };
      await UserModel.updateOne(query, updateDocument);
      await AnnonceModel.replaceOne(
        {_id: ObjectId(annonceId)},
        newAnnonce)

      return res.status(200).json({message: 'mission successful'})

  } catch (error) {
    console.log(error);
    return res.status(300).json({error, message: 'Error occured while updating annonce'})
  }
}

const router = express.Router();

router.post('/imageupload', uploadImagesToAws)
router.post('/create',saveAnnonceToDatabase);
router.post('/remove/annonceimages', removeAnnonceImagesFromAWS)
router.post('/update', updateAnnonce)
router.post('/delete', removeAnnonce);

module.exports = router;