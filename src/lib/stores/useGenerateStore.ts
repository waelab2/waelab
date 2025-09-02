import { create } from "zustand";
import type { Model } from "../constants";
import type { AspectRatio, Status } from "../types";
import type { ModelSchema } from "../utils/schema-fetcher";

type State = {
  status: null | Status;
  model: Model["id"];
  // Dynamic parameters based on model schema
  prompt: string;
  duration?: number;
  aspect_ratio?: AspectRatio;
  negative_prompt?: string;
  cfg_scale?: number;
  prompt_optimizer?: boolean;
  // Model metadata
  modelSchema: ModelSchema | null;
  isLoadingModel: boolean;
};

type Actions = {
  setStatus: (status: null | Status) => void;
  setModel: (model: Model["id"]) => void;
  setPrompt: (prompt: string) => void;
  setDuration: (duration: number) => void;
  setAspectRatio: (aspect_ratio: AspectRatio) => void;
  setNegativePrompt: (negative_prompt: string) => void;
  setCfgScale: (cfg_scale: number) => void;
  setPromptOptimizer: (prompt_optimizer: boolean) => void;
  setModelSchema: (schema: ModelSchema | null) => void;
  setLoadingModel: (loading: boolean) => void;
  // Reset parameters when model changes
  resetModelParameters: () => void;
};

const useGenerateStore = create<State & Actions>()((set, get) => ({
  status: null,
  setStatus: (status) => set({ status }),

  model: "fal-ai/kling-video/v2.1/master/text-to-video",
  setModel: (model) => {
    set({ model });
    // Reset parameters when model changes
    get().resetModelParameters();
  },

  // Dynamic parameters
  prompt: "",
  setPrompt: (prompt) => set({ prompt }),

  duration: undefined,
  setDuration: (duration) => set({ duration }),

  aspect_ratio: undefined,
  setAspectRatio: (aspect_ratio) => set({ aspect_ratio }),

  negative_prompt: undefined,
  setNegativePrompt: (negative_prompt) => set({ negative_prompt }),

  cfg_scale: undefined,
  setCfgScale: (cfg_scale) => set({ cfg_scale }),

  prompt_optimizer: undefined,
  setPromptOptimizer: (prompt_optimizer) => set({ prompt_optimizer }),

  // Model metadata
  modelSchema: null,
  setModelSchema: (schema) => set({ modelSchema: schema }),

  isLoadingModel: false,
  setLoadingModel: (loading) => set({ isLoadingModel: loading }),

  resetModelParameters: () =>
    set({
      duration: undefined,
      aspect_ratio: undefined,
      negative_prompt: undefined,
      cfg_scale: undefined,
      prompt_optimizer: undefined,
      modelSchema: null,
    }),
}));

export default useGenerateStore;
