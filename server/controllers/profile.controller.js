const { S3Client, GetObjectCommand, DeleteObjectCommand, ListObjectsV2Command, DeleteObjectsCommand } = require('@aws-sdk/client-s3');
const multer = require('multer');
const multerS3 = require('multer-s3');
const ObjectId = require('mongoose').Types.ObjectId;

const UserModel = require('../models/UserModel.js');
const AnnonceModel = require('../models/AnnonceModel.js');
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

// Converts an S3 v3 response Body stream to a Buffer
const streamToBuffer = async (stream) => {
    const chunks = [];
    for await (const chunk of stream) {
        chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
    }
    return Buffer.concat(chunks);
};

const checkFileType = (req, file, cb) => {
    if (file.mimetype === 'image/jpeg' || file.mimetype === 'image/jpg' || file.mimetype === 'image/png') {
        cb(null, true);
    } else {
        cb('file type is wrong', false);
    }
};

// keyPrefix is the S3 folder path — bucket name is always kept separate (v3 requirement)
const uploadImageToMulter = (keyPrefix) => multer({
    storage: multerS3({
        s3,
        bucket: BUCKET_NAME,
        metadata: function (req, file, cb) {
            cb(null, { fieldName: file.fieldname });
        },
        key: function (req, file, cb) {
            // Always store as profilePicture.jpeg so get/delete always target the same key
            cb(null, keyPrefix + '/profilePicture.jpeg');
        },
    }),
    fileFilter: checkFileType
}).single('profileImage');

const uploadImageToAws = (req, res) => {
    const keyPrefix = getEnvFolder() + '/' + req.user.email;
    const userId = req.user._id;
    const uploadImages = uploadImageToMulter(keyPrefix);

    uploadImages(req, res, err => {
        if (err) {
            return res.json({ message: 'picture could not uploaded', error: err });
        }
        UserModel.findByIdAndUpdate({ _id: new ObjectId(userId) }, {
            profilePicture: req.file.location
        }, { useFindAndModify: false, returnDocument: 'after' }).then(result => {
            if (result) {
                res.json({ user: result, message: 'profile picture uploaded' });
            } else {
                res.json({ message: 'Picture could not uploaded' });
            }
        });
    });
};

const removeProfileImage = async (req, res) => {
    const userId = req.user._id;
    const imageKey = getEnvFolder() + '/' + req.user.email + '/profilePicture.jpeg';

    try {
        await s3.send(new DeleteObjectCommand({ Bucket: BUCKET_NAME, Key: imageKey }));
    } catch (err) {
        console.error(err);
    }

    try {
        const result = await UserModel.findByIdAndUpdate({ _id: new ObjectId(userId) }, {
            $unset: { profilePicture: '' }
        }, { useFindAndModify: false, returnDocument: 'after' });
        return res.json({ user: result, message: 'User updated' });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Error updating profile' });
    }
};

const updateUserInfo = async (req, res) => {
    const { name, lastname } = req.body;
    const userId = req.user._id;
    const username = name + ' ' + lastname;

    try {
        const result = await UserModel.findByIdAndUpdate({ _id: new ObjectId(userId) }, {
            $set: { name, lastname, username }
        }, { useFindAndModify: false, returnDocument: 'after' });
        return res.json({ user: result, message: 'User updated' });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Error updating user info' });
    }
};

const getProfileImage = async (req, res) => {
    const imageKey = getEnvFolder() + '/' + req.user.email + '/profilePicture.jpeg';

    try {
        const data = await s3.send(new GetObjectCommand({ Bucket: BUCKET_NAME, Key: imageKey }));
        const buffer = await streamToBuffer(data.Body);
        res.writeHead(200, { 'Content-Type': 'image/jpeg' });
        res.write(buffer, 'binary');
        res.end(null, 'binary');
    } catch (err) {
        // Profile image not found, try fallback
        try {
            const fallbackData = await s3.send(new GetObjectCommand({
                Bucket: BUCKET_NAME,
                Key: getEnvFolder() + '/' + req.user.email + '/defaultProfileImage.png'
            }));
            const buffer = await streamToBuffer(fallbackData.Body);
            res.writeHead(200, { 'Content-Type': 'image/png' });
            res.write(buffer, 'binary');
            res.end(null, 'binary');
        } catch (fallbackErr) {
            return res.status(404).json({ message: 'No profile image found' });
        }
    }
};

const deleteAccount = async (req, res) => {
    const userId = req.user._id;
    const email = req.user.email;

    try {
        const userAnnonces = await AnnonceModel.find({ sellerId: new ObjectId(userId) });
        const annonceIds = userAnnonces.map(a => a._id);

        // Delete S3 images for each annonce
        for (const annonce of userAnnonces) {
            const awsPrefix = getEnvFolder() + '/' + email + '/annonce-' + annonce._id + '/';
            try {
                const listed = await s3.send(new ListObjectsV2Command({ Bucket: BUCKET_NAME, Prefix: awsPrefix }));
                if (listed.Contents.length > 0) {
                    await s3.send(new DeleteObjectsCommand({
                        Bucket: BUCKET_NAME,
                        Delete: { Objects: listed.Contents.map(f => ({ Key: f.Key })) }
                    }));
                }
            } catch (err) {
                // Continue even if S3 cleanup fails for one annonce
            }
        }

        await AnnonceModel.deleteMany({ sellerId: new ObjectId(userId) });
        await ConversationModel.deleteMany({ $or: [{ buyer: new ObjectId(userId) }, { seller: new ObjectId(userId) }] });

        if (annonceIds.length > 0) {
            await UserModel.updateMany({}, { $pull: { favorites: { $in: annonceIds } } });
        }

        // Delete profile picture from S3
        try {
            const profileKey = getEnvFolder() + '/' + email + '/profilePicture.jpeg';
            await s3.send(new DeleteObjectCommand({ Bucket: BUCKET_NAME, Key: profileKey }));
        } catch (err) {
            // Continue even if no profile picture exists
        }

        await UserModel.deleteOne({ _id: new ObjectId(userId) });

        req.logout(function (err) {
            if (err) {
                return res.status(500).json({ message: 'Kunne ikke logge ut' });
            }
            return res.status(200).json({ message: 'Account deleted' });
        });
    } catch (error) {
        return res.status(500).json({ error, message: 'Kunne ikke slette kontoen' });
    }
};

module.exports = {
    uploadImageToAws,
    removeProfileImage,
    updateUserInfo,
    getProfileImage,
    deleteAccount
};
