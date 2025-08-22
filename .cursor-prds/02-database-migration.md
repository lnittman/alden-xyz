# PRD: Database Migration - Supabase to Drizzle ORM

## Executive Summary
Migrate Alden messaging platform from Supabase database to Drizzle ORM with PostgreSQL. This involves creating a complete database schema for chat/messaging functionality, setting up Drizzle ORM, and migrating all database operations.

## Project Context
- **Codebase**: Alden-xyz turborepo monorepo
- **Current Database**: Supabase (PostgreSQL + Realtime)
- **Target Setup**: Drizzle ORM + PostgreSQL (Neon/Supabase Postgres)
- **Affected Services**: All services (webapp, API, AI)
- **Tech Stack**: Drizzle ORM 0.38.2, PostgreSQL, TypeScript

## Database Schema Design

### Core Tables Structure

```
users (Clerk managed, synced locally)
├── chats (group conversations)
├── chat_members (membership)
├── messages (chat messages)
├── message_attachments (files)
├── message_reactions (emoji reactions)
├── message_reads (read receipts)
├── references (shared context)
├── reference_items (individual items)
└── user_presence (online status)
```

## Implementation Requirements

### 1. Package Installation
```bash
# In packages/database
bun add drizzle-orm@latest postgres@latest
bun add -D drizzle-kit@latest @types/pg

# Root level (if needed)
bun add dotenv
```

### 2. Environment Variables
```env
# Database
DATABASE_URL=postgresql://user:password@host:5432/database
DATABASE_POOL_URL=postgresql://user:password@host:5432/database?pgbouncer=true
```

### 3. File Structure

```
packages/database/
├── src/
│   ├── index.ts           # Main exports
│   ├── client.ts          # Database client
│   ├── schema/
│   │   ├── index.ts       # Schema exports
│   │   ├── users.ts       # User tables
│   │   ├── chats.ts       # Chat tables
│   │   ├── messages.ts    # Message tables
│   │   ├── references.ts  # Reference tables
│   │   └── relations.ts   # All relations
│   ├── queries/
│   │   ├── chats.ts       # Chat queries
│   │   ├── messages.ts    # Message queries
│   │   └── users.ts       # User queries
│   └── types.ts           # Type exports
├── drizzle.config.ts       # Drizzle configuration
├── package.json
└── tsconfig.json
```

## Detailed Schema Implementation

### Step 1: Create Database Package Structure

#### packages/database/package.json
```json
{
  "name": "@repo/database",
  "version": "0.0.0",
  "private": true,
  "main": "./src/index.ts",
  "types": "./src/index.ts",
  "scripts": {
    "db:generate": "drizzle-kit generate",
    "db:migrate": "drizzle-kit migrate",
    "db:push": "drizzle-kit push",
    "db:studio": "drizzle-kit studio",
    "db:seed": "tsx src/seed.ts",
    "type-check": "tsc --noEmit"
  },
  "dependencies": {
    "drizzle-orm": "^0.38.2",
    "postgres": "^3.4.5"
  },
  "devDependencies": {
    "@repo/typescript-config": "workspace:*",
    "@types/pg": "^8.11.10",
    "drizzle-kit": "^0.29.2",
    "tsx": "^4.19.2",
    "typescript": "^5.7.3"
  }
}
```

#### packages/database/drizzle.config.ts
```typescript
import { defineConfig } from 'drizzle-kit';

export default defineConfig({
  dialect: 'postgresql',
  schema: './src/schema/index.ts',
  out: './drizzle',
  dbCredentials: {
    url: process.env.DATABASE_URL!,
  },
  verbose: true,
  strict: true,
});
```

### Step 2: Define Database Schema

#### packages/database/src/schema/users.ts
```typescript
import { pgTable, varchar, text, timestamp, boolean, jsonb } from 'drizzle-orm/pg-core';

export const users = pgTable('users', {
  id: varchar('id', { length: 255 }).primaryKey(), // Clerk user ID
  email: varchar('email', { length: 255 }).notNull().unique(),
  name: varchar('name', { length: 255 }),
  firstName: varchar('first_name', { length: 255 }),
  lastName: varchar('last_name', { length: 255 }),
  imageUrl: text('image_url'),
  bio: text('bio'),
  metadata: jsonb('metadata').$type<Record<string, any>>().default({}),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const userPresence = pgTable('user_presence', {
  userId: varchar('user_id', { length: 255 })
    .primaryKey()
    .references(() => users.id, { onDelete: 'cascade' }),
  status: varchar('status', { length: 50 }).$type<'online' | 'away' | 'offline'>().default('offline'),
  lastSeenAt: timestamp('last_seen_at').defaultNow().notNull(),
  activeDevices: jsonb('active_devices').$type<string[]>().default([]),
});
```

