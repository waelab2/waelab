import { clerkClient } from "@clerk/nextjs/server";
import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";
import { createCharge, createTapCustomer } from "./tap";

// Plan ID to monthly price mapping
const PLAN_PRICES: Record<string, number> = {
  starter: 75,
  pro: 180,
  premium: 375,
};

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
        const amount = PLAN_PRICES[input.planId];
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
});
