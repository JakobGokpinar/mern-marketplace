import type { Request, Response } from 'express';
import mongoose from 'mongoose';
import UserModel from '../../models/User';
import ListingModel from '../../models/Listing';
import ConversationModel from '../../models/Conversation';
import MessageModel from '../../models/Message';
import { getEnvFolder, deleteObjectsByPrefix, deleteObject, getObject, streamToBuffer } from '../../services/s3';
import { createProfileUpload } from '../../middleware/upload';
import logger from '../../config/logger';

const ObjectId = mongoose.Types.ObjectId;

// --- Fetch / Find ---

export const fetchUser = async (req: Request, res: Response) => {
  try {
    const response = await UserModel.findOne({ _id: new ObjectId((req.user as any).id) });
    return res.status(200).json({ user: response });
  } catch (error) {
    return res.status(500).json({ message: 'Error occured while fetching user' });
  }
};

export const findUser = async (req: Request, res: Response) => {
  try {
    const response = await UserModel.findOne({ _id: new ObjectId(req.query.userId as string) });
    return res.status(200).json({ user: response });
  } catch (error) {
    logger.error(error);
    return res.status(500).json({ message: 'Error finding user' });
  }
};

export const findSeller = async (req: Request, res: Response) => {
  try {
    const response = await UserModel.findOne({ _id: new ObjectId(req.query.sellerId as string) })
      .select('username profilePicture');
    return res.status(200).json({ seller: response });
  } catch (error) {
    logger.error(error);
    return res.status(500).json({ message: 'Error finding seller' });
  }
};

// --- Profile ---

export const uploadImageToAws = (req: Request, res: Response) => {
  const user = req.user as any;
  const keyPrefix = getEnvFolder() + '/' + user.email;
  const userId = user._id;
  const upload = createProfileUpload(keyPrefix);

  upload(req as any, res as any, async (err: any) => {
    if (err) return res.status(400).json({ message: 'Kunne ikke laste opp bildet' });
    try {
      const result = await UserModel.findByIdAndUpdate(
        { _id: new ObjectId(userId) },
        { profilePicture: (req as any).file.location },
        { new: true }
      );
      res.json({ user: result, message: 'profile picture uploaded' });
    } catch (error) {
      logger.error(error);
      res.status(500).json({ message: 'Could not update profile picture' });
    }
  });
};

export const removeProfileImage = async (req: Request, res: Response) => {
  const user = req.user as any;
  const userId = user._id;
  const imageKey = getEnvFolder() + '/' + user.email + '/profilePicture.jpeg';

  try { await deleteObject(imageKey); } catch (err) { logger.error(err); }

  try {
    const result = await UserModel.findByIdAndUpdate({ _id: new ObjectId(userId) }, {
      $unset: { profilePicture: '' }
    }, { new: true });
    return res.json({ user: result, message: 'User updated' });
  } catch (error) {
    logger.error(error);
    return res.status(500).json({ message: 'Error updating profile' });
  }
};

export const updateUserInfoHandler = async (req: Request, res: Response) => {
  const { name, lastname } = req.body;
  const userId = (req.user as any)._id;
  const username = name + ' ' + lastname;

  try {
    const result = await UserModel.findByIdAndUpdate({ _id: new ObjectId(userId) }, {
      $set: { name, lastname, username }
    }, { new: true });
    return res.json({ user: result, message: 'User updated' });
  } catch (error) {
    logger.error(error);
    return res.status(500).json({ message: 'Error updating user info' });
  }
};

export const getProfileImage = async (req: Request, res: Response) => {
  const user = req.user as any;
  const imageKey = getEnvFolder() + '/' + user.email + '/profilePicture.jpeg';

  try {
    const data = await getObject(imageKey);
    const buffer = await streamToBuffer(data.Body);
    res.writeHead(200, { 'Content-Type': 'image/jpeg' });
    res.write(buffer, 'binary');
    res.end(null, 'binary');
  } catch (err) {
    try {
      const fallbackData = await getObject(getEnvFolder() + '/' + user.email + '/defaultProfileImage.png');
      const buffer = await streamToBuffer(fallbackData.Body);
      res.writeHead(200, { 'Content-Type': 'image/png' });
      res.write(buffer, 'binary');
      res.end(null, 'binary');
    } catch (fallbackErr) {
      return res.status(404).json({ message: 'No profile image found' });
    }
  }
};

