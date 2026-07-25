const express = require('express');
const router = express.Router();
const {
  getProducts, getProduct, getRelatedProducts, createProduct, updateProduct, deleteProduct,
  getSellerProducts, addReview,
} = require('../controllers/productController');
const { protect, authorize } = require('../middleware/auth');

router.get('/seller/mine', protect, authorize('seller', 'admin'), getSellerProducts);
router.get('/:id/related', getRelatedProducts);
router.post('/:id/reviews', protect, addReview);
router.get('/', getProducts);
router.get('/:id', getProduct);
router.post('/', protect, authorize('seller', 'admin'), createProduct);
router.put('/:id', protect, authorize('seller', 'admin'), updateProduct);
router.delete('/:id', protect, authorize('seller', 'admin'), deleteProduct);

module.exports = router;
