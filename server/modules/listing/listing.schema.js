const { z } = require('zod');

const objectId = z.string().regex(/^[a-f\d]{24}$/i, 'Invalid ID');

const findProductQuery = z.object({
  id: objectId,
});

const uploadImagesQuery = z.object({
  annonceid: objectId.optional(),
});

const saveAnnonce = z.object({
  annonceproperties: z.object({
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
  imagelocations: z.array(z.any()),
  annonceid: objectId,
});

const removeAnnonce = z.object({
  annonceid: objectId,
});

const removeImages = z.object({
  annonceId: objectId,
});

const updateAnnonce = z.object({
  annonceId: objectId,
  annonceImages: z.array(z.any()),
  annonceproperties: z.object({
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

module.exports = { findProductQuery, uploadImagesQuery, saveAnnonce, removeAnnonce, removeImages, updateAnnonce };
