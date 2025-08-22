# Enso Web Implementation Guide

## Tech Stack

- **Framework**: Next.js 15 with App Router and React Server Components
- **Language**: TypeScript
- **Styling**: Tailwind CSS v4 with CSS Variables for theming
- **State Management**: 
  - Redux Toolkit for client-side state
  - RTK Query for server state and data fetching
  - Local storage for persistence
- **Authentication**: Supabase Auth with server-side helpers
- **Database**: Supabase PostgreSQL with Edge Functions
- **AI Features** (see [Core Features](../ai/core_features.md)):
  - Vertex AI for embeddings and chat
  - OpenRouter for model selection
  - Edge functions for AI processing
  - Redis for embedding cache
  - pgvector for similarity search
- **UI Components**: 
  - Radix UI for accessible primitives
  - Headless UI for complex interactions
  - Framer Motion for animations
  - Lucide icons
  - Sonner for toast notifications
- **Development Tools**:
  - ESLint for code quality
  - Prettier for code formatting
  - TypeScript for type safety

## Project Structure

```
enso-web/
├── src/
│   ├── app/                 # Next.js App Router pages
│   │   ├── (auth)/         # Authentication routes
│   │   │   ├── login/      # Login page
│   │   │   └── signup/     # Signup page
│   │   ├── (app)/          # Protected app routes
│   │   │   ├── chat/       # Chat interface
│   │   │   └── settings/   # User settings
│   │   └── layout.tsx      # Root layout
│   ├── components/         # React components
│   │   ├── ui/            # Base UI components
│   │   ├── auth/          # Auth components
│   │   ├── chat/          # Chat components
│   │   │   ├── container/ # Chat containers
│   │   │   ├── messages/  # Message components
│   │   │   └── references/# Reference components
│   │   └── shared/        # Shared components
│   ├── lib/               # Core functionality
│   │   ├── supabase/      # Supabase client
│   │   ├── redux/         # State management
│   │   │   ├── store.ts   # Redux store
│   │   │   └── slices/    # Feature slices
│   │   ├── ai/           # AI services
│   │   │   ├── chat.ts    # Chat generation
│   │   │   ├── embedding.ts# Text embedding
│   │   │   └── reference.ts# Reference finding
│   │   └── utils/         # Utilities
│   ├── hooks/             # Custom hooks
│   ├── styles/            # Global styles
│   └── types/             # TypeScript types
```

## Key Features

1. **Authentication Flow** ✅
   - Server-side auth with Supabase
   - Protected routes and middleware
   - Persistent sessions

2. **Chat Interface**
   - Real-time messaging with Supabase 🔄
   - Message history and context ✅
   - Markdown support 🔄
   - Code syntax highlighting 🔄

3. **AI Features**
   - Text embeddings with Vertex AI ✅
   - Chat completion with OpenRouter ✅
   - Reference finding with embeddings ✅
   - Content translation support ✅

4. **Theme System** ✅
   - Dark/Light mode support
   - CSS variables for theming
   - Tailwind CSS styling

5. **State Management** ✅
   - Redux Toolkit for UI state
   - RTK Query for server state
   - Optimistic updates
   - Local storage persistence

## Implementation Steps

1. **Project Setup** ✅
   - Initialize Next.js project
   - Configure Tailwind CSS
   - Set up Supabase client
   - Configure Redux store

2. **Authentication** 🔄
   - Login/signup pages
   - Auth middleware
   - Protected routes
   - Session management

3. **Chat Interface** 🔄
   - Port chat components from mobile
   - Adapt for web layout
   - Add keyboard shortcuts
   - Implement drag-and-drop

4. **AI Integration** 🔄
   - Port AI services from mobile
   - Add RTK Query endpoints
   - Implement streaming responses
   - Add progress indicators

5. **Polish & Optimization**
   - Add loading states
   - Implement error handling
   - Add animations
   - Optimize performance

## Development Guidelines

1. **Component Structure**
   - Use TypeScript for all components
   - Follow atomic design
   - Add proper documentation
   - Include unit tests

