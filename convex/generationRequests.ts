import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

// === UTILITY FUNCTIONS ===

/**
 * Generate a unique request ID to prevent conflicts
 * Format: timestamp_randomString
 */
function generateUniqueRequestId(): string {
  const timestamp = Date.now();
  const randomString = Math.random().toString(36).substr(2, 9);
  return `${timestamp}_${randomString}`;
}

/**
 * Helper function to create a complete fal.ai request with tracking
 * This will be useful for service client integration
 */
export const createFalRequestWithTracking = mutation({
  args: {
    model_id: v.string(),
    user_id: v.optional(v.string()),
    input: v.object({
      prompt: v.string(),
      duration: v.optional(v.string()),
      aspect_ratio: v.optional(v.string()),
      negative_prompt: v.optional(v.string()),
      cfg_scale: v.optional(v.number()),
      prompt_optimizer: v.optional(v.boolean()),
    }),
  },
  returns: v.object({
    generation_request_id: v.id("generation_requests"),
    fal_request_id: v.id("fal_requests"),
    request_id: v.string(),
  }),
  handler: async (ctx, args) => {
    // Create main generation request
    const generationRequestId = await ctx.db.insert("generation_requests", {
      service: "fal",
      model_id: args.model_id,
      request_id: generateUniqueRequestId(),
      user_id: args.user_id,
      status: "pending",
      created_at: Date.now(),
    });

    // Create fal-specific request
    const falRequestId = await ctx.db.insert("fal_requests", {
      input: args.input,
      generation_request_id: generationRequestId,
    });

    // Get the request_id for return
    const generationRequest = await ctx.db.get(generationRequestId);
    if (!generationRequest) {
      throw new Error("Failed to create generation request");
    }

    return {
      generation_request_id: generationRequestId,
      fal_request_id: falRequestId,
      request_id: generationRequest.request_id,
    };
  },
});

/**
 * Helper function to create a complete ElevenLabs request with tracking
 */
export const createElevenLabsRequestWithTracking = mutation({
  args: {
    model_id: v.string(),
    user_id: v.optional(v.string()),
    input: v.object({
      text: v.string(),
      voice_id: v.string(),
    }),
  },
  returns: v.object({
    generation_request_id: v.id("generation_requests"),
    elevenlabs_request_id: v.id("elevenlabs_requests"),
    request_id: v.string(),
  }),
  handler: async (ctx, args) => {
    // Create main generation request
    const generationRequestId = await ctx.db.insert("generation_requests", {
      service: "elevenlabs",
      model_id: args.model_id,
      request_id: generateUniqueRequestId(),
      user_id: args.user_id,
      status: "pending",
      created_at: Date.now(),
    });

    // Create elevenlabs-specific request
    const elevenLabsRequestId = await ctx.db.insert("elevenlabs_requests", {
      input: args.input,
      generation_request_id: generationRequestId,
    });

    // Get the request_id for return
    const generationRequest = await ctx.db.get(generationRequestId);
    if (!generationRequest) {
      throw new Error("Failed to create generation request");
    }

    return {
      generation_request_id: generationRequestId,
      elevenlabs_request_id: elevenLabsRequestId,
      request_id: generationRequest.request_id,
    };
  },
});

/**
 * Helper function to create a complete Runway request with tracking
 */
export const createRunwayRequestWithTracking = mutation({
  args: {
    model_id: v.string(),
    user_id: v.optional(v.string()),
    input: v.object({
      promptImage: v.string(),
      promptText: v.optional(v.string()),
      ratio: v.union(v.literal("16:9"), v.literal("9:16"), v.literal("1:1")),
      duration: v.union(v.literal(5), v.literal(10)),
    }),
  },
  returns: v.object({
    generation_request_id: v.id("generation_requests"),
    runway_request_id: v.id("runway_requests"),
    request_id: v.string(),
  }),
  handler: async (ctx, args) => {
    // Create main generation request
    const generationRequestId = await ctx.db.insert("generation_requests", {
      service: "runway",
      model_id: args.model_id,
      request_id: generateUniqueRequestId(),
      user_id: args.user_id,
      status: "pending",
      created_at: Date.now(),
    });

    // Create runway-specific request
    const runwayRequestId = await ctx.db.insert("runway_requests", {
      input: args.input,
      generation_request_id: generationRequestId,
    });

    // Get the request_id for return
    const generationRequest = await ctx.db.get(generationRequestId);
    if (!generationRequest) {
      throw new Error("Failed to create generation request");
    }

    return {
      generation_request_id: generationRequestId,
      runway_request_id: runwayRequestId,
      request_id: generationRequest.request_id,
    };
  },
});

