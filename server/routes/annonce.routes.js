const express = require('express');
const router = express.Router();
const annonceController = require('../controllers/annonce.controller');
const ensureAuth = require('../middleware/ensureAuth');
const validate = require('../middleware/validate');
const { uploadImagesQuery, saveAnnonce, removeAnnonce, removeImages, updateAnnonce } = require('../schemas/annonce.schema');

router.post('/imageupload', ensureAuth, validate(uploadImagesQuery, 'query'), annonceController.uploadImagesToAws);
router.post('/create', ensureAuth, validate(saveAnnonce), annonceController.saveAnnonceToDatabase);
router.post('/remove/annonceimages', ensureAuth, validate(removeImages), annonceController.removeAnnonceImagesFromAWS);
router.post('/update', ensureAuth, validate(updateAnnonce), annonceController.updateAnnonce);
router.post('/delete', ensureAuth, validate(removeAnnonce), annonceController.removeAnnonce);

module.exports = router;
