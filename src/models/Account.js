const pool = require("../config/database").pool;
const logger = require("../utils/logger");

class Account {
  static async create(accountData) {
    const { customer_id, account_type, balance = 0, interest_rate = 0 } = accountData;
    try {
      const account_number = "ACC" + Date.now() + Math.floor(Math.random() * 1000).toString().padStart(3, "0");
      const result = await pool.query("INSERT INTO accounts (account_number, customer_id, account_type, balance, interest_rate) VALUES ($1, $2, $3, $4, $5) RETURNING *", [account_number, customer_id, account_type, balance, interest_rate]);
      logger.info("Account created", { accountId: result.rows[0].id, accountNumber: account_number, customerId: customer_id });
      return result.rows[0];
    } catch (error) {
      logger.error("Error creating account:", error);
      throw error;
    }
  }

  static async findById(id) {
    try {
      const result = await pool.query("SELECT a.*, c.first_name, c.last_name, c.email FROM accounts a JOIN customers c ON a.customer_id = c.id WHERE a.id = $1", [id]);
      return result.rows[0] || null;
    } catch (error) {
      logger.error("Error finding account by ID:", error);
      throw error;
    }
  }

  static async findByAccountNumber(accountNumber) {
    try {
      const result = await pool.query("SELECT a.*, c.first_name, c.last_name, c.email FROM accounts a JOIN customers c ON a.customer_id = c.id WHERE a.account_number = $1", [accountNumber]);
      return result.rows[0] || null;
    } catch (error) {
      logger.error("Error finding account by number:", error);
      throw error;
    }
  }

  static async findAll(page = 1, limit = 10) {
    try {
      const offset = (page - 1) * limit;
      const countResult = await pool.query("SELECT COUNT(*) FROM accounts");
      const total = parseInt(countResult.rows[0].count);
      const result = await pool.query("SELECT a.*, c.first_name, c.last_name, c.email FROM accounts a JOIN customers c ON a.customer_id = c.id ORDER BY a.created_at DESC LIMIT $1 OFFSET $2", [limit, offset]);
      return {
        accounts: result.rows,
        pagination: { page, limit, total, pages: Math.ceil(total / limit) }
      };
    } catch (error) {
      logger.error("Error finding all accounts:", error);
      throw error;
    }
  }

  static async update(id, updateData) {
    try {
      const fields = [];
      const values = [];
      let paramCount = 1;

      for (const [key, value] of Object.entries(updateData)) {
        if (key !== "id" && key !== "created_at") {
          fields.push(key + " = $" + paramCount);
          values.push(value);
          paramCount++;
        }
      }

      if (fields.length === 0) {
        throw new Error("No valid fields to update");
      }

      fields.push("updated_at = CURRENT_TIMESTAMP");
      values.push(id);

      const query = "UPDATE accounts SET " + fields.join(", ") + " WHERE id = $" + paramCount + " RETURNING *";
      const result = await pool.query(query, values);

      if (result.rows.length === 0) {
        return null;
      }

      logger.info("Account updated", { accountId: id, updatedFields: Object.keys(updateData) });
      return result.rows[0];
    } catch (error) {
      logger.error("Error updating account:", error);
      throw error;
    }
  }

  static async updateBalance(id, newBalance) {
    try {
      const result = await pool.query("UPDATE accounts SET balance = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2 RETURNING *", [newBalance, id]);
      if (result.rows.length === 0) {
        return null;
      }
      logger.info("Account balance updated", { accountId: id, newBalance: newBalance });
      return result.rows[0];
    } catch (error) {
      logger.error("Error updating account balance:", error);
      throw error;
    }
  }

  static async close(id) {
    try {
      const result = await pool.query("UPDATE accounts SET status = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2 RETURNING *", ["closed", id]);
      if (result.rows.length === 0) {
        return null;
      }
      logger.info("Account closed", { accountId: id });
      return result.rows[0];
    } catch (error) {
      logger.error("Error closing account:", error);
      throw error;
    }
  }
}

module.exports = Account;
