const express = require('express');
const router = express.Router();
const {
  createOrder, getMyOrders, getOrder, getSellerOrders, getAllOrders, updateOrderStatus,
} = require('../controllers/orderController');
const { protect, authorize } = require('../middleware/auth');

router.use(protect);
router.post('/', createOrder);
router.get('/mine', getMyOrders);
router.get('/seller', authorize('seller', 'admin'), getSellerOrders);
router.get('/all', authorize('admin'), getAllOrders);
router.get('/:id', getOrder);
router.put('/:id/status', authorize('seller', 'admin'), updateOrderStatus);

module.exports = router;
