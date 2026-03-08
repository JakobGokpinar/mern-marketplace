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
  pricePeriod: { type: String, required: true },
  category: { type: String, required: true, index: true },
  subCategory: { type: String, required: true },
  subSubCategory: { type: String, required: true },
  images: [ImageSchema],
  description: { type: String, required: true },
  status: { type: String, enum: ['nytt', 'brukt'], required: true },
  specialProperties: [SpecialPropertySchema],
  kommune: { type: String },
  location: { type: String, required: true },
  postnumber: { type: String, required: true },
  sellerId: { type: mongoose.Schema.Types.ObjectId, required: true, index: true, ref: 'User' },
}, { timestamps: true });

ListingSchema.index(
  { title: 'text', description: 'text' },
  { weights: { title: 10, description: 1 }, default_language: 'none' },
);

const ListingModel = mongoose.model('Listing', ListingSchema);

export default ListingModel;