#### packages/database/src/schema/chats.ts
```typescript
import { pgTable, serial, varchar, text, timestamp, boolean, integer, jsonb, index, uniqueIndex } from 'drizzle-orm/pg-core';
import { users } from './users';

export const chats = pgTable('chats', {
  id: serial('id').primaryKey(),
  name: varchar('name', { length: 255 }).notNull(),
  description: text('description'),
  type: varchar('type', { length: 50 }).$type<'direct' | 'group' | 'channel'>().default('group'),
  imageUrl: text('image_url'),
  createdBy: varchar('created_by', { length: 255 })
    .notNull()
    .references(() => users.id, { onDelete: 'restrict' }),
  metadata: jsonb('metadata').$type<Record<string, any>>().default({}),
  isArchived: boolean('is_archived').default(false),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
}, (table) => [
  index('chats_created_by_idx').on(table.createdBy),
  index('chats_type_idx').on(table.type),
]);

export const chatMembers = pgTable('chat_members', {
  id: serial('id').primaryKey(),
  chatId: integer('chat_id')
    .notNull()
    .references(() => chats.id, { onDelete: 'cascade' }),
  userId: varchar('user_id', { length: 255 })
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  role: varchar('role', { length: 50 }).$type<'owner' | 'admin' | 'member'>().default('member'),
  joinedAt: timestamp('joined_at').defaultNow().notNull(),
  lastReadAt: timestamp('last_read_at'),
  notificationSettings: jsonb('notification_settings').$type<{
    muted?: boolean;
    mentions?: boolean;
  }>().default({}),
}, (table) => [
  uniqueIndex('chat_members_unique').on(table.chatId, table.userId),
  index('chat_members_user_idx').on(table.userId),
]);
```

#### packages/database/src/schema/messages.ts
```typescript
import { pgTable, serial, integer, varchar, text, timestamp, boolean, jsonb, index } from 'drizzle-orm/pg-core';
import { users } from './users';
import { chats } from './chats';

export const messages = pgTable('messages', {
  id: serial('id').primaryKey(),
  chatId: integer('chat_id')
    .notNull()
    .references(() => chats.id, { onDelete: 'cascade' }),
  senderId: varchar('sender_id', { length: 255 })
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  content: text('content').notNull(),
  type: varchar('type', { length: 50 }).$type<'text' | 'image' | 'file' | 'system'>().default('text'),
  metadata: jsonb('metadata').$type<{
    mentions?: string[];
    attachments?: any[];
    editHistory?: Array<{ content: string; editedAt: string }>;
  }>().default({}),
  parentMessageId: integer('parent_message_id')
    .references(() => messages.id, { onDelete: 'set null' }),
  isEdited: boolean('is_edited').default(false),
  isDeleted: boolean('is_deleted').default(false),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
}, (table) => [
  index('messages_chat_idx').on(table.chatId),
  index('messages_sender_idx').on(table.senderId),
  index('messages_created_at_idx').on(table.createdAt),
]);

export const messageAttachments = pgTable('message_attachments', {
  id: serial('id').primaryKey(),
  messageId: integer('message_id')
    .notNull()
    .references(() => messages.id, { onDelete: 'cascade' }),
  type: varchar('type', { length: 50 }).$type<'image' | 'video' | 'audio' | 'document' | 'other'>().notNull(),
  url: text('url').notNull(),
  fileName: varchar('file_name', { length: 255 }).notNull(),
  fileSize: integer('file_size'), // in bytes
  mimeType: varchar('mime_type', { length: 255 }),
  metadata: jsonb('metadata').$type<{
    width?: number;
    height?: number;
    duration?: number;
    thumbnailUrl?: string;
  }>().default({}),
  createdAt: timestamp('created_at').defaultNow().notNull(),
}, (table) => [
  index('attachments_message_idx').on(table.messageId),
]);

export const messageReactions = pgTable('message_reactions', {
  id: serial('id').primaryKey(),
  messageId: integer('message_id')
    .notNull()
    .references(() => messages.id, { onDelete: 'cascade' }),
  userId: varchar('user_id', { length: 255 })
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  emoji: varchar('emoji', { length: 50 }).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
}, (table) => [
  index('reactions_message_idx').on(table.messageId),
  index('reactions_user_idx').on(table.userId),
]);

export const messageReads = pgTable('message_reads', {
  id: serial('id').primaryKey(),
  messageId: integer('message_id')
    .notNull()
    .references(() => messages.id, { onDelete: 'cascade' }),
  userId: varchar('user_id', { length: 255 })
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  readAt: timestamp('read_at').defaultNow().notNull(),
}, (table) => [
  index('reads_message_idx').on(table.messageId),
  index('reads_user_idx').on(table.userId),
]);
```

