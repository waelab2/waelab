/**
 * Tavus HTTP API client (recorded video).
 * Spec: https://tavus.mintlify.app/api-reference/video-request/create-video
 * Callback payloads: https://tavus.mintlify.app/sections/webhooks-and-callbacks
 * (Video generation completed / error — flat JSON with `video_id`, `status`, …).
 */
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

export type TavusCreateVideoPayload = {
  replica_id: string;
  script?: string;
  audio_url?: string;
  video_name?: string;
  callback_url?: string;
  fast?: boolean;
  transparent_background?: boolean;
  watermark_image_url?: string;
  background_url?: string;
  background_source_url?: string;
  properties?: {
    background_scroll?: boolean;
    background_scroll_type?: "human" | "smooth";
    background_scroll_depth?: "middle" | "bottom";
    background_scroll_return?: "return" | "halt";
    start_with_wave?: boolean;
  };
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

function buildCreateVideoJson(payload: TavusCreateVideoPayload): Record<string, unknown> {
  const body: Record<string, unknown> = {
    replica_id: payload.replica_id,
  };
  if (payload.script !== undefined) {
    body.script = payload.script;
  }
  if (payload.audio_url !== undefined) {
    body.audio_url = payload.audio_url;
  }
  if (payload.video_name !== undefined) {
    body.video_name = payload.video_name;
  }
  if (payload.callback_url !== undefined) {
    body.callback_url = payload.callback_url;
  }
  if (payload.fast === true) {
    body.fast = true;
  }
  if (payload.transparent_background === true) {
    body.transparent_background = true;
  }
  if (payload.watermark_image_url !== undefined) {
    body.watermark_image_url = payload.watermark_image_url;
  }
  if (payload.background_url !== undefined) {
    body.background_url = payload.background_url;
  }
  if (payload.background_source_url !== undefined) {
    body.background_source_url = payload.background_source_url;
  }
  if (payload.properties !== undefined) {
    const p = payload.properties;
    const props: Record<string, unknown> = {};
    if (p.background_scroll !== undefined) {
      props.background_scroll = p.background_scroll;
    }
    if (p.background_scroll_type !== undefined) {
      props.background_scroll_type = p.background_scroll_type;
    }
    if (p.background_scroll_depth !== undefined) {
      props.background_scroll_depth = p.background_scroll_depth;
    }
    if (p.background_scroll_return !== undefined) {
      props.background_scroll_return = p.background_scroll_return;
    }
    if (p.start_with_wave !== undefined) {
      props.start_with_wave = p.start_with_wave;
    }
    if (Object.keys(props).length > 0) {
      body.properties = props;
    }
  }
  return body;
}

export async function tavusCreateVideo(input: {
  apiKey: string;
  payload: TavusCreateVideoPayload;
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
    body: JSON.stringify(buildCreateVideoJson(input.payload)),
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

export type TavusVideoWebhookPayload = {
  video_id: string;
  status: string;
  status_details?: string | null;
};

export function parseTavusVideoWebhookPayload(
  body: unknown,
): TavusVideoWebhookPayload | null {
  if (!isRecord(body)) {
    return null;
  }
  const videoId = body.video_id;
  const status = body.status;
  if (typeof videoId !== "string" || !videoId.trim()) {
    return null;
  }
  if (typeof status !== "string" || !status.trim()) {
    return null;
  }
  const details = body.status_details;
  return {
    video_id: videoId.trim(),
    status: status.trim(),
    status_details:
      typeof details === "string"
        ? details
        : details === null
          ? null
          : undefined,
  };
}
