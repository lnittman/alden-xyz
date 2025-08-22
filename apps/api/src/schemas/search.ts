import { z } from 'zod';

// Search type enum
export const searchTypeEnum = z.enum(['all', 'assets', 'boards', 'users']);

// Search query schema
export const searchQuerySchema = z.object({
  query: z.string().min(1).max(200),
  type: searchTypeEnum.default('all'),
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(50).default(20),
  filters: z
    .object({
      assetType: z.enum(['IMAGE', 'VIDEO', 'AUDIO', 'GIF']).optional(),
      dateFrom: z.string().datetime().optional(),
      dateTo: z.string().datetime().optional(),
      userId: z.string().uuid().optional(),
      boardId: z.string().uuid().optional(),
    })
    .optional(),
});

// Search history schema
export const searchHistorySchema = z.object({
  limit: z.coerce.number().int().positive().max(50).default(10),
});

// Save search schema
export const saveSearchSchema = z.object({
  query: z.string().min(1).max(200),
  filters: z.record(z.any()).optional(),
});

// Search suggestions schema
export const searchSuggestionsSchema = z.object({
  query: z.string().min(1).max(100),
  limit: z.coerce.number().int().positive().max(10).default(5),
});

// Types
export type SearchType = z.infer<typeof searchTypeEnum>;
export type SearchQueryInput = z.infer<typeof searchQuerySchema>;
export type SearchHistoryParams = z.infer<typeof searchHistorySchema>;
export type SaveSearchInput = z.infer<typeof saveSearchSchema>;
export type SearchSuggestionsInput = z.infer<typeof searchSuggestionsSchema>;