#### packages/database/src/schema/references.ts
```typescript
import { pgTable, serial, integer, varchar, text, timestamp, jsonb, index } from 'drizzle-orm/pg-core';
import { users } from './users';
import { chats } from './chats';
import { messages } from './messages';

export const references = pgTable('references', {
  id: serial('id').primaryKey(),
  chatId: integer('chat_id')
    .notNull()
    .references(() => chats.id, { onDelete: 'cascade' }),
  messageId: integer('message_id')
    .references(() => messages.id, { onDelete: 'cascade' }),
  createdBy: varchar('created_by', { length: 255 })
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  type: varchar('type', { length: 50 }).$type<'link' | 'document' | 'code' | 'note' | 'task'>().notNull(),
  title: varchar('title', { length: 255 }).notNull(),
  description: text('description'),
  metadata: jsonb('metadata').$type<Record<string, any>>().default({}),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
}, (table) => [
  index('references_chat_idx').on(table.chatId),
  index('references_message_idx').on(table.messageId),
]);

export const referenceItems = pgTable('reference_items', {
  id: serial('id').primaryKey(),
  referenceId: integer('reference_id')
    .notNull()
    .references(() => references.id, { onDelete: 'cascade' }),
  type: varchar('type', { length: 50 }).notNull(),
  content: text('content').notNull(),
  metadata: jsonb('metadata').$type<Record<string, any>>().default({}),
  position: integer('position').default(0),
  createdAt: timestamp('created_at').defaultNow().notNull(),
}, (table) => [
  index('reference_items_ref_idx').on(table.referenceId),
]);
```

#### packages/database/src/schema/relations.ts
```typescript
import { relations } from 'drizzle-orm';
import { users, userPresence } from './users';
import { chats, chatMembers } from './chats';
import { messages, messageAttachments, messageReactions, messageReads } from './messages';
import { references, referenceItems } from './references';

// User Relations
export const usersRelations = relations(users, ({ one, many }) => ({
  presence: one(userPresence, {
    fields: [users.id],
    references: [userPresence.userId],
  }),
  memberships: many(chatMembers),
  messages: many(messages),
  reactions: many(messageReactions),
  createdChats: many(chats),
  references: many(references),
}));

// Chat Relations
export const chatsRelations = relations(chats, ({ one, many }) => ({
  creator: one(users, {
    fields: [chats.createdBy],
    references: [users.id],
  }),
  members: many(chatMembers),
  messages: many(messages),
  references: many(references),
}));

export const chatMembersRelations = relations(chatMembers, ({ one }) => ({
  chat: one(chats, {
    fields: [chatMembers.chatId],
    references: [chats.id],
  }),
  user: one(users, {
    fields: [chatMembers.userId],
    references: [users.id],
  }),
}));

// Message Relations
export const messagesRelations = relations(messages, ({ one, many }) => ({
  chat: one(chats, {
    fields: [messages.chatId],
    references: [chats.id],
  }),
  sender: one(users, {
    fields: [messages.senderId],
    references: [users.id],
  }),
  parentMessage: one(messages, {
    fields: [messages.parentMessageId],
    references: [messages.id],
  }),
  replies: many(messages),
  attachments: many(messageAttachments),
  reactions: many(messageReactions),
  reads: many(messageReads),
  references: many(references),
}));

export const messageAttachmentsRelations = relations(messageAttachments, ({ one }) => ({
  message: one(messages, {
    fields: [messageAttachments.messageId],
    references: [messages.id],
  }),
}));

export const messageReactionsRelations = relations(messageReactions, ({ one }) => ({
  message: one(messages, {
    fields: [messageReactions.messageId],
    references: [messages.id],
  }),
  user: one(users, {
    fields: [messageReactions.userId],
    references: [users.id],
  }),
}));

export const messageReadsRelations = relations(messageReads, ({ one }) => ({
  message: one(messages, {
    fields: [messageReads.messageId],
    references: [messages.id],
  }),
  user: one(users, {
    fields: [messageReads.userId],
    references: [users.id],
  }),
}));

// Reference Relations
export const referencesRelations = relations(references, ({ one, many }) => ({
  chat: one(chats, {
    fields: [references.chatId],
    references: [chats.id],
  }),
  message: one(messages, {
    fields: [references.messageId],
    references: [messages.id],
  }),
  creator: one(users, {
    fields: [references.createdBy],
    references: [users.id],
  }),
  items: many(referenceItems),
}));

export const referenceItemsRelations = relations(referenceItems, ({ one }) => ({
  reference: one(references, {
    fields: [referenceItems.referenceId],
    references: [references.id],
  }),
}));
```

