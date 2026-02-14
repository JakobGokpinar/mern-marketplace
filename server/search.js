const mongoose = require("mongoose");
const express = require('express');
const AnnonceModel = require('./models/AnnonceModel.js')
const UserModel = require('./models/UserModel.js')
const ObjectId = mongoose.Types.ObjectId;

getItems = (req,res) => {
    let favoritesArray = [];
    if(req.isAuthenticated()) {
        const user = req.user._id;
        UserModel.findOne({_id: ObjectId(user)}).then(result => {
            favoritesArray = result.favorites

        }).catch(error => {
            console.log(error);
            return res.json({message: 'Error occured while fetching annonces'})
        })
    }

    AnnonceModel.find().then(result => {
        if(favoritesArray.length <= 0) return res.json({productArray: result});

        let productArray = result.map((item) => {
            favoritesArray.map(fav => {
                if(item !== null && fav !== null && item._id.toString() === fav.toString()) {
                    item["isFavorite"] = true;
                    return item;
                }
            })
            return item
        })
        return res.json({productArray: productArray, message: 'Items found'})
    })
    .catch(err => console.log(err)) 
}

const router = express.Router();

router.get('/', getItems)

module.exports = router;
