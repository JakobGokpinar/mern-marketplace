const { z } = require('zod');

const objectId = z.string().regex(/^[a-f\d]{24}$/i, 'Invalid ID');

const verifyEmail = z.object({
  userId: objectId,
  token: z.string().uuid(),
});

module.exports = { verifyEmail };
