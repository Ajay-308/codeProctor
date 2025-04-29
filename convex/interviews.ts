import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

// jitne bhi interview hai present sare dedo
export const getAllInterviews = query({
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Unauthorized");

    const interviews = await ctx.db.query("interviews").collect();

    return interviews;
  },
});

// jitne bhi interview present hai usme se ek interview ka data dedo
export const getInterview = query({
  handler: async (ctx) => {
    const userIdentity = await ctx.auth.getUserIdentity();
    if (!userIdentity) throw new Error("user not authenticated");

    const interviews = await ctx.db
      .query("interviews")
      .withIndex("by_candidate_id", (q) =>
        q.eq("candidateId", userIdentity.subject)
      )
      .collect();

    return interviews!;
  },
});

// stream call ke id se interview ka data ded
// interviews.ts
export const getInterviewByStreamId = query({
  args: { streamCallId: v.string() },
  handler: async (ctx, args) => {
    const idToSearch = args.streamCallId;

    const result = await ctx.db
      .query("interviews")
      .withIndex("by_stream_call_id", (q) => q.eq("streamCallId", idToSearch))
      .first();

    return result;
  },
});

export const debugAllInterviews = query({
  handler: async (ctx) => {
    return await ctx.db.query("interviews").collect();
  },
});

// interview create kardo
export const createInterview = mutation({
  args: {
    title: v.string(),
    description: v.optional(v.string()),
    startTime: v.number(),
    status: v.string(),
    streamCallId: v.string(),
    candidateId: v.string(),
    interviewerIds: v.array(v.string()),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();

    if (!identity) throw new Error("Unauthorized");

    return await ctx.db.insert("interviews", {
      ...args,
    });
  },
});

// once again redeploy
// interview update karde
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

export const getInterviewByInterviewerId = query({
  args: { interviewerId: v.string() },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Unauthoried user");

    const interviews = await ctx.db
      .query("interviews")
      .withIndex("by_interviewer_id", (q) =>
        q.eq("interviewerIds", [args.interviewerId])
      )
      .collect();

    return interviews;
  },
});
