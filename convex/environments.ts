import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

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
    await ctx.db.patch(args.id, {
      variables: args.variables,
    });
  },
});