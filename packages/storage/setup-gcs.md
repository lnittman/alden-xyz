# Setting up Google Cloud Storage

## Prerequisites

1. A Google Cloud Project with Cloud Storage API enabled
2. A service account with Storage Admin permissions
3. A Cloud Storage bucket

## Setup Instructions

### 1. Service Account Credentials

Place your service account JSON file in the AI service credentials directory:

```bash
cp /path/to/your-service-account.json ../../apps/ai/credentials/squish-dev-sa.json
```

### 2. Environment Variables

Add the following to your `.env.local` file:

```bash
# Storage Provider - Change from 'vercel-blob' to 'gcs'
STORAGE_PROVIDER=gcs

# Google Cloud Storage Configuration
GCP_PROJECT_ID=your-project-id
GOOGLE_APPLICATION_CREDENTIALS=../../apps/ai/credentials/squish-dev-sa.json
GCS_BUCKET=your-bucket-name
GCS_PUBLIC_URL=https://storage.googleapis.com/your-bucket-name  # Optional: Custom domain

# Remove or comment out Vercel Blob token if switching from Vercel
# BLOB_READ_WRITE_TOKEN=
```

### 3. Bucket Configuration

Ensure your GCS bucket has the appropriate settings:

#### For Public Access (if needed):
```bash
# Make bucket publicly readable
gsutil iam ch allUsers:objectViewer gs://your-bucket-name

# Or use uniform bucket-level access
gsutil uniformbucketlevelaccess set on gs://your-bucket-name
```

#### For Private Access:
- Keep default settings
- Use presigned URLs for temporary access

### 4. CORS Configuration (for browser uploads)

Create a `cors.json` file:

```json
[
  {
    "origin": ["http://localhost:9999", "https://your-domain.com"],
    "method": ["GET", "POST", "PUT", "DELETE"],
    "responseHeader": ["Content-Type", "Access-Control-Allow-Origin"],
    "maxAgeSeconds": 3600
  }
]
```

Apply it to your bucket:
```bash
gsutil cors set cors.json gs://your-bucket-name
```

## Testing

Run the storage tests to verify your configuration:

```bash
bun run test packages/storage/src/__tests__/gcs.test.ts
```

## Features Supported

- ✅ File upload (with progress tracking for Buffer uploads)
- ✅ File deletion
- ✅ File retrieval
- ✅ File listing with prefix
- ✅ Presigned URLs for temporary access
- ✅ Metadata support
- ✅ Large file uploads with resumable uploads
- ✅ Stream support for large files

## Migration from Other Providers

To migrate from another storage provider:

1. Change `STORAGE_PROVIDER` in your `.env.local`
2. Add the required GCS environment variables
3. Restart your application

The storage manager will automatically use the new provider.

## Production Considerations

1. **Authentication**: In production, consider using Workload Identity Federation instead of service account keys
2. **Bucket Location**: Choose a region close to your users
3. **Lifecycle Policies**: Set up lifecycle rules to manage old files
4. **Monitoring**: Enable Cloud Storage metrics and logging
5. **Costs**: Monitor storage and bandwidth costs

## Troubleshooting

### Common Issues

1. **Authentication Error**: Ensure the service account JSON file path is correct and the file exists
2. **Permission Denied**: Verify the service account has Storage Admin or appropriate permissions
3. **Bucket Not Found**: Check the bucket name and ensure it exists in your project
4. **CORS Issues**: Apply the CORS configuration if uploading from browsers