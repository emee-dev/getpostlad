import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { getAuthUserId } from "@convex-dev/auth/server";

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
    path: v.optional(v.string()), // Optional custom path
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (userId === null) {
      throw new Error("Not signed in");
    }

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
      userId: userId,
    });
    
    return workspaceId;
  },
});

export const list = query({
  args: {},
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (userId === null) {
      throw new Error("Not signed in");
    }

    return await ctx.db
      .query("workspaces")
      .filter((q) => q.eq(q.field("userId"), userId))
      .collect();
  },
});

export const getById = query({
  args: {
    id: v.id("workspaces"),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (userId === null) {
      throw new Error("Not signed in");
    }

    const workspace = await ctx.db.get(args.id);
    
    // Verify the workspace belongs to the current user
    if (workspace && workspace.userId !== userId) {
      throw new Error("Not authorized to access this workspace");
    }

    return workspace;
  },
});

export const getByPath = query({
  args: {
    path: v.string(),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (userId === null) {
      throw new Error("Not signed in");
    }

    const workspace = await ctx.db
      .query("workspaces")
      .withIndex("by_path", (q) => q.eq("path", args.path.toLowerCase()))
      .first();

    // Verify the workspace belongs to the current user
    if (workspace && workspace.userId !== userId) {
      throw new Error("Not authorized to access this workspace");
    }

    return workspace;
  },
});

export const deleteWorkspace = mutation({
  args: {
    id: v.id("workspaces"),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (userId === null) {
      throw new Error("Not signed in");
    }

    // Get the workspace and verify ownership
    const workspace = await ctx.db.get(args.id);
    if (!workspace) {
      throw new Error("Workspace not found");
    }

    if (workspace.userId !== userId) {
      throw new Error("Not authorized to delete this workspace");
    }

    // Get all environments in this workspace
    const environments = await ctx.db
      .query("environments")
      .withIndex("by_workspace", (q) => q.eq("workspaceId", args.id))
      .collect();

    // Delete all environments in this workspace
    for (const environment of environments) {
      await ctx.db.delete(environment._id);
    }

    // Get all request histories in this workspace
    const requestHistories = await ctx.db
      .query("request_history")
      .withIndex("by_user_workspace", (q) => 
        q.eq("userId", userId).eq("workspaceId", args.id)
      )
      .collect();

    // Delete all request histories in this workspace
    for (const history of requestHistories) {
      await ctx.db.delete(history._id);
    }

    // Finally, delete the workspace itself
    await ctx.db.delete(args.id);
  },
});