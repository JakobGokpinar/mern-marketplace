const AWS = require('aws-sdk');
const multer = require('multer');
const multerS3 = require('multer-s3');
const crypto = require('crypto');
const ObjectId = require('mongoose').Types.ObjectId;

const AnnonceModel = require('../models/AnnonceModel.js');
const UserModel = require('../models/UserModel.js');
const ConversationModel = require('../models/ConversationModel.js');

const BUCKET_NAME = process.env.AWS_BUCKET_NAME;
const getEnvFolder = () => process.env.NODE_ENV === 'production' ? 'prod' : 'dev';

const s3 = new AWS.S3({
    accessKeyId: process.env.AWS_ACCESS_KEY,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    region: process.env.AWS_BUCKET_REGION,
});

const checkFileType = (req, file, cb) => {
    if (file.mimetype === 'image/jpeg' || file.mimetype === 'image/jpg' || file.mimetype === 'image/png') {
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
            // Prefix with random bytes to prevent same-name files overwriting each other
            cb(null, crypto.randomBytes(8).toString('hex') + '-' + file.originalname);
        },
    }),
    fileFilter: checkFileType
}).array('annonceImages', 10);

const uploadImagesToAws = (req, res) => {
    if (!req.isAuthenticated()) return res.json({ message: 'You have to login to upload files' });
    const user = req.user.email;

    let annonceId = req.query.annonceid || crypto.randomBytes(12).toString('hex');
    const fileLocation = getEnvFolder() + '/' + user + '/annonce-' + annonceId;
    const uploadImages = uploadImagesToMulter(`${BUCKET_NAME}/${fileLocation}`);

    uploadImages(req, res, err => {
        if (err) {
            return res.json({ message: 'files could not uploaded', error: err });
        }
        res.status(200).json({ files: req.files, message: 'images uploaded', annonceId });
    });
};

const saveAnnonceToDatabase = (req, res) => {
    if (!req.isAuthenticated()) return res.send('user not logged in');

    const user = req.user;
    const annonceProps = req.body.annonceproperties;
    const annonceImages = req.body.imagelocations;
    const annonceId = req.body.annonceid;

    const newAnnonce = AnnonceModel(annonceProps);
    newAnnonce._id = new ObjectId(annonceId);
    newAnnonce.annonceImages = annonceImages;
    newAnnonce.sellerId = new ObjectId(user._id);

    newAnnonce.save()
        .then(() => res.json({ message: 'annonce created' }))
        .catch(error => res.json(error));
};

const removeAnnonce = async (req, res) => {
    if (!req.isAuthenticated()) return res.status(401).json({ message: 'Not authenticated' });

    const email = req.user.email;
    const annonceId = req.body.annonceid;

    // Verify ownership before deleting
    const annonce = await AnnonceModel.findById(new ObjectId(annonceId));
    if (!annonce) return res.status(404).json({ message: 'Annonce not found' });
    if (annonce.sellerId.toString() !== req.user._id.toString()) {
        return res.status(403).json({ message: 'Forbidden' });
    }

    const awsKey = getEnvFolder() + '/' + email + '/annonce-' + annonceId + '/';

    const params = { Bucket: BUCKET_NAME, Prefix: awsKey };

    s3.listObjectsV2(params, async (err, data) => {
        if (err) {
            console.error(err);
            return res.json({ error: err, message: 'Error occured' });
        }

        const files = data.Contents;
        if (files.length === 0) {
            return res.status(200).json({ message: 'File already been deleted' });
        }

        const deleteParams = {
            Bucket: BUCKET_NAME,
            Delete: { Objects: files.map(file => ({ Key: file.Key })) }
        };

        s3.deleteObjects(deleteParams, async (err) => {
            if (err) {
                console.error(err);
                return res.json({ error: err, message: 'Error occured while deleting objects' });
            }

            try {
                await AnnonceModel.deleteOne({ _id: new ObjectId(annonceId) });
                await UserModel.updateMany({}, { $pull: { favorites: new ObjectId(annonceId) } });
                await ConversationModel.deleteMany({ productId: new ObjectId(annonceId) });
                return res.status(200).json({ message: 'Annonce deleted from database' });
            } catch (error) {
                console.error(error);
                return res.json({ error, message: 'Error occured' });
            }
        });
    });
};

// FIX: Changed status 300 → 500 (300 is "Multiple Choices" redirect, not an error code)
const removeAnnonceImagesFromAWS = async (req, res) => {
    if (!req.isAuthenticated()) return res.status(401).json({ message: 'Not authenticated' });

    try {
        const userEmail = req.user.email;
        const annonceId = req.body.annonceId;
        const awsPrefix = getEnvFolder() + '/' + userEmail + '/annonce-' + annonceId + '/';

        const response = await s3.listObjectsV2({ Bucket: BUCKET_NAME, Prefix: awsPrefix }).promise();
        const bucketFiles = response.Contents;
        const deleteParams = {
            Bucket: BUCKET_NAME,
            Delete: { Objects: bucketFiles.map(file => ({ Key: file.Key })) }
        };

        await s3.deleteObjects(deleteParams).promise();
        return res.status(200).json({ message: 'annonce images deleted successfully' });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ error, message: 'Error occurred while deleting s3 objects' });
    }
};

// FIX: Changed status 300 → 500
const updateAnnonce = async (req, res) => {
    if (!req.isAuthenticated()) return res.status(401).json({ message: 'Not authenticated' });

    const userId = req.user.id;
    const annonceId = req.body.annonceId;
    const annonceImages = req.body.annonceImages;
    const annonceProperties = req.body.annonceproperties;

    try {
        // Verify ownership before updating
        const existing = await AnnonceModel.findById(new ObjectId(annonceId));
        if (!existing) return res.status(404).json({ message: 'Annonce not found' });
        if (existing.sellerId.toString() !== userId.toString()) {
            return res.status(403).json({ message: 'Forbidden' });
        }

        const newAnnonce = AnnonceModel(annonceProperties);
        newAnnonce._id = new ObjectId(annonceId);
        newAnnonce.annonceImages = annonceImages;
        newAnnonce.sellerId = new ObjectId(userId);

        await AnnonceModel.replaceOne({ _id: new ObjectId(annonceId) }, newAnnonce);
        return res.status(200).json({ message: 'mission successful' });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ error, message: 'Error occurred while updating annonce' });
    }
};

module.exports = {
    uploadImagesToAws,
    saveAnnonceToDatabase,
    removeAnnonce,
    removeAnnonceImagesFromAWS,
    updateAnnonce
};
