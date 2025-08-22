/**
 * Alden AI Service Entry Point
 * Powered by Mastra Framework
 */

import { createServer } from '@mastra/core';
import { mastra } from './mastra/index';

// Create and start the Mastra server
const server = createServer(mastra);

const PORT = process.env.PORT || 3999;

server.listen(PORT, () => {
  console.log(`=� Alden AI Service running on http://localhost:${PORT}`);
  console.log(`=� Chat endpoint: http://localhost:${PORT}/api/agents/chat/stream`);
});