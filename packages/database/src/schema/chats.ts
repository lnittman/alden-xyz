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
}, (table) => ({
  createdByIdx: index('chats_created_by_idx').on(table.createdBy),
  typeIdx: index('chats_type_idx').on(table.type),
}));

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
}, (table) => ({
  uniqueIdx: uniqueIndex('chat_members_unique').on(table.chatId, table.userId),
  userIdx: index('chat_members_user_idx').on(table.userId),
}));