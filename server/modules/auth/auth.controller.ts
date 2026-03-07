import type { Request, Response, NextFunction } from 'express';
import passport from 'passport';
import { randomUUID } from 'crypto';
import mongoose from 'mongoose';
import TokenModel from '../../models/Token';
import UserModel from '../../models/User';
import bcrypt from 'bcrypt';
import { sendVerificationEmail, sendPasswordResetEmail, sendPasswordChangedEmail } from '../../config/sendEmail';
import logger from '../../config/logger';

const ObjectId = mongoose.Types.ObjectId;

function buildVerifyUrl(token: string) {
  return `${process.env.CLIENT_URL}/emailVerify?t=${token}`;
}

async function createTokenAndSendEmail(userId: string, email: string, name: string) {
  const token = randomUUID();
  await TokenModel.create({ userId, token });
  await sendVerificationEmail(email, name, buildVerifyUrl(token));
}

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

    createTokenAndSendEmail(user._id, user.email, user.fullName)
      .catch(err => logger.error('Verification email failed:', err));
    res.status(200).json({ success: true, user, message: 'user created' });
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

export const resendVerificationEmail = async (req: Request, res: Response) => {
  try {
    const user = req.user as any;
    await createTokenAndSendEmail(user._id, user.email, user.fullName);
    return res.status(200).json({ success: true, message: 'Bekreftelsesmail sendt. Sjekk innboksen eller søppelpost.' });
  } catch (error: any) {
    logger.error(error);
    return res.status(500).json({ success: false, message: 'Kunne ikke sende bekreftelsesmail' });
  }
};

export const forgotPassword = async (req: Request, res: Response) => {
  const { email } = req.body;
  // Always return success to prevent email enumeration
  const genericMsg = 'Hvis kontoen finnes, har vi sendt en e-post med instruksjoner.';

  try {
    const user = await UserModel.findOne({ email });
    if (!user) return res.json({ success: true, message: genericMsg });

    await TokenModel.deleteMany({ userId: user._id, type: 'password-reset' });
    const token = randomUUID();
    await TokenModel.create({ userId: user._id, token, type: 'password-reset' });

    const resetUrl = `${process.env.CLIENT_URL}/reset-password?t=${token}`;
    await sendPasswordResetEmail(email, user.fullName, resetUrl);

    return res.json({ success: true, message: genericMsg });
  } catch (error) {
    logger.error(error);
    return res.status(500).json({ success: false, message: 'Kunne ikke sende e-post' });
  }
};

export const resetPassword = async (req: Request, res: Response) => {
  const { token, newPassword } = req.body;

  try {
    const tokenDoc = await TokenModel.findOne({ token, type: 'password-reset' });
    if (!tokenDoc) return res.status(400).json({ success: false, message: 'Lenken er ugyldig eller utløpt' });

    const user = await UserModel.findById(tokenDoc.userId).select('+password');
    if (!user) return res.status(404).json({ success: false, message: 'Bruker ikke funnet' });

    const isSame = await bcrypt.compare(newPassword, user.password);
    if (isSame) return res.status(400).json({ success: false, message: 'Nytt passord kan ikke være det samme som nåværende' });

    user.password = newPassword;
    await user.save();

    await TokenModel.deleteMany({ userId: user._id, type: 'password-reset' });
    sendPasswordChangedEmail(user.email, user.fullName).catch(err => logger.error(err));

    return res.json({ success: true, message: 'Passordet er oppdatert. Du kan nå logge inn.' });
  } catch (error) {
    logger.error(error);
    return res.status(500).json({ success: false, message: 'Kunne ikke tilbakestille passord' });
  }
};
