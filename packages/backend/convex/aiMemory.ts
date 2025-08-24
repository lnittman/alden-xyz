import { v } from "convex/values";
import { mutation, query, action } from "./_generated/server";
import { Doc, Id } from "./_generated/dataModel";
import { api } from "./_generated/api";

// Save AI memory with embedding
export const save = mutation({
  args: {
    threadId: v.string(),
    content: v.string(),
    role: v.union(v.literal("user"), v.literal("assistant"), v.literal("system")),
    embedding: v.optional(v.array(v.float64())),
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

    return await ctx.db.insert("aiMemory", {
      threadId: args.threadId,
      content: args.content,
      role: args.role,
      embedding: args.embedding,
      metadata: args.metadata,
      userId: user._id,
    });
  },
});

// Get memories for a thread
export const getByThread = query({
  args: {
    threadId: v.string(),
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

    const memories = await ctx.db
      .query("aiMemory")
      .withIndex("by_thread", (q) => q.eq("threadId", args.threadId))
      .filter((q) => q.eq(q.field("userId"), user._id))
      .order("desc")
      .take(args.limit || 100);

    return memories.reverse(); // Return in chronological order
  },
});

// Vector search for semantic recall
export const semanticSearch = action({
  args: {
    vector: v.array(v.float64()),
    threadId: v.optional(v.string()),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      return [];
    }

    // Use Convex's vector search
    const results = await ctx.vectorSearch("aiMemory", "by_embedding", {
      vector: args.vector,
      limit: args.limit || 5,
      filter: args.threadId
        ? (q: any) => q.eq("threadId", args.threadId)
        : undefined,
    });

    // Get full documents for the results
    const memories = await Promise.all(
      results.map((r) => ctx.runQuery(api.aiMemory.getById, { id: r._id }))
    );

    return memories.filter(Boolean);
  },
});

// Get memory by ID
export const getById = query({
  args: { id: v.id("aiMemory") },
  handler: async (ctx, args) => {
    const memory = await ctx.db.get(args.id);
    if (!memory) {
      return null;
    }

    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      return null;
    }

    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
      .first();

    if (!user || memory.userId !== user._id) {
      return null;
    }

    return memory;
  },
});

// Clear memories for a thread
export const clearThread = mutation({
  args: { threadId: v.string() },
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

    const memories = await ctx.db
      .query("aiMemory")
      .withIndex("by_thread", (q) => q.eq("threadId", args.threadId))
      .filter((q) => q.eq(q.field("userId"), user._id))
      .collect();

    for (const memory of memories) {
      await ctx.db.delete(memory._id);
    }

    return memories.length;
  },
});

// Get all threads for a user
export const getThreads = query({
  args: {},
  handler: async (ctx) => {
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

    const memories = await ctx.db
      .query("aiMemory")
      .withIndex("by_user", (q) => q.eq("userId", user._id))
      .collect();

    // Get unique thread IDs
    const threadIds = [...new Set(memories.map((m) => m.threadId))];

    // Get summary for each thread (first and last message)
    const threads = await Promise.all(
      threadIds.map(async (threadId) => {
        const threadMemories = memories
          .filter((m) => m.threadId === threadId)
          .sort((a, b) => a._creationTime - b._creationTime);

        const firstMessage = threadMemories[0];
        const lastMessage = threadMemories[threadMemories.length - 1];

        return {
          threadId,
          messageCount: threadMemories.length,
          firstMessage: firstMessage?.content,
          lastMessage: lastMessage?.content,
          createdAt: firstMessage?._creationTime,
          updatedAt: lastMessage?._creationTime,
        };
      })
    );

    return threads.sort((a, b) => (b.updatedAt || 0) - (a.updatedAt || 0));
  },
});

// Export for Mastra integration
export const exportForMastra = query({
  args: {
    threadId: v.string(),
    format: v.optional(v.union(v.literal("json"), v.literal("text"))),
  },
  handler: async (ctx, args) => {
    const memories = await getByThread(ctx, {
      threadId: args.threadId,
      limit: 1000,
    });

    if (args.format === "text") {
      return memories
        .map((m) => `[${m.role}]: ${m.content}`)
        .join("\n\n");
    }

    return memories;
  },
});