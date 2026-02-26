import { internalAction, internalMutation, internalQuery } from "./_generated/server";
import { internal } from "./_generated/api";
import { v } from "convex/values";

/**
 * Scheduled function to process recurring billing for subscriptions.
 * This should be configured to run daily via Convex cron.
 */
export const processRecurringBilling = internalAction({
  args: {},
  returns: v.object({
    processed: v.number(),
    succeeded: v.number(),
    failed: v.number(),
  }),
  handler: async (ctx): Promise<{
    processed: number;
    succeeded: number;
    failed: number;
  }> => {
    // Get all subscriptions due for billing
    const subscriptions = await ctx.runQuery(
      internal.paymentAgreements.getSubscriptionsForBilling,
      {},
    );

    console.log(
      `Processing ${subscriptions.length} subscriptions due for billing`,
    );

    let succeeded = 0;
    let failed = 0;

    for (const subscription of subscriptions) {
      try {
        // Skip subscriptions without payment agreements (no saved card for recurring billing)
        if (!subscription.payment_agreement_id) {
          console.log(
            `Skipping subscription ${subscription._id} - no payment agreement (card saving not enabled yet)`,
          );
          continue;
        }

        // Get payment agreement details
        const paymentAgreement = await ctx.runQuery(
          internal.paymentAgreements.getPaymentAgreementById,
          {
            paymentAgreementId: subscription.payment_agreement_id,
          },
        );

        if (!paymentAgreement) {
          console.error(
            `Payment agreement not found for subscription ${subscription._id}`,
          );
          await ctx.runMutation(
            internal.subscriptionBilling.markSubscriptionFailed,
            {
              subscriptionId: subscription._id,
              error: "Payment agreement not found",
            },
          );
          failed++;
          continue;
        }

        // Call tRPC server-side to create recurring charge
        // Since we're in Convex, we need to call the Next.js API
        const webhookUrl = process.env.TAP_WEBHOOK_URL ?? "";
        const baseUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

        // For now, we'll call the Tap API directly from here
        // In production, you might want to create a tRPC endpoint or use an HTTP action
        // Note: In Convex, environment variables need to be set in the Convex dashboard
        // Priority: TAP_SECRET_KEY > TEST_SECRET_KEY > LIVE_SECRET_KEY
        const tapSecretKey =
          process.env.TAP_SECRET_KEY ??
          process.env.TEST_SECRET_KEY ??
          process.env.LIVE_SECRET_KEY;
        if (!tapSecretKey) {
          throw new Error(
            "No Tap secret key configured in Convex. Set TAP_SECRET_KEY, TEST_SECRET_KEY, or LIVE_SECRET_KEY",
          );
        }

        // Import the createRecurringCharge function logic here
        // For Convex, we need to make the HTTP call directly
        const tokenResponse = await fetch("https://api.tap.company/v2/tokens/", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${tapSecretKey}`,
            accept: "application/json",
            "content-type": "application/json",
          },
          body: JSON.stringify({
            customer: {
              id: paymentAgreement.tap_customer_id,
            },
            ...(paymentAgreement.tap_card_id && {
              card: {
                id: paymentAgreement.tap_card_id,
              },
            }),
          }),
        });

        if (!tokenResponse.ok) {
          throw new Error(
            `Failed to generate token: ${tokenResponse.statusText}`,
          );
        }

        const tokenData = (await tokenResponse.json()) as { id: string };
        const tokenId = tokenData.id;

        // Create the recurring charge
        const chargeResponse = await fetch(
          "https://api.tap.company/v2/charges/",
          {
            method: "POST",
            headers: {
              Authorization: `Bearer ${tapSecretKey}`,
              accept: "application/json",
              "content-type": "application/json",
            },
            body: JSON.stringify({
              amount: subscription.amount,
              currency: subscription.currency,
              customer_initiated: false,
              save_card: false,
              payment_agreement: {
                id: paymentAgreement.tap_payment_agreement_id,
              },
              customer: {
                id: paymentAgreement.tap_customer_id,
              },
              source: {
                id: tokenId,
              },
              description: `Monthly subscription for ${subscription.plan_id} plan`,
              metadata: {
                user_id: subscription.user_id,
                plan_id: subscription.plan_id,
                subscription_id: subscription._id,
                billing_type: "recurring",
              },
              receipt: {
                email: false,
                sms: false,
              },
            }),
          },
        );

        if (!chargeResponse.ok) {
          const errorData = (await chargeResponse.json().catch(() => ({}))) as {
            errors?: Array<{ message?: string }>;
            message?: string;
          };

          const errorMessage =
            errorData.errors?.[0]?.message ??
            errorData.message ??
            `Charge failed: ${chargeResponse.status} ${chargeResponse.statusText}`;

          throw new Error(errorMessage);
        }

        const chargeData = (await chargeResponse.json()) as {
          id: string;
          status: string;
        };

        // Update subscription with successful billing
        await ctx.runMutation(
          internal.subscriptionBilling.markSubscriptionBilled,
          {
            subscriptionId: subscription._id,
            chargeId: chargeData.id,
            nextBillingDate: Date.now() + 30 * 24 * 60 * 60 * 1000, // 30 days from now
          },
        );

        // Grant (reset) monthly credits for the successful recurring charge.
        await ctx.runMutation(
          internal.credits.grantPlanCreditsForChargeInternal,
          {
            userId: subscription.user_id,
            planId: subscription.plan_id,
            chargeId: chargeData.id,
            source: "recurring_billing",
          },
        );

        console.log(
          `Successfully billed subscription ${subscription._id} for user ${subscription.user_id}`,
        );
        succeeded++;
      } catch (error) {
        console.error(
          `Failed to bill subscription ${subscription._id}:`,
          error,
        );

        // Mark subscription as failed
        await ctx.runMutation(
          internal.subscriptionBilling.markSubscriptionFailed,
          {
            subscriptionId: subscription._id,
            error:
              error instanceof Error ? error.message : String(error),
          },
        );

        failed++;
      }
    }

    return {
      processed: subscriptions.length,
      succeeded,
      failed,
    };
  },
});

/**
 * Internal mutation to mark subscription as billed
 */
export const markSubscriptionBilled = internalMutation({
  args: {
    subscriptionId: v.id("subscriptions"),
    chargeId: v.string(),
    nextBillingDate: v.number(),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    await ctx.db.patch(args.subscriptionId, {
      last_billing_date: Date.now(),
      last_billing_charge_id: args.chargeId,
      next_billing_date: args.nextBillingDate,
      status: "active",
    });
    return null;
  },
});

/**
 * Internal mutation to mark subscription as failed
 */
export const markSubscriptionFailed = internalMutation({
  args: {
    subscriptionId: v.id("subscriptions"),
    error: v.string(),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    await ctx.db.patch(args.subscriptionId, {
      status: "failed",
    });
    return null;
  },
});

/**
 * Internal query to get payment agreement by ID
 */
export const getPaymentAgreementById = internalQuery({
  args: {
    paymentAgreementId: v.id("payment_agreements"),
  },
  returns: v.union(
    v.object({
      _id: v.id("payment_agreements"),
      _creationTime: v.number(),
      tap_payment_agreement_id: v.string(),
      tap_customer_id: v.string(),
      tap_card_id: v.optional(v.string()),
      contract_type: v.union(
        v.literal("UNSCHEDULED"),
        v.literal("SUBSCRIPTION"),
        v.literal("INSTALLMENT"),
        v.literal("MILESTONE"),
        v.literal("ORDER"),
      ),
      status: v.union(
        v.literal("active"),
        v.literal("cancelled"),
        v.literal("expired"),
      ),
      user_id: v.string(),
      created_at: v.number(),
    }),
    v.null(),
  ),
  handler: async (ctx, args) => {
    return await ctx.db.get(args.paymentAgreementId);
  },
});
