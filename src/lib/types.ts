import { type fal } from "@fal-ai/client";

export type Status = "IN_QUEUE" | "IN_PROGRESS" | "COMPLETED";
export type Result = ReturnType<typeof fal.subscribe<"fal-ai/flux/dev">>;
