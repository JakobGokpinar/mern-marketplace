const { z } = require('zod');

const objectId = z.string().regex(/^[a-f\d]{24}$/i, 'Invalid ID');

const favoriteBody = z.object({
  id: objectId,
});

module.exports = { favoriteBody };
