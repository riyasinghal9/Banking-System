const pool = require("../config/database").pool;
const bcrypt = require("bcryptjs");
const logger = require("../utils/logger");

class User {
  static async create(userData) {
    const { customer_id, username, password, role = "customer" } = userData;
    try {
      const password_hash = await bcrypt.hash(password, 10);
      const result = await pool.query("INSERT INTO users (customer_id, username, password_hash, role) VALUES ($1, $2, $3, $4) RETURNING id, username, role, customer_id, created_at", [customer_id, username, password_hash, role]);
      logger.info("User created", { userId: result.rows[0].id, username, role });
      return result.rows[0];
    } catch (error) {
      logger.error("Error creating user:", error);
      throw error;
    }
  }

  static async findByUsername(username) {
    try {
      const result = await pool.query("SELECT u.*, c.first_name, c.last_name, c.email FROM users u LEFT JOIN customers c ON u.customer_id = c.id WHERE u.username = $1 AND u.is_active = true", [username]);
      return result.rows[0] || null;
    } catch (error) {
      logger.error("Error finding user by username:", error);
      throw error;
    }
  }

  static async findById(id) {
    try {
      const result = await pool.query("SELECT u.*, c.first_name, c.last_name, c.email FROM users u LEFT JOIN customers c ON u.customer_id = c.id WHERE u.id = $1", [id]);
      return result.rows[0] || null;
    } catch (error) {
      logger.error("Error finding user by ID:", error);
      throw error;
    }
  }

  static async comparePassword(candidatePassword, hash) {
    return bcrypt.compare(candidatePassword, hash);
  }
}

module.exports = User;
