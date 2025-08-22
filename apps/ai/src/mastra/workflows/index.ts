import { analyzeContentWorkflow } from './content-analysis';
import { multimodalRagWorkflow } from './multimodal-rag';

// Export workflows directly and via registry
export { analyzeContentWorkflow } from './content-analysis';
export { multimodalRagWorkflow } from './multimodal-rag';

// Registry object for Mastra
export const availableWorkflows = {
  analyzeContent: analyzeContentWorkflow,
  multimodalRag: multimodalRagWorkflow,
};
