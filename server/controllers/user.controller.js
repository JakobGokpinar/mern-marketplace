const mongoose = require('mongoose');
const ObjectId = mongoose.Types.ObjectId;
const UserModel = require('../models/UserModel');

const fetchUser = (req, res) => {
    if (!req.isAuthenticated()) return res.json({ message: 'Du må logge inn' });
    const userId = req.user.id;
    UserModel.findOne({ _id: new ObjectId(userId) })
        .then(response => res.status(200).json({ user: response }))
        .catch(error => res.status(500).json({ message: 'Error occured while fetching user' }));
}

const findUser = (req, res) => {
    const userId = req.query.userId;
    UserModel.findOne({ _id: new ObjectId(userId) })
        .then(response => res.status(200).json({ user: response }))
        .catch(error => {
            console.error(error);
            return res.status(500).json({ message: 'Error finding user' });
        });
}

const findSeller = (req, res) => {
    const sellerId = req.query.sellerId;
    UserModel.findOne({ _id: new ObjectId(sellerId) })
        .select('username profilePicture')
        .then(response => res.status(200).json({ seller: response }))
        .catch(error => {
            console.error(error);
            return res.status(500).json({ message: 'Error finding seller' });
        });
}

module.exports = { fetchUser, findUser, findSeller };