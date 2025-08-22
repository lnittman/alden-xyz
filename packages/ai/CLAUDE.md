# @repo/ai Package Context

## Development Standards

### Package Context
This package provides AI SDK v5 integration utilities and hooks for the Squish ecosystem. It bridges the frontend applications with the AI service, offering typed APIs, streaming responses, and AI-powered features throughout the application.

### Technology Stack
- **AI SDK**: v5 with streaming support
- **React**: 19+ compatibility
- **TypeScript**: 5.7+ strict configuration
- **Mastra Integration**: Latest API client
- ** Streaming**: Real-time AI responses

### Key Dependencies
```json
{
  "dependencies": {
    "ai": "^3.4.33",
    "@ai-sdk/openai": "^1.0.13",
    "@ai-sdk/google": "^1.0.13",
    "@repo/analytics": "workspace:*",
    "@repo/auth": "workspace:*",
    "react": "^19.1.0",
    "zod": "^3.25.28"
  },
  "devDependencies": {
    "@repo/typescript-config": "workspace:*",
    "@types/react": "^18.3.17"
  }
}
```

## Package Structure

### Directory Layout
```
src/
├── index.ts              # Main package exports
├── client/               # AI client configurations
│   ├── ai-client.ts      # Mastra AI client
│   ├── openai-client.ts  # OpenAI client wrapper
│   ├── google-client.ts  # Google AI client
│   └── index.ts          # Client exports
├── hooks/                # React hooks for AI features
│   ├── useChat.ts        # Chat completion hook
│   ├── useCompletion.ts  # Single completion hook
│   ├── useStream.ts      # Stream response hook
│   ├── useSearch.ts      # AI search hook
│   ├── useAnalysis.ts    # Content analysis hook
│   ├── useEmbedding.ts   # Embedding generation hook
│   └── index.ts          # Hook exports
├── types/                # AI-specific type definitions
│   ├── chat.ts           # Chat-related types
│   ├── completion.ts     # Completion types
│   ├── streaming.ts      # Streaming types
│   ├── search.ts         # Search types
│   └── index.ts          # Type exports
├── utils/                # Utility functions
│   ├── prompts.ts        # Prompt builders
│   ├── formatting.ts     # Response formatting
│   ├── validation.ts     # Input validation
│   └── index.ts          # Utility exports
├── prompts/              # AI prompt templates
│   ├── chat.ts           # Chat prompt templates
│   ├── search.ts         # Search prompt templates
│   ├── analysis.ts       # Analysis prompt templates
│   └── index.ts          # Template exports
└── constants/            # AI constants and configurations
    ├── models.ts         # Model configurations
    ├── providers.ts      # Provider settings
    └── index.ts          # Constant exports
```

## AI Client Patterns

### Mastra AI Client
```typescript
// src/client/ai-client.ts
import { createMastraClient } from '@mastra/client';

export const aiClient = createMastraClient({
  baseUrl: process.env.AI_SERVICE_URL || 'http://localhost:9998',
  headers: async () => {
    const token = await getToken(); // Get auth token from @repo/auth
    return {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    };
  },
});

// Typed API methods
export const ai = {
  async chat(messages: Message[], options?: ChatOptions) {
    const response = await aiClient.post('/chat', {
      messages,
      stream: options?.stream || false,
      model: options?.model || 'gemini-1.5-pro',
    });
    return response.data;
  },
  
  async search(query: string, filters?: SearchFilters) {
    const response = await aiClient.post('/search', {
      query,
      filters,
    });
    return response.data;
  },
  
  streamChat(messages: Message[]) {
    return aiClient.stream('/chat/stream', {
      messages,
    });
  },
};
```

### Provider-Specific Clients
```typescript
// src/client/google-client.ts
import { google } from '@ai-sdk/google';

export const googleAI = google({
  apiKey: process.env.GOOGLE_AI_API_KEY,
});

// Usage in components
const { text, finishReason } = await generateText({
  model: googleAI('gemini-1.5-pro'),
  prompt: 'Write a haiku about programming',
});
```

