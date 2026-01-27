import { clerkClient } from "@clerk/nextjs/server";
import { ConvexHttpClient } from "convex/browser";
import { api as convexApi } from "../../../../convex/_generated/api";
import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";
import { getPlanPrice } from "~/lib/constants/plans";
import { createCharge, createTapCustomer } from "./tap";
import { env } from "~/env";

const convexClient = new ConvexHttpClient(env.NEXT_PUBLIC_CONVEX_URL);

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

        // Create charge (temporarily without save_card - will enable later)
        // For now, subscriptions will be created without payment agreements
        const transactionUrl = await createCharge(
          tapCustomerId,
          amount,
          input.language,
          {
            saveCard: false, // Temporarily false - will enable card saving later
            agreementType: "subscription",
            metadata: {
              user_id: ctx.userId,
              plan_id: input.planId,
            },
          },
        );
        console.log(
          "Tap charge created with payment agreement, transaction URL:",
          transactionUrl,
        );

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
