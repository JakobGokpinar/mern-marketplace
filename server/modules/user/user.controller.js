const mongoose = require('mongoose');
const ObjectId = mongoose.Types.ObjectId;
const UserModel = require('../../models/UserModel');
const AnnonceModel = require('../../models/AnnonceModel');
const ConversationModel = require('../../models/ConversationModel');
const { getEnvFolder, deleteObjectsByPrefix, deleteObject, getObject, streamToBuffer } = require('../../services/s3');
const { createProfileUpload } = require('../../middleware/upload');
const logger = require('../../config/logger');

// --- Fetch / Find ---

const fetchUser = async (req, res) => {
    try {
        const response = await UserModel.findOne({ _id: new ObjectId(req.user.id) });
        return res.status(200).json({ user: response });
    } catch (error) {
        return res.status(500).json({ message: 'Error occured while fetching user' });
    }
};

const findUser = async (req, res) => {
    try {
        const response = await UserModel.findOne({ _id: new ObjectId(req.query.userId) });
        return res.status(200).json({ user: response });
    } catch (error) {
        logger.error(error);
        return res.status(500).json({ message: 'Error finding user' });
    }
};

const findSeller = async (req, res) => {
    try {
        const response = await UserModel.findOne({ _id: new ObjectId(req.query.sellerId) })
            .select('username profilePicture');
        return res.status(200).json({ seller: response });
    } catch (error) {
        logger.error(error);
        return res.status(500).json({ message: 'Error finding seller' });
    }
};

// --- Profile ---

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

// --- Favorites ---

const addToFavorites = async (req, res) => {
    const userId = req.user.id;
    const annonceId = req.body.id;

    try {
        const annonce = await AnnonceModel.findOne({ _id: new ObjectId(annonceId) });
        if (!annonce) {
            return res.json({ message: 'Annonce not found' });
        }
        if (annonce.sellerId.toString() === userId.toString()) {
            return res.json({ message: 'Du kan ikke favorisere din egen annonse' });
        }

        const user = await UserModel.findOne({ _id: new ObjectId(userId) });

        const alreadyFavorited = user.favorites.some(fav => fav.toString() === annonceId.toString());
        if (alreadyFavorited) {
            return res.json({ message: 'The annonce already saved to Favorites' });
        }

        const result = await UserModel.findByIdAndUpdate(
            { _id: userId },
            { $push: { favorites: annonce._id } },
            { new: true }
        );
        return res.status(200).json({ user: result, message: 'Annonce saved to Favorites' });
    } catch (error) {
        logger.error(error);
        return res.status(500).json({ message: 'Annonce could not be saved to Favorites' });
    }
};

const removeFromFavorites = async (req, res) => {
    const userId = req.user.id;
    const annonceId = req.body.id;
    if (!annonceId) {
        return res.json({ message: 'Please select a valid annonce' });
    }

    try {
        const result = await UserModel.findByIdAndUpdate(
            { _id: new ObjectId(userId) },
            { $pull: { favorites: new ObjectId(annonceId) } },
            { new: true }
        );
        return res.json({ user: result, message: 'Annonce removed from favorites' });
    } catch (error) {
        logger.error(error);
        return res.status(500).json({ message: 'Error removing favorite' });
    }
};

const getFavorites = async (req, res) => {
    const userId = req.user.id;

    try {
        const user = await UserModel.findOne({ _id: new ObjectId(userId) });
        const favoritesArray = user.favorites;
        if (!favoritesArray || favoritesArray.length <= 0) {
            return res.json({ productArray: [] });
        }

        const productArray = await AnnonceModel.find({ _id: { $in: favoritesArray } }).lean();
        for (const item of productArray) {
            item.isFavorite = true;
        }
        return res.json({ productArray, message: 'Items fetched' });
    } catch (error) {
        logger.error(error);
        return res.status(500).json({ message: 'Error occurred while fetching favorites' });
    }
};

module.exports = {
    fetchUser, findUser, findSeller,
    uploadImageToAws, removeProfileImage, updateUserInfo, getProfileImage, deleteAccount,
    addToFavorites, removeFromFavorites, getFavorites,
};
