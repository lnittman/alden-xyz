import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { Doc, Id } from "./_generated/dataModel";

// Send a message
export const send = mutation({
  args: {
    chatId: v.id("chats"),
    content: v.string(),
    type: v.optional(v.union(v.literal("text"), v.literal("image"), v.literal("file"), v.literal("system"))),
    metadata: v.optional(v.any()),
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

    // Check if user is participant
    const participation = await ctx.db
      .query("chatParticipants")
      .withIndex("by_chat_and_user", (q) =>
        q.eq("chatId", args.chatId).eq("userId", user._id)
      )
      .first();

    if (!participation) {
      throw new Error("Not a participant in this chat");
    }

    // Create the message
    const messageId = await ctx.db.insert("messages", {
      chatId: args.chatId,
      senderId: user._id,
      content: args.content,
      type: args.type || "text",
      metadata: args.metadata,
      isDeleted: false,
      isEdited: false,
    });

    // Update chat's last message
    await ctx.db.patch(args.chatId, {
      lastMessage: {
        content: args.content,
        senderId: user._id.toString(),
        createdAt: new Date().toISOString(),
      },
    });

    return messageId;
  },
});

// Get messages for a chat (with pagination)
export const list = query({
  args: {
    chatId: v.id("chats"),
    limit: v.optional(v.number()),
    cursor: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      return { messages: [], hasMore: false };
    }

    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
      .first();

    if (!user) {
      return { messages: [], hasMore: false };
    }

    // Check if user is participant
    const participation = await ctx.db
      .query("chatParticipants")
      .withIndex("by_chat_and_user", (q) =>
        q.eq("chatId", args.chatId).eq("userId", user._id)
      )
      .first();

    if (!participation) {
      return { messages: [], hasMore: false };
    }

    const limit = args.limit || 50;

    // Get messages
    let messagesQuery = ctx.db
      .query("messages")
      .withIndex("by_chat", (q) => q.eq("chatId", args.chatId))
      .order("desc");

    const messages = await messagesQuery.take(limit + 1);

    // Check if there are more messages
    const hasMore = messages.length > limit;
    const messagesToReturn = hasMore ? messages.slice(0, -1) : messages;

    // Get sender info for each message
    const enrichedMessages = await Promise.all(
      messagesToReturn.map(async (msg) => {
        const sender = await ctx.db.get(msg.senderId);
        return {
          ...msg,
          sender,
        };
      })
    );

    return {
      messages: enrichedMessages.reverse(), // Return in chronological order
      hasMore,
      nextCursor: hasMore ? messages[messages.length - 2]._id : undefined,
    };
  },
});

// Edit a message
export const edit = mutation({
  args: {
    messageId: v.id("messages"),
    content: v.string(),
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

    const message = await ctx.db.get(args.messageId);
    if (!message) {
      throw new Error("Message not found");
    }

    // Only sender can edit
    if (message.senderId !== user._id) {
      throw new Error("Only sender can edit message");
    }

    // Don't allow editing deleted messages
    if (message.isDeleted) {
      throw new Error("Cannot edit deleted message");
    }

    await ctx.db.patch(args.messageId, {
      content: args.content,
      isEdited: true,
    });

    return args.messageId;
  },
});

// Delete a message (soft delete)
export const deleteMessage = mutation({
  args: { messageId: v.id("messages") },
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

    const message = await ctx.db.get(args.messageId);
    if (!message) {
      throw new Error("Message not found");
    }

    // Only sender can delete
    if (message.senderId !== user._id) {
      throw new Error("Only sender can delete message");
    }

    await ctx.db.patch(args.messageId, {
      isDeleted: true,
      content: "[Message deleted]",
    });

    return args.messageId;
  },
});

// Subscribe to new messages (real-time)
export const subscribe = query({
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

    // Get the latest message
    const latestMessage = await ctx.db
      .query("messages")
      .withIndex("by_chat", (q) => q.eq("chatId", args.chatId))
      .order("desc")
      .first();

    if (latestMessage) {
      const sender = await ctx.db.get(latestMessage.senderId);
      return {
        ...latestMessage,
        sender,
      };
    }

    return null;
  },
});

// Search messages
export const search = query({
  args: {
    query: v.string(),
    chatId: v.optional(v.id("chats")),
    limit: v.optional(v.number()),
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

    // If chatId is specified, check participation
    if (args.chatId) {
      const participation = await ctx.db
        .query("chatParticipants")
        .withIndex("by_chat_and_user", (q) =>
          q.eq("chatId", args.chatId).eq("userId", user._id)
        )
        .first();

      if (!participation) {
        return [];
      }

      // Search in specific chat
      const messages = await ctx.db
        .query("messages")
        .withIndex("by_chat", (q) => q.eq("chatId", args.chatId))
        .filter((q) => q.eq(q.field("content"), args.query))
        .take(args.limit || 20);

      return messages;
    }

    // Search across all user's chats
    const participations = await ctx.db
      .query("chatParticipants")
      .withIndex("by_user", (q) => q.eq("userId", user._id))
      .collect();

    const allMessages: Doc<"messages">[] = [];
    for (const p of participations) {
      const messages = await ctx.db
        .query("messages")
        .withIndex("by_chat", (q) => q.eq("chatId", p.chatId))
        .filter((q) => q.eq(q.field("content"), args.query))
        .take(5);
      
      allMessages.push(...messages);
    }

    return allMessages.slice(0, args.limit || 20);
  },
});