import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import uploadRoutes from "./routes/upload.js";
import { isS3Configured } from "./config/s3Config.js";

// ES Module workaround for __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(
  cors({
    origin: process.env.FRONTEND_URL || "http://localhost:5173",
    credentials: true,
  })
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Create uploads directory if it doesn't exist (for local storage fallback)
const uploadsDir = path.join(__dirname, "uploads");
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
  console.log("📁 Created uploads directory");
}

// Serve static files from uploads directory (if using local storage)
app.use("/uploads", express.static(uploadsDir));

// Routes
app.use("/api/upload", uploadRoutes);

// Root endpoint
app.get("/", (req, res) => {
  res.json({
    message: "CheckCells Upload Server",
    version: "1.0.0",
    endpoints: {
      health: "/api/upload/health",
      uploadSingle: "POST /api/upload/video",
      uploadMultiple: "POST /api/upload/videos",
    },
    s3Configured: isS3Configured(),
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error("Server error:", err);
  res.status(500).json({
    success: false,
    error: "Internal server error",
    message: err.message,
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: "Not found",
    message: "The requested endpoint does not exist",
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`
🚀 CheckCells Upload Server is running!
📡 Server: http://localhost:${PORT}
🌐 Frontend: ${process.env.FRONTEND_URL || "http://localhost:5173"}
☁️  S3 Status: ${
    isS3Configured()
      ? "✅ Configured"
      : "⚠️  Not configured (using local storage)"
  }
📝 Logs: Check console for upload activity
  `);

  if (!isS3Configured()) {
    console.warn("⚠️  AWS S3 is not configured. Files will be stored locally.");
    console.warn(
      "   Please configure AWS credentials in .env file for S3 uploads."
    );
  }
});

export default app;
