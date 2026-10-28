import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import { asyncHandler, httpError } from './errors.js';

export const requireAuth = asyncHandler(async (req, _res, next) => {
  const header = req.get('authorization') || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : '';
  if (!token) throw httpError(401, 'Authentication required.');

  let payload;
  try {
    payload = jwt.verify(token, process.env.JWT_SECRET);
  } catch {
    throw httpError(401, 'Your session is invalid or has expired. Please sign in again.');
  }
  if (!payload.sub) throw httpError(401, 'Your session is invalid. Please sign in again.');

  const user = await User.findById(payload.sub).select('_id name email role');
  if (!user) throw httpError(401, 'Your account is no longer available.');
  req.user = user;
  next();
});

export function requireAdmin(req, _res, next) {
  if (req.user?.role !== 'admin') return next(httpError(403, 'Administrator access required.'));
  next();
}
