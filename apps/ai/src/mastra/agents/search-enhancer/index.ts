import { Agent } from '@mastra/core';
import { Memory } from '@mastra/memory';
import { createPostgresStorage } from '../../lib/storage/postgres';
import { loadPrompt } from '../../utils/loadPrompt';
import { createModelFromContext } from '../../utils/models';

const instructions = loadPrompt('agents/search-enhancer/instructions.xml', '', {
  toolsDir: 'tools',
  rootDir: process.cwd(),
});

// Create memory with PostgreSQL storage
const memory = new Memory({
  storage: createPostgresStorage(),
  options: {
    lastMessages: 10,
  },
});

export const searchEnhancerAgent = new Agent({
  name: 'search-enhancer',
  instructions,
  model: ({ runtimeContext }) => {
    return createModelFromContext({ runtimeContext });
  },
  memory,
});

export default searchEnhancerAgent;
