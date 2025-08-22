import { createStep } from '@mastra/core';
import {
  queryEnhancementInputSchema,
  queryEnhancementOutputSchema,
} from './schema';

export const queryEnhancementStep = createStep({
  id: 'query-enhancement',
  description: 'Enhances search query using AI agent',
  inputSchema: queryEnhancementInputSchema,
  outputSchema: queryEnhancementOutputSchema,
  execute: async ({ inputData, mastra, runtimeContext }) => {
    const startTime = Date.now();
    const { query, files, limit } = inputData;

    try {
      const searchEnhancerAgent = mastra?.getAgent('searchEnhancer');

      if (!searchEnhancerAgent) {
        return {
          query,
          enhancedQuery: query,
          files,
          limit,
          startTime,
        };
      }

      const messages = [
        {
          role: 'user' as const,
          content: `Enhance this search query for better results: "${query}"`,
        },
      ];

      const enhanced = await searchEnhancerAgent.generate(messages, {
        runtimeContext,
      });

      const enhancedQuery = enhanced.text || query;

      return {
        query,
        enhancedQuery,
        files,
        limit,
        startTime,
      };
    } catch (_error) {
      return {
        query,
        enhancedQuery: query,
        files,
        limit,
        startTime,
      };
    }
  },
});
