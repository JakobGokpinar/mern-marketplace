import { z } from 'zod';

const objectId = z.string().regex(/^[a-f\d]{24}$/i, 'Invalid ID');

export const uploadImagesQuery = z.object({
  listingId: objectId.optional(),
});

export const saveListing = z.object({
  listingProperties: z.object({
    title: z.string().min(1).max(200),
    price: z.number().min(0),
    pricePeriod: z.string().optional(),
    category: z.string().min(1),
    subCategory: z.string().optional(),
    description: z.string().max(5000).optional(),
    status: z.string().optional(),
    specialProperties: z.array(z.any()).optional(),
    fylke: z.string().optional(),
    kommune: z.string().optional(),
    location: z.string().optional(),
    postnumber: z.string().optional(),
  }),
  imageLocations: z.array(z.any()),
  listingId: objectId,
});

export const updateListing = z.object({
  images: z.array(z.any()),
  listingProperties: z.object({
    title: z.string().min(1).max(200),
    price: z.number().min(0),
    pricePeriod: z.string().optional(),
    category: z.string().min(1),
    subCategory: z.string().optional(),
    description: z.string().max(5000).optional(),
    status: z.string().optional(),
    specialProperties: z.array(z.any()).optional(),
    fylke: z.string().optional(),
    kommune: z.string().optional(),
    location: z.string().optional(),
    postnumber: z.string().optional(),
  }),
});
