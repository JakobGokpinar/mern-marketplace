const mongoose = require('mongoose');
const { ObjectId } = mongoose.Types;

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
    type: String,
    index: true
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
    type: ObjectId,
    index: true
  },
  date: {
    type: Date,
    default: Date.now,
  },
});

const AnnonceModel = mongoose.model("Annonce", AnnonceSchema);

module.exports = AnnonceModel;
