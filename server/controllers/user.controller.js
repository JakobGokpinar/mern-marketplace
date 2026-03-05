const mongoose = require('mongoose');
const ObjectId = mongoose.Types.ObjectId;
const UserModel = require('../models/UserModel');

const fetchUser = async (req, res) => {
    if (!req.isAuthenticated()) return res.status(401).json({ message: 'Du må logge inn' });
    try {
        const response = await UserModel.findOne({ _id: new ObjectId(req.user.id) });
        return res.status(200).json({ user: response });
    } catch (error) {
        return res.status(500).json({ message: 'Error occured while fetching user' });
    }
};

const findUser = async (req, res) => {
    try {
        const response = await UserModel.findOne({ _id: new ObjectId(req.query.userId) });
        return res.status(200).json({ user: response });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Error finding user' });
    }
};

const findSeller = async (req, res) => {
    try {
        const response = await UserModel.findOne({ _id: new ObjectId(req.query.sellerId) })
            .select('username profilePicture');
        return res.status(200).json({ seller: response });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Error finding seller' });
    }
};

module.exports = { fetchUser, findUser, findSeller };
