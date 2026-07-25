const Cart = require('../models/Cart');
const Product = require('../models/Product');

async function getOrCreateCart(userId) {
  let cart = await Cart.findOne({ user: userId });
  if (!cart) cart = await Cart.create({ user: userId, items: [] });
  return cart;
}

exports.getCart = async (req, res) => {
  const cart = await Cart.findOne({ user: req.user._id }).populate('items.product');
  res.json(cart || { items: [] });
};

exports.addToCart = async (req, res) => {
  try {
    const { productId, quantity = 1 } = req.body;
    const product = await Product.findById(productId);
    if (!product) return res.status(404).json({ message: 'Product not found' });
    if (product.stock < quantity) return res.status(400).json({ message: 'Not enough stock available' });

    const cart = await getOrCreateCart(req.user._id);
    const price = product.discountPrice > 0 ? product.discountPrice : product.price;
    const existing = cart.items.find((i) => i.product.toString() === productId);
    if (existing) existing.quantity += Number(quantity);
    else cart.items.push({ product: productId, quantity, price });

    await cart.save();
    const populated = await cart.populate('items.product');
    res.json(populated);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.updateCartItem = async (req, res) => {
  try {
    const { quantity } = req.body;
    const cart = await getOrCreateCart(req.user._id);
    const item = cart.items.find((i) => i.product.toString() === req.params.productId);
    if (!item) return res.status(404).json({ message: 'Item not in cart' });
    item.quantity = quantity;
    await cart.save();
    const populated = await cart.populate('items.product');
    res.json(populated);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.removeFromCart = async (req, res) => {
  const cart = await getOrCreateCart(req.user._id);
  cart.items = cart.items.filter((i) => i.product.toString() !== req.params.productId);
  await cart.save();
  const populated = await cart.populate('items.product');
  res.json(populated);
};

exports.clearCart = async (req, res) => {
  const cart = await getOrCreateCart(req.user._id);
  cart.items = [];
  await cart.save();
  res.json(cart);
};
