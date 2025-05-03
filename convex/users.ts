import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

export const syncUser = mutation({
  args: {
    name: v.string(),
    email: v.string(),
    image: v.string(),
    clerkId: v.string(),
  },
  handler: async (ctx, args) => {
    const existingUser = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", args.clerkId))
      .first();

    if (existingUser) {
      return { exists: true, hasRole: !!existingUser.role };
    }

    return { exists: false, hasRole: false };
  },
});

export const getUser = query({
  handler: async (ctx) => {
    const userIdentity = await ctx.auth.getUserIdentity();
    if (!userIdentity) throw new Error("user not authenticated");
    const user = await ctx.db.query("users").collect();
    return user;
  },
});

// get all users uske sath unke successful interviews bhi dedo
export const successfulInterviews = query({
  handler: async (ctx) => {
    const userIdentity = await ctx.auth.getUserIdentity();
    if (!userIdentity) throw new Error("user not authenticated");

    const interviews = await ctx.db.query("interviews").collect();

    // Group interviews by candidateId
    const interviewStats: Record<string, { total: number; succeeded: number }> =
      {};

    for (const interview of interviews) {
      const candidateId = interview.candidateId;

      if (!interviewStats[candidateId]) {
        interviewStats[candidateId] = { total: 0, succeeded: 0 };
      }

      interviewStats[candidateId].total += 1;

      if (interview.status === "succeeded") {
        interviewStats[candidateId].succeeded += 1;
      }
    }

    // Convert to an array of results with scores
    const result = Object.entries(interviewStats).map(
      ([candidateId, stats]) => {
        const score = stats.succeeded / stats.total;
        return {
          candidateId,
          totalInterviews: stats.total,
          successfulInterviews: stats.succeeded,
          score,
        };
      }
    );
    console.log(result);

    return result;
  },
});

export const getUserByClerkId = query({
  args: { clerkId: v.string() },
  handler: async (ctx, args) => {
    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", args.clerkId))
      .first();
    return user;
  },
});

export const updateUser = mutation({
  args: {
    name: v.string(),
    email: v.string(),
    image: v.string(),
    clerkId: v.string(),
    userName: v.string(),
    role: v.union(v.literal("candidate"), v.literal("interviewer")),
  },
  handler: async (ctx, args) => {
    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", args.clerkId))
      .first();

    if (!user) throw new Error("user not found");

    const existingUsername = await ctx.db
      .query("users")
      .withIndex("by_user_name", (q) => q.eq("userName", args.userName))
      .first();
    if (existingUsername && existingUsername._id !== user._id) {
      throw new Error("UserName already taken");
    }

    await ctx.db.patch(user._id, {
      name: args.name,
      email: args.email,
      image: args.image,
      userName: args.userName,
      role: args.role,
    });
  },
});

export const createUserWithRole = mutation({
  args: {
    name: v.string(),
    email: v.string(),
    image: v.string(),
    clerkId: v.string(),
    userName: v.string(),
    role: v.union(v.literal("candidate"), v.literal("interviewer")),
  },
  handler: async (ctx, args) => {
    const existingUser = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", args.clerkId))
      .first();

    if (existingUser) {
      return { success: false, error: "User already exists" };
    }

    const existingUsername = await ctx.db
      .query("users")
      .withIndex("by_user_name", (q) => q.eq("userName", args.userName))
      .first();

    if (existingUsername) {
      return { success: false, error: "Username already taken" };
    }

    await ctx.db.insert("users", args);

    return { success: true };
  },
});

export const getUserByUserName = query({
  args: { userName: v.string() },
  handler: async (ctx, args) => {
    const user = await ctx.db
      .query("users")
      .withIndex("by_user_name", (q) => q.eq("userName", args.userName))
      .unique();

    return user;
  },
});
