const { S3Client, ListObjectsV2Command, DeleteObjectsCommand } = require('@aws-sdk/client-s3');
const multer = require('multer');
const multerS3 = require('multer-s3');
const crypto = require('crypto');
const ObjectId = require('mongoose').Types.ObjectId;

const AnnonceModel = require('../models/AnnonceModel.js');
const UserModel = require('../models/UserModel.js');
const ConversationModel = require('../models/ConversationModel.js');

const BUCKET_NAME = process.env.AWS_BUCKET_NAME;
const getEnvFolder = () => process.env.NODE_ENV === 'production' ? 'prod' : 'dev';

const s3 = new S3Client({
    credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    },
    region: process.env.AWS_BUCKET_REGION,
});

const checkFileType = (req, file, cb) => {
    if (file.mimetype === 'image/jpeg' || file.mimetype === 'image/jpg' || file.mimetype === 'image/png') {
        cb(null, true);
    } else {
        cb('file type is wrong', false);
    }
};

// keyPrefix is the S3 folder path — bucket name is always kept separate (v3 requirement)
const uploadImagesToMulter = (keyPrefix) => multer({
    storage: multerS3({
        s3,
        bucket: BUCKET_NAME,
        metadata: function (req, file, cb) {
            cb(null, { fieldName: file.fieldname });
        },
        key: function (req, file, cb) {
            // Prefix with random bytes to prevent same-name files overwriting each other
            cb(null, keyPrefix + '/' + crypto.randomBytes(8).toString('hex') + '-' + file.originalname);
        },
    }),
    fileFilter: checkFileType
}).array('annonceImages', 10);

const uploadImagesToAws = (req, res) => {
    if (!req.isAuthenticated()) return res.status(401).json({ message: 'You have to login to upload files' });
    const user = req.user.email;

    let annonceId = req.query.annonceid || crypto.randomBytes(12).toString('hex');
    const keyPrefix = getEnvFolder() + '/' + user + '/annonce-' + annonceId;
    const uploadImages = uploadImagesToMulter(keyPrefix);

    uploadImages(req, res, err => {
        if (err) {
            return res.json({ message: 'files could not uploaded', error: err });
        }
        res.status(200).json({ files: req.files, message: 'images uploaded', annonceId });
    });
};

const saveAnnonceToDatabase = (req, res) => {
    if (!req.isAuthenticated()) return res.status(401).json({ message: 'Not authenticated' });

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

    const awsPrefix = getEnvFolder() + '/' + email + '/annonce-' + annonceId + '/';

    try {
        const listed = await s3.send(new ListObjectsV2Command({ Bucket: BUCKET_NAME, Prefix: awsPrefix }));
        if (listed.Contents.length > 0) {
            await s3.send(new DeleteObjectsCommand({
                Bucket: BUCKET_NAME,
                Delete: { Objects: listed.Contents.map(file => ({ Key: file.Key })) }
            }));
        }

        await AnnonceModel.deleteOne({ _id: new ObjectId(annonceId) });
        await UserModel.updateMany({}, { $pull: { favorites: new ObjectId(annonceId) } });
        await ConversationModel.deleteMany({ productId: new ObjectId(annonceId) });
        return res.status(200).json({ message: 'Annonce deleted from database' });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ error, message: 'Error occured' });
    }
};

const removeAnnonceImagesFromAWS = async (req, res) => {
    if (!req.isAuthenticated()) return res.status(401).json({ message: 'Not authenticated' });

    try {
        const userEmail = req.user.email;
        const annonceId = req.body.annonceId;
        const awsPrefix = getEnvFolder() + '/' + userEmail + '/annonce-' + annonceId + '/';

        const listed = await s3.send(new ListObjectsV2Command({ Bucket: BUCKET_NAME, Prefix: awsPrefix }));
        if (listed.Contents.length > 0) {
            await s3.send(new DeleteObjectsCommand({
                Bucket: BUCKET_NAME,
                Delete: { Objects: listed.Contents.map(file => ({ Key: file.Key })) }
            }));
        }
        return res.status(200).json({ message: 'annonce images deleted successfully' });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ error, message: 'Error occurred while deleting s3 objects' });
    }
};

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
