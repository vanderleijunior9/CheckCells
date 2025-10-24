import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import crypto from "crypto";

const region = "us-east-1";
const bucketName = "testing-checkcells";
const accessKeyId = process.env.VITE_AWS_ACCESS_KEY_ID;
const secretAccessKey = process.env.VITE_AWS_SECRET_ACCESS_KEY;

const s3Client = new S3Client({
  region,
  credentials: {
    accessKeyId: accessKeyId || "",
    secretAccessKey: secretAccessKey || "",
  },
});

export async function generateUploadUrl() {
  const rawBytes = await crypto.randomBytes(16);
  const imageName = rawBytes.toString("hex");

  const command = new PutObjectCommand({
    Bucket: bucketName,
    Key: imageName,
  });

  const uploadUrl = await getSignedUrl(s3Client, command, { expiresIn: 3600 });
  return uploadUrl;
}
