const { z } = require('zod');

const updateUserInfo = z.object({
  name: z.string().min(1).max(100),
  lastname: z.string().min(1).max(100),
});

module.exports = { updateUserInfo };
