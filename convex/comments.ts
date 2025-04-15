import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

export const createComment = mutation({
  args: {
    interviewId: v.id("interviews"),
    content: v.string(),
    rating: v.number(),
  },
  handler: async (ctx, args) => {
    const userIdentity = await ctx.auth.getUserIdentity();
    if (!userIdentity) throw new Error("user not authenticated");
    // ab user auth ho gya hai

    return await ctx.db.insert("comments", {
      interviewId: args.interviewId,
      content: args.content,
      rating: args.rating,
      interviewerId: userIdentity.subject,
    });
  },
});

// sare comments dekhado

export const getAllComments = query({
  args: { interviewId: v.id("interviews") },
  handler: async (ctx, args) => {
    const comments = await ctx.db
      .query("comments")
      .withIndex("by_interview_id", (q) =>
        q.eq("interviewId", args.interviewId)
      )
      .collect();

    return comments;
  },
});
