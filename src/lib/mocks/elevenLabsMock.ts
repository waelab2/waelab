import { saudiArabicVoices } from "~/lib/constants";
import type {
  ElevenLabsResult,
  ElevenLabsStatus,
  ElevenLabsTextToSpeechInput,
} from "~/lib/types";

// === MOCK CLIENT INTERFACE ===
export interface MockElevenLabsClient {
  generate: (options: {
    input: ElevenLabsTextToSpeechInput;
    onProgress?: (progress: { status: ElevenLabsStatus }) => void;
  }) => ElevenLabsResult;
  getVoices?: () => Promise<
    Array<{
      voice_id: string;
      name: string;
      language: string;
      accent?: string;
      preview_url?: string;
    }>
  >;
}

// === DEBUG FUNCTIONS ===
function mockLog(message: string, data?: unknown) {
  console.log(`🎵🎭 [ElevenLabs Mock] ${message}`, data ?? "");
}

function mockError(message: string, error?: unknown) {
  console.error(`🎵🎭❌ [ElevenLabs Mock Error] ${message}`, error ?? "");
}

// === INPUT VALIDATION ===
function validateAudioInput(input: ElevenLabsTextToSpeechInput): {
  isValid: boolean;
  errors: string[];
} {
  const errors: string[] = [];

  // Check required fields
  if (!input.text || input.text.trim().length === 0) {
    errors.push("text is required and cannot be empty");
  }

  if (!input.voice_id || input.voice_id.trim().length === 0) {
    errors.push("voice_id is required and cannot be empty");
  }

  // Check text length constraints
  if (input.text && input.text.length > 5000) {
    errors.push(
      `text exceeds maximum length of 5000 characters (current: ${input.text.length})`,
    );
  }

  if (input.text && input.text.length < 1) {
    errors.push("text must be at least 1 character long");
  }

  // Check if voice_id exists in our mock voices
  if (
    input.voice_id &&
    !saudiArabicVoices.find((v) => v.voice_id === input.voice_id)
  ) {
    mockLog("Warning: voice_id not found in mock voices, will use fallback", {
      requestedVoiceId: input.voice_id,
      availableVoices: saudiArabicVoices.map((v) => ({
        id: v.voice_id,
        name: v.name,
      })),
    });
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}

// === MOCK AUDIO GENERATION ===
function generateMockAudioMetadata(text: string): {
  file_size: number;
  file_name: string;
  content_type: string;
  duration_ms: number;
} {
  // Realistic estimates based on Arabic TTS
  const estimatedDuration = Math.floor(text.length * 60); // ~60ms per character for Arabic
  const fileSize = Math.floor(estimatedDuration * 18); // ~18 bytes per ms for MP3 128kbps
  const fileName = `mock_arabic_audio_${Date.now()}.mp3`;

  mockLog("Generated mock audio metadata", {
    textLength: text.length,
    estimatedDurationMs: estimatedDuration,
    estimatedFileSizeBytes: fileSize,
    fileName: fileName,
  });

  return {
    file_size: fileSize,
    file_name: fileName,
    content_type: "audio/mpeg",
    duration_ms: estimatedDuration,
  };
}

// === MOCK TIMING CALCULATION ===
function calculateMockGenerationTime(text: string): number {
  // Simulate realistic generation times based on text length
  const baseTime = 1500; // 1.5 seconds minimum
  const timePerChar = 20; // 20ms per character
  const randomVariation = Math.random() * 1000; // Up to 1 second random variation

  const totalTime = Math.floor(
    baseTime + text.length * timePerChar + randomVariation,
  );

  mockLog("Calculated mock generation time", {
    textLength: text.length,
    baseTimeMs: baseTime,
    timePerCharMs: timePerChar,
    randomVariationMs: randomVariation,
    totalTimeMs: totalTime,
  });

  return totalTime;
}

// === MOCK PREVIEW AUDIO URLs ===
function getMockPreviewUrl(voiceId: string): string {
  // Find the voice in our constants
  const voice = saudiArabicVoices.find((v) => v.voice_id === voiceId);
  if (voice?.preview_url) {
    return voice.preview_url;
  }

  // Fallback to a generic Arabic audio sample
  const fallbackUrls = [
    "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/SampleAudio_0.4mb_mp3.mp3",
    "https://www.soundjay.com/misc/sounds/fail-buzzer-02.mp3", // Fallback
    "data:audio/mpeg;base64,SUQzBAAAAAAAI1RTU0UAAAAPAAADTGF2ZjU4Ljc2LjEwMAAAAAAAAAAAAAAA//tQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAWGluZwAAAA8AAAACAAABIADAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDQ0NDQ0NDQ0NDQ0NDQ0NDQ0NDQ0NDQ0NDQ0NDQ0NDQ0NDQ0NDQ0PDw8PDw8PDw8PDw8PDw8PDw8PDw8PDw8PDw8PDw8PDw8PDw8PDw8P/7kGQAAP8AAGkAAAAIAAANIAAAAQAAAaQAAAAgAAA0gAAABE1MQU1FMy4xMDBVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVV",
  ];

  mockLog("Using fallback preview URL for voice", {
    voiceId: voiceId,
    fallbackUrl: fallbackUrls[0],
  });

  return (
    fallbackUrls[0] ??
    "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/SampleAudio_0.4mb_mp3.mp3"
  );
}

// === MAIN MOCK CLIENT ===
export const elevenLabsMock: MockElevenLabsClient = {
  generate: async (options: {
    input: ElevenLabsTextToSpeechInput;
    onProgress?: (progress: { status: ElevenLabsStatus }) => void;
  }): ElevenLabsResult => {
    const { input, onProgress } = options;
    const startTime = Date.now();

    mockLog("Mock audio generation started", {
      text:
        input.text.substring(0, 100) + (input.text.length > 100 ? "..." : ""),
      textLength: input.text.length,
      voiceId: input.voice_id,
      timestamp: new Date().toISOString(),
    });

    try {
      // Validate input
      const validationResult = validateAudioInput(input);
      if (!validationResult.isValid) {
        mockError("Input validation failed", {
          errors: validationResult.errors,
          input: {
            textLength: input.text.length,
            voiceId: input.voice_id,
          },
        });
        throw new Error(`Invalid input: ${validationResult.errors.join(", ")}`);
      }

      mockLog("Input validation passed");

      // Get preview URL for the voice
      const previewUrl = getMockPreviewUrl(input.voice_id);

      // Calculate realistic generation time
      const generationTime = calculateMockGenerationTime(input.text);

      // Simulate realistic timing progression
      setTimeout(() => {
        mockLog("Status: PREPARING");
        onProgress?.({ status: "PREPARING" });
      }, 100);

      setTimeout(
        () => {
          mockLog("Status: GENERATING");
          onProgress?.({ status: "GENERATING" });
        },
        Math.floor(generationTime * 0.2),
      );

      // Return promise that resolves with mock data
      return new Promise((resolve) => {
        setTimeout(() => {
          const mockMetadata = generateMockAudioMetadata(input.text);
          const finalGenerationTime = Date.now() - startTime;

          const result = {
            data: {
              audio: {
                url: previewUrl,
                file_size: mockMetadata.file_size,
                file_name: mockMetadata.file_name,
                content_type: mockMetadata.content_type,
                duration_ms: mockMetadata.duration_ms,
              },
              metadata: {
                model_id: "eleven_multilingual_v2",
                voice_id: input.voice_id,
                character_count: input.text.length,
                generation_time_ms: finalGenerationTime,
              },
            },
          };

          mockLog("Mock generation completed successfully", {
            generationTimeMs: finalGenerationTime,
            audioFileSize: mockMetadata.file_size,
            audioDurationMs: mockMetadata.duration_ms,
            characterCount: input.text.length,
            previewUrl: previewUrl.substring(0, 50) + "...",
          });

          onProgress?.({ status: "COMPLETED" });
          resolve(result);
        }, generationTime);
      });
    } catch (error) {
      const generationTime = Date.now() - startTime;

      mockError("Mock generation failed", {
        error: error instanceof Error ? error.message : String(error),
        generationTimeMs: generationTime,
        input: {
          textLength: input.text.length,
          voiceId: input.voice_id,
        },
      });

      // Still provide a fallback even if there's an error
      setTimeout(() => onProgress?.({ status: "PREPARING" }), 100);
      setTimeout(() => onProgress?.({ status: "GENERATING" }), 1000);
      setTimeout(() => onProgress?.({ status: "COMPLETED" }), 2000);

      return new Promise((resolve) => {
        setTimeout(() => {
          const mockMetadata = generateMockAudioMetadata(input.text);
          const fallbackUrl =
            "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/SampleAudio_0.4mb_mp3.mp3";

          resolve({
            data: {
              audio: {
                url: fallbackUrl,
                file_size: mockMetadata.file_size,
                file_name: mockMetadata.file_name,
                content_type: mockMetadata.content_type,
                duration_ms: mockMetadata.duration_ms,
              },
              metadata: {
                model_id: "eleven_multilingual_v2",
                voice_id: input.voice_id,
                character_count: input.text.length,
                generation_time_ms: Date.now() - startTime,
              },
            },
          });
        }, 2500);
      });
    }
  },

  getVoices: async () => {
    mockLog("Mock: Fetching Saudi Arabic voices");

    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 500));

    const mockVoices = saudiArabicVoices.map((voice) => ({
      voice_id: voice.voice_id,
      name: voice.name,
      language: voice.language,
      accent: voice.accent,
      preview_url: voice.preview_url,
    }));

    mockLog("Mock voices fetched successfully", {
      voiceCount: mockVoices.length,
      voices: mockVoices.map((v) => ({ id: v.voice_id, name: v.name })),
    });

    return mockVoices;
  },
};
