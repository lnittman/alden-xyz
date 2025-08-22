import { z } from 'zod';

// Asset type enum
export const assetTypeEnum = z.enum(['IMAGE', 'VIDEO', 'AUDIO', 'GIF']);

// Asset creation schema
export const createAssetSchema = z.object({
  url: z.string().url(),
  type: assetTypeEnum,
  title: z.string().optional(),
  description: z.string().optional(),
  metadata: z.record(z.any()).optional(),
  boardId: z.string().uuid().optional(),
});

// Asset update schema
export const updateAssetSchema = z.object({
  title: z.string().optional(),
  description: z.string().optional(),
  metadata: z.record(z.any()).optional(),
});

// Asset query params schema
export const assetQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
  type: assetTypeEnum.optional(),
  boardId: z.string().uuid().optional(),
  sortBy: z.enum(['createdAt', 'updatedAt', 'title']).default('createdAt'),
  sortOrder: z.enum(['asc', 'desc']).default('desc'),
  search: z.string().optional(),
});

// Asset ID params schema
export const assetIdSchema = z.object({
  assetId: z.string().uuid(),
});

// Bulk asset operations schema
export const bulkAssetOperationSchema = z.object({
  assetIds: z.array(z.string().uuid()).min(1).max(100),
});

// Asset upload schema
export const assetUploadSchema = z.object({
  files: z.array(z.any()).min(1).max(10), // Will be validated at runtime
  boardId: z.string().uuid().optional(),
});

// Types
export type AssetType = z.infer<typeof assetTypeEnum>;
export type CreateAssetInput = z.infer<typeof createAssetSchema>;
export type UpdateAssetInput = z.infer<typeof updateAssetSchema>;
export type AssetQueryParams = z.infer<typeof assetQuerySchema>;
export type AssetIdParams = z.infer<typeof assetIdSchema>;
export type BulkAssetOperation = z.infer<typeof bulkAssetOperationSchema>;
export type AssetUploadInput = z.infer<typeof assetUploadSchema>;
