import mongoose from 'mongoose';

const { ObjectId } = mongoose.Types;

const ConversationSchema = new mongoose.Schema({
  buyer: { type: ObjectId, required: true, index: true },
  seller: { type: ObjectId, required: true, index: true },
  productId: { type: ObjectId, required: true, index: true },
  messages: { type: Array },
  unreadMessages: { type: Number, default: 0 },
  roomCreatedAt: { type: Date, default: Date.now },
});

const ConversationModel = mongoose.model('rooms', ConversationSchema);

export default ConversationModel;
