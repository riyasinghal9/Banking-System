const pool = require("../config/database").pool;
const logger = require("../utils/logger");

class Customer {
  static async create(customerData) {
    const { first_name, last_name, email, phone, date_of_birth, address, city, state, zip_code, country = "USA" } = customerData;
    try {
      const result = await pool.query("INSERT INTO customers (first_name, last_name, email, phone, date_of_birth, address, city, state, zip_code, country) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10) RETURNING *", [first_name, last_name, email, phone, date_of_birth, address, city, state, zip_code, country]);
      logger.info("Customer created", { customerId: result.rows[0].id, email });
      return result.rows[0];
    } catch (error) {
      logger.error("Error creating customer:", error);
      if (error.code === "23505") {
        throw new Error("Customer with this email already exists");
      }
      throw error;
    }
  }

  static async findById(id) {
    try {
      const result = await pool.query("SELECT * FROM customers WHERE id = $1", [id]);
      return result.rows[0] || null;
    } catch (error) {
      logger.error("Error finding customer by ID:", error);
      throw error;
    }
  }

  static async findByEmail(email) {
    try {
      const result = await pool.query("SELECT * FROM customers WHERE email = $1", [email]);
      return result.rows[0] || null;
    } catch (error) {
      logger.error("Error finding customer by email:", error);
      throw error;
    }
  }

  static async update(id, updateData) {
    try {
      const fields = [];
      const values = [];
      let paramCount = 1;
      Object.keys(updateData).forEach(key => {
        if (updateData[key] !== undefined) {
          fields.push(key + " = $" + paramCount);
          values.push(updateData[key]);
          paramCount++;
        }
      });
      if (fields.length === 0) {
        throw new Error("No fields to update");
      }
      fields.push("updated_at = CURRENT_TIMESTAMP");
      values.push(id);
      const query = "UPDATE customers SET " + fields.join(", ") + " WHERE id = $" + paramCount + " RETURNING *";
      const result = await pool.query(query, values);
      if (result.rows.length === 0) {
        return null;
      }
      logger.info("Customer updated", { customerId: id });
      return result.rows[0];
    } catch (error) {
      logger.error("Error updating customer:", error);
      throw error;
    }
  }

  static async delete(id) {
    try {
      const result = await pool.query("DELETE FROM customers WHERE id = $1 RETURNING *", [id]);
      return result.rows[0] || null;
    } catch (error) {
      logger.error("Error deleting customer:", error);
      throw error;
    }
  }

  static async findAll(page = 1, limit = 10) {
    try {
      const offset = (page - 1) * limit;
      const countResult = await pool.query("SELECT COUNT(*) FROM customers");
      const total = parseInt(countResult.rows[0].count);
      const result = await pool.query("SELECT * FROM customers ORDER BY created_at DESC LIMIT $1 OFFSET $2", [limit, offset]);
      return {
        customers: result.rows,
        pagination: { page, limit, total, pages: Math.ceil(total / limit) }
      };
    } catch (error) {
      logger.error("Error finding all customers:", error);
      throw error;
    }
  }

  static async getAccounts(customerId) {
    try {
      const result = await pool.query("SELECT * FROM accounts WHERE customer_id = $1 ORDER BY created_at DESC", [customerId]);
      return result.rows;
    } catch (error) {
      logger.error("Error getting customer accounts:", error);
      throw error;
    }
  }
}

module.exports = Customer;
