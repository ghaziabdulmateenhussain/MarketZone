const express = require('express');
const router = express.Router();
const { submitContact, getMessages, markRead } = require('../controllers/contactController');
const { protect, authorize } = require('../middleware/auth');

router.post('/', submitContact);
router.get('/', protect, authorize('admin'), getMessages);
router.put('/:id/read', protect, authorize('admin'), markRead);

module.exports = router;
