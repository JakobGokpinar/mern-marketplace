const mongoose = require('mongoose');
const ObjectId = mongoose.Types.ObjectId;
const AnnonceModel = require('../models/AnnonceModel.js');
const UserModel = require('../models/UserModel.js');
const logger = require('../config/logger');

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

        // FIX: Original used .includes(annonceId) which compared string to ObjectId via ===.
        // Never matched, so duplicate favorites could be added endlessly.
        const alreadyFavorited = user.favorites.some(fav => fav.toString() === annonceId.toString());
        if (alreadyFavorited) {
            return res.json({ message: 'The annonce already saved to Favorites' });
        }

        // FIX: Original queried AnnonceModel.findOne a second time here for the same ID. Removed.
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

module.exports = { addToFavorites, removeFromFavorites, getFavorites };
