const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const { validateLogin, validateUserRegistration } = require("../middleware/validation");
const { protect } = require("../middleware/auth");
const logger = require("../utils/logger");

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
router.post("/login", validateLogin, async (req, res, next) => {
  const { username, password } = req.body;
  try {
    const user = await User.findByUsername(username);
    if (!user) {
      logger.logSecurity("Login attempt failed - User not found", { username, ip: req.ip });
      return res.status(401).json({
        success: false,
        error: "Invalid credentials"
      });
    }

    // Check password
    const isPasswordValid = await bcrypt.compare(password, user.password_hash);
    if (!isPasswordValid) {
      logger.logSecurity("Failed login attempt", {
        username,
        ip: req.ip,
        userAgent: req.get("User-Agent")
      });
      return res.status(401).json({
        success: false,
        error: "Invalid credentials"
      });
    }

    const token = jwt.sign(
      { id: user.id, username: user.username, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN }
    );

    logger.info("User logged in successfully", {
      userId: user.id,
      username: user.username,
      role: user.role
    });

    res.status(200).json({
      success: true,
      token,
      user: {
        id: user.id,
        username: user.username,
        role: user.role,
        customer_id: user.customer_id,
        first_name: user.first_name,
        last_name: user.last_name,
        email: user.email
      }
    });
  } catch (error) {
    logger.error("Login error:", error);
    next(error);
  }
});

// @desc    Register new user
// @route   POST /api/auth/register
// @access  Public
router.post("/register", validateUserRegistration, async (req, res, next) => {
  const { username, password, customer_id, role } = req.body;
  try {
    const newUser = await User.create({ username, password, customer_id, role });
    logger.info("User registered successfully", {
      userId: newUser.id,
      username: newUser.username,
      role: newUser.role
    });
    res.status(201).json({
      success: true,
      message: "User registered successfully",
      user: newUser
    });
  } catch (error) {
    next(error);
  }
});

// @desc    Get current logged in user
// @route   GET /api/auth/me
// @access  Private
router.get("/me", protect, async (req, res, next) => {
  res.status(200).json({
    success: true,
    user: req.user
  });
});

// @desc    Change user password
// @route   PUT /api/auth/change-password
// @access  Private
router.put("/change-password", protect, async (req, res, next) => {
  const { currentPassword, newPassword } = req.body;
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({
        success: false,
        error: "User not found"
      });
    }

    const isMatch = await bcrypt.compare(currentPassword, user.password_hash);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        error: "Current password incorrect"
      });
    }

    await User.updatePassword(user.id, newPassword);
    logger.info("User password changed", {
      userId: user.id,
      username: user.username
    });
    res.status(200).json({
      success: true,
      message: "Password updated successfully"
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
