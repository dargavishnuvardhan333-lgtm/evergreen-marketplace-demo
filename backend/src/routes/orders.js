import { Router } from 'express';
import mongoose from 'mongoose';
import Order from '../models/Order.js';
import Product from '../models/Product.js';
import { requireAdmin, requireAuth } from '../middleware/auth.js';
import { asyncHandler, httpError } from '../middleware/errors.js';
import { isValidQuantity, validateShippingAddress } from '../utils/validators.js';

const router = Router();
const statuses = new Set(['pending', 'processing', 'shipped', 'delivered', 'cancelled']);
const allowedTransitions = {
  pending: ['processing', 'cancelled'],
  processing: ['shipped', 'cancelled'],
  shipped: ['delivered'],
  delivered: [],
  cancelled: [],
};

function validId(id) {
  if (!mongoose.isValidObjectId(id)) throw httpError(400, 'Invalid order ID.');
}

router.use(requireAuth);

router.post('/', asyncHandler(async (req, res) => {
  const { items, shippingAddress } = req.body || {};
  const addressErrors = validateShippingAddress(shippingAddress);
  if (addressErrors.length) throw httpError(400, addressErrors.join(' '));
  if (!Array.isArray(items) || items.length < 1 || items.length > 30) {
    throw httpError(400, 'An order must contain between 1 and 30 product lines.');
  }

  const quantities = new Map();
  for (const item of items) {
    if (!item || !mongoose.isValidObjectId(item.productId) || !isValidQuantity(item.quantity)) {
      throw httpError(400, 'Each item needs a valid product ID and a quantity from 1 to 100.');
    }
    quantities.set(item.productId, (quantities.get(item.productId) || 0) + item.quantity);
  }
  if ([...quantities.values()].some((quantity) => quantity > 100)) {
    throw httpError(400, 'The total quantity per product cannot exceed 100.');
  }

  const session = await mongoose.startSession();
  let createdOrder;
  try {
    await session.withTransaction(async () => {
      const products = await Product.find({ _id: { $in: [...quantities.keys()] } }).session(session);
      if (products.length !== quantities.size) throw httpError(400, 'One or more products are unavailable.');
      const orderItems = [];
      let subtotal = 0;
      for (const product of products) {
        const quantity = quantities.get(product.id);
        if (product.stock < quantity) throw httpError(409, `${product.name} does not have enough stock.`);
        const updated = await Product.updateOne(
          { _id: product._id, stock: { $gte: quantity } },
          { $inc: { stock: -quantity } },
          { session },
        );
        if (updated.modifiedCount !== 1) throw httpError(409, `${product.name} stock changed. Please review your cart.`);
        const price = Math.round(product.price * 100) / 100;
        subtotal += price * quantity;
        orderItems.push({ product: product._id, name: product.name, price, quantity });
      }
      subtotal = Math.round(subtotal * 100) / 100;
      [createdOrder] = await Order.create([{
        user: req.user._id,
        items: orderItems,
        shippingAddress: {
          fullName: shippingAddress.fullName.trim(),
          line1: shippingAddress.line1.trim(),
          line2: shippingAddress.line2?.trim() || '',
          city: shippingAddress.city.trim(),
          postalCode: shippingAddress.postalCode.trim(),
          country: shippingAddress.country.trim(),
        },
        subtotal,
        total: subtotal,
      }], { session });
    });
  } finally {
    await session.endSession();
  }
  res.status(201).json({ order: createdOrder });
}));

router.get('/my-orders', asyncHandler(async (req, res) => {
  const orders = await Order.find({ user: req.user._id }).sort({ createdAt: -1 }).lean();
  res.json({ orders });
}));

router.get('/', requireAdmin, asyncHandler(async (_req, res) => {
  const orders = await Order.find().populate('user', 'name email').sort({ createdAt: -1 }).limit(200).lean();
  res.json({ orders });
}));

router.get('/:id', asyncHandler(async (req, res) => {
  validId(req.params.id);
  const order = await Order.findById(req.params.id).populate('user', 'name email').lean();
  if (!order) throw httpError(404, 'Order not found.');
  if (req.user.role !== 'admin' && order.user._id.toString() !== req.user.id) throw httpError(403, 'You cannot access this order.');
  res.json({ order });
}));

router.patch('/:id/status', requireAdmin, asyncHandler(async (req, res) => {
  validId(req.params.id);
  const { status } = req.body || {};
  if (!statuses.has(status)) throw httpError(400, 'Provide a valid order status.');

  const session = await mongoose.startSession();
  let order;
  try {
    await session.withTransaction(async () => {
      order = await Order.findById(req.params.id).session(session);
      if (!order) throw httpError(404, 'Order not found.');
      if (status !== order.status && !allowedTransitions[order.status].includes(status)) {
        throw httpError(409, `An order cannot move from ${order.status} to ${status}.`);
      }
      if (order.status !== 'cancelled' && status === 'cancelled') {
        for (const item of order.items) {
          await Product.updateOne({ _id: item.product }, { $inc: { stock: item.quantity } }, { session });
        }
      }
      order.status = status;
      await order.save({ session });
    });
  } finally {
    await session.endSession();
  }
  res.json({ order });
}));

export default router;
