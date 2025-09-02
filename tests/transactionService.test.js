const TransactionService = require('../src/services/TransactionService');
const Account = require('../src/models/Account');
const Customer = require('../src/models/Customer');
const pool = require('../src/config/database');

describe('TransactionService Tests', () => {
  let testCustomerId;
  let testAccountId1;
  let testAccountId2;

  beforeAll(async () => {
    // Create test customer
    const customerData = {
      first_name: 'Service',
      last_name: 'Test',
      email: 'service.test@test.com',
      phone: '+1234567890'
    };
    const customer = await Customer.create(customerData);
    testCustomerId = customer.id;

    // Create test accounts
    const account1 = await Account.create({
      customer_id: testCustomerId,
      account_type: 'checking',
      balance: 1000
    });
    testAccountId1 = account1.id;

    const account2 = await Account.create({
      customer_id: testCustomerId,
      account_type: 'savings',
      balance: 500
    });
    testAccountId2 = account2.id;
  });

  afterAll(async () => {
    // Clean up test data
    if (testCustomerId) {
      await pool.query('DELETE FROM customers WHERE id = $1', [testCustomerId]);
    }
  });

  describe('Deposit', () => {
    test('should deposit money successfully', async () => {
      const amount = 200;
      const description = 'Test deposit';
      const userId = 1;

      const result = await TransactionService.deposit(
        testAccountId1,
        amount,
        description,
        userId
      );

      expect(result).toBeDefined();
      expect(result.transaction).toBeDefined();
      expect(result.transaction.amount).toBe('200.00');
      expect(result.transaction.transaction_type).toBe('deposit');
      expect(result.newBalance).toBe(1200);

      // Verify account balance was updated
      const account = await Account.findById(testAccountId1);
      expect(parseFloat(account.balance)).toBe(1200);
    });

    test('should fail deposit to non-existent account', async () => {
      const amount = 100;
      const description = 'Test deposit';
      const userId = 1;

      await expect(
        TransactionService.deposit(99999, amount, description, userId)
      ).rejects.toThrow('Account not found');
    });

    test('should fail deposit to inactive account', async () => {
      // Close the account
      await Account.close(testAccountId1);

      const amount = 100;
      const description = 'Test deposit';
      const userId = 1;

      await expect(
        TransactionService.deposit(testAccountId1, amount, description, userId)
      ).rejects.toThrow('Account is not active');

      // Reopen account for other tests
      await Account.update(testAccountId1, { status: 'active' });
    });
  });

  describe('Withdrawal', () => {
    test('should withdraw money successfully', async () => {
      const amount = 150;
      const description = 'Test withdrawal';
      const userId = 1;

      const result = await TransactionService.withdrawal(
        testAccountId1,
        amount,
        description,
        userId
      );

      expect(result).toBeDefined();
      expect(result.transaction).toBeDefined();
      expect(result.transaction.amount).toBe('150.00');
      expect(result.transaction.transaction_type).toBe('withdrawal');
      expect(result.newBalance).toBe(1050);

      // Verify account balance was updated
      const account = await Account.findById(testAccountId1);
      expect(parseFloat(account.balance)).toBe(1050);
    });

    test('should fail withdrawal with insufficient funds', async () => {
      const amount = 2000; // More than available balance
      const description = 'Large withdrawal';
      const userId = 1;

      await expect(
        TransactionService.withdrawal(testAccountId1, amount, description, userId)
      ).rejects.toThrow('Insufficient funds');
    });

    test('should fail withdrawal from non-existent account', async () => {
      const amount = 100;
      const description = 'Test withdrawal';
      const userId = 1;

      await expect(
        TransactionService.withdrawal(99999, amount, description, userId)
      ).rejects.toThrow('Account not found');
    });
  });

  describe('Transfer', () => {
    test('should transfer money between accounts successfully', async () => {
      const amount = 100;
      const description = 'Test transfer';
      const userId = 1;

      const result = await TransactionService.transfer(
        testAccountId1,
        testAccountId2,
        amount,
        description,
        userId
      );

      expect(result).toBeDefined();
      expect(result.fromTransaction).toBeDefined();
      expect(result.toTransaction).toBeDefined();
      expect(result.fromTransaction.amount).toBe('100.00');
      expect(result.toTransaction.amount).toBe('100.00');
      expect(result.fromTransaction.transaction_type).toBe('transfer_out');
      expect(result.toTransaction.transaction_type).toBe('transfer_in');
      expect(result.fromNewBalance).toBe(950);
      expect(result.toNewBalance).toBe(600);

      // Verify both account balances were updated
      const account1 = await Account.findById(testAccountId1);
      const account2 = await Account.findById(testAccountId2);
      expect(parseFloat(account1.balance)).toBe(950);
      expect(parseFloat(account2.balance)).toBe(600);
    });

    test('should fail transfer with insufficient funds', async () => {
      const amount = 2000; // More than available balance
      const description = 'Large transfer';
      const userId = 1;

      await expect(
        TransactionService.transfer(testAccountId1, testAccountId2, amount, description, userId)
      ).rejects.toThrow('Insufficient funds');
    });

    test('should fail transfer to same account', async () => {
      const amount = 100;
      const description = 'Self transfer';
      const userId = 1;

      await expect(
        TransactionService.transfer(testAccountId1, testAccountId1, amount, description, userId)
      ).rejects.toThrow('Cannot transfer to the same account');
    });

    test('should fail transfer from non-existent account', async () => {
      const amount = 100;
      const description = 'Test transfer';
      const userId = 1;

      await expect(
        TransactionService.transfer(99999, testAccountId2, amount, description, userId)
      ).rejects.toThrow('One or both accounts not found');
    });
  });

  describe('Concurrent Operations', () => {
    test('should handle concurrent deposits correctly', async () => {
      const amount = 50;
      const description = 'Concurrent deposit';
      const userId = 1;

      // Perform multiple concurrent deposits
      const promises = Array(5).fill().map(() =>
        TransactionService.deposit(testAccountId1, amount, description, userId)
      );

      const results = await Promise.all(promises);

      // All deposits should succeed
      expect(results).toHaveLength(5);
      results.forEach(result => {
        expect(result.transaction.amount).toBe('50.00');
      });

      // Final balance should be correct
      const account = await Account.findById(testAccountId1);
      expect(parseFloat(account.balance)).toBe(1200); // 950 + (5 * 50)
    });
  });
});
