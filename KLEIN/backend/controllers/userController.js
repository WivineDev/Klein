const bcrypt = require('bcryptjs');
const asyncHandler = require('../middleware/asyncHandler');
const User = require('../models/userModel');

// @desc    Get user profile
// @route   GET /api/users/profile
// @access  Private
const getUserProfile = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user.id);

  if (user) {
    res.json({
      _id: user.id,
      full_name: user.full_name,
      email: user.email,
      phone: user.phone,
      address: user.address,
      role: user.role
    });
  } else {
    res.status(404);
    throw new Error('User not found');
  }
});

// @desc    Update user profile
// @route   PUT /api/users/profile
// @access  Private
const updateUserProfile = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user.id);

  if (user) {
    const updateData = {
      full_name: req.body.full_name || user.full_name,
      phone: req.body.phone || user.phone,
      address: req.body.address || user.address
    };

    if (req.body.password) {
      const salt = await bcrypt.genSalt(10);
      updateData.password = await bcrypt.hash(req.body.password, salt);
    }

    await User.updateProfile(req.user.id, updateData);
    
    // Fetch updated user to return
    const updatedUser = await User.findById(req.user.id);

    res.json({
      _id: updatedUser.id,
      full_name: updatedUser.full_name,
      email: updatedUser.email,
      phone: updatedUser.phone,
      address: updatedUser.address,
      role: updatedUser.role
    });
  } else {
    res.status(404);
    throw new Error('User not found');
  }
});

module.exports = { getUserProfile, updateUserProfile };
