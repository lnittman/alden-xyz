# Alden AI Service

AI service for the Alden messaging platform, providing intelligent chat features, semantic search, and contextual suggestions.

## 🚀 Features

- **Smart Chat Agent**: AI-powered responses with context awareness
- **Embeddings**: Generate vector embeddings for semantic search
- **Message Analysis**: Extract entities, sentiment, and topics
- **Smart Suggestions**: Quick replies and reference suggestions
- **Context Understanding**: Find mentions, threads, and references

## 📋 Architecture

```
apps/ai/
├── src/
│   ├── mastra/                # Mastra framework configuration
│   │   ├── agents/            # AI agents
│   │   │   └── alden-chat/    # Main chat agent
│   │   ├── tools/             # AI tools
│   │   │   ├── embeddings.ts  # Embedding generation
│   │   │   ├── message-analysis.ts # Message analysis
│   │   │   └── suggestions.ts # Smart suggestions
│   │   └── index.ts           # Mastra configuration
└── tests/                     # Test coverage
```

## 🔧 API Endpoints

Mastra automatically exposes these endpoints:

### Agent Endpoints
- `POST /api/agents/chat` - Chat agent for generating responses

### Tool Endpoints
- `POST /api/tools/generate-embedding/execute` - Generate text embeddings
- `POST /api/tools/batch-embeddings/execute` - Batch embedding generation
- `POST /api/tools/analyze-message/execute` - Analyze message content
- `POST /api/tools/find-references/execute` - Find mentions and references
- `POST /api/tools/generate-tags/execute` - Generate relevant tags
- `POST /api/tools/quick-suggestions/execute` - Get quick reply suggestions
- `POST /api/tools/get-reference-suggestions/execute` - Get reference suggestions

## 🚀 Getting Started

### Prerequisites
- Node.js >= 20.9.0
- OpenAI API key or Google AI API key

### Installation
```bash
cd apps/ai
bun install
```

### Configuration
```bash
cp .env.example .env
# Edit .env with your API keys
```

### Running the Service
```bash
# Development (port 9998)
bun run dev

# Production
bun run build
bun run start

# Run tests
bun run test
```

## 📡 API Usage Examples

### Generate Embedding
```javascript
const response = await fetch('http://localhost:9998/api/tools/generate-embedding/execute', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    text: "Hello world",
    model: "text-embedding-3-small"
  })
});
```

### Analyze Message
```javascript
const response = await fetch('http://localhost:9998/api/tools/analyze-message/execute', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    message: "Hey @john, check out this article about AI",
    analysisType: ["entities", "sentiment", "topics"]
  })
});
```

### Get Quick Suggestions
```javascript
const response = await fetch('http://localhost:9998/api/tools/quick-suggestions/execute', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    currentMessage: "I think we should",
    maxSuggestions: 3
  })
});
```

## 🔍 Monitoring

### Health Check
```bash
curl http://localhost:9998/health
```

## 📚 Documentation

- [Mastra Documentation](https://mastra.ai/docs)
- [AI SDK Documentation](https://sdk.vercel.ai/docs)

## 🤝 Contributing

1. Follow existing patterns for new tools/agents
2. Add comprehensive tests for new features
3. Update documentation for API changes

## 📝 License

© 2024 Alden - All rights reserved