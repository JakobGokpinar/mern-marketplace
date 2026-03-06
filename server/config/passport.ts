import passport from 'passport';
import bcrypt from 'bcrypt';
import { Strategy } from 'passport-local';
import validator from 'validator';
import PasswordValidator from 'password-validator';
import UserModel from '../models/User';

// Sign-in strategy
passport.use('local-signin', new Strategy({ usernameField: 'email' }, async (email, password, done) => {
  try {
    const user = await UserModel.findOne({ email });
    if (!user) {
      return done(null, false, { message: 'E-postadressen finnes ikke' });
    }
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return done(null, false, { message: 'Feil passord' });
    return done(null, user);
  } catch (err: any) {
    return done(null, false, { message: err.message || 'Login error' });
  }
}));

// Sign-up strategy
passport.use('local-signup', new Strategy({ usernameField: 'email', passReqToCallback: true }, async (req, email, password, done) => {
  try {
    if (!validator.isEmail(email)) {
      return done(null, false, { message: 'Vennligst oppgi en gyldig e-post' });
    }

    const passwordSchema = new PasswordValidator();
    (passwordSchema as any).is().min(6);
    (passwordSchema as any).is().max(32);
    (passwordSchema as any).has().letters();
    (passwordSchema as any).has().digits(1);

    if (!(passwordSchema as any).validate(password)) {
      return done(null, false, { message: 'Password must contain at least one letter and one digit, and be between 6 and 32 characters' });
    }

    const userExists = await UserModel.findOne({ email });
    if (userExists) {
      return done(null, false, { message: 'Denne e-postadressen er allerede registrert i systemet.' });
    }

    const { fullName } = req.body;
    const user = await UserModel.create({
      email,
      password,
      fullName,
      isEmailVerified: process.env.NODE_ENV === 'development',
    });
    return done(null, user, { message: 'user created' });
  } catch (err) {
    return done(err);
  }
}));

passport.serializeUser((user: any, done) => {
  done(null, user.id);
});

passport.deserializeUser(async (id: string, done) => {
  try {
    const user = await UserModel.findById(id);
    done(null, user);
  } catch (err) {
    done(err);
  }
});

export default passport;
