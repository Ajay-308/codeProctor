import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

export const createMCQAssignment = mutation({
  args: {
    templateId: v.id("mcqTemplates"),
    title: v.string(),
    description: v.string(),
    candidateEmails: v.array(v.string()),
    dueDate: v.number(),
    instructions: v.optional(v.string()),
    sendImmediately: v.boolean(),
    reminderEnabled: v.boolean(),
    createdBy: v.string(),
  },
  handler: async (ctx, args) => {
    const template = await ctx.db.get(args.templateId);
    if (!template) throw new Error("Template not found");

    // Increment usage count
    await ctx.db.patch(args.templateId, {
      usageCount: (template.usageCount ?? 0) + 1,
    });

    const assignmentId = await ctx.db.insert("mcqAssignments", {
      templateId: args.templateId,
      title: args.title,
      description: args.description,
      candidateEmails: args.candidateEmails,
      dueDate: args.dueDate,
      instructions: args.instructions,
      sendImmediately: args.sendImmediately,
      reminderEnabled: args.reminderEnabled,
      createdBy: args.createdBy,
      status: "active",
      timeLimit: template.timeLimit,
      passingScore: template.passingScore,
      totalPoints: template.totalPoints,
      questions: template.questions,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });

    // Create candidate records
    await Promise.all(
      args.candidateEmails.map((email) =>
        ctx.db.insert("candidateAssignments", {
          assignmentId,
          candidateEmail: email,
          status: "pending",
          startedAt: undefined,
          submittedAt: undefined,
          answers: [],
          score: undefined,
          timeSpent: undefined,
          createdAt: Date.now(),
        })
      )
    );

    return assignmentId;
  },
});

export const getMCQAssignments = query({
  args: { createdBy: v.optional(v.string()) },
  handler: async (ctx, args) => {
    let dbQuery = ctx.db.query("mcqAssignments");
    if (args.createdBy) {
      dbQuery = dbQuery.filter((q) =>
        q.eq(q.field("createdBy"), args.createdBy)
      );
    }
    return await dbQuery.collect();
  },
});

export const getMCQAssignmentById = query({
  args: { id: v.id("mcqAssignments") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.id);
  },
});

export const getCandidateAssignment = query({
  args: {
    assignmentId: v.id("mcqAssignments"),
    candidateEmail: v.string(),
  },
  handler: async (ctx, args) => {
    const candidateAssignment = await ctx.db
      .query("candidateAssignments")
      .filter((q) =>
        q.and(
          q.eq(q.field("assignmentId"), args.assignmentId),
          q.eq(q.field("candidateEmail"), args.candidateEmail)
        )
      )
      .first();

    if (!candidateAssignment) return null;

    const assignment = await ctx.db.get(args.assignmentId);
    return {
      ...candidateAssignment,
      assignment,
    };
  },
});
export const startAssignment = mutation({
  args: {
    assignmentId: v.id("mcqAssignments"),
    candidateEmail: v.string(),
  },
  handler: async (ctx, args) => {
    const candidateAssignment = await ctx.db
      .query("candidateAssignments")
      .filter((q) =>
        q.and(
          q.eq(q.field("assignmentId"), args.assignmentId),
          q.eq(q.field("candidateEmail"), args.candidateEmail)
        )
      )
      .first();

    if (!candidateAssignment) throw new Error("Assignment not found");
    if (candidateAssignment.status !== "pending")
      throw new Error("Assignment already started or completed");

    await ctx.db.patch(candidateAssignment._id, {
      status: "in_progress",
      startedAt: Date.now(),
    });

    return candidateAssignment._id;
  },
});

export const submitAssignment = mutation({
  args: {
    assignmentId: v.id("mcqAssignments"),
    candidateEmail: v.string(),
    answers: v.array(
      v.object({
        questionId: v.string(),
        selectedOptions: v.array(v.string()),
        flagged: v.boolean(),
      })
    ),
    timeSpent: v.number(),
  },
  handler: async (ctx, args) => {
    const candidateAssignment = await ctx.db
      .query("candidateAssignments")
      .filter((q) =>
        q.and(
          q.eq(q.field("assignmentId"), args.assignmentId),
          q.eq(q.field("candidateEmail"), args.candidateEmail)
        )
      )
      .first();

    if (!candidateAssignment) throw new Error("Candidate assignment not found");

    const assignment = await ctx.db.get(args.assignmentId);
    if (!assignment) throw new Error("Assignment not found");

    //Score Calculation
    let totalScore = 0;
    let maxScore = 0;

    for (const question of assignment.questions) {
      maxScore += question.points;
      const answer = args.answers.find((a) => a.questionId === question.id);
      if (!answer) continue;

      const correctOptions = question.options
        .filter((opt) => opt.isCorrect)
        .map((opt) => opt.id);

      const selected = answer.selectedOptions;

      if (question.type === "single") {
        if (selected.length === 1 && correctOptions.includes(selected[0])) {
          totalScore += question.points;
        }
      } else {
        const correctSelected = selected.filter((id) =>
          correctOptions.includes(id)
        );
        const incorrectSelected = selected.filter(
          (id) => !correctOptions.includes(id)
        );

        if (
          incorrectSelected.length === 0 &&
          correctSelected.length === correctOptions.length
        ) {
          totalScore += question.points;
        } else if (
          correctSelected.length > 0 &&
          incorrectSelected.length === 0
        ) {
          totalScore +=
            (question.points * correctSelected.length) / correctOptions.length;
        }
      }
    }

    const scorePercentage = (totalScore / maxScore) * 100;

    await ctx.db.patch(candidateAssignment._id, {
      status: "completed",
      submittedAt: Date.now(),
      answers: args.answers,
      score: scorePercentage,
      timeSpent: args.timeSpent,
    });

    return {
      score: scorePercentage,
      totalScore,
      maxScore,
      passed: scorePercentage >= assignment.passingScore,
    };
  },
});
