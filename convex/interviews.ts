import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

// jitne bhi interview hai present sare dedo
export const getAllInterviews = query({
  handler: async (ctx) => {
    const userIdentity = await ctx.auth.getUserIdentity();
    if (!userIdentity) throw new Error("user not authenticated");

    // ab user auth ho gya hai
    const interview = await ctx.db.query("interviews").collect();
    return interview;
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

// stream call ke id se interview ka data dedo
export const getInterviewByStreamId = query({
  args: { streamCallId: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("interviews")
      .withIndex("by_stream_id", (q) => q.eq("streamCallId", args.streamCallId))
      .collect();
  },
});

// interview create kardo
export const createInterview = mutation({
  args: {
    title: v.string(),
    description: v.optional(v.string()),
    startTime: v.number(),
    endTime: v.optional(v.number()),
    status: v.string(), // changed here
    streamCallId: v.string(),
    candidateId: v.string(),
    interviewerIds: v.array(v.string()),
  },
  handler: async (ctx, args) => {
    const userIdentity = await ctx.auth.getUserIdentity();
    if (!userIdentity) throw new Error("user not authenticated");

    return await ctx.db.insert("interviews", {
      ...args,
      interviewerIds: args.interviewerIds,
    });
  },
});

// interview update karde
export const updateInterview = mutation({
  args: {
    id: v.id("interviews"),
    status: v.string(),
  },
  handler: async (ctx, args) => {
    const userIdentity = await ctx.auth.getUserIdentity();
    if (!userIdentity) throw new Error("user not authenticated");

    const interview = await ctx.db.get(args.id);
    if (!interview) throw new Error("interview not found");
    if (interview.status === "completed")
      throw new Error("interview already completed");
    if (interview.status === "cancelled")
      throw new Error("interview already cancelled");

    await ctx.db.patch(args.id, {
      status: args.status,
      ...(args.status === "completed" ? { endTime: Date.now() } : {}),
    });
  },
});
