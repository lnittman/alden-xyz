import { createStep } from '@mastra/core';
import {
  multimodalAnalysisInputSchema,
  multimodalAnalysisOutputSchema,
} from './schema';

export const multimodalAnalysisStep = createStep({
  id: 'multimodal-analysis',
  description: 'Analyzes multimodal content from files',
  inputSchema: multimodalAnalysisInputSchema,
  outputSchema: multimodalAnalysisOutputSchema,
  execute: async ({ inputData, mastra, runtimeContext }) => {
    const { query, enhancedQuery, files, limit, startTime } = inputData;

    const fileAnalyses = [];

    if (files && files.length > 0) {
      const contentAnalysisAgent = mastra?.getAgent('contentAnalysis');

      if (!contentAnalysisAgent) {
        return {
          ...inputData,
          fileAnalyses: [],
        };
      }

      for (const file of files.slice(0, 3)) {
        // Limit to 3 files
        try {
          const messages = [
            {
              role: 'user' as const,
              content: `Analyze this ${file.type} content: ${file.url}`,
            },
          ];

          const analysis = await contentAnalysisAgent.generate(messages, {
            runtimeContext,
          });

          fileAnalyses.push({
            url: file.url,
            type: file.type,
            analysis: analysis.text,
          });
        } catch (_error) {}
      }
    }

    return {
      query,
      enhancedQuery,
      files,
      fileAnalyses,
      limit,
      startTime,
    };
  },
});
