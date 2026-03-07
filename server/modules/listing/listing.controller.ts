import type { Request, Response } from 'express';
import mongoose from 'mongoose';
import ListingModel from '../../models/Listing';
import UserModel from '../../models/User';
import ConversationModel from '../../models/Conversation';
import MessageModel from '../../models/Message';
import { getEnvFolder, deleteObjectsByPrefix } from '../../services/s3';
import { createListingUpload } from '../../middleware/upload';
import logger from '../../config/logger';

const ObjectId = mongoose.Types.ObjectId;
const DEFAULT_LIMIT = 20;

// --- Helpers ---

function parsePagination(query: any) {
  const page = Math.max(1, parseInt(query.page) || 1);
  const limit = Math.min(100, Math.max(1, parseInt(query.limit) || DEFAULT_LIMIT));
  return { page, limit, skip: (page - 1) * limit };
}

async function getFavoritesArray(req: Request) {
  if (!req.isAuthenticated()) return [];
  try {
    const user = await UserModel.findOne({ _id: new ObjectId((req.user as any)._id) }).select('favorites');
    return user?.favorites || [];
  } catch (error) {
    logger.error(error);
    return [];
  }
}

function markFavorites(items: any[], favoritesArray: any[]) {
  if (favoritesArray.length === 0) return items;
  return items.map(item => {
    if (favoritesArray.some(fav => fav.toString() === item._id.toString())) {
      item.isFavorite = true;
    }
    return item;
  });
}

// --- CRUD ---

export const uploadImagesToAws = (req: Request, res: Response) => {
  const user = req.user as any;
  const listingId = (req.query.listingId as string) || new ObjectId().toString();
  const keyPrefix = getEnvFolder() + '/' + user.email + '/listing-' + listingId;
  const upload = createListingUpload(keyPrefix);

  upload(req as any, res as any, (err: any) => {
    if (err) {
      return res.status(400).json({ message: 'Kunne ikke laste opp bilder' });
    }
    res.status(200).json({ files: (req as any).files, message: 'images uploaded', listingId });
  });
};

export const saveListingToDatabase = async (req: Request, res: Response) => {
  const user = req.user as any;
  const listingProps = req.body.listingProperties;
  const images = req.body.imageLocations;
  const listingId = req.body.listingId;

  try {
    const newListing = new ListingModel({
      _id: new ObjectId(listingId),
      ...listingProps,
      images,
      sellerId: new ObjectId(user._id),
    });
    await newListing.save();
    return res.json({ message: 'listing created' });
  } catch (error) {
    logger.error(error);
    return res.status(500).json({ message: 'Could not save listing' });
  }
};

export const removeListing = async (req: Request, res: Response) => {
  const email = (req.user as any).email;
  const listingId = req.params.id as string;

  const listing = await ListingModel.findById(new ObjectId(listingId));
  if (!listing) return res.status(404).json({ message: 'Listing not found' });
  if (listing.sellerId!.toString() !== (req.user as any)._id.toString()) {
    return res.status(403).json({ message: 'Forbidden' });
  }

  try {
    await deleteObjectsByPrefix(getEnvFolder() + '/' + email + '/listing-' + listingId + '/');
    await ListingModel.deleteOne({ _id: new ObjectId(listingId) });
    await UserModel.updateMany({}, { $pull: { favorites: new ObjectId(listingId) } });

    const conversations = await ConversationModel.find({ productId: new ObjectId(listingId) });
    const conversationIds = conversations.map(c => c._id);
    if (conversationIds.length > 0) {
      await MessageModel.deleteMany({ conversationId: { $in: conversationIds } });
    }
    await ConversationModel.deleteMany({ productId: new ObjectId(listingId) });

    return res.status(200).json({ message: 'Annonsen er slettet' });
  } catch (error) {
    logger.error(error);
    return res.status(500).json({ message: 'Error occured while deleting listing' });
  }
};

export const removeListingImagesFromAWS = async (req: Request, res: Response) => {
  try {
    const userEmail = (req.user as any).email;
    const listingId = req.params.id as string;
    await deleteObjectsByPrefix(getEnvFolder() + '/' + userEmail + '/listing-' + listingId + '/');
    return res.status(200).json({ message: 'listing images deleted successfully' });
  } catch (error) {
    logger.error(error);
    return res.status(500).json({ message: 'Error occurred while deleting s3 objects' });
  }
};

export const updateListing = async (req: Request, res: Response) => {
  const userId = (req.user as any).id;
  const listingId = req.params.id as string;
  const images = req.body.images;
  const listingProperties = req.body.listingProperties;

  try {
    const existing = await ListingModel.findById(new ObjectId(listingId));
    if (!existing) return res.status(404).json({ message: 'Listing not found' });
    if (existing.sellerId!.toString() !== userId.toString()) {
      return res.status(403).json({ message: 'Forbidden' });
    }

    await ListingModel.findByIdAndUpdate(listingId, {
      $set: { ...listingProperties, images, sellerId: new ObjectId(userId) },
    });
    return res.status(200).json({ message: 'mission successful' });
  } catch (error) {
    logger.error(error);
    return res.status(500).json({ message: 'Error occurred while updating listing' });
  }
};

