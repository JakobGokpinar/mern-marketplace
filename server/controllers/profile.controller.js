const AWS = require('aws-sdk');
const multer = require('multer');
const multerS3 = require('multer-s3');
const ObjectId = require('mongoose').Types.ObjectId;

const UserModel = require('../models/UserModel.js');
const AnnonceModel = require('../models/AnnonceModel.js');
const ConversationModel = require('../models/ConversationModel.js');

const BUCKET_NAME = process.env.AWS_BUCKET_NAME;

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

const uploadImageToMulter = (bucketName) => multer({
    storage: multerS3({
        s3: s3,
        bucket: bucketName,
        metadata: function (req, file, cb) {
            cb(null, { fieldName: file.fieldname });
        },
        key: function (req, file, cb) {
            cb(null, file.originalname);
        },
    }),
    fileFilter: checkFileType
}).single('profileImage');

const uploadImageToAws = (req, res) => {
    const fileLocation = req.user.email;
    const userId = req.user._id;
    const uploadImages = uploadImageToMulter(`${BUCKET_NAME}/${fileLocation}`);

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
    const user = req.user.email;
    const bucket = BUCKET_NAME + '/' + user;
    const params = { Bucket: bucket, Key: 'profilePicture.jpg' };

    try {
        await s3.deleteObject(params).promise();
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

// FIX: Original checked isProfileImageFound synchronously after async s3.getObject callback.
// The flag was always false when checked, so both requests fired → "headers already sent" crash.
// Now uses promise-based flow with proper fallback chain.
const getProfileImage = async (req, res) => {
    const user = req.user.email;
    const imageKey = user + '/profilePicture.jpeg';

    try {
        const data = await s3.getObject({ Bucket: BUCKET_NAME, Key: imageKey }).promise();
        res.writeHead(200, { 'Content-Type': 'image/jpeg' });
        res.write(data.Body, 'binary');
        res.end(null, 'binary');
    } catch (err) {
        // Profile image not found, try fallback
        try {
            const fallbackData = await s3.getObject({
                Bucket: BUCKET_NAME,
                Key: user + '/defaultProfileImage.png'
            }).promise();
            res.writeHead(200, { 'Content-Type': 'image/png' });
            res.write(fallbackData.Body, 'binary');
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

        await AnnonceModel.deleteMany({ sellerId: new ObjectId(userId) });
        await ConversationModel.deleteMany({ $or: [{ buyer: new ObjectId(userId) }, { seller: new ObjectId(userId) }] });

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
