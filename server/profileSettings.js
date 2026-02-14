const express = require('express');
const AWS = require('aws-sdk');
const multer = require('multer');   //dosya yükleme işlemi için kullanılır
const multerS3 = require('multer-s3');
const UserModel = require("./models/UserModel.js");
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

uploadImageToAws = (req, res, info) => {
    if (!req.isAuthenticated()) return res.json({message: 'You have to login to upload files'});
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
  if(!req.isAuthenticated()) return res.json({message: 'Please login to save your updates'});

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
    if(!req.isAuthenticated()) return res.json('Please login to access this data.');
    
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


const router = express.Router();

router.post('/upload/picture', uploadImageToAws);
router.post('/update/userinfo', updateUserInfo)
router.post('/delete/picture', removeProfileImage)
router.get('/get/picture', getProfileImage);

module.exports = router;