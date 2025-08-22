import { createTool } from '@mastra/core/tools';
import { z } from 'zod';
import { embed, embedMany } from 'ai';
import { openai } from '@ai-sdk/openai';

export const generateEmbedding = createTool({
  id: 'generate-embedding',
  description: 'Generate embeddings for text content',
  inputSchema: z.object({
    text: z.string().describe('Text to generate embedding for'),
    model: z.string().default('text-embedding-3-small').describe('Embedding model to use'),
  }),
  outputSchema: z.object({
    embedding: z.array(z.number()),
    model: z.string(),
    dimensions: z.number(),
  }),
  execute: async ({ context }) => {
    const { text, model } = context;
    
    const result = await embed({
      model: openai.embedding(model),
      value: text,
    });

    return {
      embedding: result.embedding,
      model,
      dimensions: result.embedding.length,
    };
  },
});

export const batchEmbeddings = createTool({
  id: 'batch-embeddings',
  description: 'Generate embeddings for multiple texts',
  inputSchema: z.object({
    texts: z.array(z.string()).describe('Array of texts to embed'),
    model: z.string().default('text-embedding-3-small'),
  }),
  outputSchema: z.object({
    embeddings: z.array(z.array(z.number())),
    count: z.number(),
    model: z.string(),
  }),
  execute: async ({ context }) => {
    const { texts, model } = context;
    
    const result = await embedMany({
      model: openai.embedding(model),
      values: texts,
    });

    return {
      embeddings: result.embeddings,
      count: texts.length,
      model,
    };
  },
});