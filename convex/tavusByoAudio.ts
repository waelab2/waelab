import { v } from "convex/values";
import { mutation } from "./_generated/server";

const MAX_BYO_BYTES = 25 * 1024 * 1024;

/**
 * Short-lived URL for POSTing raw audio bytes (see Convex file storage docs).
 * Called from the authenticated Next.js `/api/tavus/upload-audio` route only.
 */
export const generateByoAudioUploadUrl = mutation({
  args: {
    userId: v.string(),
  },
  returns: v.string(),
  handler: async (ctx, args) => {
    if (!args.userId.trim()) {
      throw new Error("userId is required");
    }
    return await ctx.storage.generateUploadUrl();
  },
});

/**
 * Registers uploaded audio for the user and returns a signed URL for Tavus `audio_url`.
 */
export const registerByoAudioAndGetUrl = mutation({
  args: {
    userId: v.string(),
    storageId: v.id("_storage"),
    byteSize: v.number(),
    contentType: v.string(),
  },
  returns: v.string(),
  handler: async (ctx, args) => {
    if (!args.userId.trim()) {
      throw new Error("userId is required");
    }
    if (args.byteSize <= 0 || args.byteSize > MAX_BYO_BYTES) {
      throw new Error("Invalid audio size");
    }
    const existing = await ctx.db
      .query("tavus_byo_audio")
      .withIndex("by_storage_id", (q) => q.eq("storage_id", args.storageId))
      .first();
    if (existing) {
      if (existing.user_id !== args.userId) {
        throw new Error("Storage mismatch");
      }
    } else {
      await ctx.db.insert("tavus_byo_audio", {
        user_id: args.userId,
        storage_id: args.storageId,
        byte_size: args.byteSize,
        content_type: args.contentType,
        created_at: Date.now(),
      });
    }
    const url = await ctx.storage.getUrl(args.storageId);
    if (!url) {
      throw new Error("Could not resolve audio URL");
    }
    return url;
  },
});