2. **State Management**
   - Use RTK Query for API calls
   - Implement optimistic updates
   - Handle loading states
   - Manage error states

3. **AI Features**
   - Use streaming for responses
   - Implement retry logic
   - Add fallback models
   - Cache embeddings

4. **Security**
   - Validate all inputs
   - Implement rate limiting
   - Secure API endpoints
   - Handle sensitive data

## Next Steps

1. Port Chat Components from Mobile
   - [ ] ChatContainer
   - [ ] MessageList
   - [ ] MessageInput
   - [ ] ReferencePanel

2. Add AI Endpoints to RTK Query
   - [ ] generateEmbedding
   - [ ] generateResponse
   - [ ] findReferences
   - [ ] translateContent

3. Implement Authentication Flow
   - [ ] Login page
   - [ ] Signup page
   - [ ] Auth middleware
   - [ ] Protected routes

4. Polish User Experience
   - [ ] Loading states
   - [ ] Error handling
   - [ ] Animations
   - [ ] Keyboard shortcuts 

# Web Implementation Details

## System Architecture

### Core Services

1. **Context Engine** (`src/lib/ai/context.ts`)
```typescript
class ContextEngine {
  async detectContext(content: string, context: MessageContext): Promise<ContentAnalysis>
  async findSimilarContent(embedding: number[], options: SearchOptions): Promise<Reference[]>
  async generateSuggestions(content: string, context: MessageContext): Promise<Suggestion[]>
  async mergeContexts(contexts: Context[]): Promise<Context>
  async shareContext(chatId: string, options: ShareOptions): Promise<SharedContext>
  async enhanceContext(chatId: string, options: EnhanceOptions): Promise<EnhancedContext>
}
```

2. **Embedding Service** (`src/lib/ai/embeddings.ts`)
```typescript
class EmbeddingService {
  async generateEmbedding(text: string): Promise<number[]>
  async findSimilar(embedding: number[], options: SimilarityOptions): Promise<SimilarityMatch[]>
  async batchProcess(texts: string[]): Promise<number[][]>
}
```

3. **Knowledge Service** (`src/lib/ai/knowledge.ts`)
```typescript
class KnowledgeService {
  async addNode(type: string, data: any): Promise<string>
  async addEdge(from: string, to: string, type: string): Promise<void>
  async findConnections(nodeId: string, depth: number): Promise<Connection[]>
  async extractKnowledge(content: string): Promise<Knowledge>
  async suggestConnections(context: Context): Promise<Suggestion[]>
  async generateSummary(nodes: string[]): Promise<Summary>
}
```

## UI Components

### Context Components

1. **ContextBar** (`src/components/chat/context/ContextBar.tsx`)
```typescript
interface ContextBarProps {
  chatId: string
  suggestions: Suggestion[]
  onEnhance: () => void
}
```

2. **ContextPreview** (`src/components/chat/context/ContextPreview.tsx`)
```typescript
interface ContextPreviewProps {
  context: Context
  similar: SimilarityMatch[]
  onNavigate: (id: string) => void
}
```

3. **ContextTile** (`src/components/chat/context/ContextTile.tsx`)
```typescript
interface ContextTileProps {
  type: ContextType
  data: any
  similarity?: number
}
```

### Enhanced Chat

1. **MessageInput** (`src/components/chat/messages/MessageInput.tsx`)
```typescript
interface MessageInputProps {
  chatId: string
  onSend: (content: string) => void
  onAttach: (files: File[]) => void
  suggestions: Suggestion[]
}
```

2. **MessageBubble** (`src/components/chat/messages/MessageBubble.tsx`)
```typescript
interface MessageBubbleProps {
  message: Message
  context?: MessageContext
  references?: Reference[]
  onReferenceClick: (ref: Reference) => void
}
```

3. **ReferencePanel** (`src/components/chat/references/ReferencePanel.tsx`)
```typescript
interface ReferencePanelProps {
  references: Reference[]
  onSelect: (ref: Reference) => void
  className?: string
}
```

