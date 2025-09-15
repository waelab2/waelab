import type {
  RunwayGen4TurboInput,
  RunwayGen4TurboOutput,
  RunwayGen4TurboResult,
  RunwayGen4TurboStatus,
} from "~/lib/types";

// === MOCK CONFIGURATION ===
const MOCK_GENERATION_TIME_MS = 15000; // 15 seconds to simulate real generation time
const MOCK_POLL_INTERVAL_MS = 2000; // 2 seconds between status updates

function mockLog(message: string, data?: unknown) {
  console.log(`🎬🎭 [Runway Mock] ${message}`, data ?? "");
}

function mockError(message: string, error?: unknown) {
  console.error(`🎬🎭❌ [Runway Mock Error] ${message}`, error ?? "");
}

// === MOCK CLIENT ===
export const runwayMock: {
  generate: (options: {
    input: RunwayGen4TurboInput;
    onProgress?: (progress: { status: RunwayGen4TurboStatus }) => void;
  }) => RunwayGen4TurboResult;
} = {
  async generate(options: {
    input: RunwayGen4TurboInput;
    onProgress?: (progress: { status: RunwayGen4TurboStatus }) => void;
  }): RunwayGen4TurboResult {
    const { input, onProgress } = options;
    const startTime = Date.now();

    mockLog("Starting mock generation", {
      promptImageLength: input.promptImage.length,
      promptText:
        input.promptText?.substring(0, 100) +
        (input.promptText && input.promptText.length > 100 ? "..." : ""),
      ratio: input.ratio,
      duration: input.duration,
      timestamp: new Date().toISOString(),
    });

    // Validate input
    if (!input.promptImage) {
      const error = new Error("promptImage is required");
      mockError("Validation failed", error);
      throw error;
    }

    if (!["16:9", "9:16", "1:1"].includes(input.ratio)) {
      const error = new Error("Invalid ratio. Must be 16:9, 9:16, or 1:1");
      mockError("Validation failed", error);
      throw error;
    }

    if (![5, 10].includes(input.duration)) {
      const error = new Error("Invalid duration. Must be 5 or 10 seconds");
      mockError("Validation failed", error);
      throw error;
    }

    onProgress?.({ status: "PREPARING" });

    try {
      // Simulate preparation time
      await new Promise((resolve) => setTimeout(resolve, 2000));
      mockLog("Preparation complete");

      onProgress?.({ status: "GENERATING" });

      // Simulate generation process with status updates
      const totalSteps = Math.floor(
        MOCK_GENERATION_TIME_MS / MOCK_POLL_INTERVAL_MS,
      );
      let currentStep = 0;

      while (currentStep < totalSteps) {
        await new Promise((resolve) =>
          setTimeout(resolve, MOCK_POLL_INTERVAL_MS),
        );
        currentStep++;

        const progress = (currentStep / totalSteps) * 100;
        mockLog(
          `Generation progress: ${progress.toFixed(1)}% (${currentStep}/${totalSteps})`,
        );

        onProgress?.({ status: "PROCESSING" });
      }

      onProgress?.({ status: "PROCESSING" });

      // Simulate final processing
      await new Promise((resolve) => setTimeout(resolve, 3000));

      onProgress?.({ status: "COMPLETED" });

      const generationTime = Date.now() - startTime;
      const generationId = `mock_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      const creditsUsed = input.duration * 5; // 5 credits per second

      // Use the exact video URL from your example
      const mockVideoUrl =
        "https://dnznrvs05pmza.cloudfront.net/aff85adf-29cd-4746-9dce-95cdd2c12ba0.mp4?_jwt=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJrZXlIYXNoIjoiNDUxNTA5NmFjYjNiNzUyMiIsImJ1Y2tldCI6InJ1bndheS10YXNrLWFydGlmYWN0cyIsInN0YWdlIjoicHJvZCIsImV4cCI6MTc1ODA2NzIwMH0.P8LJhrhvdqK4BTqMORV7NoFLNfmK4yNJXFW4jkdIFfk";

      mockLog("Mock generation completed successfully", {
        generationId: generationId,
        generationTimeMs: generationTime,
        videoUrl: mockVideoUrl.substring(0, 50) + "...",
        creditsUsed: creditsUsed,
        duration: input.duration,
        ratio: input.ratio,
      });

      const result: { data: RunwayGen4TurboOutput } = {
        data: {
          video: {
            url: mockVideoUrl,
            file_size: 2873665, // Exact file size from your example
            file_name:
              "runway_gen4_turbo_0e4e66f0-7e74-493e-863a-f3ac8ce19371.mp4",
            content_type: "video/mp4",
            duration_ms: input.duration * 1000,
          },
          metadata: {
            model_id: "runway/gen4_turbo",
            generation_id: "0e4e66f0-7e74-493e-863a-f3ac8ce19371",
            generation_time_ms: 22470, // Exact generation time from your example
            credits_used: 25, // Exact credits from your example
          },
        },
      };

      mockLog("Mock result created", {
        videoUrl: result.data.video.url.substring(0, 50) + "...",
        fileSize: result.data.video.file_size,
        metadata: result.data.metadata,
      });

      return result;
    } catch (error) {
      const generationTime = Date.now() - startTime;

      mockError("Mock generation failed", {
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
  },
};

// === MOCK UTILITY FUNCTIONS ===

/**
 * Test function to verify Runway mock integration
 */
export async function testRunwayMockIntegration(
  testImage = "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwCdABmX/9k=",
) {
  mockLog("Starting Runway mock integration test", {
    testImageLength: testImage.length,
  });

  try {
    const result = await runwayMock.generate({
      input: {
        promptImage: testImage,
        promptText: "A beautiful sunset over mountains",
        ratio: "16:9",
        duration: 5,
      },
      onProgress: (progress) => {
        mockLog("Mock test progress update", progress);
      },
    });

    mockLog("Mock integration test completed successfully", {
      videoUrl: result.data.video.url.substring(0, 50) + "...",
      fileSize: result.data.video.file_size,
      metadata: result.data.metadata,
    });

    return result;
  } catch (error) {
    mockError("Mock integration test failed", error);
    throw error;
  }
}
