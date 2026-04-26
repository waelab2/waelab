import { auth } from "@clerk/nextjs/server";
import { ConvexHttpClient } from "convex/browser";
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { z } from "zod";
import { api as convexApi } from "../../../../../convex/_generated/api";
import type { Id } from "../../../../../convex/_generated/dataModel";
import { env } from "~/env";
import {
  TAVUS_VIDEO_ESTIMATED_CREDITS,
  TAVUS_VIDEO_MODEL_ID,
} from "~/lib/constants/tavus";
import type { TavusCreateVideoPayload } from "~/lib/tavusApi";
import {
  tavusCreateVideo,
  tavusGetReplica,
  tavusGetVideo,
} from "~/lib/tavusApi";

const MAX_SCRIPT_CHARS = 12_000;

const advancedSchema = z
  .object({
    videoName: z.string().max(200).optional(),
    callbackUrl: z.string().url().optional(),
    fast: z.boolean().optional(),
    transparentBackground: z.boolean().optional(),
    watermarkImageUrl: z.string().url().optional(),
    backgroundUrl: z.string().url().optional(),
    backgroundSourceUrl: z.string().url().optional(),
    startWithWave: z.boolean().optional(),
    backgroundScroll: z.boolean().optional(),
    backgroundScrollType: z.enum(["human", "smooth"]).optional(),
    backgroundScrollDepth: z.enum(["middle", "bottom"]).optional(),
    backgroundScrollReturn: z.enum(["return", "halt"]).optional(),
  })
  .optional();

const postBodySchema = z
  .object({
    language: z.enum(["en", "ar"]),
    /** Stock (system) replica from Tavus — see GET /api/tavus/replicas */
    replicaId: z.string().min(1).max(64),
    inputMode: z.enum(["script", "audio"]),
    script: z.string().max(MAX_SCRIPT_CHARS).optional(),
    audioUrl: z.string().url().optional(),
    advanced: advancedSchema,
  })
  .superRefine((data, ctx) => {
    if (data.inputMode === "script") {
      const t = data.script?.trim() ?? "";
      if (!t) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Script is required when inputMode is script",
          path: ["script"],
        });
      }
    } else {
      const u = data.audioUrl?.trim() ?? "";
      if (!u) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "audioUrl is required when inputMode is audio",
          path: ["audioUrl"],
        });
      }
    }
    const a = data.advanced;
    if (a?.transparentBackground === true && a.fast !== true) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "transparent_background requires fast: true",
        path: ["advanced", "fast"],
      });
    }
    if (
      a?.fast === true &&
      (Boolean(a.backgroundUrl?.trim()) ||
        Boolean(a.backgroundSourceUrl?.trim()))
    ) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message:
          "Tavus fast mode does not support website or video backgrounds; turn off Fast or clear background URLs (see Create Video API).",
        path: ["advanced", "fast"],
      });
    }
  });

const convexClient = new ConvexHttpClient(env.NEXT_PUBLIC_CONVEX_URL);

