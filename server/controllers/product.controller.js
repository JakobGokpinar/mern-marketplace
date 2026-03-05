const mongoose = require('mongoose');
const ObjectId = mongoose.Types.ObjectId;
const UserModel = require('../models/UserModel');
const AnnonceModel = require('../models/AnnonceModel');

const findProduct = async (req, res) => {
    const productId = req.query.id;
    let favoritesArray = [];

    if (req.isAuthenticated()) {
        try {
            const user = await UserModel.findOne({ _id: new ObjectId(req.user._id) });
            favoritesArray = user.favorites;
        } catch (error) {
            console.error(error);
        }
    }

    try {
        const result = await AnnonceModel.findOne({ _id: new ObjectId(productId) }).lean();
        const seller = await UserModel.findOne({ _id: new ObjectId(result.sellerId) })
            .select('username profilePicture lastActiveAt userCreatedAt')
            .lean();

        const isFavorite = favoritesArray.some(favId => favId.toString() === result._id.toString());
        if (isFavorite) result['isFavorite'] = true;

        return res.status(200).json({ product: result, seller, message: 'Product is found' });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Error occured while getting the annonce' });
    }
}

module.exports = { findProduct };