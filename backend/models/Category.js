const mongoose = require('mongoose');

const categorySchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true, trim: true },
  slug: { type: String, required: true, unique: true },
  image: { type: String, default: 'https://placehold.co/400x300?text=Category' },
  description: { type: String, default: '' },
}, { timestamps: true });

module.exports = mongoose.model('Category', categorySchema);
