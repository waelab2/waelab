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
          <h1 className="animate-fade-in text-3xl font-bold tracking-tight text-white">
            AI Models Playground
          </h1>
          <p className="animate-fade-in animate-delay-100 text-white/80">
            Choose from our collection of state-of-the-art AI models for video
            generation and text-to-speech
          </p>
        </div>

        {/* Search Bar and Model Count */}
        <div className="animate-fade-in animate-delay-200 flex items-center justify-between">
          <div className="relative max-w-md">
            <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-white/60" />
            <input
              type="text"
              placeholder="Search models..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-lg border border-white/20 bg-white/10 py-2 pr-4 pl-10 text-sm text-white placeholder-white/60 backdrop-blur-sm focus:border-white/40 focus:ring-1 focus:ring-white/40 focus:outline-none"
            />
          </div>
          <div className="text-sm text-white/80">
            {filteredModels.length} of {models.length} models
          </div>
        </div>
      </div>

      {filteredModels.length === 0 ? (
        <div className="py-12 text-center">
          <div className="text-white/60">
            <Search className="mx-auto mb-4 h-12 w-12 opacity-50" />
            <p className="text-lg font-medium text-white">No models found</p>
            <p className="text-sm text-white/80">
              Try adjusting your search query
            </p>
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
                <div className="border-b border-white/20 pb-2">
                  <h2 className="text-xl font-semibold text-white">
                    {
                      categoryDisplayNames[
                        category as keyof typeof categoryDisplayNames
                      ]
                    }
                  </h2>
                  <p className="mt-1 text-sm text-white/80">
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
                        className={`group animate-fade-in-up relative flex flex-col items-start rounded-lg bg-white/10 p-6 shadow-[0_0_0_1px_rgba(255,255,255,0.2)] backdrop-blur-sm transition-all duration-300 hover:bg-gradient-to-r hover:from-[#E9476E] hover:to-[#3B5DA8] hover:text-white hover:shadow-none focus-visible:outline-none animate-delay-${totalDelay}`}
                      >
                        {/* Content */}
                        <div className="space-y-3">
                          {/* Model ID (small) */}
                          <p className="text-xs text-white/60 transition-colors group-hover:text-white">
                            {model.id}
                          </p>

                          {/* Model name */}
                          <h3 className="text-lg leading-none font-semibold tracking-tight text-white transition-colors group-hover:text-white">
                            {model.name}
                          </h3>

                          {/* Price per second */}
                          <div className="text-sm text-white/80 transition-colors group-hover:text-white">
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
      <section className="animate-fade-in animate-delay-400 mt-8 rounded-xl border border-white/20 bg-white/10 p-6 backdrop-blur-sm">
        <div className="flex items-start gap-4">
          <div className="rounded-full bg-white/20 p-2">
            <Sparkles className="h-5 w-5 text-white" />
          </div>
          <div className="space-y-2">
            <h3 className="font-semibold text-white">Getting Started</h3>
            <p className="text-sm text-white/80">
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
