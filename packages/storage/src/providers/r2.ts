import { S3StorageProvider } from './s3';
import type { StorageFile, UploadOptions } from '../types';

export class R2StorageProvider extends S3StorageProvider {
  private readonly accountId: string;
  
  constructor(config: {
    accountId: string;
    accessKeyId: string;
    secretAccessKey: string;
    bucket: string;
    publicUrl?: string;
    customDomain?: string;
  }) {
    super({
      region: 'auto',
      accessKeyId: config.accessKeyId,
      secretAccessKey: config.secretAccessKey,
      bucket: config.bucket,
      endpoint: `https://${config.accountId}.r2.cloudflarestorage.com`,
      publicUrl: config.publicUrl || config.customDomain,
      forcePathStyle: false,
    });
    
    this.accountId = config.accountId;
  }

  // R2-specific optimizations
  async upload(
    key: string,
    file: Buffer | Blob | ReadableStream,
    options?: UploadOptions
  ): Promise<StorageFile> {
    // R2 automatically handles caching headers
    const r2Options = {
      ...options,
      metadata: {
        ...options?.metadata,
        'Cache-Control': options?.metadata?.['Cache-Control'] || 'public, max-age=31536000',
      },
    };
    
    return super.upload(key, file, r2Options);
  }
  
  getUrl(key: string): string {
    // R2 supports custom domains for public access
    if (this.publicUrl) {
      return `${this.publicUrl}/${key}`;
    }
    
    // Use R2.dev domain for public buckets
    return `https://pub-${this.accountId}.r2.dev/${key}`;
  }

  // R2-specific method for generating temporary URLs
  async createPresignedUrl(
    key: string,
    operation: 'get' | 'put',
    expiresIn: number = 3600
  ): Promise<string> {
    // R2 supports presigned URLs with custom expiration
    return super.createPresignedUrl(key, operation, Math.min(expiresIn, 604800)); // Max 7 days
  }
  
  // R2-specific bulk operations
  async bulkDelete(keys: string[]): Promise<void> {
    // R2 supports up to 1000 objects per delete operation
    const chunks = [];
    for (let i = 0; i < keys.length; i += 1000) {
      chunks.push(keys.slice(i, i + 1000));
    }
    
    await Promise.all(
      chunks.map(chunk => 
        Promise.all(chunk.map(key => this.delete(key)))
      )
    );
  }
}
