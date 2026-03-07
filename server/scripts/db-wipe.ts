/**
 * db-wipe — Drop collections from the DEV database. Refuses to run against prod.
 *
 * Usage:
 *   npm run db:wipe                          # drop ALL collections
 *   npm run db:wipe -- users listings        # drop only these collections
 *   npm run db:wipe -- --dry-run             # show what would be dropped
 *   npm run db:wipe -- --dry-run users       # show specific collections
 */

import mongoose from 'mongoose';
import path from 'path';
import { config } from 'dotenv';
config({ path: path.join(__dirname, '..', '.env') });

const DRY_RUN = process.argv.includes('--dry-run');
const targets = process.argv.slice(2).filter(a => !a.startsWith('--'));

async function run() {
  const mongoUrl = process.env.MONGODB_DEV;
  if (!mongoUrl) {
    console.error('MONGODB_DEV not set in .env');
    process.exit(1);
  }

  if (mongoUrl.includes('/prod')) {
    console.error('Refusing to wipe — connection string points to prod.');
    process.exit(1);
  }

  await mongoose.connect(mongoUrl);
  const db = mongoose.connection.db!;
  console.log(`Connected to: ${mongoUrl}\n`);

  const collections = await db.listCollections().toArray();
  const names = collections.map(c => c.name);

  const toDrop = targets.length > 0
    ? targets.filter(t => names.includes(t))
    : names;

  if (toDrop.length === 0) {
    console.log('Nothing to drop.');
    await mongoose.disconnect();
    return;
  }

  console.log(DRY_RUN ? '=== DRY RUN ===' : '=== DROPPING ===');
  for (const name of toDrop) {
    if (DRY_RUN) {
      console.log(`  Would drop: ${name}`);
    } else {
      await db.dropCollection(name);
      console.log(`  Dropped: ${name}`);
    }
  }

  if (targets.length > 0) {
    const skipped = targets.filter(t => !names.includes(t));
    if (skipped.length > 0) {
      console.log(`\n  Skipped (not found): ${skipped.join(', ')}`);
    }
  }

  console.log(`\n${DRY_RUN ? 'Would drop' : 'Dropped'} ${toDrop.length} collection(s).`);
  await mongoose.disconnect();
}

run().catch(err => {
  console.error('Script failed:', err);
  mongoose.disconnect();
  process.exit(1);
});
