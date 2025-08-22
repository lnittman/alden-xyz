# @repo/collaboration Package Context

## Development Standards

### Package Context
This package provides real-time collaboration features for the Squish ecosystem, including presence indicators, cursor tracking, shared state synchronization, and WebSocket utilities. It integrates with LiveBlocks and Pusher for real-time communication.

### Technology Stack
- **LiveBlocks**: Real-time collaboration platform
- **Pusher**: WebSocket service for presence and events
- **React**: 19+ compatibility
- **TypeScript**: 5.7+ strict configuration

### Key Dependencies
```json
{
  "dependencies": {
    "@liveblocks/client": "^2.10.3",
    "@liveblocks/react": "^2.10.3",
    "pusher-js": "^8.4.0-rc2",
    "pusher": "^5.2.0",
    "react": "^19.1.0"
  },
  "devDependencies": {
    "@repo/typescript-config": "workspace:*"
  }
}
```

## Package Structure

### Directory Layout
```
src/
├── index.ts              # Main package exports
├── liveblocks/           # LiveBlocks integration
│   ├── client.ts        # LiveBlocks client setup
│   ├── hooks.ts         # LiveBlocks React hooks
│   ├── presence.ts      # Presence indicators
│   └── index.ts         # LiveBlocks exports
├── pusher/               # Pusher WebSocket integration
│   ├── client.ts        # Pusher client setup
│   ├── channels.ts      # Channel management
│   ├── events.ts        # Event handling
│   └── index.ts         # Pusher exports
├── hooks/                # React hooks for collaboration
│   ├── usePresence.ts   # User presence hook
│   ├── useCursors.ts    # Cursor tracking hook
│   ├── useLiveState.ts  # Shared state hook
│   ├── useUndoRedo.ts   # Undo/redo functionality
│   └── index.ts         # Hook exports
├── types/                # TypeScript type definitions
│   ├── presence.ts      # Presence types
│   ├── cursor.ts        # Cursor tracking types
│   ├── events.ts        # Event types
│   └── index.ts         # Type exports
├── utils/                # Utility functions
│   ├── presence-utils.ts # Presence utilities
│   ├── cursor-utils.ts  # Cursor utilities
│   ├── event-bus.ts     # Event bus for real-time events
│   └── index.ts         # Utility exports
└── config/               # Configuration constants
    ├── constants.ts     # Collaboration constants
    └── index.ts         # Config exports
```

## LiveBlocks Integration

### Client Setup
```typescript
// src/liveblocks/client.ts
import { createClient } from '@liveblocks/client';

export const liveblocksClient = createClient({
  throttle: 16,
  authEndpoint: '/api/liveblocks-auth',
});

// Presence provider setup
export function createPresenceProvider() {
  return {
    client: liveblocksClient,
    resolveUsers: async ({ userIds }) => {
      // Resolve user information from IDs
      const users = await fetchUsers(userIds);
      return users.map(user => ({
        id: user.id,
        name: user.name,
        avatar: user.avatar,
      }));
    },
    resolveMentionSuggestions: async ({ text }) => {
      // Resolve mention suggestions
      const users = await searchUsers(text);
      return users.map(user => ({ id: user.id, name: user.name }));
    },
  };
}
```

### React Hooks
```typescript
// src/liveblocks/hooks.ts
import { useRoom, useSelf, useOthers } from '@liveblocks/react';

export function useLiveRoom(roomId: string) {
  const room = useRoom(roomId);
  
  return {
    room,
    connectionState: room.getConnectionState(),
    reconnect: room.reconnect.bind(room),
    disconnect: room.disconnect.bind(room),
  };
}

export function useCollaborativePresence() {
  const self = useSelf();
  const others = useOthers();
  
  return {
    self: self ? {
      id: self.id,
      info: self.info,
      isOnline: self.presence?.isOnline ?? true,
    } : null,
    others: others.map(other => ({
      id: other.id,
      info: other.info,
      isOnline: other.presence?.isOnline ?? true,
    })),
  };
}

export function useCollaborativeCursors() {
  const others = useOthers();
  
  return others
    .filter(other => other.presence?.cursor)
    .map(other => ({
      userId: other.id,
      user: other.info,
      cursor: other.presence.cursor,
    }));
}
```

## Pusher Integration

