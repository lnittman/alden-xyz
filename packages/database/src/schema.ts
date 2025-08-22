import { relations, sql } from 'drizzle-orm';
import {
  boolean,
  index,
  integer,
  json,
  pgTable,
  real,
  text,
  timestamp,
  uuid,
  vector,
} from 'drizzle-orm/pg-core';

// Users table
export const users = pgTable(
  'User',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    clerkId: text('clerk_id').unique(),
    email: text('email').unique(),
    username: text('username').unique(),
    passwordHash: text('passwordHash'),
    phoneNumber: text('phoneNumber').unique(),
    phoneVerified: boolean('phone_verified').default(false).notNull(),
    pfpUrl: text('pfp_url'),
    imageUrl: text('image_url'), // For Clerk compatibility
    bio: text('bio'),
    gender: text('gender'),
    name: text('name'),

    // Profile stats
    interests: json('interests').$type<string[]>(),
    pronouns: text('pronouns'),
    profileCompletion: real('profile_completion').default(0).notNull(),

    // Settings
    pinnedColumns: json('pinned_columns').$type<string[]>(),
    selectedProfileStat: text('selected_profile_stat').default('boards'),

    createdAt: timestamp('created', { mode: 'date' }).defaultNow().notNull(),
    updatedAt: timestamp('updated', { mode: 'date' }).defaultNow().notNull(),
  },
  (table) => {
    return {
      phoneNumberIdx: index('User_phoneNumber_idx').on(table.phoneNumber),
      usernameIdx: index('User_username_idx').on(table.username),
      emailIdx: index('User_email_idx').on(table.email),
    };
  }
);

// Chat types
export const chatTypes = ['personal', 'direct', 'group'] as const;

// Chats table
export const chats = pgTable(
  'Chat',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    type: text('type').notNull(), // personal, direct, group
    name: text('name'), // Chat name (for groups, optional for direct)
    title: text('title'), // Alternative field name for compatibility
    isArchived: boolean('is_archived').default(false).notNull(),
    pinned: boolean('pinned').default(false).notNull(),
    labels: json('labels').$type<string[]>(),
    lastMessage: json('last_message').$type<{
      content: string;
      sender_id: string;
      created_at: string;
    }>(),
    createdBy: text('created_by')
      .notNull()
      .references(() => users.id),
    createdAt: timestamp('created_at', { mode: 'date' }).defaultNow().notNull(),
    updatedAt: timestamp('updated_at', { mode: 'date' }).defaultNow().notNull(),
  },
  (table) => {
    return {
      createdByIdx: index('Chat_createdBy_idx').on(table.createdBy),
      typeIdx: index('Chat_type_idx').on(table.type),
      createdAtIdx: index('Chat_createdAt_idx').on(table.createdAt),
    };
  }
);

// Chat participants table
export const chatParticipants = pgTable(
  'ChatParticipant',
  {
    chatId: text('chat_id')
      .notNull()
      .references(() => chats.id, { onDelete: 'cascade' }),
    userId: text('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    joinedAt: timestamp('joined_at', { mode: 'date' }).defaultNow().notNull(),
    lastReadAt: timestamp('last_read_at', { mode: 'date' }),
  },
  (table) => {
    return {
      pk: index('ChatParticipant_pk').on(table.chatId, table.userId),
      chatIdIdx: index('ChatParticipant_chatId_idx').on(table.chatId),
      userIdIdx: index('ChatParticipant_userId_idx').on(table.userId),
    };
  }
);

// Messages table
export const messages = pgTable(
  'Message',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    chatId: text('chat_id')
      .notNull()
      .references(() => chats.id, { onDelete: 'cascade' }),
    senderId: text('sender_id')
      .notNull()
      .references(() => users.id),
    userId: text('user_id')
      .notNull()
      .references(() => users.id), // Alias for senderId to match API expectations
    content: text('content').notNull(),
    type: text('type').default('text').notNull(), // text, image, file, system
    metadata: json('metadata').$type<Record<string, any>>(),
    isDeleted: boolean('is_deleted').default(false).notNull(),
    isEdited: boolean('is_edited').default(false).notNull(),
    
    // AI features
    embedding: vector('embedding', { dimensions: 1408 }),
    references: json('references').$type<any[]>(),
    
    createdAt: timestamp('created_at', { mode: 'date' }).defaultNow().notNull(),
    updatedAt: timestamp('updated_at', { mode: 'date' }).defaultNow().notNull(),
  },
  (table) => {
    return {
      chatIdIdx: index('Message_chatId_idx').on(table.chatId),
      senderIdIdx: index('Message_senderId_idx').on(table.senderId),
      userIdIdx: index('Message_userId_idx').on(table.userId),
      createdAtIdx: index('Message_createdAt_idx').on(table.createdAt),
      typeIdx: index('Message_type_idx').on(table.type),
    };
  }
);

