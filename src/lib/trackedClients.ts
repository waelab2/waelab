import { useMutation, useQuery } from "convex/react";
import React from "react";
import type {
  ElevenLabsTextToSpeechInput,
  RunwayGen4TurboInput,
  VideoGenerationInput,
} from "~/lib/types";
import { api } from "../../convex/_generated/api";
import type { Id } from "../../convex/_generated/dataModel";
import { falClient } from "./falClient";

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

  // Configure falClient with proxy URL
  React.useEffect(() => {
    falClient.config({
      proxyUrl: "/api/fal/proxy",
    });
  }, []);

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

          // Update tracking status for failures only (completion handled after result)
          if (update.status === "FAILED" && trackingResult) {
            void updateGenerationRequest({
              generation_request_id: trackingResult.generation_request_id,
              status: "failed",
              error_message: "Generation failed",
            });
          }
        },
      });

      // Update tracking with final result after completion
      if (trackingResult && result?.data) {
        const generationTime = Date.now() - startTime;
        void updateGenerationRequest({
          generation_request_id: trackingResult.generation_request_id,
          status: "completed",
          generation_time_ms: generationTime,
          file_size: result.data.video?.file_size,
        });

        if (trackingResult.fal_request_id) {
          void updateFalRequest({
            fal_request_id: trackingResult.fal_request_id,
            output: result.data,
          });
        }
      }

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
    const { input, userId } = options;
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

      // 2. Call the ElevenLabs API route
      const response = await fetch("/api/elevenlabs/text-to-speech", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          text: input.text,
          voice_id: input.voice_id,
        }),
      });

      if (!response.ok) {
        const errorData = (await response
          .json()
          .catch(() => ({ error: "Unknown error" }))) as { error: string };
        throw new Error(
          errorData.error ?? `HTTP ${response.status}: ${response.statusText}`,
        );
      }

      // Get the JSON response with audio data
      const responseData = (await response.json()) as {
        success: boolean;
        data?: {
          audio: {
            url: string;
            file_size: number;
            file_name: string;
            content_type: string;
            duration_ms: number;
          };
          metadata: {
            character_count: number;
            generation_time_ms: number;
            model_id: string;
            voice_id: string;
          };
        };
      };

      if (!responseData.success || !responseData.data) {
        throw new Error("Invalid response format from API");
      }

      const result = { data: responseData.data };

      // Update tracking with final result after completion
      if (trackingResult && result?.data) {
        const generationTime = Date.now() - startTime;
        void updateGenerationRequest({
          generation_request_id: trackingResult.generation_request_id,
          status: "completed",
          generation_time_ms: generationTime,
          file_size: result.data.audio?.file_size,
        });

        if (trackingResult.elevenlabs_request_id) {
          void updateElevenLabsRequest({
            elevenlabs_request_id: trackingResult.elevenlabs_request_id,
            output: {
              audio: {
                url: result.data.audio.url,
                file_size: result.data.audio.file_size,
                file_name: result.data.audio.file_name,
                content_type: result.data.audio.content_type,
                duration_ms: result.data.audio.duration_ms,
              },
              metadata: result.data.metadata,
            },
          });
        }
      }

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

      // 2. Call the Runway API route
      const response = await fetch("/api/runway/gen4_turbo/stream", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          promptImage: input.promptImage,
          promptText: input.promptText,
          ratio: input.ratio,
          duration: input.duration,
        }),
      });

      if (!response.ok) {
        const errorData = (await response
          .json()
          .catch(() => ({ error: "Unknown error" }))) as { error: string };
        throw new Error(
          errorData.error ?? `HTTP ${response.status}: ${response.statusText}`,
        );
      }

      // Handle Server-Sent Events
      const reader = response.body?.getReader();
      const decoder = new TextDecoder();

      if (!reader) {
        throw new Error("No response body reader available");
      }

      let result: {
        data: {
          video: {
            url: string;
            file_size: number;
            duration_ms: number;
            content_type: string;
            file_name: string;
          };
          metadata?: {
            model_id: string;
            generation_id: string;
            generation_time_ms: number;
            credits_used: number;
          };
        };
      } | null = null;

      while (true) {
        const { done, value } = await reader.read();

        if (done) break;

        const chunk = decoder.decode(value);
        const lines = chunk.split("\n");

        for (const line of lines) {
          if (line.startsWith("data: ")) {
            try {
              const data = JSON.parse(line.slice(6)) as {
                type: string;
                status?: string;
                data?: {
                  video: {
                    url: string;
                    file_size: number;
                    duration_ms: number;
                    content_type: string;
                    file_name: string;
                  };
                  metadata?: {
                    model_id: string;
                    generation_id: string;
                    generation_time_ms: number;
                    credits_used: number;
                  };
                };
                error?: string;
              };

              if (data.type === "status" && data.status) {
                // Forward progress updates to the original callback
                onProgress?.({
                  status: data.status as
                    | "PREPARING"
                    | "GENERATING"
                    | "PROCESSING"
                    | "COMPLETED"
                    | "FAILED",
                });
              } else if (data.type === "result" && data.data) {
                result = { data: data.data };
              } else if (data.type === "error" && data.error) {
                throw new Error(data.error);
              }
            } catch (parseError) {
              console.error("Error parsing SSE data:", parseError);
            }
          }
        }
      }

      if (!result) {
        throw new Error("No result received from Runway API");
      }

      // Update tracking with final result after completion
      if (trackingResult && result?.data) {
        const generationTime = Date.now() - startTime;
        const creditsUsed = input.duration * 5; // 5 credits per second

        void updateGenerationRequest({
          generation_request_id: trackingResult.generation_request_id,
          status: "completed",
          generation_time_ms: generationTime,
          credits_used: creditsUsed,
          file_size: result.data.video?.file_size,
        });

        if (trackingResult.runway_request_id) {
          void updateRunwayRequest({
            runway_request_id: trackingResult.runway_request_id,
            output: result.data,
          });
        }
      }

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