#### packages/database/src/schema/index.ts
```typescript
export * from './users';
export * from './chats';
export * from './messages';
export * from './references';
export * from './relations';
```

### Step 3: Create Database Client

#### packages/database/src/client.ts
```typescript
import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from './schema';

const connectionString = process.env.DATABASE_URL!;

// For query purposes
const queryClient = postgres(connectionString);
export const db = drizzle(queryClient, { schema });

// For migrations
const migrationClient = postgres(connectionString, { max: 1 });
export const migrationDb = drizzle(migrationClient, { schema });

export type Database = typeof db;
```

### Step 4: Create Query Helpers

#### packages/database/src/queries/chats.ts
```typescript
import { eq, and, desc, isNull } from 'drizzle-orm';
import { db } from '../client';
import { chats, chatMembers, messages } from '../schema';

export async function getUserChats(userId: string) {
  return await db.query.chatMembers.findMany({
    where: eq(chatMembers.userId, userId),
    with: {
      chat: {
        with: {
          members: {
            with: {
              user: true,
            },
          },
          messages: {
            orderBy: desc(messages.createdAt),
            limit: 1,
          },
        },
      },
    },
  });
}

export async function getChatById(chatId: number, userId: string) {
  // Verify user is member
  const membership = await db.query.chatMembers.findFirst({
    where: and(
      eq(chatMembers.chatId, chatId),
      eq(chatMembers.userId, userId)
    ),
  });

  if (!membership) {
    throw new Error('Unauthorized');
  }

  return await db.query.chats.findFirst({
    where: eq(chats.id, chatId),
    with: {
      members: {
        with: {
          user: true,
        },
      },
      messages: {
        orderBy: desc(messages.createdAt),
        limit: 50,
        with: {
          sender: true,
          attachments: true,
          reactions: true,
        },
      },
      references: true,
    },
  });
}

export async function createChat(data: {
  name: string;
  description?: string;
  type?: 'direct' | 'group' | 'channel';
  createdBy: string;
  memberIds: string[];
}) {
  return await db.transaction(async (tx) => {
    // Create chat
    const [chat] = await tx.insert(chats).values({
      name: data.name,
      description: data.description,
      type: data.type || 'group',
      createdBy: data.createdBy,
    }).returning();

    // Add members
    const membersToAdd = data.memberIds.map(userId => ({
      chatId: chat.id,
      userId,
      role: userId === data.createdBy ? 'owner' as const : 'member' as const,
    }));

    await tx.insert(chatMembers).values(membersToAdd);

    return chat;
  });
}
```

