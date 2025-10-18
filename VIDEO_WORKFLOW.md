# 🎥 Video Upload & Display Workflow

## Overview

Videos are now stored **locally on your machine** and fetched **on-demand** when viewing test details.

---

## 📹 How It Works

### 1. Recording & Uploading Videos

**When "Save Test" is pressed:**

```
User records video(s)
      ↓
CameraView uploads to → http://localhost:3001/api/upload/video
      ↓
Backend (Multer) saves → server/uploads/videos/{testId}/recording_{n}_{timestamp}.webm
      ↓
Backend returns URL → http://localhost:3001/uploads/videos/{testId}/recording_{n}_{timestamp}.webm
      ↓
CameraView saves to API → MockAPI with videoUrl field
      ↓
Test saved successfully!
```

### 2. Viewing Videos

**When you select a test from Dashboard:**

```
User clicks test → Navigate to TestDetails
      ↓
TestDetails fetches test data → GET /api/v1/parameters/{id}
      ↓
TestDetails fetches videos → GET /api/v1/parameters?testId={testId}
      ↓
Filter records with videoUrl → Extract video URLs
      ↓
Display in video slideshow → Multiple videos with thumbnails
```

---

## 🔄 Complete Flow Example

### Step 1: Record Videos

1. User fills form: `Test ID: TEST-123`, `Scientist: Dr. Smith`
2. User records 3 videos
3. Clicks "Save Test"

### Step 2: Upload to Local Server

```javascript
// Video 1
POST http://localhost:3001/api/upload/video
{
  video: <blob>,
  testId: "TEST-123",
  recordingNumber: "1",
  scientist: "Dr. Smith"
}
→ Returns: http://localhost:3001/uploads/videos/TEST-123/recording_1_1697554800000.webm

// Video 2
POST http://localhost:3001/api/upload/video
{
  video: <blob>,
  testId: "TEST-123",
  recordingNumber: "2",
  scientist: "Dr. Smith"
}
→ Returns: http://localhost:3001/uploads/videos/TEST-123/recording_2_1697554815000.webm

// Video 3
POST http://localhost:3001/api/upload/video
{
  video: <blob>,
  testId: "TEST-123",
  recordingNumber: "3",
  scientist: "Dr. Smith"
}
→ Returns: http://localhost:3001/uploads/videos/TEST-123/recording_3_1697554830000.webm
```

### Step 3: Save Metadata to API

```javascript
// For each video, save metadata to MockAPI
POST https://68e89221f2707e6128cb466c.mockapi.io/api/v1/parameters
{
  name: "Video Recording",
  videoUrl: "http://localhost:3001/uploads/videos/TEST-123/recording_1_xxx.webm",
  scientist: "Dr. Smith",
  testId: "TEST-123",
  volume: 5,
  days: 3,
  delution: 1.5,
  recordingNumber: 1,
  timestamp: "2025-10-17T12:00:00.000Z"
}
```

### Step 4: View Test (Later)

```javascript
// User clicks test from dashboard
// TestDetails fetches all recordings for this test

GET https://68e89221f2707e6128cb466c.mockapi.io/api/v1/parameters?testId=TEST-123

// Response:
[
  {
    videoUrl: "http://localhost:3001/uploads/videos/TEST-123/recording_1_xxx.webm",
    recordingNumber: 1,
    scientist: "Dr. Smith",
    ...
  },
  {
    videoUrl: "http://localhost:3001/uploads/videos/TEST-123/recording_2_xxx.webm",
    recordingNumber: 2,
    scientist: "Dr. Smith",
    ...
  },
  {
    videoUrl: "http://localhost:3001/uploads/videos/TEST-123/recording_3_xxx.webm",
    recordingNumber: 3,
    scientist: "Dr. Smith",
    ...
  }
]

// TestDetails extracts videoUrls and displays in slideshow
setVideos([
  "http://localhost:3001/uploads/videos/TEST-123/recording_1_xxx.webm",
  "http://localhost:3001/uploads/videos/TEST-123/recording_2_xxx.webm",
  "http://localhost:3001/uploads/videos/TEST-123/recording_3_xxx.webm"
])
```

---

## 📂 File Structure

```
server/
└── uploads/
    └── videos/
        ├── TEST-123/
        │   ├── recording_1_1697554800000.webm
        │   ├── recording_2_1697554815000.webm
        │   └── recording_3_1697554830000.webm
        ├── TEST-124/
        │   └── recording_1_1697554900000.webm
        └── TEST-125/
            ├── recording_1_1697555000000.webm
            └── recording_2_1697555015000.webm
```

---

## 🔌 API Endpoints Used

### Local Backend Server

| Endpoint                                                  | Method | Purpose                         |
| --------------------------------------------------------- | ------ | ------------------------------- |
| `/api/upload/video`                                       | POST   | Upload video, returns local URL |
| `/api/upload/health`                                      | GET    | Check server status             |
| `/uploads/videos/{testId}/recording_{n}_{timestamp}.webm` | GET    | Serve video file                |

