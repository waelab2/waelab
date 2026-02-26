import { auth } from "@clerk/nextjs/server";
import { ConvexHttpClient } from "convex/browser";
import { NextResponse, type NextRequest } from "next/server";
import {
  TARGET_URL_HEADER,
  fromHeaders,
  handleRequest,
} from "@fal-ai/server-proxy";
import { env } from "~/env";
import {
  calculateCreditsForDurationSeconds,
  parseDurationSeconds,
} from "~/lib/constants/credits";
import { api as convexApi } from "../../../../../convex/_generated/api";

const convexClient = new ConvexHttpClient(env.NEXT_PUBLIC_CONVEX_URL);
const FAL_HOST_REGEX = /(\.|^)fal\.(run|ai)$/;
const DEFAULT_FAL_DURATION_SECONDS = 5;
const FALLBACK_FAL_CREDITS_PER_SECOND = 5;

type FalOperation =
  | { type: "submit"; modelId: string }
  | { type: "status"; requestId: string }
  | { type: "result"; requestId: string }
  | { type: "cancel"; requestId: string }
  | { type: "other" };

function parseFalOperation(targetUrl: string, method: string): FalOperation {
  try {
    const parsed = new URL(targetUrl);
    const path = parsed.pathname.replace(/\/+$/, "");
    const requestMatch = /^\/(.+)\/requests\/([^/]+)(?:\/(status|cancel))?$/.exec(
      path,
    );

    if (requestMatch) {
      const requestId = decodeURIComponent(requestMatch[2] ?? "");
      const tail = requestMatch[3];

      if (tail === "status" && method === "GET") {
        return { type: "status", requestId };
      }

      if (tail === "cancel" && method === "PUT") {
        return { type: "cancel", requestId };
      }

      if (!tail && method === "GET") {
        return { type: "result", requestId };
      }

      return { type: "other" };
    }

    if (method === "POST") {
      const modelId = decodeURIComponent(path.replace(/^\/+/, ""));
      if (modelId.length > 0) {
        return { type: "submit", modelId };
      }
    }
  } catch {
    return { type: "other" };
  }

  return { type: "other" };
}

function extractFalRequestId(payload: unknown): string | undefined {
  if (!payload || typeof payload !== "object") {
    return undefined;
  }

  const root = payload as Record<string, unknown>;
  const direct =
    typeof root.request_id === "string"
      ? root.request_id
      : typeof root.requestId === "string"
        ? root.requestId
        : undefined;
  if (direct) {
    return direct;
  }

  const nestedData =
    root.data && typeof root.data === "object"
      ? (root.data as Record<string, unknown>)
      : undefined;
  if (!nestedData) {
    return undefined;
  }

  if (typeof nestedData.request_id === "string") {
    return nestedData.request_id;
  }
  if (typeof nestedData.requestId === "string") {
    return nestedData.requestId;
  }

  return undefined;
}

function extractFalStatus(payload: unknown): string | undefined {
  if (!payload || typeof payload !== "object") {
    return undefined;
  }

  const root = payload as Record<string, unknown>;
  if (typeof root.status === "string") {
    return root.status;
  }

  const nestedData =
    root.data && typeof root.data === "object"
      ? (root.data as Record<string, unknown>)
      : undefined;
  if (nestedData && typeof nestedData.status === "string") {
    return nestedData.status;
  }

  return undefined;
}

function safeParseJson(input: string | undefined): unknown {
  if (!input) return null;
  try {
    return JSON.parse(input) as unknown;
  } catch {
    return null;
  }
}

function stringifyForLog(payload: unknown): string {
  try {
    return JSON.stringify(payload, null, 2);
  } catch {
    return String(payload);
  }
}