### Knowledge UI

1. **GraphView** (`src/components/knowledge/GraphView.tsx`)
```typescript
interface GraphViewProps {
  nodes: Node[]
  edges: Edge[]
  onNodeSelect: (id: string) => void
  onEdgeSelect: (id: string) => void
}
```

2. **ConnectionList** (`src/components/knowledge/ConnectionList.tsx`)
```typescript
interface ConnectionListProps {
  connections: Connection[]
  onNavigate: (id: string) => void
}
```

## Data Layer

### Database Schema

1. **Contexts Table**
```sql
create table public.contexts (
  id uuid primary key default uuid_generate_v4(),
  type text not null,
  content jsonb not null,
  metadata jsonb,
  embedding vector(1536),
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);
```

2. **Message Contexts Table**
```sql
create table public.message_contexts (
  message_id uuid references public.messages(id),
  context_id uuid references public.contexts(id),
  similarity float,
  metadata jsonb,
  created_at timestamptz default now(),
  primary key (message_id, context_id)
);
```

3. **Context Relationships Table**
```sql
create table public.context_relationships (
  from_id uuid references public.contexts(id),
  to_id uuid references public.contexts(id),
  type text not null,
  metadata jsonb,
  created_at timestamptz default now(),
  primary key (from_id, to_id, type)
);
```

### Edge Functions

1. **Context Detection** (`functions/detect-context/index.ts`)
```typescript
async function detectContext(req: Request) {
  const { content, messageContext } = await req.json()
  const analysis = await contextEngine.detectContext(content, messageContext)
  return new Response(JSON.stringify(analysis))
}
```

2. **Embedding Generation** (`functions/generate-embedding/index.ts`)
```typescript
async function generateEmbedding(req: Request) {
  const { text } = await req.json()
  const embedding = await embeddingService.generateEmbedding(text)
  return new Response(JSON.stringify({ embedding }))
}
```

3. **Knowledge Extraction** (`functions/extract-knowledge/index.ts`)
```typescript
async function extractKnowledge(req: Request) {
  const { content } = await req.json()
  const knowledge = await knowledgeService.extractKnowledge(content)
  return new Response(JSON.stringify(knowledge))
}
```

## Integration Flow

### Message Creation
```typescript
async function createMessage(content: string, chatId: string) {
  // 1. Process message
  const result = await processMessage(content, {
    recentMessages: await getRecentMessages(chatId),
    threadContext: await getThreadContext(chatId)
  })

  // 2. Store message
  const messageId = await storeMessage({
    content,
    chatId,
    embedding: result.embedding
  })

  // 3. Create context links
  await createContextLinks(messageId, result.analysis.references)

  // 4. Update knowledge graph
  await updateKnowledgeGraph(messageId, result.knowledge)

  return {
    messageId,
    suggestions: result.suggestions
  }
}
```

### Context Management
```typescript
async function manageContext(chatId: string) {
  // 1. Get current context
  const context = await getContext(chatId)

  // 2. Find connections
  const connections = await findConnections(context)

  // 3. Generate suggestions
  const suggestions = await generateSuggestions(context)

  // 4. Update UI
  updateContextBar(suggestions)
  updateReferencePanel(connections)
}
```

### Search & Discovery
```typescript
async function searchContent(query: string, options: SearchOptions) {
  // 1. Generate embedding
  const embedding = await generateEmbedding(query)

  // 2. Find similar content
  const similar = await findSimilarContent(embedding, options)

  // 3. Extract context
  const context = await extractContext(similar)

  // 4. Generate preview
  return generatePreview(context)
}
```

## Implementation Phases

### Phase 1: Foundation (Current)
- Basic context detection
- Embedding pipeline setup
- Initial UI components
- Message-level features

### Phase 2: Intelligence
- Enhanced context detection
- Knowledge graph integration
- Smart suggestions
- Thread merging

### Phase 3: Ambient Features
- Real-time enhancements
- Predictive suggestions
- Advanced visualization
- Context sharing

