# Squish AI Service Context (apps/ai)

## Development Standards

### Project Context
This is the Mastra-powered AI service for Squish, providing intelligent search, content understanding, and AI-powered features. It integrates with Vertex AI for multimodal capabilities including text, image, and document processing.

### Technology Stack
- **Framework**: Mastra (latest) - AI orchestration framework
- **Runtime**: Node.js with Cloudflare Workers compatibility
- **AI Provider**: Google Vertex AI with Gemini models
- **Embeddings**: Custom embedding models for semantic search
- **Vector Storage**: Integrated with main PostgreSQL database
- **TypeScript**: 5.8.3 with strict configuration
- **Deployment**: Mastra Cloud

### Key Dependencies
```json
{
  "dependencies": {
    "@mastra/core": "latest",
    "@mastra/memory": "latest",
    "@mastra/rag": "latest",
    "@google-cloud/vertexai": "^1.6.0",
    "@google-cloud/storage": "^7.14.0",
    "postgres": "^3.4.5",
    "drizzle-orm": "^0.38.2",
    "zod": "^3.25.28",
    "ai": "^3.4.33",
    "@ai-sdk/google": "^1.0.13"
  },
  "devDependencies": {
    "mastra": "latest",
    "@repo/typescript-config": "workspace:*"
  }
}
```

## Project Structure

### Directory Layout
```
src/
├── index.ts              # Mastra service entry point
├── mastra/               # Mastra configuration and setup
│   ├── index.ts          # Mastra initialization
│   ├── memory.ts         # Memory vector store configuration
│   ├── providers.ts      # AI provider configurations
│   └── tools.ts          # AI tool definitions
├── agents/               # Mastra agent definitions
│   ├── search.ts         # Search specialist agent
│   ├── content.ts        # Content understanding agent
│   ├── analysis.ts       # Data analysis agent
│   └── index.ts          # Agent registry
├── tools/                # AI tool implementations
│   ├── search.ts         # Search and retrieval tools
│   ├── content.ts        # Content processing tools
│   ├── analysis.ts       # Data analysis tools
│   ├── storage.ts        # File handling tools
│   └── index.ts          # Tool registry
├── services/             # AI service implementations
│   ├── embedding.ts      # Embedding generation
│   ├── retrieval.ts      # Semantic search
│   ├── reasoning.ts      # Reasoning and synthesis
│   ├── multimodal.ts     # Multimodal processing
│   ├── rag.ts            # RAG pipeline
│   └── index.ts          # Service exports
├── prompts/              # AI prompt templates
│   ├── search.ts         # Search-related prompts
│   ├── analysis.ts       # Analysis prompts
│   ├── templates.ts      # Prompt templates
│   └── index.ts          # Prompt registry
├── utils/                # Utility functions
│   ├── text-processing.ts # Text processing helpers
│   ├── embedding-utils.ts # Embedding utilities
│   └── index.ts          # Utility exports
└── types/                # AI-specific type definitions
    ├── agents.ts         # Agent types
    ├── tools.ts          # Tool types
    └── index.ts          # Type exports
```

## Mastra Framework Architecture

### Mastra Service Configuration
```typescript
// src/mastra/index.ts
import { Mastra } from '@mastra/core';

export const mastra = new Mastra({
  // Memory configuration for vector store
  memory: {
    provider: 'postgres',
    connectionString: process.env.DATABASE_URL,
  },
  
  // AI provider configuration
  providers: {
    vertex: {
      project: process.env.VERTEX_AI_PROJECT,
      location: process.env.VERTEX_AI_LOCATION,
      credentials: JSON.parse(process.env.GOOGLE_APPLICATION_CREDENTIALS!),
    },
  },
  
  // Tool registration
  tools: {
    search: searchTools,
    content: contentTools,
    analysis: analysisTools,
  },
});
```

### Agent Pattern
```typescript
// src/agents/search.ts
import { Agent } from '@mastra/core';

export const searchAgent = new Agent({
  name: 'search',
  instructions: `
    You are a search specialist for the Squish platform.
    Your capabilities include:
    1. Semantic search across all content
    2. Query understanding and expansion
    3. Result ranking and relevance scoring
    4. Multi-turn search conversations
  `,
  tools: ['search', 'embed', 'retrieve'],
  model: 'gemini-1.5-pro',
});

// Usage in service
const result = await searchAgent.generate(
  'Find documents about project planning strategies',
  { userId }
);
```

