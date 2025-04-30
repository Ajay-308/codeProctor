import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

export const getTempletes = query({
  handler: async (ctx) => {
    const templetes = await ctx.db.query("templetes").collect();

    return templetes;
  },
});

//
export const addTempletes = mutation({
  args: {
    title: v.string(),
    description: v.optional(v.string()),
    difficulty: v.union(
      v.literal("easy"),
      v.literal("medium"),
      v.literal("hard"),
      v.literal("expert")
    ),
    language: v.string(),
    tags: v.array(v.string()),
    timeLimit: v.number(),
  },
  handler: async (ctx, args) => {
    const now = new Date().toISOString();
    await ctx.db.insert("templetes", {
      ...args,
      createdAt: now,
      updatedAt: now,
      usageCount: 0,
    });
  },
});

// update templete

export const updateTempletes = mutation({
  args: {
    id: v.id("templetes"),
    updates: v.object({
      title: v.optional(v.string()),
      description: v.optional(v.string()),
      difficulty: v.optional(
        v.union(
          v.literal("easy"),
          v.literal("medium"),
          v.literal("hard"),
          v.literal("expert")
        )
      ),
      language: v.optional(v.string()),
      tags: v.optional(v.array(v.string())),
      timeLimit: v.optional(v.number()),
    }),
  },
  handler: async (ctx, { id, updates }) => {
    const now = new Date().toISOString();
    await ctx.db.patch(id, { ...updates, updatedAt: now });
  },
});

// delete templete

export const deleteTempletes = mutation({
  args: {
    id: v.id("templetes"),
  },
  handler: async (ctx, { id }) => {
    await ctx.db.delete(id);
    return;
  },
});
