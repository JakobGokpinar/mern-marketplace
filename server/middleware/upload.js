const multer = require('multer');
const multerS3 = require('multer-s3');
const crypto = require('crypto');
const path = require('path');
const { s3, BUCKET_NAME } = require('../services/s3');

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5 MB per file

const ALLOWED_MIMES = ['image/jpeg', 'image/jpg', 'image/png'];

const sanitizeFilename = (original) => {
  const ext = path.extname(original).toLowerCase();
  return crypto.randomBytes(12).toString('hex') + ext;
};

const fileFilter = (req, file, cb) => {
  if (ALLOWED_MIMES.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Bare JPEG og PNG er tillatt'), false);
  }
};

const createAnnonceUpload = (keyPrefix) => multer({
  storage: multerS3({
    s3,
    bucket: BUCKET_NAME,
    metadata: (req, file, cb) => cb(null, { fieldName: file.fieldname }),
    key: (req, file, cb) => cb(null, keyPrefix + '/' + sanitizeFilename(file.originalname)),
  }),
  fileFilter,
  limits: { fileSize: MAX_FILE_SIZE },
}).array('annonceImages', 10);

const createProfileUpload = (keyPrefix) => multer({
  storage: multerS3({
    s3,
    bucket: BUCKET_NAME,
    metadata: (req, file, cb) => cb(null, { fieldName: file.fieldname }),
    key: (req, file, cb) => cb(null, keyPrefix + '/profilePicture.jpeg'),
  }),
  fileFilter,
  limits: { fileSize: MAX_FILE_SIZE },
}).single('profileImage');

module.exports = { createAnnonceUpload, createProfileUpload, sanitizeFilename };
