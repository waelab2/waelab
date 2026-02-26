import RunwayML, { TaskFailedError } from "@runwayml/sdk";
import { env } from "~/env";
import type {
  RunwayGen4TurboInput,
  RunwayGen4TurboResult,
  RunwayGen4TurboStatus,
} from "~/lib/types";

// === DEBUG CONFIGURATION ===
const DEBUG_RUNWAY = true; // Set to false to disable debug logs
const USE_MOCK_IN_DEV = false; // Set to false to test real API in development

function debugLog(message: string, data?: unknown) {
  if (DEBUG_RUNWAY) {
    console.log(`🎬 [Runway Debug] ${message}`, data ?? "");
  }
}

function debugError(message: string, error?: unknown) {
  if (DEBUG_RUNWAY) {
    console.error(`🎬❌ [Runway Error] ${message}`, error ?? "");
  }
}

// === CLIENT INTERFACE ===
export interface RunwayClientInterface {
  generate: (options: {
    input: RunwayGen4TurboInput;
    onProgress?: (progress: { status: RunwayGen4TurboStatus }) => void;
  }) => RunwayGen4TurboResult;
}

// === PRODUCTION CLIENT ===
class RunwayProductionClient implements RunwayClientInterface {
  private client: RunwayML;

  constructor(apiKey: string) {
    if (!apiKey) {
      debugError("Runway API key is not provided!");
      throw new Error("Runway API key is required");
    }

    // Initialize the Runway SDK client
    this.client = new RunwayML({
      apiKey: apiKey,
    });

    debugLog("Production client initialized with SDK", {
      hasApiKey: !!apiKey,
      apiKeyLength: apiKey.length,
      apiKeyPreview: apiKey.substring(0, 8) + "...",
    });
  }

  async generate(options: {
    input: RunwayGen4TurboInput;
    onProgress?: (progress: { status: RunwayGen4TurboStatus }) => void;
  }): RunwayGen4TurboResult {
    const { input, onProgress } = options;
    const startTime = Date.now();

    debugLog("Starting generation with SDK", {
      promptImageLength: input.promptImage.length,
      promptText:
        input.promptText?.substring(0, 100) +
        (input.promptText && input.promptText.length > 100 ? "..." : ""),
      ratio: input.ratio,
      duration: input.duration,
      timestamp: new Date().toISOString(),
    });

    onProgress?.({ status: "PREPARING" });

    try {
      debugLog("Creating image-to-video task with SDK...");

      // Convert our ratio format to Runway's format
      const runwayRatio =
        input.ratio === "16:9"
          ? "1280:720"
          : input.ratio === "9:16"
            ? "720:1280"
            : "960:960"; // 1:1

      onProgress?.({ status: "GENERATING" });

      // Use the SDK to create and wait for the task
      const task = await this.client.imageToVideo
        .create({
          model: "gen4_turbo",
          promptImage: input.promptImage,
          promptText: input.promptText,
          ratio: runwayRatio,
          duration: input.duration,
        })
        .waitForTaskOutput();

      onProgress?.({ status: "COMPLETED" });

      const generationTime = Date.now() - startTime;
      const durationMs = input.duration * 1000;
      const creditsUsed = input.duration * 5; // 5 credits per second

      debugLog("Generation completed successfully with SDK", {
        generationTimeMs: generationTime,
        taskId: task.id,
        outputUrl: task.output?.[0]?.substring(0, 50) + "...",
        durationMs: durationMs,
        creditsUsed: creditsUsed,
      });

      // Get video metadata
      const videoUrl = task.output?.[0];
      if (!videoUrl) {
        throw new Error("No video output received from Runway");
      }

      // Fetch video to get file size
      const videoResponse = await fetch(videoUrl);
      const videoBlob = await videoResponse.blob();
      const videoFileSize = videoBlob.size;

      return {
        data: {
          video: {
            url: videoUrl,
            file_size: videoFileSize,
            file_name: `runway_gen4_turbo_${task.id}.mp4`,
            content_type: "video/mp4",
            duration_ms: durationMs,
          },
          metadata: {
            model_id: "runway/gen4_turbo",
            generation_id: task.id,
            generation_time_ms: generationTime,
            credits_used: creditsUsed,
          },
        },
      };
    } catch (error) {
      const generationTime = Date.now() - startTime;

      if (error instanceof TaskFailedError) {
        debugError("Task failed with SDK", {
          error: error.message,
          taskDetails: error.taskDetails,
          generationTimeMs: generationTime,
        });
        onProgress?.({ status: "FAILED" });
        throw new Error(`Generation failed: ${error.message}`);
      } else {
        debugError("Generation failed with SDK", {
          error: error instanceof Error ? error.message : String(error),
          errorStack: error instanceof Error ? error.stack : undefined,
          generationTimeMs: generationTime,
          input: {
            promptImageLength: input.promptImage.length,
            promptText: input.promptText,
            ratio: input.ratio,
            duration: input.duration,
          },
        });
        onProgress?.({ status: "FAILED" });
        throw error;
      }
    }
  }
}

// === MOCK CLIENT IMPORT ===
import { runwayMock } from "~/lib/mocks/runwayMock";

// === CLIENT FACTORY ===
/**
 * Creates a Runway client instance.
 * This should only be called on the server side.
 */
export function createRunwayClient(): RunwayClientInterface {
  const shouldUseMock =
    USE_MOCK_IN_DEV && process.env.NODE_ENV === "development";

  debugLog("Client selection", {
    nodeEnv: process.env.NODE_ENV,
    useMockInDev: USE_MOCK_IN_DEV,
    shouldUseMock: shouldUseMock,
    clientType: shouldUseMock ? "mock" : "production",
  });

  if (shouldUseMock) {
    debugLog("Using mock client");
    return runwayMock;
  } else {
    debugLog("Using production client");
    // Only access environment variables on the server side
    const apiKey = env.RUNWAY_API_KEY;
    return new RunwayProductionClient(apiKey);
  }
}

// For backward compatibility and server-side usage
let _serverOnlyClient: RunwayClientInterface | null = null;
export const runwayClient: RunwayClientInterface = new Proxy(
  {} as RunwayClientInterface,
  {
    get(target, prop) {
      // Only create the client when actually used, and only on server side
      if (typeof window !== "undefined") {
        throw new Error(
          "Runway client should not be used on the client side. Use the API route instead.",
        );
      }

      _serverOnlyClient ??= createRunwayClient();

      return _serverOnlyClient[prop as keyof RunwayClientInterface];
    },
  },
);
