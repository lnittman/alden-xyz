// Squish-specific AI chat types for AI SDK v5
import type { UIDataTypes, UIMessage, UITools } from 'ai';

// Define metadata for Squish messages
export interface SquishMessageMetadata {
  // Model information
  model?: string;
  totalTokens?: number;

  // Squish-specific context
  boardId?: string;
  assetIds?: string[];
  userId?: string;

  // Timing information
  duration?: number;
  timestamp?: string;
}

// Define custom data parts for Squish
export interface SquishDataParts extends UIDataTypes {
  // Board-related data parts
  'data-board-update': {
    boardId: string;
    action: 'created' | 'updated' | 'deleted';
    board?: {
      id: string;
      name: string;
      emoji?: string;
    };
  };

  // Asset-related data parts
  'data-asset-update': {
    assetId: string;
    boardId?: string;
    action: 'added' | 'removed' | 'updated' | 'analyzed';
    asset?: {
      id: string;
      name: string;
      type: string;
      url?: string;
    };
  };

  // Status updates
  'data-status': {
    status: 'searching' | 'analyzing' | 'organizing' | 'completed' | 'error';
    message?: string;
    progress?: number;
  };

  // Search results
  'data-search-results': {
    query: string;
    results: Array<{
      id: string;
      type: 'board' | 'asset' | 'user';
      name: string;
      relevance: number;
    }>;
    totalCount: number;
  };
}

// Define Squish tools
export interface SquishTools extends UITools {
  // Board management tools
  'tool-searchBoards': {
    input: {
      query: string;
      limit?: number;
      includeCollaborated?: boolean;
    };
    output: {
      boards: Array<{
        id: string;
        name: string;
        emoji?: string;
        assetCount: number;
        createdAt: string;
      }>;
    };
  };

  'tool-createBoard': {
    input: {
      name: string;
      emoji?: string;
      description?: string;
    };
    output: {
      board: {
        id: string;
        name: string;
        emoji?: string;
        url: string;
      };
    };
  };

  // Asset management tools
  'tool-searchAssets': {
    input: {
      query?: string;
      boardId?: string;
      type?: 'image' | 'video' | 'audio' | 'text';
      limit?: number;
    };
    output: {
      assets: Array<{
        id: string;
        name: string;
        type: string;
        boardId: string;
        boardName: string;
        url: string;
      }>;
    };
  };

  'tool-analyzeAssets': {
    input: {
      assetIds: string[];
      analysisType: 'themes' | 'colors' | 'content' | 'similarity';
    };
    output: {
      analysis: {
        type: string;
        results: Record<string, any>;
        suggestions: string[];
      };
    };
  };

  'tool-organizeAssets': {
    input: {
      assetIds: string[];
      strategy: 'by-theme' | 'by-color' | 'by-date' | 'by-type';
      targetBoardId?: string;
    };
    output: {
      organized: Array<{
        groupName: string;
        assetIds: string[];
        reason: string;
      }>;
      boardsCreated?: string[];
    };
  };
}

// Custom UIMessage type for Squish
export type SquishUIMessage = UIMessage<
  SquishMessageMetadata,
  SquishDataParts,
  SquishTools
>;

// Helper type for tool names
export type SquishToolName = keyof SquishTools;

// Helper type for data part types
export type SquishDataPartType = keyof SquishDataParts;

// Type guard for Squish messages
export function isSquishUIMessage(message: any): message is SquishUIMessage {
  return message && typeof message === 'object' && 'role' in message;
}

// Type guard for specific tool parts
export function isSquishToolPart<T extends SquishToolName>(
  part: any,
  toolName: T
): part is Extract<SquishUIMessage['parts'][number], { type: T }> {
  return part && part.type === toolName;
}
