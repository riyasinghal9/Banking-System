const TransactionService = require("../src/services/TransactionService");
const Customer = require("../src/models/Customer");
const Account = require("../src/models/Account");
const { pool } = require("../src/config/database");

describe("TransactionService Tests", () => {
  let testCustomerId;
  let testAccountId1;
  let testAccountId2;
  const userId = 1;

  beforeAll(async () => {
    // Clean up any existing test data first
    await pool.query("DELETE FROM transactions WHERE description LIKE 'Test%' OR description LIKE 'Concurrent%'");
    await pool.query("DELETE FROM accounts WHERE account_number LIKE 'TEST%'");
    await pool.query("DELETE FROM customers WHERE email LIKE '%service.test%'");
    
    // Create test customer
    const customerData = {
      first_name: "Service",
      last_name: "Test",
      email: "service.test@test.com",
      phone: "+1234567890",
      address: "123 Test St",
      city: "Test City",
      state: "TS",
      zip_code: "12345"
    };
    const customer = await Customer.create(customerData);
    testCustomerId = customer.id;

    // Create test accounts
    const account1 = await Account.create({
      customer_id: testCustomerId,
      account_type: "savings",
      balance: 1000,
      interest_rate: 2.5
    });
    testAccountId1 = account1.id;

    const account2 = await Account.create({
      customer_id: testCustomerId,
      account_type: "checking",
      balance: 500,
      interest_rate: 1.5
    });
    testAccountId2 = account2.id;
  });

  afterAll(async () => {
    // Clean up test data in correct order (respecting foreign keys)
    if (testAccountId1) {
      await pool.query("DELETE FROM transactions WHERE account_id = $1 OR reference_account_id = $1", [testAccountId1]);
      await pool.query("DELETE FROM accounts WHERE id = $1", [testAccountId1]);
    }
    if (testAccountId2) {
      await pool.query("DELETE FROM transactions WHERE account_id = $1 OR reference_account_id = $1", [testAccountId2]);
      await pool.query("DELETE FROM accounts WHERE id = $1", [testAccountId2]);
    }
    if (testCustomerId) {
      await pool.query("DELETE FROM customers WHERE id = $1", [testCustomerId]);
    }
  });

  describe("Deposit", () => {
    test("should deposit money successfully", async () => {
      const amount = 200;
      const description = "Test deposit";

      const result = await TransactionService.deposit(testAccountId1, amount, description, userId);

      expect(result).toBeDefined();
      expect(result.transaction).toBeDefined();
      expect(result.transaction.amount).toBe("200.00");
      expect(result.transaction.transaction_type).toBe("deposit");
      expect(result.newBalance).toBe(1200);
    });

    test("should fail deposit to non-existent account", async () => {
      const amount = 100;
      const description = "Test deposit";

      await expect(
        TransactionService.deposit(99999, amount, description, userId)
      ).rejects.toThrow("Account not found");
    });

    test("should fail deposit to inactive account", async () => {
      // Close account first
      await Account.close(testAccountId1);

      const amount = 100;
      const description = "Test deposit";

      await expect(
        TransactionService.deposit(testAccountId1, amount, description, userId)
      ).rejects.toThrow("Account is not active");

      // Reopen account for other tests
      await Account.update(testAccountId1, { status: "active" });
    });
  });

  describe("Withdrawal", () => {
    test("should withdraw money successfully", async () => {
      const amount = 100;
      const description = "Test withdrawal";

      const result = await TransactionService.withdrawal(testAccountId1, amount, description, userId);

      expect(result).toBeDefined();
      expect(result.transaction).toBeDefined();
      expect(result.transaction.amount).toBe("100.00");
      expect(result.transaction.transaction_type).toBe("withdrawal");
      expect(result.newBalance).toBe(1100);
    });

    test("should fail withdrawal with insufficient funds", async () => {
      const amount = 2000;
      const description = "Test withdrawal";

      await expect(
        TransactionService.withdrawal(testAccountId1, amount, description, userId)
      ).rejects.toThrow("Insufficient funds");
    });

    test("should fail withdrawal from non-existent account", async () => {
      const amount = 100;
      const description = "Test withdrawal";

      await expect(
        TransactionService.withdrawal(99999, amount, description, userId)
      ).rejects.toThrow("Account not found");
    });
  });

  describe("Transfer", () => {
    test("should transfer money between accounts successfully", async () => {
      const amount = 150;
      const description = "Test transfer";

      const result = await TransactionService.transfer(testAccountId1, testAccountId2, amount, description, userId);

      expect(result).toBeDefined();
      expect(result.fromTransaction).toBeDefined();
      expect(result.toTransaction).toBeDefined();
      expect(result.fromTransaction.transaction_type).toBe("transfer_out");
      expect(result.toTransaction.transaction_type).toBe("transfer_in");
    });

    test("should fail transfer with insufficient funds", async () => {
      const amount = 2000;
      const description = "Test transfer";

      await expect(
        TransactionService.transfer(testAccountId1, testAccountId2, amount, description, userId)
      ).rejects.toThrow("Insufficient funds");
    });

    test("should fail transfer to same account", async () => {
      const amount = 100;
      const description = "Test transfer";

      await expect(
        TransactionService.transfer(testAccountId1, testAccountId1, amount, description, userId)
      ).rejects.toThrow("Cannot transfer to the same account");
    });

    test("should fail transfer from non-existent account", async () => {
      const amount = 100;
      const description = "Test transfer";

      await expect(
        TransactionService.transfer(99999, testAccountId2, amount, description, userId)
      ).rejects.toThrow("One or both accounts not found");
    });
  });

  describe("Concurrent Operations", () => {
    test("should handle concurrent deposits correctly", async () => {
      const amount = 50;
      const description = "Concurrent deposit";

      // Make multiple concurrent deposits
      const promises = Array(3).fill().map(() => 
        TransactionService.deposit(testAccountId1, amount, description, userId)
      );

      const results = await Promise.all(promises);

      expect(results).toHaveLength(3);
      results.forEach(result => {
        expect(result).toBeDefined();
        expect(result.transaction).toBeDefined();
      });
    });
  });
});
