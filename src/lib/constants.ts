export const models = [
  // === TEXT-TO-VIDEO MODELS ===
  {
    id: "fal-ai/kling-video/v2.1/master/text-to-video",
    name: "Kling Video v2.1 Master",
    price_per_second: 0.28,
    category: "text-to-video",
  },
  {
    id: "fal-ai/kling-video/v2/master/text-to-video",
    name: "Kling Video v2 Master",
    price_per_second: 0.28,
    category: "text-to-video",
  },
  {
    id: "fal-ai/kling-video/v1.6/pro/text-to-video",
    name: "Kling Video v1.6 Pro",
    price_per_second: 0.095,
    category: "text-to-video",
  },
  {
    id: "fal-ai/minimax/hailuo-02/standard/text-to-video",
    name: "Hailuo 02 Standard",
    price_per_second: 0.045,
    category: "text-to-video",
  },
  {
    id: "moonvalley/marey/t2v",
    name: "Marey Realism V1.5",
    price_per_second: 0.3,
    category: "text-to-video",
  },
  {
    id: "fal-ai/pixverse/v5/text-to-video",
    name: "Pixverse V5",
    price_per_second: 0.08,
    category: "text-to-video",
  },
  {
    id: "fal-ai/veo3/fast",
    name: "Veo3 Fast",
    price_per_second: 0.4,
    category: "text-to-video",
  },
  {
    id: "fal-ai/veo3",
    name: "Veo3",
    price_per_second: 0.75,
    category: "text-to-video",
  },

  // === IMAGE-TO-VIDEO MODELS ===

  // Kling Models (100% Compatible - Phase 1)
  {
    id: "fal-ai/kling-video/v2.1/master/image-to-video",
    name: "Kling 2.1 Master (I2V)",
    price_per_second: 0.28,
    category: "image-to-video",
    description:
      "Premium endpoint for Kling 2.1 with unparalleled motion fluidity and cinematic visuals",
  },
  {
    id: "fal-ai/kling-video/v2.1/standard/image-to-video",
    name: "Kling 2.1 Standard (I2V)",
    price_per_second: 0.05,
    category: "image-to-video",
    description:
      "Cost-efficient Kling 2.1 with high-quality image-to-video generation",
  },
  {
    id: "fal-ai/kling-video/v2/master/image-to-video",
    name: "Kling 2.0 Master (I2V)",
    price_per_second: 0.28,
    category: "image-to-video",
    description:
      "Kling 2.0 Master for high-quality image-to-video with advanced motion control",
  },
  {
    id: "fal-ai/kling-video/v1.6/pro/image-to-video",
    name: "Kling 1.6 Pro (I2V)",
    price_per_second: 0.095,
    category: "image-to-video",
    description:
      "Professional Kling 1.6 with advanced parameters including aspect ratio control",
  },

  // MiniMax Models (100% Compatible - Phase 1)
  {
    id: "fal-ai/minimax/hailuo-02/standard/image-to-video",
    name: "MiniMax Hailuo 02 (I2V)",
    price_per_second: 0.045,
    category: "image-to-video",
    description:
      "Advanced image-to-video with 768p/512p resolutions and prompt optimization",
  },
  {
    id: "fal-ai/minimax/video-01/image-to-video",
    name: "MiniMax Video 01 (I2V)",
    price_per_second: 0.01,
    category: "image-to-video",
    description:
      "Motion and transformation focused video generation with prompt optimization",
  },

  // Veo2 (100% Compatible - Phase 1)
  {
    id: "fal-ai/veo2/image-to-video",
    name: "Veo 2 (I2V)",
    price_per_second: 0.5,
    category: "image-to-video",
    description:
      "Realistic motion with very high quality output and flexible duration options",
  },

  // Seedance Pro (95% Compatible - Phase 2)
  {
    id: "fal-ai/bytedance/seedance/v1/pro/image-to-video",
    name: "Seedance 1.0 Pro (I2V)",
    price_per_second: 0.124,
    category: "image-to-video",
    description:
      "High quality 1080p video generation with advanced camera and safety controls",
  },

  // Wan Models (90% Compatible - Phase 2)
  {
    id: "fal-ai/wan-i2v",
    name: "Wan 2.1 (I2V)",
    price_per_second: 0.08,
    category: "image-to-video",
    description:
      "High visual quality with motion diversity and advanced inference controls",
  },
  {
    id: "fal-ai/wan-pro/image-to-video",
    name: "Wan 2.1 Pro (I2V)",
    price_per_second: 0.16,
    category: "image-to-video",
    description: "Premium 1080p videos at 30fps with up to 6 seconds duration",
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
    // Text-to-Video Models
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

    // Image-to-Video Models
    "fal-ai/kling-video/v2.1/master/image-to-video":
      "https://v3.fal.media/files/rabbit/YuUWKFq508zzWIiQ0i2vt_output.mp4",
    "fal-ai/kling-video/v2.1/standard/image-to-video":
      "https://v3.fal.media/files/koala/17e3xh08J4_PkHS_0cbwF_output.mp4",
    "fal-ai/kling-video/v2/master/image-to-video":
      "https://v3.fal.media/files/koala/VvGXP5xEhTR9ovGjpulJ7_output.mp4",
    "fal-ai/kling-video/v1.6/pro/image-to-video":
      "https://storage.googleapis.com/falserverless/kling/kling_i2v_output.mp4",
    "fal-ai/minimax/hailuo-02/standard/image-to-video":
      "https://v3.fal.media/files/monkey/xF9OsLwGjjNURyAxD8RM1_output.mp4",
    "fal-ai/minimax/video-01/image-to-video":
      "https://fal.media/files/monkey/vNZqQV_WgC9MhoidClLyw_output.mp4",
    "fal-ai/veo2/image-to-video":
      "https://v3.fal.media/files/monkey/jOYy3rvGB33vumzulpXd5_output.mp4",
    "fal-ai/bytedance/seedance/v1/pro/image-to-video":
      "https://storage.googleapis.com/falserverless/example_inputs/seedance_pro_i2v.mp4",
    "fal-ai/wan-i2v":
      "https://storage.googleapis.com/falserverless/gallery/wan-i2v-example.mp4",
    "fal-ai/wan-pro/image-to-video":
      "https://fal.media/files/kangaroo/K1hB3k-IXBzq9rz1kNOxy.mp4",
  };

  return fallbackUrls[modelId] ?? null;
}
