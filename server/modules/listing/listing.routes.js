const express = require('express');
const router = express.Router();
const listingController = require('./listing.controller');
const ensureAuth = require('../../middleware/ensureAuth');
const validate = require('../../middleware/validate');
const { findProductQuery, uploadImagesQuery, saveAnnonce, removeAnnonce, removeImages, updateAnnonce } = require('./listing.schema');

// CRUD
router.post('/newannonce/imageupload', ensureAuth, validate(uploadImagesQuery, 'query'), listingController.uploadImagesToAws);
router.post('/newannonce/create', ensureAuth, validate(saveAnnonce), listingController.saveAnnonceToDatabase);
router.post('/newannonce/remove/annonceimages', ensureAuth, validate(removeImages), listingController.removeAnnonceImagesFromAWS);
router.post('/newannonce/update', ensureAuth, validate(updateAnnonce), listingController.updateAnnonce);
router.post('/newannonce/delete', ensureAuth, validate(removeAnnonce), listingController.removeAnnonce);

// Read
router.get('/product', validate(findProductQuery, 'query'), listingController.findProduct);

// Search / browse
router.get('/search', listingController.getItems);
router.get('/search/mine', ensureAuth, listingController.getUserAnnonces);
router.post('/search', listingController.findProducts);

module.exports = router;
