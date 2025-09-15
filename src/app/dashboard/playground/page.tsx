"use client";

import { useAutoAnimate } from "@formkit/auto-animate/react";
import { Search, Sparkles } from "lucide-react";
import Link from "next/link";
import { useMemo, useState } from "react";
import { models } from "~/lib/constants";

export default function PlaygroundPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [categoriesParent] = useAutoAnimate();
  const [modelsParent] = useAutoAnimate();

  const filteredModels = useMemo(() => {
    if (!searchQuery.trim()) return models;

    const query = searchQuery.toLowerCase();
    return models.filter(
      (model) =>
        model.name.toLowerCase().includes(query) ||
        model.id.toLowerCase().includes(query),
    );
  }, [searchQuery]);

  const modelsByCategory = useMemo(() => {
    const categorized: Record<string, (typeof models)[number][]> = {};

    filteredModels.forEach((model) => {
      const category = model.category;
      categorized[category] ??= [];
      categorized[category].push(model);
    });

    return categorized;
  }, [filteredModels]);

  const categoryDisplayNames = {
    "text-to-video": "Text-to-Video Models",
    "image-to-video": "Image-to-Video Models",
    "text-to-audio": "Text-to-Audio Models",
  } as const;

  // Function to get the correct URL for a model
  function getModelUrl(model: (typeof models)[number]): string {
    if (model.id.startsWith("elevenlabs/")) {
      // ElevenLabs models go to their specific page
      const modelPath = model.id.replace("elevenlabs/", "");
      return `/dashboard/playground/elevenlabs/${modelPath}`;
    } else {
      // fal.ai models go to the generate page
      return `/dashboard/playground/generate?model=${encodeURIComponent(model.id)}`;
    }
  }
  return (
    <main className="flex flex-col gap-6 py-6">
      <div className="space-y-4">
        <div className="space-y-2">
          <h1 className="animate-fade-in text-3xl font-bold tracking-tight">
            AI Models Playground
          </h1>
          <p className="text-muted-foreground animate-fade-in animate-delay-100">
            Choose from our collection of state-of-the-art AI models for video
            generation and text-to-speech
          </p>
        </div>

        {/* Search Bar and Model Count */}
        <div className="animate-fade-in animate-delay-200 flex items-center justify-between">
          <div className="relative max-w-md">
            <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search models..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-lg border border-gray-300 bg-white py-2 pr-4 pl-10 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none"
            />
          </div>
          <div className="text-sm text-gray-600">
            {filteredModels.length} of {models.length} models
          </div>
        </div>
      </div>

      {filteredModels.length === 0 ? (
        <div className="py-12 text-center">
          <div className="text-gray-500">
            <Search className="mx-auto mb-4 h-12 w-12 opacity-50" />
            <p className="text-lg font-medium">No models found</p>
            <p className="text-sm">Try adjusting your search query</p>
          </div>
        </div>
      ) : (
        <div ref={categoriesParent} className="space-y-8">
          {Object.entries(modelsByCategory).map(
            ([category, categoryModels], index) => (
              <section
                key={category}
                className={`animate-fade-in-up space-y-4 animate-delay-${Math.min((index + 1) * 100, 400)}`}
              >
                <div className="border-b border-gray-200 pb-2">
                  <h2 className="text-xl font-semibold text-gray-900">
                    {
                      categoryDisplayNames[
                        category as keyof typeof categoryDisplayNames
                      ]
                    }
                  </h2>
                  <p className="mt-1 text-sm text-gray-600">
                    {categoryModels.length} model
                    {categoryModels.length !== 1 ? "s" : ""} available
                  </p>
                </div>

                <div
                  ref={modelsParent}
                  className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
                >
                  {categoryModels.map((model, modelIndex) => {
                    // Calculate delay: base delay for category + staggered delay for each model
                    const baseDelay = (index + 1) * 100; // 100ms, 200ms, 300ms for categories
                    const modelDelay = (modelIndex + 1) * 50; // 50ms increments for models
                    const totalDelay = Math.min(baseDelay + modelDelay, 500);

                    return (
                      <Link
                        key={model.id}
                        href={getModelUrl(model)}
                        className={`group animate-fade-in-up relative overflow-hidden rounded-xl border bg-white p-6 shadow-sm transition-all duration-300 hover:scale-[1.02] hover:shadow-lg animate-delay-${totalDelay}`}
                      >
                        {/* Custom gradient overlay on hover */}
                        <div className="absolute inset-0 bg-gradient-to-r from-[#E9476E] to-[#3B5DA8] opacity-0 transition-all duration-300 group-hover:opacity-100" />

                        {/* Content */}
                        <div className="relative z-10 space-y-3">
                          {/* Model ID (small) */}
                          <p className="text-xs text-gray-500 transition-colors group-hover:text-gray-300">
                            {model.id}
                          </p>

                          {/* Model name */}
                          <h3 className="font-semibold text-gray-900 transition-colors group-hover:text-white">
                            {model.name}
                          </h3>

                          {/* Price per second */}
                          <div className="text-xs text-gray-600 transition-colors group-hover:text-gray-300">
                            ${model.price_per_second}/sec
                          </div>
                        </div>
                      </Link>
                    );
                  })}
                </div>
              </section>
            ),
          )}
        </div>
      )}

      {/* Info section */}
      <section className="animate-fade-in animate-delay-400 mt-8 rounded-xl border bg-gray-50/50 p-6">
        <div className="flex items-start gap-4">
          <div className="rounded-full bg-blue-100 p-2">
            <Sparkles className="h-5 w-5 text-blue-600" />
          </div>
          <div className="space-y-2">
            <h3 className="font-semibold text-gray-900">Getting Started</h3>
            <p className="text-sm text-gray-600">
              Select a model above to start generating content. Video models
              create stunning visual content, while audio models convert text to
              natural speech. Each model has different strengths and pricing.
            </p>
          </div>
        </div>
      </section>
    </main>
  );
}
