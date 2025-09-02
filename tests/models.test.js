const Customer = require("../src/models/Customer");
const Account = require("../src/models/Account");
const Transaction = require("../src/models/Transaction");
const User = require("../src/models/User");
const { pool } = require("../src/config/database");

describe("Model Tests", () => {
  let testCustomerId;
  let testAccountId;
  let testUserId;

  beforeAll(async () => {
    // Clean up any existing test data
    await pool.query("DELETE FROM transactions WHERE description LIKE 'Test%'");
    await pool.query("DELETE FROM accounts WHERE account_number LIKE 'TEST%'");
    await pool.query("DELETE FROM users WHERE username LIKE 'test%'");
    await pool.query("DELETE FROM customers WHERE email LIKE '%test.com'");
  });

  afterAll(async () => {
    // Clean up test data in correct order (respecting foreign keys)
    if (testAccountId) {
      await pool.query("DELETE FROM transactions WHERE account_id = $1", [testAccountId]);
      await pool.query("DELETE FROM accounts WHERE id = $1", [testAccountId]);
    }
    if (testUserId) {
      await pool.query("DELETE FROM users WHERE id = $1", [testUserId]);
    }
    if (testCustomerId) {
      await pool.query("DELETE FROM customers WHERE id = $1", [testCustomerId]);
    }
  });

  describe("Customer Model", () => {
    test("should create a new customer", async () => {
      const customerData = {
        first_name: "Test",
        last_name: "Customer",
        email: "test.customer@test.com",
        phone: "+1234567890",
        address: "123 Test St",
        city: "Test City",
        state: "TS",
        zip_code: "12345"
      };

      const customer = await Customer.create(customerData);
      testCustomerId = customer.id;

      expect(customer).toBeDefined();
      expect(customer.first_name).toBe("Test");
      expect(customer.email).toBe("test.customer@test.com");
    });

    test("should find customer by ID", async () => {
      const customer = await Customer.findById(testCustomerId);
      expect(customer).toBeDefined();
      expect(customer.id).toBe(testCustomerId);
      expect(customer.first_name).toBe("Test");
    });

    test("should find customer by email", async () => {
      const customer = await Customer.findByEmail("test.customer@test.com");
      expect(customer).toBeDefined();
      expect(customer.email).toBe("test.customer@test.com");
    });

    test("should update customer", async () => {
      const updateData = { first_name: "Updated", last_name: "Customer" };
      const updatedCustomer = await Customer.update(testCustomerId, updateData);
      expect(updatedCustomer).toBeDefined();
      expect(updatedCustomer.first_name).toBe("Updated");
    });

    test("should get all customers with pagination", async () => {
      const result = await Customer.findAll(1, 5);
      expect(result).toBeDefined();
      expect(result.customers).toBeDefined();
      expect(result.pagination).toBeDefined();
      expect(Array.isArray(result.customers)).toBe(true);
    });
  });

  describe("Account Model", () => {
    test("should create a new account", async () => {
      const accountData = {
        customer_id: testCustomerId,
        account_type: "savings",
        balance: 1000,
        interest_rate: 2.5
      };

      const account = await Account.create(accountData);
      testAccountId = account.id;

      expect(account).toBeDefined();
      expect(account.customer_id).toBe(testCustomerId);
      expect(account.account_type).toBe("savings");
      expect(parseFloat(account.balance)).toBe(1000);
    });

    test("should find account by ID", async () => {
      const account = await Account.findById(testAccountId);
      expect(account).toBeDefined();
      expect(account.id).toBe(testAccountId);
    });

    test("should update account balance", async () => {
      const newBalance = 1500;
      const updatedAccount = await Account.updateBalance(testAccountId, newBalance);
      expect(updatedAccount).toBeDefined();
      expect(parseFloat(updatedAccount.balance)).toBe(newBalance);
    });

    test("should close account", async () => {
      const closedAccount = await Account.close(testAccountId);
      expect(closedAccount).toBeDefined();
      expect(closedAccount.status).toBe("closed");
    });
  });

  describe("User Model", () => {
    test("should create a new user", async () => {
      const userData = {
        username: "testuser",
        password: "testpassword123",
        customer_id: testCustomerId,
        role: "customer"
      };

      const user = await User.create(userData);
      testUserId = user.id;

      expect(user).toBeDefined();
      expect(user.username).toBe("testuser");
      expect(user.customer_id).toBe(testCustomerId);
    });

    test("should find user by username", async () => {
      const user = await User.findByUsername("testuser");
      expect(user).toBeDefined();
      expect(user.username).toBe("testuser");
    });

    test("should validate password", async () => {
      const isValid = await User.comparePassword("testpassword123", testUserId);
      expect(isValid).toBe(true);
    });

    test("should update password", async () => {
      await User.updatePassword(testUserId, "newpassword123");
      const isValid = await User.comparePassword("newpassword123", testUserId);
      expect(isValid).toBe(true);
    });
  });

  describe("Transaction Model", () => {
    test("should create a new transaction", async () => {
      // Reopen account for transaction test
      await Account.update(testAccountId, { status: "active" });
      
      const transactionData = {
        account_id: testAccountId,
        transaction_type: "deposit",
        amount: 500,
        balance_after: 2000,
        description: "Test deposit"
      };

      const transaction = await Transaction.create(transactionData);
      expect(transaction).toBeDefined();
      expect(transaction.account_id).toBe(testAccountId);
      expect(transaction.transaction_type).toBe("deposit");
      expect(parseFloat(transaction.amount)).toBe(500);
    });

    test("should find transactions by account ID", async () => {
      const transactions = await Transaction.findByAccountId(testAccountId);
      expect(transactions).toBeDefined();
      expect(Array.isArray(transactions)).toBe(true);
      expect(transactions.length).toBeGreaterThan(0);
    });

    test("should get transaction history with date range", async () => {
      const endDate = new Date();
      const startDate = new Date(endDate.getTime() - 24 * 60 * 60 * 1000); // 24 hours ago
      
      const transactions = await Transaction.findByDateRange(startDate, endDate);
      expect(transactions).toBeDefined();
      expect(Array.isArray(transactions)).toBe(true);
    });
  });
});
