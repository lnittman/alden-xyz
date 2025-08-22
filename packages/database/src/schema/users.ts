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