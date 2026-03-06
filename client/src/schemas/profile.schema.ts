import { z } from 'zod';

export const profileSchema = z.object({
  fullName: z.string().min(1, 'Fullt navn er påkrevd').max(200),
});

export type ProfileInput = z.infer<typeof profileSchema>;
