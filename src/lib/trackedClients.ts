import { useMutation, useQuery } from "convex/react";
import type {
  ElevenLabsTextToSpeechInput,
  RunwayGen4TurboInput,
  VideoGenerationInput,
} from "~/lib/types";
import { api } from "../../convex/_generated/api";
import type { Id } from "../../convex/_generated/dataModel";
import { elevenLabsClient } from "./elevenLabsClient";
import { falClient } from "./falClient";
import { runwayClient } from "./runwayClient";

// Type definitions for tracking results
interface TrackingResult {
  generation_request_id: Id<"generation_requests">;
  fal_request_id?: Id<"fal_requests">;
  elevenlabs_request_id?: Id<"elevenlabs_requests">;
  runway_request_id?: Id<"runway_requests">;
  request_id: string;
}

// === TRACKED FAL.AI HOOK ===

export function useTrackedFalClient() {
  const createFalRequest = useMutation(
    api.generationRequests.createFalRequestWithTracking,
  );
  const updateGenerationRequest = useMutation(
    api.generationRequests.updateGenerationRequest,
  );
  const updateFalRequest = useMutation(api.generationRequests.updateFalRequest);

  const subscribe = async (
    model: string,
    options: {
      input: VideoGenerationInput;
      pollInterval: number;
      logs: boolean;
      onQueueUpdate: (update: { status: string }) => void;
      userId?: string;
    },
  ) => {
    const { input, onQueueUpdate, userId } = options;
    const startTime = Date.now();
    let trackingResult: TrackingResult | undefined;

    try {
      // 1. Create tracking records
      trackingResult = await createFalRequest({
        model_id: model,
        user_id: userId,
        input: {
          prompt: input.prompt,
          duration: input.duration,
          aspect_ratio: input.aspect_ratio,
          negative_prompt: input.negative_prompt,
          cfg_scale: input.cfg_scale,
          prompt_optimizer: input.prompt_optimizer,
        },
      });

      console.log("🎬 [Tracked Fal] Created tracking record:", trackingResult);

      // 2. Call the original fal client
      const result = await falClient.subscribe(model, {
        input,
        pollInterval: options.pollInterval,
        logs: options.logs,
        onQueueUpdate: (update) => {
          // Forward status updates to the original callback
          onQueueUpdate(update);

          // Update tracking status
          if (update.status === "COMPLETED" && trackingResult) {
            const generationTime = Date.now() - startTime;
            void updateGenerationRequest({
              generation_request_id: trackingResult.generation_request_id,
              status: "completed",
              generation_time_ms: generationTime,
              file_size: result.data?.video?.file_size,
            });

            if (trackingResult.fal_request_id) {
              void updateFalRequest({
                fal_request_id: trackingResult.fal_request_id,
                output: result.data,
              });
            }
          } else if (update.status === "FAILED" && trackingResult) {
            void updateGenerationRequest({
              generation_request_id: trackingResult.generation_request_id,
              status: "failed",
              error_message: "Generation failed",
            });
          }
        },
      });

      return result;
    } catch (error) {
      console.error("🎬 [Tracked Fal] Error:", error);

      // Update tracking with error
      if (trackingResult) {
        try {
          void updateGenerationRequest({
            generation_request_id: trackingResult.generation_request_id,
            status: "failed",
            error_message:
              error instanceof Error ? error.message : String(error),
          });
        } catch (trackingError) {
          console.error(
            "🎬 [Tracked Fal] Failed to update tracking:",
            trackingError,
          );
        }
      }

      throw error;
    }
  };

  return { subscribe };
}

// === TRACKED ELEVENLABS HOOK ===

export function useTrackedElevenLabsClient() {
  const createElevenLabsRequest = useMutation(
    api.generationRequests.createElevenLabsRequestWithTracking,
  );
  const updateGenerationRequest = useMutation(
    api.generationRequests.updateGenerationRequest,
  );
  const updateElevenLabsRequest = useMutation(
    api.generationRequests.updateElevenLabsRequest,
  );

  const generate = async (options: {
    input: ElevenLabsTextToSpeechInput;
    onProgress?: (progress: { status: string }) => void;
    userId?: string;
  }) => {
    const { input, onProgress, userId } = options;
    const startTime = Date.now();
    let trackingResult: TrackingResult | undefined;

    try {
      // 1. Create tracking records
      trackingResult = await createElevenLabsRequest({
        model_id: "elevenlabs/eleven_multilingual_v2",
        user_id: userId,
        input: {
          text: input.text,
          voice_id: input.voice_id,
        },
      });

      console.log(
        "🎵 [Tracked ElevenLabs] Created tracking record:",
        trackingResult,
      );

      // 2. Call the original ElevenLabs client
      const result = await elevenLabsClient.generate({
        input,
        onProgress: (progress) => {
          // Forward progress updates to the original callback
          onProgress?.(progress);

          // Update tracking status
          if (progress.status === "COMPLETED" && trackingResult) {
            const generationTime = Date.now() - startTime;
            void updateGenerationRequest({
              generation_request_id: trackingResult.generation_request_id,
              status: "completed",
              generation_time_ms: generationTime,
              file_size: result.data?.audio?.file_size,
            });

            if (trackingResult.elevenlabs_request_id) {
              void updateElevenLabsRequest({
                elevenlabs_request_id: trackingResult.elevenlabs_request_id,
                output: result.data
                  ? {
                      audio: {
                        url: result.data.audio.url,
                        file_size: result.data.audio.file_size,
                        file_name: result.data.audio.file_name,
                        content_type: result.data.audio.content_type,
                        duration_ms: result.data.audio.duration_ms ?? 0,
                      },
                      metadata: result.data.metadata,
                    }
                  : undefined,
              });
            }
          } else if (progress.status === "FAILED" && trackingResult) {
            void updateGenerationRequest({
              generation_request_id: trackingResult.generation_request_id,
              status: "failed",
              error_message: "Generation failed",
            });
          }
        },
      });

      return result;
    } catch (error) {
      console.error("🎵 [Tracked ElevenLabs] Error:", error);

      // Update tracking with error
      if (trackingResult) {
        try {
          void updateGenerationRequest({
            generation_request_id: trackingResult.generation_request_id,
            status: "failed",
            error_message:
              error instanceof Error ? error.message : String(error),
          });
        } catch (trackingError) {
          console.error(
            "🎵 [Tracked ElevenLabs] Failed to update tracking:",
            trackingError,
          );
        }
      }

      throw error;
    }
  };

  return { generate };
}

