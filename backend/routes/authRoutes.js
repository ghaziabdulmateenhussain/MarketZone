const express = require('express');
const router = express.Router();
const { register, login, getMe, updateProfile, changePassword, registerSeller } = require('../controllers/authController');
const { protect } = require('../middleware/auth');

router.post('/register', register);
router.post('/login', login);
router.get('/me', protect, getMe);
router.put('/profile', protect, updateProfile);
router.put('/change-password', protect, changePassword);
router.post('/seller-register', protect, registerSeller);

module.exports = router;
