const express = require('express');
const router = express.Router();
const authController = require('./auth.controller');
const ensureAuth = require('../../middleware/ensureAuth');
const validate = require('../../middleware/validate');
const { verifyEmail } = require('./auth.schema');

// Auth
router.post('/login', authController.signin);
router.post('/signup', authController.signup);
router.delete('/logout', authController.logout);

// Email verification
router.post('/email/verify', ensureAuth, validate(verifyEmail), authController.verifyEmail);
router.post('/email/newverificationemail', ensureAuth, authController.sendVerificationEmail);

module.exports = router;
