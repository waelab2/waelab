"use client";

import { useEffect } from "react";
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
import { Switch } from "~/components/ui/switch";
import { Textarea } from "~/components/ui/textarea";
import type { Model } from "~/lib/constants";
import { models } from "~/lib/constants";
import useGenerateStore from "~/lib/stores/useGenerateStore";
import type { AspectRatio } from "~/lib/types";
import { ModelSchemaFetcher } from "~/lib/utils/schema-fetcher";

export default function DynamicModelForm() {
  const {
    model,
    setModel,
    prompt,
    setPrompt,
    duration,
    setDuration,
    aspect_ratio,
    setAspectRatio,
    negative_prompt,
    setNegativePrompt,
    cfg_scale,
    setCfgScale,
    prompt_optimizer,
    setPromptOptimizer,
    modelSchema,
    setModelSchema,
    isLoadingModel,
    setLoadingModel,
  } = useGenerateStore();

  // Fetch model schema when model changes
  useEffect(() => {
    async function fetchModelSchema() {
      if (!model) return;

      setLoadingModel(true);
      try {
        const modelInfo = await ModelSchemaFetcher.getModelInfo(model);
        if (modelInfo) {
          setModelSchema(modelInfo.schema);

          // Set default values based on schema
          if (modelInfo.schema.input.duration) {
            setDuration(Number(modelInfo.schema.input.duration.default));
          }
          if (modelInfo.schema.input.aspect_ratio) {
            setAspectRatio(
              modelInfo.schema.input.aspect_ratio.default as AspectRatio,
            );
          }
          if (modelInfo.schema.input.negative_prompt) {
            setNegativePrompt(modelInfo.schema.input.negative_prompt.default);
          }
          if (modelInfo.schema.input.cfg_scale) {
            setCfgScale(modelInfo.schema.input.cfg_scale.default);
          }
          if (modelInfo.schema.input.prompt_optimizer) {
            setPromptOptimizer(modelInfo.schema.input.prompt_optimizer.default);
          }
        }
      } catch (error) {
        console.error("Failed to fetch model schema:", error);
      } finally {
        setLoadingModel(false);
      }
    }

    void fetchModelSchema();
  }, [
    model,
    setModelSchema,
    setDuration,
    setAspectRatio,
    setNegativePrompt,
    setCfgScale,
    setPromptOptimizer,
    setLoadingModel,
  ]);

  if (isLoadingModel) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="mx-auto mb-4 h-12 w-12 animate-spin rounded-full border-b-2 border-white"></div>
          <p className="text-lg text-white/80">
            Loading model configuration...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Model Selection Section */}
      <div className="space-y-4">
        <div className="flex items-center space-x-2">
          <div className="h-2 w-2 rounded-full bg-blue-500"></div>
          <Label className="text-base font-medium text-white">
            Model Selection
          </Label>
        </div>
        <Select
          value={model}
          onValueChange={(value) => setModel(value as Model["id"])}
        >
          <SelectTrigger className="h-12 text-base">
            <SelectValue placeholder="Select a model" />
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              {models.map((modelOption) => (
                <SelectItem key={modelOption.id} value={modelOption.id}>
                  {modelOption.name}
                </SelectItem>
              ))}
            </SelectGroup>
          </SelectContent>
        </Select>
      </div>

      {/* Prompt Section */}
      <div className="space-y-4">
        <div className="flex items-center space-x-2">
          <div className="h-2 w-2 rounded-full bg-green-500"></div>
          <Label htmlFor="prompt" className="text-base font-medium text-white">
            Video Description
            {modelSchema?.input.prompt.maxLength && (
              <span className="ml-2 text-sm font-normal text-white/60">
                Max {modelSchema.input.prompt.maxLength} characters
              </span>
            )}
          </Label>
        </div>
        <Textarea
          id="prompt"
          placeholder="Describe the video you want to generate... (e.g., 'A majestic dragon soaring through a sunset sky with golden clouds')"
          className="min-h-[120px] resize-none text-base"
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          maxLength={modelSchema?.input.prompt.maxLength}
        />
        {modelSchema?.input.prompt.maxLength && (
          <div className="flex justify-between text-sm text-white/60">
            <span>Be specific and descriptive for better results</span>
            <span className="font-medium">
              {prompt.length}/{modelSchema.input.prompt.maxLength}
            </span>
          </div>
        )}
      </div>

      {/* Video Settings Section */}
      {(modelSchema?.input.duration ?? modelSchema?.input.aspect_ratio) && (
        <div className="space-y-4">
          <div className="flex items-center space-x-2">
            <div className="h-2 w-2 rounded-full bg-purple-500"></div>
            <Label className="text-base font-medium text-white">
              Video Settings
            </Label>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            {/* Duration Input */}
            {modelSchema?.input.duration && (
              <div className="space-y-2">
                <Label
                  htmlFor="duration"
                  className="text-sm font-medium text-white/80"
                >
                  Duration
                </Label>
                <Select
                  value={duration?.toString()}
                  onValueChange={(value) => setDuration(Number(value))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select duration" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      {modelSchema.input.duration.enum.map((dur) => (
                        <SelectItem key={dur} value={dur}>
                          {dur} seconds
                        </SelectItem>
                      ))}
                    </SelectGroup>
                  </SelectContent>
                </Select>
              </div>
            )}

            {/* Aspect Ratio Input */}
            {modelSchema?.input.aspect_ratio && (
              <div className="space-y-2">
                <Label className="text-sm font-medium text-white/80">
                  Aspect Ratio
                </Label>
                <Select
                  value={aspect_ratio}
                  onValueChange={(value) =>
                    setAspectRatio(value as AspectRatio)
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select aspect ratio" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      {modelSchema.input.aspect_ratio.enum.map((ratio) => (
                        <SelectItem key={ratio} value={ratio}>
                          {ratio}
                        </SelectItem>
                      ))}
                    </SelectGroup>
                  </SelectContent>
                </Select>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Advanced Settings Section */}
      {(modelSchema?.input.negative_prompt ??
        modelSchema?.input.cfg_scale ??
        modelSchema?.input.prompt_optimizer) && (
        <div className="space-y-4">
          <div className="flex items-center space-x-2">
            <div className="h-2 w-2 rounded-full bg-orange-500"></div>
            <Label className="text-base font-medium text-white">
              Advanced Settings
            </Label>
          </div>

          <div className="space-y-4">
            {/* Negative Prompt Input */}
            {modelSchema?.input.negative_prompt && (
              <div className="space-y-2">
                <Label
                  htmlFor="negative_prompt"
                  className="text-sm font-medium text-white/80"
                >
                  Negative Prompt
                  {modelSchema.input.negative_prompt.maxLength && (
                    <span className="ml-2 text-sm font-normal text-white/60">
                      Max {modelSchema.input.negative_prompt.maxLength}{" "}
                      characters
                    </span>
                  )}
                </Label>
                <Textarea
                  id="negative_prompt"
                  placeholder="What to avoid in the video... (e.g., 'blur, low quality, distorted')"
                  className="min-h-[80px] resize-none text-sm"
                  value={negative_prompt ?? ""}
                  onChange={(e) => setNegativePrompt(e.target.value)}
                  maxLength={modelSchema.input.negative_prompt.maxLength}
                />
                {modelSchema.input.negative_prompt.maxLength && (
                  <div className="text-right text-sm text-white/60">
                    {negative_prompt?.length ?? 0}/
                    {modelSchema.input.negative_prompt.maxLength}
                  </div>
                )}
              </div>
            )}

            {/* CFG Scale Input */}
            {modelSchema?.input.cfg_scale && (
              <div className="space-y-2">
                <Label
                  htmlFor="cfg_scale"
                  className="text-sm font-medium text-white/80"
                >
                  CFG Scale
                  {modelSchema.input.cfg_scale.minimum !== undefined &&
                    modelSchema.input.cfg_scale.maximum !== undefined && (
                      <span className="ml-2 text-sm font-normal text-white/60">
                        Range: {modelSchema.input.cfg_scale.minimum} -{" "}
                        {modelSchema.input.cfg_scale.maximum}
                      </span>
                    )}
                </Label>
                <Input
                  id="cfg_scale"
                  type="number"
                  step="0.1"
                  min={modelSchema.input.cfg_scale.minimum}
                  max={modelSchema.input.cfg_scale.maximum}
                  value={cfg_scale ?? ""}
                  onChange={(e) => setCfgScale(Number(e.target.value))}
                  placeholder={`Default: ${modelSchema.input.cfg_scale.default}`}
                  className="h-10"
                />
                <p className="text-xs text-white/60">
                  Controls how closely the model follows your prompt. Higher
                  values = more faithful to prompt.
                </p>
              </div>
            )}

            {/* Prompt Optimizer Toggle */}
            {modelSchema?.input.prompt_optimizer && (
              <div className="flex items-center justify-between rounded-lg border border-white/20 bg-white/5 p-4 backdrop-blur-sm">
                <div className="space-y-1">
                  <Label
                    htmlFor="prompt_optimizer"
                    className="text-sm font-medium text-white/80"
                  >
                    Prompt Optimizer
                  </Label>
                  <p className="text-xs text-white/60">
                    Use the model&apos;s built-in prompt optimization for better
                    results
                  </p>
                </div>
                <Switch
                  id="prompt_optimizer"
                  checked={prompt_optimizer ?? false}
                  onCheckedChange={setPromptOptimizer}
                />
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
