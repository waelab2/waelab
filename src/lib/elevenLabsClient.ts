import { env } from "~/env";
import type {
  ElevenLabsResult,
  ElevenLabsStatus,
  ElevenLabsTextToSpeechInput,
} from "~/lib/types";

// Define proper types for ElevenLabs API
interface ElevenLabsVoice {
  voice_id: string;
  name: string;
  labels?: Record<string, string>;
  preview_url?: string;
}

interface ElevenLabsVoicesResponse {
  voices: ElevenLabsVoice[];
}

// === DEBUG CONFIGURATION ===
const DEBUG_ELEVENLABS = true; // Set to false to disable debug logs
const USE_MOCK_IN_DEV = true; // Set to false to test real API in development

function debugLog(message: string, data?: unknown) {
  if (DEBUG_ELEVENLABS) {
    console.log(`🎵 [ElevenLabs Debug] ${message}`, data ?? "");
  }
}

function debugError(message: string, error?: unknown) {
  if (DEBUG_ELEVENLABS) {
    console.error(`🎵❌ [ElevenLabs Error] ${message}`, error ?? "");
  }
}

// === CLIENT INTERFACE ===
export interface ElevenLabsClientInterface {
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

// === PRODUCTION CLIENT ===
class ElevenLabsProductionClient implements ElevenLabsClientInterface {
  private apiKey: string;

  constructor(apiKey: string) {
    this.apiKey = apiKey;

    if (!this.apiKey) {
      debugError("ElevenLabs API key is not provided!");
      throw new Error("ElevenLabs API key is required");
    }

    debugLog("Production client initialized", {
      hasApiKey: !!this.apiKey,
      apiKeyLength: this.apiKey.length,
      apiKeyPreview: this.apiKey.substring(0, 8) + "...",
    });
  }

  async generate(options: {
    input: ElevenLabsTextToSpeechInput;
    onProgress?: (progress: { status: ElevenLabsStatus }) => void;
  }): ElevenLabsResult {
    const { input, onProgress } = options;
    const startTime = Date.now();

    debugLog("Starting generation", {
      text:
        input.text.substring(0, 100) + (input.text.length > 100 ? "..." : ""),
      textLength: input.text.length,
      voiceId: input.voice_id,
      timestamp: new Date().toISOString(),
    });

    onProgress?.({ status: "PREPARING" });

    try {
      // Dynamic import to handle potential module issues
      debugLog("Importing ElevenLabs SDK...");
      const { ElevenLabsClient } = await import("@elevenlabs/elevenlabs-js");

      debugLog("Creating ElevenLabs API client...");
      const client = new ElevenLabsClient({
        apiKey: this.apiKey,
      });

      onProgress?.({ status: "GENERATING" });

      debugLog("Calling textToSpeech.convert...", {
        voiceId: input.voice_id,
        modelId: "eleven_multilingual_v2",
        outputFormat: "mp3_44100_128",
        textLength: input.text.length,
      });

      const audioStream = await client.textToSpeech.convert(input.voice_id, {
        text: input.text,
        modelId: "eleven_multilingual_v2",
        outputFormat: "mp3_44100_128",
      });

      debugLog("Audio stream received, converting to blob...");

      // Convert stream to blob
      const chunks: Uint8Array[] = [];
      if (!audioStream.getReader) {
        throw new Error("Invalid audio stream received");
      }
      const reader = audioStream.getReader();

      let totalSize = 0;
      while (true) {
        const result = await reader.read();
        if (result.done) break;
        if (result.value) {
          chunks.push(result.value);
          totalSize += result.value.length;
          debugLog(
            `Read chunk: ${result.value.length} bytes, total: ${totalSize} bytes`,
          );
        }
      }

      debugLog("Stream reading complete", {
        totalChunks: chunks.length,
        totalSize: totalSize,
        averageChunkSize: totalSize / chunks.length,
      });

      const audioBuffer = new Uint8Array(totalSize);
      let offset = 0;
      for (const chunk of chunks) {
        audioBuffer.set(chunk, offset);
        offset += chunk.length;
      }

      const audioBlob = new Blob([audioBuffer], { type: "audio/mpeg" });
      const audioUrl = URL.createObjectURL(audioBlob);

      debugLog("Blob created successfully", {
        blobSize: audioBlob.size,
        blobType: audioBlob.type,
        urlCreated: !!audioUrl,
      });

      onProgress?.({ status: "COMPLETED" });

      const generationTime = Date.now() - startTime;
      const estimatedDuration = Math.floor(input.text.length * 50); // Rough estimate

      debugLog("Generation completed successfully", {
        generationTimeMs: generationTime,
        estimatedDurationMs: estimatedDuration,
        characterCount: input.text.length,
        audioFileSize: audioBlob.size,
        finalUrl: audioUrl.substring(0, 50) + "...",
      });

      return {
        data: {
          audio: {
            url: audioUrl,
            file_size: audioBlob.size,
            file_name: `arabic_audio_${Date.now()}.mp3`,
            content_type: "audio/mpeg",
            duration_ms: estimatedDuration,
          },
          metadata: {
            model_id: "eleven_multilingual_v2",
            voice_id: input.voice_id,
            character_count: input.text.length,
            generation_time_ms: generationTime,
          },
        },
      };
    } catch (error) {
      const generationTime = Date.now() - startTime;

      debugError("Generation failed", {
        error: error instanceof Error ? error.message : String(error),
        errorStack: error instanceof Error ? error.stack : undefined,
        generationTimeMs: generationTime,
        input: {
          textLength: input.text.length,
          voiceId: input.voice_id,
        },
      });

      onProgress?.({ status: "FAILED" });
      throw error;
    }
  }

