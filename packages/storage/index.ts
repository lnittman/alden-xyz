// Main exports
export { storage } from './src/manager';
export { fileProcessor } from './src/utils/file-processor';

// Type exports
export * from './src/types';

// Provider exports (for advanced usage)
export { S3StorageProvider } from './src/providers/s3';
export { R2StorageProvider } from './src/providers/r2';
export { VercelBlobProvider } from './src/providers/vercel-blob';
export { GCSStorageProvider } from './src/providers/gcs';

// Utility exports
export type { FileMetadata } from './src/utils/file-processor';
