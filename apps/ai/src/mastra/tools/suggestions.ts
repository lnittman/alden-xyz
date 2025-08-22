import { createTool } from '@mastra/core/tools';
import { z } from 'zod';
import { generateText } from 'ai';
import { google } from '@ai-sdk/google';

export const quickSuggestions = createTool({
  id: 'quick-suggestions',
  description: 'Generate quick reply suggestions for a conversation',
  inputSchema: z.object({
    currentMessage: z.string().optional(),
    conversationContext: z.array(z.object({
      role: z.enum(['user', 'assistant']),
      content: z.string(),
    })).optional(),
    maxSuggestions: z.number().default(3),
  }),
  outputSchema: z.object({
    suggestions: z.array(z.object({
      text: z.string(),
      type: z.enum(['reply', 'question', 'action']),
    })),
  }),
  execute: async ({ context }) => {
    const { currentMessage, conversationContext, maxSuggestions } = context;
    
    const prompt = `Generate ${maxSuggestions} quick reply suggestions for this conversation.

${conversationContext ? `Recent conversation:
${conversationContext.map(m => `${m.role}: ${m.content}`).join('\n')}` : ''}

${currentMessage ? `Current message being typed: "${currentMessage}"` : ''}

Generate diverse suggestions that could be:
- Natural replies
- Follow-up questions
- Action items

Return a JSON object with a "suggestions" array containing objects with "text" and "type" ("reply", "question", or "action").`;

    const result = await generateText({
      model: google('gemini-2.0-flash-exp'),
      prompt,
      temperature: 0.7,
    });

    try {
      const parsed = JSON.parse(result.text);
      return { suggestions: parsed.suggestions.slice(0, maxSuggestions) };
    } catch {
      return {
        suggestions: [
          { text: "That's interesting, tell me more", type: 'question' },
          { text: "I understand, thanks for sharing", type: 'reply' },
          { text: "Let me look into that", type: 'action' },
        ],
      };
    }
  },
});

export const getReferenceSuggestions = createTool({
  id: 'get-reference-suggestions',
  description: 'Get contextual reference suggestions based on conversation',
  inputSchema: z.object({
    query: z.string(),
    chatId: z.string(),
    limit: z.number().default(5),
    referenceType: z.enum(['users', 'files', 'threads', 'all']).default('all'),
  }),
  outputSchema: z.object({
    references: z.array(z.object({
      id: z.string(),
      type: z.enum(['user', 'file', 'thread', 'topic']),
      title: z.string(),
      subtitle: z.string().optional(),
      relevanceScore: z.number(),
    })),
  }),
  execute: async ({ context }) => {
    const { query, limit, referenceType } = context;
    
    // In production, this would search your database using embeddings
    // For now, generate mock suggestions based on the query
    const prompt = `Given the query "${query}", suggest ${limit} relevant references that could be mentioned.
Reference type filter: ${referenceType}

Generate a JSON object with a "references" array containing:
- id: unique identifier
- type: "user", "file", "thread", or "topic"
- title: display name
- subtitle: additional context (optional)
- relevanceScore: 0-1 score

Make the suggestions contextually relevant to the query.`;

    const result = await generateText({
      model: google('gemini-2.0-flash-exp'),
      prompt,
      temperature: 0.5,
    });

    try {
      const parsed = JSON.parse(result.text);
      return { 
        references: parsed.references
          .filter((r: any) => referenceType === 'all' || r.type === referenceType)
          .slice(0, limit) 
      };
    } catch {
      return { references: [] };
    }
  },
});