import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  workspaces: defineTable({
    name: v.string(),
    userId: v.string(),
  }),
  
  environments: defineTable({
    workspaceId: v.id("workspaces"),
    name: v.string(),
    variables: v.array(
      v.object({
        id: v.string(),
        key: v.string(),
        value: v.string(),
      })
    ),
  }).index("by_workspace", ["workspaceId"]),
});