const express = require('express');
const router = express.Router();
const favoritesController = require('../controllers/favorites.controller');
const ensureAuth = require('../middleware/ensureAuth');

router.post('/add', ensureAuth, favoritesController.addToFavorites);
router.post('/remove', ensureAuth, favoritesController.removeFromFavorites);
router.get('/get', ensureAuth, favoritesController.getFavorites);

module.exports = router;