// --- Read / Search ---

export const findProduct = async (req: Request, res: Response) => {
  const productId = req.params.id as string;
  let favoritesArray: any[] = [];

  if (req.isAuthenticated()) {
    try {
      const user = await UserModel.findOne({ _id: new ObjectId((req.user as any)._id) });
      favoritesArray = user!.favorites;
    } catch (error) {
      logger.error(error);
    }
  }

  try {
    const result = await ListingModel.findOne({ _id: new ObjectId(productId) }).lean();
    const seller = await UserModel.findOne({ _id: new ObjectId((result as any).sellerId) })
      .select('fullName profilePicture lastActiveAt userCreatedAt')
      .lean();

    const isFavorite = favoritesArray.some(favId => favId.toString() === (result as any)._id.toString());
    if (isFavorite) (result as any).isFavorite = true;

    return res.status(200).json({ product: result, seller, message: 'Product is found' });
  } catch (error) {
    logger.error(error);
    return res.status(500).json({ message: 'Error occured while getting the listing' });
  }
};

export const getItems = async (req: Request, res: Response) => {
  try {
    const { page, limit, skip } = parsePagination(req.query);
    const favoritesArray = await getFavoritesArray(req);

    const [productArray, totalCount] = await Promise.all([
      ListingModel.find().sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
      ListingModel.countDocuments(),
    ]);

    return res.json({
      productArray: markFavorites(productArray, favoritesArray),
      totalCount,
      page,
      totalPages: Math.ceil(totalCount / limit),
    });
  } catch (error) {
    logger.error(error);
    return res.status(500).json({ message: 'Error occurred while fetching listings' });
  }
};

export const getUserListings = async (req: Request, res: Response) => {
  try {
    const userId = (req.user as any)._id;
    const result = await ListingModel.find({ sellerId: new ObjectId(userId) });
    return res.status(200).json({ productArray: result });
  } catch (err) {
    return res.status(500).json({ message: 'Could not fetch listings' });
  }
};

// --- Search/filter helpers ---

function escapeRegex(str: string) {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}
function getTitle(value: string) {
  return { title: { $regex: escapeRegex(value), $options: 'i' } };
}
function getLocation(kommuneArr: string[] | undefined) {
  if (!kommuneArr) return;
  return { kommune: { $in: kommuneArr } };
}
function getMainCategory(value: string | undefined) {
  if (!value) return;
  return { category: value };
}
function getSubCategory(value: string | undefined) {
  if (!value) return;
  return { subCategory: value };
}
function getPrice(min: string | undefined, max: string | undefined) {
  if (!min && !max) return;
  if (!min) return { price: { $lte: parseInt(max!) } };
  if (!max) return { price: { $gte: parseInt(min) } };
  return { price: { $gte: parseInt(min), $lte: parseInt(max) } };
}
function getDate(value: string | undefined) {
  if (!value) return;
  const currentDate = new Date();
  let time = 0;
  if (value === 'today') time = 1;
  else if (value === 'this week') time = 7;
  else if (value === 'this month') time = 30;
  currentDate.setDate(currentDate.getDate() - time);
  return { createdAt: { $gte: currentDate } };
}
function getStatus(value: string | undefined) {
  if (!value) return;
  let v = value.toString().toLowerCase();
  v = v.charAt(0).toUpperCase() + v.slice(1);
  return { status: v };
}

export const findProducts = async (req: Request, res: Response) => {
  const queryObject: any = {};
  const queryParams = req.body;

  for (const param in queryParams) {
    if (param === 'q') Object.assign(queryObject, getTitle(queryParams[param]));
  }

  Object.assign(queryObject, getMainCategory(queryParams['category']));
  Object.assign(queryObject, getSubCategory(queryParams['subcategory']));
  Object.assign(queryObject, getPrice(queryParams['min_price'], queryParams['max_price']));
  Object.assign(queryObject, getDate(queryParams['date']));
  Object.assign(queryObject, getStatus(queryParams['status']));
  Object.assign(queryObject, getLocation(queryParams['kommune']));

  const { page, limit, skip } = parsePagination(req.body);
  const favoritesArray = await getFavoritesArray(req);

  try {
    const [result, totalCount] = await Promise.all([
      ListingModel.find(queryObject).sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
      ListingModel.countDocuments(queryObject),
    ]);

    const catArr: string[] = [];
    const subArr: string[] = [];
    result.forEach((item: any) => {
      if (catArr.indexOf(item.category) === -1) catArr.push(item.category);
      if (subArr.indexOf(item.subCategory) === -1) subArr.push(item.subCategory);
    });

    res.status(200).json({
      productArray: markFavorites(result, favoritesArray),
      categories: catArr,
      subCategories: subArr,
      totalCount,
      page,
      totalPages: Math.ceil(totalCount / limit),
    });
  } catch (err) {
    logger.error(err);
    res.status(500).json({ message: 'Error occurred while searching products' });
  }
};
