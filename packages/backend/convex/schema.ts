import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  // Users table - integrates with Clerk
  users: defineTable({
    clerkId: v.string(),
    email: v.optional(v.string()),
    username: v.optional(v.string()),
    phoneNumber: v.optional(v.string()),
    phoneVerified: v.boolean(),
    pfpUrl: v.optional(v.string()),
    imageUrl: v.optional(v.string()),
    bio: v.optional(v.string()),
    gender: v.optional(v.string()),
    name: v.optional(v.string()),
    
    // Profile stats
    interests: v.optional(v.array(v.string())),
    pronouns: v.optional(v.string()),
    profileCompletion: v.number(),
    
    // Settings
    pinnedColumns: v.optional(v.array(v.string())),
    selectedProfileStat: v.string(),
  })
    .index("by_clerk_id", ["clerkId"])
    .index("by_email", ["email"])
    .index("by_username", ["username"]),

  // Chats table - real-time messaging
  chats: defineTable({
    type: v.union(v.literal("personal"), v.literal("direct"), v.literal("group")),
    name: v.optional(v.string()),
    title: v.optional(v.string()),
    isArchived: v.boolean(),
    pinned: v.boolean(),
    labels: v.optional(v.array(v.string())),
    lastMessage: v.optional(v.object({
      content: v.string(),
      senderId: v.string(),
      createdAt: v.string(),
    })),
    createdBy: v.id("users"),
  })
    .index("by_creator", ["createdBy"])
    .index("by_type", ["type"]),

  // Chat participants - many-to-many relationship
  chatParticipants: defineTable({
    chatId: v.id("chats"),
    userId: v.id("users"),
    joinedAt: v.number(),
    lastReadAt: v.optional(v.number()),
  })
    .index("by_chat", ["chatId"])
    .index("by_user", ["userId"])
    .index("by_chat_and_user", ["chatId", "userId"]),

  // Messages - chat messages with embeddings
  messages: defineTable({
    chatId: v.id("chats"),
    senderId: v.id("users"),
    content: v.string(),
    type: v.union(v.literal("text"), v.literal("image"), v.literal("file"), v.literal("system")),
    metadata: v.optional(v.any()),
    isDeleted: v.boolean(),
    isEdited: v.boolean(),
    
    // AI features - will use Convex's vector search
    embedding: v.optional(v.array(v.float64())),
    references: v.optional(v.array(v.any())),
  })
    .index("by_chat", ["chatId"])
    .index("by_sender", ["senderId"])
    .vectorIndex("by_embedding", {
      vectorField: "embedding",
      dimensions: 1536, // Standard OpenAI/Vertex AI dimension
      filterFields: ["chatId"],
    }),

  // Message attachments
  messageAttachments: defineTable({
    messageId: v.id("messages"),
    type: v.union(v.literal("image"), v.literal("file"), v.literal("video"), v.literal("audio")),
    url: v.string(),
    name: v.string(),
    size: v.optional(v.number()),
    mimeType: v.optional(v.string()),
    storageId: v.optional(v.string()), // Convex storage ID
  })
    .index("by_message", ["messageId"]),

  // Message reactions
  messageReactions: defineTable({
    messageId: v.id("messages"),
    userId: v.id("users"),
    emoji: v.string(),
  })
    .index("by_message", ["messageId"])
    .index("by_user", ["userId"])
    .index("by_message_and_user", ["messageId", "userId"]),

  // Message read receipts
  messageReads: defineTable({
    messageId: v.id("messages"),
    userId: v.id("users"),
    readAt: v.number(),
  })
    .index("by_message", ["messageId"])
    .index("by_user", ["userId"])
    .index("by_message_and_user", ["messageId", "userId"]),

  // Search history with embeddings
  searches: defineTable({
    query: v.string(),
    expandedContext: v.optional(v.string()),
    embedding: v.optional(v.array(v.float64())),
    resultsSnapshot: v.optional(v.any()),
    newResultsCount: v.number(),
    lastChecked: v.optional(v.number()),
    userId: v.id("users"),
  })
    .index("by_user", ["userId"])
    .vectorIndex("by_embedding", {
      vectorField: "embedding",
      dimensions: 1536,
      filterFields: ["userId"],
    }),

  // Notifications
  notifications: defineTable({
    userId: v.id("users"),
    type: v.string(),
    title: v.string(),
    message: v.string(),
    data: v.optional(v.any()),
    read: v.boolean(),
    readAt: v.optional(v.number()),
  })
    .index("by_user", ["userId"])
    .index("by_user_and_read", ["userId", "read"]),

  // Presence - for real-time collaboration
  presence: defineTable({
    userId: v.id("users"),
    sessionId: v.string(),
    location: v.string(), // chat/settings/etc
    locationId: v.string(), // ID of the chat/etc
    cursor: v.optional(v.object({
      x: v.number(),
      y: v.number(),
    })),
    lastSeen: v.number(),
  })
    .index("by_location", ["location", "locationId"])
    .index("by_user", ["userId"])
    .index("by_session", ["sessionId"]),

  // AI Memory - for Mastra integration
  aiMemory: defineTable({
    threadId: v.string(),
    content: v.string(),
    role: v.union(v.literal("user"), v.literal("assistant"), v.literal("system")),
    embedding: v.optional(v.array(v.float64())),
    metadata: v.optional(v.any()),
    userId: v.id("users"),
  })
    .index("by_thread", ["threadId"])
    .index("by_user", ["userId"])
    .vectorIndex("by_embedding", {
      vectorField: "embedding",
      dimensions: 1536, // OpenAI embeddings
      filterFields: ["threadId", "userId"],
    }),

  // Contexts - for AI contextual references (replaces some board/asset functionality)
  contexts: defineTable({
    type: v.union(v.literal("thread"), v.literal("user"), v.literal("url"), v.literal("file")),
    title: v.optional(v.string()),
    content: v.string(),
    metadata: v.optional(v.any()),
    embedding: v.optional(v.array(v.float64())),
    userId: v.id("users"),
  })
    .index("by_user", ["userId"])
    .index("by_type", ["type"])
    .vectorIndex("by_embedding", {
      vectorField: "embedding",
      dimensions: 1536,
      filterFields: ["type", "userId"],
    }),

  // Message-context links
  messageContexts: defineTable({
    messageId: v.id("messages"),
    contextId: v.id("contexts"),
    metadata: v.optional(v.any()),
  })
    .index("by_message", ["messageId"])
    .index("by_context", ["contextId"])
    .index("by_message_and_context", ["messageId", "contextId"]),
});