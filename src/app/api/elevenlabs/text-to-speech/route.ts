import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { env } from "~/env";

// === DEBUG CONFIGURATION ===
const DEBUG_API = true; // Set to false to disable debug logs

function apiLog(message: string, data?: unknown) {
  if (DEBUG_API) {
    console.log(`🎵🔄 [ElevenLabs API] ${message}`, data ?? "");
  }
}

function apiError(message: string, error?: unknown) {
  if (DEBUG_API) {
    console.error(`🎵🔄❌ [ElevenLabs API Error] ${message}`, error ?? "");
  }
}

// === REQUEST VALIDATION ===
interface TTSRequestBody {
  text: string;
  voice_id: string;
}

function validateRequest(body: unknown): {
  isValid: boolean;
  errors: string[];
  data?: TTSRequestBody;
} {
  const errors: string[] = [];

  if (!body) {
    errors.push("Request body is required");
    return { isValid: false, errors };
  }

  const bodyObj = body as Record<string, unknown>;

  if (
    !bodyObj.text ||
    typeof bodyObj.text !== "string" ||
    bodyObj.text.trim().length === 0
  ) {
    errors.push("text field is required and must be a non-empty string");
  }

  if (
    !bodyObj.voice_id ||
    typeof bodyObj.voice_id !== "string" ||
    bodyObj.voice_id.trim().length === 0
  ) {
    errors.push("voice_id field is required and must be a non-empty string");
  }

  if (
    bodyObj.text &&
    typeof bodyObj.text === "string" &&
    bodyObj.text.length > 5000
  ) {
    errors.push(
      `text exceeds maximum length of 5000 characters (current: ${bodyObj.text.length})`,
    );
  }

  if (errors.length === 0) {
    return {
      isValid: true,
      errors: [],
      data: {
        text: (bodyObj.text as string).trim(),
        voice_id: (bodyObj.voice_id as string).trim(),
      },
    };
  }

  return { isValid: false, errors };
}

