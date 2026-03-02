const express = require('express');
const router = express.Router();
const authController = require('../controllers/auth.controller');

router.post('/login', authController.signin);
router.post('/signup', authController.signup);
router.delete('/logout', authController.logout);

module.exports = router;
