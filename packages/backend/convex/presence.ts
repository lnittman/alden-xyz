import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { Doc, Id } from "./_generated/dataModel";

// Update user presence
export const update = mutation({
  args: {
    location: v.string(), // "board", "chat", "home", etc.
    locationId: v.string(), // ID of the specific board/chat
    cursor: v.optional(v.object({
      x: v.number(),
      y: v.number(),
    })),
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

    // Generate a session ID (you might want to pass this from client)
    const sessionId = `${user._id}-${Date.now()}`;

    // Check if user already has presence
    const existing = await ctx.db
      .query("presence")
      .withIndex("by_user", (q) => q.eq("userId", user._id))
      .first();

    if (existing) {
      // Update existing presence
      await ctx.db.patch(existing._id, {
        location: args.location,
        locationId: args.locationId,
        cursor: args.cursor,
        lastSeen: Date.now(),
      });
      return existing._id;
    } else {
      // Create new presence
      return await ctx.db.insert("presence", {
        userId: user._id,
        sessionId,
        location: args.location,
        locationId: args.locationId,
        cursor: args.cursor,
        lastSeen: Date.now(),
      });
    }
  },
});

// Get presence for a location
export const getByLocation = query({
  args: {
    location: v.string(),
    locationId: v.string(),
  },
  handler: async (ctx, args) => {
    // Get all presence entries for this location
    const presences = await ctx.db
      .query("presence")
      .withIndex("by_location", (q) =>
        q.eq("location", args.location).eq("locationId", args.locationId)
      )
      .collect();

    // Filter out stale presence (older than 30 seconds)
    const activePresences = presences.filter(
      (p) => Date.now() - p.lastSeen < 30000
    );

    // Get user info for each presence
    const enrichedPresences = await Promise.all(
      activePresences.map(async (p) => {
        const user = await ctx.db.get(p.userId);
        return {
          ...p,
          user,
        };
      })
    );

    return enrichedPresences.filter((p) => p.user !== null);
  },
});

// Remove presence (when user leaves)
export const remove = mutation({
  args: {},
  handler: async (ctx) => {
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

    const presence = await ctx.db
      .query("presence")
      .withIndex("by_user", (q) => q.eq("userId", user._id))
      .first();

    if (presence) {
      await ctx.db.delete(presence._id);
    }
  },
});

// Heartbeat to keep presence alive
export const heartbeat = mutation({
  args: {},
  handler: async (ctx) => {
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

    const presence = await ctx.db
      .query("presence")
      .withIndex("by_user", (q) => q.eq("userId", user._id))
      .first();

    if (presence) {
      await ctx.db.patch(presence._id, {
        lastSeen: Date.now(),
      });
    }
  },
});

// Cleanup stale presence entries (could be run as a scheduled function)
export const cleanup = mutation({
  args: {},
  handler: async (ctx) => {
    const staleTime = Date.now() - 60000; // 1 minute old
    
    const allPresences = await ctx.db.query("presence").collect();
    
    for (const presence of allPresences) {
      if (presence.lastSeen < staleTime) {
        await ctx.db.delete(presence._id);
      }
    }
  },
});

// Get active users count
export const getActiveUsersCount = query({
  args: {},
  handler: async (ctx) => {
    const activeTime = Date.now() - 30000; // 30 seconds
    
    const presences = await ctx.db
      .query("presence")
      .collect();
    
    const activePresences = presences.filter(
      (p) => p.lastSeen > activeTime
    );
    
    // Count unique users
    const uniqueUsers = new Set(activePresences.map((p) => p.userId));
    
    return uniqueUsers.size;
  },
});

// Subscribe to presence changes for a location (real-time)
export const subscribe = query({
  args: {
    location: v.string(),
    locationId: v.string(),
  },
  handler: async (ctx, args) => {
    // This query will automatically re-run when presence data changes
    return await getByLocation(ctx, args);
  },
});