import aws from "aws-sdk";
import dotenv from "dotenv";
import crypto from "crypto";
dotenv.config();

const region = "us-east-1";
const bucketName = "testing-checkcells";
const accessKeyId = process.env.AWS_ACCESS_KEY_ID;
const secretAccessKey = process.env.AWS_SECRET_ACCESS_KEY;

const s3 = new aws.S3({
  region,
  accessKeyId,
  secretAccessKey,
});

export async function generateUploadUrl() {
  const rawBytes = await crypto.randomBytes(16);
  const imageName = rawBytes.toString("hex");

  const params = {
    Bucket: bucketName,
    Key: imageName,
    Expires: 60,
  };

  const uploadUrl = await s3.getSignedUrlPromise("putObject", params);
  return uploadUrl;
}
