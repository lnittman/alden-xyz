# Edge Functions Documentation

## Overview
Enso uses Supabase Edge Functions to handle AI operations and real-time processing. These functions are deployed to the edge for low-latency responses and efficient scaling.

## Functions

### find-references
**Purpose:** Detects and extracts references from message text.
```typescript
POST /functions/find-references
{
  "message_text": string,
  "chat_id": string
}
```
- Uses Vertex AI embeddings to find semantically similar content
- Returns references to users, threads, URLs, and files
- Supports real-time reference detection during typing

### generate-embedding
**Purpose:** Generates embeddings for text content using Vertex AI.
```typescript
POST /functions/generate-embedding
{
  "text": string,
  "imageUrl"?: string
}
```
- Supports both text and multimodal content
- Uses `multimodalembedding@001` model
- Returns 1408-dimensional embeddings

### generate-response
**Purpose:** Generates AI responses using DeepSeek's model.
```typescript
POST /functions/generate-response
{
  "prompt": string,
  "context"?: string
}
```
- Uses DeepSeek Chat model for high-quality responses
- Supports contextual prompting
- Returns structured response content

### generate-tags
**Purpose:** Automatically generates relevant tags for content.
```typescript
POST /functions/generate-tags
{
  "content": string
}
```
- Uses Gemini Pro for tag generation
- Returns array of relevant tags
- Supports content categorization

### get-reference-suggestions
**Purpose:** Provides contextual suggestions based on input.
```typescript
POST /functions/get-reference-suggestions
{
  "query": string,
  "chat_id"?: string,
  "type"?: string,
  "limit"?: number,
  "threshold"?: number
}
```
- Combines vector similarity search with AI suggestions
- Returns structured suggestions with metadata
- Supports filtering by type and chat context

### process-embedding-queue
**Purpose:** Background processor for embedding generation queue.
```typescript
POST /functions/process-embedding-queue
```
- Processes pending embedding generation jobs
- Updates job status and stores results
- Handles retries and error logging

### translate
**Purpose:** Provides message translation services.
```typescript
POST /functions/translate
{
  "text": string,
  "targetLang": string
}
```
- Uses Gemini Pro for high-quality translation
- Preserves message context and tone
- Supports multiple target languages

## Common Features

### Error Handling
All functions implement consistent error handling:
- Structured error responses
- Detailed error logging
- Appropriate HTTP status codes

### CORS Support
All functions include CORS headers for cross-origin requests:
- Access-Control-Allow-Origin: *
- Support for required headers and methods
- Pre-flight request handling

### Authentication
Functions requiring authentication use Supabase auth:
- JWT validation
- Role-based access control
- Service role operations where needed

## Development Guidelines

### Local Testing
Use the provided test script:
```bash
pnpm test-fn <function-name>
```

### Deployment
Deploy functions using Supabase CLI:
```bash
supabase functions deploy
```

### Environment Variables
Required variables:
- `GOOGLE_PROJECT_ID`: Google Cloud project ID
- `GOOGLE_CREDENTIALS`: Service account credentials
- `DEEPSEEK_KEY`: DeepSeek API key
- `SUPABASE_URL`: Project URL
- `SUPABASE_SERVICE_ROLE_KEY`: Service role key

## Core Functions

### 1. Embedding Generation
`functions/generate-embedding/index.ts`

```typescript
// Generate embeddings for text content using Vertex AI
async function generateEmbedding(req: Request) {
  const vertexAI = new VertexAI({
    project: Deno.env.get('GOOGLE_PROJECT_ID'),
    location: 'us-central1',
  });

  const model = vertexAI.preview.getGenerativeModel({
    model: 'multimodalembedding@001',
  });

  const { text, imageUrl } = await req.json();
  
  let content;
  if (imageUrl) {
    // Handle multimodal content (text + image)
    content = {
      parts: [
        { text: text || '' },
        { inlineData: { data: imageUrl, mimeType: 'image/jpeg' } }
      ]
    };
  } else {
    // Handle text-only content
    content = { parts: [{ text }] };
  }

  const result = await model.embedContent({ content });

  return new Response(JSON.stringify({
    embedding: result.embedding.values,
    dimension: result.embedding.values.length,
  }));
}
```

### 2. Reference Detection
`functions/find-references/index.ts`

```typescript
// Detect references in messages using regex and database lookups
async function findReferences(req: Request) {
  const { message_text, chat_id } = await req.json();
  const supabase = createClient(/* config */);

  // Find database references (users and threads)
  const { data: dbRefs } = await supabase.rpc(
    "find_references",
    { message_text, chat_id }
  );

  // Find URLs
  const urlRefs = [...message_text.matchAll(urlRegex)]
    .map(match => ({
      type: "url",
      target_id: null,
      context: { url: match[0] }
    }));

  // Find file references
  const fileRefs = [...message_text.matchAll(fileRegex)]
    .map(match => ({
      type: "file",
      target_id: null,
      context: {
        name: match[1],
        url: match[2]
      }
    }));

  return new Response(JSON.stringify({
    references: [...dbRefs, ...urlRefs, ...fileRefs]
  }));
}
```

### 3. Response Generation
`functions/generate-response/index.ts`

