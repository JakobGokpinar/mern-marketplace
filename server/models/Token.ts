import mongoose from 'mongoose';

const TokenSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, required: true },
  token: { type: String, required: true },
  type: { type: String, enum: ['email', 'password-reset'], default: 'email' },
  createdAt: { type: Date, default: Date.now, expires: 600 },
});

const TokenModel = mongoose.model('Token', TokenSchema);

export default TokenModel;
