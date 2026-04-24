import { auth } from "@clerk/nextjs/server";
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { z } from "zod";
import { env } from "~/env";
import { tavusCreateVideo, tavusGetVideo } from "~/lib/tavusApi";

const MAX_SCRIPT_CHARS = 12_000;

const postBodySchema = z.object({
  script: z.string().max(MAX_SCRIPT_CHARS),
  language: z.enum(["en", "ar"]),
});

function newRequestId() {
  return `tavus_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;
}

export async function POST(request: NextRequest) {
  const requestId = newRequestId();

  const authResult = await auth();
  if (!authResult.userId) {
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
    const message = parsed.error.flatten().fieldErrors;
    return NextResponse.json(
      { error: "Invalid request", details: message, requestId },
      { status: 400 },
    );
  }

  const script = parsed.data.script.trim();
  if (!script) {
    return NextResponse.json(
      { error: "Script cannot be empty", requestId },
      { status: 400 },
    );
  }

  const replicaId =
    parsed.data.language === "en"
      ? env.TAVUS_REPLICA_ID_EN
      : env.TAVUS_REPLICA_ID_AR;

  const result = await tavusCreateVideo({
    apiKey: env.TAVUS_API_KEY,
    replicaId,
    script,
    videoName: `Dashboard ${parsed.data.language} — ${requestId}`,
  });

  if (!result.ok) {
    return NextResponse.json(
      {
        error: result.message,
        requestId,
      },
      { status: result.status >= 400 && result.status < 600 ? result.status : 502 },
    );
  }

  return NextResponse.json({
    requestId,
    videoId: result.data.video_id,
    status: result.data.status,
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
      { status: result.status >= 400 && result.status < 600 ? result.status : 502 },
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
