import mongoose from 'mongoose';

const ImageSchema = new mongoose.Schema({
  location: { type: String, required: true },
  description: { type: String, default: '' },
  name: { type: String },
}, { _id: false });

const SpecialPropertySchema = new mongoose.Schema({
  title: { type: String, required: true },
  value: { type: String, required: true },
}, { _id: false });

const ListingSchema = new mongoose.Schema({
  title: { type: String, required: true },
  price: { type: Number, required: true, min: 0 },
  pricePeriod: { type: String },
  category: { type: String, required: true, index: true },
  subCategory: { type: String },
  images: [ImageSchema],
  description: { type: String },
  status: { type: String },
  specialProperties: [SpecialPropertySchema],
  fylke: { type: String },
  kommune: { type: String },
  location: { type: String },
  postnumber: { type: String },
  sellerId: { type: mongoose.Schema.Types.ObjectId, required: true, index: true, ref: 'User' },
}, { timestamps: true });

const ListingModel = mongoose.model('Listing', ListingSchema);

export default ListingModel;
