import express from 'express';
import * as userController from './user.controller';
import ensureAuth from '../../middleware/ensureAuth';
import validate from '../../middleware/validate';
import { findUserQuery, findSellerQuery, updateUserInfo, changePassword, changeEmail, favoriteBody } from './user.schema';

const router = express.Router();

// Users
router.get('/user/me', ensureAuth, userController.fetchUser);
router.get('/users/:id', validate(findUserQuery, 'params'), userController.findUser);
router.get('/users/:id/seller', validate(findSellerQuery, 'params'), userController.findSeller);

// Profile
router.put('/user/me/picture', ensureAuth, userController.uploadImageToAws);
router.delete('/user/me/picture', ensureAuth, userController.removeProfileImage);
router.get('/user/me/picture', ensureAuth, userController.getProfileImage);
router.patch('/user/me', ensureAuth, validate(updateUserInfo), userController.updateUserInfoHandler);
router.put('/user/me/password', ensureAuth, validate(changePassword), userController.changePassword);
router.put('/user/me/email', ensureAuth, validate(changeEmail), userController.changeEmail);
router.delete('/user/me', ensureAuth, userController.deleteAccount);

// Favorites
router.post('/user/me/favorites', ensureAuth, validate(favoriteBody), userController.addToFavorites);
router.delete('/user/me/favorites/:id', ensureAuth, userController.removeFromFavorites);
router.get('/user/me/favorites', ensureAuth, userController.getFavorites);

export default router;
