const express = require('express');
const router = express.Router();
const emailController = require('../controllers/email.controller');

router.post('/verify', emailController.verifyEmail);
router.post('/newverificationemail', emailController.sendVerificationEmail);

module.exports = router;