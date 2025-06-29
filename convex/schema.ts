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
    uuid: v.string(),
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
    .index("by_interviewer_id", ["interviewerIds"])
    .index("by_uuid", ["uuid"]),
  comments: defineTable({
    content: v.string(),
    rating: v.number(),
    interviewerId: v.string(),
    interviewId: v.id("interviews"),
  }).index("by_interview_id", ["interviewId"]),
  mcqTemplates: defineTable({
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
    usageCount: v.number(),
    createdBy: v.string(),
    createdAt: v.number(),
    updatedAt: v.number(),
  }),

  mcqAssignments: defineTable({
    templateId: v.id("mcqTemplates"),
    title: v.string(),
    description: v.string(),
    candidateEmails: v.array(v.string()),
    dueDate: v.number(),
    instructions: v.optional(v.string()),
    sendImmediately: v.boolean(),
    reminderEnabled: v.boolean(),
    createdBy: v.string(),
    status: v.string(),
    timeLimit: v.number(),
    passingScore: v.number(),
    totalPoints: v.number(),
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
    createdAt: v.number(),
    updatedAt: v.number(),
  }),

  candidateAssignments: defineTable({
    assignmentId: v.id("mcqAssignments"),
    candidateEmail: v.string(),
    status: v.union(
      v.literal("pending"),
      v.literal("in_progress"),
      v.literal("completed"),
      v.literal("expired")
    ),
    startedAt: v.optional(v.number()),
    submittedAt: v.optional(v.number()),
    answers: v.array(
      v.object({
        questionId: v.string(),
        selectedOptions: v.array(v.string()),
        flagged: v.boolean(),
      })
    ),
    score: v.optional(v.number()),
    timeSpent: v.optional(v.number()),
    createdAt: v.number(),
  }),

  templetes: defineTable({
    title: v.string(),
    description: v.optional(v.string()),
    tags: v.array(v.string()),
    difficulty: v.union(
      v.literal("easy"),
      v.literal("medium"),
      v.literal("hard"),
      v.literal("expert")
    ),
    language: v.string(),
    timeLimit: v.number(),
    usageCount: v.number(),
    updatedAt: v.string(),
    inputFormat: v.optional(v.string()),
    outputFormat: v.optional(v.string()),
    constraints: v.optional(v.string()),
    sampleInput: v.optional(v.string()),
    sampleOutput: v.optional(v.string()),
    explanation: v.optional(v.string()),
  }),

  // ---------------- Questions (linked to templetes) ----------------
  questions: defineTable({
    questionText: v.string(),
    type: v.union(v.literal("multiple-choice"), v.literal("open-ended")),
    options: v.optional(v.array(v.string())),
    correctAnswer: v.string(),
    templateId: v.id("templetes"),
  }).index("by_template_id", ["templateId"]),

  // ---------------- Assessments from Templates ----------------
  assessmentSubmissions: defineTable({
    templateId: v.id("templetes"),
    candidateId: v.id("users"),
    candidateName: v.optional(v.string()),
    submittedAt: v.number(),
    completionTime: v.optional(v.number()),
    score: v.number(),
    answers: v.array(
      v.object({
        questionId: v.string(),
        selectedAnswer: v.string(),
        isCorrect: v.boolean(),
      })
    ),
  }).index("by_template_id", ["templateId"]),

  assignments: defineTable({
    createdBy: v.string(),
    title: v.string(),
    description: v.string(),
    dueDate: v.number(),
    passingScore: v.number(),
    type: v.string(),
    timeLimit: v.number(),
    status: v.string(),
    questions: v.array(v.any()),
    templateId: v.optional(v.string()),
    tags: v.array(v.string()),
    candidateEmails: v.array(v.string()),
    sendImmediately: v.boolean(),
    reminderEnabled: v.boolean(),
  }),
});
