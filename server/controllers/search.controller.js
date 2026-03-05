const mongoose = require('mongoose');
const ObjectId = mongoose.Types.ObjectId;
const AnnonceModel = require('../models/AnnonceModel.js');
const UserModel = require('../models/UserModel.js');
const logger = require('../config/logger');

// --- Browse all items ---
// FIX: Original had race condition — UserModel.findOne was fire-and-forget (.then without await),
// so favoritesArray was always empty when AnnonceModel.find resolved.
const getItems = async (req, res) => {
    try {
        let favoritesArray = [];
        if (req.isAuthenticated()) {
            const user = await UserModel.findOne({ _id: new ObjectId(req.user._id) });
            if (user && user.favorites) {
                favoritesArray = user.favorites;
            }
        }

        const result = await AnnonceModel.find().lean();

        if (favoritesArray.length <= 0) {
            return res.json({ productArray: result });
        }

        const productArray = result.map((item) => {
            const isFav = favoritesArray.some(fav => fav.toString() === item._id.toString());
            if (isFav) item['isFavorite'] = true;
            return item;
        });

        return res.json({ productArray, message: 'Items found' });
    } catch (error) {
        logger.error(error);
        return res.status(500).json({ message: 'Error occurred while fetching annonces' });
    }
};

// --- Get current user's annonces ---
const getUserAnnonces = async (req, res) => {
    try {
        const userId = req.user._id;
        const result = await AnnonceModel.find({ sellerId: new ObjectId(userId) });
        return res.status(200).json({ productArray: result });
    } catch (err) {
        return res.status(500).json({ message: 'Could not fetch annonces' });
    }
};

// --- Search/filter helpers ---
function escapeRegex(str) {
    return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}
function getTitle(value) {
    return { title: { $regex: escapeRegex(value), $options: 'i' } };
}
function getLocation(kommuneArr) {
    if (!kommuneArr) return;
    return { kommune: { $in: kommuneArr } };
}
function getMainCategory(value) {
    if (!value) return;
    return { category: value };
}
function getSubCategory(value) {
    if (!value) return;
    return { subCategory: value };
}
function getPrice(min, max) {
    if (!min && !max) return;
    if (!min) return { price: { $lte: parseInt(max) } };
    if (!max) return { price: { $gte: parseInt(min) } };
    return { price: { $gte: parseInt(min), $lte: parseInt(max) } };
}
function getDate(value) {
    if (!value) return;
    const currentDate = new Date();
    let time = 0;
    if (value === 'today') time = 1;
    else if (value === 'this week') time = 7;
    else if (value === 'this month') time = 30;
    currentDate.setDate(currentDate.getDate() - time);
    return { date: { $gte: currentDate } };
}
function getStatus(value) {
    if (!value) return;
    value = value.toString().toLowerCase();
    value = value.charAt(0).toUpperCase() + value.slice(1);
    return { status: value };
}

// --- Search/filter products ---
const findProducts = async (req, res) => {
    const queryObject = {};
    const queryParams = req.body;
    const userId = req.user ? req.user.id : null;

    for (const param in queryParams) {
        if (param === 'q') Object.assign(queryObject, getTitle(queryParams[param]));
    }

    Object.assign(queryObject, getMainCategory(queryParams['category']));
    Object.assign(queryObject, getSubCategory(queryParams['subcategory']));
    Object.assign(queryObject, getPrice(queryParams['min_price'], queryParams['max_price']));
    Object.assign(queryObject, getDate(queryParams['date']));
    Object.assign(queryObject, getStatus(queryParams['status']));
    Object.assign(queryObject, getLocation(queryParams['kommune']));

    let favoriteProducts = [];

    if (userId) {
        try {
            const result = await UserModel.findOne({ _id: new ObjectId(userId) });
            if (result && result.favorites) {
                favoriteProducts = result.favorites;
            }
        } catch (error) {
            logger.error(error);
        }
    }

    try {
        const result = await AnnonceModel.find(queryObject).lean();

        const catArr = [];
        const subArr = [];
        result.forEach((item) => {
            if (catArr.indexOf(item.category) === -1) catArr.push(item.category);
            if (subArr.indexOf(item.subCategory) === -1) subArr.push(item.subCategory);
        });

        const productArray = result.map((item) => {
            const isFav = favoriteProducts.some(fav => fav.toString() === item._id.toString());
            if (isFav) item['isFavorite'] = true;
            return item;
        });

        res.status(200).json({
            productArray,
            categories: catArr,
            subCategories: subArr,
            message: 'Products successfully found',
        });
    } catch (err) {
        logger.error(err);
        res.status(500).json({
            message: 'Error occurred while searching products',
        });
    }
};

module.exports = { getItems, getUserAnnonces, findProducts };
