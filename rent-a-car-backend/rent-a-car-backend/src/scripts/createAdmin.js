import 'dotenv/config';
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import User from '../models/User.js';

async function createAdmin() {
  const { MONGODB_URI, ADMIN_NAME, ADMIN_EMAIL, ADMIN_PASSWORD } = process.env;
  if (!MONGODB_URI || !ADMIN_NAME || !ADMIN_EMAIL || !ADMIN_PASSWORD) {
    throw new Error('Set MONGODB_URI, ADMIN_NAME, ADMIN_EMAIL and ADMIN_PASSWORD in .env before running this script.');
  }
  if (ADMIN_PASSWORD.length < 12) {
    throw new Error('ADMIN_PASSWORD must be at least 12 characters long.');
  }

  await mongoose.connect(MONGODB_URI);
  const email = ADMIN_EMAIL.toLowerCase().trim();
  let user = await User.findOne({ email }).select('+password');

  if (user) {
    user.role = 'admin';
    user.name = ADMIN_NAME;
    user.password = await bcrypt.hash(ADMIN_PASSWORD, 12);
    await user.save();
    console.log(`Existing account ${email} was promoted to admin and its password was reset.`);
  } else {
    const password = await bcrypt.hash(ADMIN_PASSWORD, 12);
    await User.create({ name: ADMIN_NAME, email, password, role: 'admin' });
    console.log(`Admin account ${email} created successfully.`);
  }
}

createAdmin()
  .catch(error => {
    console.error('Could not create admin:', error.message);
    process.exitCode = 1;
  })
  .finally(async () => {
    await mongoose.disconnect();
  });
