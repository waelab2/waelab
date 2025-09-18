"use client";

import { useAuth } from "@clerk/nextjs";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense, useEffect, useRef, useState } from "react";
import GlowingCard from "~/components/mvpblocks/glow-card";
import { Separator } from "~/components/ui/separator";
import { models, type Model } from "~/lib/constants";
import useGenerateStore from "~/lib/stores/useGenerateStore";
import { useTrackedFalClient } from "~/lib/trackedClients";
import type { Result, Status, VideoGenerationInput } from "~/lib/types";
import PromptSection from "./_components/PromptSection";
import ResultSection from "./_components/ResultSection";

function GeneratePageContent() {
  const searchParams = useSearchParams();
  const { userId } = useAuth();
  const { subscribe } = useTrackedFalClient();
  const {
    status,
    setStatus,
    model,
    setModel,
    duration,
    aspect_ratio,
    negative_prompt,
    cfg_scale,
    prompt_optimizer,
  } = useGenerateStore();

  const [result, setResult] = useState<null | Result>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [estimatedCost, setEstimatedCost] = useState(0);
  const [videoData, setVideoData] = useState<{
    file_name: string;
    file_size: number;
    content_type: string;
  } | null>(null);

  // Ref for the results section to enable auto-scrolling
  const resultsSectionRef = useRef<HTMLDivElement>(null);

  // Handle model selection from URL parameter
  useEffect(() => {
    const modelFromUrl = searchParams.get("model");
    if (modelFromUrl && models.some((m) => m.id === modelFromUrl)) {
      setModel(modelFromUrl as Model["id"]);
    }
  }, [searchParams, setModel]);

  // Calculate estimated cost based on selected model and parameters
  useEffect(() => {
    const modelPricePerSecond = models.find(
      (m) => m.id === model,
    )?.price_per_second;

    if (!modelPricePerSecond) {
      setEstimatedCost(0);
    } else {
      const videoCost = modelPricePerSecond * (duration ?? 5);
      setEstimatedCost(videoCost);
    }
  }, [model, duration]);

  useEffect(() => {
    setIsLoading(status === "IN_QUEUE" || status === "IN_PROGRESS");
  }, [status]);

  // Load video data when result is completed
  useEffect(() => {
    if (status === "COMPLETED" && result) {
      const loadVideoData = async () => {
        try {
          const resolvedResult = await result;
          setVideoData(resolvedResult.data.video);
        } catch (error) {
          console.error("Error loading video data:", error);
        }
      };
      void loadVideoData();
    }
  }, [status, result]);

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

  // Configure fal client once on component mount
  useEffect(() => {
    // Note: falClient configuration is now handled by the tracked client
    // The tracked client uses the same falClient internally
  }, []);

  async function handleSubmit(prompt: string) {
    setStatus("IN_QUEUE");

    // Build input based on what the model actually supports
    const input: VideoGenerationInput = {
      prompt,
    };

    // Only add parameters that the model supports
    if (duration !== undefined) {
      // Convert number to the expected string literal type
      const durationStr = duration.toString() as "5" | "6" | "10";
      input.duration = durationStr;
    }

    if (aspect_ratio) {
      input.aspect_ratio = aspect_ratio;
    }

    if (negative_prompt) {
      input.negative_prompt = negative_prompt;
    }

    if (cfg_scale !== undefined) {
      input.cfg_scale = cfg_scale;
    }

    if (prompt_optimizer !== undefined) {
      input.prompt_optimizer = prompt_optimizer;
    }

    console.log(`🎬 Starting video generation with model: ${model}`);
    console.log(`🎬 Input parameters:`, input);

    setResult(
      subscribe(model, {
        input,
        pollInterval: 5000,
        logs: true,
        userId: userId ?? undefined,
        onQueueUpdate(update) {
          setStatus(update.status as Status);
        },
      }),
    );
  }

  return (
    <main className="min-h-screen">
      {/* Header Section */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-white">
            Generate Video
          </h1>
          <p className="mt-2 text-sm text-white/80">
            Create stunning videos with AI-powered generation
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
              <span className="text-white">
                {models.find((m) => m.id === model)?.name ?? model}
              </span>
            </div>
          </div>
        </div>
        {isLoading && (
          <div className="flex items-center space-x-2 rounded-full bg-white/10 px-4 py-2 backdrop-blur-sm">
            <div className="h-3 w-3 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
            <span className="text-sm font-medium text-white">
              {status === "IN_QUEUE" ? "Queued..." : "Generating..."}
            </span>
          </div>
        )}
      </div>

      <Separator className="my-8" />

      {/* Main Content */}
      <div className="grid gap-8 lg:grid-cols-3">
        {/* Left Column: Form */}
        <div className="lg:col-span-2">
          <PromptSection loading={isLoading} handleSubmit={handleSubmit} />
        </div>

        {/* Right Column: Cost & Actions */}
        <div className="space-y-6">
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
        {status && result && (
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
            <GlowingCard aspectRatio="16:9" className="p-6">
              <div className="space-y-6">
                <ResultSection
                  status={status}
                  result={result}
                  showMetadata={false}
                />

                {/* Video Metadata */}
                {videoData && (
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    <div className="rounded-lg bg-white/10 p-4">
                      <div className="text-sm text-white/60">File Name</div>
                      <div className="text-lg font-semibold text-white">
                        {videoData.file_name}
                      </div>
                    </div>
                    <div className="rounded-lg bg-white/10 p-4">
                      <div className="text-sm text-white/60">File Size</div>
                      <div className="text-lg font-semibold text-white">
                        {(videoData.file_size / 1024 / 1024).toFixed(2)} MB
                      </div>
                    </div>
                    <div className="rounded-lg bg-white/10 p-4">
                      <div className="text-sm text-white/60">Content Type</div>
                      <div className="text-lg font-semibold text-white">
                        {videoData.content_type}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </GlowingCard>
          </div>
        )}
      </div>
    </main>
  );
}

export default function GeneratePage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-transparent p-8 text-white">
          Loading...
        </div>
      }
    >
      <GeneratePageContent />
    </Suspense>
  );
}
