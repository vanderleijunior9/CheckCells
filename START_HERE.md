# 🚀 START HERE - CheckCells Local Storage

## ✅ Setup Complete!

Your CheckCells app is now configured to **store videos on your local machine**.

---

## 📹 Where Videos Are Stored

```
server/uploads/videos/{testId}/recording_{number}_{timestamp}.webm
```

**Example:**

```
server/uploads/videos/TEST-123/recording_1_1697554800000.webm
```

---

## 🎬 How to Run

### Terminal 1 - Backend Server

```bash
cd server
npm run dev
```

**Expected output:**

```
🚀 CheckCells Upload Server is running!
📡 Server: http://localhost:3001
☁️  S3 Status: ⚠️  Not configured (using local storage) ✅
```

> **Note:** "⚠️ Not configured" is GOOD - it means videos will be saved locally!

### Terminal 2 - Frontend

```bash
npm run dev
```

**Expected output:**

```
  VITE v6.3.4  ready in 514 ms
  ➜  Local:   http://localhost:5175/
```

---

## 🧪 Test It

1. **Open app:** http://localhost:5175/
2. **Login** with demo credentials (any email + password: `password`)
3. **Go to New Test** page
4. **Fill in test details** and click "Begin Test"
5. **Record a video**
6. **Click "Save Test"**

Videos will be saved to: `server/uploads/videos/`

---

## 📂 View Your Videos

### Option 1: File Explorer

```bash
open server/uploads/videos/
```

### Option 2: Terminal

```bash
ls -R server/uploads/videos/
```

### Option 3: Browser

```
http://localhost:3001/uploads/videos/{testId}/recording_1_xxx.webm
```

---

## 🔍 Troubleshooting

### Backend won't start

**Problem:** Port 3001 in use

**Solution:**

```bash
# Kill process on port 3001
lsof -ti:3001 | xargs kill -9

# Or change port in server/.env
PORT=3002
```

### Frontend can't upload videos

**Check 1:** Is backend running?

```bash
curl http://localhost:3001/api/upload/health
```

**Check 2:** Restart frontend after .env change

```bash
# Stop frontend (Ctrl+C)
npm run dev  # Start again
```

### Videos not saving

**Check uploads directory:**

```bash
ls -la server/uploads/videos/
```

**Check backend logs** in the terminal where you ran `npm run dev`

---

## 📊 Configuration Files Created

### ✅ server/.env

- PORT: 3001
- AWS credentials: **EMPTY** (= local storage)
- Max file size: 500MB

### ✅ .env

- API URL: http://localhost:3001

### ✅ Directory Structure

```
server/
└── uploads/
    └── videos/
        └── (your videos will be here)
```

---

## 🌐 Accessing Videos

Videos are served at:

```
http://localhost:3001/uploads/videos/{testId}/recording_{number}_{timestamp}.webm
```

You can:

- Play them in browser
- Download them
- View them in TestDetails page

---

## 💾 Backup Your Videos

Since videos are local, backup regularly:

```bash
# Option 1: Copy to backup folder
cp -r server/uploads/videos ~/Backups/checkcells-$(date +%Y%m%d)

# Option 2: Zip and backup
tar -czf checkcells-videos-backup.tar.gz server/uploads/videos/
```

---

## 🔄 Switch to Cloud Storage (Later)

When ready for production:

1. Create AWS S3 bucket
2. Get AWS credentials
3. Edit `server/.env`:

```env
AWS_REGION=us-east-1
AWS_BUCKET_NAME=your-bucket-name
AWS_ACCESS_KEY_ID=your-key
AWS_SECRET_ACCESS_KEY=your-secret
```

4. Restart backend server
5. Videos will now go to S3 automatically!

---

## 🎉 You're All Set!

Videos are now being stored on your machine at:
**`server/uploads/videos/`**

**Start testing:** http://localhost:5175/