// === MAIN API HANDLER ===
export async function POST(request: NextRequest) {
  const startTime = Date.now();
  const requestId = `req_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;

  apiLog("Incoming TTS request", {
    requestId,
    method: request.method,
    url: request.url,
    timestamp: new Date().toISOString(),
    userAgent: request.headers.get("user-agent")?.substring(0, 50),
  });

  try {
    // Parse request body
    let body: unknown;
    try {
      body = await request.json();
      const bodyObj = body as Record<string, unknown>;
      apiLog("Request body parsed", {
        requestId,
        hasText: !!bodyObj?.text,
        textLength: (bodyObj?.text as string)?.length ?? 0,
        hasVoiceId: !!bodyObj?.voice_id,
        voiceId: bodyObj?.voice_id,
      });
    } catch (parseError) {
      apiError("Failed to parse request body", {
        requestId,
        error:
          parseError instanceof Error ? parseError.message : String(parseError),
      });
      return NextResponse.json(
        {
          error: "Invalid JSON in request body",
          requestId,
        },
        { status: 400 },
      );
    }

    // Validate request
    const validation = validateRequest(body);
    if (!validation.isValid) {
      apiError("Request validation failed", {
        requestId,
        errors: validation.errors,
        receivedBody: body,
      });
      return NextResponse.json(
        {
          error: "Validation failed",
          details: validation.errors,
          requestId,
        },
        { status: 400 },
      );
    }

    const { text, voice_id } = validation.data!;

    apiLog("Request validation passed", {
      requestId,
      textLength: text.length,
      voiceId: voice_id,
      textPreview: text.substring(0, 100) + (text.length > 100 ? "..." : ""),
    });

    // Check for API key
    const apiKey = env.ELEVENLABS_API_KEY as string;
    if (!apiKey) {
      apiError("ElevenLabs API key not configured", { requestId });
      return NextResponse.json(
        {
          error: "Server configuration error",
          requestId,
        },
        { status: 500 },
      );
    }

    apiLog("API key found", {
      requestId,
      apiKeyLength: apiKey.length,
      apiKeyPrefix: apiKey.substring(0, 8) + "...",
    });

    // Import and create ElevenLabs client directly
    apiLog("Importing ElevenLabs SDK", { requestId });
    const { ElevenLabsClient } = await import("@elevenlabs/elevenlabs-js");

    apiLog("Creating ElevenLabs client", { requestId });
    const client = new ElevenLabsClient({
      apiKey: apiKey,
    });

    // Make the TTS request
    apiLog("Calling ElevenLabs TTS API", {
      requestId,
      voiceId: voice_id,
      modelId: "eleven_multilingual_v2",
      outputFormat: "mp3_44100_128",
      textLength: text.length,
    });

    const audioStream = await client.textToSpeech.convert(voice_id, {
      text: text,
      modelId: "eleven_multilingual_v2",
      outputFormat: "mp3_44100_128",
    });

    apiLog("Audio stream received, converting to buffer", { requestId });

    // Convert stream to buffer
    const chunks: Uint8Array[] = [];
    const reader = audioStream.getReader();

    let totalSize = 0;
    let chunkCount = 0;
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      chunks.push(value);
      totalSize += value.length;
      chunkCount++;

      if (chunkCount % 10 === 0) {
        // Log every 10th chunk to avoid spam
        apiLog(
          `Stream progress: chunk ${chunkCount}, total size: ${totalSize} bytes`,
          { requestId },
        );
      }
    }

    apiLog("Stream conversion completed", {
      requestId,
      totalChunks: chunkCount,
      totalSizeBytes: totalSize,
      averageChunkSize: Math.round(totalSize / chunkCount),
    });

    const audioBuffer = Buffer.concat(chunks);

    const processingTime = Date.now() - startTime;

    apiLog("TTS request completed successfully", {
      requestId,
      processingTimeMs: processingTime,
      audioSizeBytes: audioBuffer.length,
      textLength: text.length,
      charactersPerSecond: Math.round((text.length / processingTime) * 1000),
    });

    return new NextResponse(audioBuffer, {
      headers: {
        "Content-Type": "audio/mpeg",
        "Content-Length": audioBuffer.length.toString(),
        "X-Request-ID": requestId,
        "X-Processing-Time-Ms": processingTime.toString(),
        "X-Audio-Size-Bytes": audioBuffer.length.toString(),
        "Cache-Control": "public, max-age=3600", // Cache for 1 hour
      },
    });
  } catch (error) {
    const processingTime = Date.now() - startTime;

    apiError("TTS request failed", {
      requestId,
      processingTimeMs: processingTime,
      error: error instanceof Error ? error.message : String(error),
      errorStack: error instanceof Error ? error.stack : undefined,
      errorName: error instanceof Error ? error.name : "UnknownError",
    });

    // Determine error type and appropriate response
    let statusCode = 500;
    let errorMessage = "Internal server error";

    if (error instanceof Error) {
      if (
        error.message.includes("voice_id") ||
        error.message.includes("voice not found")
      ) {
        statusCode = 400;
        errorMessage = "Invalid voice ID";
      } else if (
        error.message.includes("API key") ||
        error.message.includes("unauthorized")
      ) {
        statusCode = 401;
        errorMessage = "Authentication failed";
      } else if (
        error.message.includes("quota") ||
        error.message.includes("limit")
      ) {
        statusCode = 429;
        errorMessage = "Rate limit exceeded";
      } else if (
        error.message.includes("text too long") ||
        error.message.includes("character limit")
      ) {
        statusCode = 400;
        errorMessage = "Text too long";
      }
    }

    return NextResponse.json(
      {
        error: errorMessage,
        requestId,
        processingTimeMs: processingTime,
        // Include original error in development
        ...(process.env.NODE_ENV === "development" && {
          originalError: error instanceof Error ? error.message : String(error),
        }),
      },
      {
        status: statusCode,
        headers: {
          "X-Request-ID": requestId,
          "X-Processing-Time-Ms": processingTime.toString(),
        },
      },
    );
  }
}

// === HANDLE OTHER HTTP METHODS ===
export async function GET() {
  apiLog("GET request received (not supported)");
  return NextResponse.json(
    {
      error: "Method not allowed",
      message: "This endpoint only supports POST requests",
      usage: {
        method: "POST",
        contentType: "application/json",
        body: {
          text: "Arabic text to convert to speech",
          voice_id: "ElevenLabs voice ID for Saudi Arabic",
        },
      },
    },
    {
      status: 405,
      headers: {
        Allow: "POST",
      },
    },
  );
}

export async function PUT() {
  return GET(); // Same response as GET
}

export async function DELETE() {
  return GET(); // Same response as GET
}

export async function PATCH() {
  return GET(); // Same response as GET
}
