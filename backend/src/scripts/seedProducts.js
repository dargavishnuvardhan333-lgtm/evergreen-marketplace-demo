import 'dotenv/config';
import mongoose from 'mongoose';
import Product from '../models/Product.js';
import { connectDatabase } from '../config/db.js';

const products = [
  { name: 'Everyday Ceramic Mug', description: 'A hand-finished stoneware mug for your morning ritual.', price: 24, category: 'Home', stock: 40 },
  { name: 'Canvas Market Tote', description: 'A sturdy, reusable cotton canvas carryall.', price: 32, category: 'Accessories', stock: 35 },
  { name: 'Soft Knit Throw', description: 'A cozy, textured layer made for slow evenings.', price: 88, category: 'Home', stock: 18 },
  { name: 'Field Notes Set', description: 'Three thoughtfully made notebooks for ideas on the go.', price: 18, category: 'Stationery', stock: 60 },
];

try {
  await connectDatabase();
  for (const product of products) {
    await Product.updateOne({ name: product.name }, { $setOnInsert: product }, { upsert: true });
  }
  console.log(`Seeded ${products.length} demo products (existing products were preserved).`);
} catch (error) {
  console.error(`Product seeding failed: ${error.message}`);
  process.exitCode = 1;
} finally {
  await mongoose.disconnect();
}
