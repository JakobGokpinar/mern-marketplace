const passport = require('passport');
const generateUniqueId = require('generate-unique-id');
const emailVerify = require('../config/sendEmail.js');
const UserModel = require('../models/UserModel.js');

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

const signup = async (req, res, next) => {
    passport.authenticate('local-signup', async function (err, user, info) {
        if (err) return next(err);
        if (!user) return res.json(info);

        const email = req.body.email;
        const name = req.body.name;
        const lastname = req.body.lastname;
        const username = name + ' ' + lastname;

        try {
            const data = await UserModel.findOneAndUpdate(
                { email: email },
                { name, lastname, username },
                { new: true, useFindAndModify: false }
            );
            const email_verify_token = generateUniqueId();
            await emailVerify(email, username, data._id, email_verify_token);
            res.status(200).json({ success: true, user: data, message: 'user created' });
        } catch (error) {
            return res.status(500).json({ success: false, user, message: 'user could not be created', err: error.message });
        }
    })(req, res, next);
};

const logout = (req, res) => {
    if (req.isAuthenticated()) {
        req.session.destroy();
        res.json({ user: req.user, message: 'user logged out' });
        return;
    }
    res.json();
};

module.exports = { signin, signup, logout };
