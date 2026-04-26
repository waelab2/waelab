"use client";

import { useAuth } from "@clerk/nextjs";
import Link from "next/link";
import { ChevronDown } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import GlowingCard from "~/components/mvpblocks/glow-card";
import { Button } from "~/components/ui/button";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "~/components/ui/collapsible";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";
import { Separator } from "~/components/ui/separator";
import { Textarea } from "~/components/ui/textarea";
import { useCreditBalance } from "~/hooks/use-credit-balance";
import { USD_PER_CREDIT } from "~/lib/constants/credits";
import { tavusPlaygroundModel } from "~/lib/constants/playground-models";
import { TAVUS_VIDEO_ESTIMATED_CREDITS } from "~/lib/constants/tavus";
import type { TavusVideoStatus } from "~/lib/tavusApi";

const MAX_SCRIPT_CHARS = 12_000;
const POLL_MS = 4000;
const MAX_WAIT_MS = 15 * 60 * 1000;

const SELECT_DEFAULT = "__default";

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

function triBoolSelectValue(v: boolean | ""): string {
  if (v === "") return SELECT_DEFAULT;
  return v ? "true" : "false";
}

function parseTriBoolSelect(value: string): boolean | "" {
  if (value === SELECT_DEFAULT) return "";
  return value === "true";
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
  const resultsSectionRef = useRef<HTMLDivElement>(null);
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

  const estimatedCredits = TAVUS_VIDEO_ESTIMATED_CREDITS;
  const estimatedCost = estimatedCredits * USD_PER_CREDIT;

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
          setError(
            "Timed out waiting for Tavus. Try again or check Tavus status.",
          );
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

  const isLoadingGeneration =
    Boolean(videoId) &&
    status !== null &&
    (status === "queued" || status === "generating");

  const showHeaderLoading = isSubmitting || isLoadingGeneration;

  const showResult =
    status === "ready" && (playbackUrl !== null || hostedUrl !== null);

  const showResultsPanel = videoId !== null;

  useEffect(() => {
    if (!showResultsPanel || !resultsSectionRef.current) {
      return;
    }
    const shouldScroll =
      isSubmitting ||
      isLoadingGeneration ||
      showResult ||
      status === "error";
    if (!shouldScroll) {
      return;
    }
    const t = setTimeout(() => {
      resultsSectionRef.current?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }, 100);
    return () => clearTimeout(t);
  }, [
    showResultsPanel,
    isSubmitting,
    isLoadingGeneration,
    showResult,
    status,
  ]);

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
    !creditBalance || !hasSubscription || !enoughCredits;

  const generateDisabledReason = !userId
    ? "Sign In Required"
    : !creditBalance
      ? "Loading Credits..."
      : !hasSubscription
        ? "Active Subscription Required"
        : !enoughCredits
          ? "Insufficient Credits"
          : inputMode === "script"
            ? !script.trim() || scriptTooLong
              ? "Enter a valid script"
              : null
            : !audioUrl.trim()
              ? "Enter audio URL"
              : null;

  const shouldShowPlansLink =
    generateDisabledReason === "Insufficient Credits" ||
    generateDisabledReason === "Active Subscription Required";

  const showGlobalErrorCard = Boolean(error) && !showResultsPanel;

  function headerLoadingText(): string {
    if (isSubmitting) return "Starting...";
    if (status === "queued") return "Queued...";
    if (status === "generating") return "Generating video...";
    return "Working...";
  }

  function resultsStatusBadge(): string {
    if (status === "ready") return "✓ Complete";
    if (status === "error") return "Error";
    if (status === "deleted") return "Deleted";
    if (status === "queued") return "Queued";
    if (status === "generating") return "Generating";
    return status ?? "…";
  }

  return (
    <main className="min-h-screen">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-white">
            Generate Video
          </h1>
          <p className="mt-2 text-sm text-white/80">
            Recorded avatar video from script or audio (not live CVI).{" "}
            {TAVUS_VIDEO_ESTIMATED_CREDITS} credits per job (reserved at start,
            captured or released when the job ends).
          </p>
          <div className="mt-4 space-y-2">
            <Link
              href="/dashboard/playground"
              className="inline-flex items-center gap-2 text-sm text-gray-300 transition-colors hover:text-white"
            >
              ← Back to Models
            </Link>
            <div className="text-sm text-gray-300">
              <span className="font-semibold text-white">Selected Model:</span>{" "}
              <span className="text-white">{tavusPlaygroundModel.name}</span>
            </div>
          </div>
        </div>

        {showHeaderLoading ? (
          <div className="flex items-center space-x-2 rounded-full bg-white/10 px-4 py-2 backdrop-blur-sm">
            <div className="h-3 w-3 animate-spin rounded-full border-2 border-white border-t-transparent" />
            <span className="text-sm font-medium text-white">
              {headerLoadingText()}
            </span>
          </div>
        ) : null}
      </div>

      <Separator className="my-8" />

      {!isLoaded ? (
        <p className="text-white/70">Loading…</p>
      ) : !userId ? (
        <p className="text-white/80">Sign in to use this tool.</p>
      ) : (
        <div className="grid gap-8 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <div className="rounded-xl bg-white/10 p-6 shadow-[0_0_0_1px_rgba(255,255,255,0.2)] backdrop-blur-sm">
              <h2 className="mb-4 text-lg font-semibold text-white">
                Video Generation
              </h2>
              <p className="mb-6 text-sm text-white/80">
                Configure script or audio URL, language, and optional advanced
                Tavus options.
              </p>

              <div className="mb-6 space-y-3">
                <Label className="text-sm font-medium text-white/80">
                  Language / replica
                </Label>
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
                  <code className="rounded bg-black/30 px-1">
                    TAVUS_REPLICA_ID_AR
                  </code>{" "}
                  is a replica whose voice supports Arabic. If script mode fails,
                  try{" "}
                  <strong className="text-white/90">Bring-your-own audio</strong>{" "}
                  with MP3/WAV from your own Arabic TTS.
                </p>
              </div>

              <div className="mb-6 space-y-3">
                <Label className="text-sm font-medium text-white/80">Input</Label>
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
                <div className="mb-6 space-y-3">
                  <div className="flex items-center justify-between gap-2">
                    <Label
                      htmlFor="tavus-script"
                      className="text-sm font-medium text-white/80"
                    >
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
                    className="min-h-[200px] w-full border-white/20 bg-white/10 text-white placeholder:text-white/40"
                  />
                  {scriptTooLong ? (
                    <p className="text-xs text-red-300">
                      Script exceeds {MAX_SCRIPT_CHARS} characters. Shorten it
                      for better quality (Tavus recommends keeping output under
                      ~5 minutes).
                    </p>
                  ) : null}
                </div>
              ) : (
                <div className="mb-6 space-y-3">
                  <Label
                    htmlFor="tavus-audio"
                    className="text-sm font-medium text-white/80"
                  >
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
                    <Label className="text-sm font-medium text-white/80">
                      Video name (optional)
                    </Label>
                    <Input
                      value={advVideoName}
                      onChange={(e) => setAdvVideoName(e.target.value)}
                      className="border-white/20 bg-white/10 text-white"
                    />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-sm font-medium text-white/80">
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
                    <Label className="text-sm font-medium text-white/80">
                      Watermark image URL
                    </Label>
                    <Input
                      value={advWatermarkUrl}
                      onChange={(e) => setAdvWatermarkUrl(e.target.value)}
                      placeholder="https://…png or jpg"
                      className="border-white/20 bg-white/10 text-white"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-white/80">
                      Website background URL
                    </Label>
                    <Input
                      value={advBackgroundUrl}
                      onChange={(e) => setAdvBackgroundUrl(e.target.value)}
                      className="border-white/20 bg-white/10 text-white"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-white/80">
                      Video background source URL
                    </Label>
                    <Input
                      value={advBackgroundSourceUrl}
                      onChange={(e) =>
                        setAdvBackgroundSourceUrl(e.target.value)
                      }
                      className="border-white/20 bg-white/10 text-white"
                    />
                  </div>
                  <div className="grid gap-3 sm:grid-cols-2">
                    <div className="space-y-2">
                      <Label className="text-xs text-white/80">
                        Start with wave
                      </Label>
                      <Select
                        value={triBoolSelectValue(advStartWithWave)}
                        onValueChange={(v) =>
                          setAdvStartWithWave(parseTriBoolSelect(v))
                        }
                      >
                        <SelectTrigger className="w-full text-white">
                          <SelectValue placeholder="Default" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value={SELECT_DEFAULT}>Default</SelectItem>
                          <SelectItem value="true">true</SelectItem>
                          <SelectItem value="false">false</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label className="text-xs text-white/80">
                        Background scroll
                      </Label>
                      <Select
                        value={triBoolSelectValue(advBgScroll)}
                        onValueChange={(v) =>
                          setAdvBgScroll(parseTriBoolSelect(v))
                        }
                      >
                        <SelectTrigger className="w-full text-white">
                          <SelectValue placeholder="Default" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value={SELECT_DEFAULT}>Default</SelectItem>
                          <SelectItem value="true">true</SelectItem>
                          <SelectItem value="false">false</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label className="text-xs text-white/80">Scroll type</Label>
                      <Select
                        value={advBgScrollType === "" ? SELECT_DEFAULT : advBgScrollType}
                        onValueChange={(v) =>
                          setAdvBgScrollType(
                            v === SELECT_DEFAULT
                              ? ""
                              : (v as "human" | "smooth"),
                          )
                        }
                      >
                        <SelectTrigger className="w-full text-white">
                          <SelectValue placeholder="Default" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value={SELECT_DEFAULT}>Default</SelectItem>
                          <SelectItem value="human">human</SelectItem>
                          <SelectItem value="smooth">smooth</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label className="text-xs text-white/80">Scroll depth</Label>
                      <Select
                        value={
                          advBgScrollDepth === "" ? SELECT_DEFAULT : advBgScrollDepth
                        }
                        onValueChange={(v) =>
                          setAdvBgScrollDepth(
                            v === SELECT_DEFAULT
                              ? ""
                              : (v as "middle" | "bottom"),
                          )
                        }
                      >
                        <SelectTrigger className="w-full text-white">
                          <SelectValue placeholder="Default" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value={SELECT_DEFAULT}>Default</SelectItem>
                          <SelectItem value="middle">middle</SelectItem>
                          <SelectItem value="bottom">bottom</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label className="text-xs text-white/80">Scroll return</Label>
                      <Select
                        value={
                          advBgScrollReturn === ""
                            ? SELECT_DEFAULT
                            : advBgScrollReturn
                        }
                        onValueChange={(v) =>
                          setAdvBgScrollReturn(
                            v === SELECT_DEFAULT ? "" : (v as "return" | "halt"),
                          )
                        }
                      >
                        <SelectTrigger className="w-full text-white">
                          <SelectValue placeholder="Default" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value={SELECT_DEFAULT}>Default</SelectItem>
                          <SelectItem value="return">return</SelectItem>
                          <SelectItem value="halt">halt</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </CollapsibleContent>
              </Collapsible>

              <div className="mt-6">
                <Button
                  type="button"
                  onClick={() => void handleGenerate()}
                  disabled={
                    isSubmitting ||
                    isLoadingGeneration ||
                    creditBlocked ||
                    generateDisabledReason !== null
                  }
                  className="w-full bg-gradient-to-r from-[#E9476E] to-[#3B5DA8] text-white hover:from-[#D63E5F] hover:to-[#2A4A8F] disabled:cursor-not-allowed disabled:opacity-50"
                  size="lg"
                >
                  {isSubmitting || isLoadingGeneration
                    ? "Generating..."
                    : generateDisabledReason ?? "Generate Video"}
                </Button>
                {shouldShowPlansLink ? (
                  <p className="mt-3 text-sm text-white/80">
                    Generation requires an active plan with enough credits.{" "}
                    <Link
                      href="/our-plans"
                      className="font-medium text-white underline"
                    >
                      View plans
                    </Link>
                  </p>
                ) : null}
                {generateDisabledReason &&
                creditBalance &&
                !shouldShowPlansLink ? (
                  <p className="mt-3 text-xs text-amber-200/90">
                    {generateDisabledReason}
                  </p>
                ) : null}
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <div className="rounded-xl bg-white/10 p-6 shadow-[0_0_0_1px_rgba(255,255,255,0.2)] backdrop-blur-sm">
              <h3 className="text-lg font-semibold text-white">Credit Balance</h3>
              <div className="mt-4 space-y-2 text-sm text-white/80">
                <div className="flex items-center justify-between">
                  <span>Available</span>
                  <span className="font-semibold text-white">
                    {creditBalance?.available_credits ?? 0}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Reserved</span>
                  <span className="font-semibold text-white">
                    {creditBalance?.reserved_credits ?? 0}
                  </span>
                </div>
                <div className="flex items-center justify-between border-t border-white/20 pt-2">
                  <span>Status</span>
                  <span className="font-semibold text-white">
                    {creditBalance?.has_active_subscription
                      ? "Active Subscription"
                      : "No Active Subscription"}
                  </span>
                </div>
              </div>
            </div>

            <div className="rounded-xl bg-white/10 p-6 shadow-[0_0_0_1px_rgba(255,255,255,0.2)] backdrop-blur-sm">
              <h3 className="text-lg font-semibold text-white">Cost Estimate</h3>
              <div className="mt-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-white/80">Model cost (flat job)</span>
                  <span className="text-sm font-medium text-white">
                    ${estimatedCost.toFixed(2)}
                  </span>
                </div>
                <div className="mt-2 flex items-center justify-between border-t border-white/20 pt-2">
                  <span className="text-base font-semibold text-white">Total</span>
                  <span className="text-xl font-bold text-white">
                    ${estimatedCost.toFixed(2)}
                  </span>
                </div>
                <div className="mt-2 text-xs text-white/60">
                  {estimatedCredits} credits estimated
                </div>
              </div>
            </div>

            <div className="rounded-xl bg-white/10 p-6 shadow-[0_0_0_1px_rgba(255,255,255,0.2)] backdrop-blur-sm">
              <h3 className="text-lg font-semibold text-white">Quick Actions</h3>
              <div className="mt-4 space-y-3">
                <button
                  type="button"
                  className="w-full rounded-lg bg-white/10 px-4 py-2 text-sm font-medium text-white backdrop-blur-sm transition-colors hover:bg-white/20"
                >
                  View History
                </button>
              </div>
            </div>
          </div>

          {showResultsPanel ? (
            <div ref={resultsSectionRef} className="mt-12 lg:col-span-3">
              <div className="mb-6 flex items-center justify-between">
                <h2 className="text-2xl font-bold tracking-tight text-white">
                  Generated Video
                </h2>
                <div className="flex items-center space-x-2">
                  <span className="inline-flex items-center rounded-full bg-white/10 px-3 py-1 text-sm font-medium text-white backdrop-blur-sm">
                    {resultsStatusBadge()}
                  </span>
                </div>
              </div>
              <GlowingCard aspectRatio="16:9" className="p-6">
                <div className="space-y-6">
                  {isLoadingGeneration ? (
                    <div className="flex items-center justify-center p-8">
                      <div className="flex items-center space-x-3 text-white/80">
                        <div className="h-8 w-8 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                        <span className="text-lg font-medium">
                          {status === "queued" && "Queued..."}
                          {status === "generating" && "Generating video..."}
                        </span>
                      </div>
                    </div>
                  ) : null}

                  {status === "error" ? (
                    <div className="space-y-2">
                      <p className="text-sm font-medium text-red-200">
                        Generation failed
                      </p>
                      <p className="text-sm text-red-200/90 whitespace-pre-wrap">
                        {error}
                      </p>
                      {statusDetails ? (
                        <p className="text-xs text-white/60">{statusDetails}</p>
                      ) : null}
                    </div>
                  ) : null}

                  {showResult ? (
                    <div className="space-y-3">
                      {playbackUrl ? (
                        <video
                          key={playbackUrl}
                          src={playbackUrl}
                          controls
                          playsInline
                          className="w-full rounded-lg border border-white/20 bg-black object-contain"
                          preload="metadata"
                        >
                          Your browser does not support the video tag.
                        </video>
                      ) : hostedUrl ? (
                        <div className="space-y-2">
                          <p className="text-sm text-white/70">
                            No direct MP4/HLS URL yet (e.g. fast mode). Open the
                            hosted viewer or try again in a moment.
                          </p>
                          <iframe
                            title="Tavus video"
                            src={hostedUrl}
                            className="aspect-video w-full max-w-full rounded-lg border-0 bg-black"
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

                  {status === "ready" &&
                  !playbackUrl &&
                  !hostedUrl &&
                  !isLoadingGeneration ? (
                    <p className="text-sm text-white/70">
                      Waiting for playback or hosted URL…
                    </p>
                  ) : null}

                  {videoId ? (
                    <div className="grid grid-cols-1 gap-3 border-t border-white/20 pt-4 text-sm text-white/80 sm:grid-cols-2">
                      <div className="rounded-lg bg-white/10 p-4">
                        <div className="text-xs text-white/60">Video ID</div>
                        <div className="font-mono text-sm break-all text-white">
                          {videoId}
                        </div>
                      </div>
                      {status ? (
                        <div className="rounded-lg bg-white/10 p-4">
                          <div className="text-xs text-white/60">Status</div>
                          <div className="text-sm font-semibold text-white">
                            {status}
                          </div>
                        </div>
                      ) : null}
                    </div>
                  ) : null}
                </div>
              </GlowingCard>
            </div>
          ) : null}

          {showGlobalErrorCard ? (
            <div className="mt-8 lg:col-span-3">
              <div className="rounded-xl border border-red-500/20 bg-red-500/10 p-4 backdrop-blur-sm">
                <div className="flex items-center gap-2">
                  <svg
                    className="h-5 w-5 text-red-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    aria-hidden
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                  <h3 className="font-medium text-red-300">Request failed</h3>
                </div>
                <p className="mt-1 text-sm whitespace-pre-wrap text-red-200">
                  {error}
                </p>
              </div>
            </div>
          ) : null}
        </div>
      )}
    </main>
  );
}
