import {
  DeleteObjectCommand,
  GetObjectCommand,
  ListObjectsV2Command,
  PutObjectCommand,
  S3Client,
} from '@aws-sdk/client-s3';
import { Upload } from '@aws-sdk/lib-storage';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { logger } from '@repo/logger';
import type { StorageFile, StorageProvider, UploadOptions } from '../types';

export class S3StorageProvider implements StorageProvider {
  protected client: S3Client;
  protected bucket: string;
  protected publicUrl?: string;

  constructor(config: {
    region: string;
    accessKeyId: string;
    secretAccessKey: string;
    bucket: string;
    endpoint?: string; // For S3-compatible services
    publicUrl?: string;
  }) {
    this.client = new S3Client({
      region: config.region,
      credentials: {
        accessKeyId: config.accessKeyId,
        secretAccessKey: config.secretAccessKey,
      },
      endpoint: config.endpoint,
    });

    this.bucket = config.bucket;
    this.publicUrl = config.publicUrl;
  }

  async upload(
    key: string,
    file: Buffer | Blob | ReadableStream,
    options?: UploadOptions
  ): Promise<StorageFile> {
    try {
      // Check file size if maxSize is specified
      if (
        options?.maxSize &&
        file instanceof Buffer &&
        file.length > options.maxSize
      ) {
        throw new Error(
          `File size exceeds maximum allowed size of ${options.maxSize} bytes`
        );
      }

      // Use multipart upload for large files
      const isLargeFile =
        file instanceof Buffer && file.length > 5 * 1024 * 1024; // 5MB

      if (isLargeFile || file instanceof ReadableStream) {
        return this.multipartUpload(key, file, options);
      }

      // Simple upload for small files
      const command = new PutObjectCommand({
        Bucket: this.bucket,
        Key: key,
        Body: file,
        ContentType: options?.contentType,
        Metadata: options?.metadata,
      });

      await this.client.send(command);

      return {
        key,
        url: this.getUrl(key),
        size: file instanceof Buffer ? file.length : (file as Blob).size,
        contentType: options?.contentType || 'application/octet-stream',
        metadata: options?.metadata,
      };
    } catch (error) {
      logger.error('S3 upload failed', { key, error });
      throw error;
    }
  }

  private async multipartUpload(
    key: string,
    file: Buffer | Blob | ReadableStream,
    options?: UploadOptions
  ): Promise<StorageFile> {
    const parallelUploads3 = new Upload({
      client: this.client,
      params: {
        Bucket: this.bucket,
        Key: key,
        Body: file,
        ContentType: options?.contentType,
        Metadata: options?.metadata,
      },
      queueSize: 4,
      partSize: 5 * 1024 * 1024, // 5MB parts
      leavePartsOnError: false,
    });

    parallelUploads3.on('httpUploadProgress', (progress) => {
      if (options?.onProgress && progress.loaded && progress.total) {
        options.onProgress({
          loaded: progress.loaded,
          total: progress.total,
          percentage: Math.round((progress.loaded / progress.total) * 100),
        });
      }
    });

    await parallelUploads3.done();

    return {
      key,
      url: this.getUrl(key),
      size: file instanceof Buffer ? file.length : 0,
      contentType: options?.contentType || 'application/octet-stream',
      metadata: options?.metadata,
    };
  }

  async delete(key: string): Promise<void> {
    const command = new DeleteObjectCommand({
      Bucket: this.bucket,
      Key: key,
    });

    await this.client.send(command);
  }

  async get(key: string): Promise<StorageFile | null> {
    try {
      const command = new GetObjectCommand({
        Bucket: this.bucket,
        Key: key,
      });

      const response = await this.client.send(command);

      return {
        key,
        url: this.getUrl(key),
        size: response.ContentLength || 0,
        contentType: response.ContentType || 'application/octet-stream',
        metadata: response.Metadata,
        lastModified: response.LastModified,
      };
    } catch (error: any) {
      if (error.name === 'NoSuchKey') {
        return null;
      }
      throw error;
    }
  }

  getUrl(key: string): string {
    if (this.publicUrl) {
      return `${this.publicUrl}/${key}`;
    }
    return `https://${this.bucket}.s3.amazonaws.com/${key}`;
  }

  async list(prefix?: string): Promise<StorageFile[]> {
    const command = new ListObjectsV2Command({
      Bucket: this.bucket,
      Prefix: prefix,
      MaxKeys: 1000,
    });

    const response = await this.client.send(command);

    return (response.Contents || []).map((object) => ({
      key: object.Key!,
      url: this.getUrl(object.Key!),
      size: object.Size || 0,
      contentType: 'application/octet-stream',
      lastModified: object.LastModified,
    }));
  }

  async createPresignedUrl(
    key: string,
    operation: 'get' | 'put',
    expiresIn = 3600
  ): Promise<string> {
    const command =
      operation === 'get'
        ? new GetObjectCommand({ Bucket: this.bucket, Key: key })
        : new PutObjectCommand({ Bucket: this.bucket, Key: key });

    return getSignedUrl(this.client, command, { expiresIn });
  }
}
