const express = require('express');
const router = express.Router();
const searchController = require('../controllers/search.controller');

// Browse endpoints (mounted at /search)
router.get('/', searchController.getItems);
router.get('/mine', searchController.getUserAnnonces);

// Search/filter endpoint (also mounted at /searchproduct for frontend compatibility)
router.post('/', searchController.findProducts);

module.exports = router;
