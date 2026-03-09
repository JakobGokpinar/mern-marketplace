/**
 * remove-users — Delete specific user accounts and all their data from PRODUCTION.
 *
 * What it does:
 *   Given one or more email addresses, removes each user and everything
 *   they own: listings, S3 images, conversations, messages, favorites
 *   references from other users, and profile pictures. Same cleanup as
 *   the in-app "Slett konto" flow, but without needing to log in.
 *
 * Usage:
 *   npm run db:remove-users                                      # list all users (no deletion)
 *   npm run db:remove-users -- --users user@example.com          # dry-run for a specific user
 *   npm run db:remove-users -- --users a@x.com b@x.com          # dry-run for multiple users
 *   npm run db:remove-users -- --users user@example.com --execute  # actually delete
 *
 * Requires:
 *   MONGODB_PROD     — production MongoDB connection string (from server/.env)
 *   S3_BUCKET_NAME   — AWS S3 bucket name
 *   S3_ACCESS_KEY    — AWS access key
 *   S3_SECRET_ACCESS_KEY — AWS secret key
 *   S3_BUCKET_REGION — AWS region
 */

import { S3Client, ListObjectsV2Command, DeleteObjectsCommand, DeleteObjectCommand } from '@aws-sdk/client-s3';
import mongoose from 'mongoose';
import path from 'path';
import { config } from 'dotenv';
config({ path: path.join(__dirname, '..', '.env') });

import UserModel from '../models/User';
import ListingModel from '../models/Listing';
import ConversationModel from '../models/Conversation';
import MessageModel from '../models/Message';

const ObjectId = mongoose.Types.ObjectId;
const DRY_RUN = !process.argv.includes('--execute');

const s3 = new S3Client({
  credentials: {
    accessKeyId: process.env.S3_ACCESS_KEY!,
    secretAccessKey: process.env.S3_SECRET_ACCESS_KEY!,
  },
  region: process.env.S3_BUCKET_REGION,
});
const BUCKET_NAME = process.env.S3_BUCKET_NAME!;

async function deleteS3Prefix(prefix: string): Promise<number> {
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

async function deleteS3Object(url: string): Promise<boolean> {
  try {
    const u = new URL(url);
    const key = u.pathname.startsWith('/') ? u.pathname.slice(1) : u.pathname;
    if (!DRY_RUN) {
      await s3.send(new DeleteObjectCommand({ Bucket: BUCKET_NAME, Key: key }));
    }
    return true;
  } catch {
    return false;
  }
}

async function removeUser(user: any) {
  const userId = user._id.toString();
  const email = user.email;
  console.log(`\n--- ${user.fullName} <${email}> (ID: ${userId})`);

  // 1. Delete user's listings + S3 images
  const listings = await ListingModel.find({ sellerId: new ObjectId(userId) });
  console.log(`  Listings: ${listings.length}`);

  let totalS3Files = 0;
  for (const listing of listings) {
    const prefix = `prod/${email}/listing-${listing._id}/`;
    const count = await deleteS3Prefix(prefix);
    totalS3Files += count;
    console.log(`    "${listing.title}" — ${count} S3 file(s)`);
  }

  if (!DRY_RUN && listings.length > 0) {
    await ListingModel.deleteMany({ sellerId: new ObjectId(userId) });
  }

  // 2. Clean up favorites referencing this user's listings
  const listingIds = listings.map(l => l._id);
  if (listingIds.length > 0) {
    if (!DRY_RUN) {
      await UserModel.updateMany({}, { $pull: { favorites: { $in: listingIds } } });
    }
    console.log(`  Favorites: cleaned from other users`);
  }

  // 3. Delete conversations + messages
  const conversations = await ConversationModel.find({
    $or: [{ buyer: new ObjectId(userId) }, { seller: new ObjectId(userId) }],
  });
  if (conversations.length > 0) {
    const convIds = conversations.map(c => c._id);
    if (!DRY_RUN) {
      await MessageModel.deleteMany({ conversationId: { $in: convIds } });
      await ConversationModel.deleteMany({ _id: { $in: convIds } });
    }
    console.log(`  Conversations: ${conversations.length}, messages deleted`);
  }

  // 4. Delete profile picture from S3
  if (user.profilePicture) {
    await deleteS3Object(user.profilePicture);
    console.log(`  Profile picture: ${DRY_RUN ? 'would be deleted' : 'deleted'}`);
  }

  // 5. Delete user record
  if (!DRY_RUN) {
    await UserModel.deleteOne({ _id: new ObjectId(userId) });
  }
  console.log(`  User record: ${DRY_RUN ? 'would be deleted' : 'deleted'}`);
  console.log(`  S3 total: ${totalS3Files} file(s) ${DRY_RUN ? 'to delete' : 'deleted'}`);
}

async function run() {
  const mongoUrl = process.env.MONGODB_PROD;
  if (!mongoUrl) {
    console.error('MONGODB_PROD not set in .env');
    process.exit(1);
  }
  await mongoose.connect(mongoUrl);
  console.log('Connected to production database.');

  const usersIdx = process.argv.indexOf('--users');

  // No --users flag: list all users
  if (usersIdx === -1) {
    const users = await UserModel.find().select('fullName email createdAt').sort({ createdAt: -1 });
    console.log(`\n${users.length} user(s):\n`);
    for (const u of users) {
      const date = (u as any).createdAt?.toISOString().slice(0, 10) || '?';
      const listingCount = await ListingModel.countDocuments({ sellerId: u._id });
      console.log(`  ${u.email.padEnd(35)} ${u.fullName.padEnd(25)} ${date}  ${listingCount} listing(s)`);
    }
    console.log('\nTo delete, run: npm run db:remove-users -- --users <email1> <email2> [--execute]');
    await mongoose.disconnect();
    return;
  }

  // Collect emails after --users (stop at next flag)
  const emails: string[] = [];
  for (let i = usersIdx + 1; i < process.argv.length; i++) {
    if (process.argv[i].startsWith('--')) break;
    emails.push(process.argv[i]);
  }

  if (emails.length === 0) {
    console.error('No emails provided after --users');
    process.exit(1);
  }

  console.log(DRY_RUN ? '\n=== DRY RUN (pass --execute to actually delete) ===' : '\n=== EXECUTING DELETION ===');

  const users = await UserModel.find({ email: { $in: emails } });
  const foundEmails = users.map(u => u.email);
  const notFound = emails.filter(e => !foundEmails.includes(e));
  if (notFound.length > 0) {
    console.warn(`\nNot found: ${notFound.join(', ')}`);
  }

  for (const user of users) {
    await removeUser(user);
  }

  console.log(`\n=== ${DRY_RUN ? 'Would delete' : 'Deleted'} ${users.length} user(s) ===`);
  await mongoose.disconnect();
  console.log('Done.');
}

run().catch(err => {
  console.error('Script failed:', err);
  mongoose.disconnect();
  process.exit(1);
});
