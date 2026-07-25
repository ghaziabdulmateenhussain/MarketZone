const User = require('../models/User');
const Product = require('../models/Product');
const Order = require('../models/Order');
const Category = require('../models/Category');
const { sendEmail } = require('../utils/email');

exports.getDashboardStats = async (req, res) => {
  const [totalUsers, totalSellers, totalProducts, totalOrders, totalCategories, orders] = await Promise.all([
    User.countDocuments({ role: 'customer' }),
    User.countDocuments({ role: 'seller', sellerStatus: 'approved' }),
    Product.countDocuments(),
    Order.countDocuments(),
    Category.countDocuments(),
    Order.find(),
  ]);
  const totalRevenue = orders.reduce((sum, o) => sum + (o.totalPrice || 0), 0);
  const pendingSellers = await User.countDocuments({ sellerStatus: 'pending' });
  const pendingProducts = await Product.countDocuments({ status: 'pending' });

  res.json({ totalUsers, totalSellers, totalProducts, totalOrders, totalCategories, totalRevenue, pendingSellers, pendingProducts });
};

exports.getAllUsers = async (req, res) => {
  const users = await User.find().select('-password').sort('-createdAt');
  res.json(users);
};

exports.getPendingSellers = async (req, res) => {
  const sellers = await User.find({ sellerStatus: 'pending' }).select('-password');
  res.json(sellers);
};

exports.approveSeller = async (req, res) => {
  const user = await User.findById(req.params.id);
  if (!user) return res.status(404).json({ message: 'User not found' });
  user.role = 'seller';
  user.sellerStatus = 'approved';
  await user.save();
  sendEmail({
    to: user.email,
    subject: 'Seller Application Approved - MarketZone',
    html: `<h3>Congratulations ${user.name}!</h3><p>Your store "${user.storeName}" has been approved. You can now log in and start listing products.</p>`,
  });
  res.json({ message: 'Seller approved', user: user.toSafeObject() });
};

exports.rejectSeller = async (req, res) => {
  const user = await User.findById(req.params.id);
  if (!user) return res.status(404).json({ message: 'User not found' });
  user.sellerStatus = 'rejected';
  await user.save();
  sendEmail({
    to: user.email,
    subject: 'Seller Application Update - MarketZone',
    html: `<p>Hi ${user.name}, unfortunately your seller application was not approved at this time.</p>`,
  });
  res.json({ message: 'Seller rejected' });
};

exports.toggleUserActive = async (req, res) => {
  const user = await User.findById(req.params.id);
  if (!user) return res.status(404).json({ message: 'User not found' });
  user.isActive = !user.isActive;
  await user.save();
  res.json({ message: `User ${user.isActive ? 'activated' : 'blocked'}`, user: user.toSafeObject() });
};

exports.getPendingProducts = async (req, res) => {
  const products = await Product.find({ status: 'pending' }).populate('seller', 'name storeName').populate('category', 'name');
  res.json(products);
};

exports.approveProduct = async (req, res) => {
  const product = await Product.findById(req.params.id);
  if (!product) return res.status(404).json({ message: 'Product not found' });
  product.status = 'approved';
  await product.save();
  res.json({ message: 'Product approved' });
};

exports.rejectProduct = async (req, res) => {
  const product = await Product.findById(req.params.id);
  if (!product) return res.status(404).json({ message: 'Product not found' });
  product.status = 'rejected';
  await product.save();
  res.json({ message: 'Product rejected' });
};
