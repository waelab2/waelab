import { auth } from "@clerk/nextjs/server";
import { ConvexHttpClient } from "convex/browser";
import type { NextRequest } from "next/server";
import { z } from "zod";
import { api as convexApi } from "../../../../../../convex/_generated/api";
import { env } from "~/env";
import { calculateCreditsForDurationSeconds } from "~/lib/constants/credits";
import { createRunwayClient } from "~/lib/runwayClient";
import type { RunwayGen4TurboInput, RunwayGen4TurboStatus } from "~/lib/types";

// === DEBUG CONFIGURATION ===
const DEBUG_API = true; // Set to false to disable API debug logs
const RUNWAY_MODEL_ID = "runway/gen4_turbo";
const convexClient = new ConvexHttpClient(env.NEXT_PUBLIC_CONVEX_URL);

function debugLog(message: string, data?: unknown) {
  if (DEBUG_API) {
    console.log(`🎬🌐 [Runway API Stream] ${message}`, data ?? "");
  }
}

function debugError(message: string, error?: unknown) {
  if (DEBUG_API) {
    console.error(`🎬🌐❌ [Runway API Stream Error] ${message}`, error ?? "");
  }
}

function mapCreditError(error: unknown): Response {
  const message =
    error instanceof Error ? error.message : "Unable to process credits";

  if (
    message.includes("Insufficient credits") ||
    message.includes("Active subscription required")
  ) {
    return new Response(
      JSON.stringify({ error: message }),
      {
        status: 402,
        headers: { "Content-Type": "application/json" },
      },
    );
  }

  return new Response(
    JSON.stringify({ error: message }),
    {
      status: 500,
      headers: { "Content-Type": "application/json" },
    },
  );
}

// Input validation schema
const runwayInputSchema = z.object({
  promptImage: z.string().min(1, "Prompt image is required"),
  promptText: z.string().max(1000).optional(),
  ratio: z.enum(["16:9", "9:16", "1:1"], {
    errorMap: () => ({ message: "Invalid aspect ratio" }),
  }),
  duration: z.number().refine((val) => [5, 10].includes(val), {
    message: "Invalid duration, must be 5 or 10 seconds",
  }),
});

export async function POST(request: NextRequest) {
  const requestId = `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

  debugLog("Stream API request received", {
    requestId: requestId,
    method: request.method,
    url: request.url,
    timestamp: new Date().toISOString(),
  });

  try {
    const { userId } = await auth();
    if (!userId) {
      return new Response(
        JSON.stringify({ error: "Unauthorized", requestId }),
        {
          status: 401,
          headers: { "Content-Type": "application/json" },
        },
      );
    }

    const body = (await request.json()) as z.infer<typeof runwayInputSchema>;

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

    // Validate input
    const validationResult = runwayInputSchema.safeParse(body);
    if (!validationResult.success) {
      const error = validationResult.error.errors
        .map((e) => e.message)
        .join(", ");
      debugError("Validation failed", { requestId: requestId, error: error });
      return new Response(
        JSON.stringify({ error: error, requestId: requestId }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        },
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
      return new Response(
        JSON.stringify({ error: error, requestId: requestId }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        },
      );
    }

    const estimatedCredits = calculateCreditsForDurationSeconds(
      RUNWAY_MODEL_ID,
      body.duration,
    );
    const reservationId = `runway_${userId}_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;

    try {
      await convexClient.mutation(convexApi.credits.reserveCreditsForGeneration, {
        userId,
        service: "runway",
        modelId: RUNWAY_MODEL_ID,
        estimatedCredits,
        reservationId,
      });
    } catch (reserveError) {
      return mapCreditError(reserveError);
    }

    // Create a ReadableStream for Server-Sent Events
    const stream = new ReadableStream({
      async start(controller) {
        const encoder = new TextEncoder();

        // Helper function to send SSE data
        const sendSSE = (data: unknown) => {
          const sseData = `data: ${JSON.stringify(data)}\n\n`;
          controller.enqueue(encoder.encode(sseData));
        };

        try {
          debugLog("Starting streamed generation", {
            requestId: requestId,
            input: {
              promptImageLength: body.promptImage.length,
              promptText: body.promptText,
              ratio: body.ratio,
              duration: body.duration,
            },
          });

          const runwayClient = createRunwayClient();

          // Send initial status
          sendSSE({
            type: "status",
            status: "PREPARING",
            requestId: requestId,
          });

          const result = await runwayClient.generate({
            input: body as RunwayGen4TurboInput,
            onProgress: (progress: { status: RunwayGen4TurboStatus }) => {
              debugLog("Generation progress", {
                requestId: requestId,
                status: progress.status,
              });

              sendSSE({
                type: "status",
                status: progress.status,
                requestId: requestId,
              });
            },
          });

          debugLog("Generation completed, sending result", {
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
              requestId: requestId,
              finalizeError,
            });
          }

          // Send final result
          sendSSE({
            type: "result",
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

          // Close the stream
          controller.close();
        } catch (error) {
          try {
            await convexClient.mutation(convexApi.credits.finalizeCreditReservation, {
              userId,
              reservationId,
              success: false,
            });
          } catch (finalizeError) {
            debugError("Failed to release reservation after stream error", {
              requestId: requestId,
              finalizeError,
            });
          }

          debugError("Stream generation failed", {
            requestId: requestId,
            error: error instanceof Error ? error.message : String(error),
            errorStack: error instanceof Error ? error.stack : undefined,
          });

          // Send error
          sendSSE({
            type: "error",
            error: error instanceof Error ? error.message : String(error),
            requestId: requestId,
          });

          controller.close();
        }
      },
    });

    return new Response(stream, {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        Connection: "keep-alive",
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "POST",
        "Access-Control-Allow-Headers": "Content-Type",
      },
    });
  } catch (error) {
    debugError("Stream API request failed", {
      requestId: requestId,
      error: error instanceof Error ? error.message : String(error),
      errorStack: error instanceof Error ? error.stack : undefined,
    });

    return new Response(
      JSON.stringify({
        error: "Internal server error",
        requestId: requestId,
        details: error instanceof Error ? error.message : String(error),
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      },
    );
  }
}

export async function GET() {
  return new Response(
    JSON.stringify({
      error: "Method not allowed. Use POST to generate videos.",
    }),
    {
      status: 405,
      headers: { "Content-Type": "application/json" },
    },
  );
}
