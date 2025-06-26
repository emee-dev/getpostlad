import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { getAuthUserId } from "@convex-dev/auth/server";

export const create = mutation({
  args: {
    workspaceId: v.id("workspaces"),
    name: v.string(),
    variables: v.array(
      v.object({
        id: v.string(),
        key: v.string(),
        value: v.string(),
      })
    ),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (userId === null) {
      throw new Error("Not signed in");
    }

    // Verify the workspace belongs to the current user
    const workspace = await ctx.db.get(args.workspaceId);
    if (!workspace || workspace.userId !== userId) {
      throw new Error("Not authorized to create environments in this workspace");
    }

    // Convert name to lowercase to avoid case-sensitive duplicates
    const lowercaseName = args.name.toLowerCase().trim();
    
    if (!lowercaseName) {
      throw new Error("Environment name cannot be empty");
    }

    // Check for duplicate names (case-insensitive) within the same workspace
    const existingEnvironment = await ctx.db
      .query("environments")
      .withIndex("by_workspace_name", (q) =>
        q.eq("workspaceId", args.workspaceId).eq("name", lowercaseName)
      )
      .first();

    if (existingEnvironment) {
      throw new Error(`Environment with name "${lowercaseName}" already exists in this workspace`);
    }

    const environmentId = await ctx.db.insert("environments", {
      workspaceId: args.workspaceId,
      name: lowercaseName,
      variables: args.variables,
    });
    
    return environmentId;
  },
});

export const listByWorkspace = query({
  args: {
    workspaceId: v.id("workspaces"),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (userId === null) {
      throw new Error("Not signed in");
    }

    // Verify the workspace belongs to the current user
    const workspace = await ctx.db.get(args.workspaceId);
    if (!workspace || workspace.userId !== userId) {
      throw new Error("Not authorized to access environments in this workspace");
    }

    return await ctx.db
      .query("environments")
      .withIndex("by_workspace", (q) =>
        q.eq("workspaceId", args.workspaceId)
      )
      .collect();
  },
});

export const update = mutation({
  args: {
    id: v.id("environments"),
    variables: v.array(
      v.object({
        id: v.string(),
        key: v.string(),
        value: v.string(),
      })
    ),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (userId === null) {
      throw new Error("Not signed in");
    }

    // Get the environment and verify ownership through workspace
    const environment = await ctx.db.get(args.id);
    if (!environment) {
      throw new Error("Environment not found");
    }

    const workspace = await ctx.db.get(environment.workspaceId);
    if (!workspace || workspace.userId !== userId) {
      throw new Error("Not authorized to update this environment");
    }

    await ctx.db.patch(args.id, {
      variables: args.variables,
    });
  },
});

export const deleteEnv = mutation({
  args: {
    id: v.id("environments"),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (userId === null) {
      throw new Error("Not signed in");
    }

    // Get the environment and verify ownership through workspace
    const environment = await ctx.db.get(args.id);
    if (!environment) {
      throw new Error("Environment not found");
    }

    const workspace = await ctx.db.get(environment.workspaceId);
    if (!workspace || workspace.userId !== userId) {
      throw new Error("Not authorized to delete this environment");
    }

    // Delete the environment
    await ctx.db.delete(args.id);
  },
});