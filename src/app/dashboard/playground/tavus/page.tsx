"use client";

import { useAuth } from "@clerk/nextjs";
import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import { Button } from "~/components/ui/button";
import { Label } from "~/components/ui/label";
import { Textarea } from "~/components/ui/textarea";
import type { TavusVideoStatus } from "~/lib/tavusApi";

const MAX_SCRIPT_CHARS = 12_000;
const POLL_MS = 4000;
const MAX_WAIT_MS = 15 * 60 * 1000;

type TavusLanguage = "en" | "ar";

type CreateJson = {
  requestId?: string;
  error?: string;
  videoId?: string;
  status?: TavusVideoStatus;
};

type StatusJson = {
  requestId?: string;
  error?: string;
  videoId?: string;
  status?: TavusVideoStatus;
  hostedUrl?: string;
  downloadUrl?: string;
  streamUrl?: string;
  statusDetails?: string;
};

/** Tavus `hosted_url` is a viewer page, not a file — `<video>` needs MP4 or HLS. */
function pickInlinePlaybackUrl(data: StatusJson): string | null {
  const download = data.downloadUrl?.trim();
  if (download) {
    return download;
  }
  const stream = data.streamUrl?.trim();
  if (stream) {
    return stream;
  }
  return null;
}

function isTerminalStatus(s: TavusVideoStatus): boolean {
  return s === "ready" || s === "error" || s === "deleted";
}