export const deleteAccount = async (req: Request, res: Response) => {
  const user = req.user as any;
  const userId = user._id;
  const email = user.email;

  try {
    const userListings = await ListingModel.find({ sellerId: new ObjectId(userId) });
    const listingIds = userListings.map(a => a._id);

    for (const listing of userListings) {
      try {
        await deleteObjectsByPrefix(getEnvFolder() + '/' + email + '/listing-' + listing._id + '/');
      } catch (err) { /* continue */ }
    }

    await ListingModel.deleteMany({ sellerId: new ObjectId(userId) });

    const conversations = await ConversationModel.find({ $or: [{ buyer: new ObjectId(userId) }, { seller: new ObjectId(userId) }] });
    const conversationIds = conversations.map(c => c._id);
    if (conversationIds.length > 0) {
      await MessageModel.deleteMany({ conversationId: { $in: conversationIds } });
    }
    await ConversationModel.deleteMany({ $or: [{ buyer: new ObjectId(userId) }, { seller: new ObjectId(userId) }] });

    if (listingIds.length > 0) {
      await UserModel.updateMany({}, { $pull: { favorites: { $in: listingIds } } });
    }

    try { await deleteObject(getEnvFolder() + '/' + email + '/profilePicture.jpeg'); } catch (err) { /* continue */ }

    await UserModel.deleteOne({ _id: new ObjectId(userId) });

    req.logout(function (err: any) {
      if (err) return res.status(500).json({ message: 'Kunne ikke logge ut' });
      return res.status(200).json({ message: 'Account deleted' });
    });
  } catch (error) {
    logger.error(error);
    return res.status(500).json({ message: 'Kunne ikke slette kontoen' });
  }
};

// --- Favorites ---

export const addToFavorites = async (req: Request, res: Response) => {
  const userId = (req.user as any).id;
  const listingId = req.body.id;

  try {
    const listing = await ListingModel.findOne({ _id: new ObjectId(listingId) });
    if (!listing) return res.json({ message: 'Listing not found' });
    if (listing.sellerId!.toString() === userId.toString()) {
      return res.json({ message: 'Du kan ikke favorisere din egen annonse' });
    }

    const user = await UserModel.findOne({ _id: new ObjectId(userId) });
    const alreadyFavorited = user!.favorites.some((fav: any) => fav.toString() === listingId.toString());
    if (alreadyFavorited) return res.json({ message: 'The listing is already saved to Favorites' });

    const result = await UserModel.findByIdAndUpdate(
      { _id: userId },
      { $push: { favorites: listing._id } },
      { new: true }
    );
    return res.status(200).json({ user: result, message: 'Listing saved to Favorites' });
  } catch (error) {
    logger.error(error);
    return res.status(500).json({ message: 'Listing could not be saved to Favorites' });
  }
};

export const removeFromFavorites = async (req: Request, res: Response) => {
  const userId = (req.user as any).id;
  const listingId = req.body.id;
  if (!listingId) return res.json({ message: 'Please select a valid listing' });

  try {
    const result = await UserModel.findByIdAndUpdate(
      { _id: new ObjectId(userId) },
      { $pull: { favorites: new ObjectId(listingId) } },
      { new: true }
    );
    return res.json({ user: result, message: 'Listing removed from favorites' });
  } catch (error) {
    logger.error(error);
    return res.status(500).json({ message: 'Error removing favorite' });
  }
};

export const getFavorites = async (req: Request, res: Response) => {
  const userId = (req.user as any).id;

  try {
    const user = await UserModel.findOne({ _id: new ObjectId(userId) });
    const favoritesArray = user!.favorites;
    if (!favoritesArray || favoritesArray.length <= 0) {
      return res.json({ productArray: [] });
    }

    const productArray = await ListingModel.find({ _id: { $in: favoritesArray } }).lean();
    for (const item of productArray) {
      (item as any).isFavorite = true;
    }
    return res.json({ productArray, message: 'Items fetched' });
  } catch (error) {
    logger.error(error);
    return res.status(500).json({ message: 'Error occurred while fetching favorites' });
  }
};
