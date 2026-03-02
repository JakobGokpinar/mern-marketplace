const express = require('express');
const router = express.Router();
const annonceController = require('../controllers/annonce.controller');

router.post('/imageupload', annonceController.uploadImagesToAws);
router.post('/create', annonceController.saveAnnonceToDatabase);
router.post('/remove/annonceimages', annonceController.removeAnnonceImagesFromAWS);
router.post('/update', annonceController.updateAnnonce);
router.post('/delete', annonceController.removeAnnonce);

module.exports = router;
