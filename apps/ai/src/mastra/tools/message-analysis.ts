import { createTool } from '@mastra/core/tools';
import { z } from 'zod';
import { generateText } from 'ai';
import { google } from '@ai-sdk/google';

export const analyzeMessage = createTool({
  id: 'analyze-message',
  description: 'Analyze message content for entities, sentiment, and topics',
  inputSchema: z.object({
    message: z.string(),
    analysisType: z.array(z.enum(['entities', 'sentiment', 'topics', 'tags'])).default(['entities', 'sentiment', 'topics']),
  }),
  outputSchema: z.object({
    entities: z.array(z.object({
      type: z.string(),
      value: z.string(),
      confidence: z.number(),
    })).optional(),
    sentiment: z.object({
      label: z.enum(['positive', 'neutral', 'negative']),
      score: z.number(),
    }).optional(),
    topics: z.array(z.string()).optional(),
    tags: z.array(z.string()).optional(),
  }),
  execute: async ({ context }) => {
    const { message, analysisType } = context;
    
    const prompt = `Analyze the following message and extract the requested information.
    
Message: "${message}"

Analysis types requested: ${analysisType.join(', ')}

Respond with a JSON object containing:
${analysisType.includes('entities') ? '- entities: array of {type, value, confidence}' : ''}
${analysisType.includes('sentiment') ? '- sentiment: {label: "positive"|"neutral"|"negative", score: 0-1}' : ''}
${analysisType.includes('topics') ? '- topics: array of topic strings' : ''}
${analysisType.includes('tags') ? '- tags: array of relevant tags' : ''}`;

    const result = await generateText({
      model: google('gemini-2.0-flash-exp'),
      prompt,
      temperature: 0.3,
    });

    try {
      return JSON.parse(result.text);
    } catch {
      return {
        entities: [],
        sentiment: { label: 'neutral', score: 0.5 },
        topics: [],
        tags: [],
      };
    }
  },
});

export const findReferences = createTool({
  id: 'find-references',
  description: 'Find references to users, threads, or topics in a message',
  inputSchema: z.object({
    content: z.string(),
    chatId: z.string(),
  }),
  outputSchema: z.object({
    users: z.array(z.object({
      id: z.string(),
      username: z.string(),
      position: z.number(),
    })),
    threads: z.array(z.object({
      id: z.string(),
      title: z.string(),
      position: z.number(),
    })),
    topics: z.array(z.object({
      text: z.string(),
      position: z.number(),
    })),
  }),
  execute: async ({ context }) => {
    const { content } = context;
    
    const users = [];
    const threads = [];
    const topics = [];
    
    // Find @mentions
    const mentionRegex = /@(\w+)/g;
    let match;
    while ((match = mentionRegex.exec(content)) !== null) {
      users.push({
        id: `user-${match[1]}`,
        username: match[1],
        position: match.index,
      });
    }
    
    // Find #topics
    const topicRegex = /#(\w+)/g;
    while ((match = topicRegex.exec(content)) !== null) {
      topics.push({
        text: match[1],
        position: match.index,
      });
    }
    
    // Thread references would need database lookup
    // For now, find patterns like "thread:123" or "^123"
    const threadRegex = /(?:thread:|^)(\d+)/g;
    while ((match = threadRegex.exec(content)) !== null) {
      threads.push({
        id: match[1],
        title: `Thread ${match[1]}`,
        position: match.index,
      });
    }
    
    return { users, threads, topics };
  },
});

export const generateTags = createTool({
  id: 'generate-tags',
  description: 'Generate relevant tags for a message or content',
  inputSchema: z.object({
    content: z.string(),
    maxTags: z.number().default(5),
    context: z.string().optional(),
  }),
  outputSchema: z.object({
    tags: z.array(z.string()),
  }),
  execute: async ({ context }) => {
    const { content, maxTags, context: additionalContext } = context;
    
    const prompt = `Generate up to ${maxTags} relevant tags for the following content.
${additionalContext ? `Context: ${additionalContext}` : ''}

Content: "${content}"

Return only a JSON object with a "tags" array of strings. Tags should be lowercase, single words or short phrases.`;

    const result = await generateText({
      model: google('gemini-2.0-flash-exp'),
      prompt,
      temperature: 0.5,
    });

    try {
      const parsed = JSON.parse(result.text);
      return { tags: parsed.tags.slice(0, maxTags) };
    } catch {
      return { tags: [] };
    }
  },
});