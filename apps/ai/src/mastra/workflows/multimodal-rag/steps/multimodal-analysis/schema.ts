import { z } from 'zod';

export const multimodalAnalysisInputSchema = z.object({
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

export const multimodalAnalysisOutputSchema = z.object({
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
