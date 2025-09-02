const express = require("express");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const { validateLogin, validateUserRegistration } = require("../middleware/validation");
const { protect } = require("../middleware/auth");
const logger = require("../utils/logger");

const router = express.Router();

// Login endpoint
router.post("/login", validateLogin, async (req, res, next) => {
  try {
    const { username, password } = req.body;

    // Find user by username
    const user = await User.findByUsername(username);
    if (!user) {
      return res.status(401).json({
        success: false,
        error: "Invalid credentials"
      });
    }

    // Check password
    const isPasswordValid = await User.comparePassword(password, user.password_hash);
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

    // Update last login
    // await User.updateLastLogin(user.id);

    // Generate JWT token
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

// Register endpoint
router.post("/register", validateUserRegistration, async (req, res, next) => {
  try {
    const { username, password, customer_id, role = "customer" } = req.body;

    // Check if username already exists
    const existingUser = await User.findByUsername(username);
    if (existingUser) {
      return res.status(409).json({
        success: false,
        error: "Username already exists"
      });
    }

    // Create new user
    const user = await User.create({
      username,
      password,
      customer_id,
      role
    });

    logger.info("User registered successfully", {
      userId: user.id,
      username: user.username,
      role: user.role
    });

    res.status(201).json({
      success: true,
      message: "User registered successfully",
      user: {
        id: user.id,
        username: user.username,
        role: user.role,
        customer_id: user.customer_id
      }
    });
  } catch (error) {
    logger.error("Registration error:", error);
    next(error);
  }
});

// Get current user
router.get("/me", protect, async (req, res, next) => {
  try {
    res.status(200).json({
      success: true,
      user: {
        id: req.user.id,
        username: req.user.username,
        role: req.user.role,
        customer_id: req.user.customer_id,
        first_name: req.user.first_name,
        last_name: req.user.last_name,
        email: req.user.email
      }
    });
  } catch (error) {
    logger.error("Get current user error:", error);
    next(error);
  }
});

// Change password
router.put("/change-password", protect, async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        success: false,
        error: "Current password and new password are required"
      });
    }

    // Verify current password
    const user = await User.findById(req.user.id);
    const isCurrentPasswordValid = await User.comparePassword(currentPassword, user.password_hash);
    
    if (!isCurrentPasswordValid) {
      return res.status(401).json({
        success: false,
        error: "Current password is incorrect"
      });
    }

    // Update password
    const bcrypt = require("bcryptjs");
    const newPasswordHash = await bcrypt.hash(newPassword, 10);
    
    // Update user password in database
    const pool = require("../config/database").pool;
    await pool.query("UPDATE users SET password_hash = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2", [newPasswordHash, req.user.id]);

    logger.info("Password changed successfully", {
      userId: req.user.id,
      username: req.user.username
    });

    res.status(200).json({
      success: true,
      message: "Password changed successfully"
    });
  } catch (error) {
    logger.error("Change password error:", error);
    next(error);
  }
});

module.exports = router;
