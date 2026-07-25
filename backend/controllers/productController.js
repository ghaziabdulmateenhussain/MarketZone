const Product = require('../models/Product');
const slugify = require('../utils/slugify');

exports.getProducts = async (req, res) => {
  try {
    const {
      search, category, minPrice, maxPrice, rating, sort, page = 1, limit = 12, seller, featured,
    } = req.query;

    const query = { status: 'approved' };
    if (search) query.$text = { $search: search };
    if (category) query.category = category;
    if (seller) query.seller = seller;
    if (featured) query.isFeatured = true;
    if (minPrice || maxPrice) {
      query.price = {};
      if (minPrice) query.price.$gte = Number(minPrice);
      if (maxPrice) query.price.$lte = Number(maxPrice);
    }
    if (rating) query.rating = { $gte: Number(rating) };

    let sortOption = { createdAt: -1 };
    if (sort === 'price_asc') sortOption = { price: 1 };
    if (sort === 'price_desc') sortOption = { price: -1 };
    if (sort === 'rating') sortOption = { rating: -1 };
    if (sort === 'popular') sortOption = { sold: -1 };

    const skip = (Number(page) - 1) * Number(limit);
    const [products, total] = await Promise.all([
      Product.find(query).populate('category', 'name slug').populate('seller', 'name storeName')
        .sort(sortOption).skip(skip).limit(Number(limit)),
      Product.countDocuments(query),
    ]);

    res.json({ products, total, page: Number(page), pages: Math.ceil(total / limit) });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id)
      .populate('category', 'name slug')
      .populate('seller', 'name storeName storeDescription')
      .populate('reviews.user', 'name avatar');
    if (!product) return res.status(404).json({ message: 'Product not found' });
    res.json(product);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getRelatedProducts = async (req, res) => {
  const product = await Product.findById(req.params.id);
  if (!product) return res.status(404).json({ message: 'Product not found' });
  const related = await Product.find({
    category: product.category, _id: { $ne: product._id }, status: 'approved',
  }).limit(4);
  res.json(related);
};

exports.createProduct = async (req, res) => {
  try {
    const { name, description, category, price, discountPrice, stock, images, brand } = req.body;
    const product = await Product.create({
      seller: req.user._id, name, slug: slugify(name), description, category,
      price, discountPrice, stock, images, brand,
      status: req.user.role === 'admin' ? 'approved' : 'pending',
    });
    res.status(201).json(product);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.updateProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ message: 'Product not found' });
    if (product.seller.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized to edit this product' });
    }
    const fields = ['name', 'description', 'category', 'price', 'discountPrice', 'stock', 'images', 'brand', 'isFeatured'];
    fields.forEach((f) => { if (req.body[f] !== undefined) product[f] = req.body[f]; });
    if (req.user.role !== 'admin') product.status = 'pending';
    await product.save();
    res.json(product);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.deleteProduct = async (req, res) => {
  const product = await Product.findById(req.params.id);
  if (!product) return res.status(404).json({ message: 'Product not found' });
  if (product.seller.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Not authorized to delete this product' });
  }
  await product.deleteOne();
  res.json({ message: 'Product deleted' });
};

exports.getSellerProducts = async (req, res) => {
  const products = await Product.find({ seller: req.user._id }).populate('category', 'name').sort('-createdAt');
  res.json(products);
};

exports.addReview = async (req, res) => {
  try {
    const { rating, comment } = req.body;
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ message: 'Product not found' });

    const already = product.reviews.find((r) => r.user.toString() === req.user._id.toString());
    if (already) return res.status(400).json({ message: 'You already reviewed this product' });

    product.reviews.push({ user: req.user._id, name: req.user.name, rating, comment });
    product.numReviews = product.reviews.length;
    product.rating = product.reviews.reduce((a, r) => a + r.rating, 0) / product.reviews.length;
    await product.save();
    res.status(201).json({ message: 'Review added' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
