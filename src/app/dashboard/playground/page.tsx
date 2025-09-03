"use client";

import { Search, Sparkles } from "lucide-react";
import Link from "next/link";
import { useMemo, useState } from "react";
import { getModelPreviewUrl, models } from "~/lib/constants";

export default function PlaygroundPage() {
  const [searchQuery, setSearchQuery] = useState("");

  const filteredModels = useMemo(() => {
    if (!searchQuery.trim()) return models;

    const query = searchQuery.toLowerCase();
    return models.filter(
      (model) =>
        model.name.toLowerCase().includes(query) ||
        model.id.toLowerCase().includes(query),
    );
  }, [searchQuery]);
  return (
    <main className="flex flex-col gap-6 py-6">
      <div className="space-y-4">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold tracking-tight">AI Video Models</h1>
          <p className="text-muted-foreground">
            Choose from our collection of state-of-the-art text-to-video models
          </p>
        </div>

        {/* Search Bar and Model Count */}
        <div className="flex items-center justify-between">
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

      <section className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {filteredModels.length === 0 ? (
          <div className="col-span-full py-12 text-center">
            <div className="text-gray-500">
              <Search className="mx-auto mb-4 h-12 w-12 opacity-50" />
              <p className="text-lg font-medium">No models found</p>
              <p className="text-sm">Try adjusting your search query</p>
            </div>
          </div>
        ) : (
          filteredModels.map((model) => {
            return (
              <Link
                key={model.id}
                href={`/dashboard/playground/generate?model=${encodeURIComponent(model.id)}`}
                className="group relative overflow-hidden rounded-xl border bg-white p-6 shadow-sm transition-all duration-300 hover:scale-[1.02] hover:shadow-lg"
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
                </div>
              </Link>
            );
          })
        )}
      </section>

      {/* Info section */}
      <section className="mt-8 rounded-xl border bg-gray-50/50 p-6">
        <div className="flex items-start gap-4">
          <div className="rounded-full bg-blue-100 p-2">
            <Sparkles className="h-5 w-5 text-blue-600" />
          </div>
          <div className="space-y-2">
            <h3 className="font-semibold text-gray-900">Getting Started</h3>
            <p className="text-sm text-gray-600">
              Select a model above to start generating videos. Each model has
              different strengths and pricing. Higher-priced models typically
              offer better quality and more realistic outputs.
            </p>
          </div>
        </div>
      </section>
    </main>
  );
}
