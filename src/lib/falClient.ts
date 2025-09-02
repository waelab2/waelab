import { fal } from "@fal-ai/client";
import { falMock, type MockFalClient } from "./mocks/falMock";

// Type that unifies both real and mock clients
import type { VideoGenerationInput, VideoGenerationOutput } from "~/lib/types";

export interface FalClient {
  config: (config: { proxyUrl: string }) => void;
  subscribe: (
    model: string,
    options: {
      input: VideoGenerationInput;
      pollInterval: number;
      logs: boolean;
      onQueueUpdate: (update: { status: string }) => void;
    },
  ) => Promise<{ data: VideoGenerationOutput }>;
}

// Environment-based client selection
export const falClient: FalClient =
  process.env.NODE_ENV === "development" ? falMock : fal;

// Export the type for use in components
export type { MockFalClient };
