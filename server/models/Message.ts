import mongoose from 'mongoose';

const MessageSchema = new mongoose.Schema({
  conversationId: { type: mongoose.Schema.Types.ObjectId, required: true, index: true, ref: 'Conversation' },
  sender: { type: mongoose.Schema.Types.ObjectId, required: true, ref: 'User' },
  msg: { type: String, required: true },
}, { timestamps: { createdAt: 'sentAt', updatedAt: false } });

const MessageModel = mongoose.model('Message', MessageSchema);

export default MessageModel;
