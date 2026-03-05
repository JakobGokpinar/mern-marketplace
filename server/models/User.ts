import mongoose from 'mongoose';
import bcrypt from 'bcrypt';

const { Schema } = mongoose;

const UserSchema = new Schema({
  name: { type: String },
  lastname: { type: String },
  username: { type: String },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  profilePicture: { type: String },
  favorites: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Listing' }],
  lastActiveAt: { type: Date },
  userCreatedAt: { type: Date, default: Date.now },
  isEmailVerified: { type: Boolean, default: false },
}, { strict: true });

UserSchema.methods.toJSON = function () {
  const user = this;
  const userObject = user.toObject();
  delete userObject.password;
  return userObject;
};

UserSchema.pre('save', async function (next) {
  try {
    const user = this;
    if (!user.isModified('password')) return next();
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(this.password, salt);
    this.password = hashedPassword;
    next();
  } catch (error: any) {
    return next(error);
  }
});

const UserModel = mongoose.model('User', UserSchema);

export default UserModel;
