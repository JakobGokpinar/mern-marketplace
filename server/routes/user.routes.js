const express = require('express');
const router = express.Router();
const userController = require('../controllers/user.controller');
const ensureAuth = require('../middleware/ensureAuth');

router.get('/', ensureAuth, userController.fetchUser);
router.get('/find', userController.findUser);
router.get('/find/seller', userController.findSeller);

module.exports = router;
