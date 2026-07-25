const mongoose = require('mongoose');

const orderItemSchema = new mongoose.Schema({
  product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
  seller: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  name: String,
  image: String,
  price: Number,
  quantity: Number,
});

const orderSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  items: [orderItemSchema],
  shippingAddress: {
    fullName: String,
    phone: String,
    address: String,
    city: String,
    postalCode: String,
  },
  paymentMethod: { type: String, enum: ['cod', 'card'], default: 'cod' },
  itemsPrice: Number,
  shippingPrice: { type: Number, default: 0 },
  totalPrice: Number,
  isPaid: { type: Boolean, default: false },
  paidAt: Date,
  status: {
    type: String,
    enum: ['pending', 'processing', 'shipped', 'delivered', 'cancelled'],
    default: 'pending',
  },
  trackingHistory: [{
    status: String,
    note: String,
    date: { type: Date, default: Date.now },
  }],
}, { timestamps: true });

module.exports = mongoose.model('Order', orderSchema);
