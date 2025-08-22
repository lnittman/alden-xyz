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
}, (table) => ({
  chatIdx: index('references_chat_idx').on(table.chatId),
  messageIdx: index('references_message_idx').on(table.messageId),
}));

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
}, (table) => ({
  referenceIdx: index('reference_items_ref_idx').on(table.referenceId),
}));