import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

/**
 * For `/api/tavus/webhook` only: same secret as Next.js `TAVUS_WEBHOOK_SECRET`
 * in Convex → Settings → Environment Variables when using that route.
 */
function webhookSecretExpected(): string | undefined {
  const s = process.env.TAVUS_WEBHOOK_SECRET;
  return typeof s === "string" && s.trim() ? s.trim() : undefined;
}

export const createJob = mutation({
  args: {
    userId: v.string(),
    videoId: v.string(),
    reservationId: v.string(),
    language: v.union(v.literal("en"), v.literal("ar")),
    inputKind: v.union(v.literal("script"), v.literal("audio")),
  },
  returns: v.id("tavus_video_jobs"),
  handler: async (ctx, args) => {
    return await ctx.db.insert("tavus_video_jobs", {
      user_id: args.userId,
      video_id: args.videoId,
      reservation_id: args.reservationId,
      language: args.language,
      input_kind: args.inputKind,
      credits_finalized: false,
      created_at: Date.now(),
    });
  },
});

export const getJobForUser = query({
  args: {
    userId: v.string(),
    videoId: v.string(),
  },
  returns: v.union(
    v.null(),
    v.object({
      _id: v.id("tavus_video_jobs"),
      user_id: v.string(),
      video_id: v.string(),
      reservation_id: v.string(),
      credits_finalized: v.boolean(),
    }),
  ),
  handler: async (ctx, args) => {
    const job = await ctx.db
      .query("tavus_video_jobs")
      .withIndex("by_video_id", (q) => q.eq("video_id", args.videoId))
      .first();
    if (!job || job.user_id !== args.userId) {
      return null;
    }
    return {
      _id: job._id,
      user_id: job.user_id,
      video_id: job.video_id,
      reservation_id: job.reservation_id,
      credits_finalized: job.credits_finalized,
    };
  },
});

export const getJobForWebhook = query({
  args: {
    videoId: v.string(),
    serverKey: v.string(),
  },
  returns: v.union(
    v.null(),
    v.object({
      user_id: v.string(),
      reservation_id: v.string(),
      credits_finalized: v.boolean(),
    }),
  ),
  handler: async (ctx, args) => {
    const expected = webhookSecretExpected();
    if (!expected || args.serverKey !== expected) {
      return null;
    }
    const job = await ctx.db
      .query("tavus_video_jobs")
      .withIndex("by_video_id", (q) => q.eq("video_id", args.videoId))
      .first();
    if (!job) {
      return null;
    }
    return {
      user_id: job.user_id,
      reservation_id: job.reservation_id,
      credits_finalized: job.credits_finalized,
    };
  },
});

export const markCreditsFinalized = mutation({
  args: {
    videoId: v.string(),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    const job = await ctx.db
      .query("tavus_video_jobs")
      .withIndex("by_video_id", (q) => q.eq("video_id", args.videoId))
      .first();
    if (!job) {
      return null;
    }
    await ctx.db.patch(job._id, {
      credits_finalized: true,
      finalized_at: Date.now(),
    });
    return null;
  },
});
