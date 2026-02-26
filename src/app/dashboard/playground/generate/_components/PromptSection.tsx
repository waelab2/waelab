"use client";

import { Button } from "~/components/ui/button";
import useGenerateStore from "~/lib/stores/useGenerateStore";
import EnhancedDynamicModelForm from "./EnhancedDynamicModelForm";

export default function PromptSection({
  loading,
  disabled = false,
  disabledLabel,
  handleSubmit,
}: {
  loading: boolean;
  disabled?: boolean;
  disabledLabel?: string;
  handleSubmit: (prompt: string) => void;
}) {
  const { prompt } = useGenerateStore();

  const handleGenerate = () => {
    if (!prompt.trim()) return;
    handleSubmit(prompt);
  };

  return (
    <div className="space-y-6">
      {/* Form Container */}
      <div className="rounded-xl bg-white/10 p-8 shadow-[0_0_0_1px_rgba(255,255,255,0.2)] backdrop-blur-sm">
        <div className="mb-6">
          <h2 className="text-xl font-semibold text-white">
            Video Generation Settings
          </h2>
          <p className="mt-1 text-sm text-white/80">
            Configure your video generation parameters below
          </p>
        </div>

        <EnhancedDynamicModelForm />

        {/* Generate Button Section */}
        <div className="mt-6">
          <Button
            onClick={handleGenerate}
            disabled={loading || !prompt.trim() || disabled}
            className="w-full bg-gradient-to-r from-[#E9476E] to-[#3B5DA8] text-white hover:from-[#D63E5F] hover:to-[#2A4A8F] disabled:cursor-not-allowed disabled:opacity-50"
            size="lg"
          >
            {loading
              ? "Generating..."
              : disabled
                ? (disabledLabel ?? "Unavailable")
                : "Generate Video"}
          </Button>
        </div>
      </div>
    </div>
  );
}