### MockAPI

| Endpoint                      | Method | Purpose                       |
| ----------------------------- | ------ | ----------------------------- |
| `/parameters`                 | POST   | Save test metadata + videoUrl |
| `/parameters/{id}`            | GET    | Get test details              |
| `/parameters?testId={testId}` | GET    | Get all recordings for test   |

---

## 💡 Key Benefits

### ✅ Efficient Loading

- Videos **NOT loaded** in test list
- Videos **only loaded** when viewing specific test
- Faster dashboard performance

### ✅ Organized Storage

- Videos grouped by test ID
- Easy to find and manage
- Timestamped filenames

### ✅ Local Control

- All videos on your machine
- No cloud upload costs
- Full privacy and control

### ✅ Multiple Videos

- Support multiple recordings per test
- Automatic thumbnail grid
- Easy navigation between videos

---

## 🧪 Testing the Workflow

### 1. Record & Save

```bash
# Make sure backend is running
cd server && npm run dev

# In another terminal, start frontend
npm run dev

# In browser:
1. Go to http://localhost:5173
2. Login (any email + password)
3. New Test → Fill details
4. Record video(s)
5. Click "Save Test"
```

### 2. Check Local Storage

```bash
# Videos should be saved
ls -la server/uploads/videos/TEST-*/

# Example output:
server/uploads/videos/TEST-123/recording_1_1697554800000.webm
server/uploads/videos/TEST-123/recording_2_1697554815000.webm
```

### 3. View Test Details

```bash
# In browser:
1. Go to Dashboard
2. Click on the test you just created
3. Navigate to Test Details
4. Videos should load and display in slideshow
```

### 4. Verify API Data

```bash
# Check MockAPI has videoUrl stored
curl "https://68e89221f2707e6128cb466c.mockapi.io/api/v1/parameters?testId=TEST-123"

# Should return array with videoUrl fields
```

---

## 🔍 Debugging

### Videos not uploading?

**Check backend logs:**

```
Look for: "📤 Uploading video 1 to local server"
Look for: "✅ Video 1 uploaded successfully!"
```

**Check frontend console:**

```javascript
// Should see:
"Uploading video 1: 50%";
"✅ Video 1 uploaded successfully!";
"🔗 URL: http://localhost:3001/uploads/...";
```

### Videos not showing in TestDetails?

**Check browser console:**

```javascript
// Should see:
"🔍 Fetching details for test ID: TEST-123";
"🎥 Fetching videos for test: TEST-123";
"📹 Found X recordings for test TEST-123";
"✅ Loaded X video URLs: [...]";
```

**Check API response:**

```bash
curl "https://68e89221f2707e6128cb466c.mockapi.io/api/v1/parameters?testId=TEST-123"

# Make sure videoUrl field exists in response
```

### Backend not running?

```bash
# Check if server is running
curl http://localhost:3001/api/upload/health

# Should return:
# {"success":true,"message":"Upload service is running"}
```

---

## 📊 Data Flow Diagram

```
┌─────────────┐
│ User Records│
│   Video     │
└──────┬──────┘
       │
       ↓
┌─────────────────┐
│  CameraView     │
│  (Frontend)     │
└──────┬──────────┘
       │
       ↓ POST /api/upload/video
       │
┌─────────────────┐
│ Backend Server  │
│   (Multer)      │
└──────┬──────────┘
       │
       ↓ Save to disk
       │
┌──────────────────────────────────────┐
│ server/uploads/videos/{testId}/...   │
└──────────────────────────────────────┘
       │
       ↓ Return URL
       │
┌─────────────────┐
│  CameraView     │
│  POST to API    │
└──────┬──────────┘
       │
       ↓
┌──────────────────────────────────────┐
│ MockAPI (stores videoUrl + metadata) │
└──────────────────────────────────────┘

... Later when viewing test ...

┌─────────────────┐
│  User Clicks    │
│  Test in List   │
└──────┬──────────┘
       │
       ↓
┌─────────────────┐
│  TestDetails    │
│  (Frontend)     │
└──────┬──────────┘
       │
       ↓ GET /parameters?testId=X
       │
┌──────────────────────────────────────┐
│ MockAPI (returns all recordings)     │
└──────┬───────────────────────────────┘
       │
       ↓ Extract videoUrl
       │
┌─────────────────┐
│  Video          │
│  Slideshow      │
└─────────────────┘
```

---

## 🎉 Summary

✅ Videos uploaded to **local server**  
✅ URLs stored in **MockAPI**  
✅ Videos **fetched on-demand** when viewing test  
✅ Multiple videos per test **supported**  
✅ Beautiful slideshow with **thumbnails**  
✅ **No videos in test list** (better performance)

**You're all set!** 🚀