### Tool Implementation Pattern
```typescript
// src/tools/search.ts
import { Tool } from '@mastra/core';

export const searchTool = new Tool({
  name: 'semantic-search',
  description: 'Search documents using semantic similarity',
  inputSchema: z.object({
    query: z.string(),
    limit: z.number().default(10),
    filters: z.object({
      boardId: z.string().optional(),
      contentType: z.enum(['text', 'image', 'document']).optional(),
    }).optional(),
  }),
  
  async execute({ query, limit, filters }) {
    const embeddings = await embeddingService.generate(query);
    const results = await retrievalService.semanticSearch(
      embeddings,
      limit,
      filters
    );
    
    return {
      results,
      query,
      timestamp: new Date().toISOString(),
    };
  },
});
```

## AI Integration Patterns

### Vertex AI Integration
```typescript
// src/mastra/providers.ts
import { VertexAI } from '@google-cloud/vertexai';

const vertexAI = new VertexAI({
  project: process.env.VERTEX_AI_PROJECT!,
  location: process.env.VERTEX_AI_LOCATION!,
  googleAuthOptions: {
    credentials: JSON.parse(process.env.GOOGLE_APPLICATION_CREDENTIALS!),
  },
});

// Multimodal model usage
const generativeModel = vertexAI.getGenerativeModel({
  model: 'gemini-1.5-pro',
});

const multimodalResult = await generativeModel.generateContent([
  'Analyze this document:',
  { fileData: { mimeType, fileUri } },
]);
```

### AI SDK Integration
```typescript
// Using AI SDK for streaming responses
import { openai } from '@ai-sdk/openai';
import { streamText } from 'ai';

export async function generateResponse(messages: Message[]) {
  const result = await streamText({
    model: openai('gpt-4-turbo'),
    messages,
    tools: {
      search: {
        description: 'Search for information',
        parameters: searchToolSchema,
      },
    },
  });
  
  return result.toDataStreamResponse();
}
```

## RAG (Retrieval-Augmented Generation)

### RAG Pipeline Implementation
```typescript
// src/services/rag.ts
export class RAGService {
  constructor(
    private embeddingService: EmbeddingService,
    private retrievalService: RetrievalService,
    private llmService: LLMService
  ) {}
  
  async query(query: string, context?: QueryContext) {
    // Step 1: Understand query intent
    const intent = await this.analyzeIntent(query);
    
    // Step 2: Retrieve relevant documents
    const documents = await this.retrievalService.retrieve(
      query,
      intent.filters,
      10
    );
    
    // Step 3: Generate response with context
    const response = await this.llmService.generate(
      query,
      documents,
      context
    );
    
    return {
      response,
      sources: documents,
      intent,
      timestamp: new Date().toISOString(),
    };
  }
}
```

### Embedding Generation
```typescript
// src/services/embedding.ts
export class EmbeddingService {
  private model = new TextEmbeddingModel();
  
  async generate(text: string | string[]): Promise<number[]> {
    const texts = Array.isArray(text) ? text : [text];
    
    // Generate embeddings using Vertex AI
    const embeddings = await this.model.embed(texts);
    
    return Array.isArray(embeddings[0]) 
      ? embeddings[0] 
      : embeddings;
  }
  
  async batchGenerate(texts: string[]): Promise<number[][]> {
    const batchSize = 100;
    const results: number[][] = [];
    
    for (let i = 0; i < texts.length; i += batchSize) {
      const batch = texts.slice(i, i + batchSize);
      const embeddings = await this.model.embed(batch);
      results.push(...(Array.isArray(embeddings[0]) ? embeddings : [embeddings]));
    }
    
    return results;
  }
}
```

## Multimodal Processing

### Image Understanding
```typescript
// src/services/multimodal.ts
export class MultimodalService {
  async analyzeImage(imageUrl: string, query: string) {
    const visionModel = vertexAI.getGenerativeModel({
      model: 'gemini-1.5-pro-vision',
    });
    
    const result = await visionModel.generateContent([
      query,
      {
        fileData: {
          mimeType: 'image/jpeg',
          fileUri: imageUrl,
        },
      },
    ]);
    
    return {
      analysis: result.response.text(),
      metadata: {
        model: 'gemini-1.5-pro-vision',
        timestamp: new Date().toISOString(),
      },
    };
  }
  
  async processDocument(fileUrl: string, type: 'pdf' | 'docx' | 'txt') {
    // Document processing logic
    const extractedText = await this.extractText(fileUrl, type);
    const summary = await this.generateSummary(extractedText);
    
    return {
      text: extractedText,
      summary,
      wordCount: extractedText.split(' ').length,
    };
  }
}
```

