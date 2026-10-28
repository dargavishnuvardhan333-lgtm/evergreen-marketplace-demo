import 'dotenv/config';
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import User from '../models/User.js';
import { connectDatabase } from '../config/db.js';
import { isValidEmail } from '../utils/validators.js';

try {
  const { ADMIN_NAME, ADMIN_EMAIL, ADMIN_PASSWORD } = process.env;
  if (!ADMIN_NAME || !isValidEmail(ADMIN_EMAIL) || !ADMIN_PASSWORD || ADMIN_PASSWORD.length < 12) {
    throw new Error('Set ADMIN_NAME, a valid ADMIN_EMAIL, and an ADMIN_PASSWORD of at least 12 characters in backend/.env.');
  }
  await connectDatabase();
  if (await User.exists({ role: 'admin' })) {
    throw new Error('An administrator already exists. Admin setup is disabled after the first account.');
  }
  await User.create({
    name: ADMIN_NAME.trim(),
    email: ADMIN_EMAIL.trim().toLowerCase(),
    passwordHash: await bcrypt.hash(ADMIN_PASSWORD, 12),
    role: 'admin',
  });
  console.log(`Administrator created for ${ADMIN_EMAIL.trim().toLowerCase()}.`);
} catch (error) {
  console.error(`Admin setup failed: ${error.message}`);
  process.exitCode = 1;
} finally {
  await mongoose.disconnect();
}
