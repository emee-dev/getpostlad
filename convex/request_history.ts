import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

export const createResponseHistory = mutation({
  args: {
    headers: v.array(
      v.object({
        key: v.string(),
        value: v.string(),
      })
    ),
    text_response: v.string(),
    status: v.number(),
    elapsed_time: v.number(),
    content_size: v.number(),
    workspaceId: v.id("workspaces"),
    userId: v.string(),
    requestPath: v.string(),
  },
  handler: async (ctx, args) => {
    // Check if a history entry with the same status already exists
    const existingHistory = await ctx.db
      .query("request_history")
      .withIndex("by_user_workspace_path_status", (q) =>
        q.eq("userId", args.userId)
         .eq("workspaceId", args.workspaceId)
         .eq("requestPath", args.requestPath)
         .eq("status", args.status)
      )
      .first();

    if (existingHistory) {
      // Update existing entry instead of creating a new one
      await ctx.db.patch(existingHistory._id, {
        headers: args.headers,
        text_response: args.text_response,
        elapsed_time: args.elapsed_time,
        content_size: args.content_size,
      });
      return existingHistory._id;
    } else {
      // Create new history entry
      const historyId = await ctx.db.insert("request_history", {
        headers: args.headers,
        text_response: args.text_response,
        status: args.status,
        elapsed_time: args.elapsed_time,
        content_size: args.content_size,
        workspaceId: args.workspaceId,
        userId: args.userId,
        requestPath: args.requestPath,
      });
      return historyId;
    }
  },
});

export const getHistories = query({
  args: {
    userId: v.string(),
    workspaceId: v.id("workspaces"),
    requestPath: v.string(),
  },
  handler: async (ctx, args) => {
    // Get all histories for a specific request path
    return await ctx.db
      .query("request_history")
      .withIndex("by_user_workspace_path", (q) =>
        q.eq("userId", args.userId)
         .eq("workspaceId", args.workspaceId)
         .eq("requestPath", args.requestPath)
      )
      .order("desc")
      .collect();
  },
});

export const deleteHistory = mutation({
  args: {
    id: v.id("request_history"),
  },
  handler: async (ctx, args) => {
    await ctx.db.delete(args.id);
  },
});

export const deleteHistoriesByPath = mutation({
  args: {
    userId: v.string(),
    workspaceId: v.id("workspaces"),
    requestPath: v.string(),
  },
  handler: async (ctx, args) => {
    const histories = await ctx.db
      .query("request_history")
      .withIndex("by_user_workspace_path", (q) =>
        q.eq("userId", args.userId)
         .eq("workspaceId", args.workspaceId)
         .eq("requestPath", args.requestPath)
      )
      .collect();

    // Delete all histories for this path
    for (const history of histories) {
      await ctx.db.delete(history._id);
    }
  },
});