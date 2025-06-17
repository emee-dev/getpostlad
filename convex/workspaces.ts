import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

// Helper function to generate a unique path from name
function generatePath(name: string): string {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-') // Replace non-alphanumeric with hyphens
    .replace(/^-+|-+$/g, '') // Remove leading/trailing hyphens
    .replace(/-+/g, '-'); // Replace multiple hyphens with single hyphen
}

export const create = mutation({
  args: {
    name: v.string(),
    userId: v.string(),
    path: v.optional(v.string()), // Optional custom path
  },
  handler: async (ctx, args) => {
    const trimmedName = args.name.trim();
    
    if (!trimmedName) {
      throw new Error("Workspace name cannot be empty");
    }

    // Generate path from name if not provided, or use provided path
    let workspacePath = args.path ? args.path.toLowerCase().trim() : generatePath(trimmedName);
    
    if (!workspacePath) {
      throw new Error("Workspace path cannot be empty");
    }

    // Check for existing workspace with the same path
    const existingWorkspace = await ctx.db
      .query("workspaces")
      .withIndex("by_path", (q) => q.eq("path", workspacePath))
      .first();

    if (existingWorkspace) {
      // If workspace already exists, just return its ID (do nothing)
      return existingWorkspace._id;
    }

    // Create new workspace since it doesn't exist
    const workspaceId = await ctx.db.insert("workspaces", {
      name: trimmedName,
      path: workspacePath,
      userId: args.userId,
    });
    
    return workspaceId;
  },
});

export const list = query({
  args: {
    userId: v.string(),
  },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("workspaces")
      .filter((q) => q.eq(q.field("userId"), args.userId))
      .collect();
  },
});

export const getById = query({
  args: {
    id: v.id("workspaces"),
  },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.id);
  },
});

export const getByPath = query({
  args: {
    path: v.string(),
  },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("workspaces")
      .withIndex("by_path", (q) => q.eq("path", args.path.toLowerCase()))
      .first();
  },
});