## Next Steps

1. Core Context System
   - Implement ContextEngine
   - Set up embedding pipeline
   - Create detection system

2. UI Development
   - Build context components
   - Enhance message input
   - Create knowledge views

3. Data Integration
   - Set up database schema
   - Implement edge functions
   - Create service layer

4. Testing & Optimization
   - End-to-end testing
   - Performance tuning
   - User feedback loop 

## Core AI Features

### PlusMenu Features
```typescript
interface PlusMenuFeatures {
  // Voice Messages
  voice: {
    recording: VoiceRecorder
    transcription: TranscriptionService
    playback: AudioPlayer
    enhancement: AudioEnhancer
  }

  // Smart References
  references: {
    detection: ReferenceDetector
    preview: PreviewGenerator
    linking: ReferenceLinking
    suggestions: SuggestionEngine
  }

  // Thread Intelligence
  thread: {
    context: ThreadContext
    relationships: ThreadRelationships
    suggestions: ThreadSuggestions
    organization: ThreadOrganizer
  }
}
```

### ChatMenu Features
```typescript
interface ChatMenuFeatures {
  // Share Context
  share: {
    contextDetection: ContextDetector
    privacyFilter: PrivacyManager
    preview: ContextPreview
    export: ContextExporter
  }

  // Merge Threads
  merge: {
    candidates: ThreadMatcher
    conflict: ConflictResolver
    timeline: TimelineManager
    unification: ThreadUnifier
  }

  // Enhance Context
  enhance: {
    analysis: ContextAnalyzer
    suggestions: EnhancementEngine
    knowledge: KnowledgeGraph
    visualization: ContextVisualizer
  }
}
```

## Implementation Status

### 1. Core Services (🔄 In Progress)
```typescript
// Currently implementing
interface CoreServices {
  // Message Processing
  messageProcessor: {
    parse: MessageParser       // ✅ Done
    embed: MessageEmbedder    // 🔄 In Progress
    analyze: MessageAnalyzer  // ⏳ Pending
  }

  // Context Engine
  contextEngine: {
    detect: ContextDetector   // 🔄 In Progress
    relate: ContextLinker     // ⏳ Pending
    enhance: ContextEnhancer  // ⏳ Pending
  }

  // Knowledge System
  knowledgeSystem: {
    graph: KnowledgeGraph    // ⏳ Pending
    search: SemanticSearch   // 🔄 In Progress
    suggest: SuggestionEngine // ⏳ Pending
  }
}
```

### 2. UI Components (⏳ Pending)
```typescript
// Next to implement
interface UIComponents {
  // Message Components
  messages: {
    input: MessageInput       // Enhanced with AI
    bubble: MessageBubble    // With references
    list: MessageList        // With context
  }

  // Menu Components
  menus: {
    plus: PlusMenu          // AI feature triggers
    chat: ChatMenu         // Context operations
    context: ContextBar    // Context display
  }

  // Preview Components
  previews: {
    reference: ReferencePreview
    context: ContextPreview
    thread: ThreadPreview
  }
}
```

## Implementation Priorities

### Phase 1: Core Message Features
1. **Message Processing** 🔄
   - [x] Basic message handling
   - [x] Real-time validation
   - [ ] Embedding generation
   - [ ] Context detection

2. **PlusMenu Features** ⏳
   - [ ] Voice message recording
   - [ ] Reference detection
   - [ ] Thread intelligence
   - [ ] Preview generation

3. **UI Components** ⏳
   - [ ] Enhanced MessageInput
   - [ ] Reference previews
   - [ ] Context indicators
   - [ ] Feature menus

### Phase 2: Context Features
1. **Context Engine** ⏳
   - [ ] Context detection
   - [ ] Relationship mapping
   - [ ] Enhancement suggestions
   - [ ] Knowledge graph

2. **ChatMenu Features** ⏳
   - [ ] Context sharing
   - [ ] Thread merging
   - [ ] Context enhancement
   - [ ] Visualization

