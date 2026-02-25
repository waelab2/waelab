import { clerkClient } from "@clerk/nextjs/server";
import { ConvexHttpClient } from "convex/browser";
import { z } from "zod";
import { env } from "~/env";
import { getPlanPrice } from "~/lib/constants/plans";
import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";
import { api as convexApi } from "../../../../convex/_generated/api";
import { createCharge, createTapCustomer, TapSaveCardNotEnabledError } from "./tap";

const convexClient = new ConvexHttpClient(env.NEXT_PUBLIC_CONVEX_URL);

/**
 * Differentiating users with a saved card vs without:
 * - With saved card: user.privateMetadata.tap_payment_agreement_id is set (Clerk),
 *   and Convex payment_agreements has a row for this user_id.
 * - Without: tap_customer_id may exist but tap_payment_agreement_id is absent;
 *   subscription may exist with payment_agreement_id null.
 */

export const plansRouter = createTRPCRouter({
  handlePlanCheckout: protectedProcedure
    .input(
      z.object({
        planId: z.string(),
        language: z.enum(["en", "ar"]),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      try {
        // Get plan amount
        const amount = getPlanPrice(input.planId);
        if (!amount) {
          throw new Error(`Invalid planId: ${input.planId}`);
        }

        // Check if user already has a Tap customer ID
        const client = await clerkClient();
        const user = await client.users.getUser(ctx.userId);

        const existingTapCustomerId = user.privateMetadata?.tap_customer_id as
          | string
          | undefined;

        let tapCustomerId: string;

        if (!existingTapCustomerId) {
          // Create new Tap customer for the user if it doesn't exist
          const tapCustomer = await createTapCustomer(ctx.userId);
          tapCustomerId = tapCustomer.customer.id;

          // Store the Tap customer ID in user's privateMetadata
          await client.users.updateUser(ctx.userId, {
            privateMetadata: {
              tap_customer_id: tapCustomerId,
            },
          });

          console.log("Tap customer created and stored:", tapCustomerId);
        } else {
          tapCustomerId = existingTapCustomerId;
        }

        const metadata = {
          user_id: ctx.userId,
          plan_id: input.planId,
        };

        // Try with save_card first; if Save Card is not enabled on Tap account, retry without it
        let transactionUrl: string;
        try {
          transactionUrl = await createCharge(
            tapCustomerId,
            amount,
            input.language,
            {
              saveCard: true,
              agreementType: "subscription",
              metadata,
            },
          );
          console.log(
            "Tap charge created with payment agreement, transaction URL:",
            transactionUrl,
          );
        } catch (chargeError) {
          if (chargeError instanceof TapSaveCardNotEnabledError) {
            console.warn(
              "Save Card not enabled on Tap account; retrying charge without save_card",
            );
            transactionUrl = await createCharge(
              tapCustomerId,
              amount,
              input.language,
              {
                saveCard: false,
                metadata,
              },
            );
            console.log(
              "Tap charge created (no card saved), transaction URL:",
              transactionUrl,
            );
          } else {
            throw chargeError;
          }
        }

        return { success: true, tapCustomerId, transactionUrl };
      } catch (error) {
        console.error("Error in handlePlanCheckout:", error);
        // Re-throw with better error message
        throw new Error(
          error instanceof Error
            ? error.message
            : "Failed to process plan checkout. Please check your Tap configuration.",
        );
      }
    }),

  revokeSubscription: protectedProcedure
    .input(
      z.object({
        userId: z.string(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      try {
        // Only allow admins to revoke subscriptions
        // You may want to add role checking here
        const client = await clerkClient();
        const currentUser = await client.users.getUser(ctx.userId);
        const userRole = currentUser.publicMetadata?.role as string | undefined;

        // Check if user is admin (adjust this check based on your role system)
        if (userRole !== "Admin") {
          throw new Error("Unauthorized: Only admins can revoke subscriptions");
        }

        // Call Convex mutation to update subscription status to cancelled
        const subscriptionId = await convexClient.mutation(
          convexApi.paymentAgreements.updateSubscriptionStatus,
          {
            userId: input.userId,
            status: "cancelled",
          },
        );

        if (!subscriptionId) {
          throw new Error("No active subscription found for this user");
        }

        return { success: true, subscriptionId };
      } catch (error) {
        console.error("Error revoking subscription:", error);
        throw new Error(
          error instanceof Error
            ? error.message
            : "Failed to revoke subscription",
        );
      }
    }),
});
