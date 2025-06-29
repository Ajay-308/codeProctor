import { mutation } from "../_generated/server";
import { v } from "convex/values";

export const createInterviewWithUUID = mutation({
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
    const uuid = crypto.randomUUID();

    const id = await ctx.db.insert("interviews", {
      ...args,
      uuid,
    });

    return { id, uuid };
  },
});
