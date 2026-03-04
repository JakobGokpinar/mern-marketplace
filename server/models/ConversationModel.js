const mongoose = require('mongoose');
const { ObjectId } = mongoose.Types;

const ConversationSchema = mongoose.Schema({
    buyer: {
        type: ObjectId,
        required: true
    },
    seller: {
        type: ObjectId,
        required: true
    },
    productId: {
        type: ObjectId,
        required: true
    },
    messages: {
        type: Array
    },
    unreadMessages: {
        type: Number,
        default: 0
    },
    roomCreatedAt: {
        type: Date,
        default: Date.now
    }
})

const ConversationModel = mongoose.model('rooms', ConversationSchema);

module.exports = ConversationModel;