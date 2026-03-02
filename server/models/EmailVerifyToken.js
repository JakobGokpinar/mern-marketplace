const mongoose = require('mongoose');
const { Schema } = mongoose;

var EmailVerifySchema = new Schema({
    userId: {
        type: String,
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
})

const EmailVerifyToken = mongoose.model('email', EmailVerifySchema);

module.exports = EmailVerifyToken;