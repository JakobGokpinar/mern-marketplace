const mongoose = require('mongoose');
const { Schema, Types } = mongoose;

const EmailVerifySchema = new Schema({
    userId: {
        type: Types.ObjectId,
        required: true
    },
    token: {
        type: String,
        required: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

const EmailVerifyToken = mongoose.model('email', EmailVerifySchema);

module.exports = EmailVerifyToken;
