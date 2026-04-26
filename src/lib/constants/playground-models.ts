import { models, type Model } from "~/lib/constants";
import {
  TAVUS_VIDEO_ESTIMATED_CREDITS,
  TAVUS_VIDEO_MODEL_ID,
} from "~/lib/constants/tavus";

/**
 * Tavus appears only in the playground catalog — not in core `models`, so the
 * fal-backed generate flow never receives `tavus/video` as a selectable model.
 */
export type TavusPlaygroundModel = {
  readonly id: typeof TAVUS_VIDEO_MODEL_ID;
  readonly name: string;
  readonly category: Model["category"];
  /** Present for flat per-job pricing in playground cards. */
  readonly flat_job_credits: number;
  readonly price_per_second: number;
  readonly description: string;
  readonly generation_time_minutes?: null;
};

export type PlaygroundModel = Model | TavusPlaygroundModel;

export function isFlatJobPlaygroundModel(
  model: PlaygroundModel,
): model is TavusPlaygroundModel {
  return "flat_job_credits" in model;
}

export const tavusPlaygroundModel = {
  id: TAVUS_VIDEO_MODEL_ID,
  name: "Tavus Talking Head (script → avatar)",
  category: "text-to-video",
  flat_job_credits: TAVUS_VIDEO_ESTIMATED_CREDITS,
  price_per_second: 0,
  description:
    "Recorded avatar video from script or your own audio URL; pick a stock Tavus replica on the generation page.",
  generation_time_minutes: null,
} as const satisfies TavusPlaygroundModel;

/** All models shown on the playground hub (fal, Runway, ElevenLabs, Tavus). */
export const playgroundModels: PlaygroundModel[] = [
  ...models,
  tavusPlaygroundModel,
];
