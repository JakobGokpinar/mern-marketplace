const mongoose = require('mongoose');
const ObjectId = require('mongoose').Types.ObjectId;

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

const myDb = mongoose.connection.useDb('messages')
const ConversationModel = myDb.model('rooms', ConversationSchema);

module.exports = ConversationModel;