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
  // Generate random bytes using Web Crypto API (browser compatible)
  const array = new Uint8Array(16);
  crypto.getRandomValues(array);
  const imageName = Array.from(array, (byte) =>
    byte.toString(16).padStart(2, "0")
  ).join("");

  const command = new PutObjectCommand({
    Bucket: bucketName,
    Key: imageName,
  });

  const uploadUrl = await getSignedUrl(s3Client, command, { expiresIn: 3600 });
  return uploadUrl;
}
