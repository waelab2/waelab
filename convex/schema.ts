import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  // Unified tracking table for cross-service insights
  generation_requests: defineTable({
    service: v.union(
      v.literal("fal"),
      v.literal("elevenlabs"),
      v.literal("runway"),
    ),
    model_id: v.string(), // Specific model used (e.g., "fal-ai/kling-video/v2.1/master/text-to-video")
    request_id: v.string(), // Auto-generated unique ID to prevent conflicts
    user_id: v.optional(v.string()),
    status: v.union(
      v.literal("pending"),
      v.literal("completed"),
      v.literal("failed"),
    ),
    created_at: v.number(),
    completed_at: v.optional(v.number()),
    generation_time_ms: v.optional(v.number()),
    credits_used: v.optional(v.number()),
    file_size: v.optional(v.number()),
    error_message: v.optional(v.string()),
  })
    .index("by_service", ["service"])
    .index("by_model", ["model_id"])
    .index("by_user", ["user_id"])
    .index("by_created_at", ["created_at"])
    .index("by_status", ["status"])
    .index("by_service_and_user", ["service", "user_id"])
    .index("by_service_and_model", ["service", "model_id"]),

  // Service-specific tables for detailed data
  fal_requests: defineTable({
    input: v.object({
      prompt: v.string(),
      duration: v.optional(v.string()),
      aspect_ratio: v.optional(v.string()),
      negative_prompt: v.optional(v.string()),
      cfg_scale: v.optional(v.number()),
      prompt_optimizer: v.optional(v.boolean()),
    }),
    output: v.optional(
      v.object({
        video: v.object({
          url: v.string(),
          file_size: v.number(),
          file_name: v.string(),
          content_type: v.string(),
        }),
      }),
    ),
    generation_request_id: v.id("generation_requests"), // Link to main table
  }).index("by_generation_request", ["generation_request_id"]),

  elevenlabs_requests: defineTable({
    input: v.object({
      text: v.string(),
      voice_id: v.string(),
    }),
    output: v.optional(
      v.object({
        audio: v.object({
          url: v.string(),
          file_size: v.number(),
          file_name: v.string(),
          content_type: v.string(),
          duration_ms: v.number(),
        }),
        metadata: v.optional(
          v.object({
            model_id: v.string(),
            voice_id: v.string(),
            character_count: v.number(),
            generation_time_ms: v.number(),
          }),
        ),
      }),
    ),
    generation_request_id: v.id("generation_requests"), // Link to main table
  }).index("by_generation_request", ["generation_request_id"]),

  runway_requests: defineTable({
    input: v.object({
      promptImage: v.string(),
      promptText: v.optional(v.string()),
      ratio: v.union(v.literal("16:9"), v.literal("9:16"), v.literal("1:1")),
      duration: v.union(v.literal(5), v.literal(10)),
    }),
    output: v.optional(
      v.object({
        video: v.object({
          url: v.string(),
          file_size: v.number(),
          file_name: v.string(),
          content_type: v.string(),
          duration_ms: v.number(),
        }),
        metadata: v.optional(
          v.object({
            model_id: v.string(),
            generation_id: v.string(),
            generation_time_ms: v.number(),
            credits_used: v.number(),
          }),
        ),
      }),
    ),
    generation_request_id: v.id("generation_requests"), // Link to main table
  }).index("by_generation_request", ["generation_request_id"]),

  // Translations table for multilingual content
  translations: defineTable({
    key: v.string(), // Unique key like "home.hero_title", "nav.home_link"
    en: v.string(), // English text
    ar: v.string(), // Arabic text
  }).index("by_key", ["key"]),
});
