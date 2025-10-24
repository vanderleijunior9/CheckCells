import express from "express";
import { upload, handleUploadError } from "../middleware/upload.js";
import fs from "fs";
import path from "path";
import dotenv from "dotenv";
import {
  S3Client,
  PutObjectCommand,
  GetObjectCommand,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import crypto from "crypto";

// Load environment variables
dotenv.config();

const router = express.Router();

// AWS S3 Configuration (following simple-s3.ts pattern)
const region = process.env.AWS_REGION || "us-east-1";
const bucketName = process.env.AWS_BUCKET_NAME;
const accessKeyId = process.env.AWS_ACCESS_KEY_ID;
const secretAccessKey = process.env.AWS_SECRET_ACCESS_KEY;

// Initialize S3 client
const s3Client = new S3Client({
  region,
  credentials: {
    accessKeyId,
    secretAccessKey,
  },
});

// Helper function to generate unique file names
const generateFileName = (testId, recordingNumber, originalName) => {
  const sanitizedTestId = testId.replace(/[^a-zA-Z0-9-]/g, "_");
  const timestamp = Date.now();
  const ext = path.extname(originalName) || ".webm";
  return `videos/${sanitizedTestId}/recording_${recordingNumber}_${timestamp}${ext}`;
};

// Helper function to upload to S3
const uploadToS3 = async (fileBuffer, fileName, contentType) => {
  const command = new PutObjectCommand({
    Bucket: bucketName,
    Key: fileName,
    Body: fileBuffer,
    ContentType: contentType,
  });

  await s3Client.send(command);
  return `https://${bucketName}.s3.${region}.amazonaws.com/${fileName}`;
};

// Helper function to get signed URL for S3 object
const getS3SignedUrl = async (fileName, expiresIn = 3600) => {
  const command = new GetObjectCommand({
    Bucket: bucketName,
    Key: fileName,
  });

  return await getSignedUrl(s3Client, command, { expiresIn });
};

// Single video upload endpoint (following simple-s3.ts pattern)
router.post(
  "/video",
  upload.single("video"),
  handleUploadError,
  async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({
          success: false,
          error: "No file uploaded",
          message: "Please select a video file to upload",
        });
      }

      const testId = req.body.testId || "unknown";
      const recordingNumber = req.body.recordingNumber || "1";
      const scientist = req.body.scientist || "unknown";

      // Generate unique file name
      const fileName = generateFileName(
        testId,
        recordingNumber,
        req.file.originalname
      );

      let fileUrl;
      let storageType = "local";

      // Check if S3 is configured
      if (bucketName && accessKeyId && secretAccessKey) {
        try {
          // Upload to S3
          const fileBuffer = fs.readFileSync(req.file.path);
          fileUrl = await uploadToS3(fileBuffer, fileName, req.file.mimetype);
          storageType = "s3";

          // Clean up local file after S3 upload
          fs.unlinkSync(req.file.path);

          console.log(`✅ Video uploaded to S3: ${fileName}`);
        } catch (s3Error) {
          console.error("❌ S3 upload failed, falling back to local:", s3Error);
          // Fall back to local storage
          fileUrl = `http://localhost:${
            process.env.PORT || 3001
          }/uploads/${fileName}`;
          storageType = "local";
        }
      } else {
        // Use local storage
        fileUrl = `http://localhost:${
          process.env.PORT || 3001
        }/uploads/${fileName}`;
        storageType = "local";
      }

      const response = {
        success: true,
        message: "Video uploaded successfully",
        file: {
          originalName: req.file.originalname,
          fileName: fileName,
          size: req.file.size,
          mimeType: req.file.mimetype,
          url: fileUrl,
          s3Key: storageType === "s3" ? fileName : null,
          storageType: storageType,
        },
        metadata: {
          testId: testId,
          recordingNumber: recordingNumber,
          scientist: scientist,
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
  }
);

// Multiple videos upload endpoint (following simple-s3.ts pattern)
router.post(
  "/videos",
  upload.array("videos", 10), // Max 10 files
  handleUploadError,
  async (req, res) => {
    try {
      if (!req.files || req.files.length === 0) {
        return res.status(400).json({
          success: false,
          error: "No files uploaded",
          message: "Please select video files to upload",
        });
      }

      const testId = req.body.testId || "unknown";
      const scientist = req.body.scientist || "unknown";
      const uploadedFiles = [];
      const errors = [];

      // Process each file
      for (let i = 0; i < req.files.length; i++) {
        const file = req.files[i];
        try {
          const recordingNumber = (i + 1).toString();
          const fileName = generateFileName(
            testId,
            recordingNumber,
            file.originalname
          );

          let fileUrl;
          let storageType = "local";

          // Check if S3 is configured
          if (bucketName && accessKeyId && secretAccessKey) {
            try {
              // Upload to S3
              const fileBuffer = fs.readFileSync(file.path);
              fileUrl = await uploadToS3(fileBuffer, fileName, file.mimetype);
              storageType = "s3";

              // Clean up local file after S3 upload
              fs.unlinkSync(file.path);

              console.log(`✅ Video ${i + 1} uploaded to S3: ${fileName}`);
            } catch (s3Error) {
              console.error(
                `❌ S3 upload failed for video ${
                  i + 1
                }, falling back to local:`,
                s3Error
              );
              fileUrl = `http://localhost:${
                process.env.PORT || 3001
              }/uploads/${fileName}`;
              storageType = "local";
            }
          } else {
            fileUrl = `http://localhost:${
              process.env.PORT || 3001
            }/uploads/${fileName}`;
            storageType = "local";
          }

          uploadedFiles.push({
            originalName: file.originalname,
            fileName: fileName,
            size: file.size,
            mimeType: file.mimetype,
            url: fileUrl,
            s3Key: storageType === "s3" ? fileName : null,
            storageType: storageType,
          });
        } catch (fileError) {
          console.error(
            `❌ Error processing file ${file.originalname}:`,
            fileError
          );
          errors.push({
            file: file.originalname,
            error: fileError.message,
          });

          // Clean up failed file
          if (fs.existsSync(file.path)) {
            fs.unlinkSync(file.path);
          }
        }
      }

      const response = {
        success: errors.length === 0,
        message: `${uploadedFiles.length}/${req.files.length} video(s) uploaded successfully`,
        files: uploadedFiles,
        metadata: {
          testId: testId,
          scientist: scientist,
          uploadDate: new Date().toISOString(),
        },
      };

      if (errors.length > 0) {
        response.errors = errors;
      }

      res.status(200).json(response);
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

// Health check endpoint (following simple-s3.ts pattern)
router.get("/health", (req, res) => {
  const s3Configured = !!(bucketName && accessKeyId && secretAccessKey);

  res.status(200).json({
    success: true,
    message: "Upload service is running",
    timestamp: new Date().toISOString(),
    configuration: {
      s3Configured: s3Configured,
      region: region,
      bucketName: bucketName
        ? `${bucketName.substring(0, 8)}...`
        : "Not configured",
      storageType: s3Configured ? "S3 + Local fallback" : "Local only",
    },
  });
});

// Get videos for a specific test (following simple-s3.ts pattern)
router.get("/videos/:testId", async (req, res) => {
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
        storageType: "local",
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
    const videos = await Promise.all(
      videoFiles.map(async (file) => {
        const fileName = `videos/${sanitizedTestId}/${file}`;
        let url = `${baseUrl}/uploads/${fileName}`;
        let storageType = "local";

        // If S3 is configured, try to get signed URL
        if (bucketName && accessKeyId && secretAccessKey) {
          try {
            url = await getS3SignedUrl(fileName);
            storageType = "s3";
          } catch (s3Error) {
            console.log(
              `⚠️ S3 signed URL failed for ${fileName}, using local URL`
            );
            // Keep local URL as fallback
          }
        }

        return {
          filename: file,
          url: url,
          path: fileName,
          storageType: storageType,
        };
      })
    );

    res.status(200).json({
      success: true,
      testId: testId,
      count: videos.length,
      videos: videos,
      storageType: videos.length > 0 ? videos[0].storageType : "local",
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
