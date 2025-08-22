import { type DatabaseClient, eq, schema } from '@repo/database';
import { storage } from '@repo/storage';
import { ServiceError, notFound } from './lib/errors';

export interface StagedUpload {
  id: string;
  userId: string;
  type: 'image' | 'video' | 'audio' | 'gif' | 'text' | 'file';
  name: string;
  size: number;
  mimeType: string;
  storageKey?: string;
  presignedUrl?: string;
  status: 'pending' | 'uploading' | 'completed' | 'failed';
  metadata?: Record<string, any>;
  thumbnailUrl?: string;
  createdAt: Date;
  expiresAt: Date;
}

export class UploadService {
  constructor(private db: DatabaseClient, private env: any = {}) {}
  private stages = new Map<string, StagedUpload>();

  async stageUpload(
    userId: string,
    data: {
      name: string;
      type: 'image' | 'video' | 'audio' | 'gif' | 'text' | 'file';
      size: number;
      mimeType: string;
      metadata?: Record<string, any>;
    }
  ): Promise<StagedUpload> {
    const id = crypto.randomUUID();
    const now = new Date();
    const expiresAt = new Date(now.getTime() + 24 * 60 * 60 * 1000); // 24 hours

    // Create presigned upload URL
    const { url: presignedUrl, key: storageKey } =
      await storage.getPresignedUploadUrl(
        `uploads/${userId}/${data.type}`,
        data.mimeType
      );

    const staged: StagedUpload = {
      id,
      userId,
      ...data,
      storageKey,
      presignedUrl,
      status: 'pending',
      createdAt: now,
      expiresAt,
    };

    // Store in memory for now (can be moved to database for production)
    this.stages.set(id, staged);

    // Create database record
    await this.db.insert(schema.uploads).values({
      id,
      userId,
      storageKey,
      type: data.type,
      name: data.name,
      size: data.size,
      mimeType: data.mimeType,
      status: 'pending',
      metadata: data.metadata || {},
      expiresAt,
    });

    return staged;
  }

  async confirmUpload(
    stageId: string,
    userId: string
  ): Promise<{ key: string; url: string; thumbnailUrl?: string }> {
    const staged = this.stages.get(stageId);

    if (!staged || staged.userId !== userId) {
      throw notFound('Upload stage not found');
    }

    if (staged.status !== 'pending') {
      throw new ServiceError(
        'Upload already confirmed',
        400,
        'UPLOAD_ALREADY_CONFIRMED'
      );
    }

    if (new Date() > staged.expiresAt) {
      throw new ServiceError('Upload stage expired', 400, 'UPLOAD_EXPIRED');
    }

    try {
      // Verify the file exists in storage
      const file = await storage.get(staged.storageKey!);

      if (!file) {
        throw new ServiceError('File not found in storage', 404, 'UPLOAD_FAILED');
      }

      staged.status = 'completed';
      this.stages.delete(stageId);

      // Update database
      await this.db
        .update(schema.uploads)
        .set({ status: 'completed' })
        .where(eq(schema.uploads.id, stageId));

      // Generate thumbnail for images
      let thumbnailUrl;
      if (staged.type === 'image') {
        thumbnailUrl = await this.generateThumbnail(
          staged.storageKey!,
          staged.mimeType
        );
      }

      return {
        key: staged.storageKey!,
        url: file.url,
        thumbnailUrl,
      };
    } catch (_error) {
      staged.status = 'failed';
      throw new ServiceError('Failed to confirm upload', 500, 'UPLOAD_FAILED');
    }
  }

  async cancelUpload(stageId: string, userId: string): Promise<void> {
    const staged = this.stages.get(stageId);

    if (!staged || staged.userId !== userId) {
      throw notFound('Upload stage not found');
    }

    // Clean up storage if file exists
    if (staged.storageKey && staged.status === 'completed') {
      try {
        await storage.deleteFile(staged.storageKey);
      } catch (_error) {}
    }

    this.stages.delete(stageId);

    // Update database
    await this.db
      .update(schema.uploads)
      .set({ status: 'cancelled' })
      .where(eq(schema.uploads.id, stageId));
  }

  async getUploadProgress(
    userId: string,
    stageId?: string
  ): Promise<StagedUpload[]> {
    if (stageId) {
      const staged = this.stages.get(stageId);
      if (!staged || staged.userId !== userId) {
        throw notFound('Upload stage not found');
      }
      return [staged];
    }

    return Array.from(this.stages.values()).filter((s) => s.userId === userId);
  }

  async handleFileUpload(
    userId: string,
    file: File,
    _boardId?: string,
    onProgress?: (progress: {
      loaded: number;
      total: number;
      percentage: number;
    }) => void
  ): Promise<{
    id: string;
    type: 'image' | 'video' | 'audio' | 'gif' | 'text' | 'file';
    name: string;
    url: string;
    thumbnailUrl?: string;
    metadata: Record<string, any>;
  }> {
    // Validate file type
    const assetType = this.determineAssetType(file.type);

    // Stage the upload
    const staged = await this.stageUpload(userId, {
      name: file.name,
      type: assetType,
      size: file.size,
      mimeType: file.type,
      metadata: {
        originalName: file.name,
        lastModified: file.lastModified,
      },
    });

    // Upload the file
    staged.status = 'uploading';

    const _uploadedFile = await storage.uploadFile(
      `uploads/${userId}/${assetType}`,
      file,
      {
        onProgress,
        metadata: {
          userId,
          originalName: file.name,
          uploadId: staged.id,
        },
      }
    );

    // Confirm the upload
    const result = await this.confirmUpload(staged.id, userId);

    const assetData = {
      id: crypto.randomUUID(),
      type: assetType,
      name: file.name,
      url: result.url,
      thumbnailUrl: result.thumbnailUrl,
      storageKey: result.key,
      size: file.size,
      mimeType: file.type,
      metadata: staged.metadata || {},
    };

    return assetData;
  }

  private determineAssetType(
    mimeType: string
  ): 'image' | 'video' | 'audio' | 'gif' | 'text' | 'file' {
    if (mimeType.startsWith('image/')) {
      return mimeType === 'image/gif' ? 'gif' : 'image';
    }
    if (mimeType.startsWith('video/')) {
      return 'video';
    }
    if (mimeType.startsWith('audio/')) {
      return 'audio';
    }
    if (mimeType.startsWith('text/')) {
      return 'text';
    }
    return 'file';
  }

  private async generateThumbnail(
    key: string,
    _mimeType: string
  ): Promise<string> {
    // In a real implementation, this would use a service like Cloudinary or
    // generate thumbnails using a Lambda function/Edge function
    // For now, return the原图 URL
    const file = await storage.get(key);
    return file?.url || '';
  }
}

