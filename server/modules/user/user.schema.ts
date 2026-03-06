import { z } from 'zod';

const objectId = z.string().regex(/^[a-f\d]{24}$/i, 'Invalid ID');

export const findUserQuery = z.object({ userId: objectId });
export const findSellerQuery = z.object({ sellerId: objectId });
export const updateUserInfo = z.object({ fullName: z.string().min(1).max(200) });
export const favoriteBody = z.object({ id: objectId });
