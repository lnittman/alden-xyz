'use client';

import { type Message, useChat } from '@ai-sdk/react';
import { type UseChatOptions } from '@ai-sdk/react';

export interface UseAldenChatOptions extends Omit<UseChatOptions, 'api'> {
  chatId?: string;
}

/**
 * Custom chat hook for Alden that integrates with the Mastra AI service
 * Uses the AI SDK v5 useChat hook with Mastra endpoint
 */
export function useAldenChat(options?: UseAldenChatOptions) {
  const { chatId, ...restOptions } = options || {};

  // Use the useChat hook from AI SDK v5 with Mastra endpoint
  const chat = useChat({
    ...restOptions,
    // Point to the Mastra AI service chat endpoint
    api: process.env.NEXT_PUBLIC_AI_URL
      ? `${process.env.NEXT_PUBLIC_AI_URL}/api/agents/chat/stream`
      : 'http://localhost:3999/api/agents/chat/stream',
    // Pass chatId in the body if provided
    body: {
      ...restOptions.body,
      ...(chatId ? { chatId } : {}),
    },
    // Add custom headers for Mastra auth if needed
    headers: {
      ...restOptions.headers,
      ...(process.env.MASTRA_KEY
        ? { 'x-mastra-key': process.env.MASTRA_KEY }
        : {}),
    },
  });

  return {
    ...chat,
    // Add any custom functionality here
  };
}