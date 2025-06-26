"use client";

import { fal } from "@fal-ai/client";
import { useEffect, useState } from "react";
import { Separator } from "~/components/ui/separator";
import type { Result, Status } from "~/lib/types";
import PromptSection from "./_components/PromptSection";
import ResultSection from "./_components/ResultSection";

export default function GeneratePage() {
  const [status, setStatus] = useState<null | Status>(null);
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
          image_size: "square_hd",
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
    <div className="flex min-h-screen flex-col items-center justify-center bg-zinc-800 p-4 text-white">
      <PromptSection loading={isLoading} handleSubmit={handleSubmit} />

      {/* Result Section */}
      {status && result && (
        <div className="w-full">
          <Separator className="my-4" />
          <ResultSection status={status} result={result} />
        </div>
      )}
    </div>
  );
}
