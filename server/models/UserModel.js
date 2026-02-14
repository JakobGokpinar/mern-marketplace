const mongoose = require('mongoose');
const bcrypt = require('bcrypt')
const {Schema} = mongoose

const UserSchema = new Schema({
    name: {
        type: String,
    },
    lastname: {
        type: String,
    },
    username: {
        type: String
    },
    email: {
        type: String,
        required: true
    },
    password: {
        type: String,
        required: true,
    },
    profilePicture: {
        type: String,
    },
    annonces: {
        type: Array
    },
    favorites: {
        type: Array
    },
    messages: {
        type: Array
    },
    lastActiveAt: {
        type: Date
    },
    userCreatedAt: {
        type: Date,
        default: Date.now,
      },
    isEmailVerified: {
        type: Boolean,
        default: false
    }
},{ strict: false}
);

UserSchema.methods.toJSON = function() {    //remove the user's password before sending it to client
    const user = this;
    const userObject = user.toObject();
    delete userObject.password;
    return userObject;
}

UserSchema.pre('save', async function (next) {
    try {
        //check method of registration
        const user = this
        if (!user.isModified('password'))   next();

        //generate salt
        const salt = await bcrypt.genSalt(10);

        //hash the password
        const hashedPassword = await bcrypt.hash(this.password, salt);

        //replace plain text password with hashed password
        this.password = hashedPassword;
        next();
    } catch(error) {
        return next(error);
    }
})

const myDB = mongoose.connection.useDb('user');
const UserModel = myDB.model("User", UserSchema);   

module.exports = UserModel;