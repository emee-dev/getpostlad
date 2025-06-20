import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";
import { authTables } from "@convex-dev/auth/server";

const applicationTables = {
  workspaces: defineTable({
    name: v.string(),
    path: v.string(), // Unique lowercased path
    userId: v.string(),
  }).index("by_path", ["path"]), // Unique constraint on path
  
  environments: defineTable({
    workspaceId: v.id("workspaces"),
    name: v.string(), // Will be stored in lowercase
    variables: v.array(
      v.object({
        id: v.string(),
        key: v.string(),
        value: v.string(),
      })
    ),
  }).index("by_workspace", ["workspaceId"])
    .index("by_workspace_name", ["workspaceId", "name"]), // For duplicate name checking

  request_history: defineTable({
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
    requestPath: v.string(), // FileNode["path"]
  }).index("by_user_workspace", ["userId", "workspaceId"])
    .index("by_user_workspace_path", ["userId", "workspaceId", "requestPath"])
    .index("by_user_workspace_path_status", ["userId", "workspaceId", "requestPath", "status"]),
};

export default defineSchema({
  ...authTables,
  ...applicationTables,
});