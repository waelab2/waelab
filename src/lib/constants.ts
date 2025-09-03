export const models = [
  {
    id: "fal-ai/kling-video/v2.1/master/text-to-video",
    name: "Kling Video v2.1 Master",
    price_per_second: 0.28,
  },
  {
    id: "fal-ai/kling-video/v2/master/text-to-video",
    name: "Kling Video v2 Master",
    price_per_second: 0.28,
  },
  {
    id: "fal-ai/kling-video/v1.6/pro/text-to-video",
    name: "Kling Video v1.6 Pro",
    price_per_second: 0.095,
  },
  {
    id: "fal-ai/minimax/hailuo-02/standard/text-to-video",
    name: "Hailuo 02 Standard",
    price_per_second: 0.045,
  },
  {
    id: "moonvalley/marey/t2v",
    name: "Marey Realism V1.5",
    price_per_second: 0.15,
  },
  {
    id: "fal-ai/pixverse/v5/text-to-video",
    name: "Pixverse V5",
    price_per_second: 0.12,
  },
  {
    id: "fal-ai/veo3/fast",
    name: "Veo3 Fast",
    price_per_second: 0.25,
  },
  {
    id: "fal-ai/veo3",
    name: "Veo3",
    price_per_second: 0.35,
  },
] as const;

export type Model = (typeof models)[number];

export function getModelUrls(modelId: string) {
  return {
    schema_url: `/api/fal/schema?endpoint_id=${encodeURIComponent(modelId)}`,
    llms_url: `/api/fal/llms?model_id=${encodeURIComponent(modelId)}`,
  };
}

export function getModelPreviewUrl(modelId: string): string | null {
  const fallbackUrls: Record<string, string> = {
    "fal-ai/kling-video/v2.1/master/text-to-video":
      "https://v3.fal.media/files/lion/0wTlhR7GCXFI-_BZXGy99_output.mp4",
    "fal-ai/kling-video/v2/master/text-to-video":
      "https://v3.fal.media/files/rabbit/5fu6OSZdvV825r2s_c0S8_output.mp4",
    "fal-ai/kling-video/v1.6/pro/text-to-video":
      "https://v2.fal.media/files/fb33a862b94d4d7195e610e4cbc5d392_output.mp4",
    "fal-ai/minimax/hailuo-02/standard/text-to-video":
      "https://v3.fal.media/files/kangaroo/_qEOfY3iKHsc86kqHUUh2_output.mp4",
    "moonvalley/marey/t2v":
      "https://v3.fal.media/files/penguin/Q-2dpcjIoQOldJRL3grsc_output.mp4",
    "fal-ai/pixverse/v5/text-to-video":
      "https://storage.googleapis.com/falserverless/model_tests/video_models/output-4.mp4",
    "fal-ai/veo3/fast":
      "https://v3.fal.media/files/penguin/Q-2dpcjIoQOldJRL3grsc_output.mp4",
    "fal-ai/veo3":
      "https://v3.fal.media/files/penguin/Q-2dpcjIoQOldJRL3grsc_output.mp4",
  };

  return fallbackUrls[modelId] ?? null;
}
