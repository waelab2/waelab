import { auth } from "@clerk/nextjs/server";
import { ConvexHttpClient } from "convex/browser";
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { api as convexApi } from "../../../../../convex/_generated/api";
import { env } from "~/env";
import { calculateCreditsForDurationSeconds } from "~/lib/constants/credits";
import { createElevenLabsClient } from "~/lib/elevenLabsClient";

// === DEBUG CONFIGURATION ===
const DEBUG_API = true; // Set to false to disable debug logs
const ELEVENLABS_MODEL_ID = "elevenlabs/eleven_multilingual_v2";
const ELEVENLABS_CHARS_PER_SECOND_FLOOR = 12;
const convexClient = new ConvexHttpClient(env.NEXT_PUBLIC_CONVEX_URL);

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

function mapCreditError(error: unknown): NextResponse {
  const message =
    error instanceof Error ? error.message : "Unable to process credits";

  if (
    message.includes("Insufficient credits") ||
    message.includes("Active subscription required")
  ) {
    return NextResponse.json(
      {
        error: message,
      },
      { status: 402 },
    );
  }

  return NextResponse.json(
    {
      error: message,
    },
    { status: 500 },
  );
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
  let reservationId: string | null = null;
  let userId: string | null = null;

  apiLog("Incoming TTS request", {
    requestId,
    method: request.method,
    url: request.url,
    timestamp: new Date().toISOString(),
    userAgent: request.headers.get("user-agent")?.substring(0, 50),
  });

  try {
    const authResult = await auth();
    userId = authResult.userId;

    if (!userId) {
      return NextResponse.json(
        {
          error: "Unauthorized",
          requestId,
        },
        { status: 401 },
      );
    }

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

    const estimatedDurationSeconds = Math.max(
      1,
      Math.ceil(text.length / ELEVENLABS_CHARS_PER_SECOND_FLOOR),
    );
    const estimatedCredits = calculateCreditsForDurationSeconds(
      ELEVENLABS_MODEL_ID,
      estimatedDurationSeconds,
    );
    reservationId = `eleven_${userId}_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;

    try {
      await convexClient.mutation(convexApi.credits.reserveCreditsForGeneration, {
        userId,
        service: "elevenlabs",
        modelId: ELEVENLABS_MODEL_ID,
        estimatedCredits,
        reservationId,
      });
    } catch (reserveError) {
      return mapCreditError(reserveError);
    }

    apiLog("Request validation passed", {
      requestId,
      textLength: text.length,
      voiceId: voice_id,
      textPreview: text.substring(0, 100) + (text.length > 100 ? "..." : ""),
    });

    // Create ElevenLabs client using factory function (respects mock settings)
    apiLog("Creating ElevenLabs client using factory", { requestId });
    const client = createElevenLabsClient();

    // Make the TTS request using the client interface
    apiLog("Calling ElevenLabs TTS API", {
      requestId,
      voiceId: voice_id,
      modelId: "eleven_multilingual_v2",
      outputFormat: "mp3_44100_128",
      textLength: text.length,
    });

    const result = await client.generate({
      input: {
        text: text,
        voice_id: voice_id,
      },
      onProgress: (progress) => {
        apiLog("Generation progress", { requestId, status: progress.status });
      },
    });

    apiLog("Generation completed, processing result", { requestId });

    // The client interface returns a structured result with audio URL
    const { audio, metadata } = result.data;
    const actualDurationSeconds = Math.max(
      1,
      (audio.duration_ms ?? estimatedDurationSeconds * 1000) / 1000,
    );
    const actualCredits = calculateCreditsForDurationSeconds(
      ELEVENLABS_MODEL_ID,
      actualDurationSeconds,
    );
    let creditsUsed = actualCredits;
    try {
      const finalizeResult = await convexClient.mutation(
        convexApi.credits.finalizeCreditReservation,
        {
          userId,
          reservationId,
          success: true,
          actualCredits,
        },
      );
      creditsUsed = finalizeResult?.captured_credits ?? actualCredits;
    } catch (finalizeError) {
      apiError("Failed to finalize reservation after success", {
        requestId,
        finalizeError,
      });
    }

    const processingTime = Date.now() - startTime;

    apiLog("TTS request completed successfully", {
      requestId,
      processingTimeMs: processingTime,
      audioSizeBytes: audio.file_size,
      contentType: audio.content_type,
      audioUrl: audio.url.substring(0, 50) + "...",
      textLength: text.length,
      charactersPerSecond: Math.round((text.length / processingTime) * 1000),
      metadata: metadata,
      creditsUsed,
    });

    // Return the structured result instead of raw audio buffer
    return NextResponse.json(
      {
        success: true,
        data: {
          audio: {
            url: audio.url,
            file_size: audio.file_size,
            file_name: audio.file_name,
            content_type: audio.content_type,
            duration_ms: audio.duration_ms,
          },
          metadata: {
            ...metadata,
            credits_used: creditsUsed,
          },
        },
        requestId,
        processingTimeMs: processingTime,
      },
      {
        status: 200,
        headers: {
          "Content-Type": "application/json",
          "X-Request-ID": requestId,
          "X-Processing-Time-Ms": processingTime.toString(),
          "X-Audio-Size-Bytes": audio.file_size.toString(),
          "Cache-Control": "no-store",
        },
      },
    );
  } catch (error) {
    const processingTime = Date.now() - startTime;

    if (userId && reservationId) {
      try {
        await convexClient.mutation(convexApi.credits.finalizeCreditReservation, {
          userId,
          reservationId,
          success: false,
        });
      } catch (finalizeError) {
        apiError("Failed to release reservation after error", {
          requestId,
          finalizeError,
        });
      }
    }

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
