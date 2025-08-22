import { z } from 'zod';

export const contentPersonalitySchema = z.object({
  description: z.string().describe('Engaging 1-2 sentence description'),
  emoji: z.string().describe('Perfect emoji to represent the content'),
  mood: z.string().describe('The overall mood or emotional tone'),
  themes: z.array(z.string()).describe('Key themes and concepts'),
  vibe: z.string().describe('Overall vibe in 2-3 words'),
  contentType: z.string().describe('Detected content type'),
});

export const searchEnhancementSchema = z.object({
  original: z.string(),
  enhanced: z.string(),
  entities: z.array(z.string()),
  context: z.array(z.string()),
  corrections: z.record(z.string()),
});

export type ContentPersonality = z.infer<typeof contentPersonalitySchema>;
export type SearchEnhancement = z.infer<typeof searchEnhancementSchema>;
