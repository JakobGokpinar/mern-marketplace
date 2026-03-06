/**
 * Cleanup script: Delete listings created before 2026-01-01
 *
 * Usage:
 *   tsx server/scripts/cleanup-old-listings.ts          # dry-run (shows what would be deleted)
 *   tsx server/scripts/cleanup-old-listings.ts --execute # actually deletes
 */

import { S3Client, ListObjectsV2Command, DeleteObjectsCommand } from '@aws-sdk/client-s3';
import mongoose from 'mongoose';
import path from 'path';
import 'dotenv/config';

// dotenv loads from cwd; ensure .env is found
import { config } from 'dotenv';
config({ path: path.join(__dirname, '..', '.env') });

import ListingModel from '../models/Listing';
import UserModel from '../models/User';
import ConversationModel from '../models/Conversation';
import MessageModel from '../models/Message';

const ObjectId = mongoose.Types.ObjectId;

const s3 = new S3Client({
  credentials: {
    accessKeyId: process.env.S3_ACCESS_KEY!,
    secretAccessKey: process.env.S3_SECRET_ACCESS_KEY!,
  },
  region: process.env.S3_BUCKET_REGION,
});
const BUCKET_NAME = process.env.S3_BUCKET_NAME!;

const CUTOFF_DATE = new Date('2026-01-01');
const DRY_RUN = !process.argv.includes('--execute');

async function deleteS3Images(prefix: string) {
  const listed = await s3.send(new ListObjectsV2Command({ Bucket: BUCKET_NAME, Prefix: prefix }));
  const files = listed.Contents || [];
  if (files.length === 0) return 0;

  if (!DRY_RUN) {
    await s3.send(new DeleteObjectsCommand({
      Bucket: BUCKET_NAME,
      Delete: { Objects: files.map(f => ({ Key: f.Key })) },
    }));
  }
  return files.length;
}

async function run() {
  console.log(DRY_RUN ? '\n=== DRY RUN (pass --execute to actually delete) ===\n' : '\n=== EXECUTING DELETION ===\n');

  const mongoUrl = process.env.MONGODB_PROD;
  if (!mongoUrl) {
    console.error('MONGODB_PROD not set in .env');
    process.exit(1);
  }
  await mongoose.connect(mongoUrl);
  console.log('Connected to production database.\n');

  const oldListings = await ListingModel.find({ createdAt: { $lt: CUTOFF_DATE } });
  console.log(`Found ${oldListings.length} listing(s) older than ${CUTOFF_DATE.toISOString().slice(0, 10)}.\n`);

  if (oldListings.length === 0) {
    console.log('Nothing to delete.');
    await mongoose.disconnect();
    return;
  }

  let totalImages = 0;
  let totalConversations = 0;
  let totalFavoritesCleanups = 0;

  for (const listing of oldListings) {
    const listingId = listing._id!.toString();
    const title = listing.title || '(no title)';
    const date = (listing as any).createdAt ? (listing as any).createdAt.toISOString().slice(0, 10) : 'unknown';

    let sellerEmail: string | null = null;
    if (listing.sellerId) {
      const seller = await UserModel.findOne({ _id: listing.sellerId });
      sellerEmail = seller?.email || null;
    }

    console.log(`--- ${title} (ID: ${listingId}, date: ${date})`);

    if (sellerEmail) {
      const prefix = `prod/${sellerEmail}/listing-${listingId}/`;
      const imageCount = await deleteS3Images(prefix);
      totalImages += imageCount;
      console.log(`  S3: ${imageCount} file(s) ${DRY_RUN ? 'would be deleted' : 'deleted'} (${prefix})`);
    } else {
      console.log('  S3: skipped (seller not found)');
    }

    if (!DRY_RUN) {
      await ListingModel.deleteOne({ _id: new ObjectId(listingId) });
    }
    console.log(`  DB: listing ${DRY_RUN ? 'would be deleted' : 'deleted'}`);

    if (!DRY_RUN) {
      const favResult = await UserModel.updateMany(
        { favorites: new ObjectId(listingId) },
        { $pull: { favorites: new ObjectId(listingId) } }
      );
      totalFavoritesCleanups += favResult.modifiedCount || 0;
    } else {
      const affectedUsers = await UserModel.countDocuments({ favorites: new ObjectId(listingId) });
      totalFavoritesCleanups += affectedUsers;
    }
    console.log(`  Favorites: ${DRY_RUN ? 'would be cleaned' : 'cleaned'}`);

    const conversations = await ConversationModel.find({ productId: new ObjectId(listingId) });
    const convCount = conversations.length;
    if (!DRY_RUN && convCount > 0) {
      const convIds = conversations.map(c => c._id);
      await MessageModel.deleteMany({ conversationId: { $in: convIds } });
      await ConversationModel.deleteMany({ productId: new ObjectId(listingId) });
    }
    totalConversations += convCount;
    console.log(`  Conversations: ${convCount} ${DRY_RUN ? 'would be deleted' : 'deleted'}`);

    console.log('');
  }

  console.log('=== Summary ===');
  console.log(`Listings:      ${oldListings.length} ${DRY_RUN ? 'to delete' : 'deleted'}`);
  console.log(`S3 files:      ${totalImages} ${DRY_RUN ? 'to delete' : 'deleted'}`);
  console.log(`Conversations: ${totalConversations} ${DRY_RUN ? 'to delete' : 'deleted'}`);
  console.log(`Favorites:     ${totalFavoritesCleanups} user(s) ${DRY_RUN ? 'to clean' : 'cleaned'}`);

  await mongoose.disconnect();
  console.log('\nDone.');
}

run().catch(err => {
  console.error('Script failed:', err);
  mongoose.disconnect();
  process.exit(1);
});
