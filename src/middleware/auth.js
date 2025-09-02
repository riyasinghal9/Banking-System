const jwt = require("jsonwebtoken");
const pool = require("../config/database").pool;
const logger = require("../utils/logger");

// Protect routes - verify JWT token
const protect = async (req, res, next) => {
  try {
    let token;

    // Check for token in headers
    if (req.headers.authorization && req.headers.authorization.startsWith("Bearer")) {
      token = req.headers.authorization.split(" ")[1];
    }

    // Make sure token exists
    if (!token) {
      return res.status(401).json({
        success: false,
        error: "Not authorized to access this route"
      });
    }

    try {
      // Verify token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      
      // Get user from database
      const result = await pool.query(
        "SELECT u.*, c.first_name, c.last_name, c.email FROM users u LEFT JOIN customers c ON u.customer_id = c.id WHERE u.id = $1 AND u.is_active = true",
        [decoded.id]
      );

      if (result.rows.length === 0) {
        return res.status(401).json({
          success: false,
          error: "User not found or inactive"
        });
      }

      req.user = result.rows[0];
      next();
    } catch (error) {
      logger.logSecurity("Invalid token attempt", {
        token: token.substring(0, 20) + "...",
        ip: req.ip,
        userAgent: req.get("User-Agent")
      });
      
      return res.status(401).json({
        success: false,
        error: "Not authorized to access this route"
      });
    }
  } catch (error) {
    logger.error("Auth middleware error:", error);
    return res.status(500).json({
      success: false,
      error: "Server error"
    });
  }
};

// Grant access to specific roles
const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: "Not authorized to access this route"
      });
    }

    if (!roles.includes(req.user.role)) {
      logger.logSecurity("Unauthorized access attempt", {
        userId: req.user.id,
        userRole: req.user.role,
        requiredRoles: roles,
        ip: req.ip
      });
      
      return res.status(403).json({
        success: false,
        error: "User role " + req.user.role + " is not authorized to access this route"
      });
    }
    next();
  };
};

// Check if user owns the resource or is admin
const authorizeResource = (resourceUserIdField = "customer_id") => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: "Not authorized to access this route"
      });
    }

    // Admin can access any resource
    if (req.user.role === "admin") {
      return next();
    }

    // Check if user owns the resource
    const resourceUserId = req.params[resourceUserIdField] || req.body[resourceUserIdField];
    
    if (req.user.customer_id && req.user.customer_id.toString() === resourceUserId) {
      return next();
    }

    logger.logSecurity("Unauthorized resource access attempt", {
      userId: req.user.id,
      resourceUserId,
      ip: req.ip
    });

    return res.status(403).json({
      success: false,
      error: "Not authorized to access this resource"
    });
  };
};

module.exports = {
  protect,
  authorize,
  authorizeResource
};
