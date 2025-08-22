import { del, head, list, put } from '@vercel/blob';
import type { StorageFile, StorageProvider, UploadOptions } from '../types';

export class VercelBlobProvider implements StorageProvider {
  private token: string;

  constructor(config: { token: string }) {
    this.token = config.token;
  }

  async upload(
    key: string,
    file: Buffer | Blob | ReadableStream,
    options?: UploadOptions
  ): Promise<StorageFile> {
    // Vercel Blob handles progress internally
    const blob = await put(key, file, {
      access: 'public',
      token: this.token,
      contentType: options?.contentType,
      addRandomSuffix: false,
    });

    // Calculate size based on the input file
    let size = 0;
    if (file instanceof Buffer) {
      size = file.length;
    } else if (file instanceof Blob) {
      size = file.size;
    }

    return {
      key,
      url: blob.url,
      size,
      contentType: options?.contentType || 'application/octet-stream',
      metadata: options?.metadata,
    };
  }

  async delete(key: string): Promise<void> {
    await del(key, { token: this.token });
  }

  async get(key: string): Promise<StorageFile | null> {
    try {
      const blob = await head(key, { token: this.token });

      return {
        key,
        url: blob.url,
        size: blob.size,
        contentType: blob.contentType || 'application/octet-stream',
        lastModified: new Date(blob.uploadedAt),
      };
    } catch (error: any) {
      if (error.message?.includes('not found')) {
        return null;
      }
      throw error;
    }
  }

  getUrl(key: string): string {
    // Vercel Blob URLs are generated dynamically
    return `https://blob.vercel-storage.com/${key}`;
  }

  async list(prefix?: string): Promise<StorageFile[]> {
    const response = await list({
      token: this.token,
      prefix,
      limit: 1000,
    });

    return response.blobs.map((blob) => ({
      key: blob.pathname,
      url: blob.url,
      size: blob.size,
      contentType: 'application/octet-stream', // Vercel Blob doesn't expose contentType in list
      lastModified: new Date(blob.uploadedAt),
    }));
  }

  async createPresignedUrl(
    key: string,
    operation: 'get' | 'put',
    _expiresIn?: number
  ): Promise<string> {
    // Vercel Blob URLs are always public
    if (operation === 'get') {
      return this.getUrl(key);
    }

    // For uploads, return a special URL that the client can use
    throw new Error('Presigned uploads not supported with Vercel Blob');
  }
}
