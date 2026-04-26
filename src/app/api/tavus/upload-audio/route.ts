import { auth } from "@clerk/nextjs/server";
import { ConvexHttpClient } from "convex/browser";
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { api as convexApi } from "../../../../../convex/_generated/api";
import type { Id } from "../../../../../convex/_generated/dataModel";
import { env } from "~/env";

const convexClient = new ConvexHttpClient(env.NEXT_PUBLIC_CONVEX_URL);

const MAX_BYTES = 25 * 1024 * 1024;

const ALLOWED_TYPES = new Set([
  "audio/mpeg",
  "audio/mp3",
  "audio/wav",
  "audio/x-wav",
  "audio/wave",
  "audio/vnd.wave",
]);

function isAllowedAudio(contentType: string, name: string): boolean {
  const ct = contentType.split(";")[0]?.trim().toLowerCase() ?? "";
  if (ALLOWED_TYPES.has(ct)) {
    return true;
  }
  const lower = name.toLowerCase();
  return lower.endsWith(".mp3") || lower.endsWith(".wav");
}

export async function POST(request: NextRequest) {
  const authResult = await auth();
  const userId = authResult.userId;
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let formData: FormData;
  try {
    formData = await request.formData();
  } catch {
    return NextResponse.json({ error: "Expected multipart form data" }, { status: 400 });
  }

  const file = formData.get("file");
  if (!(file instanceof File)) {
    return NextResponse.json({ error: "Missing file field" }, { status: 400 });
  }

  if (file.size <= 0 || file.size > MAX_BYTES) {
    return NextResponse.json(
      { error: `Audio must be between 1 byte and ${MAX_BYTES / (1024 * 1024)} MB` },
      { status: 400 },
    );
  }

  const contentType = file.type || "application/octet-stream";
  if (!isAllowedAudio(contentType, file.name)) {
    return NextResponse.json(
      { error: "Only MP3 or WAV uploads are supported" },
      { status: 400 },
    );
  }

  let uploadUrl: string;
  try {
    uploadUrl = await convexClient.mutation(
      convexApi.tavusByoAudio.generateByoAudioUploadUrl,
      { userId },
    );
  } catch (e) {
    const message = e instanceof Error ? e.message : "Upload URL failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }

  const body = await file.arrayBuffer();
  const uploadRes = await fetch(uploadUrl, {
    method: "POST",
    headers: {
      "Content-Type": contentType,
    },
    body,
  });

  if (!uploadRes.ok) {
    const text = await uploadRes.text();
    return NextResponse.json(
      { error: "Storage upload failed", detail: text.slice(0, 200) },
      { status: 502 },
    );
  }

  let storageId: string;
  try {
    const json = (await uploadRes.json()) as { storageId?: string };
    if (typeof json.storageId !== "string" || !json.storageId.trim()) {
      return NextResponse.json(
        { error: "Unexpected storage response" },
        { status: 502 },
      );
    }
    storageId = json.storageId.trim();
  } catch {
    return NextResponse.json({ error: "Invalid storage response" }, { status: 502 });
  }

  let audioUrl: string;
  try {
    audioUrl = await convexClient.mutation(
      convexApi.tavusByoAudio.registerByoAudioAndGetUrl,
      {
        userId,
        storageId: storageId as Id<"_storage">,
        byteSize: file.size,
        contentType,
      },
    );
  } catch (e) {
    const message = e instanceof Error ? e.message : "Register failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }

  return NextResponse.json({
    audioUrl,
    byteSize: file.size,
    contentType,
  });
}
