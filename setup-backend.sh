#!/bin/bash

# CheckCells Backend Setup Script

echo "🚀 Setting up CheckCells Backend Server..."
echo ""

# Check if server directory exists
if [ ! -d "server" ]; then
    echo "❌ Error: server directory not found!"
    exit 1
fi

# Navigate to server directory
cd server

# Install dependencies
echo "📦 Installing backend dependencies..."
npm install

if [ $? -ne 0 ]; then
    echo "❌ Failed to install dependencies"
    exit 1
fi

# Create .env file if it doesn't exist
if [ ! -f ".env" ]; then
    echo ""
    echo "📝 Creating .env file..."
    cp env.example .env
    echo "✅ .env file created from env.example"
    echo ""
    echo "⚠️  IMPORTANT: Please edit server/.env with your AWS credentials!"
    echo ""
else
    echo ""
    echo "✅ .env file already exists"
    echo ""
fi

# Create uploads directory
mkdir -p uploads
echo "✅ Created uploads directory"

echo ""
echo "✅ Backend setup complete!"
echo ""
echo "Next steps:"
echo "1. Edit server/.env with your AWS S3 credentials"
echo "2. Run 'cd server && npm run dev' to start the backend"
echo "3. Backend will run on http://localhost:3001"
echo ""

