# CheckCells Upload Server

Backend server for handling video uploads using Multer and AWS S3.

## Features

- ✅ Video file upload with Multer
- ✅ Direct upload to AWS S3
- ✅ File type validation (video files only)
- ✅ File size limits (configurable)
- ✅ Metadata attachment
- ✅ Multiple file upload support
- ✅ Local storage fallback if S3 is not configured
- ✅ CORS enabled for frontend integration

## Setup

### 1. Install Dependencies

```bash
cd server
npm install
```

### 2. Configure Environment Variables

Create a `.env` file in the `server` directory:

```bash
cp .env.example .env
```

Edit `.env` with your AWS credentials:

```env
PORT=3001

AWS_REGION=us-east-1
AWS_BUCKET_NAME=your-bucket-name
AWS_ACCESS_KEY_ID=your-access-key-id
AWS_SECRET_ACCESS_KEY=your-secret-access-key

MAX_FILE_SIZE=524288000
```

### 3. Run the Server

**Development (with auto-reload):**

```bash
npm run dev
```

**Production:**

```bash
npm start
```

The server will start on `http://localhost:3001`

## API Endpoints

### Upload Single Video

**POST** `/api/upload/video`

**Form Data:**

- `video` (file) - The video file to upload
- `testId` (string) - Test identifier
- `recordingNumber` (string) - Recording number
- `scientist` (string) - Technologist name

**Response:**

```json
{
  "success": true,
  "message": "Video uploaded successfully",
  "file": {
    "originalName": "video.mp4",
    "fileName": "videos/test123/recording_1_1234567890.mp4",
    "size": 5242880,
    "mimeType": "video/mp4",
    "url": "https://bucket.s3.region.amazonaws.com/...",
    "s3Key": "videos/test123/recording_1_1234567890.mp4"
  },
  "metadata": {
    "testId": "test123",
    "recordingNumber": "1",
    "scientist": "John Doe",
    "uploadDate": "2025-10-17T12:00:00.000Z"
  }
}
```

### Upload Multiple Videos

**POST** `/api/upload/videos`

**Form Data:**

- `videos[]` (files) - Array of video files (max 10)
- `testId` (string) - Test identifier
- `recordingNumber` (string) - Recording number
- `scientist` (string) - Technologist name

### Health Check

**GET** `/api/upload/health`

Returns server status.

## Supported Video Formats

- MP4 (video/mp4)
- WebM (video/webm)
- OGG (video/ogg)
- QuickTime/MOV (video/quicktime)
- AVI (video/x-msvideo)
- MKV (video/x-matroska)

## File Size Limits

Default: 500MB (configurable via `MAX_FILE_SIZE` in `.env`)

## Security Notes

- AWS credentials are kept on the server (not exposed to frontend)
- File type validation prevents non-video uploads
- File size limits prevent abuse
- CORS configured for your frontend domain
