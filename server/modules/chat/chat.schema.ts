import { z } from 'zod';

const objectId = z.string().regex(/^[a-f\d]{24}$/i, 'Invalid ID');

export const createRoom = z.object({
  buyer: objectId,
  seller: objectId,
  product_id: objectId,
});

export const getRoomByCredentials = z.object({
  buyer: objectId,
  seller: objectId,
  productId: objectId,
});

export const newMessage = z.object({
  roomId: objectId,
  msg: z.string().min(1).max(5000),
});

export const resetUnread = z.object({
  roomId: objectId,
});

export const getMessages = z.object({
  roomId: objectId,
  before: z.string().datetime().optional(),
  limit: z.string().regex(/^\d+$/).optional(),
});
