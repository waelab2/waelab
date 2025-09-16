"use client";

import Link from "next/link";
import { Suspense, useEffect, useRef, useState } from "react";
import GlowingCard from "~/components/mvpblocks/glow-card";
import { Separator } from "~/components/ui/separator";
import { saudiArabicVoices } from "~/lib/constants";
import type { ElevenLabsStatus } from "~/lib/types";

function ElevenLabsPageContent() {
  const [text, setText] = useState("");
  const [selectedVoice, setSelectedVoice] = useState(
    saudiArabicVoices[0]?.voice_id ?? "",
  );
  const [status, setStatus] = useState<ElevenLabsStatus | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [audioData, setAudioData] = useState<{
    audio: {
      url: string;
      file_size: number;
      duration_ms?: number;
      content_type: string;
      file_name: string;
    };
    metadata?: {
      character_count: number;
      generation_time_ms: number;
      model_id: string;
      voice_id: string;
    };
  } | null>(null);
  const [audioDuration, setAudioDuration] = useState<number | null>(null);
  const [estimatedCost, setEstimatedCost] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const resultsSectionRef = useRef<HTMLDivElement>(null);

  // Calculate estimated cost based on text length
  useEffect(() => {
    const costPerChar = 0.3 / 50; // Rough estimate: $0.30 per 50 characters
    setEstimatedCost(text.length * costPerChar);
  }, [text]);

  useEffect(() => {
    setIsLoading(status === "PREPARING" || status === "GENERATING");
  }, [status]);

  // Auto-scroll to results when the results section becomes visible
  useEffect(() => {
    if (
      status &&
      (audioData || isLoading || status === "FAILED") &&
      resultsSectionRef.current
    ) {
      resultsSectionRef.current.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }
  }, [status, audioData, isLoading]);

  // Format milliseconds to human readable time
  function formatTime(ms: number): string {
    if (ms < 1000) {
      return `${ms}ms`;
    } else if (ms < 60000) {
      return `${(ms / 1000).toFixed(1)}s`;
    } else {
      const minutes = Math.floor(ms / 60000);
      const seconds = ((ms % 60000) / 1000).toFixed(1);
      return `${minutes}m ${seconds}s`;
    }
  }

  // Handle audio duration when it loads
  function handleAudioLoadedMetadata(
    event: React.SyntheticEvent<HTMLAudioElement>,
  ) {
    const audio = event.currentTarget;
    if (audio.duration && !isNaN(audio.duration)) {
      setAudioDuration(audio.duration);
    }
  }

  async function handleSubmit() {
    if (!text.trim() || !selectedVoice) {
      alert("Please enter text and select a voice");
      return;
    }

    setStatus("PREPARING");
    setAudioData(null);
    setError(null);
    setAudioDuration(null);

    try {
      setStatus("GENERATING");

      const response = await fetch("/api/elevenlabs/text-to-speech", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          text: text.trim(),
          voice_id: selectedVoice,
        }),
      });

      if (!response.ok) {
        const errorData = (await response
          .json()
          .catch(() => ({ error: "Unknown error" }))) as { error: string };
        throw new Error(
          errorData.error ?? `HTTP ${response.status}: ${response.statusText}`,
        );
      }

      // Get the JSON response with audio data
      const responseData = (await response.json()) as {
        success: boolean;
        data?: {
          audio: {
            url: string;
            file_size: number;
            file_name: string;
            content_type: string;
            duration_ms: number;
          };
          metadata: {
            character_count: number;
            generation_time_ms: number;
            model_id: string;
            voice_id: string;
          };
        };
      };

      if (!responseData.success || !responseData.data) {
        throw new Error("Invalid response format from API");
      }

      // Use the audio data directly from the API response
      const audioData = responseData.data;

      setAudioData(audioData);
      setStatus("COMPLETED");

      // Reset duration to be calculated when audio loads
      setAudioDuration(null);
    } catch (error) {
      console.error("Generation failed:", error);
      setError(
        error instanceof Error ? error.message : "Unknown error occurred",
      );
      setStatus("FAILED");
    }
  }

  return (
    <main className="min-h-screen">
      {/* Header Section */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-white">
            Arabic Text-to-Speech
          </h1>
          <p className="mt-2 text-sm text-white/80">
            Convert Arabic text to natural speech with Saudi accent using
            ElevenLabs
          </p>
          <div className="mt-4 space-y-2">
            <Link
              href="/dashboard/playground"
              className="inline-flex items-center gap-2 text-sm text-gray-300 transition-colors hover:text-white"
            >
              ← Back to Models
            </Link>
            <div className="text-sm text-gray-300">
              <span className="font-semibold text-white">Selected Model:</span>{" "}
              <span className="text-white">Eleven Multilingual v2</span>
            </div>
          </div>
        </div>
        {isLoading && (
          <div className="flex items-center space-x-2 rounded-full bg-white/10 px-4 py-2 backdrop-blur-sm">
            <div className="h-3 w-3 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
            <span className="text-sm font-medium text-white">
              {status === "PREPARING" && "Preparing..."}
              {status === "GENERATING" && "Generating audio..."}
            </span>
          </div>
        )}
      </div>

      <Separator className="my-8" />

      {/* Main Content */}
      <div className="grid gap-8 lg:grid-cols-3">
        {/* Left Column: Form */}
        <div className="lg:col-span-2">
          <div className="rounded-xl bg-white/10 p-6 shadow-[0_0_0_1px_rgba(255,255,255,0.2)] backdrop-blur-sm">
            <h2 className="mb-4 text-lg font-semibold text-white">
              Arabic Text-to-Speech Generator
            </h2>

            {/* Arabic Text Input */}
            <div className="mb-6 space-y-3">
              <label className="block text-sm font-medium text-white/80">
                Arabic Text
              </label>
              <textarea
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder="أدخل النص العربي هنا..."
                className="min-h-[120px] w-full rounded-md border border-white/30 bg-white/10 px-3 py-2 text-right text-white placeholder-white/60 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none"
                dir="rtl"
                maxLength={5000}
              />
              <div className="text-right text-sm text-white/60">
                {text.length}/5000 characters
              </div>
            </div>

            {/* Voice Selection */}
            <div className="mb-6 space-y-3">
              <label className="block text-sm font-medium text-white/80">
                Voice (Saudi Arabic)
              </label>
              <select
                value={selectedVoice}
                onChange={(e) => setSelectedVoice(e.target.value)}
                className="w-full rounded-md border border-white/30 bg-white/10 px-3 py-2 text-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none"
              >
                {saudiArabicVoices.map((voice) => (
                  <option
                    key={voice.voice_id}
                    value={voice.voice_id}
                    className="bg-gray-800 text-white"
                  >
                    {voice.name} ({voice.gender})
                  </option>
                ))}
              </select>
            </div>

            {/* Voice Information */}
            <div className="mb-6 space-y-4">
              <h3 className="text-md font-medium text-white/80">
                Voice Information
              </h3>
              {(() => {
                const selectedVoiceInfo = saudiArabicVoices.find(
                  (voice) => voice.voice_id === selectedVoice,
                );

                if (!selectedVoiceInfo) {
                  return (
                    <div className="py-4 text-center">
                      <p className="text-white/60">No voice selected</p>
                    </div>
                  );
                }

                return (
                  <div className="space-y-3">
                    {/* Voice Name and Basic Info */}
                    <div className="space-y-2">
                      <h4 className="text-sm font-medium text-white">
                        {selectedVoiceInfo.name}
                      </h4>
                      <div className="flex flex-wrap gap-2">
                        <span className="inline-flex items-center rounded-full bg-white/20 px-2.5 py-0.5 text-xs font-medium text-white">
                          {selectedVoiceInfo.gender}
                        </span>
                        <span className="inline-flex items-center rounded-full bg-white/20 px-2.5 py-0.5 text-xs font-medium text-white">
                          {selectedVoiceInfo.age}
                        </span>
                        <span className="inline-flex items-center rounded-full bg-white/20 px-2.5 py-0.5 text-xs font-medium text-white">
                          {selectedVoiceInfo.accent}
                        </span>
                      </div>
                    </div>

                    {/* Description */}
                    <div className="space-y-1">
                      <h5 className="text-sm font-medium text-white/80">
                        Description
                      </h5>
                      <p className="text-xs leading-relaxed text-white/70">
                        {selectedVoiceInfo.description}
                      </p>
                    </div>

                    {/* Use Case */}
                    <div className="space-y-1">
                      <h5 className="text-sm font-medium text-white/80">
                        Best For
                      </h5>
                      <span className="inline-flex items-center rounded-md bg-white/20 px-2 py-1 text-xs font-medium text-white">
                        {selectedVoiceInfo.use_case
                          .replace(/_/g, " ")
                          .replace(/\b\w/g, (l) => l.toUpperCase())}
                      </span>
                    </div>

                    {/* Voice Preview */}
                    {selectedVoiceInfo.preview_url && (
                      <div className="mt-4 space-y-2">
                        <h5 className="text-sm font-medium text-white/80">
                          Voice Preview
                        </h5>
                        <audio
                          controls
                          className="h-8 w-full"
                          src={selectedVoiceInfo.preview_url}
                          preload="metadata"
                        >
                          Your browser does not support the audio element.
                        </audio>
                      </div>
                    )}
                  </div>
                );
              })()}
            </div>

            {/* Generate Button */}
            <div className="mt-6">
              <button
                onClick={handleSubmit}
                disabled={isLoading || !text.trim() || !selectedVoice}
                className="w-full rounded-lg bg-gradient-to-r from-[#E9476E] to-[#3B5DA8] px-4 py-2 text-white transition-colors hover:from-[#D63E5F] hover:to-[#2A4A8F] disabled:cursor-not-allowed disabled:opacity-50"
              >
                {isLoading ? "Generating..." : "Generate Arabic Speech"}
              </button>
            </div>
          </div>
        </div>

        {/* Right Column: Cost & Actions */}
        <div className="space-y-6">
          {/* Cost Card */}
          <div className="rounded-xl bg-white/10 p-6 shadow-[0_0_0_1px_rgba(255,255,255,0.2)] backdrop-blur-sm">
            <h3 className="text-lg font-semibold text-white">Cost Estimate</h3>
            <div className="mt-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-white/80">Model Cost</span>
                <span className="text-sm font-medium text-white">
                  ${estimatedCost.toFixed(4)}
                </span>
              </div>
              <div className="mt-2 flex items-center justify-between border-t border-white/20 pt-2">
                <span className="text-base font-semibold text-white">
                  Total
                </span>
                <span className="text-xl font-bold text-white">
                  ${estimatedCost.toFixed(4)}
                </span>
              </div>
              <div className="mt-2 text-xs text-white/60">
                Based on character count and model pricing
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="rounded-xl bg-white/10 p-6 shadow-[0_0_0_1px_rgba(255,255,255,0.2)] backdrop-blur-sm">
            <h3 className="text-lg font-semibold text-white">Quick Actions</h3>
            <div className="mt-4 space-y-3">
              <button className="w-full rounded-lg bg-white/10 px-4 py-2 text-sm font-medium text-white backdrop-blur-sm transition-colors hover:bg-white/20">
                View History
              </button>
            </div>
          </div>
        </div>

        {/* Results Section */}
        {status && (audioData ?? isLoading ?? status === "FAILED") && (
          <div ref={resultsSectionRef} className="mt-12 lg:col-span-3">
            <div className="mb-6 flex items-center justify-between">
              <h2 className="text-2xl font-bold tracking-tight text-white">
                Generated Audio
              </h2>
              <div className="flex items-center space-x-2">
                <span className="inline-flex items-center rounded-full bg-white/10 px-3 py-1 text-sm font-medium text-white backdrop-blur-sm">
                  {status === "COMPLETED" ? "✓ Complete" : status}
                </span>
              </div>
            </div>
            <GlowingCard className="p-6" aspectRatio="16:9">
              {isLoading && (
                <div className="flex items-center justify-center p-8">
                  <div className="flex items-center space-x-3 text-white/80">
                    <div className="h-8 w-8 animate-spin rounded-full border-2 border-white/30 border-t-white"></div>
                    <span className="text-lg font-medium">
                      {status === "PREPARING" &&
                        "Preparing audio generation..."}
                      {status === "GENERATING" &&
                        "Converting text to speech..."}
                    </span>
                  </div>
                </div>
              )}

              {!audioData && !isLoading && (
                <div className="py-12 text-center">
                  <p className="text-white/60">
                    Generated audio will appear here
                  </p>
                </div>
              )}

              {audioData && (
                <div className="space-y-4">
                  {/* Audio Player */}
                  <div className="space-y-6">
                    <audio
                      controls
                      className="w-full"
                      src={audioData.audio.url}
                      preload="metadata"
                      onLoadedMetadata={handleAudioLoadedMetadata}
                    >
                      Your browser does not support the audio element.
                    </audio>

                    {/* Audio Metadata */}
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                      <div className="rounded-lg bg-white/10 p-4">
                        <div className="text-sm text-white/60">File Size</div>
                        <div className="text-lg font-semibold text-white">
                          {(audioData.audio.file_size / 1024 / 1024).toFixed(2)}{" "}
                          MB
                        </div>
                      </div>
                      <div className="rounded-lg bg-white/10 p-4">
                        <div className="text-sm text-white/60">Duration</div>
                        <div className="text-lg font-semibold text-white">
                          {audioDuration
                            ? `${audioDuration.toFixed(1)}s`
                            : "Loading..."}
                        </div>
                      </div>
                      <div className="rounded-lg bg-white/10 p-4">
                        <div className="text-sm text-white/60">Format</div>
                        <div className="text-lg font-semibold text-white">
                          {audioData.audio.content_type}
                        </div>
                      </div>
                      <div className="rounded-lg bg-white/10 p-4">
                        <div className="text-sm text-white/60">Voice</div>
                        <div className="text-lg font-semibold text-white">
                          {
                            saudiArabicVoices.find(
                              (v) => v.voice_id === selectedVoice,
                            )?.name
                          }
                        </div>
                      </div>
                      {audioData.metadata && (
                        <>
                          <div className="rounded-lg bg-white/10 p-4">
                            <div className="text-sm text-white/60">
                              Characters
                            </div>
                            <div className="text-lg font-semibold text-white">
                              {audioData.metadata.character_count}
                            </div>
                          </div>
                          <div className="rounded-lg bg-white/10 p-4">
                            <div className="text-sm text-white/60">
                              Generation Time
                            </div>
                            <div className="text-lg font-semibold text-white">
                              {formatTime(
                                audioData.metadata.generation_time_ms,
                              )}
                            </div>
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {status === "FAILED" && (
                <div className="rounded-xl border border-red-500/20 bg-red-500/10 p-4 backdrop-blur-sm">
                  <div className="flex items-center gap-2">
                    <svg
                      className="h-5 w-5 text-red-400"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                    <h3 className="font-medium text-red-300">
                      Generation Failed
                    </h3>
                  </div>
                  <p className="mt-1 text-sm text-red-200">
                    {error ??
                      "Please check the console for details and try again."}
                  </p>
                  <button
                    onClick={() => {
                      setStatus(null);
                      setError(null);
                      setAudioData(null);
                      setAudioDuration(null);
                    }}
                    className="mt-3 rounded-lg bg-red-600 px-4 py-2 text-sm text-white hover:bg-red-700"
                  >
                    Try Again
                  </button>
                </div>
              )}
            </GlowingCard>
          </div>
        )}
      </div>
    </main>
  );
}

export default function ElevenLabsPlaygroundPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center">
          <div className="text-center">
            <div className="mx-auto mb-4 h-12 w-12 animate-spin rounded-full border-b-2 border-blue-500"></div>
            <p className="text-gray-300">Loading ElevenLabs Playground...</p>
          </div>
        </div>
      }
    >
      <ElevenLabsPageContent />
    </Suspense>
  );
}
