#!/bin/bash

echo '🏦 Core Banking System Setup Script'
echo '=================================='
echo ''

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo '❌ Node.js is not installed. Please install Node.js v14 or higher.'
    exit 1
fi

# Check if PostgreSQL is installed
if ! command -v psql &> /dev/null; then
    echo '❌ PostgreSQL is not installed. Please install PostgreSQL v12 or higher.'
    exit 1
fi

echo '✅ Node.js and PostgreSQL are installed'
echo ''

# Check if .env file exists
if [ ! -f .env ]; then
    echo '📝 Creating .env file from template...'
    cp .env .env.backup 2>/dev/null || true
    echo 'NODE_ENV=development
PORT=3000

# Database Configuration
DB_HOST=localhost
DB_PORT=5432
DB_NAME=core_banking
DB_USER=postgres
DB_PASSWORD=password

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-change-in-production
JWT_EXPIRES_IN=24h

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100

# Logging
LOG_LEVEL=info
LOG_FILE=logs/app.log' > .env
    echo '✅ .env file created. Please update the database credentials.'
else
    echo '✅ .env file already exists'
fi

echo ''
echo '📦 Installing dependencies...'
npm install

echo ''
echo '🗄️  Setting up database...'
echo 'Please make sure PostgreSQL is running and you have created the database.'

# Check if database exists
DB_NAME=$(grep DB_NAME .env | cut -d '=' -f2)
DB_USER=$(grep DB_USER .env | cut -d '=' -f2)
DB_PASSWORD=$(grep DB_PASSWORD .env | cut -d '=' -f2)

echo "Attempting to connect to database: $DB_NAME"

# Try to create database if it doesn't exist
PGPASSWORD=$DB_PASSWORD createdb -h localhost -U $DB_USER $DB_NAME 2>/dev/null || echo 'Database may already exist or connection failed'

echo ''
echo '🔄 Running database migrations...'
npm run migrate

echo ''
echo '🌱 Seeding database with sample data...'
npm run seed

echo ''
echo '🎉 Setup completed successfully!'
echo ''
echo '📋 Next steps:'
echo '1. Update the database credentials in .env file if needed'
echo '2. Run "npm run dev" to start the development server'
echo '3. The API will be available at http://localhost:3000'
echo '4. Use the Postman collection (postman-collection.json) to test the API'
echo ''
echo '🔑 Test credentials:'
echo 'Customer: john.doe / password123'
echo 'Admin: admin / admin123'
echo ''
echo '📚 For more information, see README.md'