## React Hooks Patterns

### Chat Hook
```typescript
// src/hooks/useChat.ts
import { useCompletion } from 'ai/react';

interface UseChatOptions {
  api?: string;
  initialMessages?: Message[];
  onFinish?: (message: Message) => void;
  onError?: (error: Error) => void;
}

export function useChat(options: UseChatOptions = {}) {
  const {
    messages,
    input,
    setInput,
    handleSubmit,
    isLoading,
    error,
  } = useCompletion({
    api: options.api || '/api/chat',
    initialMessages: options.initialMessages,
    onFinish: options.onFinish,
    onError: options.onError,
  });
  
  // Custom functionality
  const sendMessage = useCallback(async (content: string) => {
    const message = { role: 'user', content };
    handleSubmit({
      preventDefault: () => {},
    } as any);
  }, [handleSubmit]);
  
  return {
    messages,
    input,
    setInput,
    sendMessage,
    isLoading,
    error,
  };
}
```

### Streaming Hook
```typescript
// src/hooks/useStream.ts
export function useStream(
  endpoint: string,
  onData: (data: any) => void,
  onError?: (error: Error) => void
) {
  const [isStreaming, setIsStreaming] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  
  const stream = useCallback(async (payload: any) => {
    setIsStreaming(true);
    setError(null);
    
    try {
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const reader = response.body?.getReader();
      const decoder = new TextDecoder();
      
      while (reader) {
        const { done, value } = await reader.read();
        if (done) break;
        
        const chunk = decoder.decode(value);
        const lines = chunk.split('\n');
        
        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const data = JSON.parse(line.slice(6));
            onData(data);
          }
        }
      }
    } catch (err) {
      setError(err as Error);
      onError?.(err as Error);
    } finally {
      setIsStreaming(false);
    }
  }, [endpoint, onData, onError]);
  
  return { stream, isStreaming, error };
}
```

## Type Safety Patterns

### AI Response Types
```typescript
// src/types/chat.ts
export interface Message {
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp?: string;
  metadata?: Record<string, any>;
}

export interface ChatOptions {
  model?: string;
  temperature?: number;
  maxTokens?: number;
  stream?: boolean;
  tools?: Tool[];
}

export interface Tool {
  name: string;
  description: string;
  parameters: Record<string, any>;
}

export interface ChatResponse {
  message: Message;
  usage: TokenUsage;
  finishReason: string;
  timestamp: string;
}

export interface TokenUsage {
  promptTokens: number;
  completionTokens: number;
  totalTokens: number;
}
```

## Prompt Engineering Patterns

### Template System
```typescript
// src/prompts/templates.ts
export const promptTemplates = {
  codeReview: `
    You are a senior software engineer reviewing code.
    
    Context:
    - Language: {language}
    - Framework: {framework}
    - Purpose: {purpose}
    
    Code to review:
    ```
    {code}
    ```
    
    Provide:
    1. Overall assessment
    2. Specific issues found
    3. Improvement suggestions
    4. Security considerations
  `,
  
  contentAnalysis: `
    Analyze the following content and extract key insights:
    
    Content: {content}
    Focus areas: {focusAreas}
    
    Return JSON with:
    - summary: string
    - keyPoints: string[]
    - sentiment: 'positive' | 'neutral' | 'negative'
    - topics: string[]
    - confidence: number
  `,
};
```

### Prompt Builder
```typescript
// src/utils/prompts.ts
export class PromptBuilder {
  private variables: Record<string, string> = {};
  private context: string[] = [];
  
  addVariable(key: string, value: string) {
    this.variables[key] = value;
    return this;
  }
  
  addContext(context: string) {
    this.context.push(context);
    return this;
  }
  
  build(template: string): string {
    let result = template;
    
    // Replace variables
    for (const [key, value] of Object.entries(this.variables)) {
      result = result.replace(new RegExp(`{${key}}`, 'g'), value);
    }
    
    // Add context at the beginning
    if (this.context.length > 0) {
      result = `Context:\n${this.context.join('\n')}\n\n${result}`;
    }
    
    return result;
  }
  
  reset() {
    this.variables = {};
    this.context = [];
    return this;
  }
}
```

