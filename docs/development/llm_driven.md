# LLM-Driven Development Guidelines

## Design Philosophy

Our development process combines:
1. Co-Star's dramatic minimalism and sophisticated typography
2. Teenage Engineering's utilitarian elegance and focused interactions
3. Rabbit R1's fluid intelligence and contextual awareness
4. Natural language development through chat

## Interaction Patterns

### Quick Actions & Shortcuts
```typescript
interface QuickActions {
  // Message composition shortcuts
  messageShortcuts: {
    ':': 'emoji picker',      // Slack-like emoji picker
    '@': 'user mention',      // User mentions
    '#': 'thread reference',  // Thread references
    '>': 'quote/reply',       // Quote or reply to message
    '/': 'commands',          // Slash commands
    '!': 'file reference'     // File references
  }

  // Global keyboard shortcuts
  globalShortcuts: {
    'cmd+k': 'search',          // Global search
    'cmd+/': 'command palette', // Command palette
    'cmd+.': 'quick settings',  // Quick settings
    'cmd+p': 'plus menu',       // Open plus menu
    'cmd+e': 'emoji picker'     // Global emoji picker
  }

  // Context-aware actions
  contextActions: {
    type: 'message' | 'thread' | 'file' | 'user'
    triggers: string[]
    suggestions: Suggestion[]
    handler: (context: Context) => void
  }
}

interface EmojiPickerContext {
  // Recent and frequently used
  recentEmojis: string[]
  frequentEmojis: string[]
  
  // Smart suggestions
  contextualSuggestions: {
    messageContext?: string    // Based on message content
    threadContext?: string     // Based on thread topic
    userContext?: string      // Based on user preferences
  }
  
  // Custom emoji support
  workspaceEmojis?: {
    name: string
    url: string
    tags: string[]
  }[]
}
```

### Implementation Priority

1. **Core Message Input Enhancements**
   - Implement basic trigger detection (`:`, `@`, `#`, etc.)
   - Add inline suggestion UI
   - Set up keyboard shortcut system
   - Create base suggestion components

2. **Plus Menu & Chat Menu Integration**
   - Enable core menu items
   - Add keyboard shortcuts
   - Implement hover states
   - Add basic animations

3. **Emoji Picker Enhancement**
   - Build base emoji picker
   - Add recent/frequent tracking
   - Implement contextual suggestions
   - Add custom emoji support

4. **Context-Aware Suggestions**
   - Implement suggestion engine
   - Add real-time filtering
   - Create preview components
   - Enable keyboard navigation

### Smart Suggestions

```typescript
interface SuggestionEngine {
  // Content analysis
  analyzeContext(content: string): Promise<{
    intent: string
    entities: string[]
    sentiment: string
    suggestions: Suggestion[]
  }>

  // Emoji suggestions
  suggestEmojis(context: {
    message?: string
    thread?: string
    recent?: string[]
  }): Promise<{
    contextual: string[]
    frequent: string[]
    trending: string[]
  }>

  // Command suggestions
  suggestCommands(input: string): Promise<{
    exact: Command[]
    fuzzy: Command[]
    contextual: Command[]
  }>
}
```

## Chat-Based Development

### Natural Language Coding
```typescript
interface ChatDevelopment {
  // Development modes
  modes: {
    create: 'natural language project creation'
    modify: 'conversational code changes'
    debug: 'interactive debugging'
    explain: 'code understanding'
  }

  // Context awareness
  context: {
    codebase: string[]      // Referenced repositories
    dependencies: string[]   // Project dependencies
    history: CodeAction[]   // Previous code changes
    environment: string     // Runtime context
  }

  // Real-time feedback
  feedback: {
    preview: 'instant'     // Show changes immediately
    validation: 'real-time' // Syntax and logic checks
    suggestions: 'inline'   // Contextual help
    execution: 'immediate'  // Run code snippets
  }
}
```

### Documentation Organization
```typescript
interface DocumentStyle {
  // Co-Star inspired typography
  typography: {
    scale: 'dramatic'     // Dramatic size contrasts
    spacing: 'expansive'  // Generous whitespace
    weight: 'considered'  // Thoughtful weight variation
  }
  
  // TE-inspired layout
  layout: {
    grid: 'utilitarian'   // Clear, functional grid
    rhythm: 'mechanical'  // Precise spacing rhythm
    density: 'focused'    // High information density when needed
  }
  
  // R1-inspired interaction
  interaction: {
    intelligence: 'fluid' // Smooth, contextual transitions
    context: 'ambient'    // Background awareness
    feedback: 'immediate' // Quick, clear responses
  }
}
```

### Development Flow
```typescript
interface DevelopmentFlow {
  // Natural language inputs
  inputs: {
    type: 'text' | 'voice'
    mode: 'conversation' | 'command'
    context: 'project' | 'file' | 'function'
  }

  // Intelligent processing
  processing: {
    parse: 'intent detection'
    plan: 'action planning'
    execute: 'code generation'
    validate: 'testing & validation'
  }

  // Real-time output
  output: {
    code: 'inline preview'
    docs: 'auto-generated'
    tests: 'continuous'
    deployment: 'automatic'
  }
}
```

## Best Practices

### For Development
1. **Clear Intent**
   - Use natural language
   - Specify context clearly
   - Describe desired outcome
   - Provide relevant examples

2. **Context Management**
   - Reference specific files
   - Mention dependencies
   - Include error messages
   - Share relevant logs

3. **Iterative Refinement**
   - Start with high-level goals
   - Refine through conversation
   - Test incrementally
   - Document learnings

