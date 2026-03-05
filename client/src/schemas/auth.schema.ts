import { z } from 'zod';

export const loginSchema = z.object({
  email: z.string().email('Ugyldig e-postadresse'),
  password: z.string().min(1, 'Passord er påkrevd'),
});

export const registerSchema = z.object({
  name: z.string().min(1, 'Navn er påkrevd').max(100),
  lastname: z.string().min(1, 'Etternavn er påkrevd').max(100),
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
