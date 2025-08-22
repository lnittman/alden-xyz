export interface StorageFile {
  key: string;
  url: string;
  size: number;
  contentType: string;
  metadata?: Record<string, string>;
  lastModified?: Date;
}

export interface UploadProgress {
  loaded: number;
  total: number;
  percentage: number;
}

export interface UploadOptions {
  onProgress?: (progress: UploadProgress) => void;
  metadata?: Record<string, string>;
  contentType?: string;
  maxSize?: number;
}

export interface StorageProvider {
  upload(
    key: string,
    file: Buffer | Blob | ReadableStream,
    options?: UploadOptions
  ): Promise<StorageFile>;

  delete(key: string): Promise<void>;

  get(key: string): Promise<StorageFile | null>;

  getUrl(key: string): string;

  list(prefix?: string): Promise<StorageFile[]>;

  createPresignedUrl(
    key: string,
    operation: 'get' | 'put',
    expiresIn?: number
  ): Promise<string>;
}

export interface MultipartUploadPart {
  partNumber: number;
  etag: string;
}

export interface MultipartUpload {
  uploadId: string;
  key: string;

  uploadPart(
    partNumber: number,
    data: Buffer | Blob,
    options?: UploadOptions
  ): Promise<MultipartUploadPart>;

  complete(parts: MultipartUploadPart[]): Promise<StorageFile>;

  abort(): Promise<void>;
}
