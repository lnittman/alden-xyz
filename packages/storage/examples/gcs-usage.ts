import { storage } from '@repo/storage';

// Example 1: Upload a file
async function uploadExample() {
  const file = Buffer.from('Hello from Google Cloud Storage!');

  const result = await storage.uploadFile('uploads/test', file, {
    metadata: {
      userId: '123',
      uploadedAt: new Date().toISOString(),
    },
    onProgress: (_progress) => {},
  });
  return result;
}

// Example 2: Get a presigned upload URL for client-side uploads
async function getPresignedUrlExample() {
  const { url, key } = await storage.getPresignedUploadUrl(
    'user-uploads',
    'image/jpeg'
  );

  // Client can now upload directly to this URL
  return { url, key };
}

// Example 3: Delete a file
async function deleteExample(key: string) {
  await storage.deleteFile(key);
}

// Example 4: Direct provider usage (advanced)
import { GCSStorageProvider } from '@repo/storage';

async function directProviderExample() {
  const provider = new GCSStorageProvider({
    projectId: process.env.GCP_PROJECT_ID,
    keyFilename: process.env.GOOGLE_APPLICATION_CREDENTIALS,
    bucket: process.env.GCS_BUCKET!,
    publicUrl: process.env.GCS_PUBLIC_URL,
  });

  // List all files with a prefix
  const _files = await provider.list('uploads/');

  // Get file metadata
  const file = await provider.get('uploads/test.jpg');
  if (file) {
  }

  // Create a presigned URL for temporary access
  const _presignedUrl = await provider.createPresignedUrl(
    'private/document.pdf',
    'get',
    3600 // 1 hour
  );
}
