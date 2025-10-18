# 🚀 Quick Start Guide - Video Upload with Multer

## Overview

Your CheckCells application now has a **backend server** with **Multer** for handling video uploads. This guide will get you up and running in 5 minutes.

---

## ⚡ Quick Setup (5 minutes)

### Step 1: Install Backend Dependencies

```bash
cd server
npm install
```

### Step 2: Configure Backend Environment

Create `.env` file in the `server` directory:

```bash
# In the server directory
cat > .env << EOF
PORT=3001
FRONTEND_URL=http://localhost:5173

AWS_REGION=us-east-1
AWS_BUCKET_NAME=your-bucket-name-here
AWS_ACCESS_KEY_ID=your-access-key-here
AWS_SECRET_ACCESS_KEY=your-secret-key-here

MAX_FILE_SIZE=524288000
EOF
```

**OR** use the automated script:

```bash
cd ..  # Back to root directory
./setup-backend.sh
```

### Step 3: Start the Backend Server

```bash
# From the server directory
npm run dev
```

You should see:

```
🚀 CheckCells Upload Server is running!
📡 Server: http://localhost:3001
```

### Step 4: Configure Frontend (Optional)

Create `.env` in the **root** directory:

```bash
# In the root directory
echo "VITE_API_URL=http://localhost:3001" > .env
```

### Step 5: Start Frontend (Keep backend running)

Open a **new terminal** window:

```bash
npm run dev
```

Your app runs on http://localhost:5173 (or 5175)

---

## 🧪 Test the Upload Server

### Test 1: Health Check

```bash
curl http://localhost:3001/api/upload/health
```

**Expected response:**

```json
{
  "success": true,
  "message": "Upload service is running",
  "timestamp": "2025-10-17T..."
}
```

### Test 2: Upload a Video

```bash
# Create a small test video (if you have ffmpeg)
ffmpeg -f lavfi -i testsrc=duration=5:size=320x240:rate=30 -pix_fmt yuv420p test.mp4

# Upload it
curl -X POST http://localhost:3001/api/upload/video \
  -F "video=@test.mp4" \
  -F "testId=TEST-001" \
  -F "recordingNumber=1" \
  -F "scientist=John Doe"
```

---

## 📁 Project Structure

```
CheckCells-1/
├── server/                     # Backend server (NEW!)
│   ├── config/
│   │   └── s3Config.js        # AWS S3 configuration
│   ├── middleware/
│   │   └── upload.js          # Multer configuration
│   ├── routes/
│   │   └── upload.js          # Upload endpoints
│   ├── uploads/               # Local storage fallback
│   ├── .env                   # Backend environment (create this)
│   ├── server.js              # Main server file
│   └── package.json           # Backend dependencies
│
├── src/
│   ├── services/
│   │   ├── uploadService.ts   # Frontend upload service (NEW!)
│   │   └── s3Service.ts       # Old direct S3 service
│   └── ...
│
├── setup-backend.sh           # Automated setup script
├── MULTER_SETUP.md           # Detailed documentation
└── QUICKSTART.md             # This file
```

---

## 💻 Usage in Your Code

### Example: Upload from CameraView

```typescript
import { uploadVideo } from "../services/uploadService";

const handleVideoUpload = async (videoBlob: Blob) => {
  try {
    const response = await uploadVideo(
      videoBlob,
      {
        testId: "TEST-123",
        recordingNumber: "1",
        scientist: "Dr. Smith",
      },
      (progress) => {
        console.log(`Uploading: ${progress}%`);
      }
    );

    console.log("✅ Video uploaded successfully!");
    console.log("📍 S3 URL:", response.file.url);

    // Save the URL to your database or state
  } catch (error) {
    console.error("❌ Upload failed:", error);
  }
};
```

---

## 🔧 Common Issues & Solutions

### Backend won't start

**Issue:** Port 3001 already in use

**Solution:**

```bash
# Change PORT in server/.env
PORT=3002
```

### CORS errors in browser

**Issue:** Frontend can't connect to backend

**Solution:** Verify `FRONTEND_URL` in `server/.env`:

```env
FRONTEND_URL=http://localhost:5173
```

### Upload fails with "413 Payload Too Large"

**Issue:** Video file exceeds size limit

**Solution:** Increase `MAX_FILE_SIZE` in `server/.env`:

```env
MAX_FILE_SIZE=1048576000  # 1GB
```

### S3 upload fails

**Issue:** AWS credentials are incorrect

**Solutions:**

1. Verify credentials in `server/.env`
2. Check IAM user has S3 write permissions
3. Test AWS credentials:

```bash
aws s3 ls s3://your-bucket-name/
```

---

## 🎯 Next Steps

1. ✅ **Integrate with CameraView component** - Replace direct S3 uploads
2. ✅ **Add progress UI** - Show upload progress to users
3. ✅ **Add authentication** - Protect upload endpoints
4. ✅ **Deploy backend** - Use Heroku, Railway, or AWS
5. ✅ **Add database** - Store upload metadata

---

## 📚 More Resources

- **Detailed Setup:** See [MULTER_SETUP.md](./MULTER_SETUP.md)
- **S3 Configuration:** See [S3_SETUP.md](./S3_SETUP.md)
- **Multer Docs:** https://www.npmjs.com/package/multer
- **AWS SDK:** https://docs.aws.amazon.com/sdk-for-javascript/v3/

---

## 🆘 Need Help?

Check the logs:

- **Backend logs:** Check the terminal where you ran `npm run dev`
- **Frontend logs:** Open browser DevTools → Console
- **Network logs:** DevTools → Network tab

Still stuck? Check:

1. Is backend running? → `curl http://localhost:3001/api/upload/health`
2. Is frontend running? → Open http://localhost:5173
3. Are both connected? → Check browser console for CORS errors

---

**Happy uploading! 🎥📤**
