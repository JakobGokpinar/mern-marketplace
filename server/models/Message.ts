import mongoose from 'mongoose';

const MessageSchema = new mongoose.Schema({
  conversationId: { type: mongoose.Schema.Types.ObjectId, required: true, index: true, ref: 'Conversation' },
  sender: { type: mongoose.Schema.Types.ObjectId, required: true, ref: 'User' },
  msg: { type: String, required: true },
  readAt: { type: Date, default: null },
}, { timestamps: { createdAt: 'sentAt', updatedAt: false } });

MessageSchema.index({ conversationId: 1, sentAt: -1 });

const MessageModel = mongoose.model('Message', MessageSchema);

export default MessageModel;
