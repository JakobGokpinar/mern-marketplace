import express from 'express';
import * as userController from './user.controller';
import ensureAuth from '../../middleware/ensureAuth';
import validate from '../../middleware/validate';
import { findUserQuery, findSellerQuery, updateUserInfo, favoriteBody } from './user.schema';

const router = express.Router();

// Fetch / find users
router.get('/fetchuser', ensureAuth, userController.fetchUser);
router.get('/fetchuser/find', validate(findUserQuery, 'query'), userController.findUser);
router.get('/fetchuser/find/seller', validate(findSellerQuery, 'query'), userController.findSeller);

// Profile
router.post('/profile/upload/picture', ensureAuth, userController.uploadImageToAws);
router.post('/profile/update/userinfo', ensureAuth, validate(updateUserInfo), userController.updateUserInfoHandler);
router.post('/profile/delete/picture', ensureAuth, userController.removeProfileImage);
router.post('/profile/delete/account', ensureAuth, userController.deleteAccount);
router.get('/profile/get/picture', ensureAuth, userController.getProfileImage);

// Favorites
router.post('/favorites/add', ensureAuth, validate(favoriteBody), userController.addToFavorites);
router.post('/favorites/remove', ensureAuth, validate(favoriteBody), userController.removeFromFavorites);
router.get('/favorites/get', ensureAuth, userController.getFavorites);

export default router;
