const passport = require('passport');
const { randomUUID } = require('crypto');
const ObjectId = require('mongoose').Types.ObjectId;
const EmailVerifyToken = require('../../models/EmailVerifyToken');
const UserModel = require('../../models/UserModel');
const sendEmail = require('../../config/sendEmail');
const logger = require('../../config/logger');

const signin = async (req, res, next) => {
    passport.authenticate('local-signin', function (err, user, info) {
        if (err) return next(err);
        if (!user) return res.status(401).json(info);
        req.logIn(user, function (err) {
            if (err) return next(err);
            return res.status(200).json({ user, message: 'user logged in' });
        });
    })(req, res, next);
};

// Passport strategy now creates the user with all fields in one write (passReqToCallback).
// This controller only handles the post-creation email verification step.
const signup = async (req, res, next) => {
    passport.authenticate('local-signup', async function (err, user, info) {
        if (err) return next(err);
        if (!user) return res.status(400).json(info);

        try {
            const email_verify_token = randomUUID();
            await sendEmail(user.email, user.username, user._id, email_verify_token);
            res.status(200).json({ success: true, user, message: 'user created' });
        } catch (error) {
            return res.status(500).json({ success: false, user, message: 'user could not be created', err: error.message });
        }
    })(req, res, next);
};

const logout = (req, res) => {
    if (!req.isAuthenticated()) return res.json({ message: 'Not logged in' });
    req.logout(function (err) {
        if (err) return res.status(500).json({ message: 'Logout failed' });
        req.session.destroy();
        res.json({ message: 'user logged out' });
    });
};

const verifyEmail = async (req, res) => {
    try {
        const userId = req.body.userId;
        if (userId !== req.user.id) {
            return res.status(403).json({ success: false, message: 'Vennligst logg deg inn med egen mailadresse for konto verifikasjon.' });
        }
        const token = req.body.token;
        const tokens = await EmailVerifyToken.find({ userId });
        if (!tokens || tokens.length === 0) {
            return res.json({ success: false, message: 'The session has expired. Please try again later' });
        }
        const last_token = tokens[tokens.length - 1];
        if (last_token.token !== token) {
            return res.json({ success: false, message: 'The session has expired. Please try again later' });
        }
        const token_creation_date = new Date(last_token.createdAt);
        const current_date = new Date();
        const time_difference = (current_date - token_creation_date) / (1000 * 60);
        if (time_difference > 10) {
            return res.json({ success: false, message: 'The session has expired. Please try sending a new verification email' });
        }
        const data = await UserModel.findOneAndUpdate(
            { _id: new ObjectId(userId) },
            { isEmailVerified: true },
            { new: true }
        );
        // Clean up all verify tokens for this user now that verification is complete
        await EmailVerifyToken.deleteMany({ userId });
        return res.status(200).json({ success: true, user: data, message: 'Your email has been verified' });
    } catch (error) {
        logger.error(error);
        return res.status(500).json({ success: false, message: 'A problem occured while verifying the email' });
    }
};

const sendVerificationEmail = async (req, res) => {
    try {
        // Use authenticated user's data — never trust client-supplied email/id
        const receiver_email = req.user.email;
        const receiver_username = req.user.username;
        const receiver_id = req.user._id;
        const email_verify_token = randomUUID();
        await sendEmail(receiver_email, receiver_username, receiver_id, email_verify_token);
        return res.status(200).json({ success: true, message: 'A new verification email has been sent. Please check your Input or Spam folder.' });
    } catch (error) {
        logger.error(error);
        return res.status(500).json({ success: false, message: 'Verification email could not be sent', err: error.message });
    }
};

module.exports = { signin, signup, logout, verifyEmail, sendVerificationEmail };
