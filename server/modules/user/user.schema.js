const { z } = require('zod');

const objectId = z.string().regex(/^[a-f\d]{24}$/i, 'Invalid ID');

const findUserQuery = z.object({
  userId: objectId,
});

const findSellerQuery = z.object({
  sellerId: objectId,
});

const updateUserInfo = z.object({
  name: z.string().min(1).max(100),
  lastname: z.string().min(1).max(100),
});

const favoriteBody = z.object({
  id: objectId,
});

module.exports = { findUserQuery, findSellerQuery, updateUserInfo, favoriteBody };
