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
    if (status === "IN_QUEUE" || status === "IN_PROGRESS") {
      setIsLoading(true);
    } else {
      setIsLoading(false);
    }
  }, [status]);

  fal.config({
    proxyUrl: "/api/fal/proxy",
  });

  async function handleSubmit(prompt: string) {
    setResult(
      fal.subscribe("fal-ai/flux/dev", {
        input: {
          prompt,
          image_size: "landscape_16_9",
        },
        pollInterval: 5000,
        logs: true,
        onQueueUpdate(update) {
          console.log("queue update", update);
          setStatus(update.status);
        },
      }),
    );
  }

  return (
    <main className="flex min-h-screen flex-row items-center justify-center gap-16 bg-gradient-to-b from-[#2e026d] to-[#15162c] p-12 text-white transition-all duration-300">
      <PromptSection loading={isLoading} handleSubmit={handleSubmit} />

      {/* Result Section */}
      {status && result && (
        // {status && (
        <div className="w-full">
          {/* <Separator className="my-4" /> */}
          <ResultSection status={status} result={result} />
        </div>
      )}
    </main>
  );
}
