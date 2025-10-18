# 🎥 Fetching Videos from Local Server

## Overview

TestDetails now fetches videos **directly from your local server's file system**, not from MockAPI.

---

## 🔌 New Backend Endpoint

### **GET /api/upload/videos/:testId**

Fetches all videos for a specific test by scanning the local file system.

**Example Request:**

```bash
curl http://localhost:3001/api/upload/videos/TEST-123
```

**Example Response (with videos):**

```json
{
  "success": true,
  "testId": "TEST-123",
  "count": 3,
  "videos": [
    {
      "filename": "recording_1_1697554800000.webm",
      "url": "http://localhost:3001/uploads/videos/TEST-123/recording_1_1697554800000.webm",
      "path": "videos/TEST-123/recording_1_1697554800000.webm"
    },
    {
      "filename": "recording_2_1697554815000.webm",
      "url": "http://localhost:3001/uploads/videos/TEST-123/recording_2_1697554815000.webm",
      "path": "videos/TEST-123/recording_2_1697554815000.webm"
    },
    {
      "filename": "recording_3_1697554830000.webm",
      "url": "http://localhost:3001/uploads/videos/TEST-123/recording_3_1697554830000.webm",
      "path": "videos/TEST-123/recording_3_1697554830000.webm"
    }
  ]
}
```

**Example Response (no videos):**

```json
{
  "success": true,
  "testId": "TEST-123",
  "videos": [],
  "message": "No videos found for this test"
}
```

---

## 🔄 Updated Workflow

### Recording & Uploading (No Change)

```
1. User records videos
      ↓
2. CameraView uploads → POST /api/upload/video
      ↓
3. Server saves → server/uploads/videos/{testId}/recording_X_timestamp.webm
      ↓
4. Test saved ✅
```

### **NEW: Viewing Videos**

```
1. User clicks test → Navigate to TestDetails
      ↓
2. TestDetails fetches → GET /api/upload/videos/{testId}
      ↓
3. Backend scans → server/uploads/videos/{testId}/
      ↓
4. Returns video URLs → [...list of URLs...]
      ↓
5. Display in slideshow 🎥
```

---

## 💡 How It Works

### Backend (server/routes/upload.js)

```javascript
router.get("/videos/:testId", (req, res) => {
  const { testId } = req.params;
  const videosDir = `uploads/videos/${sanitizedTestId}`;

  // Check if directory exists
  if (!fs.existsSync(videosDir)) {
    return res.json({
      success: true,
      videos: [],
      message: "No videos found",
    });
  }

  // Read all video files from directory
  const files = fs.readdirSync(videosDir);
  const videoFiles = files.filter((file) =>
    [".mp4", ".webm", ".ogg", ".mov"].includes(path.extname(file))
  );

  // Return URLs
  const videos = videoFiles.map((file) => ({
    filename: file,
    url: `http://localhost:3001/uploads/videos/${testId}/${file}`,
  }));

  res.json({ success: true, count: videos.length, videos });
});
```

### Frontend (TestDetails.tsx)

```typescript
// Fetch videos directly from local server
const videosResponse = await fetch(
  `http://localhost:3001/api/upload/videos/${testId}`
);

if (videosResponse.ok) {
  const videoData = await videosResponse.json();
  const videoUrls = videoData.videos.map((video) => video.url);
  setVideos(videoUrls);
}
```

---

## ✅ Benefits

### **1. Simple & Direct**

- No need to store URLs in MockAPI
- Videos come directly from file system
- Single source of truth

### **2. Reliable**

- Always in sync with actual files
- No URL mismatches
- If file exists, it will be found

### **3. Fast**

- Direct file system access
- No database queries needed
- Instant results

### **4. Easy to Debug**

- Just check the uploads folder
- Clear file structure
- Simple to troubleshoot

---

## 🧪 Testing

### 1. Check Endpoint Works

```bash
curl http://localhost:3001/api/upload/videos/TEST-123
```

**Expected:** JSON response with success and videos array

### 2. Test with Actual Videos

```bash
# Record a test in your app first
# Then check the endpoint
curl http://localhost:3001/api/upload/videos/YOUR-TEST-ID
```

### 3. Verify in Browser

1. Open http://localhost:5173
2. Login
3. Create a new test and record videos
4. View test in Dashboard
5. Open browser console
6. Look for: "🎥 Fetching videos from local server"
7. Should see: "✅ Loaded X video URLs from local server"

---

## 📂 File Structure

```
server/
└── uploads/
    └── videos/
        ├── TEST-123/
        │   ├── recording_1_1697554800000.webm  ← Backend scans this
        │   ├── recording_2_1697554815000.webm  ← And this
        │   └── recording_3_1697554830000.webm  ← And this
        ├── TEST-124/
        │   └── recording_1_1697554900000.webm
        └── TEST-125/
            └── recording_1_1697555000000.webm

TestDetails calls:
GET /api/upload/videos/TEST-123
  ↓
Backend returns URLs for all 3 videos
  ↓
Display in slideshow!
```

---

## 🔍 Debugging

### Videos not showing?

**1. Check backend logs:**

```
Look for errors in the terminal where you ran: npm run dev
```

**2. Check browser console:**

```javascript
// Should see:
"🎥 Fetching videos from local server for test: TEST-123";
"📹 Found 3 videos for test TEST-123";
"✅ Loaded 3 video URLs from local server: [...]";
```

**3. Check files exist:**

```bash
ls -la server/uploads/videos/TEST-*/
```

**4. Test endpoint directly:**

```bash
curl http://localhost:3001/api/upload/videos/YOUR-TEST-ID
```

### Getting empty array?

**Check:**

1. Are videos actually saved? → `ls server/uploads/videos/TEST-*/`
2. Is test ID correct? → Check exact test ID (case sensitive!)
3. Is backend running? → `curl http://localhost:3001/api/upload/health`

---

## 📊 Comparison

### Before (MockAPI)

```
TestDetails → GET MockAPI → Filter by videoUrl → Display
     ↓
Problem: Need to store URLs in MockAPI
Problem: URLs can get out of sync
Problem: Extra database dependency
```

### After (Local Server)

```
TestDetails → GET Local Server → Scan file system → Display
     ↓
✅ No URL storage needed
✅ Always accurate
✅ Direct from source
```

---

## 🎯 Summary

✅ **New endpoint:** `GET /api/upload/videos/:testId`  
✅ **Scans file system** for videos  
✅ **Returns URLs** automatically  
✅ **No MockAPI dependency** for videos  
✅ **Always in sync** with actual files

**Videos are now fetched directly from your local server!** 🚀

---

## 📝 API Reference

### Endpoint: Get Videos for Test

**URL:** `/api/upload/videos/:testId`  
**Method:** `GET`  
**Params:** `testId` - The test identifier

**Success Response (200):**

```json
{
  "success": true,
  "testId": "TEST-123",
  "count": 2,
  "videos": [
    {
      "filename": "recording_1_xxx.webm",
      "url": "http://localhost:3001/uploads/videos/TEST-123/recording_1_xxx.webm",
      "path": "videos/TEST-123/recording_1_xxx.webm"
    }
  ]
}
```

**No Videos (200):**

```json
{
  "success": true,
  "testId": "TEST-123",
  "videos": [],
  "message": "No videos found for this test"
}
```

**Error (500):**

```json
{
  "success": false,
  "error": "Failed to fetch videos",
  "message": "Error details..."
}
```
