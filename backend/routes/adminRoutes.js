const express = require('express');
const router = express.Router();
const {
  getDashboardStats, getAllUsers, getPendingSellers, approveSeller, rejectSeller, toggleUserActive,
  getPendingProducts, approveProduct, rejectProduct,
} = require('../controllers/adminController');
const { protect, authorize } = require('../middleware/auth');

router.use(protect, authorize('admin'));
router.get('/stats', getDashboardStats);
router.get('/users', getAllUsers);
router.put('/users/:id/toggle', toggleUserActive);
router.get('/sellers/pending', getPendingSellers);
router.put('/sellers/:id/approve', approveSeller);
router.put('/sellers/:id/reject', rejectSeller);
router.get('/products/pending', getPendingProducts);
router.put('/products/:id/approve', approveProduct);
router.put('/products/:id/reject', rejectProduct);

module.exports = router;
