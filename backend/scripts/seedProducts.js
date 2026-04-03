/**
 * Seed the Product collection from backend/data/products.json.
 *
 * Usage (from repo root, with .env loaded):
 *   node backend/scripts/seedProducts.js
 *   node backend/scripts/seedProducts.js --force   # remove all products, then insert from JSON
 *
 * Image paths in JSON are served by the API at /images/... when files exist under backend/public/images.
 * Run `npm run download-images` first if those files are missing locally.
 */

const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../../.env') });

const Product = require('../models/product');
const { connectDB, disconnectDB, getMongoUri } = require('../config/database');
const { loadProductsFromJson } = require('../utils/seedDatabase');

async function main() {
  const force = process.argv.includes('--force');
  const uri = getMongoUri();

  await connectDB(uri);
  console.log('Connected:', uri.replace(/\/\/([^@]+)@/, '//***@'));

  const before = await Product.countDocuments();

  if (force) {
    const { deletedCount } = await Product.deleteMany({});
    console.log(`Removed ${deletedCount} existing product(s).`);
  } else if (before > 0) {
    console.log(`Products collection already has ${before} document(s). Use --force to replace.`);
    await disconnectDB();
    process.exit(0);
  }

  const docs = loadProductsFromJson();
  if (!docs.length) {
    console.error('No products in backend/data/products.json. Nothing to insert.');
    await disconnectDB();
    process.exit(1);
  }

  await Product.insertMany(docs, { ordered: false });
  const after = await Product.countDocuments();
  console.log(`Inserted ${docs.length} product(s) from JSON. Collection count: ${after}.`);

  await disconnectDB();
  process.exit(0);
}

main().catch(err => {
  console.error(err);
  disconnectDB().finally(() => process.exit(1));
});
