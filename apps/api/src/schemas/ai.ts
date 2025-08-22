import { z } from 'zod';

// AI action types
export const aiActionEnum = z.enum([
  'generate_caption',
  'suggest_tags',
  'enhance_search',
  'generate_board_name',
  'analyze_content',
]);

// AI caption generation schema
export const generateCaptionSchema = z.object({
  assetId: z.string().uuid(),
  style: z
    .enum(['descriptive', 'creative', 'technical', 'casual'])
    .default('descriptive'),
  maxLength: z.number().int().positive().max(500).default(200),
});

// AI tag suggestion schema
export const suggestTagsSchema = z.object({
  assetId: z.string().uuid(),
  maxTags: z.number().int().positive().max(20).default(10),
  includeCategories: z.boolean().default(true),
});

// AI search enhancement schema
export const enhanceSearchSchema = z.object({
  query: z.string().min(1).max(200),
  context: z
    .object({
      previousQueries: z.array(z.string()).optional(),
      userInterests: z.array(z.string()).optional(),
    })
    .optional(),
});

// AI board name generation schema
export const generateBoardNameSchema = z.object({
  assetIds: z.array(z.string().uuid()).min(1).max(20),
  style: z.enum(['descriptive', 'creative', 'minimal']).default('creative'),
  maxSuggestions: z.number().int().positive().max(10).default(5),
});

// AI content analysis schema
export const analyzeContentSchema = z.object({
  assetId: z.string().uuid(),
  analysisTypes: z
    .array(z.enum(['objects', 'scenes', 'emotions', 'colors', 'text', 'faces']))
    .min(1),
});

// Types
export type AIAction = z.infer<typeof aiActionEnum>;
export type GenerateCaptionInput = z.infer<typeof generateCaptionSchema>;
export type SuggestTagsInput = z.infer<typeof suggestTagsSchema>;
export type EnhanceSearchInput = z.infer<typeof enhanceSearchSchema>;
export type GenerateBoardNameInput = z.infer<typeof generateBoardNameSchema>;
export type AnalyzeContentInput = z.infer<typeof analyzeContentSchema>;
