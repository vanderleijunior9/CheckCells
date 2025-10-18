import multer from "multer";
import multerS3 from "multer-s3";
import { s3Client, s3Config, isS3Configured } from "../config/s3Config.js";
import path from "path";
import fs from "fs";

// File filter to only accept video files
const fileFilter = (req, file, cb) => {
  const allowedMimeTypes = [
    "video/mp4",
    "video/webm",
    "video/ogg",
    "video/quicktime",
    "video/x-msvideo",
    "video/x-matroska",
  ];

  if (allowedMimeTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(
      new Error(
        "Invalid file type. Only video files (MP4, WebM, OGG, MOV, AVI, MKV) are allowed."
      ),
      false
    );
  }
};

// Generate unique filename
const generateFileName = (req, file) => {
  const testId = req.body.testId || "unknown";
  const recordingNumber = req.body.recordingNumber || "1";
  const timestamp = Date.now();
  const sanitizedTestId = testId.replace(/[^a-zA-Z0-9-]/g, "_");
  const ext = path.extname(file.originalname);

  return `videos/${sanitizedTestId}/recording_${recordingNumber}_${timestamp}${ext}`;
};

// Configure multer for local storage (fallback if S3 is not configured)
const localStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    const testId = req.body.testId || "unknown";
    const sanitizedTestId = testId.replace(/[^a-zA-Z0-9-]/g, "_");
    const dir = `uploads/videos/${sanitizedTestId}`;

    // Create directory if it doesn't exist
    fs.mkdirSync(dir, { recursive: true });

    cb(null, dir);
  },
  filename: (req, file, cb) => {
    const recordingNumber = req.body.recordingNumber || "1";
    const timestamp = Date.now();
    const ext = path.extname(file.originalname) || ".webm";
    const fileName = `recording_${recordingNumber}_${timestamp}${ext}`;

    cb(null, fileName);
  },
});

// Configure multer for S3 storage
const s3Storage = multerS3({
  s3: s3Client,
  bucket: s3Config.bucketName,
  contentType: multerS3.AUTO_CONTENT_TYPE,
  metadata: (req, file, cb) => {
    cb(null, {
      testId: req.body.testId || "unknown",
      recordingNumber: req.body.recordingNumber || "1",
      uploadedBy: req.body.scientist || "unknown",
      uploadDate: new Date().toISOString(),
    });
  },
  key: (req, file, cb) => {
    const fileName = generateFileName(req, file);
    cb(null, fileName);
  },
});

// Choose storage based on S3 configuration
const storage = isS3Configured() ? s3Storage : localStorage;

// Configure multer
export const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: parseInt(process.env.MAX_FILE_SIZE) || 500 * 1024 * 1024, // Default 500MB
  },
});

// Middleware to handle multer errors
export const handleUploadError = (err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    if (err.code === "LIMIT_FILE_SIZE") {
      return res.status(400).json({
        success: false,
        error: "File too large",
        message: `File size exceeds the maximum allowed size of ${
          process.env.MAX_FILE_SIZE || 500 * 1024 * 1024
        } bytes`,
      });
    }
    return res.status(400).json({
      success: false,
      error: "Upload error",
      message: err.message,
    });
  }

  if (err) {
    return res.status(400).json({
      success: false,
      error: "Invalid file",
      message: err.message,
    });
  }

  next();
};
