const mongoose = require("mongoose");
const ObjectId = require('mongoose').Types.ObjectId;

const AnnonceSchema = mongoose.Schema({
  _id: {
    type: ObjectId
  },
  title: {
    type: String
  },
  price: {
    type: Number
  },
  pricePeriod: {
    type: String,
  },
  category: {
    type: String
  },
  subCategory: {
    type: String
  },
  annonceImages: {
    type: Array
  },
  description: {
    type: String
  },
  status: {
    type: String
  },
  specialProperties: {
    type: Array
  },
  fylke: {
    type: String
  },
  kommune: {
    type: String
  },
  location: {
    type: String
  },
  postnumber: {
    type: String
  },
  sellerId: {
    type: ObjectId
  },
  date: {
    type: Date,
    default: Date.now,
  },
  isFavorite : {
    type: Boolean
  }
});

const myDB = mongoose.connection.useDb('announcements');
const AnnonceModel = myDB.model("Annonce", AnnonceSchema);

module.exports = AnnonceModel;
