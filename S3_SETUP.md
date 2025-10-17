# AWS S3 Setup for Video Storage

This guide will help you configure AWS S3 bucket to store recorded videos.

## Prerequisites

- AWS Account
- S3 Bucket created
- IAM User with S3 permissions

## Step 1: Create an S3 Bucket

1. Log in to [AWS Console](https://console.aws.amazon.com/)
2. Navigate to **S3** service
3. Click **Create bucket**
4. Enter a unique bucket name (e.g., `checkcells-videos-prod`)
5. Select your preferred region (e.g., `us-east-1`)
6. Configure bucket settings:
   - **Block Public Access**: Keep enabled (recommended)
   - **Versioning**: Optional (recommended for backup)
   - **Encryption**: Enable (recommended)
7. Click **Create bucket**

## Step 2: Configure CORS (if accessing from browser)

1. Go to your bucket
2. Click on **Permissions** tab
3. Scroll to **Cross-origin resource sharing (CORS)**
4. Add the following CORS configuration:

```json
[
    {
        "AllowedHeaders": ["*"],
        "AllowedMethods": ["GET", "PUT", "POST", "DELETE"],
        "AllowedOrigins": ["*"],
        "ExposeHeaders": []
    }
]
```

## Step 3: Create IAM User with S3 Access

1. Navigate to **IAM** service
2. Click **Users** → **Create user**
3. Enter username (e.g., `checkcells-s3-uploader`)
4. Select **Attach policies directly**
5. Attach the following policy (or create a custom policy):
   - **AmazonS3FullAccess** (or create a more restrictive policy below)

### Recommended Custom Policy (More Secure)

```json
{
    "Version": "2012-10-17",
    "Statement": [
        {
            "Effect": "Allow",
            "Action": [
                "s3:PutObject",
                "s3:GetObject",
                "s3:DeleteObject"
            ],
            "Resource": "arn:aws:s3:::your-bucket-name/*"
        },
        {
            "Effect": "Allow",
            "Action": [
                "s3:ListBucket"
            ],
            "Resource": "arn:aws:s3:::your-bucket-name"
        }
    ]
}
```

6. Create user and save the **Access Key ID** and **Secret Access Key**

## Step 4: Configure Environment Variables

1. Create a `.env` file in the project root:

```bash
touch .env
```

2. Add the following variables:

```env
VITE_AWS_REGION=us-east-1
VITE_AWS_BUCKET_NAME=your-bucket-name
VITE_AWS_ACCESS_KEY_ID=your-access-key-id
VITE_AWS_SECRET_ACCESS_KEY=your-secret-access-key
```

3. Replace the values with your actual AWS credentials

**⚠️ IMPORTANT**: Never commit the `.env` file to git. It's already in `.gitignore`.

## Step 5: Verify Configuration

1. Restart your development server:

```bash
npm run dev
```

2. Record a test video
3. Check the browser console for S3 upload logs
4. Verify the video appears in your S3 bucket

## Video Storage Structure

Videos are organized in S3 with the following structure:

```
videos/
  └── {testId}/
      ├── recording_1_{timestamp}.webm
      ├── recording_2_{timestamp}.webm
      └── ...
```

## Metadata Stored with Videos

Each video in S3 includes the following metadata:
- `scientist`: Name/ID of the scientist
- `testId`: Test identifier
- `recordingNumber`: Sequential recording number

## Accessing Videos

Videos are stored with the following URL pattern:
```
https://{bucket-name}.s3.{region}.amazonaws.com/videos/{testId}/recording_{number}_{timestamp}.webm
```

The S3 URL is also saved in the API database for easy retrieval.

## Troubleshooting

### Videos not uploading to S3

1. **Check environment variables**: Ensure all VITE_AWS_* variables are set correctly
2. **Check IAM permissions**: Verify the IAM user has PutObject permission
3. **Check CORS**: Ensure CORS is configured if uploading from browser
4. **Check console logs**: Look for error messages in browser console

### 403 Forbidden Error

- Verify IAM user has correct permissions
- Check bucket policy doesn't block access
- Ensure access key and secret key are correct

### Network errors

- Check your internet connection
- Verify the region is correct
- Check if bucket name is correct and accessible

## Cost Considerations

- **Storage**: Pay for GB stored per month
- **Requests**: Pay per PUT/GET request
- **Data Transfer**: Pay for data transfer out of S3

Estimate costs using [AWS Pricing Calculator](https://calculator.aws/).

## Security Best Practices

1. ✅ Use IAM user with minimal required permissions
2. ✅ Enable bucket encryption
3. ✅ Never commit credentials to git
4. ✅ Rotate access keys regularly
5. ✅ Enable CloudTrail logging for audit trail
6. ✅ Set up bucket lifecycle policies to archive old videos
7. ✅ Use MFA for sensitive operations

## Support

For AWS S3 documentation, visit:
- [S3 Documentation](https://docs.aws.amazon.com/s3/)
- [IAM User Guide](https://docs.aws.amazon.com/IAM/)

