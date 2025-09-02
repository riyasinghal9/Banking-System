const express = require("express");
const Account = require("../models/Account");
const { protect, authorize } = require("../middleware/auth");
const { validateAccount, validateId, validateAccountNumber, validatePagination } = require("../middleware/validation");
const logger = require("../utils/logger");

const router = express.Router();

// Get all accounts (Admin only)
router.get("/", protect, authorize("admin"), validatePagination, async (req, res, next) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const result = await Account.findAll(parseInt(page), parseInt(limit));
    
    res.status(200).json({
      success: true,
      data: result.accounts,
      pagination: result.pagination
    });
  } catch (error) {
    logger.error("Error getting accounts:", error);
    next(error);
  }
});

// Get single account
router.get("/:id", protect, validateId, async (req, res, next) => {
  try {
    const account = await Account.findById(req.params.id);
    
    if (!account) {
      return res.status(404).json({
        success: false,
        error: "Account not found"
      });
    }

    res.status(200).json({
      success: true,
      data: account
    });
  } catch (error) {
    logger.error("Error getting account:", error);
    next(error);
  }
});

// Get account by account number
router.get("/number/:accountNumber", protect, validateAccountNumber, async (req, res, next) => {
  try {
    const account = await Account.findByAccountNumber(req.params.accountNumber);
    
    if (!account) {
      return res.status(404).json({
        success: false,
        error: "Account not found"
      });
    }

    res.status(200).json({
      success: true,
      data: account
    });
  } catch (error) {
    logger.error("Error getting account by number:", error);
    next(error);
  }
});

// Create account (Admin/Teller only)
router.post("/", protect, authorize("admin", "teller"), validateAccount, async (req, res, next) => {
  try {
    const account = await Account.create(req.body);
    
    res.status(201).json({
      success: true,
      data: account,
      message: "Account created successfully"
    });
  } catch (error) {
    logger.error("Error creating account:", error);
    next(error);
  }
});

// Close account (Admin only)
router.put("/:id/close", protect, authorize("admin"), validateId, async (req, res, next) => {
  try {
    const account = await Account.close(req.params.id);
    
    if (!account) {
      return res.status(404).json({
        success: false,
        error: "Account not found"
      });
    }

    res.status(200).json({
      success: true,
      data: account,
      message: "Account closed successfully"
    });
  } catch (error) {
    logger.error("Error closing account:", error);
    next(error);
  }
});

module.exports = router;
