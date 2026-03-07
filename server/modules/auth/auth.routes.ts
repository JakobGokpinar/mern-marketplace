import express from 'express';
import * as authController from './auth.controller';
import ensureAuth from '../../middleware/ensureAuth';
import validate from '../../middleware/validate';
import { verifyEmail, forgotPassword, resetPassword } from './auth.schema';

const router = express.Router();

router.post('/auth/login', authController.signin);
router.post('/auth/signup', authController.signup);
router.delete('/auth/logout', authController.logout);

router.post('/auth/email/verify', ensureAuth, validate(verifyEmail), authController.verifyEmailHandler);
router.post('/auth/email/resend', ensureAuth, authController.resendVerificationEmail);

router.post('/auth/password/forgot', validate(forgotPassword), authController.forgotPassword);
router.post('/auth/password/reset', validate(resetPassword), authController.resetPassword);

export default router;
