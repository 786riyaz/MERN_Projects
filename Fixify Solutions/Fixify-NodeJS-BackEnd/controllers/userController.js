// controllers/userController.js
const bcrypt = require("bcrypt");
const User = require("../models/User");

exports.getMe = async (req, res) => {
  const user = await User.findById(req.user.id).select("-passwordHash");
  res.status(200).json({ success: true, data: user });
};

exports.updateMe = async (req, res) => {
  const updates = { ...req.body };

  // Prevent user from updating password fields through this route
  delete updates.password;
  delete updates.passwordHash;

  updates.updatedAt = new Date();

  const updatedUser = await User.findByIdAndUpdate(req.user.id, updates, {
    new: true,
  }).select("-passwordHash");

  res.status(200).json({ success: true, data: updatedUser });
};

exports.getAllUsers = async (req, res) => {
  const users = await User.find().select("-passwordHash");
  res.status(200).json({ success: true, count: users.length, data: users });
};

exports.getUserById = async (req, res) => {
  const user = await User.findById(req.params.id).select("-passwordHash");
  res.status(200).json({ success: true, data: user });
};

exports.deleteUser = async (req, res) => {
  await User.findByIdAndDelete(req.params.id);
  res.status(200).json({ success: true, message: "User deleted" });
};

// CHANGE PASSWORD
exports.changePassword = async (req, res) => {
  const { oldPassword, newPassword } = req.body;

  if (!oldPassword || !newPassword) {
    return res.status(400).json({
      success: false,
      message: "oldPassword and newPassword are required",
    });
  }

  const user = await User.findById(req.user.id);

  // Check old password
  const isMatch = await bcrypt.compare(oldPassword, user.passwordHash);
  if (!isMatch) {
    return res.status(401).json({
      success: false,
      message: "Old password is incorrect",
    });
  }

  // Hash new password
  const hashed = await bcrypt.hash(newPassword, 10);

  user.passwordHash = hashed;
  user.updatedAt = new Date();

  await user.save();

  return res.status(200).json({
    success: true,
    message: "Password updated successfully",
  });
};

