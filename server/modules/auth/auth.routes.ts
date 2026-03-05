import express from 'express';
import * as authController from './auth.controller';
import ensureAuth from '../../middleware/ensureAuth';
import validate from '../../middleware/validate';
import { verifyEmail } from './auth.schema';

const router = express.Router();

router.post('/login', authController.signin);
router.post('/signup', authController.signup);
router.delete('/logout', authController.logout);

router.post('/email/verify', ensureAuth, validate(verifyEmail), authController.verifyEmailHandler);
router.post('/email/newverificationemail', ensureAuth, authController.sendVerificationEmail);

export default router;
