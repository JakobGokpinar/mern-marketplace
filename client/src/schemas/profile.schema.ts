import { z } from 'zod';

export const profileSchema = z.object({
  name: z.string().min(1, 'Navn er påkrevd').max(100),
  lastname: z.string().min(1, 'Etternavn er påkrevd').max(100),
});

export type ProfileInput = z.infer<typeof profileSchema>;
