const express = require('express');
const router = express.Router();
const favoritesController = require('../controllers/favorites.controller');

router.post('/add', favoritesController.addToFavorites);
router.post('/remove', favoritesController.removeFromFavorites);
router.get('/get', favoritesController.getFavorites);

module.exports = router;
