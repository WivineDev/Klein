const asyncHandler = require('../middleware/asyncHandler');
const Product = require('../models/productModel');

// @desc    Fetch all products
// @route   GET /api/products
// @access  Public
const getProducts = asyncHandler(async (req, res) => {
  const products = await Product.findAll();
  res.json(products);
});

// @desc    Fetch single product
// @route   GET /api/products/:id
// @access  Public
const getProductById = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id);

  if (product) {
    res.json(product);
  } else {
    res.status(404);
    throw new Error('Product not found');
  }
});

// @desc    Fetch products by category
// @route   GET /api/products/category/:id
// @access  Public
const getProductsByCategory = asyncHandler(async (req, res) => {
  const products = await Product.findByCategoryId(req.params.id);
  res.json(products);
});

// @desc    Create a product
// @route   POST /api/products
// @access  Private/Admin
const createProduct = asyncHandler(async (req, res) => {
  const { name, description, price, stock_quantity, category_id, image_url } = req.body;

  if (!name || !price) {
    res.status(400);
    throw new Error('Name and price are required');
  }

  const productId = await Product.create({
    name,
    description,
    price,
    stock_quantity: stock_quantity || 0,
    category_id,
    image_url
  });

  res.status(201).json({ message: 'Product created', id: productId });
});

// @desc    Update a product
// @route   PUT /api/products/:id
// @access  Private/Admin
const updateProduct = asyncHandler(async (req, res) => {
  const { name, description, price, stock_quantity, category_id, image_url } = req.body;

  const product = await Product.findById(req.params.id);

  if (product) {
    await Product.update(req.params.id, {
      name: name || product.name,
      description: description || product.description,
      price: price || product.price,
      stock_quantity: stock_quantity !== undefined ? stock_quantity : product.stock_quantity,
      category_id: category_id || product.category_id,
      image_url: image_url || product.image_url
    });
    res.json({ message: 'Product updated' });
  } else {
    res.status(404);
    throw new Error('Product not found');
  }
});

// @desc    Delete a product
// @route   DELETE /api/products/:id
// @access  Private/Admin
const deleteProduct = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id);

  if (product) {
    await Product.delete(req.params.id);
    res.json({ message: 'Product removed' });
  } else {
    res.status(404);
    throw new Error('Product not found');
  }
});

module.exports = {
  getProducts,
  getProductById,
  getProductsByCategory,
  createProduct,
  updateProduct,
  deleteProduct
};
