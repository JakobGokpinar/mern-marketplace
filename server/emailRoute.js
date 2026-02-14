const express = require('express');
const ObjectId = require('mongoose').Types.ObjectId;
const EmailVerifyToken = require('./models/EmailVerifyToken.js');
const emailVerify = require('./sendEmail.js')       //this will create the email verification template
const generateUniqueId = require('generate-unique-id');         //required to generate a token for email
const UserModel = require('./models/UserModel.js');

verifyEmail = async (req, res) => {
    if (!req.isAuthenticated()) return res.json({ status: false, message: 'Please login  for verifying'}); 
    try {
        const userId = req.body.userId
        if (userId !== req.user.id) {
            return res.status(300).json({ success: false, message: 'Vennligst logg deg inn med egen mailadresse for konto verifikasjon.'})
        }
        const token = req.body.token;  
        var tokens = await EmailVerifyToken.find(
            {userId: userId}
        )    
        if(!tokens) return;
        var last_token = tokens[tokens.length - 1];
        if(last_token.token !== token) {
            return res.json({ success: false, message: 'The session has expired. Please try again later'})
        }
        var token_creation_date = new Date(last_token.createdAt)
        var current_date = new Date();
        var time_difference = (current_date - token_creation_date) / (1000 * 60)

        if(time_difference > 10) {
            return res.json({ success: false, message: 'The session has expired. Please try sending a new verification email'})
        }
        data = await UserModel.findOneAndUpdate(
            { _id: ObjectId(userId)},
            { isEmailVerified: true},
            { new: true, useFindAndModify: false }
        )
        return res.status(200).json({ success: true, user: data, message: 'Your email has been verified'})
    } catch (error) {
        console.log(error)
        return res.status(300).json({ success: false, error, message: 'A problem occured while verifying the email'})
    }
}

//I need this function to be able to send a post request to send an verification email to user.
sendVerificationEmailforRoute = async (req, res) => {
    try {
        const receiver_email = req.body.email;
        const receiver_username = req.body.username;
        const receiver_id = req.body.id;
        const email_verify_token = generateUniqueId();
        await emailVerify(receiver_email, receiver_username, receiver_id, email_verify_token)
        console.log("🚀 ~ file: emailRoute.js:48 - A new email verification email has been sent");
        return res.status(200).json({  success: true, message: 'A new verification email has been sent. Please check your Input or Spam folder.'})
    } catch (error) {
        console.log("🚀 ~ file: emailRoute.js:42 ~ sendVerificationEmailforRoute= ~ error:", error)
        return res.status(500).json({  success: false, message: 'Verification email coul not be sent', err: error.message})
    }
}

var router = express.Router();

router.post('/verify', verifyEmail)
router.post('/newverificationemail', sendVerificationEmailforRoute)

module.exports = router;