import { S3Client } from "@aws-sdk/client-s3";
import dotenv from "dotenv";

dotenv.config();

export const s3Config = {
  region: process.env.AWS_REGION || "us-east-1",
  bucketName: process.env.AWS_BUCKET_NAME || "",
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID || "",
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || "",
  },
};

// Initialize S3 Client
export const s3Client = new S3Client({
  region: s3Config.region,
  credentials: s3Config.credentials,
});

// Check if S3 is configured
export const isS3Configured = () => {
  return !!(
    s3Config.bucketName &&
    s3Config.credentials.accessKeyId &&
    s3Config.credentials.secretAccessKey
  );
};