#### packages/database/src/queries/messages.ts
```typescript
import { eq, and, desc, gte } from 'drizzle-orm';
import { db } from '../client';
import { messages, messageAttachments, messageReads, chatMembers } from '../schema';

export async function getChatMessages(chatId: number, userId: string, limit = 50, offset = 0) {
  // Verify user is member
  const membership = await db.query.chatMembers.findFirst({
    where: and(
      eq(chatMembers.chatId, chatId),
      eq(chatMembers.userId, userId)
    ),
  });

  if (!membership) {
    throw new Error('Unauthorized');
  }

  return await db.query.messages.findMany({
    where: and(
      eq(messages.chatId, chatId),
      eq(messages.isDeleted, false)
    ),
    orderBy: desc(messages.createdAt),
    limit,
    offset,
    with: {
      sender: true,
      attachments: true,
      reactions: {
        with: {
          user: true,
        },
      },
      reads: true,
      parentMessage: {
        with: {
          sender: true,
        },
      },
    },
  });
}

export async function sendMessage(data: {
  chatId: number;
  senderId: string;
  content: string;
  type?: 'text' | 'image' | 'file' | 'system';
  attachments?: Array<{
    type: 'image' | 'video' | 'audio' | 'document' | 'other';
    url: string;
    fileName: string;
    fileSize?: number;
    mimeType?: string;
  }>;
  parentMessageId?: number;
}) {
  // Verify user is member
  const membership = await db.query.chatMembers.findFirst({
    where: and(
      eq(chatMembers.chatId, data.chatId),
      eq(chatMembers.userId, data.senderId)
    ),
  });

  if (!membership) {
    throw new Error('Unauthorized');
  }

  return await db.transaction(async (tx) => {
    // Insert message
    const [message] = await tx.insert(messages).values({
      chatId: data.chatId,
      senderId: data.senderId,
      content: data.content,
      type: data.type || 'text',
      parentMessageId: data.parentMessageId,
    }).returning();

    // Insert attachments if any
    if (data.attachments && data.attachments.length > 0) {
      const attachmentsToAdd = data.attachments.map(att => ({
        messageId: message.id,
        ...att,
      }));
      
      await tx.insert(messageAttachments).values(attachmentsToAdd);
    }

    // Update member's last read
    await tx.update(chatMembers)
      .set({ lastReadAt: new Date() })
      .where(and(
        eq(chatMembers.chatId, data.chatId),
        eq(chatMembers.userId, data.senderId)
      ));

    return message;
  });
}

export async function markMessageAsRead(messageId: number, userId: string) {
  // Check if already read
  const existingRead = await db.query.messageReads.findFirst({
    where: and(
      eq(messageReads.messageId, messageId),
      eq(messageReads.userId, userId)
    ),
  });

  if (!existingRead) {
    await db.insert(messageReads).values({
      messageId,
      userId,
    });
  }
}
```

#### packages/database/src/queries/users.ts
```typescript
import { eq } from 'drizzle-orm';
import { db } from '../client';
import { users, userPresence } from '../schema';

export async function upsertUser(userData: {
  id: string;
  email: string;
  name?: string;
  firstName?: string;
  lastName?: string;
  imageUrl?: string;
}) {
  return await db.insert(users)
    .values(userData)
    .onConflictDoUpdate({
      target: users.id,
      set: {
        email: userData.email,
        name: userData.name,
        firstName: userData.firstName,
        lastName: userData.lastName,
        imageUrl: userData.imageUrl,
        updatedAt: new Date(),
      },
    })
    .returning();
}

export async function getUserById(userId: string) {
  return await db.query.users.findFirst({
    where: eq(users.id, userId),
    with: {
      presence: true,
    },
  });
}

export async function updateUserPresence(userId: string, status: 'online' | 'away' | 'offline') {
  return await db.insert(userPresence)
    .values({
      userId,
      status,
      lastSeenAt: new Date(),
    })
    .onConflictDoUpdate({
      target: userPresence.userId,
      set: {
        status,
        lastSeenAt: new Date(),
      },
    });
}
```

### Step 5: Create Main Exports

#### packages/database/src/index.ts
```typescript
export * from './schema';
export { db, type Database } from './client';
export * from './queries/chats';
export * from './queries/messages';
export * from './queries/users';

// Export type helpers
export type { InferInsertModel, InferSelectModel } from 'drizzle-orm';
import type { users, chats, messages } from './schema';
import type { InferInsertModel, InferSelectModel } from 'drizzle-orm';

export type User = InferSelectModel<typeof users>;
export type NewUser = InferInsertModel<typeof users>;
export type Chat = InferSelectModel<typeof chats>;
export type NewChat = InferInsertModel<typeof chats>;
export type Message = InferSelectModel<typeof messages>;
export type NewMessage = InferInsertModel<typeof messages>;
```

### Step 6: Create Migration Scripts

