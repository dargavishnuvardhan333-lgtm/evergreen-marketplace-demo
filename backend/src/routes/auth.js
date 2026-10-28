import { Router } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import { requireAuth } from '../middleware/auth.js';
import { asyncHandler, httpError } from '../middleware/errors.js';
import { isNonEmptyString, isValidEmail } from '../utils/validators.js';

const router = Router();

function createToken(user) {
  return jwt.sign({ sub: user.id }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN || '1d' });
}

function publicUser(user) {
  return { id: user.id, name: user.name, email: user.email, role: user.role };
}

router.post('/register', asyncHandler(async (req, res) => {
  const { name, email, password } = req.body || {};
  if (!isNonEmptyString(name, 100) || !isValidEmail(email) || typeof password !== 'string' || password.length < 8 || password.length > 128) {
    throw httpError(400, 'Provide a name, valid email, and password between 8 and 128 characters.');
  }

  const normalizedEmail = email.trim().toLowerCase();
  if (await User.exists({ email: normalizedEmail })) throw httpError(409, 'An account with this email already exists.');
  const user = await User.create({
    name: name.trim(),
    email: normalizedEmail,
    passwordHash: await bcrypt.hash(password, 12),
  });
  res.status(201).json({ token: createToken(user), user: publicUser(user) });
}));

router.post('/login', asyncHandler(async (req, res) => {
  const { email, password } = req.body || {};
  if (!isValidEmail(email) || typeof password !== 'string') throw httpError(400, 'Provide a valid email and password.');

  const user = await User.findOne({ email: email.trim().toLowerCase() }).select('+passwordHash');
  if (!user || !(await bcrypt.compare(password, user.passwordHash))) throw httpError(401, 'Email or password is incorrect.');
  res.json({ token: createToken(user), user: publicUser(user) });
}));

router.get('/me', requireAuth, (req, res) => res.json({ user: publicUser(req.user) }));

export default router;
