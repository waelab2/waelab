export type Status = "IN_QUEUE" | "IN_PROGRESS" | "COMPLETED";

export interface VideoGenerationInput {
  prompt: string;
  duration?: "5" | "6" | "10";
  aspect_ratio?: "16:9" | "9:16" | "1:1";
  negative_prompt?: string;
  cfg_scale?: number;
  prompt_optimizer?: boolean;
}

// Video generation output types
export interface VideoGenerationOutput {
  video: {
    url: string;
    file_size: number;
    file_name: string;
    content_type: string;
  };
}

// Result type for video generation
export type Result = Promise<{ data: VideoGenerationOutput }>;

export type AspectRatio = "16:9" | "9:16" | "1:1";
export type Duration = "5" | "6" | "10";
