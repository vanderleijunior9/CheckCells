#!/bin/bash

# CheckCells Local Storage Setup Script

echo "🎥 Setting up CheckCells for LOCAL video storage..."
echo ""

# Step 1: Create backend .env for local storage
echo "📝 Step 1: Configuring backend for local storage..."
cat > server/.env << 'EOF'
# Server Configuration
PORT=3001

# Frontend URL (for CORS)
FRONTEND_URL=http://localhost:5173

# AWS S3 Configuration - Leave empty to use local storage
AWS_REGION=
AWS_BUCKET_NAME=
AWS_ACCESS_KEY_ID=
AWS_SECRET_ACCESS_KEY=

# Upload Configuration
MAX_FILE_SIZE=524288000
EOF

if [ $? -eq 0 ]; then
    echo "✅ Backend configured for local storage"
else
    echo "❌ Failed to create server/.env"
    exit 1
fi

# Step 2: Create frontend .env
echo ""
echo "📝 Step 2: Configuring frontend to use backend..."
cat > .env << 'EOF'
# Backend API URL
VITE_API_URL=http://localhost:3001
EOF

if [ $? -eq 0 ]; then
    echo "✅ Frontend configured"
else
    echo "❌ Failed to create .env"
    exit 1
fi

# Step 3: Create uploads directory
echo ""
echo "📁 Step 3: Creating uploads directory..."
mkdir -p server/uploads/videos

if [ $? -eq 0 ]; then
    echo "✅ Created server/uploads/videos/"
else
    echo "❌ Failed to create uploads directory"
    exit 1
fi

echo ""
echo "✅ Setup complete!"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🎉 Local video storage is ready!"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "📹 Videos will be saved in: server/uploads/videos/"
echo ""
echo "Next steps:"
echo ""
echo "1. Start the backend server:"
echo "   cd server"
echo "   npm run dev"
echo ""
echo "2. In a new terminal, start the frontend:"
echo "   npm run dev"
echo ""
echo "3. Record videos in your app - they'll be saved locally!"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

