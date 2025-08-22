/**
 * Mastra Agents Registry
 * Central export point for all AI agents
 */

// Core agents
import { contentAnalysisAgent } from './content-analysis';
import { searchEnhancerAgent } from './search-enhancer';
import { aldenChatAgent } from './alden-chat';

// New specialized agents
import { boardAgent, boardAgentActions } from './board-agent';
import { assetAgent, assetAgentActions } from './asset-agent';
import { collaborationAgent, collaborationAgentActions } from './collaboration-agent';

// Export all agents
export {
  contentAnalysisAgent,
  searchEnhancerAgent,
  aldenChatAgent,
  boardAgent,
  boardAgentActions,
  assetAgent,
  assetAgentActions,
  collaborationAgent,
  collaborationAgentActions,
};

// Agent registry
export const availableAgents = {
  contentAnalysis: 'content-analysis',
  searchEnhancer: 'search-enhancer',
  aldenChat: 'alden-chat',
  board: 'board-agent',
  asset: 'asset-agent',
  collaboration: 'collaboration-agent',
} as const;

// Agent categories
export const agentCategories = {
  core: ['content-analysis', 'search-enhancer', 'alden-chat'],
  boardManagement: ['board-agent'],
  assetOrganization: ['asset-agent'],
  collaboration: ['collaboration-agent'],
} as const;
