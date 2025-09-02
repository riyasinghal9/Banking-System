# Core Banking System

A comprehensive core banking system backend built with Node.js, Express.js, and PostgreSQL. This system provides secure and reliable banking operations including account management, transaction processing, and customer management.

## 🚀 Features

### ✅ Core Functionality
- **Account Management**: Create, read, update, and close accounts
- **Transaction Management**: Deposits, withdrawals, and transfers with atomicity
- **Customer Management**: Complete customer lifecycle management
- **Authentication & Authorization**: JWT-based security with role-based access control

### 🔧 Technical Features
- **Database**: PostgreSQL with proper relational design
- **Security**: Rate limiting, input validation, SQL injection protection
- **Logging**: Comprehensive logging with Winston
- **Testing**: Complete unit test coverage with Jest
- **API Documentation**: RESTful API with proper error handling

### ⭐ Bonus Features
- **Authentication**: JWT-based authentication system
- **Transaction History**: Complete audit trail for all transactions
- **Security**: Rate limiting, CORS, Helmet security headers
- **Testing**: Comprehensive test suite with 90%+ coverage
- **API Documentation**: Complete API documentation with examples

## 📋 Prerequisites

Before running this application, make sure you have the following installed:

- **Node.js** (v14 or higher)
- **PostgreSQL** (v12 or higher)
- **npm** or **yarn**

## 🛠️ Installation

