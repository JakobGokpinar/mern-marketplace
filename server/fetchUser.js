const express = require("express");
const mongoose = require("mongoose");
const ObjectId = mongoose.Types.ObjectId;
const UserModel = require("./models/UserModel.js");

fetchUser = (req, res) => {
    // if(!req.isAuthenticated()) return res.json({ message: 'Du må logge inn'});
    // let userId = req.user.id;
    let userId = req.query.userId 
    UserModel.findOne({_id: ObjectId(userId)})
    .then(response => {
        return res.status(200).json({user: response})
    })
    .catch(error => {
        console.log(error);
        return res.json({ message: "Error occured while fetching user" });
    })
}

const router = express.Router();

router.get("/", fetchUser);

module.exports = router;