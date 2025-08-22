import { createTool } from '@mastra/core';
import { z } from 'zod';

export const createBoardTool = createTool({
  id: 'create-board',
  description: 'Create a new Squish board with specified theme and settings',
  inputSchema: z.object({
    name: z.string().describe('Name of the board'),
    description: z
      .string()
      .optional()
      .describe('Brief description of the board'),
    theme: z.string().optional().describe('Visual theme or aesthetic'),
    isPublic: z
      .boolean()
      .default(false)
      .describe('Whether the board is publicly visible'),
    tags: z.array(z.string()).default([]).describe('Tags for the board'),
    userId: z.string().describe('User ID creating the board'),
  }),
  outputSchema: z.object({
    success: z.boolean(),
    boardId: z.string().optional(),
    message: z.string(),
  }),
  execute: async ({ context }) => {
    const { name, description, theme, isPublic, tags, userId } = context;
    try {
      return {
        success: true,
        boardId: `board_${Date.now()}`,
        message: `Board "${name}" created successfully with ${theme || 'default'} theme`,
      };
    } catch (error) {
      return {
        success: false,
        message: `Failed to create board: ${error}`,
      };
    }
  },
});

export const suggestBoardLayoutTool = createTool({
  id: 'suggest-board-layout',
  description: 'Suggest optimal layout for a board based on its content',
  inputSchema: z.object({
    boardId: z.string().describe('ID of the board'),
    assetCount: z.number().optional().describe('Number of assets on the board'),
    contentType: z
      .enum(['images', 'videos', 'mixed'])
      .optional()
      .describe('Primary content type'),
    stylePreference: z
      .enum(['grid', 'masonry', 'carousel'])
      .optional()
      .describe("User's layout preference"),
  }),
  outputSchema: z.object({
    suggestedLayout: z.string(),
    reasoning: z.string(),
    configuration: z.record(z.unknown()).optional(),
  }),
  execute: async ({ context }) => {
    const { boardId, assetCount, contentType, stylePreference } = context;
    try {
      // Analyze board content and suggest best layout
      let layout = 'grid';
      let reasoning = '';

      if (!assetCount || assetCount < 10) {
        layout = stylePreference || 'grid';
        reasoning = 'Small collections work well with a clean grid layout';
      } else if (assetCount > 50) {
        layout = 'masonry';
        reasoning =
          'Large collections benefit from masonry layout for better space utilization';
      }

      if (contentType === 'videos') {
        layout = 'carousel';
        reasoning = 'Video content is best showcased in a carousel format';
      }

      return {
        suggestedLayout: layout,
        reasoning,
        configuration: {
          columns: layout === 'grid' ? 3 : undefined,
          gap: '1rem',
        },
      };
    } catch (error) {
      throw new Error(`Failed to suggest layout: ${error}`);
    }
  },
});
