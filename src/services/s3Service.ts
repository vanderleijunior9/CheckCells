import {
  S3Client,
  PutObjectCommand,
  ListObjectsV2Command,
} from "@aws-sdk/client-s3";
import { s3Config, isS3Configured } from "../config/s3Config";

// Initialize S3 Client
let s3Client: S3Client | null = null;

const getS3Client = () => {
  if (!s3Client && isS3Configured()) {
    s3Client = new S3Client({
      region: s3Config.region,
      credentials: s3Config.credentials,
    });
  }
  return s3Client;
};

/**
 * Upload a video blob to S3
 * @param videoBlob - The video blob to upload
 * @param fileName - The name for the file in S3
 * @param metadata - Optional metadata to attach to the file
 * @returns The S3 URL of the uploaded file
 */
export const uploadVideoToS3 = async (
  videoBlob: Blob,
  fileName: string,
  metadata?: Record<string, string>
): Promise<string> => {
  if (!isS3Configured()) {
    throw new Error(
      "S3 is not configured. Please add AWS credentials to your .env file."
    );
  }

  const client = getS3Client();
  if (!client) {
    throw new Error("Failed to initialize S3 client");
  }

  try {
    // Convert blob to buffer for upload
    const arrayBuffer = await videoBlob.arrayBuffer();
    const buffer = new Uint8Array(arrayBuffer);

    // Create upload command
    const command = new PutObjectCommand({
      Bucket: s3Config.bucketName,
      Key: fileName,
      Body: buffer,
      ContentType: videoBlob.type,
      Metadata: metadata,
    });

    // Upload to S3
    await client.send(command);

    // Return the S3 URL
    const s3Url = `https://${s3Config.bucketName}.s3.${s3Config.region}.amazonaws.com/${fileName}`;
    console.log(`Video uploaded successfully to S3: ${s3Url}`);

    return s3Url;
  } catch (error) {
    console.error("Error uploading video to S3:", error);
    throw new Error(
      `Failed to upload video to S3: ${
        error instanceof Error ? error.message : "Unknown error"
      }`
    );
  }
};

/**
 * Generate a unique filename for S3 upload
 * @param testId - The test ID
 * @param recordingNumber - The recording number
 * @returns A unique filename
 */
export const generateS3FileName = (
  testId: string,
  recordingNumber: number
): string => {
  const timestamp = new Date().getTime();
  const sanitizedTestId = testId.replace(/[^a-zA-Z0-9-]/g, "_");
  return `videos/${sanitizedTestId}/recording_${recordingNumber}_${timestamp}.webm`;
};

/**
 * List videos from S3 for a specific test ID
 * @param testId - The test ID to search for
 * @returns Array of video URLs
 */
export const listVideosFromS3 = async (testId: string): Promise<string[]> => {
  if (!isS3Configured()) {
    throw new Error(
      "S3 is not configured. Please add AWS credentials to your .env file."
    );
  }

  const client = getS3Client();
  if (!client) {
    throw new Error("Failed to initialize S3 client");
  }

  try {
    const sanitizedTestId = testId.replace(/[^a-zA-Z0-9-]/g, "_");
    const prefix = `videos/${sanitizedTestId}/`;

    console.log(`🔍 Searching for videos in S3 with prefix: ${prefix}`);

    const command = new ListObjectsV2Command({
      Bucket: s3Config.bucketName,
      Prefix: prefix,
    });

    const response = await client.send(command);

    if (!response.Contents || response.Contents.length === 0) {
      console.log(`⚠️ No videos found for test ID: ${testId}`);
      return [];
    }

    // Filter for video files and generate URLs
    const videoUrls = response.Contents.filter(
      (obj) =>
        obj.Key &&
        (obj.Key.endsWith(".webm") ||
          obj.Key.endsWith(".mp4") ||
          obj.Key.endsWith(".mov"))
    ).map(
      (obj) =>
        `https://${s3Config.bucketName}.s3.${s3Config.region}.amazonaws.com/${obj.Key}`
    );

    console.log(
      `✅ Found ${videoUrls.length} videos for test ${testId}:`,
      videoUrls
    );

    return videoUrls;
  } catch (error) {
    console.error("Error listing videos from S3:", error);
    throw new Error(
      `Failed to list videos from S3: ${
        error instanceof Error ? error.message : "Unknown error"
      }`
    );
  }
};
