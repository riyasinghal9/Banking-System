const express = require("express");
const Transaction = require("../models/Transaction");
const TransactionService = require("../services/TransactionService");
const { protect, authorize } = require("../middleware/auth");
const { validateTransaction, validateTransfer, validateId, validatePagination } = require("../middleware/validation");
const logger = require("../utils/logger");

const router = express.Router();

// Get all transactions (Admin only)
router.get("/", protect, authorize("admin"), validatePagination, async (req, res, next) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const result = await Transaction.findAll(parseInt(page), parseInt(limit));
    
    res.status(200).json({
      success: true,
      data: result.transactions,
      pagination: result.pagination
    });
  } catch (error) {
    logger.error("Error getting transactions:", error);
    next(error);
  }
});

// Get single transaction
router.get("/:id", protect, validateId, async (req, res, next) => {
  try {
    const transaction = await Transaction.findById(req.params.id);
    
    if (!transaction) {
      return res.status(404).json({
        success: false,
        error: "Transaction not found"
      });
    }

    res.status(200).json({
      success: true,
      data: transaction
    });
  } catch (error) {
    logger.error("Error getting transaction:", error);
    next(error);
  }
});

// Deposit money (Admin/Teller only)
router.post("/deposit", protect, authorize("admin", "teller"), validateTransaction, async (req, res, next) => {
  try {
    const { account_id, amount, description } = req.body;
    const result = await TransactionService.deposit(account_id, amount, description);
    
    res.status(200).json({
      success: true,
      data: result,
      message: "Deposit successful"
    });
  } catch (error) {
    logger.error("Error processing deposit:", error);
    next(error);
  }
});

// Withdraw money (Admin/Teller only)
router.post("/withdraw", protect, authorize("admin", "teller"), validateTransaction, async (req, res, next) => {
  try {
    const { account_id, amount, description } = req.body;
    const result = await TransactionService.withdrawal(account_id, amount, description);
    
    res.status(200).json({
      success: true,
      data: result,
      message: "Withdrawal successful"
    });
  } catch (error) {
    logger.error("Error processing withdrawal:", error);
    next(error);
  }
});

// Transfer money (Admin/Teller only)
router.post("/transfer", protect, authorize("admin", "teller"), validateTransfer, async (req, res, next) => {
  try {
    const { from_account_id, to_account_id, amount, description } = req.body;
    const result = await TransactionService.transfer(from_account_id, to_account_id, amount, description);
    
    res.status(200).json({
      success: true,
      data: result,
      message: "Transfer successful"
    });
  } catch (error) {
    logger.error("Error processing transfer:", error);
    next(error);
  }
});

// Get account transactions
router.get("/account/:accountId", protect, validateId, validatePagination, async (req, res, next) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const result = await Transaction.findByAccountId(req.params.accountId, parseInt(page), parseInt(limit));
    
    res.status(200).json({
      success: true,
      data: result.transactions,
      pagination: result.pagination
    });
  } catch (error) {
    logger.error("Error getting account transactions:", error);
    next(error);
  }
});

module.exports = router;
