const express = require("express");
const Customer = require("../models/Customer");
const { protect, authorize } = require("../middleware/auth");
const { validateCustomer, validateId, validatePagination } = require("../middleware/validation");
const logger = require("../utils/logger");

const router = express.Router();

// Get all customers (Admin only)
router.get("/", protect, authorize("admin"), validatePagination, async (req, res, next) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const result = await Customer.findAll(parseInt(page), parseInt(limit));
    
    res.status(200).json({
      success: true,
      data: result.customers,
      pagination: result.pagination
    });
  } catch (error) {
    logger.error("Error getting customers:", error);
    next(error);
  }
});

// Get single customer
router.get("/:id", protect, validateId, async (req, res, next) => {
  try {
    const customer = await Customer.findById(req.params.id);
    
    if (!customer) {
      return res.status(404).json({
        success: false,
        error: "Customer not found"
      });
    }

    res.status(200).json({
      success: true,
      data: customer
    });
  } catch (error) {
    logger.error("Error getting customer:", error);
    next(error);
  }
});

// Create customer (Admin/Teller only)
router.post("/", protect, authorize("admin", "teller"), validateCustomer, async (req, res, next) => {
  try {
    const customer = await Customer.create(req.body);
    
    res.status(201).json({
      success: true,
      data: customer,
      message: "Customer created successfully"
    });
  } catch (error) {
    logger.error("Error creating customer:", error);
    next(error);
  }
});

// Update customer
router.put("/:id", protect, validateId, async (req, res, next) => {
  try {
    const customer = await Customer.update(req.params.id, req.body);
    
    if (!customer) {
      return res.status(404).json({
        success: false,
        error: "Customer not found"
      });
    }

    res.status(200).json({
      success: true,
      data: customer,
      message: "Customer updated successfully"
    });
  } catch (error) {
    logger.error("Error updating customer:", error);
    next(error);
  }
});

// Get customer accounts
router.get("/:id/accounts", protect, validateId, async (req, res, next) => {
  try {
    const accounts = await Customer.getAccounts(req.params.id);
    
    res.status(200).json({
      success: true,
      data: accounts
    });
  } catch (error) {
    logger.error("Error getting customer accounts:", error);
    next(error);
  }
});

module.exports = router;
