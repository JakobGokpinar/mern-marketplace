import { z } from 'zod';

const objectId = z.string().regex(/^[a-f\d]{24}$/i, 'Invalid ID');

export const verifyEmail = z.object({
  userId: objectId,
  token: z.string().uuid(),
});
