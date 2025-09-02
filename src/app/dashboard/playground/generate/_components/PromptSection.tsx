"use client";

import { Loader2Icon } from "lucide-react";
import { Button } from "~/components/ui/button";
import useGenerateStore from "~/lib/stores/useGenerateStore";
import DynamicModelForm from "./DynamicModelForm";

export default function PromptSection({
  loading,
  handleSubmit,
}: {
  loading: boolean;
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
      <div className="rounded-xl bg-white p-8 shadow-sm ring-1 ring-gray-200">
        <div className="mb-6">
          <h2 className="text-xl font-semibold text-gray-900">
            Video Generation Settings
          </h2>
          <p className="mt-1 text-sm text-gray-600">
            Configure your video generation parameters below
          </p>
        </div>

        <DynamicModelForm />

        {/* Generate Button Section */}
        <div className="mt-8 flex items-center justify-end border-t pt-6">
          <Button
            size="lg"
            disabled={!prompt.trim() || loading}
            onClick={handleGenerate}
            className="px-8 py-3 text-base font-medium"
          >
            {loading ? (
              <>
                <Loader2Icon className="mr-2 h-5 w-5 animate-spin" />
                Generating...
              </>
            ) : (
              <>
                <svg
                  className="mr-2 h-5 w-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M14.828 14.828a4 4 0 01-5.656 0M9 10h1m4 0h1m-6 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                Generate Video
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
