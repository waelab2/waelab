"use client";

import { useEffect, useState } from "react";

export type GenerationWithOutputMedia = {
  service: "fal" | "elevenlabs" | "runway" | "tavus";
  status: "pending" | "completed" | "failed";
  request_id: string;
  output_media_url?: string;
  output_media_kind?: "video" | "audio";
};

type TavusVideoGetJson = {
  streamUrl?: string;
  hostedUrl?: string;
  error?: string;
};

function TavusCompletedPlayer({
  videoId,
  compact,
}: {
  videoId: string;
  compact?: boolean;
}) {
  const [src, setSrc] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      try {
        const res = await fetch(
          `/api/tavus/video?videoId=${encodeURIComponent(videoId)}`,
        );
        const data = (await res.json()) as TavusVideoGetJson;
        if (cancelled) return;
        if (!res.ok) {
          setErr(data.error ?? "Could not load video");
          return;
        }
        const url = data.streamUrl ?? data.hostedUrl ?? null;
        if (!url) {
          setErr("No playback URL yet");
          return;
        }
        setSrc(url);
      } catch {
        if (!cancelled) setErr("Network error");
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [videoId]);

  if (err) {
    return (
      <p className="text-xs text-amber-200/90" role="status">
        {err}
      </p>
    );
  }
  if (!src) {
    return (
      <p className="text-xs text-gray-500" role="status">
        Loading playback…
      </p>
    );
  }
  return (
    <video
      controls
      className={
        compact
          ? "mt-2 max-h-36 w-full rounded-md border border-gray-600 bg-black object-contain"
          : "mt-2 w-full max-w-xl rounded-md border border-gray-600 bg-black"
      }
      preload="metadata"
      src={src}
    >
      Your browser does not support the video tag.
    </video>
  );
}

export function GenerationOutputMediaPreview({
  request,
  compact,
}: {
  request: GenerationWithOutputMedia;
  compact?: boolean;
}) {
  if (request.status !== "completed") {
    return null;
  }

  const url = request.output_media_url;
  const kind = request.output_media_kind;

  if (url && kind === "video") {
    return (
      <video
        controls
        className={
          compact
            ? "mt-2 max-h-36 w-full rounded-md border border-gray-600 bg-black object-contain"
            : "mt-2 w-full max-w-xl rounded-md border border-gray-600 bg-black"
        }
        preload="metadata"
        src={url}
      >
        Your browser does not support the video tag.
      </video>
    );
  }

  if (url && kind === "audio") {
    return (
      <audio
        controls
        className="mt-2 w-full max-w-xl"
        preload="metadata"
        src={url}
      >
        Your browser does not support the audio tag.
      </audio>
    );
  }

  if (request.service === "tavus") {
    const videoId = request.request_id.trim();
    if (!videoId) return null;
    return <TavusCompletedPlayer compact={compact} videoId={videoId} />;
  }

  return null;
}