### For Documentation
1. **Clear Structure**
   - Co-Star's dramatic spacing
   - TE's precise organization
   - R1's contextual grouping

2. **Rich Metadata**
   - Sophisticated type information
   - Clear relationship mapping
   - Contextual usage patterns

3. **Semantic Structure**
   - Dramatic typography
   - Utilitarian organization
   - Fluid context relationships

## Implementation Examples

### Project Creation
```typescript
// User: "Create a new Next.js app with Tailwind and TypeScript"

async function handleProjectCreation(message: string) {
  // 1. Parse intent
  const intent = await parseIntent(message)
  
  // 2. Generate project structure
  const structure = await generateProjectStructure(intent)
  
  // 3. Create files
  const files = await generateFiles(structure)
  
  // 4. Set up dependencies
  const deps = await setupDependencies(structure)
  
  // 5. Show preview
  return {
    files,
    deps,
    preview: generatePreview(files)
  }
}
```

### Code Modification
```typescript
// User: "Add dark mode support to the app"

async function handleCodeModification(message: string) {
  // 1. Understand context
  const context = await extractContext(message)
  
  // 2. Plan changes
  const changes = await planChanges(context)
  
  // 3. Generate modifications
  const modifications = await generateModifications(changes)
  
  // 4. Preview changes
  return {
    modifications,
    preview: generateDiff(modifications)
  }
}
```

## Quality Standards

### Development Quality
- Natural conversation flow
- Clear intent understanding
- Precise code generation
- Thorough validation

### Documentation Quality
- Sophisticated structure
- Clear visual hierarchy
- Rich contextual information
- Practical examples

### User Experience
- Immediate responsiveness
- Dramatic state transitions
- Efficient handling
- Graceful error recovery

## Next Steps

1. Core Implementation
   - [ ] Intent parsing system
   - [ ] Context extraction
   - [ ] Code generation pipeline
   - [ ] Preview system

2. UI Development
   - [ ] Chat interface
   - [ ] Preview panels
   - [ ] Context panels
   - [ ] Navigation system

3. Intelligence Layer
   - [ ] Suggestion system
   - [ ] Validation pipeline
   - [ ] Documentation generator
   - [ ] Test generator

4. Integration
   - [ ] Version control
   - [ ] Package management
   - [ ] Deployment pipeline
   - [ ] Collaboration tools

## Core AI Features

### Feature Implementation Matrix
```typescript
interface CoreFeatures {
  // Core AI features available in both PlusMenu and inline
  features: {
    code: {
      plusMenu: 'code block with syntax highlighting',
      inline: '```language',
      shortcut: 'cmd+shift+c',
      ai: 'code completion, explanation, and refactoring'
    },
    voice: {
      plusMenu: 'record voice message',
      inline: '/voice',
      shortcut: 'cmd+shift+v',
      ai: 'voice-to-text, sentiment analysis, translation'
    },
    thread: {
      plusMenu: 'link thread',
      inline: '#thread-id',
      shortcut: 'cmd+shift+t',
      ai: 'thread summarization and context linking'
    },
    reference: {
      plusMenu: 'add reference',
      inline: '!file-path or >message-id',
      shortcut: 'cmd+shift+r',
      ai: 'semantic search and context retrieval'
    },
    file: {
      plusMenu: 'attach file',
      inline: '!upload',
      shortcut: 'cmd+shift+f',
      ai: 'file analysis, OCR, and content extraction'
    },
    image: {
      plusMenu: 'attach image',
      inline: '!image',
      shortcut: 'cmd+shift+i',
      ai: 'image analysis, generation, and editing'
    }
  }

  // Implementation priority
  priority: [
    'code',      // Code understanding and generation
    'reference', // Knowledge linking
    'thread',    // Context management
    'file',      // File handling
    'image',     // Image processing
    'voice'      // Voice processing
  ]

  // Shared AI context
  aiContext: {
    messageHistory: Message[]
    threadContext: Thread
    userPreferences: UserSettings
    workspaceContext: WorkspaceMetadata
  }
}

interface MessageInput {
  // Trigger detection for inline features
  triggers: {
    code: ['```', '`'],
    voice: ['/voice'],
    thread: ['#'],
    reference: ['!', '>'],
    file: ['!upload'],
    image: ['!image']
  }

  // Shortcut handling
  shortcuts: {
    'cmd+shift+c': 'code',
    'cmd+shift+v': 'voice',
    'cmd+shift+t': 'thread',
    'cmd+shift+r': 'reference',
    'cmd+shift+f': 'file',
    'cmd+shift+i': 'image'
  }

  // AI enhancement
  enhancement: {
    type: CoreFeatures['features'][keyof CoreFeatures['features']]
    context: CoreFeatures['aiContext']
    processor: (input: string, context: Context) => Promise<EnhancedOutput>
  }
}
```

### Implementation Flow
1. **Core Components**
   - `PlusMenu.tsx`: Primary interface for feature access
   - `MessageInput.tsx`: Handles inline triggers and shortcuts
   - `AIProcessor.tsx`: Manages AI processing for all features

2. **Feature Integration**
   - Each feature is available through both PlusMenu and inline shortcuts
   - Consistent AI processing regardless of entry point
   - Shared context and enhancement pipeline

3. **Context Management**
   - Unified context tracking across all features
   - Persistent thread and workspace awareness
   - Real-time context updates

4. **AI Enhancement Pipeline**
   - Input preprocessing based on feature type
   - Context-aware processing
   - Real-time enhancement and suggestions
