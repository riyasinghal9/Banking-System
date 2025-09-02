const pool = require("../config/database").pool;
const Account = require("../models/Account");
const Transaction = require("../models/Transaction");
const logger = require("../utils/logger");

class TransactionService {
  static async deposit(accountId, amount, description = "Deposit") {
    const client = await pool.connect();
    try {
      await client.query("BEGIN");
      
      const account = await Account.findById(accountId);
      if (!account) {
        throw new Error("Account not found");
      }
      
      if (account.status !== "active") {
        throw new Error("Account is not active");
      }
      
      const newBalance = parseFloat(account.balance) + parseFloat(amount);
      
      await Account.updateBalance(accountId, newBalance);
      
      const transaction = await Transaction.create({
        account_id: accountId,
        transaction_type: "deposit",
        amount: parseFloat(amount),
        balance_after: newBalance,
        description: description
      });
      
      await client.query("COMMIT");
      logger.logTransaction({ type: "deposit", accountId, amount, description });
      
      return { 
        success: true, 
        message: "Deposit successful", 
        transaction: transaction,
        newBalance: newBalance 
      };
    } catch (error) {
      await client.query("ROLLBACK");
      logger.error("Error during deposit:", error);
      throw error;
    } finally {
      client.release();
    }
  }

  static async withdrawal(accountId, amount, description = "Withdrawal") {
    const client = await pool.connect();
    try {
      await client.query("BEGIN");
      
      const account = await Account.findById(accountId);
      if (!account) {
        throw new Error("Account not found");
      }
      
      if (account.status !== "active") {
        throw new Error("Account is not active");
      }
      
      if (parseFloat(account.balance) < parseFloat(amount)) {
        throw new Error("Insufficient funds");
      }
      
      const newBalance = parseFloat(account.balance) - parseFloat(amount);
      
      await Account.updateBalance(accountId, newBalance);
      
      const transaction = await Transaction.create({
        account_id: accountId,
        transaction_type: "withdrawal",
        amount: parseFloat(amount),
        balance_after: newBalance,
        description: description
      });
      
      await client.query("COMMIT");
      logger.logTransaction({ type: "withdrawal", accountId, amount, description });
      
      return { 
        success: true, 
        message: "Withdrawal successful", 
        transaction: transaction,
        newBalance: newBalance 
      };
    } catch (error) {
      await client.query("ROLLBACK");
      logger.error("Error during withdrawal:", error);
      throw error;
    } finally {
      client.release();
    }
  }

  static async transfer(fromAccountId, toAccountId, amount, description = "Transfer") {
    const client = await pool.connect();
    try {
      await client.query("BEGIN");
      
      if (fromAccountId === toAccountId) {
        throw new Error("Cannot transfer to the same account");
      }
      
      const fromAccount = await Account.findById(fromAccountId);
      const toAccount = await Account.findById(toAccountId);
      
      if (!fromAccount || !toAccount) {
        throw new Error("One or both accounts not found");
      }
      
      if (fromAccount.status !== "active" || toAccount.status !== "active") {
        throw new Error("One or both accounts are not active");
      }
      
      if (parseFloat(fromAccount.balance) < parseFloat(amount)) {
        throw new Error("Insufficient funds for transfer");
      }
      
      const fromNewBalance = parseFloat(fromAccount.balance) - parseFloat(amount);
      const toNewBalance = parseFloat(toAccount.balance) + parseFloat(amount);
      
      await Account.updateBalance(fromAccountId, fromNewBalance);
      await Account.updateBalance(toAccountId, toNewBalance);
      
      const fromTransaction = await Transaction.create({
        account_id: fromAccountId,
        transaction_type: "transfer_out",
        amount: parseFloat(amount),
        balance_after: fromNewBalance,
        description: description,
        reference_account_id: toAccountId
      });
      
      const toTransaction = await Transaction.create({
        account_id: toAccountId,
        transaction_type: "transfer_in",
        amount: parseFloat(amount),
        balance_after: toNewBalance,
        description: description,
        reference_account_id: fromAccountId
      });
      
      await client.query("COMMIT");
      logger.logTransaction({ 
        type: "transfer", 
        fromAccountId, 
        toAccountId, 
        amount, 
        description 
      });
      
      return { 
        success: true, 
        message: "Transfer successful", 
        fromTransaction: fromTransaction,
        toTransaction: toTransaction,
        fromNewBalance: fromNewBalance,
        toNewBalance: toNewBalance
      };
    } catch (error) {
      await client.query("ROLLBACK");
      logger.error("Error during transfer:", error);
      throw error;
    } finally {
      client.release();
    }
  }
}

module.exports = TransactionService;