// === MUTATIONS ===

/**
 * Create a new generation request record
 */
export const createGenerationRequest = mutation({
  args: {
    service: v.union(
      v.literal("fal"),
      v.literal("elevenlabs"),
      v.literal("runway"),
    ),
    model_id: v.string(),
    user_id: v.optional(v.string()),
    request_id: v.optional(v.string()),
  },
  returns: v.id("generation_requests"),
  handler: async (ctx, args) => {
    // Generate unique request ID if not provided
    const requestId = args.request_id ?? generateUniqueRequestId();

    const generationRequestId = await ctx.db.insert("generation_requests", {
      service: args.service,
      model_id: args.model_id,
      request_id: requestId,
      user_id: args.user_id,
      status: "pending",
      created_at: Date.now(),
    });

    return generationRequestId;
  },
});

/**
 * Update generation request status and metadata
 */
export const updateGenerationRequest = mutation({
  args: {
    generation_request_id: v.id("generation_requests"),
    status: v.union(
      v.literal("pending"),
      v.literal("completed"),
      v.literal("failed"),
    ),
    generation_time_ms: v.optional(v.number()),
    credits_used: v.optional(v.number()),
    file_size: v.optional(v.number()),
    error_message: v.optional(v.string()),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    const updateData: {
      status: "pending" | "completed" | "failed";
      generation_time_ms?: number;
      credits_used?: number;
      file_size?: number;
      error_message?: string;
      completed_at?: number;
    } = {
      status: args.status,
    };

    if (args.generation_time_ms !== undefined) {
      updateData.generation_time_ms = args.generation_time_ms;
    }

    if (args.credits_used !== undefined) {
      updateData.credits_used = args.credits_used;
    }

    if (args.file_size !== undefined) {
      updateData.file_size = args.file_size;
    }

    if (args.error_message !== undefined) {
      updateData.error_message = args.error_message;
    }

    if (args.status === "completed" || args.status === "failed") {
      updateData.completed_at = Date.now();
    }

    await ctx.db.patch(args.generation_request_id, updateData);
    return null;
  },
});

/**
 * Create a fal.ai specific request record
 */
export const createFalRequest = mutation({
  args: {
    generation_request_id: v.id("generation_requests"),
    input: v.object({
      prompt: v.string(),
      duration: v.optional(v.string()),
      aspect_ratio: v.optional(v.string()),
      negative_prompt: v.optional(v.string()),
      cfg_scale: v.optional(v.number()),
      prompt_optimizer: v.optional(v.boolean()),
    }),
  },
  returns: v.id("fal_requests"),
  handler: async (ctx, args) => {
    const falRequestId = await ctx.db.insert("fal_requests", {
      input: args.input,
      generation_request_id: args.generation_request_id,
    });

    return falRequestId;
  },
});

/**
 * Update fal.ai request with output data
 */
export const updateFalRequest = mutation({
  args: {
    fal_request_id: v.id("fal_requests"),
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
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    const updateData: {
      output?: {
        video: {
          url: string;
          file_size: number;
          file_name: string;
          content_type: string;
        };
      };
    } = {};

    if (args.output !== undefined) {
      updateData.output = args.output;
    }

    await ctx.db.patch(args.fal_request_id, updateData);
    return null;
  },
});

/**
 * Create an ElevenLabs specific request record
 */
