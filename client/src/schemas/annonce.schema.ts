import { z } from 'zod';

export const listingSchema = z.object({
  title: z.string().min(1, 'Tittel er påkrevd').max(200, 'Tittel kan maks være 200 tegn'),
  price: z.string().min(1, 'Pris er påkrevd').refine(v => !isNaN(Number(v)) && Number(v) >= 0, 'Pris må være 0 eller høyere'),
  pricePeriod: z.string().min(1, 'Velg en prisperiode'),
  category: z.string().min(1, 'Velg en kategori'),
  subCategory: z.string().min(1, 'Velg en underkategori'),
  subSubCategory: z.string().min(1, 'Velg en type'),
  description: z.string().min(1, 'Beskrivelse er påkrevd').max(5000, 'Beskrivelse kan maks være 5000 tegn'),
  status: z.enum(['nytt', 'brukt'], { message: 'Velg status' }),
  postnumber: z.string().regex(/^\d{4}$/, 'Skriv inn et gyldig postnummer'),
});

export type ListingInput = z.infer<typeof listingSchema>;
