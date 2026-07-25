const Wishlist = require('../models/Wishlist');

async function getOrCreate(userId) {
  let wl = await Wishlist.findOne({ user: userId });
  if (!wl) wl = await Wishlist.create({ user: userId, products: [] });
  return wl;
}

exports.getWishlist = async (req, res) => {
  const wl = await Wishlist.findOne({ user: req.user._id }).populate('products');
  res.json(wl || { products: [] });
};

exports.toggleWishlist = async (req, res) => {
  const { productId } = req.body;
  const wl = await getOrCreate(req.user._id);
  const idx = wl.products.findIndex((p) => p.toString() === productId);
  let added;
  if (idx > -1) { wl.products.splice(idx, 1); added = false; }
  else { wl.products.push(productId); added = true; }
  await wl.save();
  res.json({ added, message: added ? 'Added to wishlist' : 'Removed from wishlist' });
};
