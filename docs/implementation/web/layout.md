# Directory Layout

## Core Structure
```
enso-web/
├── src/
│   ├── app/                    # Next.js App Router pages
│   │   ├── (auth)/            # Authentication routes
│   │   ├── (app)/             # Protected app routes
│   │   │   └── chat/          # Chat interface
│   │   ├── about/             # Marketing pages
│   │   └── features/          # Feature showcase
│   ├── components/
│   │   ├── ui/               # Base UI components
│   │   │   ├── avatar-button.tsx
│   │   │   ├── button.tsx
│   │   │   ├── card.tsx
│   │   │   ├── dialog.tsx
│   │   │   ├── glow-button.tsx
│   │   │   ├── header.tsx
│   │   │   ├── logo.tsx
│   │   │   └── ...
│   │   └── chat/             # Chat components
│   │       ├── container/    # Layout containers
│   │       │   ├── ChatContainer.tsx
│   │       │   └── ChatLayout.tsx
│   │       ├── context/      # Context-aware components
│   │       │   ├── ContextBar.tsx        # Context tags above input
│   │       │   ├── ContextPreview.tsx    # Preview for context items
│   │       │   ├── ContextSuggestions.tsx # Live suggestions
│   │       │   └── ContextTile.tsx       # Individual context items
│   │       ├── messages/     # Message components
│   │       │   ├── MessageBubble.tsx
│   │       │   ├── MessageInput.tsx      # Enhanced with context
│   │       │   ├── MessageList.tsx
│   │       │   └── MessageActions.tsx
│   │       ├── search/       # Search components
│   │       │   ├── SearchBar.tsx         # Semantic search
│   │       │   ├── SearchResults.tsx
│   │       │   └── SearchSuggestions.tsx
│   │       └── sidebar/      # Sidebar components
│   │           ├── ChatList.tsx
│   │           ├── ChatFilters.tsx
│   │           └── PinnedChats.tsx
│   ├── hooks/               # Custom hooks
│   │   ├── useContext.ts    # Context management
│   │   ├── useSearch.ts     # Semantic search
│   │   └── useReferences.ts # Reference handling
│   └── lib/                # Core utilities
│       ├── ai/             # AI services
│       │   ├── context.ts   # Context detection
│       │   ├── search.ts    # Semantic search
│       │   └── suggest.ts   # Smart suggestions
│       └── utils/          # Utilities
└── docs/                   # Documentation
    ├── ai.md              # AI features
    ├── context.md         # Project context
    ├── implementation.md  # Implementation details
    └── manifesto.md       # Vision and philosophy
```

## Key Component Updates Needed

### Context System
- `ContextBar`: Scrollable row of context tags above input
- `ContextPreview`: Rich preview of context items
- `ContextSuggestions`: Live suggestions as you type
- `ContextTile`: Individual context items in messages

### Enhanced Message Input
- Integrate context detection
- Live suggestions
- Reference linking
- Smart completions

### Semantic Search
- Global search with semantic understanding
- Context-aware results
- Live suggestions

## Implementation Priority

1. Context Components
   - Build base context system
   - Implement context detection
   - Add visual components

2. Enhanced Input
   - Upgrade MessageInput
   - Add context integration
   - Implement suggestions

3. Search System
   - Build semantic search
   - Add live results
   - Integrate with context

4. Polish & Integration
   - Unify design system
   - Add animations
   - Optimize performance

## Getting the Layout
To get an up-to-date view of the project structure, run:

```bash
tree . -L 3 -I 'node_modules|.next|.git'
```

## Current Layout (as of Feb 3, 2024)

```
.
├── docs/                          # Project documentation
│   ├── context.md                 # Project overview and guidelines
│   ├── dir_layout.md             # This file - directory structure
│   ├── implementation.md         # Implementation details
│   ├── implementation_web.md     # Web-specific implementation
│   ├── manifesto.md             # Project vision and goals
│   └── structure_init.md        # Initial setup documentation
├── enso-supabase/                # Supabase backend
│   ├── functions/               # Edge functions for AI features
│   │   ├── find-references     # Real-time reference detection
│   │   ├── generate-embedding  # Text embedding generation
│   │   ├── generate-response   # AI response generation
│   │   ├── generate-tags      # Automatic tag generation
│   │   ├── get-reference-suggestions # Reference suggestions
│   │   └── translate          # Real-time translation
│   ├── migrations/            # Database migrations
│   │   ├── 20240202_init.sql
│   │   ├── 20240202_init_fixed.sql
│   │   ├── 20240203_fix_chat_policies.sql
│   │   └── 20240203_fix_profile_policy.sql
│   └── scripts/              # Utility scripts
│       └── test-functions.js # Edge function testing
└── enso-web/                    # Next.js web application
    ├── public/                 # Static assets
    ├── src/
    │   ├── app/               # Next.js app router pages
    │   ├── components/        # React components
    │   ├── hooks/            # Custom React hooks
    │   ├── lib/              # Core utilities
    │   ├── middleware.ts     # Next.js middleware
    │   ├── styles/           # Global styles
    │   └── types/            # TypeScript types
    └── tailwind.config.ts    # Tailwind configuration
```

## Key Directories for AI Features

### Web Application (`enso-web/`)
- `src/components/chat/`: Chat interface with AI-powered features
  - Message components with real-time reference detection
  - Smart tag input with suggestions
  - Thread management UI
- `src/lib/ai/`: AI-related utilities and hooks
  - Embedding generation and caching
  - Reference detection and linking
  - Translation management
- `src/hooks/`: Custom hooks for AI features
  - `useReferences`: Real-time reference detection
  - `useTranslation`: Message translation
  - `useThreadSuggestions`: Smart thread suggestions

### Supabase Backend (`enso-supabase/`)
- `functions/`: Edge functions for AI processing
  - `find-references/`: Real-time reference detection in messages
  - `generate-embedding/`: Text embedding generation using Vertex AI
  - `generate-response/`: AI response generation with DeepSeek
  - `generate-tags/`: Automatic tag generation for messages
  - `get-reference-suggestions/`: Context-aware reference suggestions
  - `translate/`: Real-time message translation
- `migrations/`: Database schema for AI features
  - Message embeddings storage
  - Reference and tag relationships
  - Thread context management

## Documentation (`docs/`)
- `context.md`: Project overview and AI integration guidelines
- `implementation_web.md`: Web-specific AI feature implementation
- `implementation.md`: General implementation details
- `manifesto.md`: Project vision and AI philosophy
- `structure_init.md`: Initial setup and configuration

## Tags for LLM Sessions

When discussing specific parts of the codebase, use these tags:
- `@components` - UI and feature components
- `@pages` - Next.js pages and routes
- `@lib` - Utilities and core functionality
- `@functions` - Supabase edge functions
- `@docs` - Documentation files
- `@ai` - AI-related features and utilities
- `@hooks` - Custom React hooks
- `@types` - TypeScript type definitions 