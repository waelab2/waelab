"use client";

import { fal } from "@fal-ai/client";
import { useEffect, useState } from "react";
import useGenerateStore from "~/lib/stores/useGenerateStore";
import type { Result } from "~/lib/types";
import PromptSection from "./_components/PromptSection";
import ResultSection from "./_components/ResultSection";

export default function GeneratePage() {
  const { status, setStatus } = useGenerateStore();
  const [result, setResult] = useState<null | Result>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  useEffect(() => {
    setIsLoading(status === "IN_QUEUE" || status === "IN_PROGRESS");
  }, [status]);

  fal.config({
    proxyUrl: "/api/fal/proxy",
  });

  async function handleSubmit(prompt: string) {
    setStatus("IN_QUEUE");
    setResult(
      fal.subscribe("fal-ai/flux/dev", {
        input: {
          prompt,
          image_size: "landscape_16_9",
        },
        pollInterval: 5000,
        logs: true,
        onQueueUpdate(update) {
          setStatus(update.status);
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