export const createElevenLabsRequest = mutation({
  args: {
    generation_request_id: v.id("generation_requests"),
    input: v.object({
      text: v.string(),
      voice_id: v.string(),
    }),
  },
  returns: v.id("elevenlabs_requests"),
  handler: async (ctx, args) => {
    const elevenLabsRequestId = await ctx.db.insert("elevenlabs_requests", {
      input: args.input,
      generation_request_id: args.generation_request_id,
    });

    return elevenLabsRequestId;
  },
});

/**
 * Update ElevenLabs request with output data
 */
export const updateElevenLabsRequest = mutation({
  args: {
    elevenlabs_request_id: v.id("elevenlabs_requests"),
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
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    const updateData: {
      output?: {
        audio: {
          url: string;
          file_size: number;
          file_name: string;
          content_type: string;
          duration_ms: number;
        };
        metadata?: {
          model_id: string;
          voice_id: string;
          character_count: number;
          generation_time_ms: number;
        };
      };
    } = {};

    if (args.output !== undefined) {
      updateData.output = args.output;
    }

    await ctx.db.patch(args.elevenlabs_request_id, updateData);
    return null;
  },
});

/**
 * Create a Runway specific request record
 */
export const createRunwayRequest = mutation({
  args: {
    generation_request_id: v.id("generation_requests"),
    input: v.object({
      promptImage: v.string(),
      promptText: v.optional(v.string()),
      ratio: v.union(v.literal("16:9"), v.literal("9:16"), v.literal("1:1")),
      duration: v.union(v.literal(5), v.literal(10)),
    }),
  },
  returns: v.id("runway_requests"),
  handler: async (ctx, args) => {
    const runwayRequestId = await ctx.db.insert("runway_requests", {
      input: args.input,
      generation_request_id: args.generation_request_id,
    });

    return runwayRequestId;
  },
});

/**
 * Update Runway request with output data
 */
export const updateRunwayRequest = mutation({
  args: {
    runway_request_id: v.id("runway_requests"),
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
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    const updateData: {
      output?: {
        video: {
          url: string;
          file_size: number;
          file_name: string;
          content_type: string;
          duration_ms: number;
        };
        metadata?: {
          model_id: string;
          generation_id: string;
          generation_time_ms: number;
          credits_used: number;
        };
      };
    } = {};

    if (args.output !== undefined) {
      updateData.output = args.output;
    }

    await ctx.db.patch(args.runway_request_id, updateData);
    return null;
  },
});

// === QUERIES ===

/**
 * Get all generation requests with optional filtering
 */
export const getGenerationRequests = query({
  args: {
    limit: v.optional(v.number()),
    service: v.optional(
      v.union(v.literal("fal"), v.literal("elevenlabs"), v.literal("runway")),
    ),
    user_id: v.optional(v.string()),
    status: v.optional(
      v.union(
        v.literal("pending"),
        v.literal("completed"),
        v.literal("failed"),
      ),
    ),
  },
  returns: v.array(
    v.object({
      _id: v.id("generation_requests"),
      _creationTime: v.number(),
      service: v.union(
        v.literal("fal"),
        v.literal("elevenlabs"),
        v.literal("runway"),
      ),
      model_id: v.string(),
      request_id: v.string(),
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
    }),
  ),
  handler: async (ctx, args) => {
    // Apply filters
    if (args.service) {
      const service = args.service;
      const requests = await ctx.db
        .query("generation_requests")
        .withIndex("by_service", (q) => q.eq("service", service))
        .order("desc")
        .take(args.limit ?? 50);
      return requests;
    } else if (args.user_id) {
      const userId = args.user_id;
      const requests = await ctx.db
        .query("generation_requests")
        .withIndex("by_user", (q) => q.eq("user_id", userId))
        .order("desc")
        .take(args.limit ?? 50);
      return requests;
    } else if (args.status) {
      const status = args.status;
      const requests = await ctx.db
        .query("generation_requests")
        .withIndex("by_status", (q) => q.eq("status", status))
        .order("desc")
        .take(args.limit ?? 50);
      return requests;
    }

    // No filters - get all requests
    const requests = await ctx.db
      .query("generation_requests")
      .order("desc")
      .take(args.limit ?? 50);
    return requests;
  },
});

