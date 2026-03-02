const express = require('express');
const router = express.Router();
const userController = require('../controllers/user.controller');

router.get('/', userController.fetchUser);
router.get('/find', userController.findUser);         // add this
router.get('/find/seller', userController.findSeller); // add this

module.exports = router;