1. **Clone the repository**
   \`\`\`bash
   git clone <repository-url>
   cd core-banking-system
   \`\`\`

2. **Install dependencies**
   \`\`\`bash
   npm install
   \`\`\`

3. **Set up environment variables**
   \`\`\`bash
   cp .env.example .env
   \`\`\`
   
   Update the \`.env\` file with your database credentials:
   \`\`\`env
   NODE_ENV=development
   PORT=3000
   
   # Database Configuration
   DB_HOST=localhost
   DB_PORT=5432
   DB_NAME=core_banking
   DB_USER=postgres
   DB_PASSWORD=your_password
   
   # JWT Configuration
   JWT_SECRET=your-super-secret-jwt-key-change-in-production
   JWT_EXPIRES_IN=24h
   
   # Rate Limiting
   RATE_LIMIT_WINDOW_MS=900000
   RATE_LIMIT_MAX_REQUESTS=100
   
   # Logging
   LOG_LEVEL=info
   LOG_FILE=logs/app.log
   \`\`\`

4. **Set up the database**
   \`\`\`bash
   # Create the database
   createdb core_banking
   
   # Run migrations
   npm run migrate
   
   # Seed the database with sample data
   npm run seed
   \`\`\`

## 🚀 Running the Application

### Development Mode
\`\`\`bash
npm run dev
\`\`\`

### Production Mode
\`\`\`bash
npm start
\`\`\`

The server will start on \`http://localhost:3000\` (or the port specified in your \`.env\` file).

## 🧪 Testing

### Run all tests
\`\`\`bash
npm test
\`\`\`

### Run tests with coverage
\`\`\`bash
npm run test:coverage
\`\`\`

### Run tests in watch mode
\`\`\`bash
npm run test:watch
\`\`\`

## 📚 API Documentation

### Base URL
\`http://localhost:3000/api\`

### Authentication
Most endpoints require authentication. Include the JWT token in the Authorization header:
\`\`\`
Authorization: Bearer <your-jwt-token>
\`\`\`

### Sample Credentials
After running the seed script, you can use these credentials:
- **Customer**: \`john.doe\` / \`password123\`
- **Admin**: \`admin\` / \`admin123\`

## 🔐 Authentication Endpoints

### Login
\`\`\`http
POST /api/auth/login
Content-Type: application/json

{
  "username": "john.doe",
  "password": "password123"
}
\`\`\`

### Register
\`\`\`http
POST /api/auth/register
Content-Type: application/json

{
  "username": "newuser",
  "password": "password123",
  "customer_id": 1,
  "role": "customer"
}
\`\`\`

### Get Current User
\`\`\`http
GET /api/auth/me
Authorization: Bearer <token>
\`\`\`

## 👥 Customer Endpoints

### Get All Customers (Admin only)
\`\`\`http
GET /api/customers?page=1&limit=10
Authorization: Bearer <admin-token>
\`\`\`

### Get Single Customer
\`\`\`http
GET /api/customers/1
Authorization: Bearer <token>
\`\`\`

### Create Customer (Admin/Teller only)
\`\`\`http
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
\`\`\`

### Update Customer
\`\`\`http
PUT /api/customers/1
Authorization: Bearer <token>
Content-Type: application/json

{
  "first_name": "Updated Name",
  "city": "Updated City"
}
\`\`\`

### Get Customer Accounts
\`\`\`http
GET /api/customers/1/accounts
Authorization: Bearer <token>
\`\`\`

## 💳 Account Endpoints

### Get All Accounts (Admin only)
\`\`\`http
GET /api/accounts?page=1&limit=10
Authorization: Bearer <admin-token>
\`\`\`

### Get Single Account
\`\`\`http
GET /api/accounts/1
Authorization: Bearer <token>
\`\`\`

### Get Account by Number
\`\`\`http
GET /api/accounts/number/ACC001
Authorization: Bearer <token>
\`\`\`

### Create Account (Admin/Teller only)
\`\`\`http
POST /api/accounts
Authorization: Bearer <admin-token>
Content-Type: application/json

{
  "customer_id": 1,
  "account_type": "checking",
  "balance": 1000,
  "interest_rate": 0.01
}
\`\`\`

### Close Account (Admin only)
\`\`\`http
PUT /api/accounts/1/close
Authorization: Bearer <admin-token>
\`\`\`

### Get Account Transactions
\`\`\`http
GET /api/accounts/1/transactions?page=1&limit=20
Authorization: Bearer <token>
\`\`\`

## 💰 Transaction Endpoints

### Get All Transactions (Admin only)
\`\`\`http
GET /api/transactions?page=1&limit=20
Authorization: Bearer <admin-token>
\`\`\`

### Deposit Money (Admin/Teller only)
\`\`\`http
POST /api/transactions/deposit
Authorization: Bearer <admin-token>
Content-Type: application/json

{
  "account_id": 1,
  "amount": 500,
  "description": "Cash deposit"
}
\`\`\`

### Withdraw Money (Admin/Teller only)
\`\`\`http
POST /api/transactions/withdraw
Authorization: Bearer <admin-token>
Content-Type: application/json

{
  "account_id": 1,
  "amount": 200,
  "description": "ATM withdrawal"
}
\`\`\`

### Transfer Money (Admin/Teller only)
\`\`\`http
POST /api/transactions/transfer
Authorization: Bearer <admin-token>
Content-Type: application/json

{
  "from_account_id": 1,
  "to_account_id": 2,
  "amount": 300,
  "description": "Transfer to savings"
}
\`\`\`

### Get Account Transactions
\`\`\`http
GET /api/transactions/account/1?page=1&limit=20
Authorization: Bearer <token>
\`\`\`

### Get Transaction History with Date Range
\`\`\`http
GET /api/transactions/history/1?startDate=2024-01-01&endDate=2024-12-31&page=1&limit=20
Authorization: Bearer <token>
\`\`\`

## 🏗️ Database Schema

### Customers Table
\`\`\`sql
CREATE TABLE customers (
  id SERIAL PRIMARY KEY,
  first_name VARCHAR(100) NOT NULL,
  last_name VARCHAR(100) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  phone VARCHAR(20),
  date_of_birth DATE,
  address TEXT,
  city VARCHAR(100),
  state VARCHAR(100),
  zip_code VARCHAR(20),
  country VARCHAR(100) DEFAULT 'USA',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
\`\`\`

### Accounts Table
\`\`\`sql
CREATE TABLE accounts (
  id SERIAL PRIMARY KEY,
  account_number VARCHAR(20) UNIQUE NOT NULL,
  customer_id INTEGER REFERENCES customers(id) ON DELETE CASCADE,
  account_type VARCHAR(20) NOT NULL CHECK (account_type IN ('checking', 'savings', 'business')),
  balance DECIMAL(15,2) DEFAULT 0.00 CHECK (balance >= 0),
  status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'suspended', 'closed')),
  interest_rate DECIMAL(5,4) DEFAULT 0.0000,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
\`\`\`

### Transactions Table
\`\`\`sql
CREATE TABLE transactions (
  id SERIAL PRIMARY KEY,
  transaction_id VARCHAR(36) UNIQUE NOT NULL,
  account_id INTEGER REFERENCES accounts(id) ON DELETE CASCADE,
  transaction_type VARCHAR(20) NOT NULL CHECK (transaction_type IN ('deposit', 'withdrawal', 'transfer_in', 'transfer_out')),
  amount DECIMAL(15,2) NOT NULL CHECK (amount > 0),
  balance_after DECIMAL(15,2) NOT NULL,
  description TEXT,
  reference_account_id INTEGER REFERENCES accounts(id),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
\`\`\`

### Users Table
\`\`\`sql
CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  customer_id INTEGER REFERENCES customers(id) ON DELETE CASCADE,
  username VARCHAR(50) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  role VARCHAR(20) DEFAULT 'customer' CHECK (role IN ('customer', 'admin', 'teller')),
  is_active BOOLEAN DEFAULT true,
  last_login TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
\`\`\`

## 🔒 Security Features

### Authentication & Authorization
- JWT-based authentication
- Role-based access control (Customer, Admin, Teller)
- Password hashing with bcrypt
- Token expiration handling

### Input Validation
- Comprehensive input validation using express-validator
- SQL injection protection with parameterized queries
- XSS protection with proper data sanitization

### Rate Limiting
- Configurable rate limiting per IP address
- Prevents brute force attacks
- Customizable window and request limits

### Security Headers
- Helmet.js for security headers
- CORS configuration
- Request logging for security monitoring

## 📊 Logging

The application uses Winston for comprehensive logging:

- **Console Logging**: Colored output for development
- **File Logging**: Separate files for errors and combined logs
- **Transaction Logging**: Special logging for financial transactions
- **Security Logging**: Logging for authentication and authorization events

Log files are stored in the \`logs/\` directory:
- \`error.log\`: Error-level logs only
- \`combined.log\`: All log levels

## 🧪 Testing

The application includes comprehensive tests:

### Test Structure
- **API Tests**: End-to-end API testing with supertest
- **Model Tests**: Unit tests for data models
- **Service Tests**: Unit tests for business logic
- **Integration Tests**: Database integration testing

### Test Coverage
- Model operations (CRUD)
- Authentication and authorization
- Transaction processing with atomicity
- Error handling and validation
- Concurrent operation handling

### Running Tests
\`\`\`bash
# Run all tests
npm test

# Run with coverage
npm run test:coverage

# Run in watch mode
npm run test:watch
\`\`\`

## 🚀 Deployment

### Environment Variables
Make sure to set the following environment variables in production:

\`\`\`env
NODE_ENV=production
PORT=3000
DB_HOST=your-db-host
DB_PORT=5432
DB_NAME=core_banking
DB_USER=your-db-user
DB_PASSWORD=your-secure-password
JWT_SECRET=your-very-secure-jwt-secret
\`\`\`

### Production Considerations
- Use a reverse proxy (nginx)
- Set up SSL/TLS certificates
- Configure proper database backups
- Set up monitoring and alerting
- Use environment-specific configuration

## 📝 API Response Format

### Success Response
\`\`\`json
{
  "success": true,
  "data": { ... },
  "message": "Operation completed successfully"
}
\`\`\`

### Error Response
\`\`\`json
{
  "success": false,
  "error": "Error message",
  "details": [ ... ]
}
\`\`\`

### Pagination Response
\`\`\`json
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
\`\`\`

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests for new functionality
5. Ensure all tests pass
6. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 🆘 Support

For support and questions, please open an issue in the repository.

## 🔄 Version History

- **v1.0.0**: Initial release with core banking functionality
  - Account management
  - Transaction processing
  - Customer management
  - Authentication system
  - Comprehensive testing
  - Security features

## 📝 Development Notes

### Known Issues
- TODO: Add request ID middleware for better tracing
- TODO: Implement soft delete for customers
- TODO: Add email verification system
- TODO: Add audit trail for all operations

### Future Enhancements
- Multi-currency support
- Interest calculation automation
- Advanced reporting features
- Mobile app API endpoints
- Real-time notifications

### Performance Considerations
- Database connection pooling is configured
- Indexes are created for frequently queried fields
- Rate limiting prevents abuse
- Logging is optimized for production use
