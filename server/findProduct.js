const mongoose = require('mongoose');
const express = require('express');
const ObjectId = mongoose.Types.ObjectId;
const UserModel = require('./models/UserModel.js');
const AnnonceModel = require('./models/AnnonceModel.js');

findProduct = async (req, res) => {

    let productId = req.query.id;

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

    try {
        var result = await AnnonceModel.findOne({ _id: ObjectId(productId)});
        var seller = await UserModel.findOne({_id: ObjectId(result.sellerId)});
        var sellerObj = {
            username: seller?.username,
            userDate: seller?.userCreatedAt,
            userProfilePicture: seller?.profilePicture
        }
    
        let matchedIndex = favoritesArray.indexOf(result._id)
        if(matchedIndex !== -1) {
            result["isFavorite"] = true;
        } 
        return res.status(200).json({ product: result, seller, message: 'Product is found' }) 
    } catch (error) {
        return res.status(300).json({error, message: 'Error occured while getting the annonce'})
    }
}


const router = express.Router();

router.get('/', findProduct)

module.exports = router;