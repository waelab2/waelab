const TAVUS_API_BASE = "https://tavusapi.com";

export type TavusVideoStatus =
  | "queued"
  | "generating"
  | "ready"
  | "deleted"
  | "error";

export type TavusCreateVideoSuccess = {
  video_id: string;
  video_name?: string;
  status: TavusVideoStatus;
  hosted_url?: string;
  created_at?: string;
};

export type TavusGetVideoSuccess = {
  video_id: string;
  video_name?: string;
  status: TavusVideoStatus;
  hosted_url?: string | null;
  download_url?: string | null;
  stream_url?: string | null;
  status_details?: string;
  created_at?: string;
  updated_at?: string;
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function parseVideoStatus(value: unknown): TavusVideoStatus | null {
  if (
    value === "queued" ||
    value === "generating" ||
    value === "ready" ||
    value === "deleted" ||
    value === "error"
  ) {
    return value;
  }
  return null;
}

function readTavusErrorMessage(body: unknown): string {
  if (!isRecord(body)) {
    return "Tavus request failed";
  }
  const err = body.error;
  const msg = body.message;
  if (typeof err === "string" && err.trim()) {
    return err;
  }
  if (typeof msg === "string" && msg.trim()) {
    return msg;
  }
  return "Tavus request failed";
}

function parseCreateVideo(body: unknown): TavusCreateVideoSuccess | null {
  if (!isRecord(body)) {
    return null;
  }
  const videoId = body.video_id;
  const status = parseVideoStatus(body.status);
  if (typeof videoId !== "string" || !videoId.trim() || !status) {
    return null;
  }
  const videoName = body.video_name;
  const hostedUrl = body.hosted_url;
  const createdAt = body.created_at;
  return {
    video_id: videoId,
    ...(typeof videoName === "string" ? { video_name: videoName } : {}),
    status,
    ...(typeof hostedUrl === "string" ? { hosted_url: hostedUrl } : {}),
    ...(typeof createdAt === "string" ? { created_at: createdAt } : {}),
  };
}

function parseGetVideo(body: unknown): TavusGetVideoSuccess | null {
  if (!isRecord(body)) {
    return null;
  }
  const videoId = body.video_id;
  const status = parseVideoStatus(body.status);
  if (typeof videoId !== "string" || !videoId.trim() || !status) {
    return null;
  }
  const videoName = body.video_name;
  const hostedUrl = body.hosted_url;
  const downloadUrl = body.download_url;
  const streamUrl = body.stream_url;
  const statusDetails = body.status_details;
  const createdAt = body.created_at;
  const updatedAt = body.updated_at;
  return {
    video_id: videoId,
    ...(typeof videoName === "string" ? { video_name: videoName } : {}),
    status,
    hosted_url: typeof hostedUrl === "string" ? hostedUrl : null,
    download_url: typeof downloadUrl === "string" ? downloadUrl : null,
    stream_url: typeof streamUrl === "string" ? streamUrl : null,
    ...(typeof statusDetails === "string"
      ? { status_details: statusDetails }
      : {}),
    ...(typeof createdAt === "string" ? { created_at: createdAt } : {}),
    ...(typeof updatedAt === "string" ? { updated_at: updatedAt } : {}),
  };
}

export async function tavusCreateVideo(input: {
  apiKey: string;
  replicaId: string;
  script: string;
  videoName?: string;
}): Promise<
  | { ok: true; data: TavusCreateVideoSuccess }
  | { ok: false; status: number; message: string }
> {
  const res = await fetch(`${TAVUS_API_BASE}/v2/videos`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": input.apiKey,
    },
    body: JSON.stringify({
      replica_id: input.replicaId,
      script: input.script,
      ...(input.videoName?.trim()
        ? { video_name: input.videoName.trim() }
        : {}),
    }),
  });

  let body: unknown;
  try {
    body = (await res.json()) as unknown;
  } catch {
    body = null;
  }

  if (!res.ok) {
    return {
      ok: false,
      status: res.status,
      message: readTavusErrorMessage(body),
    };
  }

  const parsed = parseCreateVideo(body);
  if (!parsed) {
    return {
      ok: false,
      status: 502,
      message: "Unexpected response from Tavus when creating video",
    };
  }

  return { ok: true, data: parsed };
}

export async function tavusGetVideo(input: {
  apiKey: string;
  videoId: string;
  verbose?: boolean;
}): Promise<
  | { ok: true; data: TavusGetVideoSuccess }
  | { ok: false; status: number; message: string }
> {
  const q = input.verbose ? "?verbose=true" : "";
  const res = await fetch(
    `${TAVUS_API_BASE}/v2/videos/${encodeURIComponent(input.videoId)}${q}`,
    {
      method: "GET",
      headers: {
        "x-api-key": input.apiKey,
      },
    },
  );

  let body: unknown;
  try {
    body = (await res.json()) as unknown;
  } catch {
    body = null;
  }

  if (!res.ok) {
    return {
      ok: false,
      status: res.status,
      message: readTavusErrorMessage(body),
    };
  }

  const parsed = parseGetVideo(body);
  if (!parsed) {
    return {
      ok: false,
      status: 502,
      message: "Unexpected response from Tavus when fetching video",
    };
  }

  return { ok: true, data: parsed };
}