// === TRACKED RUNWAY HOOK ===

export function useTrackedRunwayClient() {
  const createRunwayRequest = useMutation(
    api.generationRequests.createRunwayRequestWithTracking,
  );
  const updateGenerationRequest = useMutation(
    api.generationRequests.updateGenerationRequest,
  );
  const updateRunwayRequest = useMutation(
    api.generationRequests.updateRunwayRequest,
  );

  const generate = async (options: {
    input: RunwayGen4TurboInput;
    onProgress?: (progress: { status: string }) => void;
    userId?: string;
  }) => {
    const { input, onProgress, userId } = options;
    const startTime = Date.now();
    let trackingResult: TrackingResult | undefined;

    try {
      // 1. Create tracking records
      trackingResult = await createRunwayRequest({
        model_id: "runway/gen4_turbo",
        user_id: userId,
        input: {
          promptImage: input.promptImage,
          promptText: input.promptText,
          ratio: input.ratio,
          duration: input.duration,
        },
      });

      console.log(
        "🎬 [Tracked Runway] Created tracking record:",
        trackingResult,
      );

      // 2. Call the original Runway client
      const result = await runwayClient.generate({
        input,
        onProgress: (progress) => {
          // Forward progress updates to the original callback
          onProgress?.(progress);

          // Update tracking status
          if (progress.status === "COMPLETED" && trackingResult) {
            const generationTime = Date.now() - startTime;
            const creditsUsed = input.duration * 5; // 5 credits per second

            void updateGenerationRequest({
              generation_request_id: trackingResult.generation_request_id,
              status: "completed",
              generation_time_ms: generationTime,
              credits_used: creditsUsed,
              file_size: result.data?.video?.file_size,
            });

            if (trackingResult.runway_request_id) {
              void updateRunwayRequest({
                runway_request_id: trackingResult.runway_request_id,
                output: result.data,
              });
            }
          } else if (progress.status === "FAILED" && trackingResult) {
            void updateGenerationRequest({
              generation_request_id: trackingResult.generation_request_id,
              status: "failed",
              error_message: "Generation failed",
            });
          }
        },
      });

      return result;
    } catch (error) {
      console.error("🎬 [Tracked Runway] Error:", error);

      // Update tracking with error
      if (trackingResult) {
        try {
          void updateGenerationRequest({
            generation_request_id: trackingResult.generation_request_id,
            status: "failed",
            error_message:
              error instanceof Error ? error.message : String(error),
          });
        } catch (trackingError) {
          console.error(
            "🎬 [Tracked Runway] Failed to update tracking:",
            trackingError,
          );
        }
      }

      throw error;
    }
  };

  return { generate };
}

// === ANALYTICS HOOKS ===

/**
 * Hook to get generation analytics for a user
 */
export function useUserAnalytics(userId?: string) {
  return useQuery(
    api.generationRequests.getUsageStats,
    userId ? { user_id: userId } : "skip",
  );
}

/**
 * Hook to get model-specific analytics
 */
export function useModelAnalytics(service?: "fal" | "elevenlabs" | "runway") {
  return useQuery(
    api.generationRequests.getModelUsageStats,
    service ? { service } : {},
  );
}

/**
 * Hook to get recent requests for a user
 */
export function useUserRequests(userId?: string, limit = 20) {
  return useQuery(
    api.generationRequests.getGenerationRequests,
    userId ? { user_id: userId, limit } : "skip",
  );
}

/**
 * Hook to get requests by specific model
 */
export function useRequestsByModel(modelId?: string, limit = 20) {
  return useQuery(
    api.generationRequests.getRequestsByModel,
    modelId ? { model_id: modelId, limit } : "skip",
  );
}

/**
 * Hook to get all generation requests with optional filtering
 */
export function useGenerationRequests(filters?: {
  service?: "fal" | "elevenlabs" | "runway";
  status?: "pending" | "completed" | "failed";
  limit?: number;
}) {
  return useQuery(api.generationRequests.getGenerationRequests, filters ?? {});
}
