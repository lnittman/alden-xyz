import { z } from 'zod';

export const resultGenerationInputSchema = z.object({
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
  fileAnalyses: z
    .array(
      z.object({
        url: z.string(),
        type: z.string(),
        analysis: z.string().optional(),
      })
    )
    .optional(),
  limit: z.number(),
  startTime: z.number(),
});

export const resultGenerationOutputSchema = z.object({
  query: z.string(),
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
  startTime: z.number(),
});
