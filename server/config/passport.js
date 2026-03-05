const passport = require('passport');
const bcrypt = require('bcrypt');
const Strategy = require('passport-local').Strategy;
const validator = require('validator');
const passwordValidator = require('password-validator');
const UserModel = require('../models/UserModel.js');

// Sign-in strategy
passport.use('local-signin', new Strategy({ usernameField: 'email' }, async (email, password, done) => {
    try {
        const user = await UserModel.findOne({ email: email });
        if (!user) {
            return done(null, false, { message: 'E-postadressen finnes ikke' });
        }
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) return done(null, false, { message: 'Feil passord' });
        return done(null, user);
    } catch (err) {
        return done(null, false, { message: err.message || 'Login error' });
    }
}));

// Sign-up strategy — passReqToCallback lets us read name/lastname from the request
// so the user can be fully created in one DB write instead of create + update.
passport.use('local-signup', new Strategy({ usernameField: 'email', passReqToCallback: true }, async (req, email, password, done) => {
    try {
        // Validate format before hitting the database
        if (!validator.isEmail(email)) {
            return done(null, false, { message: 'Vennligst oppgi en gyldig e-post' });
        }

        const passwordSchema = new passwordValidator();
        passwordSchema.is().min(6);
        passwordSchema.is().max(32);
        passwordSchema.has().letters();
        passwordSchema.has().digits(1);

        if (!passwordSchema.validate(password)) {
            return done(null, false, { message: 'Password must contain at least one letter and one digit, and be between 6 and 32 characters' });
        }

        const userExists = await UserModel.findOne({ email });
        if (userExists) {
            return done(null, false, { message: 'Denne e-postadressen er allerede registrert i systemet.' });
        }

        const { name, lastname } = req.body;
        const username = name + ' ' + lastname;
        const user = await UserModel.create({
            email,
            password,
            name,
            lastname,
            username,
            isEmailVerified: process.env.NODE_ENV === 'development'
        });
        return done(null, user, { message: 'user created' });
    } catch (err) {
        return done(err);
    }
}));

passport.serializeUser((user, done) => {
    done(null, user.id);
});

// FIX: Original used callback syntax: UserModel.findById(id, (err, user) => {...})
// Mongoose 7+ dropped callback support for queries — this would crash every authenticated request.
// Updated to async/await.
passport.deserializeUser(async (id, done) => {
    try {
        const user = await UserModel.findById(id);
        done(null, user);
    } catch (err) {
        done(err);
    }
});

module.exports = passport;
