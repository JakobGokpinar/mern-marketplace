import { z } from 'zod';

const objectId = z.string().regex(/^[a-f\d]{24}$/i, 'Invalid ID');

export const findUserQuery = z.object({ id: objectId });
export const findSellerQuery = z.object({ id: objectId });
export const updateUserInfo = z.object({ fullName: z.string().min(1).max(200) });
export const changePassword = z.object({
  currentPassword: z.string().min(1),
  newPassword: z
    .string()
    .min(6, 'Passord må være minst 6 tegn')
    .max(32, 'Passord kan maks være 32 tegn')
    .regex(/[a-zA-Z]/, 'Passord må inneholde minst én bokstav')
    .regex(/\d/, 'Passord må inneholde minst ett tall'),
});
export const changeEmail = z.object({
  newEmail: z.string().email('Ugyldig e-postadresse'),
});
export const favoriteBody = z.object({ id: objectId });
