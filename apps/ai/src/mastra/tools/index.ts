// Export all Mastra tools for Alden chat platform

// Embeddings and Vector Search
export * from './embeddings';

// Message Analysis
export * from './message-analysis';

// Suggestions and References
export * from './suggestions';

// Tool Registry
export const availableTools = {
  // Embeddings
  generateEmbedding: 'generate-embedding',
  batchEmbeddings: 'batch-embeddings',
  
  // Message Analysis
  analyzeMessage: 'analyze-message',
  findReferences: 'find-references',
  generateTags: 'generate-tags',
  
  // Suggestions
  quickSuggestions: 'quick-suggestions',
  getReferenceSuggestions: 'get-reference-suggestions',
};

// Tool Categories for organization
export const toolCategories = {
  embeddings: [
    'generate-embedding',
    'batch-embeddings',
  ],
  messageAnalysis: [
    'analyze-message',
    'find-references',
    'generate-tags',
  ],
  suggestions: [
    'quick-suggestions',
    'get-reference-suggestions',
  ],
};

// Tool descriptions for documentation
export const toolDescriptions = {
  'generate-embedding': 'Generate vector embeddings for text content using OpenAI models',
  'batch-embeddings': 'Generate embeddings for multiple texts efficiently in batch',
  
  'analyze-message': 'Analyze message content for entities, sentiment, topics, and tags',
  'find-references': 'Find references to users, threads, or topics in a message',
  'generate-tags': 'Generate relevant tags for messages or content',
  
  'quick-suggestions': 'Generate contextual quick reply suggestions for conversations',
  'get-reference-suggestions': 'Get intelligent suggestions for users, files, or threads to reference',
};