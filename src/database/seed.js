const pool = require("../config/database").pool;
const bcrypt = require("bcryptjs");
const { v4: uuidv4 } = require("uuid");

async function seedDatabase() {
  try {
    console.log("Seeding database...");
    
    // Clear existing data
    await pool.query("DELETE FROM transactions");
    await pool.query("DELETE FROM accounts");
    await pool.query("DELETE FROM users");
    await pool.query("DELETE FROM customers");

    // Reset sequences
    await pool.query("ALTER SEQUENCE customers_id_seq RESTART WITH 1");
    await pool.query("ALTER SEQUENCE accounts_id_seq RESTART WITH 1");
    await pool.query("ALTER SEQUENCE transactions_id_seq RESTART WITH 1");
    await pool.query("ALTER SEQUENCE users_id_seq RESTART WITH 1");

    // Insert sample customers
    await pool.query("INSERT INTO customers (first_name, last_name, email, phone, date_of_birth, address, city, state, zip_code) VALUES ('John', 'Doe', 'john.doe@email.com', '+1234567890', '1990-01-15', '123 Main St', 'New York', 'NY', '10001')");
    await pool.query("INSERT INTO customers (first_name, last_name, email, phone, date_of_birth, address, city, state, zip_code) VALUES ('Jane', 'Smith', 'jane.smith@email.com', '+1234567891', '1985-05-20', '456 Oak Ave', 'Los Angeles', 'CA', '90210')");
    await pool.query("INSERT INTO customers (first_name, last_name, email, phone, date_of_birth, address, city, state, zip_code) VALUES ('Bob', 'Johnson', 'bob.johnson@email.com', '+1234567892', '1992-12-10', '789 Pine Rd', 'Chicago', 'IL', '60601')");
    await pool.query("INSERT INTO customers (first_name, last_name, email, phone, date_of_birth, address, city, state, zip_code) VALUES ('Alice', 'Brown', 'alice.brown@email.com', '+1234567893', '1988-08-25', '321 Elm St', 'Houston', 'TX', '77001')");

    // Insert sample accounts
    await pool.query("INSERT INTO accounts (account_number, customer_id, account_type, balance, interest_rate) VALUES ('ACC001', 1, 'checking', 5000.00, 0.0000)");
    await pool.query("INSERT INTO accounts (account_number, customer_id, account_type, balance, interest_rate) VALUES ('ACC002', 1, 'savings', 10000.00, 0.0250)");
    await pool.query("INSERT INTO accounts (account_number, customer_id, account_type, balance, interest_rate) VALUES ('ACC003', 2, 'checking', 2500.00, 0.0000)");
    await pool.query("INSERT INTO accounts (account_number, customer_id, account_type, balance, interest_rate) VALUES ('ACC004', 2, 'savings', 15000.00, 0.0300)");
    await pool.query("INSERT INTO accounts (account_number, customer_id, account_type, balance, interest_rate) VALUES ('ACC005', 3, 'business', 50000.00, 0.0000)");
    await pool.query("INSERT INTO accounts (account_number, customer_id, account_type, balance, interest_rate) VALUES ('ACC006', 4, 'checking', 750.00, 0.0000)");

    // Insert sample users with hashed passwords
    const hashedPassword = await bcrypt.hash("password123", 10);
    const adminPassword = await bcrypt.hash("admin123", 10);
    
    await pool.query("INSERT INTO users (customer_id, username, password_hash, role) VALUES (1, 'john.doe', $1, 'customer')", [hashedPassword]);
    await pool.query("INSERT INTO users (customer_id, username, password_hash, role) VALUES (2, 'jane.smith', $1, 'customer')", [hashedPassword]);
    await pool.query("INSERT INTO users (customer_id, username, password_hash, role) VALUES (3, 'bob.johnson', $1, 'customer')", [hashedPassword]);
    await pool.query("INSERT INTO users (customer_id, username, password_hash, role) VALUES (4, 'alice.brown', $1, 'customer')", [hashedPassword]);
    await pool.query("INSERT INTO users (customer_id, username, password_hash, role) VALUES (NULL, 'admin', $1, 'admin')", [adminPassword]);

    // Insert sample transactions
    const transactions = [
      { account_id: 1, type: "deposit", amount: 5000.00, balance_after: 5000.00, description: "Initial deposit" },
      { account_id: 2, type: "deposit", amount: 10000.00, balance_after: 10000.00, description: "Initial deposit" },
      { account_id: 3, type: "deposit", amount: 2500.00, balance_after: 2500.00, description: "Initial deposit" },
      { account_id: 4, type: "deposit", amount: 15000.00, balance_after: 15000.00, description: "Initial deposit" },
      { account_id: 5, type: "deposit", amount: 50000.00, balance_after: 50000.00, description: "Business account setup" },
      { account_id: 6, type: "deposit", amount: 750.00, balance_after: 750.00, description: "Initial deposit" }
    ];

    for (const transaction of transactions) {
      await pool.query("INSERT INTO transactions (transaction_id, account_id, transaction_type, amount, balance_after, description) VALUES ($1, $2, $3, $4, $5, $6)", [uuidv4(), transaction.account_id, transaction.type, transaction.amount, transaction.balance_after, transaction.description]);
    }

    console.log("Database seeded successfully");
    console.log("Sample data created:");
    console.log("- 4 customers");
    console.log("- 6 accounts");
    console.log("- 5 users (4 customers + 1 admin)");
    console.log("- 6 initial transactions");
    console.log("");
    console.log("Test credentials:");
    console.log("Customer: john.doe / password123");
    console.log("Admin: admin / admin123");
  } catch (error) {
    console.error("Error seeding database:", error);
    throw error;
  }
}

if (require.main === module) {
  seedDatabase()
    .then(() => {
      console.log("Seeding completed");
      process.exit(0);
    })
    .catch((error) => {
      console.error("Seeding failed:", error);
      process.exit(1);
    });
}

module.exports = { seedDatabase };