// Boards table
export const boards = pgTable(
  'Board',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    name: text('name').notNull(),
    visibility: text('visibility').default('public').notNull(),
    description: text('description'),
    instructions: text('instructions'),
    sources: text('sources'),
    icon: text('icon').default('🖼️').notNull(),

    // Vector embedding for semantic search
    embedding: vector('embedding', { dimensions: 1408 }),
    embeddingMetadata: json('embedding_metadata').$type<Record<string, any>>(),

    creatorId: text('creator_id')
      .notNull()
      .references(() => users.id),
    createdAt: timestamp('created', { mode: 'date' }).defaultNow().notNull(),
    updatedAt: timestamp('updated', { mode: 'date' }).defaultNow().notNull(),
  },
  (table) => {
    return {
      creatorIdIdx: index('Board_creatorId_idx').on(table.creatorId),
      visibilityIdx: index('Board_visibility_idx').on(table.visibility),
      nameIdx: index('Board_name_idx').on(table.name),
    };
  }
);

// Assets table
export const assets = pgTable(
  'Asset',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    type: text('type').notNull(), // image, video, audio, gif, text, file
    name: text('name').notNull(),
    url: text('url').notNull(),
    thumbnailUrl: text('thumbnail_url'),
    storageKey: text('storage_key'),

    // Metadata
    width: real('width'),
    height: real('height'),
    duration: real('duration'), // For audio/video
    size: integer('size'), // File size in bytes
    mimeType: text('mime_type'),
    metadata: json('metadata').$type<Record<string, any>>(),

    // Vector embedding for multimodal search
    embedding: vector('embedding', { dimensions: 1408 }),
    embeddingMetadata: json('embedding_metadata').$type<Record<string, any>>(),

    creatorId: text('creator_id')
      .notNull()
      .references(() => users.id),
    createdAt: timestamp('created', { mode: 'date' }).defaultNow().notNull(),
    updatedAt: timestamp('updated', { mode: 'date' }).defaultNow().notNull(),
  },
  (table) => {
    return {
      creatorIdIdx: index('Asset_creatorId_idx').on(table.creatorId),
      typeIdx: index('Asset_type_idx').on(table.type),
      nameIdx: index('Asset_name_idx').on(table.name),
    };
  }
);

// Search table
export const searches = pgTable(
  'Search',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    query: text('query').notNull(),
    expandedContext: text('expanded_context'),

    // Vector embedding for search query
    embedding: vector('embedding', { dimensions: 1408 }),

    // Results tracking
    resultsSnapshot: json('results_snapshot').$type<any>(),
    newResultsCount: integer('new_results_count').default(0).notNull(),
    lastChecked: timestamp('last_checked', { mode: 'date' }),

    userId: text('user_id')
      .notNull()
      .references(() => users.id),
    createdAt: timestamp('created', { mode: 'date' }).defaultNow().notNull(),
  },
  (table) => {
    return {
      userIdIdx: index('Search_userId_idx').on(table.userId),
      createdAtIdx: index('Search_createdAt_idx').on(table.createdAt),
    };
  }
);

