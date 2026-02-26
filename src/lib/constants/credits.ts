import { models } from "~/lib/constants";
import { PLAN_PRICES, type PlanId } from "~/lib/constants/plans";

export const USD_PER_CREDIT = 0.01;
export const SAR_TO_USD = 0.27;

function assertFinitePositive(value: number, label: string) {
  if (!Number.isFinite(value) || value <= 0) {
    throw new Error(`${label} must be a finite number greater than 0`);
  }
}

export function getPlanCredits(planId: string): number {
  const priceSar = PLAN_PRICES[planId as PlanId];
  if (priceSar === undefined) {
    throw new Error(`Invalid planId: ${planId}`);
  }

  const usdValue = priceSar * SAR_TO_USD;
  return Math.ceil(usdValue / USD_PER_CREDIT);
}

export function getModelCreditsPerSecond(modelId: string): number {
  const model = models.find((m) => m.id === modelId);
  if (!model) {
    throw new Error(`Unknown modelId: ${modelId}`);
  }

  return model.price_per_second / USD_PER_CREDIT;
}

export function calculateCreditsForDurationSeconds(
  modelId: string,
  durationSeconds: number,
): number {
  assertFinitePositive(durationSeconds, "durationSeconds");

  const model = models.find((m) => m.id === modelId);
  if (!model) {
    throw new Error(`Unknown modelId: ${modelId}`);
  }

  const usdCost = model.price_per_second * durationSeconds;
  // Deterministic integer credits with minimum 1 credit on successful captures.
  return Math.max(1, Math.ceil(usdCost / USD_PER_CREDIT));
}

export function parseDurationSeconds(
  duration: number | string | undefined,
  fallbackSeconds: number,
): number {
  if (duration === undefined || duration === null) {
    return fallbackSeconds;
  }

  const parsed =
    typeof duration === "number"
      ? duration
      : Number.parseFloat(duration.replace(/[^\d.]/g, ""));

  if (!Number.isFinite(parsed) || parsed <= 0) {
    return fallbackSeconds;
  }

  return parsed;
}

