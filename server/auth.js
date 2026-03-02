var express = require('express');
const passport = require('passport');
const bcrypt = require('bcrypt');
const Strategy  = require("passport-local").Strategy;
var validator = require('validator');
var passwordValidator = require('password-validator');
const generateUniqueId = require('generate-unique-id');
const emailVerify = require('./sendEmail.js')
require('dotenv').config();

const UserModel = require('./models/UserModel.js');


// Sign-in strategy
passport.use('local-signin', new Strategy({ usernameField: 'email'}, async (email, password, done) => {
    UserModel.findOne({ email: email}).then(user =>  {
        if (!user) {
            return done(null, false, {message: 'E-postadressen finnes ikke'});
        }
        bcrypt.compare(password, user.password, (err, isMatch) => {
            if (err) throw err;
            if (!isMatch) return done(null, false, {message: 'Feil passord'})
            return done(null, user)
        })
    })
    .catch(err => {
        return done(null, false, {message: err})
    })
}))

// Sign-up strategy
passport.use('local-signup', new Strategy({ usernameField: 'email'}, async (email, password, done) => {
    try {
        const userExists = await UserModel.findOne({ 'email': email})
        if (userExists) {
            return done(null, false, {message: 'Denne e-postadressen er allerede registrert i systemet.'})
        }
        if(validator.isEmail(email) === false) {
            return done(null, false, { message: 'Vennligst oppgi en gyldig e-post' })
        }

        var passwordSchema = new passwordValidator();
        passwordSchema.is().min(6);
        passwordSchema.is().max(32);
        passwordSchema.has().letters();
        passwordSchema.has().digits(1);

        if(!passwordSchema.validate(password)) {
            return done(null, false, { message: 'Password must contain at least one letter and one digit, and be between 6 and 32 characters'})
        }

        const user = await UserModel.create({ email, password, isEmailVerified: process.env.NODE_ENV === 'development' });
        return done(null, user, { message: 'user created'})
    } catch (err) {
        console.error(err)
        return done(err)
    }
}))

passport.serializeUser((user, done) => {
    done(null, user.id)
})

passport.deserializeUser((id, done) => {
    UserModel.findById(id, (err, user) => {
        done(err, user)
    })
})

var router = express.Router();

const signin = async (req, res, next) => {
    passport.authenticate("local-signin", function(err, user, info) {
        if (err) return next(err);
        if (!user) return res.json(info);
        req.logIn(user, function(err){
            if(err) return next(err);
            return res.json({ user, message: 'user logged in'})
        })
    })(req, res, next);
}

const signup = async (req, res, next) => {
    passport.authenticate("local-signup", async function(err, user, info) {
        if (err) return next(err);       
        if (!user) return res.json(info);

        let email = req.body.email;
        let name = req.body.name;
        let lastname = req.body.lastname;
        let username = name + " " + lastname;

        try {
            const data = await UserModel.findOneAndUpdate(
              { email: email },
              { name, lastname, username },
              { new: true, useFindAndModify: false }
            );                
                const receiver_email = email;
                const receiver_username = username;
                const receiver_id = data._id;
                const email_verify_token = generateUniqueId();
                await emailVerify(receiver_email, receiver_username, receiver_id, email_verify_token)
                res.status(200).json({ success: true, user: data, message: 'user created'})
        } catch (error) {
            return res.status(500).json({ success: false, user, message: 'user could not be created', err: error.message})
        }
    })(req, res, next);
} 

const logout = (req, res) => {
    if(req.isAuthenticated()) {
        req.session.destroy();
        res.json({user: req.user, message: 'user logged out'});
        return
    } 
    res.json()
}

// Routes
router.post('/login', signin);
router.post('/signup', signup);
router.delete('/logout', logout);

module.exports = router;