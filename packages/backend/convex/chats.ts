import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { Doc, Id } from "./_generated/dataModel";

// Create a new chat
export const create = mutation({
  args: {
    type: v.union(v.literal("personal"), v.literal("direct"), v.literal("group")),
    name: v.optional(v.string()),
    participantIds: v.optional(v.array(v.id("users"))),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }

    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
      .first();

    if (!user) {
      throw new Error("User not found");
    }

    // Create the chat
    const chatId = await ctx.db.insert("chats", {
      type: args.type,
      name: args.name,
      isArchived: false,
      pinned: false,
      createdBy: user._id,
    });

    // Add creator as participant
    await ctx.db.insert("chatParticipants", {
      chatId,
      userId: user._id,
      joinedAt: Date.now(),
    });

    // Add other participants if specified
    if (args.participantIds) {
      for (const participantId of args.participantIds) {
        if (participantId !== user._id) {
          await ctx.db.insert("chatParticipants", {
            chatId,
            userId: participantId,
            joinedAt: Date.now(),
          });
        }
      }
    }

    return chatId;
  },
});

// Get all chats for current user
export const list = query({
  args: {
    archived: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      return [];
    }

    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
      .first();

    if (!user) {
      return [];
    }

    // Get all chat participations
    const participations = await ctx.db
      .query("chatParticipants")
      .withIndex("by_user", (q) => q.eq("userId", user._id))
      .collect();

    // Get all chats
    const chats = await Promise.all(
      participations.map(async (p) => {
        const chat = await ctx.db.get(p.chatId);
        if (!chat) return null;

        // Get participants
        const participants = await ctx.db
          .query("chatParticipants")
          .withIndex("by_chat", (q) => q.eq("chatId", p.chatId))
          .collect();

        const participantUsers = await Promise.all(
          participants.map((part) => ctx.db.get(part.userId))
        );

        return {
          ...chat,
          participants: participantUsers.filter(Boolean),
          lastReadAt: p.lastReadAt,
        };
      })
    );

    const validChats = chats.filter(Boolean) as any[];

    // Filter by archived status if specified
    if (args.archived !== undefined) {
      return validChats.filter((c) => c.isArchived === args.archived);
    }

    return validChats;
  },
});

// Get chat by ID
export const getById = query({
  args: { chatId: v.id("chats") },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      return null;
    }

    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
      .first();

    if (!user) {
      return null;
    }

    // Check if user is participant
    const participation = await ctx.db
      .query("chatParticipants")
      .withIndex("by_chat_and_user", (q) =>
        q.eq("chatId", args.chatId).eq("userId", user._id)
      )
      .first();

    if (!participation) {
      return null;
    }

    const chat = await ctx.db.get(args.chatId);
    if (!chat) {
      return null;
    }

    // Get participants
    const participants = await ctx.db
      .query("chatParticipants")
      .withIndex("by_chat", (q) => q.eq("chatId", args.chatId))
      .collect();

    const participantUsers = await Promise.all(
      participants.map((p) => ctx.db.get(p.userId))
    );

    return {
      ...chat,
      participants: participantUsers.filter(Boolean),
    };
  },
});

// Archive/unarchive chat
export const toggleArchive = mutation({
  args: { chatId: v.id("chats") },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }

    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
      .first();

    if (!user) {
      throw new Error("User not found");
    }

    // Check if user is participant
    const participation = await ctx.db
      .query("chatParticipants")
      .withIndex("by_chat_and_user", (q) =>
        q.eq("chatId", args.chatId).eq("userId", user._id)
      )
      .first();

    if (!participation) {
      throw new Error("Not a participant");
    }

    const chat = await ctx.db.get(args.chatId);
    if (!chat) {
      throw new Error("Chat not found");
    }

    await ctx.db.patch(args.chatId, {
      isArchived: !chat.isArchived,
    });

    return !chat.isArchived;
  },
});

// Pin/unpin chat
export const togglePin = mutation({
  args: { chatId: v.id("chats") },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }

    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
      .first();

    if (!user) {
      throw new Error("User not found");
    }

    // Check if user is participant
    const participation = await ctx.db
      .query("chatParticipants")
      .withIndex("by_chat_and_user", (q) =>
        q.eq("chatId", args.chatId).eq("userId", user._id)
      )
      .first();

    if (!participation) {
      throw new Error("Not a participant");
    }

    const chat = await ctx.db.get(args.chatId);
    if (!chat) {
      throw new Error("Chat not found");
    }

    await ctx.db.patch(args.chatId, {
      pinned: !chat.pinned,
    });

    return !chat.pinned;
  },
});

// Add participant to chat
export const addParticipant = mutation({
  args: {
    chatId: v.id("chats"),
    userId: v.id("users"),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }

    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
      .first();

    if (!user) {
      throw new Error("User not found");
    }

    const chat = await ctx.db.get(args.chatId);
    if (!chat) {
      throw new Error("Chat not found");
    }

    // Only group chats can have participants added
    if (chat.type !== "group") {
      throw new Error("Can only add participants to group chats");
    }

    // Check if user is participant
    const participation = await ctx.db
      .query("chatParticipants")
      .withIndex("by_chat_and_user", (q) =>
        q.eq("chatId", args.chatId).eq("userId", user._id)
      )
      .first();

    if (!participation) {
      throw new Error("Not a participant");
    }

    // Check if already participant
    const existing = await ctx.db
      .query("chatParticipants")
      .withIndex("by_chat_and_user", (q) =>
        q.eq("chatId", args.chatId).eq("userId", args.userId)
      )
      .first();

    if (existing) {
      return existing._id;
    }

    return await ctx.db.insert("chatParticipants", {
      chatId: args.chatId,
      userId: args.userId,
      joinedAt: Date.now(),
    });
  },
});

// Mark chat as read
export const markAsRead = mutation({
  args: { chatId: v.id("chats") },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }

    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
      .first();

    if (!user) {
      throw new Error("User not found");
    }

    const participation = await ctx.db
      .query("chatParticipants")
      .withIndex("by_chat_and_user", (q) =>
        q.eq("chatId", args.chatId).eq("userId", user._id)
      )
      .first();

    if (!participation) {
      throw new Error("Not a participant");
    }

    await ctx.db.patch(participation._id, {
      lastReadAt: Date.now(),
    });
  },
});