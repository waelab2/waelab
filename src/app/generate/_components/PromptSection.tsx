"use client";

import { ChevronsUpDown, Loader2Icon } from "lucide-react";
import { useState } from "react";
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
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";
import { Textarea } from "~/components/ui/textarea";
import { models, type Model } from "~/lib/constants";
import useGenerateStore from "~/lib/stores/useGenerateStore";
import type { AspectRatio } from "~/lib/types";

export default function PromptSection({
  loading,
  handleSubmit,
}: {
  loading: boolean;
  handleSubmit: (prompt: string) => void;
}) {
  const [prompt, setPrompt] = useState<string>("");
  const { status, setStatus } = useGenerateStore();

  return (
    <div className="mx-auto w-full max-w-2xl">
      <div className="rounded-lg bg-white/10 p-8 shadow-md">
        <h1
          className="mb-6 cursor-pointer text-center text-2xl font-bold"
          onClick={() => setStatus(status === "IN_QUEUE" ? null : "IN_QUEUE")}
        >
          Generate Content
        </h1>
        <div className="grid w-full gap-4">
          <Textarea
            placeholder="Type your prompt here..."
            className="min-h-[150px] resize-none bg-white/10 text-white placeholder:text-white/50"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            disabled={loading}
          />
          <SettingsCollapsible isLoading={loading} />
          <Button
            className="w-full bg-white/10 transition hover:bg-white/20"
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

function SettingsCollapsible({ isLoading }: { isLoading: boolean }) {
  const [collapsibleOpen, setCollapsibleOpen] = useState(false);

  return (
    <Collapsible
      open={collapsibleOpen}
      onOpenChange={setCollapsibleOpen}
      className="flex flex-col gap-2"
    >
      <div className="flex items-center justify-between gap-4">
        <h4 className="text-base font-semibold">Settings</h4>
        <CollapsibleTrigger asChild>
          <Button variant="ghost" size="icon" className="size-8">
            <ChevronsUpDown />
            <span className="sr-only">Toggle</span>
          </Button>
        </CollapsibleTrigger>
      </div>
      <DurationInput isLoading={isLoading} />
      <CollapsibleContent className="flex flex-col gap-2">
        <ModelSelector isLoading={isLoading} />
        <AspectRatioSelector isLoading={isLoading} />
      </CollapsibleContent>
    </Collapsible>
  );
}

function ModelSelector({ isLoading }: { isLoading?: boolean }) {
  const { model, setModel } = useGenerateStore();

  return (
    <div className="flex flex-col gap-2">
      <Label>Model</Label>
      <Select
        value={model}
        onValueChange={(value) => setModel(value as Model["id"])}
        disabled={isLoading}
      >
        <SelectTrigger className="w-full">
          <SelectValue placeholder="Select a model" />
        </SelectTrigger>
        <SelectContent>
          <SelectGroup>
            {models.map((model) => (
              <SelectItem key={model.id} value={model.id}>
                {model.name}
              </SelectItem>
            ))}
          </SelectGroup>
        </SelectContent>
      </Select>
    </div>
  );
}

function DurationInput({ isLoading }: { isLoading?: boolean }) {
  const { duration, setDuration } = useGenerateStore();

  return (
    <div className="flex flex-col gap-2">
      <Label htmlFor="duration">Duration (in seconds)</Label>
      <Input
        id="duration"
        type="number"
        min={1}
        step={1}
        placeholder="Enter duration"
        disabled={isLoading}
        value={duration}
        onChange={(e) => setDuration(Number(e.target.value))}
      />
    </div>
  );
}

function AspectRatioSelector({ isLoading }: { isLoading?: boolean }) {
  const { aspect_ratio, setAspectRatio } = useGenerateStore();

  return (
    <div className="flex flex-col gap-2">
      <Label>Aspect Ratio</Label>
      <Select
        value={aspect_ratio ?? undefined}
        onValueChange={(value) => setAspectRatio(value as AspectRatio)}
        disabled={isLoading}
      >
        <SelectTrigger className="w-full">
          <SelectValue placeholder="Select a model" />
        </SelectTrigger>
        <SelectContent>
          <SelectGroup>
            <SelectItem value="16:9">16:9</SelectItem>
            <SelectItem value="9:16">9:16</SelectItem>
            <SelectItem value="4:3">4:3</SelectItem>
            <SelectItem value="1:1">1:1</SelectItem>
          </SelectGroup>
        </SelectContent>
      </Select>
    </div>
  );
}
