import { z } from 'zod';

export const multimodalRagInputSchema = z.object({
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

export const multimodalRagOutputSchema = z.object({
  enhancedQuery: z.string(),
  results: z.array(
    z.object({
      id: z.string(),
      name: z.string(),
      description: z.string(),
      relevanceScore: z.number(),
      metadata: z.record(z.any()).optional(),
    })
  ),
  generatedResponse: z.string(),
  processingTime: z.number(),
});
