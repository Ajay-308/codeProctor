import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { Id } from "./_generated/dataModel";

// Get a single assignment by ID
export const getAssignment = query({
  args: { id: v.string() },
  handler: async (ctx, args) => {
    // Convert string ID to Convex ID
    const assignmentId = args.id as Id<"assignments">;

    try {
      const assignment = await ctx.db.get(assignmentId);
      if (!assignment) {
        throw new Error("Assignment not found");
      }
      return assignment;
    } catch (error) {
      console.error("Error fetching assignment:", error);
      throw new Error("Failed to fetch assignment");
    }
  },
});

// Get all submissions for a specific assignment
export const getSubmissionsForAssignment = query({
  args: { assignmentId: v.string() },
  handler: async (ctx, args) => {
    // Convert string ID to Convex ID
    const assignmentId = args.assignmentId as Id<"assignments">;

    try {
      const submissions = await ctx.db
        .query("assignmentSubmissions")
        .filter((q) => q.eq(q.field("assignmentId"), assignmentId))
        .collect();

      return submissions;
    } catch (error) {
      console.error("Error fetching submissions:", error);
      return []; // Return empty array if query fails
    }
  },
});

// List all assignments (useful for assignments listing page)
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

// Create a new assignment
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
    questions: v.array(
      v.object({
        id: v.number(),
        question: v.string(),
        options: v.array(v.string()),
        correctAnswer: v.string(),
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
      questions: args.questions,
    });

    return assignmentId;
  },
});

// Submit an assignment (for candidates)
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
