const { z } = require('zod');

const objectId = z.string().regex(/^[a-f\d]{24}$/i, 'Invalid ID');

const createRoom = z.object({
  buyer: objectId,
  seller: objectId,
  product_id: objectId,
});

const getRoomByCredentials = z.object({
  buyer: objectId,
  seller: objectId,
  productId: objectId,
});

const newMessage = z.object({
  roomId: objectId,
  msg: z.string().min(1).max(5000),
});

const resetUnread = z.object({
  roomId: objectId,
});

module.exports = { createRoom, getRoomByCredentials, newMessage, resetUnread };
