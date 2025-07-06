"use client";

import { ChevronsUpDown, Loader2Icon } from "lucide-react";
import { useEffect, useState } from "react";
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
  handleSubmit: (prompt: string, count: number) => void;
}) {
  const [prompt, setPrompt] = useState<string>("");
  const [count, setCount] = useState<number>(1);

  const { model, duration } = useGenerateStore();
  const [estimatedCost, setEstimatedCost] = useState(0);

  useEffect(() => {
    const modelPricePerSecond = models.find(
      (m) => m.id === model,
    )?.price_per_second;

    if (!modelPricePerSecond) setEstimatedCost(0);
    else {
      const videoCost = modelPricePerSecond * duration;
      setEstimatedCost(count * videoCost);
    }
  }, [count, model, duration]);

  return (
    <div className="flex-1">
      <div className="grid w-full gap-4 lg:grid-cols-2">
        <Textarea
          placeholder="Type your prompt here..."
          className="min-h-[150px] resize-none"
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          disabled={loading}
        />

        <div className="flex flex-col gap-4">
          <SettingsCollapsible isLoading={loading} />

          <div className="flex flex-col gap-2">
            <Label htmlFor="numResults">Number of results</Label>
            <Input
              id="numResults"
              type="number"
              min={1}
              step={1}
              value={count}
              onChange={(e) => setCount(Math.max(1, Number(e.target.value)))}
              disabled={loading}
            />
          </div>

          <p className="text-muted-foreground text-sm">
            Estimated cost: $ {estimatedCost.toFixed(2)}
          </p>

          <Button
            className="w-full"
            disabled={!prompt || loading}
            onClick={() => handleSubmit(prompt, count)}
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
      <ModelSelector isLoading={isLoading} />
      <CollapsibleContent className="flex flex-col gap-2">
        <DurationInput isLoading={isLoading} />
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
            <SelectItem value="1:1">1:1</SelectItem>
          </SelectGroup>
        </SelectContent>
      </Select>
    </div>
  );
}