function newRequestId() {
  return `tavus_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;
}

function mapCreditError(message: string, requestId: string) {
  if (
    message.includes("Insufficient credits") ||
    message.includes("Active subscription required")
  ) {
    return NextResponse.json({ error: message, requestId }, { status: 402 });
  }
  return NextResponse.json({ error: message, requestId }, { status: 500 });
}

export async function POST(request: NextRequest) {
  const requestId = newRequestId();
  let reservationId: string | null = null;
  let userId: string | null = null;

  const authResult = await auth();
  userId = authResult.userId;
  if (!userId) {
    return NextResponse.json(
      { error: "Unauthorized", requestId },
      { status: 401 },
    );
  }

  let json: unknown;
  try {
    json = (await request.json()) as unknown;
  } catch {
    return NextResponse.json(
      { error: "Invalid JSON body", requestId },
      { status: 400 },
    );
  }

  const parsed = postBodySchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json(
      {
        error: "Invalid request",
        details: parsed.error.flatten().fieldErrors,
        requestId,
      },
      { status: 400 },
    );
  }

  const replicaCheck = await tavusGetReplica({
    apiKey: env.TAVUS_API_KEY,
    replicaId: parsed.data.replicaId.trim(),
    verbose: true,
  });

  if (!replicaCheck.ok) {
    return NextResponse.json(
      {
        error:
          replicaCheck.status === 404
            ? "Replica not found"
            : replicaCheck.message,
        requestId,
      },
      {
        status:
          replicaCheck.status === 404
            ? 400
            : replicaCheck.status >= 400 && replicaCheck.status < 600
              ? replicaCheck.status
              : 502,
      },
    );
  }

  if (replicaCheck.data.replica_type !== "system") {
    return NextResponse.json(
      {
        error: "Only stock (system) replicas can be used from this app.",
        requestId,
      },
      { status: 400 },
    );
  }

  if (replicaCheck.data.status !== "completed") {
    return NextResponse.json(
      {
        error: "Replica is not ready (training not completed).",
        requestId,
      },
      { status: 400 },
    );
  }

  const replicaId = replicaCheck.data.replica_id;

  const callbackUrl = parsed.data.advanced?.callbackUrl?.trim()
    ? parsed.data.advanced.callbackUrl.trim()
    : undefined;

  const adv = parsed.data.advanced;
  const properties: TavusCreateVideoPayload["properties"] =
    adv === undefined
      ? undefined
      : {
          ...(adv.backgroundScroll !== undefined
            ? { background_scroll: adv.backgroundScroll }
            : {}),
          ...(adv.backgroundScrollType !== undefined
            ? { background_scroll_type: adv.backgroundScrollType }
            : {}),
          ...(adv.backgroundScrollDepth !== undefined
            ? { background_scroll_depth: adv.backgroundScrollDepth }
            : {}),
          ...(adv.backgroundScrollReturn !== undefined
            ? { background_scroll_return: adv.backgroundScrollReturn }
            : {}),
          ...(adv.startWithWave !== undefined
            ? { start_with_wave: adv.startWithWave }
            : {}),
        };
  const hasProps = properties && Object.keys(properties).length > 0;

  const payload: TavusCreateVideoPayload = {
    replica_id: replicaId,
    ...(parsed.data.inputMode === "script"
      ? { script: parsed.data.script!.trim() }
      : { audio_url: parsed.data.audioUrl!.trim() }),
    ...(adv?.videoName?.trim()
      ? { video_name: adv.videoName.trim() }
      : { video_name: `Dashboard ${parsed.data.language} — ${requestId}` }),
    ...(callbackUrl ? { callback_url: callbackUrl } : {}),
    ...(adv?.fast === true ? { fast: true } : {}),
    ...(adv?.transparentBackground === true
      ? { transparent_background: true }
      : {}),
    ...(adv?.watermarkImageUrl?.trim()
      ? { watermark_image_url: adv.watermarkImageUrl.trim() }
      : {}),
    ...(adv?.backgroundUrl?.trim()
      ? { background_url: adv.backgroundUrl.trim() }
      : {}),
    ...(adv?.backgroundSourceUrl?.trim()
      ? { background_source_url: adv.backgroundSourceUrl.trim() }
      : {}),
    ...(hasProps ? { properties } : {}),
  };

  reservationId = `tavus_${userId}_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;

  try {
    await convexClient.mutation(convexApi.credits.reserveCreditsForGeneration, {
      userId,
      service: "tavus",
      modelId: TAVUS_VIDEO_MODEL_ID,
      estimatedCredits: TAVUS_VIDEO_ESTIMATED_CREDITS,
      reservationId,
    });
  } catch (reserveError) {
    const message =
      reserveError instanceof Error
        ? reserveError.message
        : "Unable to process credits";
    return mapCreditError(message, requestId);
  }

  const result = await tavusCreateVideo({
    apiKey: env.TAVUS_API_KEY,
    payload,
  });

  if (!result.ok) {
    try {
      await convexClient.mutation(convexApi.credits.finalizeCreditReservation, {
        userId,
        reservationId,
        success: false,
      });
    } catch {
      /* best effort release */
    }
    return NextResponse.json(
      {
        error: result.message,
        requestId,
      },
      {
        status:
          result.status >= 400 && result.status < 600 ? result.status : 502,
      },
    );
  }

  const videoId = result.data.video_id;

  try {
    await convexClient.mutation(
      convexApi.credits.attachExternalRequestIdToReservation,
      {
        reservationId,
        externalRequestId: videoId,
      },
    );
  } catch {
    /* non-fatal */
  }

  let generationRequestId: Id<"generation_requests"> | undefined;
  try {
    generationRequestId = await convexClient.mutation(
      convexApi.generationRequests.createGenerationRequest,
      {
        service: "tavus",
        model_id: TAVUS_VIDEO_MODEL_ID,
        user_id: userId,
        request_id: videoId,
      },
    );
  } catch {
    /* analytics non-fatal */
  }

  try {
    await convexClient.mutation(convexApi.tavusVideoJobs.createJob, {
      userId,
      videoId,
      reservationId,
      language: parsed.data.language,
      inputKind: parsed.data.inputMode,
      generationRequestId,
    });
  } catch {
    /* job row is for webhook/finalize; log in production */
  }

  return NextResponse.json({
    requestId,
    videoId,
    status: result.data.status,
    reservationId,
  });
}

export async function GET(request: NextRequest) {
  const requestId = newRequestId();

  const authResult = await auth();
  if (!authResult.userId) {
    return NextResponse.json(
      { error: "Unauthorized", requestId },
      { status: 401 },
    );
  }

  const videoId = request.nextUrl.searchParams.get("videoId")?.trim();
  if (!videoId) {
    return NextResponse.json(
      { error: "Missing videoId query parameter", requestId },
      { status: 400 },
    );
  }

  const result = await tavusGetVideo({
    apiKey: env.TAVUS_API_KEY,
    videoId,
    verbose: false,
  });

  if (!result.ok) {
    return NextResponse.json(
      {
        error: result.message,
        requestId,
      },
      {
        status:
          result.status >= 400 && result.status < 600 ? result.status : 502,
      },
    );
  }

  const d = result.data;
  return NextResponse.json({
    requestId,
    videoId: d.video_id,
    status: d.status,
    videoName: d.video_name,
    hostedUrl: d.hosted_url ?? undefined,
    downloadUrl: d.download_url ?? undefined,
    streamUrl: d.stream_url ?? undefined,
    statusDetails: d.status_details,
  });
}
