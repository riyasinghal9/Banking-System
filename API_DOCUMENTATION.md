# API Documentation

## Overview

The Core Banking System API provides secure banking operations including customer management, account operations, and transaction processing.

**Base URL**: `http://localhost:3000/api`

## Authentication

Most endpoints require authentication using JWT tokens. Include the token in the Authorization header:

```
Authorization: Bearer <your-jwt-token>
```

## Response Format

### Success Response
```json
{
  "success": true,
  "data": { ... },
  "message": "Operation completed successfully"
}
```

### Error Response
```json
{
  "success": false,
  "error": "Error message",
  "details": [ ... ]
}
```

### Pagination Response
```json
{
  "success": true,
  "data": [ ... ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 100,
    "pages": 10
  }
}
```

## Status Codes

- `200` - Success
- `201` - Created
- `400` - Bad Request
- `401` - Unauthorized
- `403` - Forbidden
- `404` - Not Found
- `409` - Conflict
- `429` - Too Many Requests
- `500` - Internal Server Error

## Endpoints

### Authentication

#### Login
```http
POST /api/auth/login
Content-Type: application/json

{
  "username": "john.doe",
  "password": "password123"
}
```

**Response:**
```json
{
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": 1,
    "username": "john.doe",
    "role": "customer",
    "customer_id": 1,
    "first_name": "John",
    "last_name": "Doe",
    "email": "john.doe@email.com"
  }
}
```

#### Register
```http
POST /api/auth/register
Content-Type: application/json

{
  "username": "newuser",
  "password": "password123",
  "customer_id": 1,
  "role": "customer"
}
```

#### Get Current User
```http
GET /api/auth/me
Authorization: Bearer <token>
```

### Customers

#### Get All Customers (Admin only)
```http
GET /api/customers?page=1&limit=10
Authorization: Bearer <admin-token>
```

#### Get Single Customer
```http
GET /api/customers/1
Authorization: Bearer <token>
```

#### Create Customer (Admin/Teller only)
```http
POST /api/customers
Authorization: Bearer <admin-token>
Content-Type: application/json

{
  "first_name": "John",
  "last_name": "Doe",
  "email": "john.doe@example.com",
  "phone": "+1234567890",
  "address": "123 Main St",
  "city": "New York",
  "state": "NY",
  "zip_code": "10001"
}
```

#### Update Customer
```http
PUT /api/customers/1
Authorization: Bearer <token>
Content-Type: application/json

{
  "first_name": "Updated Name",
  "city": "Updated City"
}
```

#### Get Customer Accounts
```http
GET /api/customers/1/accounts
Authorization: Bearer <token>
```

### Accounts

#### Get All Accounts (Admin only)
```http
GET /api/accounts?page=1&limit=10
Authorization: Bearer <admin-token>
```

#### Get Single Account
```http
GET /api/accounts/1
Authorization: Bearer <token>
```

#### Get Account by Number
```http
GET /api/accounts/number/ACC001
Authorization: Bearer <token>
```

#### Create Account (Admin/Teller only)
```http
POST /api/accounts
Authorization: Bearer <admin-token>
Content-Type: application/json

{
  "customer_id": 1,
  "account_type": "checking",
  "balance": 1000,
  "interest_rate": 0.01
}
```

#### Close Account (Admin only)
```http
PUT /api/accounts/1/close
Authorization: Bearer <admin-token>
```

#### Get Account Transactions
```http
GET /api/accounts/1/transactions?page=1&limit=20
Authorization: Bearer <token>
```

### Transactions

#### Get All Transactions (Admin only)
```http
GET /api/transactions?page=1&limit=20
Authorization: Bearer <admin-token>
```

#### Deposit Money (Admin/Teller only)
```http
POST /api/transactions/deposit
Authorization: Bearer <admin-token>
Content-Type: application/json

{
  "account_id": 1,
  "amount": 500,
  "description": "Cash deposit"
}
```

#### Withdraw Money (Admin/Teller only)
```http
POST /api/transactions/withdraw
Authorization: Bearer <admin-token>
Content-Type: application/json

{
  "account_id": 1,
  "amount": 200,
  "description": "ATM withdrawal"
}
```

#### Transfer Money (Admin/Teller only)
```http
POST /api/transactions/transfer
Authorization: Bearer <admin-token>
Content-Type: application/json

{
  "from_account_id": 1,
  "to_account_id": 2,
  "amount": 300,
  "description": "Transfer to savings"
}
```

#### Get Account Transactions
```http
GET /api/transactions/account/1?page=1&limit=20
Authorization: Bearer <token>
```

#### Get Transaction History with Date Range
```http
GET /api/transactions/history/1?startDate=2024-01-01&endDate=2024-12-31&page=1&limit=20
Authorization: Bearer <token>
```

## Error Handling

The API uses standard HTTP status codes and returns detailed error messages:

### Validation Errors (400)
```json
{
  "success": false,
  "error": "Validation failed",
  "details": [
    {
      "field": "email",
      "message": "Valid email is required",
      "value": "invalid-email"
    }
  ]
}
```

### Authentication Errors (401)
```json
{
  "success": false,
  "error": "Not authorized to access this route"
}
```

### Authorization Errors (403)
```json
{
  "success": false,
  "error": "User role customer is not authorized to access this route"
}
```

### Not Found Errors (404)
```json
{
  "success": false,
  "error": "Customer not found"
}
```

### Conflict Errors (409)
```json
{
  "success": false,
  "error": "Customer with this email already exists"
}
```

### Rate Limiting (429)
```json
{
  "success": false,
  "error": "Too many requests from this IP, please try again later"
}
```

## Rate Limiting

The API implements rate limiting to prevent abuse:
- **Limit**: 100 requests per 15 minutes per IP address
- **Headers**: Rate limit information is included in response headers
- **Exceeded**: Returns 429 status code when limit is exceeded

## Security

### Authentication
- JWT tokens with configurable expiration
- Password hashing with bcrypt
- Role-based access control

### Input Validation
- Comprehensive validation using express-validator
- SQL injection protection
- XSS protection

### Security Headers
- Helmet.js for security headers
- CORS configuration
- Rate limiting

## Testing

Use the provided Postman collection (`postman-collection.json`) for testing the API endpoints.

### Test Credentials
- **Customer**: `john.doe` / `password123`
- **Admin**: `admin` / `admin123`

## Support

For API support and questions, please refer to the project documentation or create an issue in the repository.