  async getVoices() {
    debugLog("Fetching voices from ElevenLabs API...");

    try {
      const { ElevenLabsClient } = await import("@elevenlabs/elevenlabs-js");
      const client = new ElevenLabsClient({ apiKey: this.apiKey });

      const response =
        (await client.voices.getAll()) as unknown as ElevenLabsVoicesResponse;

      debugLog("Voices fetched successfully", {
        totalVoices: response.voices.length,
        voiceNames: response.voices
          .slice(0, 5)
          .map((v: ElevenLabsVoice) => v.name),
      });

      // Filter for Arabic voices
      const arabicVoices = response.voices
        .filter((voice: ElevenLabsVoice) => {
          const isArabicLanguage = voice.labels?.language === "ar";
          const hasArabicAccent =
            voice.labels?.accent?.includes("arabic") ?? false;
          const hasSaudiAccent =
            voice.labels?.accent?.includes("saudi") ?? false;
          const hasArabicInName = voice.name.toLowerCase().includes("arabic");
          const hasSaudiInName = voice.name.toLowerCase().includes("saudi");

          const hasArabicLabel =
            isArabicLanguage ||
            hasArabicAccent ||
            hasSaudiAccent ||
            hasArabicInName ||
            hasSaudiInName;

          if (hasArabicLabel) {
            debugLog("Found Arabic voice", {
              voiceId: voice.voice_id,
              name: voice.name,
              labels: voice.labels,
            });
          }

          return hasArabicLabel;
        })
        .map((voice: ElevenLabsVoice) => ({
          voice_id: voice.voice_id,
          name: voice.name,
          language: "ar" as const,
          accent: voice.labels?.accent ?? "general",
          preview_url: voice.preview_url,
        }));

      debugLog("Arabic voices filtered", {
        arabicVoicesCount: arabicVoices.length,
        arabicVoiceNames: arabicVoices.map((v) => v.name),
      });

      return arabicVoices;
    } catch (error) {
      debugError("Failed to fetch voices", error);
      throw error;
    }
  }
}

// === MOCK CLIENT IMPORT ===
import { elevenLabsMock } from "./mocks/elevenLabsMock";

// === CLIENT FACTORY ===
/**
 * Creates an ElevenLabs client instance.
 * This should only be called on the server side.
 */
export function createElevenLabsClient(): ElevenLabsClientInterface {
  const shouldUseMock =
    USE_MOCK_IN_DEV && process.env.NODE_ENV === "development";

  debugLog("Client selection", {
    nodeEnv: process.env.NODE_ENV,
    useMockInDev: USE_MOCK_IN_DEV,
    shouldUseMock: shouldUseMock,
    clientType: shouldUseMock ? "mock" : "production",
  });

  if (shouldUseMock) {
    debugLog("Using mock client for development");
    return elevenLabsMock;
  } else {
    debugLog("Using production client");
    // Only access environment variables on the server side
    const apiKey = env.ELEVENLABS_API_KEY;
    return new ElevenLabsProductionClient(apiKey);
  }
}

// For backward compatibility and server-side usage
let _serverOnlyClient: ElevenLabsClientInterface | null = null;
export const elevenLabsClient: ElevenLabsClientInterface = new Proxy(
  {} as ElevenLabsClientInterface,
  {
    get(target, prop) {
      // Only create the client when actually used, and only on server side
      if (typeof window !== "undefined") {
        throw new Error(
          "ElevenLabs client should not be used on the client side. Use the API route instead.",
        );
      }

      _serverOnlyClient ??= createElevenLabsClient();

      return _serverOnlyClient[prop as keyof ElevenLabsClientInterface];
    },
  },
);
