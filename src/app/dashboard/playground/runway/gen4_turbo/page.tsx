"use client";

import { useAuth } from "@clerk/nextjs";
import { Separator } from "@radix-ui/react-separator";
import Link from "next/link";
import { Suspense, useEffect, useRef, useState } from "react";
import GlowingCard from "~/components/mvpblocks/glow-card";
import { Button } from "~/components/ui/button";
import { FileUpload } from "~/components/ui/file-upload";
import { Label } from "~/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";
import { Textarea } from "~/components/ui/textarea";
import { useCreditBalance } from "~/hooks/use-credit-balance";
import { calculateCreditsForDurationSeconds } from "~/lib/constants/credits";
import { useTrackedRunwayClient } from "~/lib/trackedClients";
import type { RunwayGen4TurboStatus } from "~/lib/types";

function RunwayPageContent() {
  const { userId } = useAuth();
  const { generate } = useTrackedRunwayClient();
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [promptText, setPromptText] = useState("");
  const [ratio, setRatio] = useState<"16:9" | "9:16" | "1:1">("16:9");
  const [duration, setDuration] = useState<5 | 10>(5);
  const [status, setStatus] = useState<RunwayGen4TurboStatus | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [videoData, setVideoData] = useState<{
    video: {
      url: string;
      file_size: number;
      duration_ms: number;
      content_type: string;
      file_name: string;
    };
    metadata?: {
      model_id: string;
      generation_id: string;
      generation_time_ms: number;
      credits_used: number;
    };
  } | null>(null);
  const [estimatedCost, setEstimatedCost] = useState(0);
  const [estimatedCredits, setEstimatedCredits] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const creditBalance = useCreditBalance();

  // Ref for the results section to enable auto-scrolling
  const resultsSectionRef = useRef<HTMLDivElement>(null);

  // Calculate estimated cost based on duration (5 credits per second)
  useEffect(() => {
    const credits = calculateCreditsForDurationSeconds("runway/gen4_turbo", duration);
    setEstimatedCredits(credits);
    setEstimatedCost(credits * 0.01);
  }, [duration]);

  useEffect(() => {
    setIsLoading(
      status === "PREPARING" ||
        status === "GENERATING" ||
        status === "PROCESSING",
    );
  }, [status]);

  // Auto-scroll to results section when it appears
  useEffect(() => {
    if (status && (videoData || isLoading) && resultsSectionRef.current) {
      // Small delay to ensure the DOM has updated
      setTimeout(() => {
        resultsSectionRef.current?.scrollIntoView({
          behavior: "smooth",
          block: "start",
        });
      }, 100);
    }
  }, [status, videoData, isLoading]);

  // Format milliseconds to human readable time
  function formatTime(ms: number): string {
    if (ms < 1000) {
      return `${ms}ms`;
    } else if (ms < 60000) {
      return `${(ms / 1000).toFixed(1)}s`;
    } else {
      const minutes = Math.floor(ms / 60000);
      const seconds = ((ms % 60000) / 1000).toFixed(1);
      return `${minutes}m ${seconds}s`;
    }
  }

  // Handle image file selection
  function handleImageSelect(file: File | null) {
    setImageFile(file);
  }

  // Convert image file to base64
  function fileToBase64(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = () => reject(new Error("Failed to read file"));
    });
  }

  async function handleSubmit() {
    if (!imageFile) {
      alert("Please select an image");
      return;
    }

    if (!userId) {
      return;
    }

    if (!creditBalance?.has_active_subscription) {
      return;
    }

    if (creditBalance.available_credits < estimatedCredits) {
      return;
    }

    setStatus("PREPARING");
    setVideoData(null);
    setError(null);

    try {
      // Convert image to base64
      const imageBase64 = await fileToBase64(imageFile);

      const result = await generate({
        input: {
          promptImage: imageBase64,
          promptText: promptText.trim() || undefined,
          ratio: ratio,
          duration: duration,
        },
        userId: userId ?? undefined,
        onProgress: (progress) => {
          console.log("Runway Status:", progress.status);
          setStatus(progress.status as RunwayGen4TurboStatus);

          if (progress.status === "COMPLETED") {
            setStatus("COMPLETED");
          } else if (progress.status === "FAILED") {
            setStatus("FAILED");
          }
        },
      });

      if (result.data) {
        setVideoData(result.data);
        setStatus("COMPLETED");
        console.log("🎬 Generation completed:", result.data);
      } else {
        throw new Error("No video data received");
      }
    } catch (error) {
      console.error("Generation failed:", error);
      setError(
        error instanceof Error ? error.message : "Unknown error occurred",
      );
      setStatus("FAILED");
    }
  }

  const generateDisabledReason = !userId
    ? "Sign In Required"
    : !creditBalance
      ? "Loading Credits..."
      : !creditBalance.has_active_subscription
        ? "Active Subscription Required"
        : creditBalance.available_credits < estimatedCredits
          ? "Insufficient Credits"
          : null;
  const shouldShowPlansLink =
    generateDisabledReason === "Insufficient Credits" ||
    generateDisabledReason === "Active Subscription Required";

  return (
    <main className="min-h-screen">
      {/* Header Section */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-white">
            Generate Video
          </h1>
          <p className="mt-2 text-sm text-white/80">
            Transform images into dynamic videos with AI-powered generation
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
              <span className="text-white">Runway gen4_turbo</span>
            </div>
          </div>
        </div>

        {isLoading && (
          <div className="flex items-center space-x-2 rounded-full bg-white/10 px-4 py-2 backdrop-blur-sm">
            <div className="h-3 w-3 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
            <span className="text-sm font-medium text-white">
              {status === "PREPARING" && "Preparing..."}
              {status === "GENERATING" && "Generating video..."}
              {status === "PROCESSING" && "Processing..."}
            </span>
          </div>
        )}
      </div>

      <Separator className="my-8 h-[1px] w-full bg-white" />

      {/* Main Content */}
      <div className="grid gap-8 lg:grid-cols-3">
        {/* Left Column: Form */}
        <div className="lg:col-span-2">
          <div className="rounded-xl bg-white/10 p-6 shadow-[0_0_0_1px_rgba(255,255,255,0.2)] backdrop-blur-sm">
            <h2 className="mb-4 text-lg font-semibold text-white">
              Video Generation
            </h2>

            {/* Image Upload */}
            <div className="mb-6 space-y-3">
              <Label className="text-sm font-medium text-white/80">
                Input Image
              </Label>
              <div className="space-y-2">
                <FileUpload
                  value={imageFile}
                  onChange={handleImageSelect}
                  accept="image/*"
                  maxSize={10 * 1024 * 1024} // 10MB
                  placeholder="Click to upload image or drag and drop"
                  className="w-full"
                />
                <div className="text-xs text-white/60">
                  Supported formats: JPEG, PNG, WebP (Max 10MB)
                </div>
              </div>
            </div>

            {/* Text Prompt */}
            <div className="mb-6 space-y-3">
              <Label className="text-sm font-medium text-white/80">
                Text Prompt (Optional)
              </Label>
              <Textarea
                value={promptText}
                onChange={(e) => setPromptText(e.target.value)}
                placeholder="Describe the motion or transformation you want..."
                className="min-h-[80px] w-full text-white placeholder-white/60"
                maxLength={1000}
              />
              <div className="text-right text-sm text-white/60">
                {promptText.length}/1000 characters
              </div>
            </div>

            {/* Parameters */}
            <div className="mb-6 grid grid-cols-2 gap-4">
              <div className="space-y-3">
                <Label className="text-sm font-medium text-white/80">
                  Aspect Ratio
                </Label>
                <Select
                  value={ratio}
                  onValueChange={(value) =>
                    setRatio(value as "16:9" | "9:16" | "1:1")
                  }
                >
                  <SelectTrigger className="w-full text-white">
                    <SelectValue placeholder="Select aspect ratio" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="16:9">16:9 (Landscape)</SelectItem>
                    <SelectItem value="9:16">9:16 (Portrait)</SelectItem>
                    <SelectItem value="1:1">1:1 (Square)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-3">
                <Label className="text-sm font-medium text-white/80">
                  Duration
                </Label>
                <Select
                  value={duration.toString()}
                  onValueChange={(value) =>
                    setDuration(Number(value) as 5 | 10)
                  }
                >
                  <SelectTrigger className="w-full text-white">
                    <SelectValue placeholder="Select duration" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="5">5 seconds</SelectItem>
                    <SelectItem value="10">10 seconds</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Generate Button */}
            <div className="mt-6">
              <Button
                onClick={handleSubmit}
                disabled={isLoading || !imageFile || generateDisabledReason !== null}
                className="w-full bg-gradient-to-r from-[#E9476E] to-[#3B5DA8] text-white hover:from-[#D63E5F] hover:to-[#2A4A8F] disabled:cursor-not-allowed disabled:opacity-50"
                size="lg"
              >
                {isLoading
                  ? "Generating..."
                  : generateDisabledReason ?? "Generate Video"}
              </Button>
              {shouldShowPlansLink && (
                <p className="mt-3 text-sm text-white/80">
                  Generation requires an active plan with enough credits.{" "}
                  <Link
                    href="/our-plans"
                    className="font-medium text-white underline"
                  >
                    View plans
                  </Link>
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Right Column: Cost Estimate */}
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

          {/* Cost Card */}
          <div className="rounded-xl bg-white/10 p-6 shadow-[0_0_0_1px_rgba(255,255,255,0.2)] backdrop-blur-sm">
            <h3 className="text-lg font-semibold text-white">Cost Estimate</h3>
            <div className="mt-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-white/80">Model Cost</span>
                <span className="text-sm font-medium text-white">
                  ${estimatedCost.toFixed(2)}
                </span>
              </div>
              <div className="mt-2 flex items-center justify-between border-t border-white/20 pt-2">
                <span className="text-base font-semibold text-white">
                  Total
                </span>
                <span className="text-xl font-bold text-white">
                  ${estimatedCost.toFixed(2)}
                </span>
              </div>
              <div className="mt-2 text-xs text-white/60">
                {estimatedCredits} credits estimated
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="rounded-xl bg-white/10 p-6 shadow-[0_0_0_1px_rgba(255,255,255,0.2)] backdrop-blur-sm">
            <h3 className="text-lg font-semibold text-white">Quick Actions</h3>
            <div className="mt-4 space-y-3">
              <button className="w-full rounded-lg bg-white/10 px-4 py-2 text-sm font-medium text-white backdrop-blur-sm transition-colors hover:bg-white/20">
                View History
              </button>
            </div>
          </div>
        </div>

        {/* Results Section */}
        {status && (videoData ?? isLoading) && (
          <div ref={resultsSectionRef} className="mt-12 lg:col-span-3">
            <div className="mb-6 flex items-center justify-between">
              <h2 className="text-2xl font-bold tracking-tight text-white">
                Generated Video
              </h2>
              <div className="flex items-center space-x-2">
                <span className="inline-flex items-center rounded-full bg-white/10 px-3 py-1 text-sm font-medium text-white backdrop-blur-sm">
                  {status === "COMPLETED" ? "✓ Complete" : status}
                </span>
              </div>
            </div>
            <GlowingCard aspectRatio={ratio} className="p-6">
              <div className="space-y-6">
                {/* Video Player */}
                <div className="space-y-3">
                  {videoData ? (
                    <video
                      src={videoData.video.url}
                      controls
                      className="w-full rounded-lg border border-white/20"
                      preload="metadata"
                    >
                      Your browser does not support the video tag.
                    </video>
                  ) : (
                    <div className="flex items-center justify-center p-8">
                      <div className="flex items-center space-x-3 text-white/80">
                        <div className="h-8 w-8 animate-spin rounded-full border-2 border-white/30 border-t-white"></div>
                        <span className="text-lg font-medium">
                          {status === "PREPARING" && "Preparing generation..."}
                          {status === "GENERATING" && "Generating video..."}
                          {status === "PROCESSING" && "Processing video..."}
                        </span>
                      </div>
                    </div>
                  )}
                </div>

                {/* Video Metadata */}
                {videoData && (
                  <>
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                      <div className="rounded-lg bg-white/10 p-4">
                        <div className="text-sm text-white/60">File Size</div>
                        <div className="text-lg font-semibold text-white">
                          {(videoData.video.file_size / 1024 / 1024).toFixed(2)}{" "}
                          MB
                        </div>
                      </div>
                      <div className="rounded-lg bg-white/10 p-4">
                        <div className="text-sm text-white/60">Duration</div>
                        <div className="text-lg font-semibold text-white">
                          {formatTime(videoData.video.duration_ms)}
                        </div>
                      </div>
                      <div className="rounded-lg bg-white/10 p-4">
                        <div className="text-sm text-white/60">
                          Generation Time
                        </div>
                        <div className="text-lg font-semibold text-white">
                          {videoData.metadata
                            ? formatTime(videoData.metadata.generation_time_ms)
                            : "N/A"}
                        </div>
                      </div>
                      <div className="rounded-lg bg-white/10 p-4">
                        <div className="text-sm text-white/60">
                          Credits Used
                        </div>
                        <div className="text-lg font-semibold text-white">
                          {videoData.metadata?.credits_used ?? "N/A"}
                        </div>
                      </div>
                    </div>
                  </>
                )}
              </div>
            </GlowingCard>
          </div>
        )}

        {/* Error Display */}
        {error && (
          <div className="mt-8 lg:col-span-3">
            <div className="rounded-xl border border-red-500/20 bg-red-500/10 p-4 backdrop-blur-sm">
              <div className="flex items-center gap-2">
                <svg
                  className="h-5 w-5 text-red-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                <h3 className="font-medium text-red-300">Generation Failed</h3>
              </div>
              <p className="mt-1 text-sm text-red-200">{error}</p>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}

export default function RunwayGen4TurboPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <RunwayPageContent />
    </Suspense>
  );
}