```typescript
// Generate AI responses using DeepSeek
async function generateResponse(req: Request) {
  const { prompt, context } = await req.json();
  
  const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${Deno.env.get('DEEPSEEK_KEY')}`,
      'HTTP-Referer': 'https://ddkmozzdyzakphgabdzq.supabase.co',
    },
    body: JSON.stringify({
      model: 'deepseek/deepseek-chat',
      messages: [
        {
          role: 'user',
          content: context ? `${context}\n\n${prompt}` : prompt,
        },
      ],
      temperature: 0.7,
      max_tokens: 1000,
    }),
  });

  const result = await response.json();
  return new Response(JSON.stringify({
    response: result.choices[0].message.content,
  }));
}
```

### 4. Translation
`functions/translate/index.ts`

```typescript
// Translate messages using Vertex AI
async function translate(req: Request) {
  const vertexAI = new VertexAI({
    project: Deno.env.get('GOOGLE_PROJECT_ID'),
    location: 'us-central1',
  });

  const model = vertexAI.preview.getGenerativeModel({
    model: 'gemini-pro',
  });

  const { text, targetLang } = await req.json();
  
  const result = await model.generateContent({
    contents: [{ 
      role: 'user', 
      parts: [{ 
        text: `Translate to ${targetLang}:\n\n${text}` 
      }] 
    }],
  });

  return new Response(JSON.stringify({
    translation: result.response.candidates[0].content.parts[0].text,
  }));
}
```

### 5. Reference Suggestions
`functions/get-reference-suggestions/index.ts`

```typescript
// Get context-aware reference suggestions
async function getReferencesSuggestions(req: Request) {
  const vertexAI = new VertexAI({
    project: Deno.env.get('GOOGLE_PROJECT_ID'),
    location: 'us-central1',
  });

  const { query, type, limit = 5 } = await req.json();
  const supabase = createClient(/* config */);

  // Generate embedding
  const model = vertexAI.preview.getGenerativeModel({
    model: 'embedding-001',
  });
  
  const embedding = await model.embedContent({
    content: { parts: [{ text: query }] },
  });

  // Find similar content
  const { data: semanticResults } = await supabase.rpc(
    'search_references',
    {
      query_embedding: embedding.embedding.values,
      similarity_threshold: 0.6,
      match_count: limit,
      ref_type: type,
    }
  );

  // Get contextual suggestions
  const geminiModel = vertexAI.preview.getGenerativeModel({
    model: 'gemini-pro',
  });

  const contextualResults = await geminiModel.generateContent({
    contents: [{ 
      role: 'user', 
      parts: [{ 
        text: `Suggest ${limit} relevant ${type}s for: ${query}` 
      }] 
    }],
  });

  // Combine and deduplicate
  const combined = [...semanticResults, ...contextualResults];
  const unique = Array.from(
    new Map(combined.map(item => [item.id, item])).values()
  );

  return new Response(JSON.stringify({
    suggestions: unique.slice(0, limit),
  }));
}
```

## Shared Utilities

### CORS Headers
`functions/_shared/cors.ts`

```typescript
export const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, GET, OPTIONS',
};
```

## Deployment & Configuration

### Environment Variables
Required environment variables for the Edge Functions:
```bash
GOOGLE_PROJECT_ID="your-project-id"
GOOGLE_CREDENTIALS="your-credentials-json"
DEEPSEEK_KEY="your-api-key"
SUPABASE_URL="your-project-url"
SUPABASE_SERVICE_ROLE_KEY="your-service-key"
```

### Function Configuration
Each function should have a `deno.json` configuration:
```json
{
  "imports": {
    "@supabase/supabase-js": "https://esm.sh/@supabase/supabase-js@2.38.4"
  }
}
```

## Testing

### Local Testing
Use the Supabase CLI to test functions locally:
```bash
supabase functions serve
```

Test with curl:
```bash
curl -i --location --request POST \
  'http://localhost:54321/functions/v1/generate-embedding' \
  --header 'Authorization: Bearer eyJ...' \
  --header 'Content-Type: application/json' \
  --data '{"text":"Test content"}'
```

### Production Testing
Test deployed functions:
```bash
curl -i --location --request POST \
  'https://[PROJECT_REF].supabase.co/functions/v1/generate-embedding' \
  --header 'Authorization: Bearer eyJ...' \
  --header 'Content-Type: application/json' \
  --data '{"text":"Test content"}'
```

## Error Handling

All functions implement consistent error handling:
```typescript
try {
  // Function logic
} catch (error) {
  console.error('Error:', error);
  return new Response(
    JSON.stringify({ 
      error: error instanceof Error ? error.message : "Unexpected error" 
    }),
    { 
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    }
  );
}
```

## Performance Considerations

1. **Caching**
   - Cache embeddings in Redis
   - Use edge caching for frequent requests
   - Implement request deduplication

2. **Rate Limiting**
   - Implement token bucket algorithm
   - Add retry logic with backoff
   - Use quota management

3. **Optimization**
   - Batch similar requests
   - Use connection pooling
   - Implement request pipelining

## Related Documentation
- [@schema.md](./schema.md): Database schema details
- [@ai_architecture.md](../../architecture/ai_architecture.md): AI system design
- [@ai_flow.md](../../architecture/ai_flow.md): Data flow diagrams 