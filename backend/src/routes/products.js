import { Router } from 'express';
import mongoose from 'mongoose';
import Product from '../models/Product.js';
import { requireAdmin, requireAuth } from '../middleware/auth.js';
import { asyncHandler, httpError } from '../middleware/errors.js';
import { validateProductInput } from '../utils/validators.js';

const router = Router();
const allowedSorts = new Set(['newest', 'price-asc', 'price-desc', 'name']);

function validId(id) {
  if (!mongoose.isValidObjectId(id)) throw httpError(400, 'Invalid product ID.');
}

function productValues(body) {
  return {
    name: typeof body.name === 'string' ? body.name.trim() : body.name,
    description: typeof body.description === 'string' ? body.description.trim() : body.description,
    price: body.price,
    category: typeof body.category === 'string' ? body.category.trim() : body.category,
    imageUrl: typeof body.imageUrl === 'string' ? body.imageUrl.trim() : body.imageUrl,
    stock: body.stock,
  };
}

router.get('/', asyncHandler(async (req, res) => {
  const page = Math.max(1, Number.parseInt(req.query.page, 10) || 1);
  const limit = Math.min(50, Math.max(1, Number.parseInt(req.query.limit, 10) || 12));
  const filter = {};
  if (typeof req.query.category === 'string' && req.query.category.trim()) filter.category = req.query.category.trim();
  if (typeof req.query.q === 'string' && req.query.q.trim()) {
    const escaped = req.query.q.trim().slice(0, 80).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    filter.$or = [
      { name: { $regex: escaped, $options: 'i' } },
      { description: { $regex: escaped, $options: 'i' } },
      { category: { $regex: escaped, $options: 'i' } },
    ];
  }
  const sort = {
    newest: { createdAt: -1 },
    'price-asc': { price: 1 },
    'price-desc': { price: -1 },
    name: { name: 1 },
  }[allowedSorts.has(req.query.sort) ? req.query.sort : 'newest'];

  const [products, total] = await Promise.all([
    Product.find(filter).sort(sort).skip((page - 1) * limit).limit(limit).lean(),
    Product.countDocuments(filter),
  ]);
  res.json({ products, page, limit, total, pages: Math.ceil(total / limit) });
}));

router.get('/:id', asyncHandler(async (req, res) => {
  validId(req.params.id);
  const product = await Product.findById(req.params.id).lean();
  if (!product) throw httpError(404, 'Product not found.');
  res.json({ product });
}));

router.post('/', requireAuth, requireAdmin, asyncHandler(async (req, res) => {
  const values = productValues(req.body || {});
  const errors = validateProductInput(values);
  if (errors.length) throw httpError(400, errors.join(' '));
  const product = await Product.create(values);
  res.status(201).json({ product });
}));

router.put('/:id', requireAuth, requireAdmin, asyncHandler(async (req, res) => {
  validId(req.params.id);
  const values = productValues(req.body || {});
  const errors = validateProductInput(values);
  if (errors.length) throw httpError(400, errors.join(' '));
  const product = await Product.findByIdAndUpdate(req.params.id, values, { new: true, runValidators: true });
  if (!product) throw httpError(404, 'Product not found.');
  res.json({ product });
}));

router.delete('/:id', requireAuth, requireAdmin, asyncHandler(async (req, res) => {
  validId(req.params.id);
  const product = await Product.findByIdAndDelete(req.params.id);
  if (!product) throw httpError(404, 'Product not found.');
  res.json({ message: 'Product deleted.' });
}));

export default router;
