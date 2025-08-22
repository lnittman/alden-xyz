import { createWorkflow } from '@mastra/core';
import { multimodalRagInputSchema, multimodalRagOutputSchema } from './schema';
import { multimodalAnalysisStep } from './steps/multimodal-analysis';
import { queryEnhancementStep } from './steps/query-enhancement';
import { responseGenerationStep } from './steps/response-generation';
import { resultGenerationStep } from './steps/result-generation';

/**
 * Multimodal RAG Workflow
 * Simplified retrieval augmented generation for enhanced search
 *
 * Steps:
 * 1. queryEnhancementStep - Enhances the user query using AI
 * 2. multimodalAnalysisStep - Analyzes multimodal content from files
 * 3. resultGenerationStep - Generates search results
 * 4. responseGenerationStep - Creates final response based on results
 */
export const multimodalRagWorkflow = createWorkflow({
  id: 'multimodal-rag',
  description:
    'Query enhancement, multimodal retrieval, and contextual generation',
  inputSchema: multimodalRagInputSchema,
  outputSchema: multimodalRagOutputSchema,
  steps: [
    queryEnhancementStep,
    multimodalAnalysisStep,
    resultGenerationStep,
    responseGenerationStep,
  ],
})
  .then(queryEnhancementStep)
  .then(multimodalAnalysisStep)
  .then(resultGenerationStep)
  .then(responseGenerationStep)
  .commit();

export default multimodalRagWorkflow;