3. **UI Integration** ⏳
   - [ ] Context bar
   - [ ] Thread visualization
   - [ ] Knowledge explorer
   - [ ] Enhancement UI

## Next Steps

### Immediate Tasks
1. **Complete Core Services**
   - Finish embedding pipeline
   - Implement context detection
   - Set up knowledge system

2. **Build UI Components**
   - Create PlusMenu
   - Implement MessageInput
   - Add preview components

3. **Add Feature Logic**
   - Voice message handling
   - Reference detection
   - Thread intelligence

### Technical Debt
1. **Performance**
   - Optimize embedding generation
   - Cache common operations
   - Lazy load components

2. **Testing**
   - Unit tests for services
   - Integration tests for features
   - E2E tests for flows

3. **Documentation**
   - API documentation
   - Component storybook
   - Usage examples

## Development Guidelines

### Feature Implementation
1. **Start with Core Logic**
   - Implement service
   - Add state management
   - Create hooks

2. **Add UI Components**
   - Build base component
   - Add interactions
   - Integrate with services

3. **Polish & Test**
   - Add loading states
   - Handle errors
   - Write tests

### Code Organization
```typescript
src/
├── components/
│   ├── chat/
│   │   ├── PlusMenu.tsx       // AI feature triggers
│   │   ├── ChatMenu.tsx      // Context operations
│   │   └── ContextBar.tsx    // Context display
│   └── messages/
│       ├── MessageInput.tsx   // Enhanced input
│       └── MessageBubble.tsx // With references
├── lib/
│   ├── ai/
│   │   ├── context.ts        // Context engine
│   │   ├── knowledge.ts      // Knowledge system
│   │   └── embedding.ts      // Embedding service
│   └── services/
│       ├── voice.ts          // Voice processing
│       ├── reference.ts      // Reference detection
│   └── thread.ts         // Thread intelligence
└── hooks/
    ├── useAI.ts             // AI feature hooks
    ├── useContext.ts        // Context hooks
    └── useVoice.ts         // Voice hooks
```

### State Management
```typescript
interface AIState {
  // Feature states
  features: {
    voice: VoiceState
    reference: ReferenceState
    thread: ThreadState
  }

  // Context state
  context: {
    current: Context
    related: Relationship[]
    suggestions: Suggestion[]
  }

  // UI state
  ui: {
    loading: LoadingState
    previews: PreviewState
    menus: MenuState
  }
} 
```

# Web Implementation Status & Tracking

## Overview
This document serves as the central work tracker for the enso web implementation. For detailed information, see:
- Architecture: [@ai_architecture.md](../../architecture/ai_architecture.md)
- AI Features: [@ai_features.md](../ai_features.md)
- User Stories: [@ai_stories.md](../../features/ai_stories.md)
- Technical Flow: [@ai_flow.md](../../architecture/ai_flow.md)

## Current Status

### Core Infrastructure
- **Project Setup** ✅
  - Next.js 13 App Router
  - Tailwind CSS
  - Supabase Integration
  - Redux + RTK Query

- **Authentication** ✅
  - Login/Signup Flow
  - Session Management
  - Protected Routes
  - Middleware

### AI Features Implementation

#### Message Intelligence (🔄 In Progress)
See [@ai_features.md](../ai_features.md) for detailed specs
- **Embedding Pipeline** 🔄
  ```typescript
  // lib/ai/embeddings.ts
  - [x] Basic embedding generation
  - [ ] Caching layer
  - [ ] Similarity search
  ```

- **Context Engine** 🔄
  ```typescript
  // lib/ai/context.ts
  - [x] Basic context detection
  - [ ] Context relationships
  - [ ] Knowledge graph
  ```

- **Reference System** ⏳
  ```typescript
  // lib/ai/references.ts
  - [ ] Detection service
  - [ ] Preview generation
  - [ ] Link management
  ```

#### UI Components

