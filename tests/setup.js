// Global test setup
beforeAll(async () => {
  // Set test environment
  process.env.NODE_ENV = "test";
  
  // Test database connection
  try {
    const { pool } = require("../src/config/database");
    await pool.query("SELECT 1");
    console.log("Test database connected successfully");
  } catch (error) {
    console.error("Failed to connect to test database:", error);
    throw error;
  }
});

// Global test teardown
afterAll(async () => {
  // Close all database connections
  try {
    const { pool } = require("../src/config/database");
    await pool.end();
    console.log("Test database connections closed");
  } catch (error) {
    console.error("Error closing database connections:", error);
  }
});

// Handle unhandled promise rejections in tests
process.on("unhandledRejection", (reason, promise) => {
  console.error("Unhandled Rejection at:", promise, "reason:", reason);
});

// Handle uncaught exceptions in tests
process.on("uncaughtException", (error) => {
  console.error("Uncaught Exception:", error);
  process.exit(1);
});
