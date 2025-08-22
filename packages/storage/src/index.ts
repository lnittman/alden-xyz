// Export the main storage manager
export { StorageManager, storage } from './manager';

// Export types
export type {
  StorageProvider,
  StorageFile,
  UploadProgress,
  UploadOptions,
  MultipartUpload,
  MultipartUploadPart,
} from './types';

// Export providers
export { S3StorageProvider } from './providers/s3';
export { R2StorageProvider } from './providers/r2';
export { VercelBlobProvider } from './providers/vercel-blob';
export { GCSStorageProvider } from './providers/gcs';

// Export environment validation
export { storage as storageEnv } from './env';
