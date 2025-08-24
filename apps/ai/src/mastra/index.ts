/**
 * Mastra Configuration for Alden AI Service
 */

import { Mastra } from '@mastra/core';
import { PinoLogger } from '@mastra/loggers';

// Import agent creators
import { createAldenChatAgent } from './agents/chat/index';

// Import Convex storage adapter
import { ConvexMastraStorage } from './storage/convex-adapter';

// Configure structured logging
const logger = new PinoLogger({
  name: 'alden-ai',
  level: 'debug',
});

// Initialize Convex storage
const storage = new ConvexMastraStorage(
  process.env.CONVEX_URL || 'https://your-app.convex.cloud'
);

/**
 * Create Mastra instance with environment support
 */
export const mastra = new Mastra({
  // Register agents with env
  agents: {
    chat: createAldenChatAgent(process.env),
  },

  // Register workflows (to be added as needed)
  workflows: {
    // Workflows will be added here
  },

  // Logging configuration
  logger,

  // AI SDK compatibility - v5
  aiSdkCompat: 'v5',
  
  // Custom storage adapter for Convex
  storage,
});