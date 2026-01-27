/**
 * Shared plan pricing constants
 * Used by both frontend (display) and backend (checkout)
 */

export const PLAN_PRICES = {
  starter: 75,
  pro: 180,
  premium: 375,
} as const;

export type PlanId = keyof typeof PLAN_PRICES;

/**
 * Get monthly price for a plan
 * Throws if planId is invalid
 */
export function getPlanPrice(planId: string): number {
  const price = PLAN_PRICES[planId as PlanId];
  if (price === undefined) {
    throw new Error(`Invalid planId: ${planId}`);
  }
  return price;
}

/**
 * Calculate yearly price (currently monthly * 12, no discount)
 * Throws if planId is invalid
 */
export function getYearlyPrice(planId: string): number {
  return getPlanPrice(planId) * 12;
}
