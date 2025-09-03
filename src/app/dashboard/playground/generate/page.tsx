"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";
import { models, type Model } from "~/lib/constants";
import { falClient } from "~/lib/falClient";
import useGenerateStore from "~/lib/stores/useGenerateStore";
import type { Result, Status, VideoGenerationInput } from "~/lib/types";
import PromptSection from "./_components/PromptSection";
import ResultSection from "./_components/ResultSection";

function GeneratePageContent() {
  const searchParams = useSearchParams();
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

  // Configure fal client once on component mount
  useEffect(() => {
    falClient.config({
      proxyUrl: "/api/fal/proxy",
    });
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
      falClient.subscribe(model, {
        input,
        pollInterval: 5000,
        logs: true,
        onQueueUpdate(update) {
          setStatus(update.status as Status);
        },
      }),
    );
  }

  return (
    <main className="min-h-screen">
      {/* Breadcrumb Navigation */}
      <div className="border-b bg-gray-50/50">
        <div className="mx-auto max-w-7xl px-4 py-3 sm:px-6">
          <nav className="flex items-center space-x-2 text-sm">
            <Link
              href="/dashboard/playground"
              className="text-gray-500 transition-colors hover:text-gray-700"
            >
              Playground
            </Link>
            <span className="text-gray-400">/</span>
            <span className="font-medium text-gray-900">Generate Video</span>
          </nav>
        </div>
      </div>

      {/* Header Section */}
      <div className="border-b backdrop-blur-sm">
        <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold tracking-tight text-gray-900">
                Generate Video
              </h1>
              <p className="mt-2 text-sm text-gray-600">
                Create stunning videos with AI-powered generation
              </p>
              <div className="mt-3 space-y-2">
                <Link
                  href="/dashboard/playground"
                  className="inline-flex items-center gap-2 text-sm text-blue-600 transition-colors hover:text-blue-700"
                >
                  ← Back to Models
                </Link>
                <div className="text-sm text-gray-600">
                  <span className="font-medium">Selected Model:</span>{" "}
                  {models.find((m) => m.id === model)?.name ?? model}
                </div>
              </div>
            </div>
            {isLoading && (
              <div className="flex items-center space-x-2 rounded-full bg-blue-50 px-4 py-2">
                <div className="h-3 w-3 animate-spin rounded-full border-2 border-blue-600 border-t-transparent"></div>
                <span className="text-sm font-medium text-blue-700">
                  {status === "IN_QUEUE" ? "Queued..." : "Generating..."}
                </span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
        <div className="grid gap-8 lg:grid-cols-3">
          {/* Left Column: Form */}
          <div className="lg:col-span-2">
            <PromptSection loading={isLoading} handleSubmit={handleSubmit} />
          </div>

          {/* Right Column: Cost & Actions */}
          <div className="space-y-6">
            {/* Cost Card */}
            <div className="rounded-xl bg-white p-6 shadow-sm ring-1 ring-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">
                Cost Estimate
              </h3>
              <div className="mt-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Model Cost</span>
                  <span className="text-sm font-medium text-gray-900">
                    ${estimatedCost.toFixed(2)}
                  </span>
                </div>
                <div className="mt-2 flex items-center justify-between border-t pt-2">
                  <span className="text-base font-semibold text-gray-900">
                    Total
                  </span>
                  <span className="text-xl font-bold text-blue-600">
                    ${estimatedCost.toFixed(2)}
                  </span>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="rounded-xl bg-white p-6 shadow-sm ring-1 ring-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">
                Quick Actions
              </h3>
              <div className="mt-4 space-y-3">
                <button className="w-full rounded-lg bg-gray-100 px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-200">
                  Save as Template
                </button>
                <button className="w-full rounded-lg bg-gray-100 px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-200">
                  View History
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Results Section */}
        {status && result && (
          <div className="mt-12">
            <div className="mb-6 flex items-center justify-between">
              <h2 className="text-2xl font-bold tracking-tight text-gray-900">
                Generated Video
              </h2>
              <div className="flex items-center space-x-2">
                <span className="inline-flex items-center rounded-full bg-green-100 px-3 py-1 text-sm font-medium text-green-800">
                  {status === "COMPLETED" ? "✓ Complete" : status}
                </span>
              </div>
            </div>
            <div className="rounded-xl bg-white p-6 shadow-sm ring-1 ring-gray-200">
              <ResultSection status={status} result={result} />
            </div>
          </div>
        )}
      </div>
    </main>
  );
}

export default function GeneratePage() {
  return (
    <Suspense
      fallback={<div className="min-h-screen bg-white p-8">Loading...</div>}
    >
      <GeneratePageContent />
    </Suspense>
  );
}
