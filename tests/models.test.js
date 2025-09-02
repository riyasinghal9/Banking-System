const Customer = require('../src/models/Customer');
const Account = require('../src/models/Account');
const Transaction = require('../src/models/Transaction');
const User = require('../src/models/User');
const pool = require('../src/config/database');

describe('Model Tests', () => {
  let testCustomerId;
  let testAccountId;
  let testUserId;

  beforeAll(async () => {
    // Clean up any existing test data
    await pool.query('DELETE FROM transactions WHERE description LIKE \'Test%\'');
    await pool.query('DELETE FROM accounts WHERE account_number LIKE \'TEST%\'');
    await pool.query('DELETE FROM users WHERE username LIKE \'test%\'');
    await pool.query('DELETE FROM customers WHERE email LIKE \'%test.com\'');
  });

  afterAll(async () => {
    // Clean up test data
    if (testCustomerId) {
      await pool.query('DELETE FROM customers WHERE id = $1', [testCustomerId]);
    }
  });

  describe('Customer Model', () => {
    test('should create a new customer', async () => {
      const customerData = {
        first_name: 'Test',
        last_name: 'Customer',
        email: 'test.customer@test.com',
        phone: '+1234567890',
        address: '123 Test St',
        city: 'Test City',
        state: 'TS',
        zip_code: '12345'
      };

      const customer = await Customer.create(customerData);
      testCustomerId = customer.id;

      expect(customer).toBeDefined();
      expect(customer.first_name).toBe('Test');
      expect(customer.email).toBe('test.customer@test.com');
    });

    test('should find customer by ID', async () => {
      const customer = await Customer.findById(testCustomerId);
      expect(customer).toBeDefined();
      expect(customer.id).toBe(testCustomerId);
    });

    test('should find customer by email', async () => {
      const customer = await Customer.findByEmail('test.customer@test.com');
      expect(customer).toBeDefined();
      expect(customer.email).toBe('test.customer@test.com');
    });

    test('should update customer', async () => {
      const updateData = {
        first_name: 'Updated',
        city: 'Updated City'
      };

      const updatedCustomer = await Customer.update(testCustomerId, updateData);
      expect(updatedCustomer.first_name).toBe('Updated');
      expect(updatedCustomer.city).toBe('Updated City');
    });

    test('should get all customers with pagination', async () => {
      const result = await Customer.findAll(1, 5);
      expect(result.customers).toBeInstanceOf(Array);
      expect(result.pagination).toBeDefined();
      expect(result.pagination.page).toBe(1);
      expect(result.pagination.limit).toBe(5);
    });
  });

  describe('Account Model', () => {
    test('should create a new account', async () => {
      const accountData = {
        customer_id: testCustomerId,
        account_type: 'checking',
        balance: 1000,
        interest_rate: 0.01
      };

      const account = await Account.create(accountData);
      testAccountId = account.id;

      expect(account).toBeDefined();
      expect(account.customer_id).toBe(testCustomerId);
      expect(account.account_type).toBe('checking');
      expect(account.balance).toBe('1000.00');
    });

    test('should find account by ID', async () => {
      const account = await Account.findById(testAccountId);
      expect(account).toBeDefined();
      expect(account.id).toBe(testAccountId);
    });

    test('should update account balance', async () => {
      const newBalance = 1500;
      const updatedAccount = await Account.updateBalance(testAccountId, newBalance);
      expect(updatedAccount.balance).toBe('1500.00');
    });

    test('should close account', async () => {
      const closedAccount = await Account.close(testAccountId);
      expect(closedAccount.status).toBe('closed');
    });
  });

  describe('User Model', () => {
    test('should create a new user', async () => {
      const userData = {
        customer_id: testCustomerId,
        username: 'testuser',
        password: 'password123',
        role: 'customer'
      };

      const user = await User.create(userData);
      testUserId = user.id;

      expect(user).toBeDefined();
      expect(user.username).toBe('testuser');
      expect(user.role).toBe('customer');
      expect(user.password_hash).toBeUndefined(); // Should not return password hash
    });

    test('should find user by username', async () => {
      const user = await User.findByUsername('testuser');
      expect(user).toBeDefined();
      expect(user.username).toBe('testuser');
    });

    test('should validate password', async () => {
      const user = await User.findByUsername('testuser');
      const isValid = await User.validatePassword('password123', user.password_hash);
      expect(isValid).toBe(true);

      const isInvalid = await User.validatePassword('wrongpassword', user.password_hash);
      expect(isInvalid).toBe(false);
    });

    test('should update password', async () => {
      const newPassword = 'newpassword123';
      const result = await User.updatePassword(testUserId, newPassword);
      expect(result).toBeDefined();
      expect(result.id).toBe(testUserId);

      // Verify new password works
      const user = await User.findByUsername('testuser');
      const isValid = await User.validatePassword(newPassword, user.password_hash);
      expect(isValid).toBe(true);
    });
  });

  describe('Transaction Model', () => {
    test('should create a new transaction', async () => {
      // Reopen account for transaction
      await Account.update(testAccountId, { status: 'active' });

      const transactionData = {
        account_id: testAccountId,
        transaction_type: 'deposit',
        amount: 500,
        balance_after: 2000,
        description: 'Test deposit'
      };

      const transaction = await Transaction.create(transactionData);
      expect(transaction).toBeDefined();
      expect(transaction.account_id).toBe(testAccountId);
      expect(transaction.transaction_type).toBe('deposit');
      expect(transaction.amount).toBe('500.00');
    });

    test('should find transactions by account ID', async () => {
      const result = await Transaction.findByAccountId(testAccountId, 1, 10);
      expect(result.transactions).toBeInstanceOf(Array);
      expect(result.pagination).toBeDefined();
    });

    test('should get transaction history with date range', async () => {
      const startDate = new Date(Date.now() - 24 * 60 * 60 * 1000); // 1 day ago
      const endDate = new Date();
      
      const result = await Transaction.getTransactionHistory(
        testAccountId, 
        startDate.toISOString(), 
        endDate.toISOString(), 
        1, 
        10
      );
      
      expect(result.transactions).toBeInstanceOf(Array);
      expect(result.pagination).toBeDefined();
    });
  });
});
