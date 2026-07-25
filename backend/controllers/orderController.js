const Order = require('../models/Order');
const Cart = require('../models/Cart');
const Product = require('../models/Product');
const Payment = require('../models/Payment');
const { sendEmail } = require('../utils/email');

exports.createOrder = async (req, res) => {
  try {
    const { shippingAddress, paymentMethod } = req.body;
    const cart = await Cart.findOne({ user: req.user._id }).populate('items.product');
    if (!cart || cart.items.length === 0) return res.status(400).json({ message: 'Cart is empty' });

    const items = [];
    let itemsPrice = 0;
    for (const ci of cart.items) {
      const product = ci.product;
      if (!product || product.stock < ci.quantity) {
        return res.status(400).json({ message: `${product ? product.name : 'A product'} is out of stock` });
      }
      items.push({
        product: product._id, seller: product.seller, name: product.name,
        image: (product.images && product.images[0]) || '', price: ci.price, quantity: ci.quantity,
      });
      itemsPrice += ci.price * ci.quantity;
    }

    const shippingPrice = itemsPrice > 5000 ? 0 : 150;
    const totalPrice = itemsPrice + shippingPrice;

    const order = await Order.create({
      user: req.user._id, items, shippingAddress, paymentMethod,
      itemsPrice, shippingPrice, totalPrice,
      trackingHistory: [{ status: 'pending', note: 'Order placed successfully' }],
    });

    for (const ci of cart.items) {
      await Product.findByIdAndUpdate(ci.product._id, { $inc: { stock: -ci.quantity, sold: ci.quantity } });
    }

    await Payment.create({ order: order._id, user: req.user._id, amount: totalPrice, method: paymentMethod });

    cart.items = [];
    await cart.save();

    sendEmail({
      to: req.user.email,
      subject: `Order Confirmed - MarketZone #${order._id}`,
      html: `<h3>Thank you for your order, ${req.user.name}!</h3><p>Your order total is Rs. ${totalPrice}. We'll notify you as it ships.</p>`,
    });
    sendEmail({
      to: process.env.ADMIN_EMAIL,
      subject: `New Order Received - #${order._id}`,
      html: `<p>New order placed by ${req.user.name} (${req.user.email}) worth Rs. ${totalPrice}.</p>`,
    });

    res.status(201).json(order);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getMyOrders = async (req, res) => {
  const orders = await Order.find({ user: req.user._id }).sort('-createdAt');
  res.json(orders);
};

exports.getOrder = async (req, res) => {
  const order = await Order.findById(req.params.id).populate('user', 'name email');
  if (!order) return res.status(404).json({ message: 'Order not found' });
  const isOwner = order.user._id.toString() === req.user._id.toString();
  const isSeller = order.items.some((i) => i.seller.toString() === req.user._id.toString());
  if (!isOwner && !isSeller && req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Not authorized to view this order' });
  }
  res.json(order);
};

exports.getSellerOrders = async (req, res) => {
  const orders = await Order.find({ 'items.seller': req.user._id }).sort('-createdAt');
  res.json(orders);
};

exports.getAllOrders = async (req, res) => {
  const orders = await Order.find().populate('user', 'name email').sort('-createdAt');
  res.json(orders);
};

exports.updateOrderStatus = async (req, res) => {
  try {
    const { status, note } = req.body;
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ message: 'Order not found' });
    order.status = status;
    order.trackingHistory.push({ status, note: note || `Order marked as ${status}` });
    if (status === 'delivered') { order.isPaid = true; order.paidAt = new Date(); }
    await order.save();
    res.json(order);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
