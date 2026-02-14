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

const tokenDB = mongoose.connection.useDb('token')
const EmailVerifyToken = tokenDB.model('email', EmailVerifySchema)

module.exports = EmailVerifyToken;