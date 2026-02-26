import { auth } from "@clerk/nextjs/server";
import { ConvexHttpClient } from "convex/browser";
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { api as convexApi } from "../../../../../convex/_generated/api";
import { env } from "~/env";
import { calculateCreditsForDurationSeconds } from "~/lib/constants/credits";
import { runwayClient } from "~/lib/runwayClient";
import type { RunwayGen4TurboInput } from "~/lib/types";

// Request body type for Runway Gen4 Turbo API
interface RunwayGen4TurboRequestBody {
  promptImage?: string;
  promptText?: string;
  ratio?: string;
  duration?: number;
}

// === DEBUG CONFIGURATION ===
const DEBUG_RUNWAY_API = true;
const RUNWAY_MODEL_ID = "runway/gen4_turbo";
const convexClient = new ConvexHttpClient(env.NEXT_PUBLIC_CONVEX_URL);

function debugLog(message: string, data?: unknown) {
  if (DEBUG_RUNWAY_API) {
    console.log(`🎬🌐 [Runway API] ${message}`, data ?? "");
  }
}

function debugError(message: string, error?: unknown) {
  if (DEBUG_RUNWAY_API) {
    console.error(`🎬🌐❌ [Runway API Error] ${message}`, error ?? "");
  }
}

function mapCreditError(message: string, requestId: string) {
  if (
    message.includes("Insufficient credits") ||
    message.includes("Active subscription required")
  ) {
    return NextResponse.json(
      { error: message, requestId },
      { status: 402 },
    );
  }

  return NextResponse.json(
    { error: message, requestId },
    { status: 500 },
  );
}

export async function POST(request: NextRequest) {
  const requestId = `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  let reservationId: string | null = null;
  let userId: string | null = null;

  debugLog("API request received", {
    requestId: requestId,
    method: "POST",
    url: request.url,
    timestamp: new Date().toISOString(),
  });

  try {
    const authResult = await auth();
    userId = authResult.userId;
    if (!userId) {
      return NextResponse.json(
        { error: "Unauthorized", requestId },
        { status: 401 },
      );
    }

    // Parse request body
    const body = (await request.json()) as RunwayGen4TurboRequestBody;
    debugLog("Request body parsed", {
      requestId: requestId,
      bodyKeys: Object.keys(body),
      promptImageLength: body.promptImage?.length,
      promptText:
        body.promptText?.substring(0, 100) +
        (body.promptText && body.promptText.length > 100 ? "..." : ""),
      ratio: body.ratio,
      duration: body.duration,
    });

    // Validate required fields
    if (!body.promptImage) {
      const error = "promptImage is required";
      debugError("Validation failed", { requestId: requestId, error: error });
      return NextResponse.json(
        { error: error, requestId: requestId },
        { status: 400 },
      );
    }

    if (!body.ratio || !["16:9", "9:16", "1:1"].includes(body.ratio)) {
      const error = "Invalid ratio. Must be 16:9, 9:16, or 1:1";
      debugError("Validation failed", { requestId: requestId, error: error });
      return NextResponse.json(
        { error: error, requestId: requestId },
        { status: 400 },
      );
    }

    if (!body.duration || ![5, 10].includes(body.duration)) {
      const error = "Invalid duration. Must be 5 or 10 seconds";
      debugError("Validation failed", { requestId: requestId, error: error });
      return NextResponse.json(
        { error: error, requestId: requestId },
        { status: 400 },
      );
    }

    // Validate image format
    const promptImage = body.promptImage;
    if (
      !promptImage.startsWith("data:image/") &&
      !promptImage.startsWith("http")
    ) {
      const error = "promptImage must be a data URL or HTTP URL";
      debugError("Validation failed", { requestId: requestId, error: error });
      return NextResponse.json(
        { error: error, requestId: requestId },
        { status: 400 },
      );
    }

    // Prepare input
    const input: RunwayGen4TurboInput = {
      promptImage: promptImage,
      promptText: body.promptText,
      ratio: body.ratio as "16:9" | "9:16" | "1:1",
      duration: body.duration as 5 | 10,
    };

    const estimatedCredits = calculateCreditsForDurationSeconds(
      RUNWAY_MODEL_ID,
      input.duration,
    );
    reservationId = `runway_${userId}_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;

    try {
      await convexClient.mutation(convexApi.credits.reserveCreditsForGeneration, {
        userId,
        service: "runway",
        modelId: RUNWAY_MODEL_ID,
        estimatedCredits,
        reservationId,
      });
    } catch (reserveError) {
      const message =
        reserveError instanceof Error
          ? reserveError.message
          : "Unable to process credits";
      return mapCreditError(message, requestId);
    }

    debugLog("Starting generation", {
      requestId: requestId,
      input: {
        promptImageLength: input.promptImage.length,
        promptText: input.promptText,
        ratio: input.ratio,
        duration: input.duration,
      },
    });

    // Generate video
    const result = await runwayClient.generate({
      input: input,
      onProgress: (progress) => {
        debugLog("Generation progress", {
          requestId: requestId,
          status: progress.status,
        });
      },
    });

    debugLog("Generation completed successfully", {
      requestId: requestId,
      videoUrl: result.data.video.url.substring(0, 50) + "...",
      fileSize: result.data.video.file_size,
      metadata: result.data.metadata,
    });

    const actualCredits = calculateCreditsForDurationSeconds(
      RUNWAY_MODEL_ID,
      result.data.video.duration_ms / 1000,
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
      debugError("Failed to finalize reservation after success", {
        requestId,
        finalizeError,
      });
    }

    return NextResponse.json({
      success: true,
      data: {
        ...result.data,
        metadata: {
          ...(result.data.metadata ?? {
            model_id: RUNWAY_MODEL_ID,
            generation_id: requestId,
            generation_time_ms: 0,
          }),
          credits_used: creditsUsed,
        },
      },
      requestId: requestId,
    });
  } catch (error) {
    if (userId && reservationId) {
      try {
        await convexClient.mutation(convexApi.credits.finalizeCreditReservation, {
          userId,
          reservationId,
          success: false,
        });
      } catch (finalizeError) {
        debugError("Failed to release reservation after API error", {
          requestId,
          finalizeError,
        });
      }
    }

    debugError("API request failed", {
      requestId: requestId,
      error: error instanceof Error ? error.message : String(error),
      errorStack: error instanceof Error ? error.stack : undefined,
    });

    // Handle specific error types
    if (error instanceof Error) {
      if (error.message.includes("API key")) {
        return NextResponse.json(
          {
            error: "Runway API key is not configured or invalid",
            requestId: requestId,
          },
          { status: 500 },
        );
      }

      if (error.message.includes("timeout")) {
        return NextResponse.json(
          {
            error: "Generation timeout - please try again",
            requestId: requestId,
          },
          { status: 408 },
        );
      }

      if (error.message.includes("rate limit")) {
        return NextResponse.json(
          {
            error: "Rate limit exceeded - please try again later",
            requestId: requestId,
          },
          { status: 429 },
        );
      }
    }

    return NextResponse.json(
      {
        error: "Internal server error",
        requestId: requestId,
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 },
    );
  }
}

// Handle unsupported methods
export async function GET() {
  return NextResponse.json(
    { error: "Method not allowed. Use POST to generate videos." },
    { status: 405 },
  );
}

export async function PUT() {
  return NextResponse.json(
    { error: "Method not allowed. Use POST to generate videos." },
    { status: 405 },
  );
}

export async function DELETE() {
  return NextResponse.json(
    { error: "Method not allowed. Use POST to generate videos." },
    { status: 405 },
  );
}
