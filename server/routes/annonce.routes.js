const express = require('express');
const router = express.Router();
const annonceController = require('../controllers/annonce.controller');
const ensureAuth = require('../middleware/ensureAuth');

router.post('/imageupload', ensureAuth, annonceController.uploadImagesToAws);
router.post('/create', ensureAuth, annonceController.saveAnnonceToDatabase);
router.post('/remove/annonceimages', ensureAuth, annonceController.removeAnnonceImagesFromAWS);
router.post('/update', ensureAuth, annonceController.updateAnnonce);
router.post('/delete', ensureAuth, annonceController.removeAnnonce);

module.exports = router;
