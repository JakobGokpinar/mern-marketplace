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
  return `${process.env.CLIENT_URL}/verify-email?t=${token}`;
}

async function createTokenAndSendEmail(userId: string, email: string, name: string) {
  const token = randomUUID();
  await TokenModel.create({ userId, token });
  await sendVerificationEmail(email, name, buildVerifyUrl(token));
}

export const signin = async (req: Request, res: Response, next: NextFunction) => {
  passport.authenticate('local-signin', function (err: Error | null, user: Express.User | false, info: { message: string }) {
    if (err) return next(err);
    if (!user) return res.status(401).json(info);
    req.logIn(user, function (err: Error | null) {
      if (err) return next(err);
      return res.status(200).json({ user, message: 'user logged in' });
    });
  })(req, res, next);
};

export const signup = async (req: Request, res: Response, next: NextFunction) => {
  passport.authenticate('local-signup', async function (err: Error | null, user: Express.User | false, info: { message: string }) {
    if (err) return next(err);
    if (!user) return res.status(400).json(info);

    req.logIn(user, function (loginErr: Error | null) {
      if (loginErr) return next(loginErr);
      createTokenAndSendEmail(user._id.toString(), user.email, user.fullName)
        .catch(err => logger.error('Verification email failed for %s: %s', user.email, err));
      res.status(200).json({ success: true, user, message: 'user created' });
    });
  })(req, res, next);
};

export const logout = (req: Request, res: Response) => {
  if (!req.isAuthenticated()) return res.json({ message: 'Not logged in' });
  req.logout(function (err: Error | null) {
    if (err) return res.status(500).json({ message: 'Logout failed' });
    req.session.destroy(() => {});
    res.json({ message: 'user logged out' });
  });
};

export const verifyEmailHandler = async (req: Request, res: Response) => {
  try {
    const { token } = req.body;

    // Look up userId from the token — no auth required
    const tokenDoc = await TokenModel.findOne({ token, type: 'email' });
    if (!tokenDoc) {
      return res.json({ success: false, message: 'Lenken er ugyldig eller utløpt. Be om en ny bekreftelsesmail.' });
    }

    const user = await UserModel.findOneAndUpdate(
      { _id: tokenDoc.userId },
      { isEmailVerified: true },
      { new: true }
    );
    if (!user) {
      return res.status(404).json({ success: false, message: 'Bruker ikke funnet' });
    }

    await TokenModel.deleteMany({ userId: tokenDoc.userId, type: 'email' });
    return res.status(200).json({ success: true, user, message: 'E-postadressen din er bekreftet!' });
  } catch (error) {
    logger.error(error);
    return res.status(500).json({ success: false, message: 'Noe gikk galt under verifiseringen' });
  }
};

export const resendVerificationEmail = async (req: Request, res: Response) => {
  try {
    const user = req.user!;
    await createTokenAndSendEmail(user._id.toString(), user.email, user.fullName);
    return res.status(200).json({ success: true, message: 'Bekreftelsesmail sendt! Sjekk innboksen' });
  } catch (error) {
    logger.error('Resend verification email failed: %O', error);
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
    if (isSame) return res.status(400).json({ success: false, message: 'Velg et annet passord enn det nåværende' });

    user.password = newPassword;
    await user.save();

    await TokenModel.deleteMany({ userId: user._id, type: 'password-reset' });
    sendPasswordChangedEmail(user.email, user.fullName)
      .catch(err => logger.error('Password changed notification failed for %s: %s', user.email, err));

    return res.json({ success: true, message: 'Passord oppdatert! Logg inn med det nye passordet' });
  } catch (error) {
    logger.error(error);
    return res.status(500).json({ success: false, message: 'Kunne ikke tilbakestille passord' });
  }
};
