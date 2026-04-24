const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const asyncHandler = require('../middleware/asyncHandler');
const User = require('../models/userModel');

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });
};

// @desc    Register new user
// @route   POST /api/auth/register
// @access  Public
const registerUser = asyncHandler(async (req, res) => {
  const { full_name, email, phone, password, address, role } = req.body;

  if (!full_name || !email || !password) {
    res.status(400);
    throw new Error('Please add all required fields');
  }

  const userExists = await User.findByEmail(email);

  if (userExists) {
    res.status(400);
    throw new Error('User already exists');
  }

  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(password, salt);

  const userId = await User.create({
    full_name,
    email,
    phone,
    password: hashedPassword,
    address,
    role
  });

  if (userId) {
    res.status(201).json({
      _id: userId,
      full_name,
      email,
      role: role || 'user',
      token: generateToken(userId),
    });
  } else {
    res.status(400);
    throw new Error('Invalid user data');
  }
});

// @desc    Authenticate a user
// @route   POST /api/auth/login
// @access  Public
const loginUser = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  const user = await User.findByEmail(email);

  if (user && (await bcrypt.compare(password, user.password))) {
    res.json({
      _id: user.id,
      full_name: user.full_name,
      email: user.email,
      role: user.role,
      token: generateToken(user.id),
      message: 'Login successful',
    });
  } else {
    res.status(401);
    throw new Error('Invalid credentials');
  }
});

module.exports = { registerUser, loginUser };
