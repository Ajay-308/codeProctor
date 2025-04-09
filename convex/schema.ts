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
});
