import { Agent } from '@mastra/core';
import { loadPrompt } from '../../utils/loadPrompt';
import { createModelFromContext } from '../../utils/models';
import { createRuntimeContext } from '../../utils/runtime-context-builder';

export const aldenChatAgent = new Agent({
  name: 'Alden Chat',
  instructions: loadPrompt(
    'agents/alden-chat/instructions.xml',
    'You are Alden Chat, a creative AI companion for visual curation and inspiration.'
  ),
  model: createModelFromContext({
    runtimeContext: createRuntimeContext({
      'chat-model': 'gemini-2.0-flash-exp',
    }),
  }),
  tools: {},
});
