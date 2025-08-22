import { createTool } from '@mastra/core';
import { z } from 'zod';

export const generateCommentsTool = createTool({
  id: 'generate-board-comments',
  description:
    'Generate thoughtful comments for board assets to spark collaboration',
  inputSchema: z.object({
    boardId: z.string().describe('ID of the board'),
    assetIds: z.array(z.string()).describe('Array of asset IDs to comment on'),
    commentStyle: z
      .enum(['encouraging', 'constructive', 'questioning', 'inspirational'])
      .default('encouraging'),
    userId: z.string().describe('User ID requesting comments'),
  }),
  outputSchema: z.object({
    comments: z.array(
      z.object({
        assetId: z.string(),
        comment: z.string(),
        type: z.string(),
      })
    ),
  }),
  execute: async ({ context }) => {
    const { boardId, assetIds, commentStyle, userId } = context;
    try {
      const templates = {
        encouraging: [
          'Love the vibe of this asset! It really brings the board together.',
          'This piece speaks volumes about your creative vision.',
          'The aesthetic here is absolutely inspiring!',
          "You've captured something truly special here.",
        ],
        constructive: [
          'Have you considered how this might look in a different arrangement?',
          'This could be enhanced by playing with the surrounding elements.',
          'The composition is strong - maybe try adjusting the scale?',
          'Interesting choice! How would this work with more negative space?',
        ],
        questioning: [
          'What inspired you to include this particular piece?',
          'How does this asset connect to your overall theme?',
          'What story do you think this element tells?',
          'How does this make you feel when you look at it?',
        ],
        inspirational: [
          'This opens up so many creative possibilities!',
          'I can imagine this evolving into an entire series.',
          "There's a whole world of inspiration hidden in this asset.",
          'This reminds me that creativity knows no bounds.',
        ],
      };

      const comments = assetIds.map((assetId) => ({
        assetId,
        comment:
          templates[commentStyle][
            Math.floor(Math.random() * templates[commentStyle].length)
          ],
        type: commentStyle,
      }));

      return { comments };
    } catch (error) {
      throw new Error(`Failed to generate comments: ${error}`);
    }
  },
});

export const suggestCollaborationsTool = createTool({
  id: 'suggest-collaborations',
  description:
    'Suggest collaboration opportunities based on board content and user interests',
  inputSchema: z.object({
    boardId: z.string().describe('ID of the board to analyze'),
    userId: z.string().describe('User ID requesting suggestions'),
    maxSuggestions: z
      .number()
      .min(1)
      .max(10)
      .default(5)
      .describe('Maximum number of suggestions'),
  }),
  outputSchema: z.object({
    suggestions: z.array(
      z.object({
        type: z.string(),
        title: z.string(),
        description: z.string(),
        potentialCollaborators: z.array(z.string()).optional(),
      })
    ),
  }),
  execute: async ({ context }) => {
    const { boardId, userId, maxSuggestions } = context;
    try {
      const suggestions = [
        {
          type: 'theme_extension',
          title: 'Expand the Theme',
          description:
            'Collaborate with artists who specialize in complementary styles',
          potentialCollaborators: [
            'digital-artists',
            'photographers',
            'illustrators',
          ],
        },
        {
          type: 'series_creation',
          title: 'Create a Series',
          description:
            'Work with others to turn this concept into a multi-part collection',
          potentialCollaborators: [
            'storytellers',
            'creative-directors',
            'designers',
          ],
        },
        {
          type: 'community_challenge',
          title: 'Community Challenge',
          description:
            'Turn this theme into a weekly challenge for the community',
          potentialCollaborators: ['community-managers', 'content-creators'],
        },
        {
          type: 'expert_feedback',
          title: 'Get Expert Feedback',
          description:
            'Invite professionals to provide insights on this collection',
          potentialCollaborators: ['art-directors', 'curators', 'critics'],
        },
        {
          type: 'cross_platform',
          title: 'Cross-Platform Project',
          description: 'Adapt this concept for different mediums or platforms',
          potentialCollaborators: [
            'multimedia-artists',
            'developers',
            'animators',
          ],
        },
      ];

      return {
        suggestions: suggestions.slice(0, maxSuggestions),
      };
    } catch (error) {
      throw new Error(`Failed to suggest collaborations: ${error}`);
    }
  },
});
