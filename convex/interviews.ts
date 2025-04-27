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
    console.log("Looking for interview with streamCallId:", args.streamCallId);

    // Don't modify the input ID - some IDs might have colons that aren't prefixes
    const idToSearch = args.streamCallId;

    console.log("Searching with ID:", idToSearch);

    const result = await ctx.db
      .query("interviews")
      .withIndex("by_stream_call_id", (q) => q.eq("streamCallId", idToSearch))
      .first();

    console.log("Query result:", result);
    return result;
  },
});

// Add this to interviews.ts
export const debugAllInterviews = query({
  handler: async (ctx) => {
    return await ctx.db.query("interviews").collect();
  },
});
// Add to interviews.ts
export const findInterviewByAnyId = query({
  args: {
    id: v.string(),
    cid: v.string(),
    defaultId: v.string(),
  },
  handler: async (ctx, args) => {
    // Try multiple ID formats
    const idPart = args.id;
    const cidPart = args.cid.includes(":") ? args.cid.split(":")[1] : args.cid;
    const defaultPart = args.defaultId.includes(":")
      ? args.defaultId.split(":")[1]
      : args.defaultId;

    console.log("Searching with multiple IDs:", {
      idPart,
      cidPart,
      defaultPart,
    });

    // Try to find with any of these IDs
    let result = await ctx.db
      .query("interviews")
      .withIndex("by_stream_call_id", (q) => q.eq("streamCallId", idPart))
      .first();

    if (!result) {
      result = await ctx.db
        .query("interviews")
        .withIndex("by_stream_call_id", (q) => q.eq("streamCallId", cidPart))
        .first();
    }

    if (!result) {
      result = await ctx.db
        .query("interviews")
        .withIndex("by_stream_call_id", (q) =>
          q.eq("streamCallId", defaultPart)
        )
        .first();
    }

    return result;
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
