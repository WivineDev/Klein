const express = require('express');
const router = express.Router();
const { getOrderTracking } = require('../controllers/trackingController');
const { protect } = require('../middleware/authMiddleware');

router.get('/:order_id', protect, getOrderTracking);

module.exports = router;
