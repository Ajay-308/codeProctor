import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

// get all templetes
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
    description: v.string(),
    difficulty: v.union(
      v.literal("easy"),
      v.literal("medium"),
      v.literal("hard"),
      v.literal("expert")
    ),
    language: v.string(),
    tags: v.array(v.string()),
    timeLimit: v.number(),
    updatedAt: v.optional(v.string()),
    createdAt: v.optional(v.string()),
    usageCount: v.optional(v.number()),
    explanation: v.optional(v.string()),
    inputFormat: v.optional(v.string()),
    outputFormat: v.optional(v.string()),
    sampleInput: v.optional(v.string()),
    sampleOutput: v.optional(v.string()),
    constraints: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const now = new Date().toISOString();
    await ctx.db.insert("templetes", {
      ...args,
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

      // Optional LeetCode fields
      inputFormat: v.optional(v.string()),
      outputFormat: v.optional(v.string()),
      constraints: v.optional(v.string()),
      sampleInput: v.optional(v.string()),
      sampleOutput: v.optional(v.string()),
      explanation: v.optional(v.string()),
    }),
  },
  handler: async (ctx, { id, updates }) => {
    const now = new Date().toISOString();
    await ctx.db.patch(id, { ...updates, updatedAt: now });
  },
});

export const duplicateTemmpletes = mutation({
  args: {
    id: v.id("templetes"),
  },
  handler: async (ctx, { id }) => {
    const templete = await ctx.db.get(id);
    if (!templete) throw new Error("templete not found");

    const now = new Date().toISOString();

    // Exclude internal Convex fields
    const { _id, _creationTime: _, ...cleanTemplete } = templete;
    console.log(_id, _);
    const newTemplete = {
      ...cleanTemplete,
      createdAt: now,
      updatedAt: now,
      usageCount: 0,
    };

    const newId = await ctx.db.insert("templetes", newTemplete);
    return newId;
  },
});

export const deleteTempletes = mutation({
  args: {
    id: v.id("templetes"),
  },
  handler: async (ctx, { id }) => {
    const templetes = await ctx.db.get(id);
    if (!templetes) throw new Error("templete not dound");

    await ctx.db.delete(id);
    return { success: true, message: "templete deleted successfully" };
  },
});