### Pusher Client Setup
```typescript
// src/pusher/client.ts
import Pusher from 'pusher-js';

export function createPusherClient() {
  return new Pusher(process.env.NEXT_PUBLIC_PUSHER_KEY!, {
    cluster: process.env.NEXT_PUBLIC_PUSHER_CLUSTER!,
    forceTLS: true,
    authEndpoint: '/api/pusher/auth',
    auth: {
      headers: {
        // Add auth headers if needed
      },
    },
  });
}

// Pusher channels management
export class PusherChannelManager {
  private pusher: Pusher;
  private channels: Map<string, any> = new Map();
  
  constructor(pusher: Pusher) {
    this.pusher = pusher;
  }
  
  subscribe(channelName: string, eventHandlers: Record<string, (data: any) => void>) {
    if (this.channels.has(channelName)) {
      return this.channels.get(channelName)!;\n    }
    
    const channel = this.pusher.subscribe(channelName);
    
    Object.entries(eventHandlers).forEach(([event, handler]) => {
      channel.bind(event, handler);
    });
    
    this.channels.set(channelName, channel);
    return channel;
  }
  
  unsubscribe(channelName: string) {
    const channel = this.channels.get(channelName);
    if (channel) {
      channel.unsubscribe();
      this.channels.delete(channelName);
    }
  }
  
  disconnect() {
    this.pusher.disconnect();
    this.channels.clear();
  }
}
```

### Presence Tracking
```typescript
// src/pusher/presence.ts
export interface UserPresence {
  userId: string;
  boardId: string;
  cursor?: { x: number; y: number };
  selection?: string;
  isTyping?: boolean;
  lastSeen: Date;
}

export class PresenceTracker {
  private channel: any;
  private userId: string;
  private boardId: string;
  
  constructor(channel: any, userId: string, boardId: string) {
    this.channel = channel;
    this.userId = userId;
    this.boardId = boardId;
  }
  
  updatePresence(presence: Partial<UserPresence>) {
    this.channel.trigger('client-presence-update', {
      userId: this.userId,
      boardId: this.boardId,
      ...presence,
      timestamp: Date.now(),
    });
  }
  
  subscribeToPresenceUpdates(callback: (presences: UserPresence[]) => void) {
    this.channel.bind('client-presence-update', (data: UserPresence) => {
      // Handle presence updates
      callback([data]);
    });
  }
}
```

## Collaboration Components

### Presence Indicators
```typescript
// Example usage in component
import { useCollaborativePresence } from '@repo/collaboration';

function CollaborativeBoard() {
  const { self, others } = useCollaborativePresence();
  
  return (
    <div className="relative">
      {/* Board content */}
      
      {/* Presence indicators */}
      <div className="absolute top-4 right-4 flex space-x-2">
        {others.map(user => (
          <div
            key={user.id}
            className={`w-8 h-8 rounded-full border-2 ${
              user.isOnline ? 'border-green-500' : 'border-gray-400'
            }`}
            title={user.info.name}
          >
            <img
              src={user.info.avatar}
              alt={user.info.name}
              className="w-full h-full rounded-full object-cover"
            />
          </div>
        ))}
      </div>
    </div>
  );
}
```

### Shared State Management
```typescript
// Using LiveBlocks storage
import { useStorage, useMutation } from '@liveblocks/react';

function CollaborativeList() {
  const list = useStorage(root => root.items);
  const addItem = useMutation(({ storage }, text) => {
    storage.get('items').push({
      id: Date.now().toString(),
      text,
      createdAt: new Date().toISOString(),
    });
  }, []);
  
  return (
    <div>
      {list.map(item => (
        <div key={item.id}>{item.text}</div>
      ))}
      <button onClick={() => addItem('New item')}>
        Add Item
      </button>
    </div>
  );
}
```

## Common Tasks

### Setting Up a New Collaborative Feature
1. Create LiveBlocks room for the feature
2. Set up presence tracking
3. Add shared state if needed
4. Implement real-time updates
5. Add conflict resolution

### Adding Presence to a Component
1. Use useCollaborativePresence hook
2. Render presence indicators
3. Update presence on user actions
4. Handle presence events

### Creating Custom Events
1. Define event types and handlers
2. Use Pusher for broadcasting
3. Handle events on all clients
4. Update UI accordingly

## Files to Know
- `src/liveblocks/client.ts` - LiveBlocks client setup
- `src/pusher/client.ts` - Pusher client setup
- `src/hooks/usePresence.ts` - Presence tracking hook
- `src/utils/event-bus.ts` - Event bus utilities

## Quality Checklist

Before committing changes to this package:
- [ ] Real-time features tested with multiple users
- [ ] Presence indicators update correctly
- [ ] Shared state syncs properly
- [ ] WebSocket reconnection handled
- [ ] Performance optimized for real-time updates
- [ ] Error handling for connection issues
- [ ] No memory leaks from event listeners
- [ ] TypeScript types complete
- [ ] Documentation updated

---

*This context ensures Claude Code understands the collaboration package structure and patterns when working on real-time features.*