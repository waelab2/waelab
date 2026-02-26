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

// === ELEVENLABS TYPES - MINIMAL FOR TEXT-TO-SPEECH ===

/**
 * ElevenLabs Text-to-Speech Input (our internal type)
 * Minimal fields for Arabic text-to-speech generation
 */
export interface ElevenLabsTextToSpeechInput {
  text: string;
  voice_id: string;
}

/**
 * ElevenLabs Text-to-Speech Output (our internal type)
 * What our UI will receive after generation
 */
export interface ElevenLabsTextToSpeechOutput {
  audio: {
    url: string;
    file_size: number;
    file_name: string;
    content_type: string;
    duration_ms?: number;
  };
  metadata?: {
    model_id: string;
    voice_id: string;
    character_count: number;
    generation_time_ms: number;
    credits_used?: number;
  };
}

/**
 * Result type for ElevenLabs generation (matching fal.ai pattern)
 */
export type ElevenLabsResult = Promise<{ data: ElevenLabsTextToSpeechOutput }>;

/**
 * Status for ElevenLabs generation process
 */
export type ElevenLabsStatus =
  | "PREPARING"
  | "GENERATING"
  | "COMPLETED"
  | "FAILED";

// === RUNWAY TYPES - MINIMAL FOR IMAGE-TO-VIDEO ===

/**
 * Runway gen4_turbo Input (our internal type)
 * Minimal fields for image-to-video generation
 */
export interface RunwayGen4TurboInput {
  promptImage: string; // URL or base64-encoded image
  promptText?: string; // Optional text description
  ratio: "16:9" | "9:16" | "1:1"; // Aspect ratio
  duration: 5 | 10; // Video duration in seconds
}

/**
 * Runway gen4_turbo Output (our internal type)
 * What our UI will receive after generation
 */
export interface RunwayGen4TurboOutput {
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
}

/**
 * Result type for Runway generation (matching fal.ai pattern)
 */
export type RunwayGen4TurboResult = Promise<{ data: RunwayGen4TurboOutput }>;

/**
 * Status for Runway generation process
 */
export type RunwayGen4TurboStatus =
  | "PREPARING"
  | "GENERATING"
  | "PROCESSING"
  | "COMPLETED"
  | "FAILED";
