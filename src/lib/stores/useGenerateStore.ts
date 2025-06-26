import { create } from "zustand";
import type { Model } from "../constants";

type State = {
  model: Model["id"];
};

type Actions = {
  setModel: (model: Model["id"]) => void;
};

const useGenerateStore = create<State & Actions>()((set) => ({
  model: "fal-ai/kling-video/v2.1/master/text-to-video",
  setModel: (model: Model["id"]) => set({ model }),
}));

export default useGenerateStore;
