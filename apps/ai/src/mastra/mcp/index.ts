import { MCPServer } from '@mastra/mcp';
import { mastra } from '../mastra';
import { analyzeAssetTool, generateTagsTool } from './tools/asset';
import { createBoardTool, suggestBoardLayoutTool } from './tools/board';
import {
  generateCommentsTool,
  suggestCollaborationsTool,
} from './tools/collaboration';

// Create MCP Server for Squish AI
const server = new MCPServer({
  name: 'squish-ai-mcp',
  version: '1.0.0',
  description: 'Squish AI MCP server providing creative assistance tools',

  // Expose existing agents as tools
  agents: {
    searchEnhancer: mastra.getAgent('search-enhancer'),
    contentAnalysis: mastra.getAgent('content-analysis'),
    squishChat: mastra.getAgent('squish-chat'),
  },

  // Expose workflows
  workflows: {
    multimodalRag: mastra.getWorkflow('multimodal-rag'),
    contentAnalysis: mastra.getWorkflow('content-analysis'),
  },

  // Squish-specific tools
  tools: {
    // Board management tools
    createBoard: createBoardTool,
    suggestBoardLayout: suggestBoardLayoutTool,

    // Asset analysis tools
    analyzeAssetPersonalities: analyzeAssetTool,
    generateCollectionTags: generateTagsTool,

    // Collaboration tools
    generateBoardComments: generateCommentsTool,
    suggestCollaborations: suggestCollaborationsTool,
  },

  // Server configuration
  server: {
    capabilities: {
      tools: true,
      agents: true,
      workflows: true,
      resources: true,
      prompts: true,
    },
  },

  // Error handling
  onError: (_error) => {},
});

// Graceful shutdown
process.on('SIGTERM', () => {
  server.close();
});

process.on('SIGINT', () => {
  server.close();
});

// Start server
async function startServer() {
  try {
    await server.startStdio();
  } catch (_error) {
    process.exit(1);
  }
}

// Export for direct import
export { server };

// Start if running directly
if (import.meta.url === `file://${process.argv[1]}`) {
  startServer();
}
