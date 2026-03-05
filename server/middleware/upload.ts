import multer from 'multer';
import multerS3 from 'multer-s3';
import crypto from 'crypto';
import path from 'path';
import { s3, BUCKET_NAME } from '../services/s3';

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5 MB per file

const ALLOWED_MIMES = ['image/jpeg', 'image/jpg', 'image/png'];

const sanitizeFilename = (original: string) => {
  const ext = path.extname(original).toLowerCase();
  return crypto.randomBytes(12).toString('hex') + ext;
};

const fileFilter = (_req: any, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  if (ALLOWED_MIMES.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Bare JPEG og PNG er tillatt'));
  }
};

const createListingUpload = (keyPrefix: string) => multer({
  storage: multerS3({
    s3: s3 as any,
    bucket: BUCKET_NAME,
    metadata: (_req: any, file: any, cb: any) => cb(null, { fieldName: file.fieldname }),
    key: (_req: any, file: any, cb: any) => cb(null, keyPrefix + '/' + sanitizeFilename(file.originalname)),
  }),
  fileFilter,
  limits: { fileSize: MAX_FILE_SIZE },
}).array('listingImages', 10);

const createProfileUpload = (keyPrefix: string) => multer({
  storage: multerS3({
    s3: s3 as any,
    bucket: BUCKET_NAME,
    metadata: (_req: any, file: any, cb: any) => cb(null, { fieldName: file.fieldname }),
    key: (_req: any, _file: any, cb: any) => cb(null, keyPrefix + '/profilePicture.jpeg'),
  }),
  fileFilter,
  limits: { fileSize: MAX_FILE_SIZE },
}).single('profileImage');

export { createListingUpload, createProfileUpload, sanitizeFilename };
