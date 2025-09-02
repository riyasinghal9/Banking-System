const pool = require("../config/database").pool;

async function createTables() {
  try {
    console.log("Creating database tables...");
    
    // Create customers table
    await pool.query("CREATE TABLE IF NOT EXISTS customers (id SERIAL PRIMARY KEY, first_name VARCHAR(100) NOT NULL, last_name VARCHAR(100) NOT NULL, email VARCHAR(255) UNIQUE NOT NULL, phone VARCHAR(20), date_of_birth DATE, address TEXT, city VARCHAR(100), state VARCHAR(100), zip_code VARCHAR(20), country VARCHAR(100) DEFAULT 'USA', created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP, updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP)");
    
    // Create accounts table  
    await pool.query("CREATE TABLE IF NOT EXISTS accounts (id SERIAL PRIMARY KEY, account_number VARCHAR(20) UNIQUE NOT NULL, customer_id INTEGER REFERENCES customers(id) ON DELETE CASCADE, account_type VARCHAR(20) NOT NULL CHECK (account_type IN ('checking', 'savings', 'business')), balance DECIMAL(15,2) DEFAULT 0.00 CHECK (balance >= 0), status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'suspended', 'closed')), interest_rate DECIMAL(5,4) DEFAULT 0.0000, created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP, updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP)");
    
    // Create transactions table
    await pool.query("CREATE TABLE IF NOT EXISTS transactions (id SERIAL PRIMARY KEY, transaction_id VARCHAR(36) UNIQUE NOT NULL, account_id INTEGER REFERENCES accounts(id) ON DELETE CASCADE, transaction_type VARCHAR(20) NOT NULL CHECK (transaction_type IN ('deposit', 'withdrawal', 'transfer_in', 'transfer_out')), amount DECIMAL(15,2) NOT NULL CHECK (amount > 0), balance_after DECIMAL(15,2) NOT NULL, description TEXT, reference_account_id INTEGER REFERENCES accounts(id), created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP)");
    
    // Create users table
    await pool.query("CREATE TABLE IF NOT EXISTS users (id SERIAL PRIMARY KEY, customer_id INTEGER REFERENCES customers(id) ON DELETE CASCADE, username VARCHAR(50) UNIQUE NOT NULL, password_hash VARCHAR(255) NOT NULL, role VARCHAR(20) DEFAULT 'customer' CHECK (role IN ('customer', 'admin', 'teller')), is_active BOOLEAN DEFAULT true, last_login TIMESTAMP, created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP, updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP)");
    
    // Create indexes
    await pool.query("CREATE INDEX IF NOT EXISTS idx_accounts_customer_id ON accounts(customer_id)");
    await pool.query("CREATE INDEX IF NOT EXISTS idx_accounts_account_number ON accounts(account_number)");
    await pool.query("CREATE INDEX IF NOT EXISTS idx_transactions_account_id ON transactions(account_id)");
    await pool.query("CREATE INDEX IF NOT EXISTS idx_transactions_created_at ON transactions(created_at)");
    await pool.query("CREATE INDEX IF NOT EXISTS idx_customers_email ON customers(email)");
    
    console.log("Database tables created successfully");
  } catch (error) {
    console.error("Error creating tables:", error);
    throw error;
  }
}

if (require.main === module) {
  createTables()
    .then(() => {
      console.log("Migration completed");
      process.exit(0);
    })
    .catch((error) => {
      console.error("Migration failed:", error);
      process.exit(1);
    });
}

module.exports = { createTables };