// BoardAsset junction table
export const boardAssets = pgTable(
  'BoardAsset',
  {
    boardId: text('board_id')
      .notNull()
      .references(() => boards.id, { onDelete: 'cascade' }),
    assetId: text('asset_id')
      .notNull()
      .references(() => assets.id, { onDelete: 'cascade' }),
    order: integer('order'),
    createdAt: timestamp('created_at', { mode: 'date' }).defaultNow().notNull(),
  },
  (table) => {
    return {
      pk: index('BoardAsset_pk').on(table.boardId, table.assetId),
      boardIdIdx: index('BoardAsset_boardId_idx').on(table.boardId),
      assetIdIdx: index('BoardAsset_assetId_idx').on(table.assetId),
    };
  }
);

// BoardCollaborator table
export const boardCollaborators = pgTable(
  'BoardCollaborator',
  {
    boardId: text('board_id')
      .notNull()
      .references(() => boards.id, { onDelete: 'cascade' }),
    userId: text('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    accessLevel: text('access_level').default('view').notNull(), // view, edit, admin
    createdAt: timestamp('created', { mode: 'date' }).defaultNow().notNull(),
  },
  (table) => {
    return {
      pk: index('BoardCollaborator_pk').on(table.boardId, table.userId),
      userIdIdx: index('BoardCollaborator_userId_idx').on(table.userId),
      boardIdIdx: index('BoardCollaborator_boardId_idx').on(table.boardId),
    };
  }
);

// LikedAsset table
export const likedAssets = pgTable(
  'LikedAsset',
  {
    userId: text('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    assetId: text('asset_id')
      .notNull()
      .references(() => assets.id, { onDelete: 'cascade' }),
    createdAt: timestamp('created_at', { mode: 'date' }).defaultNow().notNull(),
  },
  (table) => {
    return {
      pk: index('LikedAsset_pk').on(table.userId, table.assetId),
      userIdIdx: index('LikedAsset_userId_idx').on(table.userId),
      assetIdIdx: index('LikedAsset_assetId_idx').on(table.assetId),
    };
  }
);

// ViewedAsset table
export const viewedAssets = pgTable(
  'ViewedAsset',
  {
    userId: text('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    assetId: text('asset_id')
      .notNull()
      .references(() => assets.id, { onDelete: 'cascade' }),
    viewCount: integer('view_count').default(1).notNull(),
    lastViewed: timestamp('last_viewed', { mode: 'date' })
      .defaultNow()
      .notNull(),
  },
  (table) => {
    return {
      pk: index('ViewedAsset_pk').on(table.userId, table.assetId),
      userIdIdx: index('ViewedAsset_userId_idx').on(table.userId),
      lastViewedIdx: index('ViewedAsset_lastViewed_idx').on(table.lastViewed),
    };
  }
);

// LikedBoard table
export const likedBoards = pgTable(
  'LikedBoard',
  {
    userId: text('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    boardId: text('board_id')
      .notNull()
      .references(() => boards.id, { onDelete: 'cascade' }),
    createdAt: timestamp('created_at', { mode: 'date' }).defaultNow().notNull(),
  },
  (table) => {
    return {
      pk: index('LikedBoard_pk').on(table.userId, table.boardId),
      userIdIdx: index('LikedBoard_userId_idx').on(table.userId),
      boardIdIdx: index('LikedBoard_boardId_idx').on(table.boardId),
    };
  }
);

// ViewedBoard table
export const viewedBoards = pgTable(
  'ViewedBoard',
  {
    userId: text('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    boardId: text('board_id')
      .notNull()
      .references(() => boards.id, { onDelete: 'cascade' }),
    viewCount: integer('view_count').default(1).notNull(),
    lastViewed: timestamp('last_viewed', { mode: 'date' })
      .defaultNow()
      .notNull(),
  },
  (table) => {
    return {
      pk: index('ViewedBoard_pk').on(table.userId, table.boardId),
      userIdIdx: index('ViewedBoard_userId_idx').on(table.userId),
      boardIdIdx: index('ViewedBoard_boardId_idx').on(table.boardId),
    };
  }
);

// RecentAsset table
export const recentAssets = pgTable(
  'RecentAsset',
  {
    userId: text('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    assetId: text('asset_id')
      .notNull()
      .references(() => assets.id, { onDelete: 'cascade' }),
    usedAt: timestamp('used_at', { mode: 'date' }).defaultNow().notNull(),
  },
  (table) => {
    return {
      pk: index('RecentAsset_pk').on(table.userId, table.assetId),
      userIdUsedAtIdx: index('RecentAsset_userId_usedAt_idx').on(
        table.userId,
        table.usedAt
      ),
    };
  }
);

// RecentBoard table
export const recentBoards = pgTable(
  'RecentBoard',
  {
    userId: text('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    boardId: text('board_id')
      .notNull()
      .references(() => boards.id, { onDelete: 'cascade' }),
    usedAt: timestamp('used_at', { mode: 'date' }).defaultNow().notNull(),
  },
  (table) => {
    return {
      pk: index('RecentBoard_pk').on(table.userId, table.boardId),
      userIdUsedAtIdx: index('RecentBoard_userId_usedAt_idx').on(
        table.userId,
        table.usedAt
      ),
    };
  }
);

// Report table
export const reports = pgTable(
  'Report',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    content: text('content').notNull(),
    attachmentUrl: text('attachment_url'),
    category: text('category'), // bug, feature, content, other
    status: text('status').default('pending').notNull(), // pending, reviewed, resolved

    userId: text('user_id').references(() => users.id),
    createdAt: timestamp('created', { mode: 'date' }).defaultNow().notNull(),
  },
  (table) => {
    return {
      statusIdx: index('Report_status_idx').on(table.status),
      userIdIdx: index('Report_userId_idx').on(table.userId),
    };
  }
);

// Define relations
export const usersRelations = relations(users, ({ one, many }) => ({
  boards: many(boards),
  assets: many(assets),
  collaborations: many(boardCollaborators),
  reports: many(reports),
  searches: many(searches),
  likedAssets: many(likedAssets),
  likedBoards: many(likedBoards),
  viewedAssets: many(viewedAssets),
  viewedBoards: many(viewedBoards),
  recentAssets: many(recentAssets),
  recentBoards: many(recentBoards),
  settings: one(userSettings),
  socialLinks: many(userSocialLinks),
  stats: one(userProfileStats),
  uploads: many(uploads),
  // Chat relations
  createdChats: many(chats),
  chatParticipants: many(chatParticipants),
  chatMembers: many(chatMembers),
  sentMessages: many(messages),
  messageReactions: many(messageReactions),
  messageReads: many(messageReads),
}));

export const boardsRelations = relations(boards, ({ one, many }) => ({
  creator: one(users, {
    fields: [boards.creatorId],
    references: [users.id],
  }),
  assets: many(boardAssets),
  collaborators: many(boardCollaborators),
  likes: many(likedBoards),
  views: many(viewedBoards),
  recentUses: many(recentBoards),
}));

export const assetsRelations = relations(assets, ({ one, many }) => ({
  creator: one(users, {
    fields: [assets.creatorId],
    references: [users.id],
  }),
  boards: many(boardAssets),
  likes: many(likedAssets),
  views: many(viewedAssets),
  recentUses: many(recentAssets),
}));

export const searchesRelations = relations(searches, ({ one }) => ({
  user: one(users, {
    fields: [searches.userId],
    references: [users.id],
  }),
}));

export const boardAssetsRelations = relations(boardAssets, ({ one }) => ({
  board: one(boards, {
    fields: [boardAssets.boardId],
    references: [boards.id],
  }),
  asset: one(assets, {
    fields: [boardAssets.assetId],
    references: [assets.id],
  }),
}));

export const boardCollaboratorsRelations = relations(
  boardCollaborators,
  ({ one }) => ({
    board: one(boards, {
      fields: [boardCollaborators.boardId],
      references: [boards.id],
    }),
    user: one(users, {
      fields: [boardCollaborators.userId],
      references: [users.id],
    }),
  })
);

export const likedAssetsRelations = relations(likedAssets, ({ one }) => ({
  user: one(users, {
    fields: [likedAssets.userId],
    references: [users.id],
  }),
  asset: one(assets, {
    fields: [likedAssets.assetId],
    references: [assets.id],
  }),
}));

export const viewedAssetsRelations = relations(viewedAssets, ({ one }) => ({
  user: one(users, {
    fields: [viewedAssets.userId],
    references: [users.id],
  }),
  asset: one(assets, {
    fields: [viewedAssets.assetId],
    references: [assets.id],
  }),
}));

export const likedBoardsRelations = relations(likedBoards, ({ one }) => ({
  user: one(users, {
    fields: [likedBoards.userId],
    references: [users.id],
  }),
  board: one(boards, {
    fields: [likedBoards.boardId],
    references: [boards.id],
  }),
}));

export const viewedBoardsRelations = relations(viewedBoards, ({ one }) => ({
  user: one(users, {
    fields: [viewedBoards.userId],
    references: [users.id],
  }),
  board: one(boards, {
    fields: [viewedBoards.boardId],
    references: [boards.id],
  }),
}));

export const recentAssetsRelations = relations(recentAssets, ({ one }) => ({
  user: one(users, {
    fields: [recentAssets.userId],
    references: [users.id],
  }),
  asset: one(assets, {
    fields: [recentAssets.assetId],
    references: [assets.id],
  }),
}));

export const recentBoardsRelations = relations(recentBoards, ({ one }) => ({
  user: one(users, {
    fields: [recentBoards.userId],
    references: [users.id],
  }),
  board: one(boards, {
    fields: [recentBoards.boardId],
    references: [boards.id],
  }),
}));

// User Profile Settings table
export const userSettings = pgTable(
  'UserSettings',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    userId: text('user_id').references(() => users.id, { onDelete: 'cascade' }),

    // UI Preferences
    pinnedColumns: json('pinned_columns').$type<string[]>(),
    selectedProfileStat: text('selected_profile_stat').default('boards'),
    theme: text('theme').default('system'), // light, dark, system

    // Notification Preferences
    emailNotifications: json('email_notifications')
      .$type<{
        newCollaborators: boolean;
        newComments: boolean;
        mentions: boolean;
        boardUpdates: boolean;
      }>()
      .default({
        newCollaborators: true,
        newComments: true,
        mentions: true,
        boardUpdates: false,
      }),

    // Privacy Settings
    profileVisibility: text('profile_visibility').default('public'), // public, private, unlisted
    showEmail: boolean('show_email').default(false),
    showActivity: boolean('show_activity').default(true),

    createdAt: timestamp('created', { mode: 'date' }).defaultNow().notNull(),
    updatedAt: timestamp('updated', { mode: 'date' }).defaultNow().notNull(),
  },
  (table) => {
    return {
      userIdIdx: index('UserSettings_userId_idx').on(table.userId),
      pk: index('UserSettings_pk').on(table.userId),
    };
  }
);

// User Social Links table
export const userSocialLinks = pgTable(
  'UserSocialLink',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    userId: text('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),

    platform: text('platform').notNull(), // twitter, github, linkedin, instagram, website, custom
    url: text('url').notNull(),
    username: text('username'), // platform-specific username
    order: integer('order').default(0).notNull(),
    isVerified: boolean('is_verified').default(false).notNull(),

    createdAt: timestamp('created_at', { mode: 'date' }).defaultNow().notNull(),
    updatedAt: timestamp('updated_at', { mode: 'date' }).defaultNow().notNull(),
  },
  (table) => {
    return {
      userIdIdx: index('UserSocialLink_userId_idx').on(table.userId),
      platformIdx: index('UserSocialLink_platform_idx').on(table.platform),
      userIdPlatformIdx: index('UserSocialLink_userId_platform_idx').on(
        table.userId,
        table.platform
      ),
    };
  }
);

// User Profile Stats table
export const userProfileStats = pgTable(
  'UserProfileStats',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    userId: text('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),

    // Counts
    boardCount: integer('board_count').default(0).notNull(),
    assetCount: integer('asset_count').default(0).notNull(),
    likeCount: integer('like_count').default(0).notNull(),
    viewCount: integer('view_count').default(0).notNull(),
    collaboratorCount: integer('collaborator_count').default(0).notNull(),

    // Analytics
    followersCount: integer('followers_count').default(0).notNull(),
    followingCount: integer('following_count').default(0).notNull(),

    // Time-based stats
    lastActive: timestamp('last_active', { mode: 'date' })
      .defaultNow()
      .notNull(),
    totalViews: integer('total_views').default(0).notNull(),
    totalLikes: integer('total_likes').default(0).notNull(),

    createdAt: timestamp('created', { mode: 'date' }).defaultNow().notNull(),
    updatedAt: timestamp('updated', { mode: 'date' }).defaultNow().notNull(),
  },
  (table) => {
    return {
      userIdIdx: index('UserProfileStats_userId_idx').on(table.userId),
      pk: index('UserProfileStats_pk').on(table.userId),
    };
  }
);

export const reportsRelations = relations(reports, ({ one }) => ({
  user: one(users, {
    fields: [reports.userId],
    references: [users.id],
  }),
}));

export const userSettingsRelations = relations(userSettings, ({ one }) => ({
  user: one(users, {
    fields: [userSettings.userId],
    references: [users.id],
  }),
}));

export const userSocialLinksRelations = relations(
  userSocialLinks,
  ({ one }) => ({
    user: one(users, {
      fields: [userSocialLinks.userId],
      references: [users.id],
    }),
  })
);

export const userProfileStatsRelations = relations(
  userProfileStats,
  ({ one }) => ({
    user: one(users, {
      fields: [userProfileStats.userId],
      references: [users.id],
    }),
  })
);

// Uploads table for tracking staged uploads
export const uploads = pgTable(
  'Upload',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    userId: text('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),

    storageKey: text('storage_key').notNull(),
    type: text('type').notNull(), // image, video, audio, gif, text, file
    name: text('name').notNull(),
    size: integer('size').notNull(),
    mimeType: text('mime_type').notNull(),

    status: text('status').notNull().default('pending'), // pending, uploading, completed, failed, cancelled

    metadata: json('metadata').$type<Record<string, any>>(),
    thumbnailUrl: text('thumbnail_url'),

    expiresAt: timestamp('expires_at')
      .notNull()
      .default(sql`NOW() + INTERVAL '24 hours'`),

    createdAt: timestamp('created', { mode: 'date' }).defaultNow().notNull(),
    updatedAt: timestamp('updated', { mode: 'date' }).defaultNow().notNull(),
  },
  (table) => {
    return {
      userIdIdx: index('Upload_userId_idx').on(table.userId),
      storageKeyIdx: index('Upload_storageKey_idx').on(table.storageKey),
      statusIdx: index('Upload_status_idx').on(table.status),
      expiresAtIdx: index('Upload_expiresAt_idx').on(table.expiresAt),
    };
  }
);

export const uploadsRelations = relations(uploads, ({ one }) => ({
  user: one(users, {
    fields: [uploads.userId],
    references: [users.id],
  }),
}));

// Chat relations
export const chatsRelations = relations(chats, ({ one, many }) => ({
  creator: one(users, {
    fields: [chats.createdBy],
    references: [users.id],
  }),
  participants: many(chatParticipants),
  members: many(chatMembers),
  messages: many(messages),
}));

export const chatParticipantsRelations = relations(chatParticipants, ({ one }) => ({
  chat: one(chats, {
    fields: [chatParticipants.chatId],
    references: [chats.id],
  }),
  user: one(users, {
    fields: [chatParticipants.userId],
    references: [users.id],
  }),
}));

export const messagesRelations = relations(messages, ({ one, many }) => ({
  chat: one(chats, {
    fields: [messages.chatId],
    references: [chats.id],
  }),
  sender: one(users, {
    fields: [messages.senderId],
    references: [users.id],
  }),
  user: one(users, {
    fields: [messages.userId],
    references: [users.id],
  }),
  attachments: many(messageAttachments),
  reactions: many(messageReactions),
  reads: many(messageReads),
}));

// Chat Members table (renamed from chatParticipants for API compatibility)
export const chatMembers = pgTable(
  'ChatMember',
  {
    chatId: text('chat_id')
      .notNull()
      .references(() => chats.id, { onDelete: 'cascade' }),
    userId: text('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    role: text('role').default('member').notNull(), // admin, member
    joinedAt: timestamp('joined_at', { mode: 'date' }).defaultNow().notNull(),
    lastReadAt: timestamp('last_read_at', { mode: 'date' }),
  },
  (table) => {
    return {
      pk: index('ChatMember_pk').on(table.chatId, table.userId),
      chatIdIdx: index('ChatMember_chatId_idx').on(table.chatId),
      userIdIdx: index('ChatMember_userId_idx').on(table.userId),
    };
  }
);

// Message Attachments table
export const messageAttachments = pgTable(
  'MessageAttachment',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    messageId: text('message_id')
      .notNull()
      .references(() => messages.id, { onDelete: 'cascade' }),
    type: text('type').notNull(), // image, video, audio, file
    url: text('url').notNull(),
    name: text('name'),
    size: integer('size'),
    mimeType: text('mime_type'),
    width: integer('width'),
    height: integer('height'),
    duration: real('duration'),
    metadata: json('metadata').$type<Record<string, any>>(),
    createdAt: timestamp('created_at', { mode: 'date' }).defaultNow().notNull(),
  },
  (table) => {
    return {
      messageIdIdx: index('MessageAttachment_messageId_idx').on(table.messageId),
      typeIdx: index('MessageAttachment_type_idx').on(table.type),
    };
  }
);

// Message Reactions table
export const messageReactions = pgTable(
  'MessageReaction',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    messageId: text('message_id')
      .notNull()
      .references(() => messages.id, { onDelete: 'cascade' }),
    userId: text('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    emoji: text('emoji').notNull(),
    createdAt: timestamp('created_at', { mode: 'date' }).defaultNow().notNull(),
  },
  (table) => {
    return {
      pk: index('MessageReaction_pk').on(table.messageId, table.userId, table.emoji),
      messageIdIdx: index('MessageReaction_messageId_idx').on(table.messageId),
      userIdIdx: index('MessageReaction_userId_idx').on(table.userId),
    };
  }
);

// Message Reads table
export const messageReads = pgTable(
  'MessageRead',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    messageId: text('message_id')
      .notNull()
      .references(() => messages.id, { onDelete: 'cascade' }),
    userId: text('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    readAt: timestamp('read_at', { mode: 'date' }).defaultNow().notNull(),
  },
  (table) => {
    return {
      pk: index('MessageRead_pk').on(table.messageId, table.userId),
      messageIdIdx: index('MessageRead_messageId_idx').on(table.messageId),
      userIdIdx: index('MessageRead_userId_idx').on(table.userId),
    };
  }
);

// Add relations for new tables
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
