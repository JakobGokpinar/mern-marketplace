import express from 'express';
import * as listingController from './listing.controller';
import ensureAuth from '../../middleware/ensureAuth';
import validate from '../../middleware/validate';
import { uploadImagesQuery, saveListing, updateListing } from './listing.schema';

const router = express.Router();

// Browse / search (specific paths first)
router.get('/listings/mine', ensureAuth, listingController.getUserListings);
router.post('/listings/search', listingController.findProducts);
router.get('/listings', listingController.getItems);

// CRUD
router.post('/listings/images', ensureAuth, validate(uploadImagesQuery, 'query'), listingController.uploadImagesToAws);
router.post('/listings', ensureAuth, validate(saveListing), listingController.saveListingToDatabase);
router.get('/listings/:id', listingController.findProduct);
router.put('/listings/:id', ensureAuth, validate(updateListing), listingController.updateListing);
router.delete('/listings/:id', ensureAuth, listingController.removeListing);
router.delete('/listings/:id/images', ensureAuth, listingController.removeListingImagesFromAWS);

export default router;
