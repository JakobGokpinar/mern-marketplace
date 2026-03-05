const express = require('express');
const router = express.Router();
const profileController = require('../controllers/profile.controller');
const ensureAuth = require('../middleware/ensureAuth');
const validate = require('../middleware/validate');
const { updateUserInfo } = require('../schemas/profile.schema');

router.post('/upload/picture', ensureAuth, profileController.uploadImageToAws);
router.post('/update/userinfo', ensureAuth, validate(updateUserInfo), profileController.updateUserInfo);
router.post('/delete/picture', ensureAuth, profileController.removeProfileImage);
router.post('/delete/account', ensureAuth, profileController.deleteAccount);
router.get('/get/picture', ensureAuth, profileController.getProfileImage);

module.exports = router;
