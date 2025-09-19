import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";

// Type definitions for analytics data
export interface ModelStats {
  total_requests: number;
  completed_requests: number;
  failed_requests: number;
  total_credits_used: number;
  total_file_size: number;
  average_generation_time_ms: number;
}

export interface ModelAnalytics {
  model_breakdown: Record<string, ModelStats>;
}

export interface UsageStats {
  total_requests: number;
  completed_requests: number;
  failed_requests: number;
  pending_requests: number;
  total_credits_used: number;
  total_file_size: number;
  average_generation_time_ms: number;
  service_breakdown: {
    fal: number;
    elevenlabs: number;
    runway: number;
  };
}

export interface GenerationRequest {
  _id: string;
  _creationTime: number;
  service: "fal" | "elevenlabs" | "runway";
  model_id: string;
  request_id: string;
  user_id?: string;
  status: "pending" | "completed" | "failed";
  created_at: number;
  completed_at?: number;
  generation_time_ms?: number;
  credits_used?: number;
  file_size?: number;
  error_message?: string;
}

/**
 * Hook to get generation analytics for a user
 */
export function useUserAnalytics(userId?: string): UsageStats | undefined {
  const result = useQuery(
    api.generationRequests.getUsageStats,
    userId ? { user_id: userId } : "skip",
  ) as unknown;

  if (result && typeof result === "object" && "total_requests" in result) {
    return result as UsageStats;
  }
  return undefined;
}

/**
 * Hook to get model-specific analytics
 */
export function useModelAnalytics(
  service?: "fal" | "elevenlabs" | "runway",
): ModelAnalytics | undefined {
  const result = useQuery(
    api.generationRequests.getModelUsageStats,
    service ? { service } : {},
  ) as unknown;

  if (result && typeof result === "object" && "model_breakdown" in result) {
    return result as ModelAnalytics;
  }
  return undefined;
}

/**
 * Hook to get recent requests for a user
 */
export function useUserRequests(
  userId?: string,
  limit = 20,
): GenerationRequest[] | undefined {
  const result = useQuery(
    api.generationRequests.getGenerationRequests,
    userId ? { user_id: userId, limit } : "skip",
  ) as unknown;

  if (Array.isArray(result)) {
    return result as GenerationRequest[];
  }
  return undefined;
}

/**
 * Hook to get requests by specific model
 */
export function useRequestsByModel(
  modelId?: string,
  limit = 20,
): GenerationRequest[] | undefined {
  const result = useQuery(
    api.generationRequests.getRequestsByModel,
    modelId ? { model_id: modelId, limit } : "skip",
  ) as unknown;

  if (Array.isArray(result)) {
    return result as GenerationRequest[];
  }
  return undefined;
}

/**
 * Hook to get all generation requests with optional filtering
 */
export function useGenerationRequests(filters?: {
  service?: "fal" | "elevenlabs" | "runway";
  status?: "pending" | "completed" | "failed";
  limit?: number;
}): GenerationRequest[] | undefined {
  const result = useQuery(
    api.generationRequests.getGenerationRequests,
    filters ?? {},
  ) as unknown;

  if (Array.isArray(result)) {
    return result as GenerationRequest[];
  }
  return undefined;
}

/**
 * Hook to get usage statistics for a specific date range
 */
export function useUsageStatsForDateRange(
  startDate: number,
  endDate: number,
  userId?: string,
  service?: "fal" | "elevenlabs" | "runway",
): UsageStats | undefined {
  const result = useQuery(api.generationRequests.getUsageStatsForDateRange, {
    start_date: startDate,
    end_date: endDate,
    user_id: userId,
    service,
  }) as unknown;

  // Type guard to ensure we have the expected data structure
  if (result && typeof result === "object" && "total_requests" in result) {
    return result as UsageStats;
  }
  return undefined;
}

/**
 * Hook to get model usage statistics for a specific date range
 */
export function useModelUsageStatsForDateRange(
  startDate: number,
  endDate: number,
  userId?: string,
  service?: "fal" | "elevenlabs" | "runway",
): ModelAnalytics | undefined {
  const result = useQuery(
    api.generationRequests.getModelUsageStatsForDateRange,
    {
      start_date: startDate,
      end_date: endDate,
      user_id: userId,
      service,
    },
  ) as unknown;

  // Type guard to ensure we have the expected data structure
  if (result && typeof result === "object" && "model_breakdown" in result) {
    return result as ModelAnalytics;
  }
  return undefined;
}
