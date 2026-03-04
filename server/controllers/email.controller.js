const ObjectId = require('mongoose').Types.ObjectId;
const EmailVerifyToken = require('../models/EmailVerifyToken');
const UserModel = require('../models/UserModel');
const emailVerify = require('../config/sendEmail');
const generateUniqueId = require('generate-unique-id');

const verifyEmail = async (req, res) => {
    if (!req.isAuthenticated()) return res.json({ status: false, message: 'Please login for verifying' });
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
            { new: true, useFindAndModify: false }
        );
        // Clean up all verify tokens for this user now that verification is complete
        await EmailVerifyToken.deleteMany({ userId });
        return res.status(200).json({ success: true, user: data, message: 'Your email has been verified' });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ success: false, error, message: 'A problem occured while verifying the email' });
    }
}

const sendVerificationEmail = async (req, res) => {
    if (!req.isAuthenticated()) return res.status(401).json({ success: false, message: 'Not authenticated' });

    try {
        // Use authenticated user's data — never trust client-supplied email/id
        const receiver_email = req.user.email;
        const receiver_username = req.user.username;
        const receiver_id = req.user._id;
        const email_verify_token = generateUniqueId();
        await emailVerify(receiver_email, receiver_username, receiver_id, email_verify_token);
        return res.status(200).json({ success: true, message: 'A new verification email has been sent. Please check your Input or Spam folder.' });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ success: false, message: 'Verification email could not be sent', err: error.message });
    }
}

module.exports = { verifyEmail, sendVerificationEmail };
