const pool = require("../config/database").pool;
const logger = require("../utils/logger");
const { v4: uuidv4 } = require("uuid");

class Transaction {
  static async create(transactionData) {
    const { account_id, transaction_type, amount, balance_after, description, reference_account_id = null } = transactionData;
    try {
      const transaction_id = uuidv4();
      const result = await pool.query("INSERT INTO transactions (transaction_id, account_id, transaction_type, amount, balance_after, description, reference_account_id) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *", [transaction_id, account_id, transaction_type, amount, balance_after, description, reference_account_id]);
      logger.logTransaction({ transactionId: transaction_id, accountId: account_id, type: transaction_type, amount, balanceAfter: balance_after });
      return result.rows[0];
    } catch (error) {
      logger.error("Error creating transaction:", error);
      throw error;
    }
  }

  static async findById(id) {
    try {
      const result = await pool.query("SELECT t.*, a.account_number, c.first_name, c.last_name FROM transactions t JOIN accounts a ON t.account_id = a.id JOIN customers c ON a.customer_id = c.id WHERE t.id = $1", [id]);
      return result.rows[0] || null;
    } catch (error) {
      logger.error("Error finding transaction by ID:", error);
      throw error;
    }
  }

  static async findByTransactionId(transactionId) {
    try {
      const result = await pool.query("SELECT t.*, a.account_number, c.first_name, c.last_name FROM transactions t JOIN accounts a ON t.account_id = a.id JOIN customers c ON a.customer_id = c.id WHERE t.transaction_id = $1", [transactionId]);
      return result.rows[0] || null;
    } catch (error) {
      logger.error("Error finding transaction by transaction ID:", error);
      throw error;
    }
  }

  static async findAll(page = 1, limit = 10) {
    try {
      const offset = (page - 1) * limit;
      const countResult = await pool.query("SELECT COUNT(*) FROM transactions");
      const total = parseInt(countResult.rows[0].count);
      const result = await pool.query("SELECT t.*, a.account_number, c.first_name, c.last_name FROM transactions t JOIN accounts a ON t.account_id = a.id JOIN customers c ON a.customer_id = c.id ORDER BY t.created_at DESC LIMIT $1 OFFSET $2", [limit, offset]);
      return {
        transactions: result.rows,
        pagination: { page, limit, total, pages: Math.ceil(total / limit) }
      };
    } catch (error) {
      logger.error("Error finding all transactions:", error);
      throw error;
    }
  }

  static async findByAccountId(accountId, page = 1, limit = 10) {
    try {
      const offset = (page - 1) * limit;
      const countResult = await pool.query("SELECT COUNT(*) FROM transactions WHERE account_id = $1", [accountId]);
      const total = parseInt(countResult.rows[0].count);
      const result = await pool.query("SELECT t.*, a.account_number, c.first_name, c.last_name FROM transactions t JOIN accounts a ON t.account_id = a.id JOIN customers c ON a.customer_id = c.id WHERE t.account_id = $1 ORDER BY t.created_at DESC LIMIT $2 OFFSET $3", [accountId, limit, offset]);
      return result.rows;
    } catch (error) {
      logger.error("Error finding transactions by account ID:", error);
      throw error;
    }
  }

  static async findByDateRange(startDate, endDate, page = 1, limit = 10) {
    try {
      const offset = (page - 1) * limit;
      const countResult = await pool.query("SELECT COUNT(*) FROM transactions WHERE created_at BETWEEN $1 AND $2", [startDate, endDate]);
      const total = parseInt(countResult.rows[0].count);
      const result = await pool.query("SELECT t.*, a.account_number, c.first_name, c.last_name FROM transactions t JOIN accounts a ON t.account_id = a.id JOIN customers c ON a.customer_id = c.id WHERE t.created_at BETWEEN $1 AND $2 ORDER BY t.created_at DESC LIMIT $3 OFFSET $4", [startDate, endDate, limit, offset]);
      return result.rows;
    } catch (error) {
      logger.error("Error finding transactions by date range:", error);
      throw error;
    }
  }
}

module.exports = Transaction;
