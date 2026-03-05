import mongoose from 'mongoose';

const { ObjectId } = mongoose.Types;

const ListingSchema = new mongoose.Schema({
  _id: { type: ObjectId },
  title: { type: String },
  price: { type: Number },
  pricePeriod: { type: String },
  category: { type: String, index: true },
  subCategory: { type: String },
  images: { type: Array },
  description: { type: String },
  status: { type: String },
  specialProperties: { type: Array },
  fylke: { type: String },
  kommune: { type: String },
  location: { type: String },
  postnumber: { type: String },
  sellerId: { type: ObjectId, index: true },
  date: { type: Date, default: Date.now },
});

const ListingModel = mongoose.model('Listing', ListingSchema);

export default ListingModel;
