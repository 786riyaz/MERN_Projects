// /routes/userRoutes.js
const express = require("express");
const { isAuthenticated } = require("../middleware/authMiddleware");
const {
  getMe,
  updateMe,
  getAllUsers,
  getUserById,
  deleteUser,
  changePassword,
} = require("../controllers/userController");

const router = express.Router();

// Authenticated user info
router.get("/me", isAuthenticated, getMe);
router.put("/me", isAuthenticated, updateMe);

// Change password
router.post("/change-password", isAuthenticated, changePassword);

// Admin-only routes (optional: add authorizeRoles("admin"))
router.get("/all", isAuthenticated, getAllUsers);
router.get("/:id", isAuthenticated, getUserById);
router.delete("/:id", isAuthenticated, deleteUser);

module.exports = router;
