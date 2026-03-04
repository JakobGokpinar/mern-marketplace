const passport = require('passport');
const { randomUUID } = require('crypto');
const sendVerificationEmail = require('../config/sendEmail.js');

const signin = async (req, res, next) => {
    passport.authenticate('local-signin', function (err, user, info) {
        if (err) return next(err);
        if (!user) return res.json(info);
        req.logIn(user, function (err) {
            if (err) return next(err);
            return res.json({ user, message: 'user logged in' });
        });
    })(req, res, next);
};

// Passport strategy now creates the user with all fields in one write (passReqToCallback).
// This controller only handles the post-creation email verification step.
const signup = async (req, res, next) => {
    passport.authenticate('local-signup', async function (err, user, info) {
        if (err) return next(err);
        if (!user) return res.json(info);

        try {
            const email_verify_token = randomUUID();
            await sendVerificationEmail(user.email, user.username, user._id, email_verify_token);
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

module.exports = { signin, signup, logout };
