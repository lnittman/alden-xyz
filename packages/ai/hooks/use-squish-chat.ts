'use client';

import { useChat as useAIChat } from '@ai-sdk/react';
import * as React from 'react';
import type { SquishUIMessage } from '../types/squish-chat';

interface SquishChatOptions {
  api?: string;
  userId?: string;
  boardId?: string;
  assetIds?: string[];
  initialMessages?: SquishUIMessage[];
  onFinish?: (message: SquishUIMessage) => void;
  onError?: (error: Error) => void;
}

export function useSquishChat(options: SquishChatOptions = {}) {
  const {
    api = '/api/ai/chat',
    userId,
    boardId,
    assetIds,
    initialMessages,
    onFinish,
    onError,
  } = options;

  const [isOpen, setIsOpen] = React.useState(false);

  // Use the AI SDK v5 useChat hook
  const chatHelpers = useAIChat({
    api,
    initialMessages: initialMessages as any,
    onFinish: onFinish as any,
    onError,
    body: {
      data: {
        userId,
        boardId,
        assetIds,
      },
    },
  } as any);

  const toggleChat = React.useCallback(() => {
    setIsOpen((prev) => !prev);
  }, []);

  const setOpen = React.useCallback((open: boolean) => {
    setIsOpen(open);
  }, []);

  const clearMessages = React.useCallback(() => {
    chatHelpers.setMessages([]);
  }, [chatHelpers]);

  // Return all AI SDK properties plus our custom ones
  return {
    // Spread all the chat helpers from AI SDK
    ...(chatHelpers as any),

    // Add Squish-specific functionality
    isOpen,
    toggleChat,
    setOpen,
    clearMessages,
    // Context data
    data: {
      userId,
      boardId,
      assetIds,
    },
  };
}
