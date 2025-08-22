import { Readable } from 'node:stream';
import { type File, Storage } from '@google-cloud/storage';
import { logger } from '@repo/logger';
import type { StorageFile, StorageProvider, UploadOptions } from '../types';

export class GCSStorageProvider implements StorageProvider {
  private storage: Storage;
  private bucket: string;
  private publicUrl?: string;

  constructor(config: {
    projectId?: string;
    keyFilename?: string; // Path to service account JSON
    bucket: string;
    publicUrl?: string;
  }) {
    this.storage = new Storage({
      projectId: config.projectId,
      keyFilename: config.keyFilename,
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

      const bucketInstance = this.storage.bucket(this.bucket);
      const fileInstance = bucketInstance.file(key);

      // Convert Blob or ReadableStream to Buffer or Stream
      let uploadData: Buffer | Readable;
      let fileSize = 0;

      if (file instanceof Buffer) {
        uploadData = file;
        fileSize = file.length;
      } else if (file instanceof Blob) {
        const arrayBuffer = await file.arrayBuffer();
        uploadData = Buffer.from(arrayBuffer);
        fileSize = uploadData.length;
      } else if (file instanceof ReadableStream) {
        // Convert ReadableStream to Node.js Readable stream
        const reader = file.getReader();
        uploadData = new Readable({
          async read() {
            try {
              const { done, value } = await reader.read();
              if (done) {
                this.push(null);
              } else {
                this.push(Buffer.from(value));
              }
            } catch (error) {
              this.destroy(error as Error);
            }
          },
        });
      } else {
        throw new Error('Unsupported file type');
      }

      // Create write stream with metadata
      const writeStream = fileInstance.createWriteStream({
        metadata: {
          contentType: options?.contentType || 'application/octet-stream',
          metadata: options?.metadata,
        },
        resumable: fileSize > 5 * 1024 * 1024, // Use resumable uploads for files > 5MB
      });

      // Track upload progress if callback provided
      if (options?.onProgress && uploadData instanceof Buffer) {
        const totalSize = uploadData.length;
        let uploadedSize = 0;

        writeStream.on('progress', (event: any) => {
          uploadedSize = event.bytesWritten || 0;
          options.onProgress?.({
            loaded: uploadedSize,
            total: totalSize,
            percentage: Math.round((uploadedSize / totalSize) * 100),
          });
        });
      }

      // Handle upload
      return new Promise((resolve, reject) => {
        writeStream
          .on('error', (error) => {
            logger.error('GCS upload failed', { key, error });
            reject(error);
          })
          .on('finish', async () => {
            // Make file public if bucket is public
            try {
              await fileInstance.makePublic();
            } catch (error) {
              // Ignore error if bucket doesn't allow public access
              logger.debug('Failed to make file public', { key, error });
            }

            resolve({
              key,
              url: this.getUrl(key),
              size: fileSize,
              contentType: options?.contentType || 'application/octet-stream',
              metadata: options?.metadata,
            });
          });

        if (uploadData instanceof Buffer) {
          writeStream.end(uploadData);
        } else if (uploadData instanceof Readable) {
          uploadData.pipe(writeStream);
        } else {
          throw new Error('Invalid upload data type');
        }
      });
    } catch (error) {
      logger.error('GCS upload failed', { key, error });
      throw error;
    }
  }

  async delete(key: string): Promise<void> {
    const file = this.storage.bucket(this.bucket).file(key);
    await file.delete();
  }

  async get(key: string): Promise<StorageFile | null> {
    try {
      const file = this.storage.bucket(this.bucket).file(key);
      const [exists] = await file.exists();

      if (!exists) {
        return null;
      }

      const [metadata] = await file.getMetadata();

      return {
        key,
        url: this.getUrl(key),
        size:
          typeof metadata.size === 'string'
            ? Number.parseInt(metadata.size, 10)
            : metadata.size || 0,
        contentType: metadata.contentType || 'application/octet-stream',
        metadata: metadata.metadata as Record<string, string>,
        lastModified: metadata.updated ? new Date(metadata.updated) : undefined,
      };
    } catch (error: any) {
      if (error.code === 404) {
        return null;
      }
      throw error;
    }
  }

  getUrl(key: string): string {
    if (this.publicUrl) {
      return `${this.publicUrl}/${key}`;
    }
    return `https://storage.googleapis.com/${this.bucket}/${key}`;
  }

  async list(prefix?: string): Promise<StorageFile[]> {
    const [files] = await this.storage.bucket(this.bucket).getFiles({
      prefix,
      maxResults: 1000,
    });

    return files.map((file: File) => ({
      key: file.name,
      url: this.getUrl(file.name),
      size:
        typeof file.metadata.size === 'string'
          ? Number.parseInt(file.metadata.size, 10)
          : file.metadata.size || 0,
      contentType: file.metadata.contentType || 'application/octet-stream',
      lastModified: file.metadata.updated
        ? new Date(file.metadata.updated)
        : undefined,
    }));
  }

  async createPresignedUrl(
    key: string,
    operation: 'get' | 'put',
    expiresIn = 3600
  ): Promise<string> {
    const file = this.storage.bucket(this.bucket).file(key);
    const expirationDate = new Date();
    expirationDate.setSeconds(expirationDate.getSeconds() + expiresIn);

    const [url] = await file.getSignedUrl({
      version: 'v4',
      action: operation === 'get' ? 'read' : 'write',
      expires: expirationDate,
    });

    return url;
  }
}
