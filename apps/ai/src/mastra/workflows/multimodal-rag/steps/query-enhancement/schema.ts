import { z } from 'zod';

export const queryEnhancementInputSchema = z.object({
  query: z.string().describe('User search query'),
  files: z
    .array(
      z.object({
        url: z.string(),
        type: z.enum(['image', 'video', 'audio']),
        mimeType: z.string().optional(),
      })
    )
    .optional()
    .describe('Multimodal search files'),
  limit: z.number().optional().default(10),
});

export const queryEnhancementOutputSchema = z.object({
  query: z.string(),
  enhancedQuery: z.string(),
  files: z
    .array(
      z.object({
        url: z.string(),
        type: z.enum(['image', 'video', 'audio']),
        mimeType: z.string().optional(),
      })
    )
    .optional(),
  limit: z.number(),
  startTime: z.number(),
});
