"use client";

import Link from "next/link";
import { Suspense, useEffect, useState } from "react";
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

  // Calculate estimated cost based on text length
  useEffect(() => {
    const costPerChar = 0.3 / 50; // Rough estimate: $0.30 per 50 characters
    setEstimatedCost(text.length * costPerChar);
  }, [text]);

  useEffect(() => {
    setIsLoading(status === "PREPARING" || status === "GENERATING");
  }, [status]);

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

    const startTime = Date.now();

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

      // Get the audio blob
      const audioBlob = await response.blob();
      const audioUrl = URL.createObjectURL(audioBlob);

      // Calculate actual generation time
      const generationTime = Date.now() - startTime;

      // Create audio data structure
      const audioData = {
        audio: {
          url: audioUrl,
          file_size: audioBlob.size,
          content_type: audioBlob.type,
          file_name: `arabic-speech-${Date.now()}.mp3`,
        },
        metadata: {
          character_count: text.trim().length,
          generation_time_ms: generationTime,
          model_id: "elevenlabs/eleven_multilingual_v2",
          voice_id: selectedVoice,
        },
      };

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
      {/* Breadcrumb Navigation */}
      <div className="border-b bg-gray-50/50">
        <div className="mx-auto px-4 py-3 sm:px-6">
          <nav className="flex items-center space-x-2 text-sm">
            <Link
              href="/dashboard/playground"
              className="text-gray-300 transition-colors hover:text-gray-100"
            >
              Playground
            </Link>
            <span className="text-gray-400">/</span>
            <Link
              href="/dashboard/playground"
              className="text-gray-300 transition-colors hover:text-gray-100"
            >
              ElevenLabs
            </Link>
            <span className="text-gray-400">/</span>
            <span className="font-medium text-white">
              Eleven Multilingual v2
            </span>
          </nav>
        </div>
      </div>

      {/* Header Section */}
      <div className="border-b backdrop-blur-sm">
        <div className="mx-auto px-4 py-6 sm:px-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold tracking-tight text-white">
                Arabic Text-to-Speech
              </h1>
              <p className="mt-2 text-sm text-gray-300">
                Convert Arabic text to natural speech with Saudi accent using
                ElevenLabs
              </p>
              <div className="mt-3 space-y-2">
                <Link
                  href="/dashboard/playground"
                  className="inline-flex items-center gap-2 text-sm text-blue-600 transition-colors hover:text-blue-700"
                >
                  ← Back to Models
                </Link>
                <div className="text-sm text-gray-300">
                  <span className="font-medium">Model:</span> Eleven
                  Multilingual v2
                </div>
              </div>
            </div>
            {isLoading && (
              <div className="flex items-center gap-2 rounded-lg bg-blue-50 px-3 py-2">
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-blue-500 border-t-transparent"></div>
                <span className="text-sm font-medium text-blue-700">
                  {status === "PREPARING" && "Preparing..."}
                  {status === "GENERATING" && "Generating audio..."}
                </span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="mx-auto px-4 py-8 sm:px-6">
        {/* Top Row: Input and Voice Info */}
        <div className="mb-8 grid grid-cols-1 gap-8 lg:grid-cols-2">
          {/* Input Section */}
          <div className="space-y-6">
            <div className="rounded-lg border bg-white p-6 shadow-sm">
              <h2 className="mb-4 text-lg font-semibold text-white">
                Text Input
              </h2>

              {/* Arabic Text Input */}
              <div className="space-y-3">
                <label className="block text-sm font-medium text-gray-200">
                  Arabic Text
                </label>
                <textarea
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  placeholder="أدخل النص العربي هنا..."
                  className="min-h-[120px] w-full rounded-md border border-white/30 px-3 py-2 text-right focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none"
                  dir="rtl"
                  maxLength={5000}
                />
                <div className="text-right text-sm text-gray-400">
                  {text.length}/5000 characters
                </div>
              </div>

              {/* Voice Selection */}
              <div className="space-y-3">
                <label className="block text-sm font-medium text-gray-200">
                  Voice (Saudi Arabic)
                </label>
                <select
                  value={selectedVoice}
                  onChange={(e) => setSelectedVoice(e.target.value)}
                  className="w-full rounded-md border border-white/30 px-3 py-2 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none"
                >
                  {saudiArabicVoices.map((voice) => (
                    <option key={voice.voice_id} value={voice.voice_id}>
                      {voice.name} ({voice.gender})
                    </option>
                  ))}
                </select>
              </div>

              {/* Cost Estimation */}
              <div className="rounded-lg bg-gray-50 p-4">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-300">Estimated Cost:</span>
                  <span className="font-medium text-white">
                    ${estimatedCost.toFixed(4)}
                  </span>
                </div>
                <div className="mt-1 text-xs text-gray-400">
                  Based on character count and model pricing
                </div>
              </div>

              {/* Generate Button */}
              <button
                onClick={handleSubmit}
                disabled={isLoading || !text.trim() || !selectedVoice}
                className="w-full rounded-md bg-blue-600 px-4 py-2 text-white transition-colors hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-gray-300"
              >
                {isLoading ? "Generating..." : "Generate Arabic Speech"}
              </button>
            </div>
          </div>

          {/* Voice Info Section */}
          <div className="space-y-6">
            <div className="rounded-lg border bg-white p-6 shadow-sm">
              <h2 className="mb-4 text-lg font-semibold text-white">
                Voice Information
              </h2>

              {(() => {
                const selectedVoiceInfo = saudiArabicVoices.find(
                  (voice) => voice.voice_id === selectedVoice,
                );

                if (!selectedVoiceInfo) {
                  return (
                    <div className="py-8 text-center">
                      <p className="text-gray-400">No voice selected</p>
                    </div>
                  );
                }

                return (
                  <div className="space-y-4">
                    {/* Voice Name and Basic Info */}
                    <div className="space-y-2">
                      <h3 className="text-lg font-medium text-white">
                        {selectedVoiceInfo.name}
                      </h3>
                      <div className="flex flex-wrap gap-2">
                        <span className="inline-flex items-center rounded-full bg-blue-100 px-2.5 py-0.5 text-xs font-medium text-blue-800">
                          {selectedVoiceInfo.gender}
                        </span>
                        <span className="inline-flex items-center rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-medium text-green-800">
                          {selectedVoiceInfo.age}
                        </span>
                        <span className="inline-flex items-center rounded-full bg-purple-100 px-2.5 py-0.5 text-xs font-medium text-purple-800">
                          {selectedVoiceInfo.accent}
                        </span>
                      </div>
                    </div>

                    {/* Description */}
                    <div className="space-y-2">
                      <h4 className="text-sm font-medium text-gray-200">
                        Description
                      </h4>
                      <p className="text-sm leading-relaxed text-gray-300">
                        {selectedVoiceInfo.description}
                      </p>
                    </div>

                    {/* Use Case */}
                    <div className="space-y-2">
                      <h4 className="text-sm font-medium text-gray-200">
                        Best For
                      </h4>
                      <span className="inline-flex items-center rounded-md bg-amber-100 px-2.5 py-1 text-sm font-medium text-amber-800">
                        {selectedVoiceInfo.use_case
                          .replace(/_/g, " ")
                          .replace(/\b\w/g, (l) => l.toUpperCase())}
                      </span>
                    </div>

                    {/* Voice Preview */}
                    {selectedVoiceInfo.preview_url && (
                      <div className="space-y-2">
                        <h4 className="text-sm font-medium text-gray-200">
                          Voice Preview
                        </h4>
                        <audio
                          controls
                          className="w-full"
                          src={selectedVoiceInfo.preview_url}
                          preload="metadata"
                        >
                          Your browser does not support the audio element.
                        </audio>
                      </div>
                    )}

                    {/* Technical Details */}
                    <div className="rounded-lg bg-gray-50 p-3">
                      <h4 className="mb-2 text-sm font-medium text-gray-200">
                        Technical Details
                      </h4>
                      <div className="space-y-1 text-xs text-gray-300">
                        <div className="flex justify-between">
                          <span>Language:</span>
                          <span className="font-mono">
                            {selectedVoiceInfo.language}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span>Voice ID:</span>
                          <span className="font-mono text-xs break-all">
                            {selectedVoiceInfo.voice_id}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })()}
            </div>
          </div>
        </div>

        {/* Generated Audio Section - Only show after first generation */}
        {(audioData ?? isLoading ?? status === "FAILED") && (
          <div className="space-y-6 lg:col-span-2">
            <div className="rounded-lg border bg-white p-6 shadow-sm">
              <h2 className="mb-4 text-lg font-semibold text-white">
                Generated Audio
              </h2>

              {isLoading && (
                <div className="flex items-center justify-center py-12">
                  <div className="text-center">
                    <div className="mx-auto mb-4 h-12 w-12 animate-spin rounded-full border-b-2 border-blue-500"></div>
                    <p className="text-lg text-gray-300">
                      {status === "PREPARING" &&
                        "Preparing audio generation..."}
                      {status === "GENERATING" &&
                        "Converting text to speech..."}
                    </p>
                  </div>
                </div>
              )}

              {!audioData && !isLoading && (
                <div className="py-12 text-center">
                  <p className="text-gray-400">
                    Generated audio will appear here
                  </p>
                </div>
              )}

              {audioData && (
                <div className="space-y-4">
                  {/* Audio Player */}
                  <div className="space-y-3">
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
                    <div className="grid grid-cols-2 gap-4 text-sm text-gray-300">
                      <div>
                        <span className="font-medium">File Size:</span>{" "}
                        {(audioData.audio.file_size / 1024 / 1024).toFixed(2)}{" "}
                        MB
                      </div>
                      <div>
                        <span className="font-medium">Duration:</span>{" "}
                        {audioDuration
                          ? `${audioDuration.toFixed(1)}s`
                          : "Loading..."}
                      </div>
                      <div>
                        <span className="font-medium">Format:</span>{" "}
                        {audioData.audio.content_type}
                      </div>
                      <div>
                        <span className="font-medium">Voice:</span>{" "}
                        {
                          saudiArabicVoices.find(
                            (v) => v.voice_id === selectedVoice,
                          )?.name
                        }
                      </div>
                    </div>
                  </div>

                  {/* Generation Metadata */}
                  {audioData.metadata && (
                    <div className="rounded-lg bg-green-50 p-4">
                      <h3 className="mb-3 font-medium text-green-900">
                        Generation Details
                      </h3>
                      <div className="space-y-2 text-sm text-green-800">
                        <div className="flex justify-between">
                          <span className="font-medium">Characters:</span>
                          <span>{audioData.metadata.character_count}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="font-medium">Generation Time:</span>
                          <span>
                            {formatTime(audioData.metadata.generation_time_ms)}
                          </span>
                        </div>
                        <div className="border-t border-green-200 pt-2">
                          <div className="mb-1">
                            <span className="font-medium">Model:</span>
                          </div>
                          <div className="pl-2 font-mono text-xs">
                            {audioData.metadata.model_id}
                          </div>
                        </div>
                        <div>
                          <div className="mb-1">
                            <span className="font-medium">Voice ID:</span>
                          </div>
                          <div className="pl-2 font-mono text-xs">
                            {audioData.metadata.voice_id}
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Download Button */}
                  <div className="flex justify-end">
                    <button
                      onClick={() => {
                        const link = document.createElement("a");
                        link.href = audioData.audio.url;
                        link.download = audioData.audio.file_name;
                        document.body.appendChild(link);
                        link.click();
                        document.body.removeChild(link);
                      }}
                      className="rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50"
                    >
                      Download Audio
                    </button>
                  </div>
                </div>
              )}

              {status === "FAILED" && (
                <div className="rounded-lg bg-red-50 p-4">
                  <div className="text-center">
                    <p className="font-medium text-red-800">
                      Generation Failed
                    </p>
                    <p className="mt-1 text-sm text-red-600">
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
                      className="mt-3 rounded-md bg-red-600 px-4 py-2 text-sm text-white hover:bg-red-700"
                    >
                      Try Again
                    </button>
                  </div>
                </div>
              )}
            </div>
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
