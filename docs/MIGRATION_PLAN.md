# Alden Migration Plan

## Current State Analysis

### What Exists
- **alden-web**: Single Next.js app with Supabase dependencies
- **Legacy naming**: Package.json still shows "enso-web"
- **AI routes**: Embedded in `/app/api/ai/` directory
- **Auth**: Using Supabase Auth
- **State**: Redux Toolkit for state management
- **Database**: Prisma with Supabase
- **Good UI/UX**: Existing chat components, glass morphism effects

### What's Missing
- **No turborepo structure**: Just a standalone Next.js app
- **No alden-xyz directory**: Need to create proper monorepo
- **No alden-ai**: AI functionality embedded in main app
- **No packages/**: Missing modular architecture
- **Wrong auth**: Using Supabase instead of Clerk

## Migration Steps

### Phase 1: Turborepo Setup (Day 1)
1. **Create alden-xyz turborepo**
   ```bash
   mkdir alden-xyz
   cd alden-xyz
   pnpm init
   ```

2. **Set up workspace structure**
   ```yaml
   # pnpm-workspace.yaml
   packages:
     - 'apps/*'
     - 'packages/*'
   ```

3. **Move alden-web to apps/app**
   ```bash
   mv ../alden-web apps/app
   ```

4. **Update naming from "enso" to "alden"**
   - Update package.json names
   - Search/replace any "enso" references

### Phase 2: Extract AI Functionality (Day 1-2)
1. **Create alden-ai**
   ```bash
   cd .. # Back to alden root
   pnpm create mastra@latest alden-ai
   ```

2. **Migrate AI logic from app/api/ai/**
   - Extract to agents:
     - Message analysis agent
     - Response generation agent
     - Translation agent
     - Tag generation agent
   - Create workflows for multi-step processes
   - Set up tools for embeddings, file processing

3. **Remove AI routes from apps/app**

### Phase 3: Create Core Packages (Day 2-3)

#### packages/mastra
```typescript
// Same pattern as other projects
import { MastraClient } from '@mastra/client-js'

export const mastra = new MastraClient({
  baseUrl: process.env.NEXT_PUBLIC_AI_URL!,
  headers: { 'x-mastra-key': process.env.MASTRA_KEY! }
})

// Export everything
export const agents = mastra.agents
export const workflows = mastra.workflows
export const tools = mastra.tools
export const memory = mastra.memory
export const vectors = mastra.vectors
```

#### packages/api
Migrate services from lib/services/ and add Mastra integration:
- **chatService.ts**: Chat CRUD with AI enhancements
- **messageService.ts**: Message handling with AI processing
- **referenceService.ts**: Context/reference management
- **userService.ts**: User management

#### packages/database
- Move Prisma schema
- Remove Supabase-specific configurations
- Add proper migrations

#### packages/ui
Extract reusable components:
- All glass morphism components
- Command menu
- Chat UI components
- Mobile-responsive elements

### Phase 4: Authentication Migration (Day 3-4)
1. **Remove Supabase Auth**
   - Remove all @supabase packages
   - Delete supabase client files

2. **Implement Clerk**
   - Add Clerk dependencies
   - Set up middleware
   - Update all auth checks
   - Migrate user components

3. **Update Redux slices**
   - Remove Supabase references
   - Add Clerk user management

### Phase 5: State Management Update (Day 4)
1. **Add Jotai for UI state**
   - Modal/sheet management
   - Menu states
   - UI preferences

2. **Keep Redux for complex state**
   - Chat state
   - Message state
   - But consider migration to Zustand

### Phase 6: API Routes Refactor (Day 5)
1. **Update all routes to use packages/api**
2. **Remove direct Mastra calls**
3. **Implement proper error handling**
4. **Add rate limiting**

### Phase 7: Testing & Cleanup (Day 5-6)
1. **Remove all Supabase code**
2. **Fix TypeScript errors**
3. **Update environment variables**
4. **Test core flows**:
   - Authentication
   - Chat creation
   - Message sending with AI
   - File uploads
   - Real-time features

## Priority Features to Preserve

### Core Chat Features
- **Real-time messaging**: Implement with Pusher/Ably
- **File handling**: Migrate to Vercel Blob or R2
- **Message threading**: Keep existing UI
- **@ mentions**: Preserve functionality
- **Context references**: Key differentiator

### AI Features
- **Smart suggestions**: Context-aware responses
- **Message analysis**: Sentiment, topics
- **Translation**: Multi-language support
- **Embeddings**: For search/similarity

### UI/UX Excellence
- **Glass morphism**: Already implemented well
- **Command palette**: Enhance with cmdk
- **Mobile experience**: Already responsive
- **Keyboard shortcuts**: Leader key system

## Environment Variables

### Remove
```
NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY
SUPABASE_SERVICE_ROLE_KEY
```

### Add
```
# Clerk
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY
CLERK_SECRET_KEY

# Mastra
NEXT_PUBLIC_AI_URL=http://localhost:4111
MASTRA_KEY=your-key

# Database
DATABASE_URL=postgresql://...

# Real-time (choose one)
PUSHER_APP_ID
ABLY_API_KEY

# Storage
BLOB_READ_WRITE_TOKEN
```

## Risk Mitigation

### Data Migration
- Export all data from Supabase before starting
- Set up local PostgreSQL for testing
- Create migration scripts for users, chats, messages

### Feature Parity
- Document all current features before starting
- Create feature tests
- Ensure no functionality is lost

### Rollback Plan
- Keep alden-web operational until migration complete
- Test thoroughly in staging
- Have database backups

## Success Criteria
- [ ] All "enso" references removed
- [ ] Turborepo structure matches other projects
- [ ] AI functionality in standalone service
- [ ] Clerk authentication working
- [ ] No Supabase dependencies
- [ ] All tests passing
- [ ] Performance equal or better
- [ ] Mobile experience preserved

## Timeline Estimate
- **Total**: 5-6 days of focused development
- **Critical Path**: Auth migration (blocks everything else)
- **Parallel Work**: AI extraction can happen alongside package creation

## Next Steps
1. Set up alden-xyz turborepo structure
2. Create alden-ai with Mastra
3. Begin extracting packages
4. Start auth migration in parallel