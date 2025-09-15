import { NextRequest, NextResponse } from "next/server";
import { runwayClient } from "~/lib/runwayClient";
import type { RunwayGen4TurboInput } from "~/lib/types";

// === DEBUG CONFIGURATION ===
const DEBUG_RUNWAY_API = true;

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

export async function POST(request: NextRequest) {
  const requestId = `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

  debugLog("API request received", {
    requestId: requestId,
    method: "POST",
    url: request.url,
    timestamp: new Date().toISOString(),
  });

  try {
    // Parse request body
    const body = await request.json();
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
    const promptImage = body.promptImage as string;
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
      ratio: body.ratio,
      duration: body.duration,
    };

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

    return NextResponse.json({
      success: true,
      data: result.data,
      requestId: requestId,
    });
  } catch (error) {
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
