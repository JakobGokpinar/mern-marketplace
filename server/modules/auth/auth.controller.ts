import type { Request, Response, NextFunction } from 'express';
import passport from 'passport';
import { randomUUID } from 'crypto';
import mongoose from 'mongoose';
import TokenModel from '../../models/Token';
import UserModel from '../../models/User';
import sendEmail from '../../config/sendEmail';
import logger from '../../config/logger';

const ObjectId = mongoose.Types.ObjectId;

export const signin = async (req: Request, res: Response, next: NextFunction) => {
  passport.authenticate('local-signin', function (err: any, user: any, info: any) {
    if (err) return next(err);
    if (!user) return res.status(401).json(info);
    req.logIn(user, function (err: any) {
      if (err) return next(err);
      return res.status(200).json({ user, message: 'user logged in' });
    });
  })(req, res, next);
};

export const signup = async (req: Request, res: Response, next: NextFunction) => {
  passport.authenticate('local-signup', async function (err: any, user: any, info: any) {
    if (err) return next(err);
    if (!user) return res.status(400).json(info);

    try {
      const verifyToken = randomUUID();
      await sendEmail(user.email, user.username, user._id, verifyToken);
      res.status(200).json({ success: true, user, message: 'user created' });
    } catch (error: any) {
      return res.status(500).json({ success: false, user, message: 'user could not be created', err: error.message });
    }
  })(req, res, next);
};

export const logout = (req: Request, res: Response) => {
  if (!req.isAuthenticated()) return res.json({ message: 'Not logged in' });
  req.logout(function (err: any) {
    if (err) return res.status(500).json({ message: 'Logout failed' });
    req.session.destroy(() => {});
    res.json({ message: 'user logged out' });
  });
};

export const verifyEmailHandler = async (req: Request, res: Response) => {
  try {
    const userId = req.body.userId;
    if (userId !== (req.user as any).id) {
      return res.status(403).json({ success: false, message: 'Vennligst logg deg inn med egen mailadresse for konto verifikasjon.' });
    }
    const token = req.body.token;
    const tokens = await TokenModel.find({ userId });
    if (!tokens || tokens.length === 0) {
      return res.json({ success: false, message: 'The session has expired. Please try again later' });
    }
    const last_token = tokens[tokens.length - 1];
    if (last_token.token !== token) {
      return res.json({ success: false, message: 'The session has expired. Please try again later' });
    }
    // TTL index auto-deletes tokens after 600s, so if we found one it's still valid
    const data = await UserModel.findOneAndUpdate(
      { _id: new ObjectId(userId) },
      { isEmailVerified: true },
      { new: true }
    );
    await TokenModel.deleteMany({ userId });
    return res.status(200).json({ success: true, user: data, message: 'Your email has been verified' });
  } catch (error) {
    logger.error(error);
    return res.status(500).json({ success: false, message: 'A problem occured while verifying the email' });
  }
};

export const sendVerificationEmail = async (req: Request, res: Response) => {
  try {
    const user = req.user as any;
    const verifyToken = randomUUID();
    await sendEmail(user.email, user.username, user._id, verifyToken);
    return res.status(200).json({ success: true, message: 'A new verification email has been sent. Please check your Input or Spam folder.' });
  } catch (error: any) {
    logger.error(error);
    return res.status(500).json({ success: false, message: 'Verification email could not be sent', err: error.message });
  }
};
