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
  parentMessageId: integer('parent_message_id'),
  isEdited: boolean('is_edited').default(false),
  isDeleted: boolean('is_deleted').default(false),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
}, (table) => ({
  chatIdx: index('messages_chat_idx').on(table.chatId),
  senderIdx: index('messages_sender_idx').on(table.senderId),
  createdAtIdx: index('messages_created_at_idx').on(table.createdAt),
}));

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
}, (table) => ({
  messageIdx: index('attachments_message_idx').on(table.messageId),
}));

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
}, (table) => ({
  messageIdx: index('reactions_message_idx').on(table.messageId),
  userIdx: index('reactions_user_idx').on(table.userId),
}));

export const messageReads = pgTable('message_reads', {
  id: serial('id').primaryKey(),
  messageId: integer('message_id')
    .notNull()
    .references(() => messages.id, { onDelete: 'cascade' }),
  userId: varchar('user_id', { length: 255 })
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  readAt: timestamp('read_at').defaultNow().notNull(),
}, (table) => ({
  messageIdx: index('reads_message_idx').on(table.messageId),
  userIdx: index('reads_user_idx').on(table.userId),
}));