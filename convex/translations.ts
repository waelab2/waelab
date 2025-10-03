import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

/**
 * Get all translations
 */
export const getAllTranslations = query({
  args: {},
  returns: v.array(
    v.object({
      _id: v.id("translations"),
      _creationTime: v.number(),
      key: v.string(),
      en: v.string(),
      ar: v.string(),
    }),
  ),
  handler: async (ctx) => {
    return await ctx.db.query("translations").collect();
  },
});

/**
 * Get translations by keys
 * Returns only the translations that exist in the database
 */
export const getTranslationsByKeys = query({
  args: { keys: v.array(v.string()) },
  returns: v.array(
    v.object({
      _id: v.id("translations"),
      _creationTime: v.number(),
      key: v.string(),
      en: v.string(),
      ar: v.string(),
    }),
  ),
  handler: async (ctx, args) => {
    const translations = [];
    for (const key of args.keys) {
      const translation = await ctx.db
        .query("translations")
        .withIndex("by_key", (q) => q.eq("key", key))
        .unique();
      if (translation) {
        translations.push(translation);
      }
    }
    return translations;
  },
});

/**
 * Update translation content (English and Arabic text only)
 * This is the only mutation needed since keys are fixed
 */
export const updateTranslation = mutation({
  args: {
    key: v.string(),
    en: v.string(),
    ar: v.string(),
  },
  returns: v.id("translations"),
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("translations")
      .withIndex("by_key", (q) => q.eq("key", args.key))
      .unique();

    if (!existing) {
      throw new Error(
        `Translation key "${args.key}" does not exist in database`,
      );
    }

    await ctx.db.patch(existing._id, {
      en: args.en,
      ar: args.ar,
    });
    return existing._id;
  },
});
