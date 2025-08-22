import { createStep } from '@mastra/core';
import {
  responseGenerationInputSchema,
  responseGenerationOutputSchema,
} from './schema';

export const responseGenerationStep = createStep({
  id: 'response-generation',
  description: 'Generates final response based on search results',
  inputSchema: responseGenerationInputSchema,
  outputSchema: responseGenerationOutputSchema,
  execute: async ({ inputData, mastra, runtimeContext }) => {
    const { enhancedQuery, results, startTime } = inputData;

    try {
      const contentAnalysisAgent = mastra?.getAgent('contentAnalysis');

      if (!contentAnalysisAgent) {
        return {
          enhancedQuery,
          results,
          generatedResponse: `Found ${results.length} results for your search.`,
          processingTime: Date.now() - startTime,
        };
      }

      // Prepare context for generation
      const contextText = results
        .map(
          (result, index) =>
            `${index + 1}. ${result.name}: ${result.description}`
        )
        .join('\n');

      const messages = [
        {
          role: 'system' as const,
          content:
            'You are a helpful assistant that provides informative responses based on search results.',
        },
        {
          role: 'user' as const,
          content: `Based on these search results for "${enhancedQuery}":\n\n${contextText}\n\nProvide a helpful summary.`,
        },
      ];

      const response = await contentAnalysisAgent.generate(messages, {
        runtimeContext,
      });

      return {
        enhancedQuery,
        results,
        generatedResponse: response.text || 'Here are your search results.',
        processingTime: Date.now() - startTime,
      };
    } catch (_error) {
      return {
        enhancedQuery,
        results,
        generatedResponse: `Found ${results.length} results for your search.`,
        processingTime: Date.now() - startTime,
      };
    }
  },
});
