import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";

/**
 * Hook to fetch user subscription data
 * @param userId - Clerk user ID
 * @returns Subscription data or null if no subscription exists
 */
export function useUserSubscription(userId: string) {
  const subscription = useQuery(api.paymentAgreements.getUserSubscription, {
    userId,
  });

  return subscription ?? null;
}
