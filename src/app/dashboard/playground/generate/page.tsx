"use client";

import { useEffect, useState } from "react";
import { falClient } from "~/lib/falClient";
import useGenerateStore from "~/lib/stores/useGenerateStore";
import type { Result, Status, VideoGenerationInput } from "~/lib/types";
import PromptSection from "./_components/PromptSection";
import ResultSection from "./_components/ResultSection";

export default function GeneratePage() {
  const { status, setStatus, model, duration, aspect_ratio } =
    useGenerateStore();
  const [result, setResult] = useState<null | Result>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  useEffect(() => {
    setIsLoading(status === "IN_QUEUE" || status === "IN_PROGRESS");
  }, [status]);

  // Configure fal client once on component mount
  useEffect(() => {
    falClient.config({
      proxyUrl: "/api/fal/proxy",
    });
  }, []);

  async function handleSubmit(prompt: string, _count = 1) {
    setStatus("IN_QUEUE");

    // Build input based on selected model and store settings
    const input: VideoGenerationInput = {
      prompt,
      duration: duration ? (duration.toString() as "5" | "6" | "10") : "5",
      aspect_ratio: aspect_ratio ?? "16:9",
    };

    // Add model-specific parameters
    if (model.includes("kling")) {
      // Kling models support negative_prompt and cfg_scale
      input.negative_prompt = "blur, distort, and low quality";
      input.cfg_scale = 0.5;
    } else if (model.includes("minimax")) {
      // Minimax models support prompt_optimizer
      input.prompt_optimizer = true;
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
    <main className="flex flex-col gap-4 pt-4 pb-16">
      <h1 className="text-2xl font-semibold tracking-tight">Generate Video</h1>
      <PromptSection loading={isLoading} handleSubmit={handleSubmit} />
      {status && result && (
        <div className="mt-4">
          <h2 className="mb-4 text-2xl font-semibold tracking-tight">
            Results
          </h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <ResultSection status={status} result={result} />
          </div>
        </div>
      )}
    </main>
  );
}
