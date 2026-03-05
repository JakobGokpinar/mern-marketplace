const { z } = require('zod');

const objectId = z.string().regex(/^[a-f\d]{24}$/i, 'Invalid ID');

const findUserQuery = z.object({
  userId: objectId,
});

const findSellerQuery = z.object({
  sellerId: objectId,
});

const findProductQuery = z.object({
  id: objectId,
});

module.exports = { findUserQuery, findSellerQuery, findProductQuery };
