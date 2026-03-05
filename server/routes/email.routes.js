const express = require('express');
const router = express.Router();
const emailController = require('../controllers/email.controller');
const ensureAuth = require('../middleware/ensureAuth');
const validate = require('../middleware/validate');
const { verifyEmail } = require('../schemas/email.schema');

router.post('/verify', ensureAuth, validate(verifyEmail), emailController.verifyEmail);
router.post('/newverificationemail', ensureAuth, emailController.sendVerificationEmail);

module.exports = router;
