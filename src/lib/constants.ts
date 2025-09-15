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

  // === RUNWAY MODELS ===
  {
    id: "runway/gen4_turbo",
    name: "Runway gen4_turbo (I2V)",
    price_per_second: 0.05, // 5 credits per second × $0.01 per credit = $0.05 per second
    category: "image-to-video",
    description:
      "Advanced image-to-video generation with high-quality motion and realistic transformations",
  },

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

  // === TEXT-TO-AUDIO MODELS ===
  {
    id: "elevenlabs/eleven_multilingual_v2",
    name: "Eleven Multilingual v2 (Arabic)",
    price_per_second: 0.3, // Estimate based on ElevenLabs pricing
    category: "text-to-audio",
    description:
      "Advanced multilingual TTS supporting Arabic with Saudi accent",
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

// === ELEVENLABS CONSTANTS ===

/**
 * Arabic voices for ElevenLabs - Verified working voice IDs
 * Includes voices with Egyptian, Moroccan, Modern Standard Arabic, Levantine, and Jordanian accents
 * All voices are confirmed to be available and working with the ElevenLabs API
 */
export const saudiArabicVoices = [
  // Male voices
  {
    voice_id: "IES4nrmZdUBHByLBde0P",
    name: "Haytham - Conversation (Egyptian)",
    language: "ar",
    accent: "egyptian",
    gender: "male",
    age: "middle_aged",
    description:
      "Middle aged Arab male voice, warm, energetic, suitable for casual conversations, voice acting and story telling",
    preview_url:
      "https://storage.googleapis.com/eleven-public-prod/database/user/9QU6MqZNA2gQa3xJofEAkVetJtm1/voices/IES4nrmZdUBHByLBde0P/k0uwHjffW70gT6nJ9gW5.mp3",
    use_case: "narrative_story",
  },
  {
    voice_id: "A9ATTqUUQ6GHu0coCz8t",
    name: "Hamid (Moroccan)",
    language: "ar",
    accent: "moroccan",
    gender: "male",
    age: "young",
    description: "Young voice male with a pleasant tone. Perfect for news.",
    preview_url:
      "https://storage.googleapis.com/eleven-public-prod/custom/voices/A9ATTqUUQ6GHu0coCz8t/52WpzlQwppmSVSQXa65L.mp3",
    use_case: "entertainment_tv",
  },
  {
    voice_id: "UR972wNGq3zluze0LoIp",
    name: "Haytham (Egyptian)",
    language: "ar",
    accent: "egyptian",
    gender: "male",
    age: "middle_aged",
    description:
      "Middle aged warm male voice good for narration, podcast, voice overs, voice acting.",
    preview_url:
      "https://storage.googleapis.com/eleven-public-prod/database/user/9QU6MqZNA2gQa3xJofEAkVetJtm1/voices/UR972wNGq3zluze0LoIp/5ME1JisfmtWiIpzDDyIY.mp3",
    use_case: "narrative_story",
  },
  {
    voice_id: "R6nda3uM038xEEKi7GFl",
    name: "Anas (Modern Standard Arabic)",
    language: "ar",
    accent: "modern standard",
    gender: "male",
    age: "middle_aged",
    description:
      "Middle-aged Arabic male with a gentle conversational tone. Ideal for engaging listeners.",
    preview_url:
      "https://storage.googleapis.com/eleven-public-prod/database/user/COWGBw0EVLcZa92K5IDgvpaUttd2/voices/R6nda3uM038xEEKi7GFl/hyjPYHgaCHfuSSap6ALl.mp3",
    use_case: "narrative_story",
  },

  // Female voices
  {
    voice_id: "mRdG9GYEjJmIzqbYTidv",
    name: "Sana (Modern Standard Arabic)",
    language: "ar",
    accent: "modern standard",
    gender: "female",
    age: "middle_aged",
    description:
      "A middle-aged woman with an Arabic accent and a slightly soft quality to her voice. The tone is upbeat, a little bouncy and direct. Great for news, media texts, documentaries, podcast ads, and audiobooks.",
    preview_url:
      "https://storage.googleapis.com/eleven-public-prod/custom/voices/mRdG9GYEjJmIzqbYTidv/QDWxPOKqyxeNJEgcmVIY.mp3",
    use_case: "narrative_story",
  },
  {
    voice_id: "u0TsaWvt0v8migutHM3M",
    name: "GHIZLANE (Modern Standard Arabic)",
    language: "ar",
    accent: "modern standard",
    gender: "female",
    age: "middle_aged",
    description:
      "A smooth, balanced, and tranquil female voice, perfectly suited for podcasts, YouTube content, and news broadcasts. Its clear and pristine quality is paired with an exceptional ability to communicate information with precision and professionalism.",
    preview_url:
      "https://storage.googleapis.com/eleven-public-prod/database/user/FLoNmOwfdyVstAmMeF1WDQhJF6k2/voices/u0TsaWvt0v8migutHM3M/oxi7BOeX3pB7YElCrYvu.mp3",
    use_case: "narrative_story",
  },
  {
    voice_id: "a1KZUXKFVFDOb33I1uqr",
    name: "Salma - Conversational Expressive (Levantine)",
    language: "ar",
    accent: "levantine",
    gender: "female",
    age: "young",
    description:
      "Salma is a young and talented artist from Dubai. Her extensive experience is not just in voice but also in the Arabic language. Perfect for voiceovers, audiobooks, commercials, podcasts, and language learning content.",
    preview_url:
      "https://storage.googleapis.com/eleven-public-prod/database/workspace/ed9b05e6324c457685490352e9a1ec90/voices/a1KZUXKFVFDOb33I1uqr/UiaMs7jj02K2CGN2TPAU.mp3",
    use_case: "conversational",
  },
  {
    voice_id: "jAAHNNqlbAX9iWjJPEtE",
    name: "Sara - Kind & Expressive (Jordanian)",
    language: "ar",
    accent: "jordanian",
    gender: "female",
    age: "young",
    description:
      "This voice clone is based on a natural female voice with a calm, expressive, and intelligent tone. It reflects a neutral Middle Eastern accent with clear articulation and a warm delivery, making it ideal for AI assistants, educational content, and professional narrations.",
    preview_url:
      "https://storage.googleapis.com/eleven-public-prod/database/user/DwdAk2uej6WPGjINOlwLmUTaLvP2/voices/jAAHNNqlbAX9iWjJPEtE/uQYquZVfZqWsdvz9SKxs.mp3",
    use_case: "social_media",
  },
  {
    voice_id: "VwC51uc4PUblWEJSPzeo",
    name: "Abrar Sabbah (Modern Standard Arabic)",
    language: "ar",
    accent: "modern standard",
    gender: "female",
    age: "middle_aged",
    description:
      "A young Arabic female voice perfect for podcasts, advertisements, documentaries, news, stories.",
    preview_url:
      "https://storage.googleapis.com/eleven-public-prod/database/user/DbfkQZv5ZVMdj86CaPWYiB0CRk82/voices/VwC51uc4PUblWEJSPzeo/081ff9df-1d74-47c0-9d69-5a1f488046bc.mp3",
    use_case: "narrative_story",
  },
  {
    voice_id: "4wf10lgibMnboGJGCLrP",
    name: "Farah - Premium Arabic Female (Jordanian)",
    language: "ar",
    accent: "jordanian",
    gender: "female",
    age: "young",
    description:
      "A premium Arabic female voice with a warm, clear, and expressive tone, ideal for ads, narration, storytelling, audiobooks, YouTube content, podcasts, educational videos, and AI avatars. Features a natural Levantine accent (Jordanian/Ammani) blended with modern Arabic fluency.",
    preview_url:
      "https://storage.googleapis.com/eleven-public-prod/database/user/jhEhUZqX3mQ2LTrq3iBVeixuIsy1/voices/4wf10lgibMnboGJGCLrP/10Ff0P9ozKLVa4QSSIvC.mp3",
    use_case: "advertisement",
  },
];

/**
 * Get ElevenLabs URLs for API endpoints
 */
export function getElevenLabsUrls() {
  return {
    voices_url: `/api/elevenlabs/voices`,
    tts_url: `/api/elevenlabs/text-to-speech`,
  };
}

/**
 * Get Runway URLs for API endpoints
 */
export function getRunwayUrls() {
  return {
    gen4_turbo_url: `/api/runway/gen4_turbo`,
  };
}
