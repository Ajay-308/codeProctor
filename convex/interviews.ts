import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

// Queries
export const getAllInterviews = query({
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Unauthorized");

    return await ctx.db.query("interviews").collect();
  },
});

export const getInterview = query({
  handler: async (ctx) => {
    const userIdentity = await ctx.auth.getUserIdentity();
    if (!userIdentity) throw new Error("user not authenticated");

    return await ctx.db
      .query("interviews")
      .withIndex("by_candidate_id", (q) =>
        q.eq("candidateId", userIdentity.subject)
      )
      .collect();
  },
});

export const getInterviewByStreamId = query({
  args: { streamCallId: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("interviews")
      .withIndex("by_stream_call_id", (q) =>
        q.eq("streamCallId", args.streamCallId)
      )
      .first();
  },
});

export const debugAllInterviews = query({
  handler: async (ctx) => {
    return await ctx.db.query("interviews").collect();
  },
});

export const getInterviewByInterviewerId = query({
  args: { interviewerId: v.string() },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Unauthorized user");

    const allInterviews = await ctx.db.query("interviews").collect();

    // Manually filter interviews where the interviewer is included
    return allInterviews.filter((interview) =>
      interview.interviewerIds.includes(args.interviewerId)
    );
  },
});

export const getInterviewByUUID = query({
  args: { uuid: v.string() },
  handler: async (ctx, { uuid }) => {
    return await ctx.db
      .query("interviews")
      .withIndex("by_uuid", (q) => q.eq("uuid", uuid))
      .first();
  },
});

export const getInterviewByUuid = getInterviewByUUID; // alias

export const debugAllInterviewswithId = query({
  handler: async (ctx) => {
    const all = await ctx.db.query("interviews").collect();
    console.log(
      "INTERVIEWS:",
      all.map((i) => i.uuid)
    );
    return all;
  },
});

// Mutations
export const updateInterview = mutation({
  args: {
    id: v.id("interviews"),
    status: v.string(),
  },
  handler: async (ctx, args) => {
    return await ctx.db.patch(args.id, {
      status: args.status,
      ...(args.status === "completed" ? { endTime: Date.now() } : {}),
    });
  },
});