export default function TavusTalkingHeadPage() {
  const { isLoaded, userId } = useAuth();
  const [script, setScript] = useState("");
  const [language, setLanguage] = useState<TavusLanguage>("en");
  const [videoId, setVideoId] = useState<string | null>(null);
  const [status, setStatus] = useState<TavusVideoStatus | null>(null);
  const [hostedUrl, setHostedUrl] = useState<string | null>(null);
  const [playbackUrl, setPlaybackUrl] = useState<string | null>(null);
  const [statusDetails, setStatusDetails] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const pollStartedAt = useRef<number | null>(null);

  const resetForNewRun = useCallback(() => {
    setVideoId(null);
    setStatus(null);
    setHostedUrl(null);
    setPlaybackUrl(null);
    setStatusDetails(null);
    setError(null);
    pollStartedAt.current = null;
  }, []);

  const fetchStatus = useCallback(async (id: string) => {
    const res = await fetch(
      `/api/tavus/video?videoId=${encodeURIComponent(id)}`,
      { method: "GET" },
    );
    const data = (await res.json()) as StatusJson;
    if (!res.ok) {
      setError(data.error ?? "Failed to fetch video status");
      setStatus("error");
      return;
    }
    if (data.status) {
      setStatus(data.status);
    }
    if (data.hostedUrl) {
      setHostedUrl(data.hostedUrl);
    }
    const inline = pickInlinePlaybackUrl(data);
    if (inline) {
      setPlaybackUrl(inline);
    }
    if (data.statusDetails) {
      setStatusDetails(data.statusDetails);
    }
    if (data.status === "error") {
      setError(data.statusDetails ?? "Video generation failed");
    }
  }, []);

  useEffect(() => {
    if (!videoId || !status || isTerminalStatus(status)) {
      return;
    }

    const run = () => {
      void (async () => {
        pollStartedAt.current ??= Date.now();
        if (
          pollStartedAt.current !== null &&
          Date.now() - pollStartedAt.current > MAX_WAIT_MS
        ) {
          setError("Timed out waiting for Tavus. Try again or check Tavus status.");
          setStatus("error");
          return;
        }
        await fetchStatus(videoId);
      })();
    };

    run();
    const interval = setInterval(run, POLL_MS);
    return () => clearInterval(interval);
  }, [videoId, status, fetchStatus]);

  async function handleGenerate() {
    const trimmed = script.trim();
    if (!trimmed) {
      setError("Enter a script to generate.");
      return;
    }
    if (!userId) {
      setError("You must be signed in.");
      return;
    }

    resetForNewRun();
    setIsSubmitting(true);
    setError(null);

    try {
      const res = await fetch("/api/tavus/video", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          script: trimmed,
          language,
        }),
      });
      const data = (await res.json()) as CreateJson;

      if (!res.ok) {
        setError(data.error ?? "Request failed");
        setStatus("error");
        return;
      }

      if (!data.videoId || !data.status) {
        setError("Unexpected response from server");
        setStatus("error");
        return;
      }

      setVideoId(data.videoId);
      setStatus(data.status);
    } catch {
      setError("Network error. Try again.");
      setStatus("error");
    } finally {
      setIsSubmitting(false);
    }
  }

  const scriptTooLong = script.length > MAX_SCRIPT_CHARS;
  const showResult =
    status === "ready" && (playbackUrl !== null || hostedUrl !== null);

  return (
    <main className="mx-auto flex max-w-3xl flex-col gap-8 py-6">
      <div className="space-y-2">
        <Link
          href="/dashboard/playground"
          className="text-sm text-white/70 underline-offset-4 hover:text-white hover:underline"
        >
          Back to Playground
        </Link>
        <h1 className="text-3xl font-bold tracking-tight text-white">
          Tavus talking head
        </h1>
        <p className="text-sm text-white/80">
          Generate an avatar video from a script. English and Arabic use separate
          replicas configured in the server environment.
        </p>
      </div>

      {!isLoaded ? (
        <p className="text-white/70">Loading…</p>
      ) : !userId ? (
        <p className="text-white/80">Sign in to use this tool.</p>
      ) : (
        <div className="space-y-6 rounded-xl border border-white/20 bg-white/10 p-6 backdrop-blur-sm">
          <div className="space-y-2">
            <Label className="text-white">Language / replica</Label>
            <div className="flex flex-wrap gap-2">
              <Button
                type="button"
                variant={language === "en" ? "default" : "outline"}
                className={
                  language === "en"
                    ? "bg-white text-[#282830] hover:bg-white/90"
                    : "border-white/30 bg-transparent text-white hover:bg-white/10"
                }
                onClick={() => setLanguage("en")}
              >
                English
              </Button>
              <Button
                type="button"
                variant={language === "ar" ? "default" : "outline"}
                className={
                  language === "ar"
                    ? "bg-white text-[#282830] hover:bg-white/90"
                    : "border-white/30 bg-transparent text-white hover:bg-white/10"
                }
                onClick={() => setLanguage("ar")}
              >
                العربية
              </Button>
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between gap-2">
              <Label htmlFor="tavus-script" className="text-white">
                Script
              </Label>
              <span
                className={
                  scriptTooLong ? "text-xs text-red-300" : "text-xs text-white/60"
                }
              >
                {script.length} / {MAX_SCRIPT_CHARS}
              </span>
            </div>
            <Textarea
              id="tavus-script"
              value={script}
              onChange={(e) => setScript(e.target.value)}
              dir={language === "ar" ? "rtl" : "ltr"}
              lang={language === "ar" ? "ar" : "en"}
              placeholder={
                language === "ar"
                  ? "اكتب النص الذي سيتحدث به الصورة الرمزية…"
                  : "Write what the avatar should say…"
              }
              rows={10}
              maxLength={MAX_SCRIPT_CHARS}
              className="min-h-[200px] border-white/20 bg-white/10 text-white placeholder:text-white/40"
            />
            {scriptTooLong ? (
              <p className="text-xs text-red-300">
                Script exceeds {MAX_SCRIPT_CHARS} characters. Shorten it for
                better quality (Tavus recommends keeping output under ~5
                minutes).
              </p>
            ) : null}
          </div>

          <Button
            type="button"
            onClick={() => void handleGenerate()}
            disabled={isSubmitting || scriptTooLong || !script.trim()}
            className="bg-gradient-to-r from-[#E9476E] to-[#3B5DA8] text-white hover:opacity-95"
          >
            {isSubmitting ? "Starting…" : "Generate video"}
          </Button>

          {videoId ? (
            <div className="space-y-1 rounded-lg border border-white/15 bg-black/20 p-4 text-sm text-white/90">
              <p>
                <span className="text-white/60">Video ID:</span> {videoId}
              </p>
              {status ? (
                <p>
                  <span className="text-white/60">Status:</span> {status}
                </p>
              ) : null}
              {statusDetails && status !== "error" ? (
                <p className="text-white/60">{statusDetails}</p>
              ) : null}
            </div>
          ) : null}

          {error ? (
            <p className="text-sm text-red-300" role="alert">
              {error}
            </p>
          ) : null}

          {showResult ? (
            <div className="space-y-2">
              <p className="text-sm font-medium text-white">Result</p>
              {playbackUrl ? (
                <video
                  key={playbackUrl}
                  src={playbackUrl}
                  controls
                  playsInline
                  className="aspect-video w-full max-w-full rounded-lg bg-black object-contain shadow-lg"
                  preload="metadata"
                >
                  Your browser does not support the video tag.
                </video>
              ) : hostedUrl ? (
                <div className="space-y-2">
                  <p className="text-sm text-white/70">
                    No direct MP4/HLS URL yet (e.g. fast mode). Open the hosted
                    viewer or try again in a moment.
                  </p>
                  <iframe
                    title="Tavus video"
                    src={hostedUrl}
                    className="aspect-video w-full max-w-full rounded-lg border-0 bg-black shadow-lg"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  />
                </div>
              ) : null}
              {hostedUrl ? (
                <a
                  href={hostedUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-white/80 underline-offset-4 hover:text-white hover:underline"
                >
                  Open hosted video in new tab
                </a>
              ) : null}
            </div>
          ) : null}
        </div>
      )}
    </main>
  );
}
