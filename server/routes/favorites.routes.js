const express = require('express');
const router = express.Router();
const favoritesController = require('../controllers/favorites.controller');
const ensureAuth = require('../middleware/ensureAuth');
const validate = require('../middleware/validate');
const { favoriteBody } = require('../schemas/favorites.schema');

router.post('/add', ensureAuth, validate(favoriteBody), favoritesController.addToFavorites);
router.post('/remove', ensureAuth, validate(favoriteBody), favoritesController.removeFromFavorites);
router.get('/get', ensureAuth, favoritesController.getFavorites);

module.exports = router;
