import { mutation } from "./_generated/server";
import { v } from "convex/values";

/**
 * Unauthenticated mutation to store purchase data from Freemius checkout
 * This allows the Freemius webhook/callback to store purchase information
 * without requiring user authentication
 */
export const storePurchase = mutation({
  args: {
    purchase: v.any(), // Raw purchase object from Freemius checkout
  },
  handler: async (ctx, args) => {
    try {
      // Store the raw purchase object for later inspection
      const subscriptionId = await ctx.db.insert("subscriptions", {
        purchase: args.purchase,
      });
      
      console.log("Purchase stored successfully:", subscriptionId);
      return subscriptionId;
    } catch (error) {
      console.error("Error storing purchase:", error);
      throw new Error(`Failed to store purchase: ${error instanceof Error ? error.message : "Unknown error"}`);
    }
  },
});

/**
 * Query to retrieve all stored purchases (for debugging/inspection)
 * Note: This is a public query for now - you may want to add authentication later
 */
export const getAllPurchases = mutation({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("subscriptions").collect();
  },
});

/**
 * Query to retrieve a specific purchase by ID
 */
export const getPurchaseById = mutation({
  args: {
    id: v.id("subscriptions"),
  },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.id);
  },
});