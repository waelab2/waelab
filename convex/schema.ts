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

  // Payment agreements table for Tap Payments
  payment_agreements: defineTable({
    tap_payment_agreement_id: v.string(), // Tap's payment agreement ID
    tap_customer_id: v.string(), // Tap's customer ID
    tap_card_id: v.optional(v.string()), // Tap's card ID (if available)
    contract_type: v.union(
      v.literal("UNSCHEDULED"),
      v.literal("SUBSCRIPTION"),
      v.literal("INSTALLMENT"),
      v.literal("MILESTONE"),
      v.literal("ORDER"),
    ),
    status: v.union(
      v.literal("active"),
      v.literal("cancelled"),
      v.literal("expired"),
    ),
    user_id: v.string(), // Clerk user ID
    created_at: v.number(),
  })
    .index("by_user", ["user_id"])
    .index("by_tap_payment_agreement_id", ["tap_payment_agreement_id"])
    .index("by_tap_customer_id", ["tap_customer_id"])
    .index("by_status", ["status"]),

  // Subscriptions table for recurring billing
  subscriptions: defineTable({
    user_id: v.string(), // Clerk user ID
    plan_id: v.string(), // Plan identifier (starter, pro, premium)
    payment_agreement_id: v.optional(v.id("payment_agreements")), // Link to payment agreement (optional - temporarily null)
    amount: v.number(), // Subscription amount in smallest currency unit
    currency: v.string(), // Currency code (e.g., "SAR")
    status: v.union(
      v.literal("active"),
      v.literal("cancelled"),
      v.literal("failed"),
      v.literal("expired"),
    ),
    next_billing_date: v.number(), // Unix timestamp for next billing date
    created_at: v.number(),
    cancelled_at: v.optional(v.number()),
    last_billing_date: v.optional(v.number()),
    last_billing_charge_id: v.optional(v.string()), // Tap charge ID from last billing
  })
    .index("by_user", ["user_id"])
    .index("by_payment_agreement", ["payment_agreement_id"])
    .index("by_next_billing_date", ["next_billing_date"])
    .index("by_status", ["status"])
    .index("by_user_and_status", ["user_id", "status"]),
});
