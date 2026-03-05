const express = require('express');
const router = express.Router();
const emailController = require('../controllers/email.controller');
const ensureAuth = require('../middleware/ensureAuth');

router.post('/verify', ensureAuth, emailController.verifyEmail);
router.post('/newverificationemail', ensureAuth, emailController.sendVerificationEmail);

module.exports = router;
