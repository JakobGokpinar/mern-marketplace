import { z } from 'zod';

const objectId = z.string().regex(/^[a-f\d]{24}$/i, 'Invalid ID');

export const verifyEmail = z.object({
  token: z.string().uuid(),
});

export const forgotPassword = z.object({
  email: z.string().email(),
});

export const resetPassword = z.object({
  token: z.string().uuid(),
  newPassword: z.string()
    .min(6, 'Passord må være minst 6 tegn')
    .max(32, 'Passord kan maks være 32 tegn')
    .regex(/[a-zA-Z]/, 'Passord må inneholde minst én bokstav')
    .regex(/\d/, 'Passord må inneholde minst ett tall'),
});
