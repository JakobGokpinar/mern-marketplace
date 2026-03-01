const express = require('express');
const AWS = require('aws-sdk');
const multer = require('multer');   //dosya yükleme işlemi için kullanılır
const multerS3 = require('multer-s3');
const UserModel = require("./models/UserModel.js");
const AnnonceModel = require("./models/AnnonceModel.js");
const ConversationModel = require("./models/ConversationModel.js");
const ObjectId = require('mongoose').Types.ObjectId;
require('dotenv').config();

const BUCKET_NAME = process.env.AWS_BUCKET_NAME;
const ACCESS_KEY = process.env.AWS_ACCESS_KEY;
const SECRET_KEY = process.env.AWS_SECRET_ACCESS_KEY;
const REGION = process.env.AWS_BUCKET_REGION;

const s3 = new AWS.S3({
    accessKeyId: ACCESS_KEY,
    secretAccessKey: SECRET_KEY,
    region: REGION
});

const checkFileType = (req, file, cb) => {
    if (file.mimetype === "image/jpeg" || file.mimetype === "image/jpg" || file.mimetype === "image/png") {
      cb(null, true);
    } else {
      cb('file type is wrong', false);
    }
  };

  const uploadImageToMulter = (bucketName) => multer({
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
  }).single('profileImage')

const ensureAuth = (req, res, next) => {
    if (!req.isAuthenticated()) {
        return res.status(401).json({ message: 'You have to login to upload files' });
    }
    next();
};

uploadImageToAws = (req, res, info) => {
    let fileLocation = req.user.email;  //bucket'da her kullanıcı için bir klasör var.
    let userId = req.user._id;
    const uploadImages = uploadImageToMulter(`${BUCKET_NAME}/${fileLocation}`)

    uploadImages(req, res, err => {
        if (err){
            res.json({message: 'picture could not uploaded', error: err})
            return;
        }
        UserModel.findByIdAndUpdate({_id: ObjectId(userId)}, {
            profilePicture: req.file.location
        }, {useFindAndModify: false, returnDocument: 'after'}).then(result => {
            if(result) {
              res.json({ user: result, message: 'profile picture uploaded'})
            } else {
              res.json({message: 'Picture could not uploaded'})
            }
        })
    })
}

removeProfileImage = (req, res) => {
  const userId = req.user._id;
  const user = req.user.email;
  const bucket = BUCKET_NAME + "/" + user
  var params = {  Bucket: bucket, Key: 'profilePicture.jpg' };

  s3.deleteObject(params, (err, data) => {
    if(err) return console.log(err);
  })

  UserModel.findByIdAndUpdate({_id: ObjectId(userId)}, {
    $unset: {
      profilePicture: ""
    }
  }, {useFindAndModify: false, returnDocument: 'after'}).then(result => {
    return res.json({user: result, message: 'User updated'})
  })
}

updateUserInfo = (req, res) => {
  const {name, lastname } = req.body;
  const userId = req.user._id;
  const username = name + " " + lastname;
  
  UserModel.findByIdAndUpdate({_id: ObjectId(userId)}, {
    $set: {
      name: name,
      lastname: lastname,
      username: username
    }
  }, {useFindAndModify: false, returnDocument: 'after'}).then(result => {
    return res.json({user: result, message: 'User updated'})
  }).catch(error => {
    console.log(error)
  })
}

getProfileImage = (req, res) => {
    const user = req.user.email;
    const imageKey = user + "/profilePicture.jpeg";
    isProfileImageFound = false;

    var params = { 
        Bucket: BUCKET_NAME, 
        Key: imageKey 
    };
    s3.getObject(params, function(err, data) {
      if(!err) {
        res.writeHead(200, {'Content-Type': 'image/jpeg'});
        res.write(data.Body, 'binary');
        res.end(null, 'binary');
        isProfileImageFound = true
      }       
    });

    if(!isProfileImageFound) {
      params = {
        Bucket: BUCKET_NAME,
        Key: user + '/defaultProfileImage.png'
      }
          s3.getObject(params, function(err, data) {
            if(err) return res.json('Error occured while fetching image')
            res.writeHead(200, {'Content-Type': 'image/jpeg'});
            res.write(data.Body, 'binary');
            res.end(null, 'binary');
            }       
        );
    }
}


deleteAccount = async (req, res) => {
  const userId = req.user._id;
  const email = req.user.email;

  try {
    // Find all annonces by this user
    const userAnnonces = await AnnonceModel.find({ sellerId: ObjectId(userId) });
    const annonceIds = userAnnonces.map(a => a._id);

    // Delete S3 images for each annonce
    for (const annonce of userAnnonces) {
      const awsPrefix = email + '/annonce-' + annonce._id + '/';
      try {
        const listed = await s3.listObjectsV2({ Bucket: BUCKET_NAME, Prefix: awsPrefix }).promise();
        if (listed.Contents.length > 0) {
          const deleteParams = {
            Bucket: BUCKET_NAME,
            Delete: { Objects: listed.Contents.map(f => ({ Key: f.Key })) }
          };
          await s3.deleteObjects(deleteParams).promise();
        }
      } catch (err) {
        // Continue even if S3 cleanup fails for one annonce
      }
    }

    // Delete all user's annonces
    await AnnonceModel.deleteMany({ sellerId: ObjectId(userId) });

    // Delete all conversations involving this user
    await ConversationModel.deleteMany({ $or: [{ buyer: ObjectId(userId) }, { seller: ObjectId(userId) }] });

    // Remove annonce IDs from other users' favorites
    if (annonceIds.length > 0) {
      await UserModel.updateMany({}, { $pull: { favorites: { $in: annonceIds } } });
    }

    // Delete profile picture from S3
    try {
      const profileBucket = BUCKET_NAME + '/' + email;
      await s3.deleteObject({ Bucket: profileBucket, Key: 'profilePicture.jpg' }).promise();
    } catch (err) {
      // Continue even if no profile picture exists
    }

    // Delete user document
    await UserModel.deleteOne({ _id: ObjectId(userId) });

    // Logout and destroy session
    req.logout(function (err) {
      if (err) {
        return res.status(500).json({ message: 'Kunne ikke logge ut' });
      }
      return res.status(200).json({ message: 'Account deleted' });
    });
  } catch (error) {
    return res.status(500).json({ error, message: 'Kunne ikke slette kontoen' });
  }
}

const router = express.Router();

router.post('/upload/picture', ensureAuth, uploadImageToAws);
router.post('/update/userinfo', ensureAuth, updateUserInfo);
router.post('/delete/picture', ensureAuth, removeProfileImage);
router.post('/delete/account', ensureAuth, deleteAccount);
router.get('/get/picture', ensureAuth, getProfileImage);

module.exports = router;