import express from 'express';
import * as authController from './auth.controller';
import ensureAuth from '../../middleware/ensureAuth';
import validate from '../../middleware/validate';
import { verifyEmail } from './auth.schema';

const router = express.Router();

router.post('/auth/login', authController.signin);
router.post('/auth/signup', authController.signup);
router.delete('/auth/logout', authController.logout);

router.post('/auth/email/verify', ensureAuth, validate(verifyEmail), authController.verifyEmailHandler);
router.post('/auth/email/resend', ensureAuth, authController.resendVerificationEmail);

export default router;
