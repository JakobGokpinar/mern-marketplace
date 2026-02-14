const mongoose = require('mongoose');
const bcrypt = require('bcrypt')
const {Schema} = mongoose

const GoogleUserSchema = new Schema({
    name: {
        type: String,
    },
    lastname: {
        type: String,
    },
    username: {
        type: String,
    },
    email: {
        type: String,
        required: true
    },
    profilePicture: {
        type: String,
    },
    annonces: {
        type: Array
    },
    favorites: {
        type: Array
    }
},{ strict: false}
);


const myDB = mongoose.connection.useDb('user');
const GoogleUserModel = myDB.model("User", GoogleUserSchema);   
// const UserModel = mongoose.model('User', UserSchema);

module.exports = GoogleUserModel;