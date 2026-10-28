import mongoose from 'mongoose';

const productSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true, maxlength: 120 },
  description: { type: String, required: true, trim: true, maxlength: 2000 },
  price: { type: Number, required: true, min: 0 },
  category: { type: String, required: true, trim: true, maxlength: 80, index: true },
  imageUrl: { type: String, default: '', maxlength: 2048 },
  stock: { type: Number, required: true, min: 0, validate: Number.isInteger },
}, { timestamps: true });

productSchema.index({ name: 'text', description: 'text', category: 'text' });

export default mongoose.model('Product', productSchema);
