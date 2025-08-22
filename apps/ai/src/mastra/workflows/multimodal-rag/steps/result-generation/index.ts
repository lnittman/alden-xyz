import { createStep } from '@mastra/core';
import {
  resultGenerationInputSchema,
  resultGenerationOutputSchema,
} from './schema';

export const resultGenerationStep = createStep({
  id: 'result-generation',
  description: 'Generates search results based on query and file analyses',
  inputSchema: resultGenerationInputSchema,
  outputSchema: resultGenerationOutputSchema,
  execute: async ({ inputData }) => {
    const { query, enhancedQuery, fileAnalyses, startTime } = inputData;

    // In a real implementation, this would do vector search
    // For now, generate mock results based on the query
    const mockResults: Array<{
      id: string;
      name: string;
      description: string;
      relevanceScore: number;
      metadata?: Record<string, any>;
    }> = [
      {
        id: `result-${Date.now()}-1`,
        name: `Result for: ${enhancedQuery}`,
        description: 'This is a relevant result based on your search query',
        relevanceScore: 0.95,
        metadata: { source: 'text-search' },
      },
    ];

    // Add results from file analyses
    fileAnalyses?.forEach((analysis, index) => {
      mockResults.push({
        id: `result-${Date.now()}-file-${index}`,
        name: `${analysis.type} Analysis`,
        description: analysis.analysis || 'Content analyzed successfully',
        relevanceScore: 0.9 - index * 0.05,
        metadata: {
          source: 'file-analysis',
          type: analysis.type,
          url: analysis.url,
        },
      });
    });

    return {
      query,
      enhancedQuery,
      results: mockResults.slice(0, inputData.limit),
      startTime,
    };
  },
});
