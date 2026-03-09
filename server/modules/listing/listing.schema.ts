import { z } from 'zod';

const objectId = z.string().regex(/^[a-f\d]{24}$/i, 'Invalid ID');

const specialProperty = z.object({
  title: z.string().min(1).max(100),
  value: z.string().min(1).max(200),
});

const imageLocation = z.object({
  location: z.string().min(1),
  description: z.string().max(500).optional(),
  name: z.string().optional(),
});

const listingProperties = z.object({
  title: z.string().min(1).max(200),
  price: z.number().min(0).max(50_000_000),
  pricePeriod: z.string().min(1),
  category: z.string().min(1),
  subCategory: z.string().min(1),
  subSubCategory: z.string().min(1),
  description: z.string().min(1).max(5000),
  status: z.enum(['nytt', 'brukt']),
  specialProperties: z.array(specialProperty).optional(),
  postnumber: z.string().regex(/^\d{4}$/, 'Invalid postnumber'),
  location: z.string().min(1, 'Location is required'),
  kommune: z.string().optional(),
});

export const uploadImagesQuery = z.object({
  listingId: objectId.optional(),
});

export const saveListing = z.object({
  listingProperties,
  imageLocations: z.array(imageLocation).min(1, 'At least one image is required'),
  listingId: objectId,
});

export const updateListing = z.object({
  images: z.array(imageLocation).min(1, 'At least one image is required'),
  listingProperties,
});
