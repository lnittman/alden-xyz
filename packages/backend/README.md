# @repo/backend

Convex backend for the Alden platform. This package contains all database schema, functions, and real-time subscriptions.

## Setup

1. **Initialize Convex**
```bash
bun run setup
```

2. **Start Development Server**
```bash
bun run dev
```

3. **Deploy to Production**
```bash
bun run deploy
```

## Architecture

### Schema (`convex/schema.ts`)
- **users** - User profiles (integrated with Clerk)
- **chats** - Chat conversations
- **messages** - Chat messages with embeddings
- **boards** - Mood boards/collections
- **assets** - Media files with embeddings
- **presence** - Real-time user presence
- **aiMemory** - AI conversation memory with vector search

### Functions
- **users.ts** - User management
- **boards.ts** - Board CRUD and collaboration
- **assets.ts** - Asset management and storage
- **chats.ts** - Chat management
- **messages.ts** - Real-time messaging
- **presence.ts** - Presence and collaboration
- **aiMemory.ts** - AI memory with semantic search

## Features

### Real-time Subscriptions
Every query automatically subscribes to changes:
```typescript
const boards = useQuery(api.boards.list); // Updates automatically
```

### Vector Search
Native support for semantic search:
```typescript
// Define in schema
.vectorIndex("by_embedding", {
  vectorField: "embedding",
  dimensions: 1408,
})
```

### File Storage
Built-in file uploads:
```typescript
const url = await generateUploadUrl();
// Upload directly to Convex storage
```

### Presence
Real-time collaboration:
```typescript
const presence = useQuery(api.presence.getByLocation, {
  location: "board",
  locationId: boardId,
});
```

## Usage in Apps

### Next.js
```typescript
import { useQuery, useMutation } from "convex/react";
import { api } from "@repo/backend";

function MyComponent() {
  const boards = useQuery(api.boards.list);
  const create = useMutation(api.boards.create);
  
  return (
    <button onClick={() => create({ name: "New Board" })}>
      Create Board
    </button>
  );
}
```

### Swift (iOS/macOS)
```swift
import Convex

let client = ConvexClient(url: "https://your-app.convex.cloud")

// Subscribe to boards
client.subscribe(to: "boards/list") { boards in
  // UI updates automatically
}

// Create board
try await client.mutation("boards/create", args: ["name": "New Board"])
```

## Benefits

- ✅ Real-time by default
- ✅ Type-safe end-to-end
- ✅ No API layer needed
- ✅ Built-in auth with Clerk
- ✅ Automatic optimizations
- ✅ Vector search for AI
- ✅ File storage included
- ✅ WebSocket management
