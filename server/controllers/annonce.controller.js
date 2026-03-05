const crypto = require('crypto');
const ObjectId = require('mongoose').Types.ObjectId;

const AnnonceModel = require('../models/AnnonceModel.js');
const UserModel = require('../models/UserModel.js');
const ConversationModel = require('../models/ConversationModel.js');
const { getEnvFolder, deleteObjectsByPrefix } = require('../services/s3');
const { createAnnonceUpload } = require('../middleware/upload');
const logger = require('../config/logger');

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

module.exports = {
    uploadImagesToAws,
    saveAnnonceToDatabase,
    removeAnnonce,
    removeAnnonceImagesFromAWS,
    updateAnnonce
};
