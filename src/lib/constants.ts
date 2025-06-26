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
