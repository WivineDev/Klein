const asyncHandler = require('../middleware/asyncHandler');
const Cart = require('../models/cartModel');
const Product = require('../models/productModel');

// @desc    Get user cart
// @route   GET /api/cart
// @access  Private
const getCart = asyncHandler(async (req, res) => {
  const cartId = await Cart.findOrCreateByUserId(req.user.id);
  const items = await Cart.getItems(cartId);
  res.json({ cartId, items });
});

// @desc    Add item to cart
// @route   POST /api/cart/add
// @access  Private
const addToCart = asyncHandler(async (req, res) => {
  const { productId, quantity } = req.body;

  if (!productId || !quantity) {
    res.status(400);
    throw new Error('Product ID and quantity are required');
  }

  const product = await Product.findById(productId);
  if (!product) {
    res.status(404);
    throw new Error('Product not found');
  }

  const cartId = await Cart.findOrCreateByUserId(req.user.id);
  await Cart.addItem(cartId, productId, quantity, product.price);

  res.status(201).json({ message: 'Item added to cart' });
});

// @desc    Update cart item quantity
// @route   PUT /api/cart/update
// @access  Private
const updateCartItem = asyncHandler(async (req, res) => {
  const { productId, quantity } = req.body;

  if (!productId || quantity === undefined) {
    res.status(400);
    throw new Error('Product ID and quantity are required');
  }

  const cartId = await Cart.findOrCreateByUserId(req.user.id);
  
  if (quantity <= 0) {
    await Cart.removeItem(cartId, productId);
  } else {
    await Cart.updateItemQuantity(cartId, productId, quantity);
  }

  res.json({ message: 'Cart updated' });
});

// @desc    Remove item from cart
// @route   DELETE /api/cart/remove
// @access  Private
const removeFromCart = asyncHandler(async (req, res) => {
  const { productId } = req.body;

  if (!productId) {
    res.status(400);
    throw new Error('Product ID is required');
  }

  const cartId = await Cart.findOrCreateByUserId(req.user.id);
  await Cart.removeItem(cartId, productId);

  res.json({ message: 'Item removed from cart' });
});

module.exports = { getCart, addToCart, updateCartItem, removeFromCart };
