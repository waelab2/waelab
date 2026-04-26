"use client";

import { useAuth } from "@clerk/nextjs";
import Link from "next/link";
import { ChevronDown } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "~/components/ui/collapsible";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { Textarea } from "~/components/ui/textarea";
import { useCreditBalance } from "~/hooks/use-credit-balance";
import { TAVUS_VIDEO_ESTIMATED_CREDITS } from "~/lib/constants/tavus";
import type { TavusVideoStatus } from "~/lib/tavusApi";

const MAX_SCRIPT_CHARS = 12_000;
const POLL_MS = 4000;
const MAX_WAIT_MS = 15 * 60 * 1000;

type TavusLanguage = "en" | "ar";
type InputMode = "script" | "audio";

type CreateJson = {
  requestId?: string;
  error?: string;
  details?: Record<string, unknown>;
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

function pickInlinePlaybackUrl(data: StatusJson): string | null {
  const download = data.downloadUrl?.trim();
  if (download) {
    return download;
  }
  const stream = data.streamUrl?.trim();
  if (stream) {
    // HLS (.m3u8): native <video> is unreliable in Chromium without hls.js;
    // prefer hosted iframe when available (handled by caller).
    if (stream.toLowerCase().includes(".m3u8")) {
      return null;
    }
    return stream;
  }
  return null;
}

function isTerminalStatus(s: TavusVideoStatus): boolean {
  return s === "ready" || s === "error" || s === "deleted";
}

export default function TavusTalkingHeadPage() {
  const { isLoaded, userId } = useAuth();
  const creditBalance = useCreditBalance();
  const [script, setScript] = useState("");
  const [audioUrl, setAudioUrl] = useState("");
  const [inputMode, setInputMode] = useState<InputMode>("script");
  const [language, setLanguage] = useState<TavusLanguage>("en");
  const [videoId, setVideoId] = useState<string | null>(null);
  const [status, setStatus] = useState<TavusVideoStatus | null>(null);
  const [hostedUrl, setHostedUrl] = useState<string | null>(null);
  const [playbackUrl, setPlaybackUrl] = useState<string | null>(null);
  const [statusDetails, setStatusDetails] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const pollStartedAt = useRef<number | null>(null);
  const creditsFinalizedRef = useRef(false);
  const [advancedOpen, setAdvancedOpen] = useState(false);
  const [advVideoName, setAdvVideoName] = useState("");
  const [advCallbackUrl, setAdvCallbackUrl] = useState("");
  const [advFast, setAdvFast] = useState(false);
  const [advTransparentBg, setAdvTransparentBg] = useState(false);
  const [advWatermarkUrl, setAdvWatermarkUrl] = useState("");
  const [advBackgroundUrl, setAdvBackgroundUrl] = useState("");
  const [advBackgroundSourceUrl, setAdvBackgroundSourceUrl] = useState("");
  const [advStartWithWave, setAdvStartWithWave] = useState<boolean | "">("");
  const [advBgScroll, setAdvBgScroll] = useState<boolean | "">("");
  const [advBgScrollType, setAdvBgScrollType] = useState<"human" | "smooth" | "">(
    "",
  );
  const [advBgScrollDepth, setAdvBgScrollDepth] = useState<
    "middle" | "bottom" | ""
  >("");
  const [advBgScrollReturn, setAdvBgScrollReturn] = useState<
    "return" | "halt" | ""
  >("");

  const resetForNewRun = useCallback(() => {
    setVideoId(null);
    setStatus(null);
    setHostedUrl(null);
    setPlaybackUrl(null);
    setStatusDetails(null);
    setError(null);
    pollStartedAt.current = null;
    creditsFinalizedRef.current = false;
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
      setError(
        data.statusDetails ??
          "Video generation failed. Check Tavus dashboard and replica/voice for Arabic.",
      );
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

  useEffect(() => {
    if (!videoId || !status || !isTerminalStatus(status)) {
      return;
    }
    if (creditsFinalizedRef.current) {
      return;
    }
    creditsFinalizedRef.current = true;
    void (async () => {
      try {
        await fetch("/api/tavus/video/finalize", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ videoId }),
        });
      } catch {
        /* non-fatal */
      }
    })();
  }, [videoId, status]);

  function buildAdvancedPayload(): Record<string, unknown> | undefined {
    const advanced: Record<string, unknown> = {};
    if (advVideoName.trim()) {
      advanced.videoName = advVideoName.trim();
    }
    if (advCallbackUrl.trim()) {
      advanced.callbackUrl = advCallbackUrl.trim();
    }
    if (advFast) {
      advanced.fast = true;
    }
    if (advTransparentBg) {
      advanced.transparentBackground = true;
    }
    if (advWatermarkUrl.trim()) {
      advanced.watermarkImageUrl = advWatermarkUrl.trim();
    }
    if (advBackgroundUrl.trim()) {
      advanced.backgroundUrl = advBackgroundUrl.trim();
    }
    if (advBackgroundSourceUrl.trim()) {
      advanced.backgroundSourceUrl = advBackgroundSourceUrl.trim();
    }
    if (advStartWithWave !== "") {
      advanced.startWithWave = advStartWithWave;
    }
    if (advBgScroll !== "") {
      advanced.backgroundScroll = advBgScroll;
    }
    if (advBgScrollType) {
      advanced.backgroundScrollType = advBgScrollType;
    }
    if (advBgScrollDepth) {
      advanced.backgroundScrollDepth = advBgScrollDepth;
    }
    if (advBgScrollReturn) {
      advanced.backgroundScrollReturn = advBgScrollReturn;
    }
    return Object.keys(advanced).length > 0 ? advanced : undefined;
  }

  async function handleGenerate() {
    if (!userId) {
      setError("You must be signed in.");
      return;
    }
    if (inputMode === "script") {
      const trimmed = script.trim();
      if (!trimmed) {
        setError("Enter a script to generate.");
        return;
      }
    } else {
      const u = audioUrl.trim();
      if (!u) {
        setError("Enter a public .mp3 or .wav URL (bring-your-own audio).");
        return;
      }
    }

    if (advTransparentBg && !advFast) {
      setError("Transparent background requires Fast mode.");
      return;
    }
    if (
      advFast &&
      (advBackgroundUrl.trim() !== "" || advBackgroundSourceUrl.trim() !== "")
    ) {
      setError(
        "Fast mode cannot be combined with background URLs (per Tavus Create Video API).",
      );
      return;
    }

    resetForNewRun();
    setIsSubmitting(true);
    setError(null);

    const advanced = buildAdvancedPayload();
    const body: Record<string, unknown> = {
      language,
      inputMode,
      ...(inputMode === "script"
        ? { script: script.trim() }
        : { audioUrl: audioUrl.trim() }),
      ...(advanced ? { advanced } : {}),
    };

    try {
      const res = await fetch("/api/tavus/video", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = (await res.json()) as CreateJson;

      if (!res.ok) {
        const detailStr =
          data.details !== undefined
            ? ` ${JSON.stringify(data.details)}`
            : "";
        setError(`${data.error ?? "Request failed"}${detailStr}`.trim());
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
  const hasSubscription = creditBalance?.has_active_subscription === true;
  const enoughCredits =
    (creditBalance?.available_credits ?? 0) >= TAVUS_VIDEO_ESTIMATED_CREDITS;
  const creditBlocked =
    !creditBalance ||
    !hasSubscription ||
    !enoughCredits;

  const generateDisabledReason = !userId
    ? "Sign in required"
    : !creditBalance
      ? "Loading credits…"
      : !hasSubscription
        ? "Active subscription required"
        : !enoughCredits
          ? "Insufficient credits"
          : inputMode === "script"
            ? !script.trim() || scriptTooLong
              ? "Enter a valid script"
              : null
            : !audioUrl.trim()
              ? "Enter audio URL"
              : null;

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
          Recorded avatar video (not live CVI). Uses{" "}
          <strong className="font-semibold text-white">
            {TAVUS_VIDEO_ESTIMATED_CREDITS} credits
          </strong>{" "}
          per job (reserved when you start, captured or released when the job
          ends).
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
            <p className="text-xs text-white/65">
              Tavus lists Arabic among supported TTS languages, but{" "}
              <code className="rounded bg-black/30 px-1">POST /v2/videos</code>{" "}
              has no language field: Arabic only works if{" "}
              <code className="rounded bg-black/30 px-1">TAVUS_REPLICA_ID_AR</code>{" "}
              is a replica whose voice supports Arabic. If script mode fails,
              try <strong className="text-white/90">Bring-your-own audio</strong>{" "}
              with MP3/WAV from your own Arabic TTS.
            </p>
          </div>

          <div className="space-y-2">
            <Label className="text-white">Input</Label>
            <div className="flex flex-wrap gap-2">
              <Button
                type="button"
                variant={inputMode === "script" ? "default" : "outline"}
                className={
                  inputMode === "script"
                    ? "bg-white text-[#282830] hover:bg-white/90"
                    : "border-white/30 bg-transparent text-white hover:bg-white/10"
                }
                onClick={() => setInputMode("script")}
              >
                Script (Tavus TTS)
              </Button>
              <Button
                type="button"
                variant={inputMode === "audio" ? "default" : "outline"}
                className={
                  inputMode === "audio"
                    ? "bg-white text-[#282830] hover:bg-white/90"
                    : "border-white/30 bg-transparent text-white hover:bg-white/10"
                }
                onClick={() => setInputMode("audio")}
              >
                Audio URL (BYO)
              </Button>
            </div>
          </div>

          {inputMode === "script" ? (
            <div className="space-y-2">
              <div className="flex items-center justify-between gap-2">
                <Label htmlFor="tavus-script" className="text-white">
                  Script
                </Label>
                <span
                  className={
                    scriptTooLong
                      ? "text-xs text-red-300"
                      : "text-xs text-white/60"
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
          ) : (
            <div className="space-y-2">
              <Label htmlFor="tavus-audio" className="text-white">
                Public audio URL (.mp3 or .wav)
              </Label>
              <Input
                id="tavus-audio"
                value={audioUrl}
                onChange={(e) => setAudioUrl(e.target.value)}
                placeholder="https://…"
                className="border-white/20 bg-white/10 text-white placeholder:text-white/40"
              />
            </div>
          )}

          <Collapsible open={advancedOpen} onOpenChange={setAdvancedOpen}>
            <CollapsibleTrigger asChild>
              <Button
                type="button"
                variant="ghost"
                className="flex w-full items-center justify-between text-white hover:bg-white/10"
              >
                <span>Advanced video options</span>
                <ChevronDown
                  className={`size-4 transition-transform ${advancedOpen ? "rotate-180" : ""}`}
                />
              </Button>
            </CollapsibleTrigger>
            <CollapsibleContent className="space-y-4 pt-2">
              <div className="space-y-2">
                <Label className="text-white">Video name (optional)</Label>
                <Input
                  value={advVideoName}
                  onChange={(e) => setAdvVideoName(e.target.value)}
                  className="border-white/20 bg-white/10 text-white"
                />
              </div>
              <div className="space-y-1">
                <Label className="text-white">
                  Tavus callback URL (optional)
                </Label>
                <p className="text-xs text-white/55">
                  If set, Tavus POSTs completion to this URL. Credits still
                  finalize here when polling sees a terminal status.
                </p>
                <Input
                  value={advCallbackUrl}
                  onChange={(e) => setAdvCallbackUrl(e.target.value)}
                  placeholder="https://…"
                  className="border-white/20 bg-white/10 text-white"
                />
              </div>
              <div className="flex flex-wrap gap-4">
                <label className="flex items-center gap-2 text-sm text-white">
                  <input
                    type="checkbox"
                    checked={advFast}
                    onChange={(e) => setAdvFast(e.target.checked)}
                    className="rounded border-white/40"
                  />
                  Fast render
                </label>
                <label className="flex items-center gap-2 text-sm text-white">
                  <input
                    type="checkbox"
                    checked={advTransparentBg}
                    onChange={(e) => setAdvTransparentBg(e.target.checked)}
                    className="rounded border-white/40"
                  />
                  Transparent background (.webm, requires fast)
                </label>
              </div>
              <p className="text-xs text-white/55">
                Per Tavus API: fast mode does not support website or file
                backgrounds, thumbnails, or streaming URLs — leave background
                fields empty when Fast is on.
              </p>
              <div className="space-y-2">
                <Label className="text-white">Watermark image URL</Label>
                <Input
                  value={advWatermarkUrl}
                  onChange={(e) => setAdvWatermarkUrl(e.target.value)}
                  placeholder="https://…png or jpg"
                  className="border-white/20 bg-white/10 text-white"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-white">Website background URL</Label>
                <Input
                  value={advBackgroundUrl}
                  onChange={(e) => setAdvBackgroundUrl(e.target.value)}
                  className="border-white/20 bg-white/10 text-white"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-white">Video background source URL</Label>
                <Input
                  value={advBackgroundSourceUrl}
                  onChange={(e) => setAdvBackgroundSourceUrl(e.target.value)}
                  className="border-white/20 bg-white/10 text-white"
                />
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                <div className="space-y-1">
                  <Label className="text-xs text-white/80">Start with wave</Label>
                  <select
                    value={advStartWithWave === "" ? "" : String(advStartWithWave)}
                    onChange={(e) => {
                      const v = e.target.value;
                      setAdvStartWithWave(
                        v === "" ? "" : v === "true",
                      );
                    }}
                    className="w-full rounded-md border border-white/20 bg-white/10 px-2 py-2 text-sm text-white"
                  >
                    <option value="">Default</option>
                    <option value="true">true</option>
                    <option value="false">false</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <Label className="text-xs text-white/80">Background scroll</Label>
                  <select
                    value={advBgScroll === "" ? "" : String(advBgScroll)}
                    onChange={(e) => {
                      const v = e.target.value;
                      setAdvBgScroll(v === "" ? "" : v === "true");
                    }}
                    className="w-full rounded-md border border-white/20 bg-white/10 px-2 py-2 text-sm text-white"
                  >
                    <option value="">Default</option>
                    <option value="true">true</option>
                    <option value="false">false</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <Label className="text-xs text-white/80">Scroll type</Label>
                  <select
                    value={advBgScrollType}
                    onChange={(e) =>
                      setAdvBgScrollType(
                        e.target.value as "human" | "smooth" | "",
                      )
                    }
                    className="w-full rounded-md border border-white/20 bg-white/10 px-2 py-2 text-sm text-white"
                  >
                    <option value="">Default</option>
                    <option value="human">human</option>
                    <option value="smooth">smooth</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <Label className="text-xs text-white/80">Scroll depth</Label>
                  <select
                    value={advBgScrollDepth}
                    onChange={(e) =>
                      setAdvBgScrollDepth(
                        e.target.value as "middle" | "bottom" | "",
                      )
                    }
                    className="w-full rounded-md border border-white/20 bg-white/10 px-2 py-2 text-sm text-white"
                  >
                    <option value="">Default</option>
                    <option value="middle">middle</option>
                    <option value="bottom">bottom</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <Label className="text-xs text-white/80">Scroll return</Label>
                  <select
                    value={advBgScrollReturn}
                    onChange={(e) =>
                      setAdvBgScrollReturn(
                        e.target.value as "return" | "halt" | "",
                      )
                    }
                    className="w-full rounded-md border border-white/20 bg-white/10 px-2 py-2 text-sm text-white"
                  >
                    <option value="">Default</option>
                    <option value="return">return</option>
                    <option value="halt">halt</option>
                  </select>
                </div>
              </div>
            </CollapsibleContent>
          </Collapsible>

          <Button
            type="button"
            onClick={() => void handleGenerate()}
            disabled={
              isSubmitting ||
              creditBlocked ||
              generateDisabledReason !== null
            }
            className="bg-gradient-to-r from-[#E9476E] to-[#3B5DA8] text-white hover:opacity-95"
          >
            {isSubmitting ? "Starting…" : "Generate video"}
          </Button>
          {generateDisabledReason && creditBalance ? (
            <p className="text-xs text-amber-200/90">{generateDisabledReason}</p>
          ) : null}

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
              {statusDetails ? (
                <p
                  className={
                    status === "error" ? "text-red-200" : "text-white/60"
                  }
                >
                  {status === "error" ? "Tavus: " : ""}
                  {statusDetails}
                </p>
              ) : null}
            </div>
          ) : null}

          {error ? (
            <p className="text-sm text-red-300 whitespace-pre-wrap" role="alert">
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
