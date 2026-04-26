import { auth } from "@clerk/nextjs/server";
import { ConvexHttpClient } from "convex/browser";
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { z } from "zod";
import { api as convexApi } from "../../../../../../convex/_generated/api";
import { env } from "~/env";
import { TAVUS_VIDEO_ESTIMATED_CREDITS } from "~/lib/constants/tavus";
import { tavusGetVideo } from "~/lib/tavusApi";
import type { TavusVideoStatus } from "~/lib/tavusApi";

const convexClient = new ConvexHttpClient(env.NEXT_PUBLIC_CONVEX_URL);

const bodySchema = z.object({
  videoId: z.string().min(1),
});

function isTerminal(s: TavusVideoStatus): boolean {
  return s === "ready" || s === "error" || s === "deleted";
}

export async function POST(request: NextRequest) {
  const requestId = `tavus_fin_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;

  const authResult = await auth();
  const userId = authResult.userId;
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized", requestId }, { status: 401 });
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

  const parsed = bodySchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid request", requestId },
      { status: 400 },
    );
  }

  const videoId = parsed.data.videoId.trim();

  const job = await convexClient.query(convexApi.tavusVideoJobs.getJobForUser, {
    userId,
    videoId,
  });

  if (!job) {
    return NextResponse.json(
      { error: "Job not found for this video", requestId },
      { status: 404 },
    );
  }

  if (job.credits_finalized) {
    return NextResponse.json({ ok: true, duplicate: true, requestId });
  }

  const tavus = await tavusGetVideo({
    apiKey: env.TAVUS_API_KEY,
    videoId,
    verbose: false,
  });

  if (!tavus.ok) {
    return NextResponse.json(
      { error: tavus.message, requestId },
      {
        status:
          tavus.status >= 400 && tavus.status < 600 ? tavus.status : 502,
      },
    );
  }

  const status = tavus.data.status;
  if (!isTerminal(status)) {
    return NextResponse.json(
      {
        error: "Video is not in a terminal state yet",
        status,
        requestId,
      },
      { status: 409 },
    );
  }

  const success = status === "ready";

  try {
    await convexClient.mutation(convexApi.credits.finalizeCreditReservation, {
      userId,
      reservationId: job.reservation_id,
      success,
      actualCredits: success ? TAVUS_VIDEO_ESTIMATED_CREDITS : undefined,
    });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Finalize failed";
    return NextResponse.json({ error: message, requestId }, { status: 500 });
  }

  try {
    await convexClient.mutation(convexApi.tavusVideoJobs.markCreditsFinalized, {
      videoId,
    });
  } catch {
    /* non-fatal */
  }

  return NextResponse.json({ ok: true, success, status, requestId });
}
