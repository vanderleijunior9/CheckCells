import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

const region = "us-east-1";
const bucketName = "testing-checkcells";
const accessKeyId = import.meta.env.VITE_AWS_ACCESS_KEY_ID;
const secretAccessKey = import.meta.env.VITE_AWS_SECRET_ACCESS_KEY;

const s3Client = new S3Client({
  region,
  credentials: {
    accessKeyId: accessKeyId || "",
    secretAccessKey: secretAccessKey || "",
  },
});

export async function generateUploadUrl() {
  try {
    // Check if credentials are available
    if (!accessKeyId || !secretAccessKey) {
      throw new Error("AWS credentials not found. Please set VITE_AWS_ACCESS_KEY_ID and VITE_AWS_SECRET_ACCESS_KEY environment variables.");
    }

    console.log("🔑 AWS Credentials found:", {
      accessKeyId: accessKeyId.substring(0, 8) + "...",
      secretAccessKey: secretAccessKey.substring(0, 8) + "...",
      region,
      bucketName
    });

    // Generate random bytes using Web Crypto API (browser compatible)
    const array = new Uint8Array(16);
    crypto.getRandomValues(array);
    const imageName = Array.from(array, (byte) =>
      byte.toString(16).padStart(2, "0")
    ).join("");

    console.log("📝 Generated file name:", imageName);

    const command = new PutObjectCommand({
      Bucket: bucketName,
      Key: imageName,
    });

    console.log("🔗 Generating signed URL...");
    const uploadUrl = await getSignedUrl(s3Client, command, { expiresIn: 3600 });
    console.log("✅ Signed URL generated successfully");
    
    return uploadUrl;
  } catch (error) {
    console.error("❌ Error generating upload URL:", error);
    throw new Error(`Failed to generate upload URL: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}
