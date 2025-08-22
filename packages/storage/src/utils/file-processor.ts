import { logger } from '@repo/logger';

// Dynamic import for sharp to avoid client-side issues
let sharp: any = null;
if (typeof window === 'undefined') {
  try {
    sharp = require('sharp');
  } catch (e) {
    // Sharp not available
  }
}

export interface FileMetadata {
  size: number;
  mimeType: string;
  width?: number;
  height?: number;
  duration?: number;
  format?: string;
}

export class FileProcessor {
  async extractMetadata(file: Buffer, mimeType: string): Promise<FileMetadata> {
    const metadata: FileMetadata = {
      size: file.length,
      mimeType,
    };

    if (mimeType.startsWith('image/')) {
      const imageMetadata = await this.extractImageMetadata(file);
      Object.assign(metadata, imageMetadata);
    } else if (mimeType.startsWith('video/')) {
      // Video metadata extraction would use ffmpeg
      // Placeholder for now
      metadata.format = 'video';
    } else if (mimeType.startsWith('audio/')) {
      // Audio metadata extraction would use audio libraries
      metadata.format = 'audio';
    }

    return metadata;
  }

  private async extractImageMetadata(
    buffer: Buffer
  ): Promise<Partial<FileMetadata>> {
    if (!sharp) {
      return {};
    }
    try {
      const metadata = await sharp(buffer).metadata();

      return {
        width: metadata.width,
        height: metadata.height,
        format: metadata.format,
      };
    } catch (error) {
      logger.error('Failed to extract image metadata', { error });
      return {};
    }
  }

  async generateThumbnail(
    buffer: Buffer,
    options: {
      width?: number;
      height?: number;
      format?: 'jpeg' | 'png' | 'webp';
    } = {}
  ): Promise<Buffer> {
    if (!sharp) {
      return buffer; // Return original if sharp not available
    }
    const { width = 400, height = 400, format = 'jpeg' } = options;

    return sharp(buffer)
      .resize(width, height, {
        fit: 'inside',
        withoutEnlargement: true,
      })
      .toFormat(format, {
        quality: 80,
      })
      .toBuffer();
  }

  async optimizeImage(buffer: Buffer, mimeType: string): Promise<Buffer> {
    if (!sharp) {
      return buffer; // Return original if sharp not available
    }
    const format = mimeType.split('/')[1] as any;

    return sharp(buffer)
      .toFormat(format, {
        quality: 85,
        progressive: true,
      })
      .toBuffer();
  }
}

export const fileProcessor = new FileProcessor();
