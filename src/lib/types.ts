import { type fal } from "@fal-ai/client";

export type Status = "IN_QUEUE" | "IN_PROGRESS" | "COMPLETED";
export type Result = ReturnType<typeof fal.subscribe<"fal-ai/flux/dev">>;

export type AspectRatio = "16:9" | "9:16" | "1:1";
