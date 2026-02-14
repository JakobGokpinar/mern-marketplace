const express = require("express");
const mongoose = require("mongoose");
const ObjectId = mongoose.Types.ObjectId;
const AnnonceModel = require("./models/AnnonceModel.js");
const UserModel = require("./models/UserModel.js");

addToFavorites = async (req, res) => {
  if (!req.isAuthenticated())
    return res.json({ message: "Please login to access this data" });

  const userId = req.user.id;
  const annonceId = req.body.id;

  const isExist = await UserModel.findOne({ _id: ObjectId(userId) });
  if (isExist.favorites.includes(annonceId)) {
    return res.json({ message: "The annonce already saved to Favorites" });
  }

  AnnonceModel.findOne({ _id: ObjectId(annonceId) })
    .then((response) => {
      var annonce = response._id;
      UserModel.findByIdAndUpdate(
        { _id: userId },
        {
          $push: { favorites: annonce },
        },
        { useFindAndModify: false, returnDocument: "after" }
      ).then((result) => {
        return res
          .status(200)
          .json({ user: result, message: "Annonce saved to Favorites" });
      });
    })
    .catch((error) => {
      console.log(error);
      return res.json({
        error: error,
        message: "Annonce could not be saved to Favorites",
      });
    });
};

removeFromFavorites = (req, res) => {
  if (!req.isAuthenticated())
    return res.json({ message: "Please login to access this data" });

  const userId = req.user.id;
  const annonceId = req.body.id;
  if (!annonceId) {
    return res.json({ message: "Please select a valid annonce" });
  }

  UserModel.findByIdAndUpdate(
    { _id: ObjectId(userId) },
    {
      $pull: {
        favorites: ObjectId(annonceId),
      },
    },
    { useFindAndModify: false, returnDocument: "after" }
  )
    .then((result) => {
      return res.json({
        user: result,
        message: "Annonce removed from favorites",
      });
    })
    .catch((error) => {
      console.log(error);
    });
};

getFavorites = (req, res) => {
  if (!req.isAuthenticated())
    return res.json({ message: "Please login to access this data" });
  var userId = req.user.id;
  UserModel.findOne({ _id: ObjectId(userId) })
    .then((result) => {
      const favoritesArray = result.favorites;
      if (favoritesArray.length <= 0) return res.json({ productArray: [] });

      AnnonceModel.find()
        .then((result) => {
          const intersection = result.filter((element) =>
            favoritesArray.includes(element._id)
          );
          for (const value of intersection) {
            value["isFavorite"] = true;
          }
          return res.json({
            productArray: intersection,
            message: "Items fetched",
          });
        })
        .catch((err) => console.log(err));
    })
    .catch((error) => {
      console.log(error);
      return res.json({ message: "Error occured while fetching annonces" });
    });
};

const router = express.Router();

router.post("/add", addToFavorites);
router.post("/remove", removeFromFavorites);
router.get("/get", getFavorites);

module.exports = router;
