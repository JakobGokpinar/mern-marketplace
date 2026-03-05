const express = require('express');
const router = express.Router();
const userController = require('../controllers/user.controller');
const ensureAuth = require('../middleware/ensureAuth');
const validate = require('../middleware/validate');
const { findUserQuery, findSellerQuery } = require('../schemas/user.schema');

router.get('/', ensureAuth, userController.fetchUser);
router.get('/find', validate(findUserQuery, 'query'), userController.findUser);
router.get('/find/seller', validate(findSellerQuery, 'query'), userController.findSeller);

module.exports = router;
