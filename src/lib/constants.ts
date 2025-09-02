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
  };

  return fallbackUrls[modelId] ?? null;
}
