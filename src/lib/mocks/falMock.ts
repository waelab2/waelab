import type {
  Status,
  VideoGenerationInput,
  VideoGenerationOutput,
} from "~/lib/types";
import {
  ModelSchemaFetcher,
  type ModelSchema,
} from "~/lib/utils/schema-fetcher";

export interface MockFalClient {
  config: (config: { proxyUrl: string }) => void;
  subscribe: (
    model: string,
    options: {
      input: VideoGenerationInput;
      pollInterval: number;
      logs: boolean;
      onQueueUpdate: (update: { status: Status }) => void;
    },
  ) => Promise<{ data: VideoGenerationOutput }>;
}

// Input validation function
function validateInput(
  input: VideoGenerationInput,
  schema: ModelSchema,
): { isValid: boolean; errors: string[] } {
  const errors: string[] = [];

  // Check required fields
  if (!input.prompt) {
    errors.push("prompt is required");
  }

  // Check prompt length
  if (
    input.prompt &&
    input.prompt.length > schema.constraints.max_prompt_length
  ) {
    errors.push(
      `prompt exceeds maximum length of ${schema.constraints.max_prompt_length}`,
    );
  }

  // Check duration
  if (
    input.duration &&
    !schema.constraints.supported_durations.includes(input.duration)
  ) {
    errors.push(
      `duration must be one of: ${schema.constraints.supported_durations.join(", ")}`,
    );
  }

  // Check aspect ratio (if supported by model)
  if (input.aspect_ratio && schema.constraints.supported_aspect_ratios) {
    if (
      !schema.constraints.supported_aspect_ratios.includes(input.aspect_ratio)
    ) {
      errors.push(
        `aspect_ratio must be one of: ${schema.constraints.supported_aspect_ratios.join(", ")}`,
      );
    }
  }

  // Check cfg_scale range (if supported by model)
  if (input.cfg_scale !== undefined && schema.constraints.cfg_scale_range) {
    const { min, max } = schema.constraints.cfg_scale_range;
    if (input.cfg_scale < min || input.cfg_scale > max) {
      errors.push(`cfg_scale must be between ${min} and ${max}`);
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}

// Generate realistic file metadata
function generateMockFileMetadata(): {
  file_size: number;
  file_name: string;
  content_type: string;
} {
  const fileSize = Math.floor(Math.random() * 5000000) + 1000000; // 1-6MB
  const fileName = `mock_video_${Date.now()}.mp4`;
  const contentType = "video/mp4";

  return {
    file_size: fileSize,
    file_name: fileName,
    content_type: contentType,
  };
}

// Calculate realistic generation time based on model and duration
function calculateGenerationTime(modelId: string, duration?: string): number {
  // const baseTimes = {
  //   "fal-ai/kling-video/v2.1/master/text-to-video": 10000, // 10 seconds
  //   "fal-ai/kling-video/v2/master/text-to-video": 8000, // 8 seconds
  //   "fal-ai/kling-video/v1.6/pro/text-to-video": 6000, // 6 seconds
  //   "fal-ai/minimax/hailuo-02/standard/text-to-video": 7000, // 7 seconds
  // };

  // const baseTime = baseTimes[modelId as keyof typeof baseTimes] || 8000;
  const baseTime = 60 * 1000;

  // Add extra time for longer videos
  const durationMultiplier =
    duration === "10" ? 1.5 : duration === "6" ? 1.1 : 1;

  return Math.floor(baseTime * durationMultiplier);
}

export const falMock: MockFalClient = {
  config: (config: { proxyUrl: string }) => {
    console.log("🎬 Mock fal.ai config:", config);
  },

  subscribe: async (
    model: string,
    options: {
      input: VideoGenerationInput;
      pollInterval: number;
      logs: boolean;
      onQueueUpdate: (update: { status: Status }) => void;
    },
  ): Promise<{ data: VideoGenerationOutput }> => {
    const { input, onQueueUpdate } = options;

    console.log(`🎬 Mock video generation started for model: ${model}`);
    console.log(`🎬 Input:`, input);

    try {
      // Fetch the model's schema dynamically for validation
      console.log(`🔍 Mock client: Fetching schema for ${model}`);
      const modelInfo = await ModelSchemaFetcher.getModelInfo(model);

      if (!modelInfo) {
        console.warn(
          `🔍 Mock client: No model info found for ${model}, using fallback`,
        );
        throw new Error(`Model ${model} not found or unavailable`);
      }

      console.log(`🔍 Mock client: Successfully fetched schema for ${model}`);
      console.log(`🔍 Mock client: Schema data:`, modelInfo.schema);

      // Validate input against the actual schema
      const validationResult = validateInput(input, modelInfo.schema);
      if (!validationResult.isValid) {
        console.warn(
          `🔍 Mock client: Input validation failed:`,
          validationResult.errors,
        );
        throw new Error(`Invalid input: ${validationResult.errors.join(", ")}`);
      }

      console.log(`🔍 Mock client: Input validation passed`);

      // Get the preview URL from schema or fallback
      const previewUrl = modelInfo.schema.preview_url;
      console.log(`🔍 Mock client: Preview URL from schema: ${previewUrl}`);

      if (!previewUrl) {
        console.warn(
          `🔍 Mock client: No preview URL in schema, using fallback`,
        );
        throw new Error(`No preview video available for model ${model}`);
      }

      // Calculate realistic generation time
      const generationTime = calculateGenerationTime(model, input.duration);

      // Simulate realistic video generation timing
      setTimeout(() => {
        console.log(`🎬 ${model}: IN_QUEUE`);
        onQueueUpdate({ status: "IN_QUEUE" });
      }, 100);

      setTimeout(() => {
        console.log(`🎬 ${model}: IN_PROGRESS`);
        onQueueUpdate({ status: "IN_PROGRESS" });
      }, 2000);

      setTimeout(() => {
        console.log(`🎬 ${model}: COMPLETED`);
        onQueueUpdate({ status: "COMPLETED" });
      }, generationTime - 1000);

      // Return a promise that resolves with mock video data
      return new Promise((resolve) => {
        setTimeout(() => {
          const mockMetadata = generateMockFileMetadata();

          const result = {
            data: {
              video: {
                url: previewUrl,
                file_size: mockMetadata.file_size,
                file_name: mockMetadata.file_name,
                content_type: mockMetadata.content_type,
              },
            },
          };

          console.log(`🎬 Mock generation completed:`, result);
          resolve(result);
        }, generationTime);
      });
    } catch (error) {
      console.error(`🎬 Mock generation failed for ${model}:`, error);

      // Still provide a working mock even if schema fetching fails
      setTimeout(() => onQueueUpdate({ status: "IN_QUEUE" }), 100);
      setTimeout(() => onQueueUpdate({ status: "IN_PROGRESS" }), 2000);
      setTimeout(() => onQueueUpdate({ status: "COMPLETED" }), 8 * 1000);

      return new Promise((resolve) => {
        setTimeout(() => {
          const mockMetadata = generateMockFileMetadata();

          resolve({
            data: {
              video: {
                url: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4",
                file_size: mockMetadata.file_size,
                file_name: mockMetadata.file_name,
                content_type: mockMetadata.content_type,
              },
            },
          });
        }, 8 * 1000);
      });
    }
  },
};
