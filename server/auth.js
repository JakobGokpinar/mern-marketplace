var express = require('express');
const passport = require('passport');
const bcrypt = require('bcrypt');
const Strategy  = require("passport-local").Strategy;
var validator = require('validator');
var passwordValidator = require('password-validator');
const { OAuth2Client } = require('google-auth-library');
const generateUniqueId = require('generate-unique-id');
const emailVerify = require('./sendEmail.js')
require('dotenv').config();

const UserModel = require('./models/UserModel.js');
const GoogleUserModel = require('./models/GoogleUserModel.js');

const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID

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
        passwordSchema.has().lowercase();
        passwordSchema.has().uppercase();
        passwordSchema.has().digits(1);

        if(!passwordSchema.validate(password)) {
            return done(null, false, { message: 'Password must contain at least one number and one uppercase and lowercase letter, and be between 6 and 32 characters'})
        }

        const user = await UserModel.create({ email, password });
        return done(null, user, { message: 'user created'})
    } catch (err) {
        console.log(err)
        return done(err)
    }
}))

// Google OAuth strategy
passport.use('google-auth', new Strategy({ usernameField: 'credential'}, async (credential, password, done) => {
    try {
        const decodedToken = await getDecodedOAuthJwtGoogle(credential)
        
        const email = decodedToken["payload"].email;    
        const userExists = await UserModel.findOne({ 'email': email})
        if (userExists) {
            return done(null, userExists, {message: 'existing user'})
        }

        const name = decodedToken["payload"].given_name;
        const lastname = decodedToken["payload"].family_name;
        const username = decodedToken["payload"].name;
        const profilePicture = decodedToken["payload"].picture;
        
        const user = await GoogleUserModel.create({ name, lastname, username, email, profilePicture });
        return done(null, user, { message: 'new user created'})
    } catch (err) {
        return done(err)
    }
}))

getDecodedOAuthJwtGoogle = async (token) => {  
    try {
      const client = new OAuth2Client(GOOGLE_CLIENT_ID)
  
      const ticket = await client.verifyIdToken({
        idToken: token,
        audience: GOOGLE_CLIENT_ID,
      })
      return ticket;
    } catch (error) {
      return { status: 500, data: error }
    }
}

passport.serializeUser((user, done) => {
    done(null, user.id)
})

passport.deserializeUser((id, done) => {
    UserModel.findById(id, (err, user) => {
        done(err, user)
    })
})

var router = express.Router();

googleAuthentication = async (req, res, next) => {
    passport.authenticate('google-auth', function(err, user, info) {
        if(err) {
            return res.json(err)
        }
        req.logIn(user, function(err) {
            if (err) return next(err);
            return res.json({ user, message: 'User logged in'})
        }) 
    })(req, res, next)
}

signin = async (req, res, next) => {
    passport.authenticate("local-signin", function(err, user, info) {
        if (err) return next(err);
        if (!user) return res.json(info);
        req.logIn(user, function(err){
            if(err) return next(err);
            return res.json({ user, message: 'user logged in'})
        })
    })(req, res, next);
}

signup = async (req, res, next) => {
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

logout = (req, res) => {
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
router.post('/google/auth', googleAuthentication);

module.exports = router;