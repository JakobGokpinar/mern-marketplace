const mongoose = require('mongoose');
const ObjectId = mongoose.Types.ObjectId;
const AnnonceModel = require('../models/AnnonceModel.js');
const UserModel = require('../models/UserModel.js');
const logger = require('../config/logger');

const DEFAULT_LIMIT = 20;

function parsePagination(query) {
    const page = Math.max(1, parseInt(query.page) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(query.limit) || DEFAULT_LIMIT));
    return { page, limit, skip: (page - 1) * limit };
}

async function getFavoritesArray(req) {
    if (!req.isAuthenticated()) return [];
    try {
        const user = await UserModel.findOne({ _id: new ObjectId(req.user._id) }).select('favorites');
        return user?.favorites || [];
    } catch (error) {
        logger.error(error);
        return [];
    }
}

function markFavorites(items, favoritesArray) {
    if (favoritesArray.length === 0) return items;
    return items.map(item => {
        if (favoritesArray.some(fav => fav.toString() === item._id.toString())) {
            item.isFavorite = true;
        }
        return item;
    });
}

// --- Browse all items ---
const getItems = async (req, res) => {
    try {
        const { page, limit, skip } = parsePagination(req.query);
        const favoritesArray = await getFavoritesArray(req);

        const [productArray, totalCount] = await Promise.all([
            AnnonceModel.find().sort({ date: -1 }).skip(skip).limit(limit).lean(),
            AnnonceModel.countDocuments(),
        ]);

        return res.json({
            productArray: markFavorites(productArray, favoritesArray),
            totalCount,
            page,
            totalPages: Math.ceil(totalCount / limit),
        });
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

    for (const param in queryParams) {
        if (param === 'q') Object.assign(queryObject, getTitle(queryParams[param]));
    }

    Object.assign(queryObject, getMainCategory(queryParams['category']));
    Object.assign(queryObject, getSubCategory(queryParams['subcategory']));
    Object.assign(queryObject, getPrice(queryParams['min_price'], queryParams['max_price']));
    Object.assign(queryObject, getDate(queryParams['date']));
    Object.assign(queryObject, getStatus(queryParams['status']));
    Object.assign(queryObject, getLocation(queryParams['kommune']));

    const { page, limit, skip } = parsePagination(req.body);
    const favoritesArray = await getFavoritesArray(req);

    try {
        const [result, totalCount] = await Promise.all([
            AnnonceModel.find(queryObject).sort({ date: -1 }).skip(skip).limit(limit).lean(),
            AnnonceModel.countDocuments(queryObject),
        ]);

        const catArr = [];
        const subArr = [];
        result.forEach((item) => {
            if (catArr.indexOf(item.category) === -1) catArr.push(item.category);
            if (subArr.indexOf(item.subCategory) === -1) subArr.push(item.subCategory);
        });

        res.status(200).json({
            productArray: markFavorites(result, favoritesArray),
            categories: catArr,
            subCategories: subArr,
            totalCount,
            page,
            totalPages: Math.ceil(totalCount / limit),
        });
    } catch (err) {
        logger.error(err);
        res.status(500).json({ message: 'Error occurred while searching products' });
    }
};

module.exports = { getItems, getUserAnnonces, findProducts };
