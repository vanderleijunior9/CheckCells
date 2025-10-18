# 📁 Local Video Storage Setup

This guide will configure your CheckCells app to store videos **on your local machine** instead of AWS S3.

---

## ⚡ Quick Setup (2 minutes)

### Step 1: Configure Backend for Local Storage

Create `server/.env` file:

```bash
cd server
cat > .env << 'EOF'
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
```

**Important:** By leaving AWS credentials empty, the server will automatically use **local file storage**.

### Step 2: Configure Frontend

Create `.env` in the **root directory**:

```bash
cd ..  # Back to root
cat > .env << 'EOF'
# Backend API URL
VITE_API_URL=http://localhost:3001
EOF
```

### Step 3: Create Uploads Directory

```bash
cd server
mkdir -p uploads/videos
```

### Step 4: Start Backend Server

```bash
# From server directory
npm run dev
```

You should see:

```
🚀 CheckCells Upload Server is running!
📡 Server: http://localhost:3001
☁️  S3 Status: ⚠️  Not configured (using local storage)
```

The "⚠️ Not configured" message is **CORRECT** - it means videos will be stored locally!

### Step 5: Start Frontend

Open a new terminal:

```bash
# From root directory
npm run dev
```

---

## 📁 Where Videos Are Stored

Videos will be saved in:

```
server/uploads/videos/{testId}/recording_{number}_{timestamp}.webm
```

**Example:**

```
server/uploads/videos/TEST-123/recording_1_1697554800000.webm
server/uploads/videos/TEST-123/recording_2_1697554815000.webm
```

---

## 🎥 How It Works

1. **User records video** in CameraView
2. **Frontend sends video** to backend at `http://localhost:3001/api/upload/video`
3. **Backend saves video** to `server/uploads/` directory
4. **Backend returns local URL** like `http://localhost:3001/uploads/videos/...`
5. **URL is stored** in your database/API

---

## 🔧 Configuration Details

### Backend (server/.env)

```env
# Leave these EMPTY for local storage
AWS_REGION=
AWS_BUCKET_NAME=
AWS_ACCESS_KEY_ID=
AWS_SECRET_ACCESS_KEY=
```

### Frontend (.env)

```env
# Point to your local backend
VITE_API_URL=http://localhost:3001
```

---

## 📊 Testing Local Storage

### Test 1: Check Server Status

```bash
curl http://localhost:3001/
```

**Expected response:**

```json
{
  "message": "CheckCells Upload Server",
  "s3Configured": false // ✅ Should be false for local storage
}
```

### Test 2: Upload a Test Video

```bash
# Create a test video file (or use any .webm/.mp4 file)
curl -X POST http://localhost:3001/api/upload/video \
  -F "video=@test.mp4" \
  -F "testId=TEST-001" \
  -F "recordingNumber=1" \
  -F "scientist=Test User"
```

### Test 3: Check Videos Directory

```bash
ls -la server/uploads/videos/
```

You should see your uploaded videos!

---

## 🌐 Accessing Videos

Videos are served statically at:

```
http://localhost:3001/uploads/videos/{testId}/recording_{number}_{timestamp}.webm
```

You can access them directly in your browser or use them in your app.

---

## 🔐 Security Notes

### For Development (Local Storage)

- ✅ Videos stored on your machine
- ✅ No cloud costs
- ✅ Full control over files
- ⚠️ No backup (videos only on your machine)
- ⚠️ Not scalable for production

### For Production (Use S3)

When you're ready to deploy:

1. Create an AWS S3 bucket
2. Get AWS credentials
3. Fill in the AWS credentials in `server/.env`
4. Server will automatically switch to S3 storage

---

## 📂 Directory Structure

```
CheckCells-1/
├── server/
│   ├── uploads/              # Local video storage
│   │   └── videos/
│   │       ├── TEST-001/
│   │       │   ├── recording_1_xxx.webm
│   │       │   └── recording_2_xxx.webm
│   │       └── TEST-002/
│   │           └── recording_1_xxx.webm
│   ├── .env                  # Backend config (create this)
│   └── ...
├── .env                      # Frontend config (create this)
└── ...
```

---

## 🆘 Troubleshooting

### Videos not saving

**Check 1:** Is backend running?

```bash
curl http://localhost:3001/api/upload/health
```

**Check 2:** Does uploads directory exist?

```bash
ls -la server/uploads/
```

**Check 3:** Check backend logs
Look for "⚠️ Not configured (using local storage)" in the terminal where you ran `npm run dev`

### Frontend can't connect to backend

**Check 1:** Is `VITE_API_URL` set?

```bash
cat .env
```

**Check 2:** Restart frontend after adding .env

```bash
# Stop frontend (Ctrl+C)
npm run dev  # Start again
```

### Permission errors

**Fix:** Make sure uploads directory is writable

```bash
chmod -R 755 server/uploads/
```

---

## 💾 Backup Your Videos

Since videos are stored locally, **backup regularly**:

```bash
# Backup videos to another location
cp -r server/uploads/videos ~/Backups/checkcells-videos-$(date +%Y%m%d)
```

Or use cloud sync:

- Google Drive
- Dropbox
- OneDrive

---

## ✨ Summary

1. Create `server/.env` with **empty** AWS credentials
2. Create `.env` with `VITE_API_URL=http://localhost:3001`
3. Create `server/uploads/videos` directory
4. Start backend: `cd server && npm run dev`
5. Start frontend: `npm run dev`
6. Videos saved in `server/uploads/videos/`

**That's it!** Your videos are now stored locally on your machine! 🎉
