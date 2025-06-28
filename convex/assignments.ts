import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { Id } from "./_generated/dataModel";

// ------------------------- GET A SINGLE ASSIGNMENT -------------------------
export const getAssignment = query({
  args: { id: v.string() },
  handler: async (ctx, args) => {
    const assignmentId = args.id as Id<"assignments">;

    const assignment = await ctx.db.get(assignmentId);
    if (!assignment) throw new Error("Assignment not found");

    return assignment;
  },
});

// ------------------------- GET SUBMISSIONS FOR ASSIGNMENT -------------------------
export const getSubmissionsForAssignment = query({
  args: { assignmentId: v.string() },
  handler: async (ctx, args) => {
    const assignmentId = args.assignmentId as Id<"assignments">;

    try {
      const submissions = await ctx.db
        .query("assignmentSubmissions")
        .filter((q) => q.eq(q.field("assignmentId"), assignmentId))
        .collect();

      return submissions;
    } catch (error) {
      console.error("Error fetching submissions:", error);
      return [];
    }
  },
});

// ------------------------- LIST ALL ASSIGNMENTS -------------------------
export const listAssignments = query({
  handler: async (ctx) => {
    const assignments = await ctx.db.query("assignments").collect();

    const enriched = await Promise.all(
      assignments.map(async (assignment) => {
        const submissions = await ctx.db
          .query("assignmentSubmissions")
          .filter((q) => q.eq(q.field("assignmentId"), assignment._id))
          .collect();

        const totalScore = submissions.reduce(
          (sum, sub) => sum + (sub.score || 0),
          0
        );

        const avgScore =
          submissions.length > 0 ? totalScore / submissions.length : null;

        return {
          ...assignment,
          submissionsCount: submissions.length,
          avgScore,
        };
      })
    );

    return enriched;
  },
});

// ------------------------- CREATE ASSIGNMENT -------------------------
export const createAssignment = mutation({
  args: {
    title: v.string(),
    description: v.optional(v.string()),
    dueDate: v.number(),
    createdBy: v.string(),
    passingScore: v.number(),
    type: v.optional(v.string()),
    timeLimit: v.optional(v.number()),
    status: v.optional(v.string()),

    candidateEmails: v.array(v.string()),
    instructions: v.optional(v.string()),
    sendImmediately: v.boolean(),
    reminderEnabled: v.boolean(),

    templateId: v.optional(v.string()),
    tags: v.optional(v.array(v.string())),

    questions: v.array(
      v.object({
        id: v.number(),
        question: v.string(),
        content: v.optional(v.string()),
        type: v.optional(v.string()),
        points: v.optional(v.number()),
        options: v.array(v.string()),
        correctAnswer: v.string(),
        metadata: v.optional(v.any()),
      })
    ),
  },
  handler: async (ctx, args) => {
    const assignmentId = await ctx.db.insert("assignments", {
      title: args.title,
      description: args.description,
      dueDate: args.dueDate,
      createdBy: args.createdBy,
      passingScore: args.passingScore,
      type: args.type,
      timeLimit: args.timeLimit,
      status: args.status || "draft",

      candidateEmails: args.candidateEmails,
      instructions: args.instructions,
      sendImmediately: args.sendImmediately,
      reminderEnabled: args.reminderEnabled,

      templateId: args.templateId,
      tags: args.tags,

      questions: args.questions,
    });

    return assignmentId;
  },
});

// ------------------------- SUBMIT ASSIGNMENT -------------------------
export const submitAssignment = mutation({
  args: {
    assignmentId: v.id("assignments"),
    candidateId: v.id("users"),
    candidateName: v.optional(v.string()),
    completionTime: v.optional(v.number()),
    score: v.number(),
    answers: v.array(
      v.object({
        questionId: v.number(),
        selectedAnswer: v.string(),
        isCorrect: v.boolean(),
      })
    ),
  },
  handler: async (ctx, args) => {
    const submissionId = await ctx.db.insert("assignmentSubmissions", {
      assignmentId: args.assignmentId,
      candidateId: args.candidateId,
      candidateName: args.candidateName,
      submittedAt: Date.now(),
      completionTime: args.completionTime,
      score: args.score,
      answers: args.answers,
    });

    return submissionId;
  },
});
