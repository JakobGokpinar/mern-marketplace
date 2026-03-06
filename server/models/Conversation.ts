import mongoose from 'mongoose';

const ConversationSchema = new mongoose.Schema({
  buyer: { type: mongoose.Schema.Types.ObjectId, required: true, index: true, ref: 'User' },
  seller: { type: mongoose.Schema.Types.ObjectId, required: true, index: true, ref: 'User' },
  productId: { type: mongoose.Schema.Types.ObjectId, required: true, index: true, ref: 'Listing' },
  unreadBuyer: { type: Number, default: 0 },
  unreadSeller: { type: Number, default: 0 },
}, { timestamps: { createdAt: 'roomCreatedAt', updatedAt: false } });

const ConversationModel = mongoose.model('Conversation', ConversationSchema);

export default ConversationModel;