function buildReservationId(userId: string): string {
  return `fal_${userId}_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;
}

function estimateFalCredits(modelId: string, durationSeconds: number): number {
  try {
    return calculateCreditsForDurationSeconds(modelId, durationSeconds);
  } catch {
    // Conservative fallback for unknown model IDs.
    return Math.max(
      1,
      Math.ceil(durationSeconds * FALLBACK_FAL_CREDITS_PER_SECOND),
    );
  }
}

function mapCreditError(error: unknown): NextResponse {
  const message =
    error instanceof Error ? error.message : "Unable to process credits";

  if (message.includes("Insufficient credits")) {
    return NextResponse.json(
      { error: "Insufficient credits" },
      { status: 402 },
    );
  }

  if (message.includes("Active subscription required")) {
    return NextResponse.json(
      { error: "Active subscription required" },
      { status: 402 },
    );
  }

  return NextResponse.json(
    { error: message },
    { status: 500 },
  );
}

async function finalizeReservationByExternalRequestId(args: {
  userId: string;
  externalRequestId: string;
  success: boolean;
  actualCredits?: number;
}) {
  try {
    return await convexClient.mutation(convexApi.credits.finalizeCreditReservation, {
      userId: args.userId,
      externalRequestId: args.externalRequestId,
      success: args.success,
      actualCredits: args.actualCredits,
    });
  } catch (error) {
    console.error("Failed to finalize credit reservation:", error);
    return null;
  }
}

async function finalizeReservationById(args: {
  userId: string;
  reservationId: string;
  success: boolean;
  actualCredits?: number;
}) {
  try {
    return await convexClient.mutation(convexApi.credits.finalizeCreditReservation, {
      userId: args.userId,
      reservationId: args.reservationId,
      success: args.success,
      actualCredits: args.actualCredits,
    });
  } catch (error) {
    console.error("Failed to finalize credit reservation:", error);
    return null;
  }
}

async function finalizeFallbackFalReservation(args: {
  userId: string;
  success: boolean;
  actualCredits?: number;
}) {
  try {
    const fallbackReservationId = await convexClient.query(
      convexApi.credits.getLatestReservedReservationIdForUserService,
      {
        userId: args.userId,
        service: "fal",
      },
    );

    if (!fallbackReservationId) {
      return null;
    }

    return await finalizeReservationById({
      userId: args.userId,
      reservationId: fallbackReservationId,
      success: args.success,
      actualCredits: args.actualCredits,
    });
  } catch (error) {
    console.error("Failed fallback Fal reservation finalization:", error);
    return null;
  }
}

async function handleFalProxy(request: NextRequest) {
  const method = request.method.toUpperCase();
  if (!["GET", "POST", "PUT"].includes(method)) {
    return NextResponse.json(
      { error: "Method not allowed" },
      { status: 405 },
    );
  }

  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json(
      { error: "Unauthorized" },
      { status: 401 },
    );
  }

  const targetUrl = request.headers.get(TARGET_URL_HEADER);
  if (!targetUrl) {
    return NextResponse.json(
      { error: `Missing ${TARGET_URL_HEADER} header` },
      { status: 400 },
    );
  }

  let parsedTargetUrl: URL;
  try {
    parsedTargetUrl = new URL(targetUrl);
  } catch {
    return NextResponse.json(
      { error: `Invalid ${TARGET_URL_HEADER} header` },
      { status: 412 },
    );
  }

  if (!FAL_HOST_REGEX.test(parsedTargetUrl.host)) {
    return NextResponse.json(
      { error: `Invalid ${TARGET_URL_HEADER} header` },
      { status: 412 },
    );
  }

  const body = method === "GET" ? undefined : await request.text();
  const operation = parseFalOperation(targetUrl, method);

  let reservationId: string | undefined;
  let estimatedCredits: number | undefined;
  let reservedRequestId: string | undefined;

  if (operation.type === "submit") {
    const payload = safeParseJson(body) as
      | { input?: { duration?: number | string } }
      | null;
    const durationSeconds = parseDurationSeconds(
      payload?.input?.duration,
      DEFAULT_FAL_DURATION_SECONDS,
    );
    estimatedCredits = estimateFalCredits(operation.modelId, durationSeconds);
    reservationId = buildReservationId(userId);

    try {
      await convexClient.mutation(convexApi.credits.reserveCreditsForGeneration, {
        userId,
        service: "fal",
        modelId: operation.modelId,
        estimatedCredits,
        reservationId,
      });
    } catch (error) {
      return mapCreditError(error);
    }
  }

  const responseHeaders = new Headers();

  try {
    const proxiedResponse = await handleRequest({
      id: "nextjs-app-router-guarded",
      method,
      getRequestBody: async () => body,
      getHeaders: () => fromHeaders(request.headers),
      getHeader: (name) => request.headers.get(name),
      sendHeader: (name, value) => responseHeaders.set(name, value),
      respondWith: (status, data) =>
        NextResponse.json(data, {
          status,
          headers: responseHeaders,
        }),
      sendResponse: async (res) => {
        const contentType = res.headers.get("content-type") ?? "";
        let payload: unknown = null;
        let textPayload: string | undefined;
        const isJsonResponse = contentType.includes("application/json");

        if (isJsonResponse) {
          payload = await res.json().catch(() => null);
        } else {
          textPayload = await res.text();
          payload = safeParseJson(textPayload) ?? textPayload;
          if (!res.ok) {
            console.error("Fal proxy upstream error response", {
              method,
              targetUrl,
              status: res.status,
              body: stringifyForLog(payload),
            });
          }
        }

        if (!res.ok) {
          console.error("Fal proxy upstream error response", {
            method,
            targetUrl,
            status: res.status,
            body: stringifyForLog(payload),
          });
        }

        if (res.ok && operation.type === "submit" && reservationId) {
          const requestId = extractFalRequestId(payload);

          if (requestId) {
            reservedRequestId = requestId;
            try {
              await convexClient.mutation(
                convexApi.credits.attachExternalRequestIdToReservation,
                {
                  reservationId,
                  externalRequestId: requestId,
                },
              );
            } catch (error) {
              console.error("Failed to attach Fal external request ID:", error);
            }
          } else {
            await finalizeReservationById({
              userId,
              reservationId,
              success: false,
            });
            return NextResponse.json(
              {
                error:
                  "Fal proxy could not read request ID from submit response. Credits were released.",
              },
              { status: 502 },
            );
          }
        }

        if (res.ok && operation.type === "result") {
          const requestId = extractFalRequestId(payload) ?? operation.requestId;

          if (requestId) {
            const finalizeResult = await finalizeReservationByExternalRequestId({
              userId,
              externalRequestId: requestId,
              success: true,
              actualCredits: estimatedCredits,
            });
            if (!finalizeResult) {
              await finalizeFallbackFalReservation({
                userId,
                success: true,
                actualCredits: estimatedCredits,
              });
            }
          }
        }

        if (res.ok && operation.type === "status") {
          const status = extractFalStatus(payload);
          const requestId = extractFalRequestId(payload) ?? operation.requestId;

          if (requestId && status && ["FAILED", "CANCELLED"].includes(status)) {
            const finalizeResult = await finalizeReservationByExternalRequestId({
              userId,
              externalRequestId: requestId,
              success: false,
            });
            if (!finalizeResult) {
              await finalizeFallbackFalReservation({
                userId,
                success: false,
              });
            }
          }
        }

        if (res.ok && operation.type === "cancel") {
          const finalizeResult = await finalizeReservationByExternalRequestId({
            userId,
            externalRequestId: operation.requestId,
            success: false,
          });
          if (!finalizeResult) {
            await finalizeFallbackFalReservation({
              userId,
              success: false,
            });
          }
        }

        if (!res.ok && operation.type === "status") {
          const finalizeResult = await finalizeReservationByExternalRequestId({
            userId,
            externalRequestId: operation.requestId,
            success: false,
          });
          if (!finalizeResult) {
            await finalizeFallbackFalReservation({
              userId,
              success: false,
            });
          }
        }

        if (!res.ok && operation.type === "result") {
          const finalizeResult = await finalizeReservationByExternalRequestId({
            userId,
            externalRequestId: operation.requestId,
            success: false,
          });
          if (!finalizeResult) {
            await finalizeFallbackFalReservation({
              userId,
              success: false,
            });
          }
        }

        if (!res.ok && operation.type === "cancel") {
          const finalizeResult = await finalizeReservationByExternalRequestId({
            userId,
            externalRequestId: operation.requestId,
            success: false,
          });
          if (!finalizeResult) {
            await finalizeFallbackFalReservation({
              userId,
              success: false,
            });
          }
        }

        if (isJsonResponse || typeof payload !== "string") {
          return NextResponse.json(payload, {
            status: res.status,
            headers: responseHeaders,
          });
        }

        return new NextResponse(payload, {
          status: res.status,
          headers: responseHeaders,
        });
      },
    });

    if (!proxiedResponse.ok && reservationId) {
      if (reservedRequestId) {
        const finalizeResult = await finalizeReservationByExternalRequestId({
          userId,
          externalRequestId: reservedRequestId,
          success: false,
        });
        if (!finalizeResult) {
          await finalizeFallbackFalReservation({
            userId,
            success: false,
          });
        }
      } else {
        await finalizeReservationById({
          userId,
          reservationId,
          success: false,
        });
      }
    }

    return proxiedResponse;
  } catch (error) {
    console.error("Fal proxy request failed:", error);

    if (reservationId) {
      await finalizeReservationById({
        userId,
        reservationId,
        success: false,
      });
    }

    return NextResponse.json(
      { error: "Failed to process Fal proxy request" },
      { status: 500 },
    );
  }
}

export async function GET(request: NextRequest) {
  return handleFalProxy(request);
}

export async function POST(request: NextRequest) {
  return handleFalProxy(request);
}

export async function PUT(request: NextRequest) {
  return handleFalProxy(request);
}
