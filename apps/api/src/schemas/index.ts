// Export all schemas
export * from './board';
export * from './asset';
export * from './user';
export * from './search';
export * from './ai';

// Common schemas
import { z } from 'zod';

// Pagination schema
export const paginationSchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
});

// Sort schema
export const sortSchema = z.object({
  sortBy: z.string().optional(),
  sortOrder: z.enum(['asc', 'desc']).default('desc'),
});

// Common ID schema
export const idSchema = z.object({
  id: z.string().uuid(),
});

// Error response schema
export const errorResponseSchema = z.object({
  error: z.string(),
  message: z.string(),
  details: z.any().optional(),
});

// Success response schema
export const successResponseSchema = z.object({
  success: z.boolean(),
  message: z.string().optional(),
  data: z.any().optional(),
});

// Types
export type PaginationParams = z.infer<typeof paginationSchema>;
export type SortParams = z.infer<typeof sortSchema>;
export type IdParams = z.infer<typeof idSchema>;
export type ErrorResponse = z.infer<typeof errorResponseSchema>;
export type SuccessResponse = z.infer<typeof successResponseSchema>;
