/**
 * Cleanup script: Delete annonces created before 2026-01-01
 *
 * Usage:
 *   node server/scripts/cleanup-old-annonces.js          # dry-run (shows what would be deleted)
 *   node server/scripts/cleanup-old-annonces.js --execute # actually deletes
 */

const AWS = require('aws-sdk');
const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

const ObjectId = mongoose.Types.ObjectId;

// Models (reuse existing)
const AnnonceModel = require('../models/AnnonceModel.js');
const UserModel = require('../models/UserModel.js');
const ConversationModel = require('../models/ConversationModel.js');

// S3 config (same as createAnnonce.js)
const s3 = new AWS.S3({
  accessKeyId: process.env.AWS_ACCESS_KEY,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  region: process.env.AWS_BUCKET_REGION,
});
const BUCKET_NAME = process.env.AWS_BUCKET_NAME;

const CUTOFF_DATE = new Date('2026-01-01');
const DRY_RUN = !process.argv.includes('--execute');

async function deleteS3Images(prefix) {
  const listed = await s3.listObjectsV2({ Bucket: BUCKET_NAME, Prefix: prefix }).promise();
  const files = listed.Contents || [];
  if (files.length === 0) return 0;

  const deleteParams = {
    Bucket: BUCKET_NAME,
    Delete: { Objects: files.map(f => ({ Key: f.Key })) },
  };

  if (!DRY_RUN) {
    await s3.deleteObjects(deleteParams).promise();
  }
  return files.length;
}

async function run() {
  console.log(DRY_RUN ? '\n=== DRY RUN (pass --execute to actually delete) ===\n' : '\n=== EXECUTING DELETION ===\n');

  // Connect to MongoDB
  const mongoUrl = process.env.MONGO_URL_PROD;
  if (!mongoUrl) {
    console.error('MONGO_URL_PROD not set in .env');
    process.exit(1);
  }
  await mongoose.connect(mongoUrl, { useNewUrlParser: true, useUnifiedTopology: true });
  console.log('Connected to production database.\n');

  // Find old annonces
  const oldAnnonces = await AnnonceModel.find({ date: { $lt: CUTOFF_DATE } });
  console.log(`Found ${oldAnnonces.length} annonce(s) older than ${CUTOFF_DATE.toISOString().slice(0, 10)}.\n`);

  if (oldAnnonces.length === 0) {
    console.log('Nothing to delete.');
    await mongoose.disconnect();
    return;
  }

  let totalImages = 0;
  let totalConversations = 0;
  let totalFavoritesCleanups = 0;

  for (const annonce of oldAnnonces) {
    const annonceId = annonce._id.toString();
    const title = annonce.title || '(no title)';
    const date = annonce.date ? annonce.date.toISOString().slice(0, 10) : 'unknown';

    // Look up seller email for S3 path
    let sellerEmail = null;
    if (annonce.sellerId) {
      const seller = await UserModel.findOne({ _id: annonce.sellerId });
      sellerEmail = seller?.email;
    }

    console.log(`--- ${title} (ID: ${annonceId}, date: ${date})`);

    // 1. Delete S3 images
    if (sellerEmail) {
      const prefix = `${sellerEmail}/annonce-${annonceId}/`;
      const imageCount = await deleteS3Images(prefix);
      totalImages += imageCount;
      console.log(`  S3: ${imageCount} file(s) ${DRY_RUN ? 'would be deleted' : 'deleted'} (${prefix})`);
    } else {
      console.log('  S3: skipped (seller not found)');
    }

    // 2. Delete annonce from AnnonceModel
    if (!DRY_RUN) {
      await AnnonceModel.deleteOne({ _id: new ObjectId(annonceId) });
    }
    console.log(`  DB: annonce ${DRY_RUN ? 'would be deleted' : 'deleted'}`);

    // 3. Remove from seller's annonces array
    if (annonce.sellerId && !DRY_RUN) {
      await UserModel.updateOne(
        { _id: annonce.sellerId },
        { $pull: { annonces: { _id: new ObjectId(annonceId) } } }
      );
    }
    console.log(`  User.annonces: ${DRY_RUN ? 'would be cleaned' : 'cleaned'}`);

    // 4. Remove from ALL users' favorites
    if (!DRY_RUN) {
      const favResult = await UserModel.updateMany(
        { favorites: new ObjectId(annonceId) },
        { $pull: { favorites: new ObjectId(annonceId) } }
      );
      totalFavoritesCleanups += favResult.modifiedCount || 0;
    } else {
      const affectedUsers = await UserModel.countDocuments({ favorites: new ObjectId(annonceId) });
      totalFavoritesCleanups += affectedUsers;
    }
    console.log(`  Favorites: ${DRY_RUN ? 'would be cleaned' : 'cleaned'}`);

    // 5. Delete related conversations
    const convCount = await ConversationModel.countDocuments({ productId: new ObjectId(annonceId) });
    if (!DRY_RUN && convCount > 0) {
      await ConversationModel.deleteMany({ productId: new ObjectId(annonceId) });
    }
    totalConversations += convCount;
    console.log(`  Conversations: ${convCount} ${DRY_RUN ? 'would be deleted' : 'deleted'}`);

    console.log('');
  }

  console.log('=== Summary ===');
  console.log(`Annonces:      ${oldAnnonces.length} ${DRY_RUN ? 'to delete' : 'deleted'}`);
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
