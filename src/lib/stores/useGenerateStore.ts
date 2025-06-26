import { create } from "zustand";
import type { Model } from "../constants";
import type { AspectRatio } from "../types";

type State = {
  model: Model["id"];
  duration: number;
  aspect_ratio: null | AspectRatio;
};

type Actions = {
  setModel: (model: Model["id"]) => void;
  setDuration: (duration: number) => void;
  setAspectRatio: (aspect_ratio: AspectRatio) => void;
};

const useGenerateStore = create<State & Actions>()((set) => ({
  model: "fal-ai/kling-video/v2.1/master/text-to-video",
  setModel: (model: Model["id"]) => set({ model }),

  duration: 5,
  setDuration: (duration: number) => set({ duration }),

  aspect_ratio: "16:9",
  setAspectRatio: (aspect_ratio: AspectRatio) => set({ aspect_ratio }),
}));

export default useGenerateStore;
