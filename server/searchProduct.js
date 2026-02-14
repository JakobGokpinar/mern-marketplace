const express = require("express");
const AnnonceModel = require("./models/AnnonceModel.js");
const UserModel = require("./models/UserModel.js");
const ObjectId = require("mongoose").Types.ObjectId;

function getTitle(value) {
  let title = { title: { $regex: value, $options: "i" } };
  return title;
}
function getLocation(kommuneArr) {
  if (!kommuneArr) return;
  let location = { kommune: { $in: kommuneArr } };
  return location;
}
function getMainCategory(value) {
  if (!value) return;
  let category = { category: value };
  return category;
}
function getSubCategory(value) {
  if (!value) return;
  let subcategory = { subCategory: value };
  return subcategory;
}
function getPrice(min, max) {
  let price = {};
  if (!min && !max) {
    return;
  } else if (!min) {
    price = { price: { $lte: parseInt(max) } };
  } else if (!max) {
    price = { price: { $gte: parseInt(min) } };
  } else {
    price = { price: { $gte: parseInt(min), $lte: parseInt(max) } };
  }
  return price;
}
function getDate(value) {
  if (!value) return;

  var currentDate = new Date();
  let time = 0;
  if (value === "today") {
    time = 1;
  } else if (value === "this week") {
    time = 7;
  } else if (value === "this month") {
    time = 30;
  }
  currentDate.setDate(currentDate.getDate() - time);
  var dateObj = { date: { $gte: currentDate } };
  return dateObj;
}
function getStatus(value) {
  if (!value) return;
  value = value.toString().toLowerCase();
  value = value.charAt(0).toUpperCase() + value.slice(1);
  let status = { status: value };
  return status;
}

findProducts = async (req, res) => {
  const queryObject = {};
  let queryParams = req.body;
  const userId = req.user ? req.user.id : null
  for (const param in queryParams) {
    if (param === "q") Object.assign(queryObject, getTitle(queryParams[param]));
  }

  Object.assign(queryObject, getMainCategory(queryParams["category"]));
  Object.assign(queryObject, getSubCategory(queryParams["subcategory"]));
  Object.assign(
    queryObject,
    getPrice(queryParams["min_price"], queryParams["max_price"])
  );
  Object.assign(queryObject, getDate(queryParams["date"]));
  Object.assign(queryObject, getStatus(queryParams["status"]));
  Object.assign(queryObject, getLocation(queryParams["kommune"]));

  let favoriteProducts = [];

  if(userId) {
    UserModel.findOne({ _id: ObjectId(userId) })
    .then((result) => {
      favoriteProducts = result.favorites;
    })
    .catch((error) => {
      console.log(error);
    });
  }
  
  AnnonceModel.find(queryObject)
    .then((result) => {
      var catArr = [];
      var subArr = [];
      result.map((item) => {
        catArr.indexOf(item.category) === -1 && catArr.push(item.category);
        subArr.indexOf(item.subCategory) === -1 &&
          subArr.push(item.subCategory);
      });

      let productArray = result.map((item) => {
        favoriteProducts.map((fav) => {
          if (item._id.toString() === fav.toString()) {
            item["isFavorite"] = true;
            return item;
          }
        });
        return item;
      });

      res
        .status(200)
        .json({
          productArray: productArray,
          categories: catArr,
          subCategories: subArr,
          message: "Products successfully found",
        });
    })
    .catch((err) => {
      console.log(err);
      res
        .status(300)
        .json({
          error: err,
          message: "Error occured while searching products",
        });
    });
};

const router = express.Router();

router.post("/", findProducts);

module.exports = router;
