import express from 'express';
import * as listingController from './listing.controller';
import ensureAuth from '../../middleware/ensureAuth';
import validate from '../../middleware/validate';
import { findProductQuery, uploadImagesQuery, saveListing, removeListing, removeImages, updateListing } from './listing.schema';

const router = express.Router();

// CRUD
router.post('/listing/imageupload', ensureAuth, validate(uploadImagesQuery, 'query'), listingController.uploadImagesToAws);
router.post('/listing/create', ensureAuth, validate(saveListing), listingController.saveListingToDatabase);
router.post('/listing/remove/images', ensureAuth, validate(removeImages), listingController.removeListingImagesFromAWS);
router.post('/listing/update', ensureAuth, validate(updateListing), listingController.updateListing);
router.post('/listing/delete', ensureAuth, validate(removeListing), listingController.removeListing);

// Read
router.get('/listing', validate(findProductQuery, 'query'), listingController.findProduct);

// Search / browse
router.get('/listings', listingController.getItems);
router.get('/listings/mine', ensureAuth, listingController.getUserListings);
router.post('/listings/search', listingController.findProducts);

export default router;
