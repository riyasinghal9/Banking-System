const { body, param, query, validationResult } = require('express-validator');
const logger = require('../utils/logger');

// Handle validation errors
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const errorMessages = errors.array().map(error => ({
      field: error.path,
      message: error.msg,
      value: error.value
    }));

    logger.warn('Validation error', {
      errors: errorMessages,
      url: req.url,
      method: req.method,
      ip: req.ip
    });

    return res.status(400).json({
      success: false,
      error: 'Validation failed',
      details: errorMessages
    });
  }
  next();
};

// Customer validation rules
const validateCustomer = [
  body('first_name')
    .trim()
    .isLength({ min: 1, max: 100 })
    .withMessage('First name is required and must be less than 100 characters'),
  body('last_name')
    .trim()
    .isLength({ min: 1, max: 100 })
    .withMessage('Last name is required and must be less than 100 characters'),
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Valid email is required'),
  body('phone')
    .optional()
    .isMobilePhone()
    .withMessage('Valid phone number is required'),
  body('date_of_birth')
    .optional()
    .isISO8601()
    .withMessage('Valid date of birth is required'),
  body('address')
    .optional()
    .isLength({ max: 500 })
    .withMessage('Address must be less than 500 characters'),
  body('city')
    .optional()
    .isLength({ max: 100 })
    .withMessage('City must be less than 100 characters'),
  body('state')
    .optional()
    .isLength({ max: 100 })
    .withMessage('State must be less than 100 characters'),
  body('zip_code')
    .optional()
    .isLength({ max: 20 })
    .withMessage('Zip code must be less than 20 characters'),
  body('country')
    .optional()
    .isLength({ max: 100 })
    .withMessage('Country must be less than 100 characters'),
  handleValidationErrors
];

// Account validation rules
const validateAccount = [
  body('customer_id')
    .isInt({ min: 1 })
    .withMessage('Valid customer ID is required'),
  body('account_type')
    .isIn(['checking', 'savings', 'business'])
    .withMessage('Account type must be checking, savings, or business'),
  body('balance')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Balance must be a positive number'),
  body('interest_rate')
    .optional()
    .isFloat({ min: 0, max: 1 })
    .withMessage('Interest rate must be between 0 and 1'),
  handleValidationErrors
];

// Transaction validation rules
const validateTransaction = [
  body('account_id')
    .isInt({ min: 1 })
    .withMessage('Valid account ID is required'),
  body('amount')
    .isFloat({ min: 0.01 })
    .withMessage('Amount must be a positive number greater than 0'),
  body('description')
    .optional()
    .isLength({ max: 500 })
    .withMessage('Description must be less than 500 characters'),
  handleValidationErrors
];

// Transfer validation rules
const validateTransfer = [
  body('from_account_id')
    .isInt({ min: 1 })
    .withMessage('Valid from account ID is required'),
  body('to_account_id')
    .isInt({ min: 1 })
    .withMessage('Valid to account ID is required'),
  body('amount')
    .isFloat({ min: 0.01 })
    .withMessage('Amount must be a positive number greater than 0'),
  body('description')
    .optional()
    .isLength({ max: 500 })
    .withMessage('Description must be less than 500 characters'),
  handleValidationErrors
];

// Login validation rules
const validateLogin = [
  body('username')
    .trim()
    .isLength({ min: 1 })
    .withMessage('Username is required'),
  body('password')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters'),
  handleValidationErrors
];

// User registration validation rules
const validateUserRegistration = [
  body('username')
    .trim()
    .isLength({ min: 3, max: 50 })
    .withMessage('Username must be between 3 and 50 characters'),
  body('password')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters'),
  body('customer_id')
    .isInt({ min: 1 })
    .withMessage('Valid customer ID is required'),
  body('role')
    .optional()
    .isIn(['customer', 'admin', 'teller'])
    .withMessage('Role must be customer, admin, or teller'),
  handleValidationErrors
];

// ID parameter validation
const validateId = [
  param('id')
    .isInt({ min: 1 })
    .withMessage('Valid ID is required'),
  handleValidationErrors
];

// Account number parameter validation
const validateAccountNumber = [
  param('accountNumber')
    .isLength({ min: 1, max: 20 })
    .withMessage('Valid account number is required'),
  handleValidationErrors
];

// Pagination validation
const validatePagination = [
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Page must be a positive integer'),
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Limit must be between 1 and 100'),
  handleValidationErrors
];

module.exports = {
  handleValidationErrors,
  validateCustomer,
  validateAccount,
  validateTransaction,
  validateTransfer,
  validateLogin,
  validateUserRegistration,
  validateId,
  validateAccountNumber,
  validatePagination
};
