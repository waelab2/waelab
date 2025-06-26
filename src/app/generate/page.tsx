"use client";

import { fal } from "@fal-ai/client";
import { useState } from "react";
import { Button } from "~/components/ui/button";
import { Textarea } from "~/components/ui/textarea";

export default function GeneratePage() {
  const [prompt, setPrompt] = useState<string>("");

  fal.config({
    proxyUrl: "/api/fal/proxy",
  });

  async function handleSubmit(prompt: string) {
    console.log("handleSubmit", prompt);

    if (!prompt) {
      throw new Error("Prompt is required");
    }

    const result = await fal.subscribe("fal-ai/flux/dev", {
      input: {
        prompt,
        image_size: "square_hd",
      },
      pollInterval: 5000,
      logs: true,
      onQueueUpdate(update) {
        console.log("queue update", update);
      },
    });

    console.log("result", result);
    console.log("###########");
    // console.log("result.images", result.images);
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 p-4">
      <div className="mx-auto w-full max-w-2xl">
        <div className="rounded-lg bg-white p-8 shadow-md">
          <h1 className="mb-6 text-center text-2xl font-bold text-gray-900">
            Generate Content
          </h1>
          <div className="grid w-full gap-4">
            <Textarea
              placeholder="Type your message here..."
              className="min-h-[150px] resize-none"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
            />
            <Button className="w-full" onClick={() => handleSubmit(prompt)}>
              Generate
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
