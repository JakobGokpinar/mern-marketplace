const ObjectId = require('mongoose').Types.ObjectId;

const UserModel = require('../models/UserModel.js');
const AnnonceModel = require('../models/AnnonceModel.js');
const ConversationModel = require('../models/ConversationModel.js');
const { getEnvFolder, deleteObjectsByPrefix, deleteObject, getObject, streamToBuffer } = require('../services/s3');
const { createProfileUpload } = require('../middleware/upload');
const logger = require('../config/logger');

const uploadImageToAws = (req, res) => {
    const keyPrefix = getEnvFolder() + '/' + req.user.email;
    const userId = req.user._id;
    const upload = createProfileUpload(keyPrefix);

    upload(req, res, async (err) => {
        if (err) {
            return res.status(400).json({ message: 'Kunne ikke laste opp bildet' });
        }
        try {
            const result = await UserModel.findByIdAndUpdate(
                { _id: new ObjectId(userId) },
                { profilePicture: req.file.location },
                { new: true }
            );
            res.json({ user: result, message: 'profile picture uploaded' });
        } catch (error) {
            logger.error(error);
            res.status(500).json({ message: 'Could not update profile picture' });
        }
    });
};

const removeProfileImage = async (req, res) => {
    const userId = req.user._id;
    const imageKey = getEnvFolder() + '/' + req.user.email + '/profilePicture.jpeg';

    try {
        await deleteObject(imageKey);
    } catch (err) {
        logger.error(err);
    }

    try {
        const result = await UserModel.findByIdAndUpdate({ _id: new ObjectId(userId) }, {
            $unset: { profilePicture: '' }
        }, { new: true });
        return res.json({ user: result, message: 'User updated' });
    } catch (error) {
        logger.error(error);
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
        }, { new: true });
        return res.json({ user: result, message: 'User updated' });
    } catch (error) {
        logger.error(error);
        return res.status(500).json({ message: 'Error updating user info' });
    }
};

const getProfileImage = async (req, res) => {
    const imageKey = getEnvFolder() + '/' + req.user.email + '/profilePicture.jpeg';

    try {
        const data = await getObject(imageKey);
        const buffer = await streamToBuffer(data.Body);
        res.writeHead(200, { 'Content-Type': 'image/jpeg' });
        res.write(buffer, 'binary');
        res.end(null, 'binary');
    } catch (err) {
        try {
            const fallbackData = await getObject(
                getEnvFolder() + '/' + req.user.email + '/defaultProfileImage.png'
            );
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

        for (const annonce of userAnnonces) {
            try {
                await deleteObjectsByPrefix(getEnvFolder() + '/' + email + '/annonce-' + annonce._id + '/');
            } catch (err) {
                // Continue even if S3 cleanup fails for one annonce
            }
        }

        await AnnonceModel.deleteMany({ sellerId: new ObjectId(userId) });
        await ConversationModel.deleteMany({ $or: [{ buyer: new ObjectId(userId) }, { seller: new ObjectId(userId) }] });

        if (annonceIds.length > 0) {
            await UserModel.updateMany({}, { $pull: { favorites: { $in: annonceIds } } });
        }

        try {
            await deleteObject(getEnvFolder() + '/' + email + '/profilePicture.jpeg');
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
        logger.error(error);
        return res.status(500).json({ message: 'Kunne ikke slette kontoen' });
    }
};

module.exports = {
    uploadImageToAws,
    removeProfileImage,
    updateUserInfo,
    getProfileImage,
    deleteAccount
};
