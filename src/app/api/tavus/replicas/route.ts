import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { env } from "~/env";
import { tavusListAllReplicasByType } from "~/lib/tavusApi";

function newRequestId() {
  return `tavus_replicas_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;
}

/**
 * Returns Tavus **stock** (system) replicas for the video generation UI.
 * See: https://docs.tavus.io/api-reference/phoenix-replica-model/get-replicas
 */
export async function GET() {
  const requestId = newRequestId();
  const authResult = await auth();
  if (!authResult.userId) {
    return NextResponse.json({ error: "Unauthorized", requestId }, { status: 401 });
  }

  const result = await tavusListAllReplicasByType({
    apiKey: env.TAVUS_API_KEY,
    replicaType: "system",
  });

  if (!result.ok) {
    return NextResponse.json(
      { error: result.message, requestId },
      {
        status:
          result.status >= 400 && result.status < 600 ? result.status : 502,
      },
    );
  }

  const replicas = result.data
    .filter((r) => (r.status ?? "completed") === "completed")
    .map((r) => ({
      replicaId: r.replica_id,
      name: r.replica_name,
      ...(r.thumbnail_video_url
        ? { thumbnailUrl: r.thumbnail_video_url }
        : {}),
      ...(r.model_name ? { modelName: r.model_name } : {}),
    }));

  return NextResponse.json({ requestId, replicas });
}