## Prompt Engineering

### Prompt Template System
```typescript
// src/prompts/templates.ts
export const prompts = {
  search: {
    queryExpansion: `
      Given a user's search query, generate 3-5 expanded queries
      that capture different aspects of what the user might be looking for.
      
      Original query: {query}
      Context: {context}
      
      Return as JSON array of strings.
    `,
    
    resultSummary: `
      Summarize the following search results in a helpful way:
      
      Query: {query}
      Results: {results}
      
      Provide a concise summary highlighting the most relevant information.
    `,
  },
  
  analysis: {
    sentiment: `
      Analyze the sentiment of the following text:
      
      Text: {text}
      
      Return JSON with:
      - sentiment: "positive" | "neutral" | "negative"
      - confidence: 0-1
      - keyPhrases: string[]
      - topics: string[]
    `,
  },
};
```

### Dynamic Prompt Construction
```typescript
// src/prompts/index.ts
export class PromptBuilder {
  constructor(private templates: Record<string, string>) {}
  
  build(templateName: string, variables: Record<string, any>) {
    let template = this.templates[templateName];
    
    // Replace variables
    for (const [key, value] of Object.entries(variables)) {
      template = template.replace(new RegExp(`{${key}}`, 'g'), String(value));
    }
    
    return template;
  }
  
  buildSystemPrompt(agents: string[], tools: string[]) {
    return `
      You are an AI assistant for the Squish platform.
      
      Available agents: ${agents.join(', ')}
      Available tools: ${tools.join(', ')}
      
      Always use the appropriate tools when answering questions.
      If you need to search for information, use the search tool.
      `;
  }
}
```

## Memory and Context Management

### Conversation Memory
```typescript
// src/mastra/memory.ts
export class ConversationMemory {
  private storage = new MastraMemory({
    connectionString: process.env.DATABASE_URL,
  });
  
  async storeMessage(
    conversationId: string,
    role: 'user' | 'assistant',
    content: string,
    metadata?: any
  ) {
    await this.storage.store({
      conversationId,
      role,
      content,
      timestamp: new Date().toISOString(),
      metadata,
    });
  }
  
  async getContext(conversationId: string, limit = 10) {
    const messages = await this.storage.getConversation(
      conversationId,
      limit
    );
    
    return {
      messages,
      summary: await this.summarizeConversation(messages),
    };
  }
}
```

### Working Memory
```typescript
// Short-term memory for agent interactions
interface WorkingMemory {
  currentTask: string;
  context: Record<string, any>;
  toolsUsed: string[];
  intermediateResults: any[];
}

export function createWorkingMemory(): WorkingMemory {
  return {
    currentTask: '',
    context: {},
    toolsUsed: [],
    intermediateResults: [],
  };
}
```

## Development Workflow

### Local Development
```bash
# Start Mastra development server
bun run dev

# Build for deployment
bun run build

# Deploy to Mastra Cloud
bunx mastra deploy

# Run tests
bun run test
```

### Environment Variables
```typescript
interface Env {
  // Vertex AI
  VERTEX_AI_PROJECT: string;
  VERTEX_AI_LOCATION: string;
  GOOGLE_APPLICATION_CREDENTIALS: string;
  
  // Database
  DATABASE_URL: string;
  
  // External services
  AI_SERVICE_URL: string;
  
  // Mastra Cloud
  MASTRA_ENVIRONMENT: 'development' | 'production';
}
```

## Testing Patterns

### Agent Testing
```typescript
// tests/agents.test.ts
import { test } from 'vitest';
import { searchAgent } from '../src/agents/search';

test.describe('Search Agent', () => {
  test('should expand query appropriately', async () => {
    const result = await searchAgent.generate(
      'Find project management docs',
      { userId: 'test-user' }
    );
    
    expect(result.content).toContain('project');
    expect(result.toolsUsed).toContain('search');
  });
});
```

