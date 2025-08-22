// Main AI package exports

// Mastra client exports
export { mastra, createMastraClient } from './mastra';

// Custom hooks
export { useAldenChat } from './hooks/use-alden-chat';
export type { UseAldenChatOptions } from './hooks/use-alden-chat';

// Re-export AI SDK v5 React hooks from react.ts
export * from './react';