/**
 * Get a specific generation request by ID
 */
export const getGenerationRequest = query({
  args: {
    generation_request_id: v.id("generation_requests"),
  },
  returns: v.union(
    v.object({
      _id: v.id("generation_requests"),
      _creationTime: v.number(),
      service: v.union(
        v.literal("fal"),
        v.literal("elevenlabs"),
        v.literal("runway"),
      ),
      model_id: v.string(),
      request_id: v.string(),
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
    }),
    v.null(),
  ),
  handler: async (ctx, args) => {
    const request = await ctx.db.get(args.generation_request_id);
    return request;
  },
});

/**
 * Get fal.ai request details
 */
export const getFalRequest = query({
  args: {
    generation_request_id: v.id("generation_requests"),
  },
  returns: v.union(
    v.object({
      _id: v.id("fal_requests"),
      _creationTime: v.number(),
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
      generation_request_id: v.id("generation_requests"),
    }),
    v.null(),
  ),
  handler: async (ctx, args) => {
    const falRequest = await ctx.db
      .query("fal_requests")
      .withIndex("by_generation_request", (q) =>
        q.eq("generation_request_id", args.generation_request_id),
      )
      .unique();

    return falRequest;
  },
});

/**
 * Get ElevenLabs request details
 */
export const getElevenLabsRequest = query({
  args: {
    generation_request_id: v.id("generation_requests"),
  },
  returns: v.union(
    v.object({
      _id: v.id("elevenlabs_requests"),
      _creationTime: v.number(),
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
      generation_request_id: v.id("generation_requests"),
    }),
    v.null(),
  ),
  handler: async (ctx, args) => {
    const elevenLabsRequest = await ctx.db
      .query("elevenlabs_requests")
      .withIndex("by_generation_request", (q) =>
        q.eq("generation_request_id", args.generation_request_id),
      )
      .unique();

    return elevenLabsRequest;
  },
});

/**
 * Get Runway request details
 */
export const getRunwayRequest = query({
  args: {
    generation_request_id: v.id("generation_requests"),
  },
  returns: v.union(
    v.object({
      _id: v.id("runway_requests"),
      _creationTime: v.number(),
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
      generation_request_id: v.id("generation_requests"),
    }),
    v.null(),
  ),
  handler: async (ctx, args) => {
    const runwayRequest = await ctx.db
      .query("runway_requests")
      .withIndex("by_generation_request", (q) =>
        q.eq("generation_request_id", args.generation_request_id),
      )
      .unique();

    return runwayRequest;
  },
});

/**
 * Get requests by specific model
 */
export const getRequestsByModel = query({
  args: {
    model_id: v.string(),
    limit: v.optional(v.number()),
  },
  returns: v.array(
    v.object({
      _id: v.id("generation_requests"),
      _creationTime: v.number(),
      service: v.union(
        v.literal("fal"),
        v.literal("elevenlabs"),
        v.literal("runway"),
      ),
      model_id: v.string(),
      request_id: v.string(),
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
    }),
  ),
  handler: async (ctx, args) => {
    const requests = await ctx.db
      .query("generation_requests")
      .withIndex("by_model", (q) => q.eq("model_id", args.model_id))
      .order("desc")
      .take(args.limit ?? 50);
    return requests;
  },
});

/**
 * Get model usage statistics
 */
