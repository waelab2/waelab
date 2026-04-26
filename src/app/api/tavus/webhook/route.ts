import { ConvexHttpClient } from "convex/browser";
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { api as convexApi } from "../../../../../convex/_generated/api";
import { env } from "~/env";
import { TAVUS_VIDEO_ESTIMATED_CREDITS } from "~/lib/constants/tavus";
import { parseTavusVideoWebhookPayload } from "~/lib/tavusApi";

const convexClient = new ConvexHttpClient(env.NEXT_PUBLIC_CONVEX_URL);

export async function POST(request: NextRequest) {
  const token = request.nextUrl.searchParams.get("token");
  const secret = env.TAVUS_WEBHOOK_SECRET;
  if (!secret?.trim() || token !== secret) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  let body: unknown;
  try {
    body = (await request.json()) as unknown;
  } catch {
    return new NextResponse("Bad Request", { status: 400 });
  }

  const parsed = parseTavusVideoWebhookPayload(body);
  if (!parsed) {
    return new NextResponse("Invalid payload", { status: 400 });
  }

  const job = await convexClient.query(convexApi.tavusVideoJobs.getJobForWebhook, {
    videoId: parsed.video_id,
    serverKey: secret,
  });

  if (!job) {
    // Job row may not exist yet (race) or unknown video — ack to avoid retry storms
    return new NextResponse("OK", { status: 200 });
  }

  if (job.credits_finalized) {
    return new NextResponse("OK", { status: 200 });
  }

  // Tavus video callbacks include terminal `ready` / `error` (and may use
  // `deleted`). Do not finalize credits on `queued` / `generating` — that
  // would incorrectly release the reservation.
  const st = parsed.status.trim().toLowerCase();
  if (st !== "ready" && st !== "error" && st !== "deleted") {
    return new NextResponse("OK", { status: 200 });
  }

  const success = st === "ready";

  try {
    await convexClient.mutation(convexApi.credits.finalizeCreditReservation, {
      userId: job.user_id,
      reservationId: job.reservation_id,
      success,
      actualCredits: success ? TAVUS_VIDEO_ESTIMATED_CREDITS : undefined,
    });
  } catch {
    return new NextResponse("Finalize failed", { status: 500 });
  }

  try {
    await convexClient.mutation(convexApi.tavusVideoJobs.markCreditsFinalized, {
      videoId: parsed.video_id,
    });
  } catch {
    /* non-fatal */
  }

  return new NextResponse("OK", { status: 200 });
}
