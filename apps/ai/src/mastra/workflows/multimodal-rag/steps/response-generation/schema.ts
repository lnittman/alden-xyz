import { z } from 'zod';

export const responseGenerationInputSchema = z.object({
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

export const responseGenerationOutputSchema = z.object({
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