export const getModelUsageStats = query({
  args: {
    user_id: v.optional(v.string()),
    service: v.optional(
      v.union(v.literal("fal"), v.literal("elevenlabs"), v.literal("runway")),
    ),
  },
  returns: v.object({
    model_breakdown: v.record(
      v.string(),
      v.object({
        total_requests: v.number(),
        completed_requests: v.number(),
        failed_requests: v.number(),
        total_credits_used: v.number(),
        total_file_size: v.number(),
        average_generation_time_ms: v.number(),
      }),
    ),
  }),
  handler: async (ctx, args) => {
    // Apply filters
    let requests;
    if (args.user_id) {
      const userId = args.user_id;
      requests = await ctx.db
        .query("generation_requests")
        .withIndex("by_user", (q) => q.eq("user_id", userId))
        .collect();
    } else if (args.service) {
      const service = args.service;
      requests = await ctx.db
        .query("generation_requests")
        .withIndex("by_service", (q) => q.eq("service", service))
        .collect();
    } else {
      requests = await ctx.db.query("generation_requests").collect();
    }

    // Group by model_id
    const modelStats: Record<
      string,
      {
        total_requests: number;
        completed_requests: number;
        failed_requests: number;
        total_credits_used: number;
        total_file_size: number;
        average_generation_time_ms: number;
      }
    > = {};

    requests.forEach((request) => {
      modelStats[request.model_id] ??= {
        total_requests: 0,
        completed_requests: 0,
        failed_requests: 0,
        total_credits_used: 0,
        total_file_size: 0,
        average_generation_time_ms: 0,
      };

      const stats = modelStats[request.model_id];
      stats.total_requests++;

      if (request.status === "completed") {
        stats.completed_requests++;
      } else if (request.status === "failed") {
        stats.failed_requests++;
      }

      stats.total_credits_used += request.credits_used ?? 0;
      stats.total_file_size += request.file_size ?? 0;
    });

    // Calculate average generation times
    Object.keys(modelStats).forEach((modelId) => {
      const stats = modelStats[modelId];
      const completedRequests = requests.filter(
        (r) => r.model_id === modelId && r.generation_time_ms !== undefined,
      );

      if (completedRequests.length > 0) {
        stats.average_generation_time_ms = Math.round(
          completedRequests.reduce(
            (sum, r) => sum + (r.generation_time_ms ?? 0),
            0,
          ) / completedRequests.length,
        );
      }
    });

    return { model_breakdown: modelStats };
  },
});

/**
 * Get usage statistics across all services
 */
export const getUsageStats = query({
  args: {
    user_id: v.optional(v.string()),
    service: v.optional(
      v.union(v.literal("fal"), v.literal("elevenlabs"), v.literal("runway")),
    ),
  },
  returns: v.object({
    total_requests: v.number(),
    completed_requests: v.number(),
    failed_requests: v.number(),
    pending_requests: v.number(),
    total_credits_used: v.number(),
    total_file_size: v.number(),
    average_generation_time_ms: v.number(),
    service_breakdown: v.object({
      fal: v.number(),
      elevenlabs: v.number(),
      runway: v.number(),
    }),
  }),
  handler: async (ctx, args) => {
    // Apply filters
    let requests;
    if (args.user_id) {
      const userId = args.user_id;
      requests = await ctx.db
        .query("generation_requests")
        .withIndex("by_user", (q) => q.eq("user_id", userId))
        .collect();
    } else if (args.service) {
      const service = args.service;
      requests = await ctx.db
        .query("generation_requests")
        .withIndex("by_service", (q) => q.eq("service", service))
        .collect();
    } else {
      requests = await ctx.db.query("generation_requests").collect();
    }

    const stats = {
      total_requests: requests.length,
      completed_requests: requests.filter((r) => r.status === "completed")
        .length,
      failed_requests: requests.filter((r) => r.status === "failed").length,
      pending_requests: requests.filter((r) => r.status === "pending").length,
      total_credits_used: requests.reduce(
        (sum, r) => sum + (r.credits_used ?? 0),
        0,
      ),
      total_file_size: requests.reduce((sum, r) => sum + (r.file_size ?? 0), 0),
      average_generation_time_ms: 0,
      service_breakdown: {
        fal: requests.filter((r) => r.service === "fal").length,
        elevenlabs: requests.filter((r) => r.service === "elevenlabs").length,
        runway: requests.filter((r) => r.service === "runway").length,
      },
    };

    // Calculate average generation time
    const completedRequests = requests.filter(
      (r) => r.generation_time_ms !== undefined,
    );
    if (completedRequests.length > 0) {
      stats.average_generation_time_ms = Math.round(
        completedRequests.reduce(
          (sum, r) => sum + (r.generation_time_ms ?? 0),
          0,
        ) / completedRequests.length,
      );
    }

    return stats;
  },
});