## Integration Patterns

### AI Feature Component
```typescript
// Example usage in apps/app
import { useChat, useStream } from '@repo/ai';
import { ai } from '@repo/ai/client';

function AIAssistant() {
  const { messages, input, setInput, sendMessage, isLoading } = useChat({
    api: '/api/ai/chat',
    onFinish: (message) => {
      // Track completion
      trackEvent('ai_chat_completed', {
        messageCount: messages.length + 1,
      });
    },
  });
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (input.trim()) {
      sendMessage(input);
    }
  };
  
  return (
    <div className="ai-assistant">
      <div className="messages">
        {messages.map((msg, i) => (
          <Message key={i} message={msg} />
        ))}
      </div>
      
      <form onSubmit={handleSubmit}>
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask AI anything..."
          disabled={isLoading}
        />
        <button type="submit" disabled={isLoading}>
          {isLoading ? 'Thinking...' : 'Send'}
        </button>
      </form>
    </div>
  );
}
```

## Testing Patterns

### Mock AI Responses
```typescript
// tests/__mocks__/ai.ts
export const mockAI = {
  chat: vi.fn().mockResolvedValue({
    message: { role: 'assistant', content: 'Mock response' },
    usage: { promptTokens: 10, completionTokens: 5, totalTokens: 15 },
    finishReason: 'stop',
  }),
  
  search: vi.fn().mockResolvedValue({
    results: [
      { id: '1', score: 0.9, content: 'Result 1' },
      { id: '2', score: 0.8, content: 'Result 2' },
    ],
  }),
};

// Test hook usage
test('useChat should send and receive messages', () => {
  const { result } = renderHook(() => useChat(), {
    wrapper: ({ children }) => (
      <AIProvider mockClient={mockAI}>
        {children}
      </AIProvider>
    ),
  });
  
  const { sendMessage } = result.current;
  
  await act(async () => {
    sendMessage('Hello');
  });
  
  expect(mockAI.chat).toHaveBeenCalledWith(
    expect.arrayContaining([
      expect.objectContaining({ content: 'Hello' })
    ])
  );
});
```

## Common Tasks

### Adding a New AI Hook
1. Create hook in `src/hooks/[feature].ts`
2. Add TypeScript types in `src/types/`
3. Export from `src/hooks/index.ts`
4. Write tests for the hook
5. Update documentation

### Adding a New AI Provider
1. Create client in `src/client/[provider].ts`
2. Add provider types to corresponding types
3. Update client exports in `src/client/index.ts`
4. Add configuration constants
5. Test integration

### Creating New Prompt Templates
1. Add template to appropriate file in `src/prompts/`
2. Define variables using `{variable}` syntax
3. Add type safety with TypeScript interfaces
4. Test template with various inputs
5. Document usage patterns

## Files to Know

- `src/client/ai-client.ts` - Main AI client configuration
- `src/hooks/useChat.ts` - Chat completion hook
- `src/hooks/useStream.ts` - Streaming response hook
- `src/types/chat.ts` - Chat-related TypeScript types
- `src/prompts/templates.ts` - Prompt template library

## Quality Checklist

Before committing changes to this package:
- [ ] All hooks properly typed with TypeScript
- [ ] AI client calls have error handling
- [ ] Streaming implementations support cancellation
- [ ] Prompt templates are properly escaped
- [ ] Tests pass with mock AI responses
- [ ] No sensitive data in prompts or logs
- [ ] Analytics events tracked appropriately
- [ ] Performance considered for streaming
- [ ] Documentation updated for new features
- [ ] Hook dependencies optimized

---

*This context ensures Claude Code understands the AI package structure and patterns when working on AI integrations.*