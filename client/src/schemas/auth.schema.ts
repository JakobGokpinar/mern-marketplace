import { z } from 'zod';

export const loginSchema = z.object({
  email: z.string().email('Ugyldig e-postadresse'),
  password: z.string().min(1, 'Passord er påkrevd'),
});

export const registerSchema = z.object({
  fullName: z.string().min(1, 'Fullt navn er påkrevd').max(200),
  email: z.string().email('Ugyldig e-postadresse'),
  password: z
    .string()
    .min(6, 'Passord må være minst 6 tegn')
    .max(32, 'Passord kan maks være 32 tegn')
    .regex(/[a-zA-Z]/, 'Passord må inneholde minst én bokstav')
    .regex(/\d/, 'Passord må inneholde minst ett tall'),
});

export type LoginInput = z.infer<typeof loginSchema>;
export type RegisterInput = z.infer<typeof registerSchema>;
