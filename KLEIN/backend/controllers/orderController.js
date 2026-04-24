const asyncHandler = require('../middleware/asyncHandler');
const Order = require('../models/orderModel');
const Cart = require('../models/cartModel');

// @desc    Create new order (Checkout)
// @route   POST /api/orders
// @access  Private
const createOrder = asyncHandler(async (req, res) => {
  // Get cart items
  const cartId = await Cart.findOrCreateByUserId(req.user.id);
  const items = await Cart.getItems(cartId);

  if (items.length === 0) {
    res.status(400);
    throw new Error('No items in cart');
  }

  // Calculate total amount
  const totalAmount = items.reduce((acc, item) => acc + (item.price * item.quantity), 0);

  // Create order
  const orderId = await Order.create(req.user.id, totalAmount, items);

  // Clear cart after successful order creation
  await Cart.clearCart(cartId);

  res.status(201).json({ message: 'Order created successfully', orderId });
});

// @desc    Get logged in user orders
// @route   GET /api/orders
// @access  Private
const getMyOrders = asyncHandler(async (req, res) => {
  const orders = await Order.findByUserId(req.user.id);
  res.json(orders);
});

// @desc    Get order by ID
// @route   GET /api/orders/:id
// @access  Private
const getOrderById = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id);

  if (order) {
    // Check if the order belongs to the user or if user is admin
    if (order.user_id !== req.user.id && req.user.role !== 'admin') {
      res.status(403);
      throw new Error('Not authorized to view this order');
    }
    res.json(order);
  } else {
    res.status(404);
    throw new Error('Order not found');
  }
});

module.exports = { createOrder, getMyOrders, getOrderById };
