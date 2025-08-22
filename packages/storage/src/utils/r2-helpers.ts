/**
 * R2 Helper Functions
 * Utilities for working with Cloudflare R2 storage
 */

export interface R2UploadOptions {
  contentType?: string;
  cacheControl?: string;
  contentDisposition?: string;
  metadata?: Record<string, string>;
}

export interface R2SignedUrlOptions {
  expiresIn?: number; // seconds
  customDomain?: string;
}

/**
 * Generate a unique key for file uploads
 */
export function generateFileKey(
  folder: string,
  fileName: string,
  userId?: string
): string {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(7);
  const extension = fileName.split('.').pop();
  
  const parts = [folder];
  if (userId) parts.push(userId);
  parts.push(`${timestamp}-${random}.${extension}`);
  
  return parts.join('/');
}

/**
 * Get file extension from MIME type
 */
export function getExtensionFromMimeType(mimeType: string): string {
  const mimeToExt: Record<string, string> = {
    // Images
    'image/jpeg': 'jpg',
    'image/jpg': 'jpg',
    'image/png': 'png',
    'image/gif': 'gif',
    'image/webp': 'webp',
    'image/svg+xml': 'svg',
    'image/avif': 'avif',
    
    // Videos
    'video/mp4': 'mp4',
    'video/webm': 'webm',
    'video/ogg': 'ogv',
    'video/quicktime': 'mov',
    
    // Audio
    'audio/mpeg': 'mp3',
    'audio/wav': 'wav',
    'audio/ogg': 'ogg',
    'audio/webm': 'weba',
    'audio/aac': 'aac',
    
    // Documents
    'application/pdf': 'pdf',
    'application/msword': 'doc',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document': 'docx',
    'application/vnd.ms-excel': 'xls',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': 'xlsx',
    'application/vnd.ms-powerpoint': 'ppt',
    'application/vnd.openxmlformats-officedocument.presentationml.presentation': 'pptx',
    
    // Archives
    'application/zip': 'zip',
    'application/x-rar-compressed': 'rar',
    'application/x-7z-compressed': '7z',
    'application/x-tar': 'tar',
    'application/gzip': 'gz',
    
    // Text
    'text/plain': 'txt',
    'text/markdown': 'md',
    'text/csv': 'csv',
    'application/json': 'json',
    'application/xml': 'xml',
  };
  
  return mimeToExt[mimeType] || 'bin';
}

/**
 * Get MIME type from file extension
 */
export function getMimeTypeFromExtension(extension: string): string {
  const ext = extension.toLowerCase().replace('.', '');
  
  const extToMime: Record<string, string> = {
    // Images
    'jpg': 'image/jpeg',
    'jpeg': 'image/jpeg',
    'png': 'image/png',
    'gif': 'image/gif',
    'webp': 'image/webp',
    'svg': 'image/svg+xml',
    'avif': 'image/avif',
    
    // Videos
    'mp4': 'video/mp4',
    'webm': 'video/webm',
    'ogv': 'video/ogg',
    'mov': 'video/quicktime',
    
    // Audio
    'mp3': 'audio/mpeg',
    'wav': 'audio/wav',
    'ogg': 'audio/ogg',
    'weba': 'audio/webm',
    'aac': 'audio/aac',
    
    // Documents
    'pdf': 'application/pdf',
    'doc': 'application/msword',
    'docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'xls': 'application/vnd.ms-excel',
    'xlsx': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'ppt': 'application/vnd.ms-powerpoint',
    'pptx': 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
    
    // Archives
    'zip': 'application/zip',
    'rar': 'application/x-rar-compressed',
    '7z': 'application/x-7z-compressed',
    'tar': 'application/x-tar',
    'gz': 'application/gzip',
    
    // Text
    'txt': 'text/plain',
    'md': 'text/markdown',
    'csv': 'text/csv',
    'json': 'application/json',
    'xml': 'application/xml',
  };
  
  return extToMime[ext] || 'application/octet-stream';
}

/**
 * Validate file size
 */
export function validateFileSize(
  size: number,
  maxSizeInMB: number = 100
): boolean {
  const maxSizeInBytes = maxSizeInMB * 1024 * 1024;
  return size <= maxSizeInBytes;
}

/**
 * Validate file type
 */
export function validateFileType(
  mimeType: string,
  allowedTypes: string[]
): boolean {
  // Check exact match
  if (allowedTypes.includes(mimeType)) {
    return true;
  }
  
  // Check wildcard match (e.g., 'image/*')
  for (const allowed of allowedTypes) {
    if (allowed.endsWith('/*')) {
      const prefix = allowed.slice(0, -2);
      if (mimeType.startsWith(prefix)) {
        return true;
      }
    }
  }
  
  return false;
}

/**
 * Generate cache control header based on file type
 */
export function getCacheControl(mimeType: string): string {
  // Static assets (images, videos, etc.) - cache for 1 year
  if (mimeType.startsWith('image/') || mimeType.startsWith('video/')) {
    return 'public, max-age=31536000, immutable';
  }
  
  // Documents - cache for 1 day
  if (mimeType.startsWith('application/')) {
    return 'public, max-age=86400';
  }
  
  // Default - cache for 1 hour
  return 'public, max-age=3600';
}

/**
 * Format file size for display
 */
export function formatFileSize(bytes: number): string {
  const units = ['B', 'KB', 'MB', 'GB', 'TB'];
  let size = bytes;
  let unitIndex = 0;
  
  while (size >= 1024 && unitIndex < units.length - 1) {
    size /= 1024;
    unitIndex++;
  }
  
  return `${size.toFixed(2)} ${units[unitIndex]}`;
}

/**
 * Parse R2 public URL
 */
export function parseR2PublicUrl(url: string): {
  accountId?: string;
  bucket?: string;
  key?: string;
  customDomain?: string;
} {
  try {
    const urlObj = new URL(url);
    
    // Custom domain
    if (!urlObj.hostname.includes('r2.dev')) {
      return {
        customDomain: urlObj.origin,
        key: urlObj.pathname.slice(1),
      };
    }
    
    // R2.dev domain: https://pub-{accountId}.r2.dev/{key}
    const match = urlObj.hostname.match(/^pub-([a-f0-9]{32})\.r2\.dev$/);
    if (match) {
      return {
        accountId: match[1],
        key: urlObj.pathname.slice(1),
      };
    }
    
    return {};
  } catch {
    return {};
  }
}

/**
 * Build R2 public URL
 */
export function buildR2PublicUrl(
  key: string,
  options: {
    accountId?: string;
    customDomain?: string;
  }
): string {
  if (options.customDomain) {
    return `${options.customDomain}/${key}`;
  }
  
  if (options.accountId) {
    return `https://pub-${options.accountId}.r2.dev/${key}`;
  }
  
  throw new Error('Either customDomain or accountId must be provided');
}