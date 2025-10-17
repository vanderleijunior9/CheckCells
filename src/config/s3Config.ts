// AWS S3 Configuration
// IMPORTANT: Add these to your .env file:
// VITE_AWS_REGION=your-region (e.g., us-east-1)
// VITE_AWS_BUCKET_NAME=your-bucket-name
// VITE_AWS_ACCESS_KEY_ID=your-access-key-id
// VITE_AWS_SECRET_ACCESS_KEY=your-secret-access-key

export const s3Config = {
  region: import.meta.env.VITE_AWS_REGION || 'us-east-1',
  bucketName: import.meta.env.VITE_AWS_BUCKET_NAME || '',
  credentials: {
    accessKeyId: import.meta.env.VITE_AWS_ACCESS_KEY_ID || '',
    secretAccessKey: import.meta.env.VITE_AWS_SECRET_ACCESS_KEY || '',
  },
};

// Check if S3 is configured
export const isS3Configured = () => {
  return !!(
    s3Config.bucketName &&
    s3Config.credentials.accessKeyId &&
    s3Config.credentials.secretAccessKey
  );
};

