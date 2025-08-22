import { S3StorageProvider } from './s3';

export class R2StorageProvider extends S3StorageProvider {
  constructor(config: {
    accountId: string;
    accessKeyId: string;
    secretAccessKey: string;
    bucket: string;
    publicUrl?: string;
  }) {
    super({
      region: 'auto',
      accessKeyId: config.accessKeyId,
      secretAccessKey: config.secretAccessKey,
      bucket: config.bucket,
      endpoint: `https://${config.accountId}.r2.cloudflarestorage.com`,
      publicUrl: config.publicUrl,
    });
  }

  // R2-specific optimizations can be added here
  getUrl(key: string): string {
    // R2 supports custom domains
    if (this.publicUrl) {
      return `${this.publicUrl}/${key}`;
    }
    return super.getUrl(key);
  }
}
