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

    // Check for duplicate paths (case-insensitive)
    const existingWorkspace = await ctx.db
      .query("workspaces")
      .withIndex("by_path", (q) => q.eq("path", workspacePath))
      .first();

    if (existingWorkspace) {
      // If path already exists, append a number to make it unique
      let counter = 1;
      let uniquePath = `${workspacePath}-${counter}`;
      
      while (true) {
        const pathExists = await ctx.db
          .query("workspaces")
          .withIndex("by_path", (q) => q.eq("path", uniquePath))
          .first();
        
        if (!pathExists) {
          workspacePath = uniquePath;
          break;
        }
        
        counter++;
        uniquePath = `${workspacePath}-${counter}`;
        
        // Prevent infinite loop
        if (counter > 1000) {
          throw new Error("Unable to generate unique workspace path");
        }
      }
    }

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