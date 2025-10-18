/**
 * Upload Service - Handles video uploads to the backend server
 * The backend server uses Multer to process uploads and forwards to S3
 */

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:3001";

interface UploadResponse {
  success: boolean;
  message: string;
  file?: {
    originalName: string;
    fileName: string;
    size: number;
    mimeType: string;
    url: string;
    s3Key?: string;
  };
  files?: Array<{
    originalName: string;
    fileName: string;
    size: number;
    mimeType: string;
    url: string;
    s3Key?: string;
  }>;
  metadata?: {
    testId: string;
    recordingNumber: string;
    scientist: string;
    uploadDate: string;
  };
  error?: string;
}

interface UploadMetadata {
  testId: string;
  recordingNumber: string;
  scientist: string;
}

/**
 * Upload a single video file to the server
 * @param videoFile - The video file to upload
 * @param metadata - Metadata about the test
 * @param onProgress - Optional callback for upload progress
 * @returns Promise with upload response
 */
export const uploadVideo = async (
  videoFile: File | Blob,
  metadata: UploadMetadata,
  onProgress?: (progress: number) => void
): Promise<UploadResponse> => {
  try {
    // Create FormData
    const formData = new FormData();
    formData.append("video", videoFile);
    formData.append("testId", metadata.testId);
    formData.append("recordingNumber", metadata.recordingNumber);
    formData.append("scientist", metadata.scientist);

    // Create XMLHttpRequest for progress tracking
    return new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest();

      // Track upload progress
      xhr.upload.addEventListener("progress", (event) => {
        if (event.lengthComputable && onProgress) {
          const progress = Math.round((event.loaded / event.total) * 100);
          onProgress(progress);
        }
      });

      // Handle completion
      xhr.addEventListener("load", () => {
        if (xhr.status >= 200 && xhr.status < 300) {
          try {
            const response = JSON.parse(xhr.responseText);
            resolve(response);
          } catch (error) {
            reject(new Error("Invalid response from server"));
          }
        } else {
          try {
            const errorResponse = JSON.parse(xhr.responseText);
            reject(new Error(errorResponse.message || "Upload failed"));
          } catch (error) {
            reject(new Error(`Upload failed with status ${xhr.status}`));
          }
        }
      });

      // Handle errors
      xhr.addEventListener("error", () => {
        reject(new Error("Network error occurred during upload"));
      });

      xhr.addEventListener("abort", () => {
        reject(new Error("Upload was cancelled"));
      });

      // Send request
      xhr.open("POST", `${API_BASE_URL}/api/upload/video`);
      xhr.send(formData);
    });
  } catch (error) {
    console.error("Error uploading video:", error);
    throw error;
  }
};

/**
 * Upload multiple video files to the server
 * @param videoFiles - Array of video files to upload
 * @param metadata - Metadata about the test
 * @param onProgress - Optional callback for upload progress
 * @returns Promise with upload response
 */
export const uploadMultipleVideos = async (
  videoFiles: File[] | Blob[],
  metadata: UploadMetadata,
  onProgress?: (progress: number) => void
): Promise<UploadResponse> => {
  try {
    // Create FormData
    const formData = new FormData();

    // Append all video files
    videoFiles.forEach((file) => {
      formData.append("videos", file);
    });

    formData.append("testId", metadata.testId);
    formData.append("recordingNumber", metadata.recordingNumber);
    formData.append("scientist", metadata.scientist);

    // Create XMLHttpRequest for progress tracking
    return new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest();

      // Track upload progress
      xhr.upload.addEventListener("progress", (event) => {
        if (event.lengthComputable && onProgress) {
          const progress = Math.round((event.loaded / event.total) * 100);
          onProgress(progress);
        }
      });

      // Handle completion
      xhr.addEventListener("load", () => {
        if (xhr.status >= 200 && xhr.status < 300) {
          try {
            const response = JSON.parse(xhr.responseText);
            resolve(response);
          } catch (error) {
            reject(new Error("Invalid response from server"));
          }
        } else {
          try {
            const errorResponse = JSON.parse(xhr.responseText);
            reject(new Error(errorResponse.message || "Upload failed"));
          } catch (error) {
            reject(new Error(`Upload failed with status ${xhr.status}`));
          }
        }
      });

      // Handle errors
      xhr.addEventListener("error", () => {
        reject(new Error("Network error occurred during upload"));
      });

      xhr.addEventListener("abort", () => {
        reject(new Error("Upload was cancelled"));
      });

      // Send request
      xhr.open("POST", `${API_BASE_URL}/api/upload/videos`);
      xhr.send(formData);
    });
  } catch (error) {
    console.error("Error uploading videos:", error);
    throw error;
  }
};

/**
 * Check if the upload server is healthy
 * @returns Promise with health status
 */
export const checkServerHealth = async (): Promise<boolean> => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/upload/health`);
    const data = await response.json();
    return data.success === true;
  } catch (error) {
    console.error("Server health check failed:", error);
    return false;
  }
};

/**
 * Convert a Blob to a File object with a filename
 * Useful when working with MediaRecorder blobs
 * @param blob - The blob to convert
 * @param fileName - The desired filename
 * @returns File object
 */
export const blobToFile = (blob: Blob, fileName: string): File => {
  return new File([blob], fileName, {
    type: blob.type,
    lastModified: Date.now(),
  });
};
