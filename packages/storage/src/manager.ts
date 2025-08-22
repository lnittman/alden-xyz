import { logger } from '@repo/logger';
import { GCSStorageProvider } from './providers/gcs';
import { R2StorageProvider } from './providers/r2';
import { S3StorageProvider } from './providers/s3';
import { VercelBlobProvider } from './providers/vercel-blob';
import type { StorageFile, StorageProvider, UploadProgress } from './types';

export class StorageManager {
  private provider: StorageProvider | null = null;

  constructor() {
    // Delay provider creation until first use
  }

  private getProvider(): StorageProvider {
    if (!this.provider) {
      this.provider = this.createProvider();
    }
    return this.provider;
  }

  private createProvider(): StorageProvider {
    const provider = process.env.STORAGE_PROVIDER;

    switch (provider) {
      case 's3':
        return new S3StorageProvider({
          region: process.env.AWS_REGION!,
          accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
          secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
          bucket: process.env.AWS_BUCKET!,
          publicUrl: process.env.AWS_PUBLIC_URL,
        });

      case 'r2':
        return new R2StorageProvider({
          accountId: process.env.R2_ACCOUNT_ID!,
          accessKeyId: process.env.R2_ACCESS_KEY_ID!,
          secretAccessKey: process.env.R2_SECRET_ACCESS_KEY!,
          bucket: process.env.R2_BUCKET!,
          publicUrl: process.env.R2_PUBLIC_URL,
        });

      case 'vercel-blob':
        return new VercelBlobProvider({
          token: process.env.BLOB_READ_WRITE_TOKEN!,
        });

      case 'gcs':
        return new GCSStorageProvider({
          projectId: process.env.GCP_PROJECT_ID,
          keyFilename: process.env.GOOGLE_APPLICATION_CREDENTIALS,
          bucket: process.env.GCS_BUCKET!,
          publicUrl: process.env.GCS_PUBLIC_URL,
        });

      default:
        // Return a no-op provider if no storage provider is configured
        logger.warn('No storage provider configured, using no-op provider');
        return {
          async upload() {
            throw new Error('Storage provider not configured');
          },
          async get() {
            return null;
          },
          async delete() {
            // No-op
          },
          getUrl() {
            return '';
          },
          async list() {
            return [];
          },
          async createPresignedUrl() {
            throw new Error('Storage provider not configured');
          },
        } as StorageProvider;
    }
  }

  async uploadFile(
    path: string,
    file: Buffer | Blob | File,
    options?: {
      onProgress?: (progress: UploadProgress) => void;
      metadata?: Record<string, string>;
    }
  ): Promise<StorageFile> {
    // Generate unique key
    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(7);
    const extension = this.getFileExtension(file);
    const key = `${path}/${timestamp}-${random}${extension}`;

    // Determine content type
    const contentType = this.getContentType(file);

    logger.info('Uploading file', { key, contentType });

    return this.getProvider().upload(key, file, {
      ...options,
      contentType,
    });
  }

  async get(key: string): Promise<StorageFile | null> {
    return this.getProvider().get(key);
  }

  async deleteFile(key: string): Promise<void> {
    return this.getProvider().delete(key);
  }

  async getFileUrl(key: string): Promise<string> {
    return this.getProvider().getUrl(key);
  }

  async getPresignedUploadUrl(
    path: string,
    contentType: string
  ): Promise<{ url: string; key: string }> {
    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(7);
    const extension = this.getExtensionFromMimeType(contentType);
    const key = `${path}/${timestamp}-${random}${extension}`;

    const url = await this.getProvider().createPresignedUrl(key, 'put', 3600);

    return { url, key };
  }

  private getFileExtension(file: Buffer | Blob | File): string {
    if (file instanceof File) {
      const parts = file.name.split('.');
      return parts.length > 1 ? `.${parts.pop()}` : '';
    }
    return '';
  }

  private getContentType(file: Buffer | Blob | File): string {
    if (file instanceof File || file instanceof Blob) {
      return file.type || 'application/octet-stream';
    }
    return 'application/octet-stream';
  }

  private getExtensionFromMimeType(mimeType: string): string {
    const mimeToExt: Record<string, string> = {
      'image/jpeg': '.jpg',
      'image/png': '.png',
      'image/gif': '.gif',
      'image/webp': '.webp',
      'video/mp4': '.mp4',
      'video/webm': '.webm',
      'audio/mpeg': '.mp3',
      'audio/wav': '.wav',
      'audio/ogg': '.ogg',
    };

    return mimeToExt[mimeType] || '';
  }
}

export const storage = new StorageManager();
