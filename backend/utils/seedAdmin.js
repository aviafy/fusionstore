const bcrypt = require('bcrypt');
const User = require('../models/user');

const BCRYPT_ROUNDS = 12;

async function seedAdminUser() {
  const email = process.env.ADMIN_EMAIL && String(process.env.ADMIN_EMAIL).trim().toLowerCase();
  const password = process.env.ADMIN_PASSWORD;
  if (!email || !password) {
    return { skipped: true, reason: 'ADMIN_EMAIL / ADMIN_PASSWORD not set' };
  }

  const existing = await User.findOne({ email });
  if (existing) {
    return { skipped: true, reason: 'Admin already exists' };
  }

  const passwordHash = await bcrypt.hash(password, BCRYPT_ROUNDS);
  await User.create({
    email,
    passwordHash,
    name: 'Administrator',
    role: 'admin',
  });
  return { created: true, email };
}

module.exports = { seedAdminUser };
