const asyncHandler = require('../middleware/asyncHandler');
const Payment = require('../models/paymentModel');
const Order = require('../models/orderModel');

// @desc    Process a payment
// @route   POST /api/payments
// @access  Private
const processPayment = asyncHandler(async (req, res) => {
  const { orderId, paymentMethod, amount, transactionRef } = req.body;

  if (!orderId || !paymentMethod || !amount) {
    res.status(400);
    throw new Error('Missing payment details');
  }

  const order = await Order.findById(orderId);
  if (!order) {
    res.status(404);
    throw new Error('Order not found');
  }

  // Record the payment
  const paymentId = await Payment.create(orderId, paymentMethod, amount, transactionRef || 'MOCK-REF-123');

  // Update order status
  await Order.updateStatus(orderId, null, 'paid');

  res.status(201).json({ message: 'Payment processed successfully', paymentId });
});

module.exports = { processPayment };
