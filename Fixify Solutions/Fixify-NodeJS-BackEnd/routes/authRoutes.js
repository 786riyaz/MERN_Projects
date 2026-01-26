// /routes/authRoutes.js
const express = require("express");
const {
  registerUser,
  loginUser,
  getProfile,
  forgotPassword,
  verifyOtp,
  resetPassword
} = require("../controllers/authController");

const { isAuthenticated } = require("../middleware/authMiddleware");

const router = express.Router();

// Public routes
router.post("/register", registerUser);
router.post("/login", loginUser);
router.post("/forgot-password", forgotPassword);
router.post("/verify-otp", verifyOtp);
router.post("/reset-password", resetPassword);

// Protected route
router.get("/profile", isAuthenticated, getProfile);

module.exports = router;
