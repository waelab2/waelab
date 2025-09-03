import { create } from "zustand";
import type { Model } from "../constants";
import type { ParameterValue } from "../parameter-registry";
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
  // Enhanced dynamic form system
  formValues: Record<string, ParameterValue>;
  validationErrors: Record<string, string | null>;
  generatedAudio: string | null;
  generatedImage: string | null;
  generatedVideo: string | null;
  isGenerating: boolean;
  cost: number | null;
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
  // Enhanced dynamic form actions
  setFormValue: (key: string, value: ParameterValue) => void;
  setFormValues: (values: Record<string, ParameterValue>) => void;
  clearFormValues: () => void;
  setValidationError: (key: string, error: string | null) => void;
  clearValidationErrors: () => void;
  setGeneratedAudio: (audio: string | null) => void;
  setGeneratedImage: (image: string | null) => void;
  setGeneratedVideo: (video: string | null) => void;
  setGenerating: (generating: boolean) => void;
  setCost: (cost: number) => void;
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

  // Dynamic parameters (backward compatibility)
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

  // Enhanced dynamic form system
  formValues: {},
  setFormValue: (key, value) =>
    set((state) => ({
      formValues: { ...state.formValues, [key]: value },
    })),
  setFormValues: (values) => set({ formValues: values }),
  clearFormValues: () => set({ formValues: {} }),

  validationErrors: {},
  setValidationError: (key, error) =>
    set((state) => ({
      validationErrors: { ...state.validationErrors, [key]: error },
    })),
  clearValidationErrors: () => set({ validationErrors: {} }),

  // Generation results
  generatedAudio: null,
  setGeneratedAudio: (audio) => set({ generatedAudio: audio }),

  generatedImage: null,
  setGeneratedImage: (image) => set({ generatedImage: image }),

  generatedVideo: null,
  setGeneratedVideo: (video) => set({ generatedVideo: video }),

  isGenerating: false,
  setGenerating: (generating) => set({ isGenerating: generating }),

  cost: null,
  setCost: (cost) => set({ cost }),

  resetModelParameters: () =>
    set({
      duration: undefined,
      aspect_ratio: undefined,
      negative_prompt: undefined,
      cfg_scale: undefined,
      prompt_optimizer: undefined,
      modelSchema: null,
      formValues: {},
      validationErrors: {},
      generatedAudio: null,
      generatedImage: null,
      generatedVideo: null,
      cost: null,
    }),
}));

export default useGenerateStore;
