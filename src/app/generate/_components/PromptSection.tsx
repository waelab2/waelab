"use client";

import { Loader2Icon } from "lucide-react";
import { useState } from "react";
import { Button } from "~/components/ui/button";
import { Textarea } from "~/components/ui/textarea";

export default function PromptSection({
  loading,
  handleSubmit,
}: {
  loading: boolean;
  handleSubmit: (prompt: string) => void;
}) {
  const [prompt, setPrompt] = useState<string>("");

  return (
    <div className="mx-auto w-full max-w-2xl">
      <div className="rounded-lg bg-zinc-100 p-8 text-zinc-900 shadow-md">
        <h1 className="mb-6 text-center text-2xl font-bold">
          Generate Content
        </h1>
        <div className="grid w-full gap-4">
          <Textarea
            placeholder="Type your prompt here..."
            className="min-h-[150px] resize-none"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            disabled={loading}
          />
          <Button
            className="w-full bg-zinc-700 hover:bg-zinc-600"
            disabled={!prompt || loading}
            onClick={() => handleSubmit(prompt)}
          >
            {loading && <Loader2Icon className="animate-spin" />}
            Generate
          </Button>
        </div>
      </div>
    </div>
  );
}
