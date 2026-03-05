import type { Request, Response } from 'express';
import mongoose from 'mongoose';
import ConversationModel from '../../models/Conversation';

const ObjectId = mongoose.Types.ObjectId;
const MESSAGES_PER_PAGE = 50;

export const createRoom = async (req: Request, res: Response) => {
  if (req.body.buyer !== (req.user as any).id) {
    return res.status(403).json({ message: 'Forbidden' });
  }

  const conversation = new ConversationModel({
    seller: new ObjectId(req.body.seller),
    buyer: new ObjectId(req.body.buyer),
    productId: new ObjectId(req.body.product_id),
  });
  try {
    const response = await conversation.save();
    return res.status(200).json({ message: 'Room created', response });
  } catch (error) {
    return res.status(500).json({ message: 'Could not create room' });
  }
};

export const getRooms = async (req: Request, res: Response) => {
  const userId = (req.user as any)._id;
  try {
    const response = await ConversationModel.find({
      $or: [
        { buyer: new ObjectId(userId) },
        { seller: new ObjectId(userId) },
      ],
    }).select('-messages').lean();
    return res.status(200).json(response);
  } catch (error) {
    return res.status(500).json({ message: 'Could not fetch rooms' });
  }
};

export const getMessages = async (req: Request, res: Response) => {
  const roomId = req.query.roomId as string;
  const before = req.query.before as string | undefined;
  const limit = Math.min(100, Math.max(1, parseInt(req.query.limit as string) || MESSAGES_PER_PAGE));

  try {
    const room = await ConversationModel.findById(new ObjectId(roomId)).select('messages buyer seller').lean();
    if (!room) return res.status(404).json({ message: 'Room not found' });

    const userId = (req.user as any)._id.toString();
    if ((room as any).buyer.toString() !== userId && (room as any).seller.toString() !== userId) {
      return res.status(403).json({ message: 'Forbidden' });
    }

    let messages = (room as any).messages || [];
    if (before) {
      const beforeDate = new Date(before);
      messages = messages.filter((m: any) => new Date(m.sentAt) < beforeDate);
    }

    const totalCount = messages.length;
    const sliced = messages.slice(-limit);
    const hasMore = totalCount > limit;

    return res.status(200).json({ messages: sliced, hasMore });
  } catch (error) {
    return res.status(500).json({ message: 'Could not fetch messages' });
  }
};

export const getRoomByCredentials = async (req: Request, res: Response) => {
  const buyer = req.query.buyer as string;
  const seller = req.query.seller as string;
  const productId = req.query.productId as string;
  try {
    const response = await ConversationModel.find({
      seller: new ObjectId(seller),
      buyer: new ObjectId(buyer),
      productId: new ObjectId(productId),
    });
    return res.status(200).json(response);
  } catch (error) {
    return res.status(500).json({ message: 'Could not fetch room' });
  }
};

export const newMessage = async (req: Request, res: Response) => {
  const roomId = new ObjectId(req.body.roomId);

  const room = await ConversationModel.findById(roomId);
  if (!room) return res.status(404).json({ message: 'Room not found' });
  const userId = (req.user as any)._id.toString();
  if (room.buyer!.toString() !== userId && room.seller!.toString() !== userId) {
    return res.status(403).json({ message: 'Forbidden' });
  }

  const message = {
    sender: (req.user as any)._id,
    msg: req.body.msg,
    sentAt: Date.now(),
  };
  try {
    await ConversationModel.updateOne({ _id: roomId }, {
      $push: { messages: message },
      $inc: { unreadMessages: 1 },
    });
    return res.status(200).json({ message: 'Message sent' });
  } catch (error) {
    return res.status(500).json({ message: 'Error occured while sending the message' });
  }
};

export const resetUnread = async (req: Request, res: Response) => {
  const roomId = req.body.roomId;

  const room = await ConversationModel.findById(roomId);
  if (!room) return res.status(404).json({ message: 'Room not found' });
  const userId = (req.user as any)._id.toString();
  if (room.buyer!.toString() !== userId && room.seller!.toString() !== userId) {
    return res.status(403).json({ message: 'Forbidden' });
  }

  try {
    await ConversationModel.updateOne({ _id: roomId }, {
      $set: { unreadMessages: 0 },
    });
    res.status(200).json({ message: 'Unread messages reset' });
  } catch (error) {
    return res.status(500).json({ message: 'Error occured' });
  }
};
