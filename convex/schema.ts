import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  users: defineTable({
    name: v.string(),
    email: v.string(),
    image: v.optional(v.string()),
    role: v.optional(v.union(v.literal("candidate"), v.literal("interviewer"))),
    userName: v.string(),
    clerkId: v.string(),
  })
    .index("by_clerk_id", ["clerkId"])
    .index("by_user_name", ["userName"]),

  interviews: defineTable({
    title: v.string(),
    description: v.optional(v.string()),
    startTime: v.number(),
    endTime: v.optional(v.number()),
    status: v.string(),
    streamCallId: v.string(),
    candidateId: v.string(),
    interviewerIds: v.array(v.string()),
  })
    .index("by_candidate_id", ["candidateId"])
    .index("by_stream_call_id", ["streamCallId"])
    .index("by_interviewer_id", ["interviewerIds"]),
  comments: defineTable({
    content: v.string(),
    rating: v.number(),
    interviewerId: v.string(),
    interviewId: v.id("interviews"),
  }).index("by_interview_id", ["interviewId"]),

  // yaha tak sab theek hai check point hai

  assignments: defineTable({
    title: v.string(),
    description: v.optional(v.string()),
    dueDate: v.number(),
    createdBy: v.string(),
    passingScore: v.number(),
    type: v.optional(v.string()),
    timeLimit: v.optional(v.number()),
    status: v.optional(v.string()),
    instructions: v.optional(v.string()),
    candidateEmails: v.array(v.string()),
    sendImmediately: v.boolean(),
    reminderEnabled: v.boolean(),
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

    // ✅ Add these new fields:
    templateId: v.optional(v.string()),
    tags: v.optional(v.array(v.string())),
  }),

  questions: defineTable({
    questionText: v.string(),
    type: v.union(v.literal("multiple-choice"), v.literal("open-ended")),
    options: v.optional(v.array(v.string())),
    correctAnswer: v.string(),
    assignmentId: v.id("assignments"),
  }).index("by_assignment_id", ["assignmentId"]),

  assignmentSubmissions: defineTable({
    assignmentId: v.id("assignments"),
    candidateId: v.id("users"),
    candidateName: v.optional(v.string()),
    submittedAt: v.number(),
    completionTime: v.optional(v.number()),
    score: v.number(),
    answers: v.array(
      v.object({
        questionId: v.number(),
        selectedAnswer: v.string(),
        isCorrect: v.boolean(),
      })
    ),
  })
    .index("by_assignment_id", ["assignmentId"])
    .index("by_candidate_id", ["candidateId"]),

  //assignment templetes
  templetes: defineTable({
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

    inputFormat: v.optional(v.string()),
    outputFormat: v.optional(v.string()),
    constraints: v.optional(v.string()),
    sampleInput: v.optional(v.string()),
    sampleOutput: v.optional(v.string()),
    explanation: v.optional(v.string()),

    createdAt: v.string(),
    updatedAt: v.string(),
    usageCount: v.number(),
  }),
});