- **PlusMenu** 🔄
  ```typescript
  // components/chat/messages/PlusMenu.tsx
  - [x] Base component
  - [ ] Voice messages
  - [ ] Smart references
  - [ ] Thread intelligence
  ```

- **ChatMenu** 🔄
  ```typescript
  // components/chat/ChatMenu.tsx
  - [x] Base component
  - [ ] Context sharing
  - [ ] Thread merging
  - [ ] Context enhancement
  ```

- **MessageInput** 🔄
  ```typescript
  // components/chat/messages/MessageInput.tsx
  - [x] Base functionality
  - [ ] AI suggestions
  - [ ] Reference detection
  - [ ] Context awareness
  ```

### Database Schema (🔄 In Progress)
See [@ai_flow.md](../../architecture/ai_flow.md) for detailed data flow
```sql
-- Status of required tables
- [x] messages
- [x] chats
- [ ] embeddings
- [ ] references
- [ ] contexts
```

### Edge Functions (⏳ Pending)
```typescript
// Required functions
- [ ] generate-embedding
- [ ] detect-references
- [ ] analyze-context
- [ ] enhance-message
```

## Implementation Priorities

### Week of [Current Date]

1. **Embedding Pipeline**
   - [ ] Complete `generateEmbedding` implementation
   - [ ] Add Redis caching layer
   - [ ] Implement similarity search
   - [ ] Add edge function

2. **Reference System**
   - [ ] Implement detection service
   - [ ] Create preview components
   - [ ] Add UI in PlusMenu
   - [ ] Set up edge function

3. **Context Engine**
   - [ ] Finish context detection
   - [ ] Add relationship mapping
   - [ ] Create visualization components
   - [ ] Implement edge function

### Next Week

1. **Message Enhancement**
   - [ ] Smart suggestions
   - [ ] Context awareness
   - [ ] Thread intelligence

2. **UI Polish**
   - [ ] Loading states
   - [ ] Error handling
   - [ ] Animations
   - [ ] Keyboard shortcuts

## Testing Strategy

### Unit Tests
```typescript
// Priority order
1. AI Services
   - [ ] Embedding generation
   - [ ] Context detection
   - [ ] Reference handling

2. UI Components
   - [ ] PlusMenu features
   - [ ] ChatMenu operations
   - [ ] MessageInput enhancements
```

### Integration Tests
```typescript
// Key flows to test
1. Message Flow
   - [ ] Embedding generation
   - [ ] Context detection
   - [ ] Reference handling

2. Context Flow
   - [ ] Context sharing
   - [ ] Thread merging
   - [ ] Enhancement
```

### E2E Tests
```typescript
// Complete user flows
1. Chat Experience
   - [ ] Message sending with AI
   - [ ] Reference handling
   - [ ] Context operations

2. Feature Usage
   - [ ] Voice messages
   - [ ] Smart references
   - [ ] Thread management
```

## Development Guidelines

### Code Organization
```typescript
src/
├── components/          // UI Components
│   ├── chat/           // Chat interface
│   └── ui/             // Base components
├── lib/                // Core functionality
│   ├── ai/             // AI services
│   └── supabase/       // Database
└── hooks/              // Custom hooks
```

### State Management
```typescript
// RTK Query endpoints needed
- [ ] embeddings
- [ ] references
- [ ] contexts
- [ ] suggestions
```

### Performance Optimization
```typescript
// Key areas
- [ ] Embedding caching
- [ ] Context prefetching
- [ ] Component lazy loading
- [ ] API response caching
```

## Next Steps

See [@ai_features.md](../ai_features.md) for detailed feature specs and [@ai_flow.md](../../architecture/ai_flow.md) for technical flows.

1. **Complete Core Services**
   - Finish embedding pipeline
   - Implement reference system
   - Set up context engine

2. **Enhance UI Components**
   - Add AI features to PlusMenu
   - Implement context operations in ChatMenu
   - Enhance MessageInput with AI capabilities

3. **Polish & Launch**
   - Add loading states
   - Implement error handling
   - Add animations
   - Test all flows 
