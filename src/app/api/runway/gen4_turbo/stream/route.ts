import { NextRequest } from "next/server";
import { z } from "zod";
import { createRunwayClient } from "~/lib/runwayClient";
import type { RunwayGen4TurboStatus } from "~/lib/types";

// === DEBUG CONFIGURATION ===
const DEBUG_API = true; // Set to false to disable API debug logs

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
    const promptImage = body.promptImage as string;
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

    // Create a ReadableStream for Server-Sent Events
    const stream = new ReadableStream({
      async start(controller) {
        const encoder = new TextEncoder();

        // Helper function to send SSE data
        const sendSSE = (data: any) => {
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
            input: body,
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

          // Send final result
          sendSSE({
            type: "result",
            data: result.data,
            requestId: requestId,
          });

          // Close the stream
          controller.close();
        } catch (error) {
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