### Tool Testing
```typescript
// tests/tools.test.ts
test('semantic search tool should return relevant results', async () => {
  const results = await searchTool.execute({
    query: 'database design patterns',
    limit: 5,
  });
  
  expect(results.results).toHaveLength(5);
  expect(results.results[0].score).toBeGreaterThan(0.7);
});
```

## Performance Optimization

### Caching Strategy
```typescript
// Implement caching for embeddings and search results
export class CachedEmbeddingService {
  private cache = new Map<string, number[]>();
  
  async generate(text: string): Promise<number[]> {
    const cacheKey = `embed:${text}`;
    
    if (this.cache.has(cacheKey)) {
      return this.cache.get(cacheKey)!;
    }
    
    const embedding = await this.model.embed(text);
    this.cache.set(cacheKey, embedding);
    
    // Cache for 1 hour
    setTimeout(() => this.cache.delete(cacheKey), 3600000);
    
    return embedding;
  }
}
```

### Batch Processing
```typescript
// Process multiple requests efficiently
export async function batchProcessEmbeddings(texts: string[]) {
  const uncached = [];
  const results: Record<string, number[]> = {};
  
  for (const text of texts) {
    if (this.cache.has(text)) {
      results[text] = this.cache.get(text)!;
    } else {
      uncached.push(text);
    }
  }
  
  if (uncached.length > 0) {
    const embeddings = await this.model.embed(uncached);
    uncached.forEach((text, i) => {
      results[text] = embeddings[i];
      this.cache.set(text, embeddings[i]);
    });
  }
  
  return texts.map(text => results[text]);
}
```

## Monitoring and Observability

### AI Metrics
```typescript
// Track AI-specific metrics
export class AIMetrics {
  private metrics = {
    requestsTotal: 0,
    latency: [],
    tokenUsage: { total: 0, prompt: 0, completion: 0 },
    errors: 0,
  };
  
  recordRequest(duration: number, tokens?: { prompt: number; completion: number }) {
    this.metrics.requestsTotal++;
    this.metrics.latency.push(duration);
    
    if (tokens) {
      this.metrics.tokenUsage.total += tokens.prompt + tokens.completion;
      this.metrics.tokenUsage.prompt += tokens.prompt;
      this.metrics.tokenUsage.completion += tokens.completion;
    }
  }
  
  getStats() {
    return {
      ...this.metrics,
      avgLatency: this.metrics.latency.reduce((a, b) => a + b, 0) / this.metrics.latency.length,
    };
  }
}
```

## Security Considerations

### Content Filtering
```typescript
// Implement content safety checks
export async function validateContent(content: string): Promise<boolean> {
  const moderationModel = vertexAI.getGenerativeModel({
    model: 'gemini-1.5-pro',
  });
  
  const result = await moderationModel.generateContent([
    `Check if this content is appropriate: ${content}`,
  ]);
  
  const appropriate = result.response.text().toLowerCase().includes('appropriate');
  return appropriate;
}
```

## Common Tasks

### Adding a New Agent
1. Create agent file in `src/agents/`
2. Define agent instructions and tools
3. Register agent in `src/agents/index.ts`
4. Write tests for the agent
5. Update documentation

### Adding a New Tool
1. Create tool implementation in `src/tools/`
2. Define input/output schemas with Zod
3. Register tool in `src/tools/index.ts`
4. Add to Mastra configuration
5. Test with actual AI calls

### Adding New Prompt Templates
1. Create prompt in `src/prompts/[domain].ts`
2. Add to prompt builder
3. Test with various inputs
4. Document usage patterns

## Files to Know

- `src/mastra/index.ts` - Mastra configuration
- `src/agents/` - AI agent definitions
- `src/tools/` - AI tool implementations
- `src/services/rag.ts` - RAG pipeline
- `src/prompts/` - Prompt templates
- `src/services/embedding.ts` - Embedding service

## Quality Checklist

Before committing changes to this AI service:
- [ ] All agents properly defined with clear instructions
- [ ] Tools have comprehensive schemas and error handling
- [ ] Prompt templates tested for clarity
- [ ] AI responses tested for quality
- [ ] Tests pass for new functionality
- [ ] Performance metrics considered
- [ ] Content filtering implemented where needed
- [ ] Memory management is efficient
- [ ] Documentation updated
- [ ] No hardcoded credentials or keys

---

*This context ensures Claude Code understands the AI service structure and patterns when working on AI features.*