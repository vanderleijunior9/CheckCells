# Multer Video Upload Setup Guide

This guide explains how to set up and use the Multer-based video upload backend server.

## Architecture

```
Frontend (React) → Backend (Express + Multer) → AWS S3
```

**Benefits:**

- ✅ AWS credentials stay secure on the server
- ✅ Server-side file validation
- ✅ Upload progress tracking
- ✅ Metadata attachment
- ✅ Local storage fallback

---

## Backend Setup

### 1. Navigate to Server Directory

```bash
cd server
```

### 2. Install Dependencies

```bash
npm install
```

This will install:

- `express` - Web server framework
- `multer` - File upload middleware
- `multer-s3` - Direct S3 upload from Multer
- `cors` - Cross-origin resource sharing
- `dotenv` - Environment variable management
- `@aws-sdk/client-s3` - AWS S3 SDK

### 3. Configure Environment Variables

Create a `.env` file in the `server` directory:

```bash
cp env.example .env
```

Edit `.env` with your configuration:

```env
PORT=3001
FRONTEND_URL=http://localhost:5173

AWS_REGION=us-east-1
AWS_BUCKET_NAME=your-bucket-name
AWS_ACCESS_KEY_ID=your-access-key-id
AWS_SECRET_ACCESS_KEY=your-secret-access-key

MAX_FILE_SIZE=524288000
```

### 4. Start the Server

**Development mode (with auto-reload):**

```bash
npm run dev
```

**Production mode:**

```bash
npm start
```

The server will start on `http://localhost:3001`

---

## Frontend Setup

### 1. Add Backend URL to Frontend Environment

Create/update `.env` in the **root** directory (not server directory):

```env
VITE_API_URL=http://localhost:3001
```

### 2. Use the Upload Service

The upload service is already created at `src/services/uploadService.ts`.

**Example usage in your component:**

```typescript
import { uploadVideo } from "../services/uploadService";

// In your component
const handleUpload = async (videoBlob: Blob) => {
  try {
    const response = await uploadVideo(
      videoBlob,
      {
        testId: "TEST-123",
        recordingNumber: "1",
        scientist: "John Doe",
      },
      (progress) => {
        console.log(`Upload progress: ${progress}%`);
        // Update your UI with progress
      }
    );

    console.log("Upload successful:", response.file.url);
  } catch (error) {
    console.error("Upload failed:", error);
  }
};
```

---

## API Endpoints

### Upload Single Video

**Endpoint:** `POST /api/upload/video`

**Request:**

```javascript
const formData = new FormData();
formData.append("video", videoFile);
formData.append("testId", "TEST-123");
formData.append("recordingNumber", "1");
formData.append("scientist", "John Doe");

fetch("http://localhost:3001/api/upload/video", {
  method: "POST",
  body: formData,
});
```

**Response:**

```json
{
  "success": true,
  "message": "Video uploaded successfully",
  "file": {
    "originalName": "video.webm",
    "fileName": "videos/TEST-123/recording_1_1697554800000.webm",
    "size": 5242880,
    "mimeType": "video/webm",
    "url": "https://your-bucket.s3.us-east-1.amazonaws.com/videos/...",
    "s3Key": "videos/TEST-123/recording_1_1697554800000.webm"
  },
  "metadata": {
    "testId": "TEST-123",
    "recordingNumber": "1",
    "scientist": "John Doe",
    "uploadDate": "2025-10-17T12:00:00.000Z"
  }
}
```

### Upload Multiple Videos

**Endpoint:** `POST /api/upload/videos`

**Request:**

```javascript
const formData = new FormData();
formData.append("videos", videoFile1);
formData.append("videos", videoFile2);
formData.append("testId", "TEST-123");
formData.append("recordingNumber", "1");
formData.append("scientist", "John Doe");
```

### Health Check

**Endpoint:** `GET /api/upload/health`

---

## Supported Video Formats

- **MP4** (video/mp4)
- **WebM** (video/webm)
- **OGG** (video/ogg)
- **QuickTime/MOV** (video/quicktime)
- **AVI** (video/x-msvideo)
- **MKV** (video/x-matroska)

---

## File Size Limits

Default: **500MB** (configurable via `MAX_FILE_SIZE` in `.env`)

To change:

```env
MAX_FILE_SIZE=1048576000  # 1GB in bytes
```

---

## Integration Example

Here's how to integrate with your existing `CameraView` component:

```typescript
import { uploadVideo, blobToFile } from "../services/uploadService";

// In your recording component
const handleStopRecording = async () => {
  // Your existing code to get videoBlob...

  // Upload to server
  try {
    setUploadProgress(0);

    const response = await uploadVideo(
      videoBlob,
      {
        testId: form.testId,
        recordingNumber: recordings.length + 1,
        scientist: form.scientist,
      },
      (progress) => {
        setUploadProgress(progress);
      }
    );

    console.log("Video uploaded:", response.file.url);
    // Save the S3 URL to your database
  } catch (error) {
    console.error("Upload failed:", error);
    alert("Failed to upload video");
  }
};
```

---

## Running Both Frontend and Backend

**Terminal 1 (Frontend):**

```bash
npm run dev
# Runs on http://localhost:5173
```

**Terminal 2 (Backend):**

```bash
cd server
npm run dev
# Runs on http://localhost:3001
```

---

## Troubleshooting

### Server won't start

- Check if port 3001 is already in use
- Verify all dependencies are installed: `npm install`
- Check `.env` file exists and has correct format

### CORS errors

- Verify `FRONTEND_URL` in server's `.env` matches your frontend URL
- Check that the backend server is running

### Upload fails

- Check file size doesn't exceed `MAX_FILE_SIZE`
- Verify file is a supported video format
- Check AWS credentials are correct
- Look at server console for detailed error messages

### S3 upload fails

- Verify AWS credentials in server's `.env`
- Check S3 bucket name is correct
- Ensure IAM user has S3 write permissions
- Check bucket CORS configuration

---

## Production Deployment

### Backend

1. Deploy backend to a service like:

   - AWS EC2
   - Heroku
   - DigitalOcean
   - Railway
   - Render

2. Update `VITE_API_URL` in frontend to point to production backend URL

### Environment Variables

- Use proper secrets management
- Never commit `.env` files
- Use environment variables in your deployment platform

---

## Security Best Practices

✅ **DO:**

- Keep AWS credentials in server `.env` only
- Use environment variables for all sensitive data
- Implement authentication on upload endpoints
- Add rate limiting to prevent abuse
- Validate file types and sizes

❌ **DON'T:**

- Commit `.env` files to git
- Expose AWS credentials in frontend
- Allow unlimited file sizes
- Skip file type validation

---

## Next Steps

1. Set up authentication for upload endpoints
2. Add database to store upload records
3. Implement video processing (compression, thumbnails)
4. Add upload retry logic
5. Implement upload cancellation
6. Add virus scanning for uploaded files