#### packages/database/src/seed.ts
```typescript
import { db } from './client';
import { users, chats, chatMembers, messages } from './schema';

async function seed() {
  console.log('🌱 Seeding database...');

  // Create test users
  const testUsers = await db.insert(users).values([
    {
      id: 'user_test_1',
      email: 'alice@example.com',
      name: 'Alice Johnson',
      firstName: 'Alice',
      lastName: 'Johnson',
    },
    {
      id: 'user_test_2',
      email: 'bob@example.com',
      name: 'Bob Smith',
      firstName: 'Bob',
      lastName: 'Smith',
    },
  ]).returning();

  // Create a test chat
  const [testChat] = await db.insert(chats).values({
    name: 'General Discussion',
    description: 'A place for general conversation',
    type: 'group',
    createdBy: testUsers[0].id,
  }).returning();

  // Add members to chat
  await db.insert(chatMembers).values([
    {
      chatId: testChat.id,
      userId: testUsers[0].id,
      role: 'owner',
    },
    {
      chatId: testChat.id,
      userId: testUsers[1].id,
      role: 'member',
    },
  ]);

  // Add test messages
  await db.insert(messages).values([
    {
      chatId: testChat.id,
      senderId: testUsers[0].id,
      content: 'Welcome to Alden! 👋',
      type: 'text',
    },
    {
      chatId: testChat.id,
      senderId: testUsers[1].id,
      content: 'Happy to be here!',
      type: 'text',
    },
  ]);

  console.log('✅ Seeding complete!');
}

seed().catch(console.error);
```

## Migration Steps

1. **Install Dependencies**: Add Drizzle ORM packages
2. **Create Schema**: Define all tables and relations
3. **Generate Migrations**: Run `bun run db:generate`
4. **Run Migrations**: Execute `bun run db:migrate`
5. **Create Query Helpers**: Build reusable query functions
6. **Update API Endpoints**: Replace Supabase calls
7. **Update Components**: Use new database queries
8. **Test Everything**: Verify all operations work
9. **Seed Data**: Add initial test data

## API Integration Updates

Update all API routes to use Drizzle queries:

```typescript
// apps/api/src/routes/chats.ts
import { Hono } from 'hono';
import { getUserChats, createChat, getChatById } from '@repo/database';

const app = new Hono();

app.get('/api/chats', async (c) => {
  const userId = c.get('userId');
  const chats = await getUserChats(userId);
  return c.json(chats);
});

app.post('/api/chats', async (c) => {
  const userId = c.get('userId');
  const body = await c.req.json();
  
  const chat = await createChat({
    ...body,
    createdBy: userId,
    memberIds: [...body.memberIds, userId],
  });
  
  return c.json(chat);
});

app.get('/api/chats/:id', async (c) => {
  const userId = c.get('userId');
  const chatId = parseInt(c.req.param('id'));
  
  const chat = await getChatById(chatId, userId);
  return c.json(chat);
});

export default app;
```

## Testing Requirements

1. **Schema Tests**:
   - All tables created correctly
   - Foreign key constraints work
   - Indexes created properly

2. **Query Tests**:
   - User CRUD operations
   - Chat creation and membership
   - Message sending and retrieval
   - Read receipts and reactions

3. **Integration Tests**:
   - API endpoints return correct data
   - Transactions work correctly
   - Error handling for unauthorized access

## Success Criteria

- [ ] All Supabase database code removed
- [ ] Drizzle schema fully implemented
- [ ] Migrations run successfully
- [ ] All queries working correctly
- [ ] API endpoints updated
- [ ] Type safety maintained throughout
- [ ] No TypeScript errors
- [ ] Tests passing
- [ ] Database performance acceptable

## Rollback Plan

1. Keep database backup before migration
2. Maintain Supabase connection temporarily
3. Use feature flags to switch between implementations
4. Test thoroughly in staging first

## Notes for Cursor Agent

- Use Drizzle's relational query builder for complex queries
- Implement proper transaction handling
- Add indexes for performance-critical queries
- Use type inference for type safety
- Follow existing code patterns
- Test each query function thoroughly
- Add proper error handling
- Document complex queries

## Performance Considerations

- Add indexes on frequently queried columns
- Use select specific columns when possible
- Implement pagination for large datasets
- Consider caching for frequently accessed data
- Use database connection pooling
- Optimize N+1 query problems with proper joins

## Reference Documentation

- Drizzle ORM: https://orm.drizzle.team/docs/overview
- PostgreSQL Schema: https://orm.drizzle.team/docs/sql-schema-declaration
- Relations: https://orm.drizzle.team/docs/rqb
- Migrations: https://orm.drizzle.team/docs/migrations