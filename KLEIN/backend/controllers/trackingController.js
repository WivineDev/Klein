const asyncHandler = require('../middleware/asyncHandler');
const Tracking = require('../models/trackingModel');
const Order = require('../models/orderModel');

// @desc    Get tracking details for an order
// @route   GET /api/tracking/:order_id
// @access  Private
const getOrderTracking = asyncHandler(async (req, res) => {
  const orderId = req.params.order_id;

  const order = await Order.findById(orderId);
  if (!order) {
    res.status(404);
    throw new Error('Order not found');
  }

  // Ensure the user owns the order or is an admin
  if (order.user_id !== req.user.id && req.user.role !== 'admin') {
    res.status(403);
    throw new Error('Not authorized to view tracking for this order');
  }

  const trackingUpdates = await Tracking.findByOrderId(orderId);
  res.json({ orderId, status: order.status, tracking: trackingUpdates });
});

module.exports = { getOrderTracking };
