const express = require('express');
const router = express.Router();
const searchController = require('../controllers/search.controller');
const ensureAuth = require('../middleware/ensureAuth');

router.get('/', searchController.getItems);
router.get('/mine', ensureAuth, searchController.getUserAnnonces);
router.post('/', searchController.findProducts);

module.exports = router;
