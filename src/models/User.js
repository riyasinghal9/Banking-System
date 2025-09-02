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

  static async comparePassword(candidatePassword, userId) {
    try {
      const user = await this.findById(userId);
      if (!user) {
        return false;
      }
      return bcrypt.compare(candidatePassword, user.password_hash);
    } catch (error) {
      logger.error("Error comparing password:", error);
      throw error;
    }
  }

  static async updatePassword(userId, newPassword) {
    try {
      const password_hash = await bcrypt.hash(newPassword, 10);
      const result = await pool.query("UPDATE users SET password_hash = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2 RETURNING id, username", [password_hash, userId]);
      if (result.rows.length === 0) {
        return null;
      }
      logger.info("User password updated", { userId });
      return result.rows[0];
    } catch (error) {
      logger.error("Error updating password:", error);
      throw error;
    }
  }
}

module.exports = User;
