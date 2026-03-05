const crypto = require('crypto');
const mongoose = require('mongoose');
const ObjectId = mongoose.Types.ObjectId;
const AnnonceModel = require('../../models/AnnonceModel');
const UserModel = require('../../models/UserModel');
const ConversationModel = require('../../models/ConversationModel');
const { getEnvFolder, deleteObjectsByPrefix } = require('../../services/s3');
const { createAnnonceUpload } = require('../../middleware/upload');
const logger = require('../../config/logger');

const DEFAULT_LIMIT = 20;

// --- Helpers ---

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

// --- CRUD ---

const uploadImagesToAws = (req, res) => {
    const user = req.user.email;

    let annonceId = req.query.annonceid || crypto.randomBytes(12).toString('hex');
    const keyPrefix = getEnvFolder() + '/' + user + '/annonce-' + annonceId;
    const upload = createAnnonceUpload(keyPrefix);

    upload(req, res, err => {
        if (err) {
            return res.status(400).json({ message: 'Kunne ikke laste opp bilder' });
        }
        res.status(200).json({ files: req.files, message: 'images uploaded', annonceId });
    });
};

const saveAnnonceToDatabase = (req, res) => {
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
        .catch(() => res.status(500).json({ message: 'Could not save annonce' }));
};

const removeAnnonce = async (req, res) => {
    const email = req.user.email;
    const annonceId = req.body.annonceid;

    const annonce = await AnnonceModel.findById(new ObjectId(annonceId));
    if (!annonce) return res.status(404).json({ message: 'Annonce not found' });
    if (annonce.sellerId.toString() !== req.user._id.toString()) {
        return res.status(403).json({ message: 'Forbidden' });
    }

    try {
        await deleteObjectsByPrefix(getEnvFolder() + '/' + email + '/annonce-' + annonceId + '/');
        await AnnonceModel.deleteOne({ _id: new ObjectId(annonceId) });
        await UserModel.updateMany({}, { $pull: { favorites: new ObjectId(annonceId) } });
        await ConversationModel.deleteMany({ productId: new ObjectId(annonceId) });
        return res.status(200).json({ message: 'Annonce deleted from database' });
    } catch (error) {
        logger.error(error);
        return res.status(500).json({ message: 'Error occured while deleting annonce' });
    }
};

const removeAnnonceImagesFromAWS = async (req, res) => {
    try {
        const userEmail = req.user.email;
        const annonceId = req.body.annonceId;
        await deleteObjectsByPrefix(getEnvFolder() + '/' + userEmail + '/annonce-' + annonceId + '/');
        return res.status(200).json({ message: 'annonce images deleted successfully' });
    } catch (error) {
        logger.error(error);
        return res.status(500).json({ message: 'Error occurred while deleting s3 objects' });
    }
};

const updateAnnonce = async (req, res) => {
    const userId = req.user.id;
    const annonceId = req.body.annonceId;
    const annonceImages = req.body.annonceImages;
    const annonceProperties = req.body.annonceproperties;

    try {
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
        logger.error(error);
        return res.status(500).json({ message: 'Error occurred while updating annonce' });
    }
};

// --- Read / Search ---

const findProduct = async (req, res) => {
    const productId = req.query.id;
    let favoritesArray = [];

    if (req.isAuthenticated()) {
        try {
            const user = await UserModel.findOne({ _id: new ObjectId(req.user._id) });
            favoritesArray = user.favorites;
        } catch (error) {
            logger.error(error);
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
        logger.error(error);
        return res.status(500).json({ message: 'Error occured while getting the annonce' });
    }
};

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

module.exports = {
    uploadImagesToAws, saveAnnonceToDatabase, removeAnnonce, removeAnnonceImagesFromAWS, updateAnnonce,
    findProduct, getItems, getUserAnnonces, findProducts,
};
