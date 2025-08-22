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