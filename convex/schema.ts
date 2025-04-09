import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  users: defineTable({
    name: v.string(),
    email: v.string(),
    image: v.string(),
    role: v.union(v.literal("interviewer"), v.literal("candidate")),
    clerkId: v.string(),
  }).index("by_clerk_id", ["clerkId"]),

  interviews: defineTable({
    title: v.string(),
    description: v.optional(v.string()),
    startTime: v.number(),
    endTime: v.optional(v.number()), // kuch log dalte hai end time kuch log nhi dalte
    status: v.union(
      v.literal("scheduled"),
      v.literal("completed"),
      v.literal("cancelled")
    ),
    streamCallId: v.string(),
    candidateId: v.string(),
    interviwersId: v.array(v.string()), // ek interview me multiple interviewers ho sakte hai
  })
    .index("by_candidate_id", ["candidateId"])
    .index("by_stream_id", ["streamCallId"]),

  comments: defineTable({
    content: v.string(),
    rating: v.number(),
    interviwerId: v.string(),
    interviewId: v.id("interviews"),
  }).index("by_interview_id", ["interviewId"]),
});
