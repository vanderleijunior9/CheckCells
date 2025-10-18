import express from "express";
import { upload, handleUploadError } from "../middleware/upload.js";
import fs from "fs";
import path from "path";

const router = express.Router();

// Single video upload endpoint
router.post("/video", upload.single("video"), handleUploadError, (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        error: "No file uploaded",
        message: "Please select a video file to upload",
      });
    }

    // Prepare response based on storage type
    const testId = req.body.testId || "unknown";
    const sanitizedTestId = testId.replace(/[^a-zA-Z0-9-]/g, "_");

    // Build local URL path
    const localPath = req.file.key
      ? req.file.key // S3 path
      : `videos/${sanitizedTestId}/${req.file.filename}`; // Local path

    const response = {
      success: true,
      message: "Video uploaded successfully",
      file: {
        originalName: req.file.originalname,
        fileName: req.file.key || req.file.filename,
        size: req.file.size,
        mimeType: req.file.mimetype,
        url:
          req.file.location ||
          `http://localhost:${process.env.PORT || 3001}/uploads/${localPath}`,
        s3Key: req.file.key,
        storageType: req.file.location ? "s3" : "local",
      },
      metadata: {
        testId: req.body.testId,
        recordingNumber: req.body.recordingNumber,
        scientist: req.body.scientist,
        uploadDate: new Date().toISOString(),
      },
    };

    res.status(200).json(response);
  } catch (error) {
    console.error("Upload error:", error);
    res.status(500).json({
      success: false,
      error: "Upload failed",
      message: error.message,
    });
  }
});

// Multiple videos upload endpoint
router.post(
  "/videos",
  upload.array("videos", 10), // Max 10 files
  handleUploadError,
  (req, res) => {
    try {
      if (!req.files || req.files.length === 0) {
        return res.status(400).json({
          success: false,
          error: "No files uploaded",
          message: "Please select video files to upload",
        });
      }

      const uploadedFiles = req.files.map((file) => ({
        originalName: file.originalname,
        fileName: file.key || file.filename,
        size: file.size,
        mimeType: file.mimetype,
        url: file.location || `/uploads/${file.filename}`,
        s3Key: file.key,
      }));

      res.status(200).json({
        success: true,
        message: `${req.files.length} video(s) uploaded successfully`,
        files: uploadedFiles,
        metadata: {
          testId: req.body.testId,
          recordingNumber: req.body.recordingNumber,
          scientist: req.body.scientist,
          uploadDate: new Date().toISOString(),
        },
      });
    } catch (error) {
      console.error("Upload error:", error);
      res.status(500).json({
        success: false,
        error: "Upload failed",
        message: error.message,
      });
    }
  }
);

// Health check endpoint
router.get("/health", (req, res) => {
  res.status(200).json({
    success: true,
    message: "Upload service is running",
    timestamp: new Date().toISOString(),
  });
});

// Get videos for a specific test
router.get("/videos/:testId", (req, res) => {
  try {
    const { testId } = req.params;
    const sanitizedTestId = testId.replace(/[^a-zA-Z0-9-]/g, "_");
    const videosDir = `uploads/videos/${sanitizedTestId}`;

    // Check if directory exists
    if (!fs.existsSync(videosDir)) {
      return res.status(200).json({
        success: true,
        testId: testId,
        videos: [],
        message: "No videos found for this test",
      });
    }

    // Read directory and get all video files
    const files = fs.readdirSync(videosDir);
    const videoFiles = files
      .filter((file) => {
        const ext = path.extname(file).toLowerCase();
        return [".mp4", ".webm", ".ogg", ".mov", ".avi", ".mkv"].includes(ext);
      })
      .sort(); // Sort alphabetically (will sort by recording number due to naming)

    // Build full URLs for each video
    const baseUrl = `http://localhost:${process.env.PORT || 3001}`;
    const videos = videoFiles.map((file) => ({
      filename: file,
      url: `${baseUrl}/uploads/videos/${sanitizedTestId}/${file}`,
      path: `videos/${sanitizedTestId}/${file}`,
    }));

    res.status(200).json({
      success: true,
      testId: testId,
      count: videos.length,
      videos: videos,
    });
  } catch (error) {
    console.error("Error fetching videos:", error);
    res.status(500).json({
      success: false,
      error: "Failed to fetch videos",
      message: error.message,
    });
  }
});

export default router;
