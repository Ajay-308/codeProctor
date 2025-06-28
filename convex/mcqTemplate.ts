import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

// Get all MCQ templates
export const getMCQTemplates = query({
  args: {},
  handler: async (ctx) => {
    const templates = await ctx.db.query("mcqTemplates").collect();
    return templates;
  },
});

// Get MCQ template by ID
export const getMCQTemplateById = query({
  args: { id: v.id("mcqTemplates") },
  handler: async (ctx, args) => {
    const template = await ctx.db.get(args.id);
    return template;
  },
});

// Create new MCQ template
export const createMCQTemplate = mutation({
  args: {
    title: v.string(),
    description: v.string(),
    category: v.string(),
    difficulty: v.union(
      v.literal("easy"),
      v.literal("medium"),
      v.literal("hard")
    ),
    timeLimit: v.number(),
    passingScore: v.number(),
    questions: v.array(
      v.object({
        id: v.string(),
        question: v.string(),
        options: v.array(
          v.object({
            id: v.string(),
            text: v.string(),
            isCorrect: v.boolean(),
          })
        ),
        type: v.union(v.literal("single"), v.literal("multiple")),
        points: v.number(),
        explanation: v.optional(v.string()),
        difficulty: v.union(
          v.literal("easy"),
          v.literal("medium"),
          v.literal("hard")
        ),
        category: v.string(),
      })
    ),
    tags: v.array(v.string()),
    totalPoints: v.number(),
    createdBy: v.string(),
  },
  handler: async (ctx, args) => {
    const templateId = await ctx.db.insert("mcqTemplates", {
      ...args,
      usageCount: 0,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });
    return templateId;
  },
});

// Update MCQ template
export const updateMCQTemplate = mutation({
  args: {
    id: v.id("mcqTemplates"),
    updates: v.object({
      title: v.optional(v.string()),
      description: v.optional(v.string()),
      category: v.optional(v.string()),
      difficulty: v.optional(
        v.union(v.literal("easy"), v.literal("medium"), v.literal("hard"))
      ),
      timeLimit: v.optional(v.number()),
      passingScore: v.optional(v.number()),
      questions: v.optional(
        v.array(
          v.object({
            id: v.string(),
            question: v.string(),
            options: v.array(
              v.object({
                id: v.string(),
                text: v.string(),
                isCorrect: v.boolean(),
              })
            ),
            type: v.union(v.literal("single"), v.literal("multiple")),
            points: v.number(),
            explanation: v.optional(v.string()),
            difficulty: v.union(
              v.literal("easy"),
              v.literal("medium"),
              v.literal("hard")
            ),
            category: v.string(),
          })
        )
      ),
      tags: v.optional(v.array(v.string())),
      totalPoints: v.optional(v.number()),
    }),
  },
  handler: async (ctx, args) => {
    const { id, updates } = args;
    await ctx.db.patch(id, {
      ...updates,
      updatedAt: Date.now(),
    });
    return id;
  },
});

// Delete MCQ template
export const deleteMCQTemplate = mutation({
  args: { id: v.id("mcqTemplates") },
  handler: async (ctx, args) => {
    await ctx.db.delete(args.id);
    return args.id;
  },
});

// Duplicate MCQ template
export const duplicateMCQTemplate = mutation({
  args: { id: v.id("mcqTemplates") },
  handler: async (ctx, args) => {
    const template = await ctx.db.get(args.id);
    if (!template) {
      throw new Error("Template not found");
    }
    const { ...rest } = template;

    const duplicatedTemplate = {
      ...rest,
      title: `${template.title} (Copy)`,
      usageCount: 0,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };

    const newTemplateId = await ctx.db.insert(
      "mcqTemplates",
      duplicatedTemplate
    );
    return newTemplateId;
  },
});
// Increment usage count
export const incrementUsageCount = mutation({
  args: { id: v.id("mcqTemplates") },
  handler: async (ctx, args) => {
    const template = await ctx.db.get(args.id);
    if (!template) {
      throw new Error("Template not found");
    }

    await ctx.db.patch(args.id, {
      usageCount: template.usageCount + 1,
      updatedAt: Date.now(),
    });
  },
});
