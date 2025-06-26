export const models = [
  {
    id: "fal-ai/kling-video/v2.1/master/text-to-video",
    name: "Kling Video v2.1 Master",
  },
  {
    id: "fal-ai/kling-video/v2/master/text-to-video",
    name: "Kling Video v2 Master",
  },
  {
    id: "fal-ai/kling-video/v1.6/pro/text-to-video",
    name: "Kling Video v1.6 Pro",
  },
  {
    id: "fal-ai/hunyuan-video",
    name: "Hunyuan Video",
  },
] as const;

export type Model = (typeof models)[number];
