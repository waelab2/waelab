import { internalQuery, mutation, query } from "./_generated/server";
import { v } from "convex/values";

/**
 * Store payment agreement after webhook receives it
 */
export const storePaymentAgreement = mutation({
  args: {
    tapPaymentAgreementId: v.string(),
    tapCustomerId: v.string(),
    tapCardId: v.optional(v.string()),
    contractType: v.union(
      v.literal("UNSCHEDULED"),
      v.literal("SUBSCRIPTION"),
      v.literal("INSTALLMENT"),
      v.literal("MILESTONE"),
      v.literal("ORDER"),
    ),
    userId: v.string(),
  },
  returns: v.id("payment_agreements"),
  handler: async (ctx, args) => {
    // Check if payment agreement already exists
    const existing = await ctx.db
      .query("payment_agreements")
      .withIndex("by_tap_payment_agreement_id", (q) =>
        q.eq("tap_payment_agreement_id", args.tapPaymentAgreementId),
      )
      .first();

    if (existing) {
      // Update existing agreement
      await ctx.db.patch(existing._id, {
        tap_customer_id: args.tapCustomerId,
        tap_card_id: args.tapCardId,
        contract_type: args.contractType,
        status: "active",
      });
      return existing._id;
    }

    // Create new payment agreement
    const agreementId = await ctx.db.insert("payment_agreements", {
      tap_payment_agreement_id: args.tapPaymentAgreementId,
      tap_customer_id: args.tapCustomerId,
      tap_card_id: args.tapCardId,
      contract_type: args.contractType,
      status: "active",
      user_id: args.userId,
      created_at: Date.now(),
    });

    return agreementId;
  },
});

/**
 * Create subscription record linked to payment agreement
 * paymentAgreementId is optional - temporarily null until card saving is enabled
 */
export const createSubscription = mutation({
  args: {
    userId: v.string(),
    planId: v.string(),
    paymentAgreementId: v.optional(v.id("payment_agreements")),
    amount: v.number(),
    currency: v.string(),
    nextBillingDate: v.number(),
  },
  returns: v.id("subscriptions"),
  handler: async (ctx, args) => {
    // Check if user already has an active subscription
    const existing = await ctx.db
      .query("subscriptions")
      .withIndex("by_user_and_status", (q) =>
        q.eq("user_id", args.userId).eq("status", "active"),
      )
      .first();

    if (existing) {
      // Update existing subscription
      await ctx.db.patch(existing._id, {
        plan_id: args.planId,
        ...(args.paymentAgreementId && { payment_agreement_id: args.paymentAgreementId }),
        amount: args.amount,
        currency: args.currency,
        next_billing_date: args.nextBillingDate,
        status: "active",
      });
      return existing._id;
    }

    // Create new subscription
    const subscriptionId = await ctx.db.insert("subscriptions", {
      user_id: args.userId,
      plan_id: args.planId,
      ...(args.paymentAgreementId && { payment_agreement_id: args.paymentAgreementId }),
      amount: args.amount,
      currency: args.currency,
      status: "active",
      next_billing_date: args.nextBillingDate,
      created_at: Date.now(),
    });

    return subscriptionId;
  },
});

/**
 * Query user's active subscription
 */
export const getUserSubscription = query({
  args: {
    userId: v.string(),
  },
  returns: v.union(
    v.object({
      _id: v.id("subscriptions"),
      _creationTime: v.number(),
      user_id: v.string(),
      plan_id: v.string(),
      payment_agreement_id: v.optional(v.id("payment_agreements")),
      amount: v.number(),
      currency: v.string(),
      status: v.union(
        v.literal("active"),
        v.literal("cancelled"),
        v.literal("failed"),
        v.literal("expired"),
      ),
      next_billing_date: v.number(),
      created_at: v.number(),
      cancelled_at: v.optional(v.number()),
      last_billing_date: v.optional(v.number()),
      last_billing_charge_id: v.optional(v.string()),
    }),
    v.null(),
  ),
  handler: async (ctx, args) => {
    const subscription = await ctx.db
      .query("subscriptions")
      .withIndex("by_user_and_status", (q) =>
        q.eq("user_id", args.userId).eq("status", "active"),
      )
      .first();

    return subscription ?? null;
  },
});

/**
 * Update subscription status
 */
export const updateSubscriptionStatus = mutation({
  args: {
    userId: v.string(),
    status: v.union(
      v.literal("active"),
      v.literal("cancelled"),
      v.literal("failed"),
      v.literal("expired"),
    ),
    lastBillingChargeId: v.optional(v.string()),
  },
  returns: v.union(v.id("subscriptions"), v.null()),
  handler: async (ctx, args) => {
    const subscription = await ctx.db
      .query("subscriptions")
      .withIndex("by_user_and_status", (q) =>
        q.eq("user_id", args.userId).eq("status", "active"),
      )
      .first();

    if (!subscription) {
      return null;
    }

    const updateData: {
      status: typeof args.status;
      cancelled_at?: number;
      last_billing_date?: number;
      last_billing_charge_id?: string;
      next_billing_date?: number;
    } = {
      status: args.status,
    };

    if (args.status === "cancelled") {
      updateData.cancelled_at = Date.now();
    }

    if (args.status === "active" && args.lastBillingChargeId) {
      updateData.last_billing_date = Date.now();
      updateData.last_billing_charge_id = args.lastBillingChargeId;
      // Update next billing date to 30 days from now
      updateData.next_billing_date = Date.now() + 30 * 24 * 60 * 60 * 1000;
    }

    await ctx.db.patch(subscription._id, updateData);

    return subscription._id;
  },
});

/**
 * Get payment agreement by Tap payment agreement ID
 */
export const getPaymentAgreementByTapId = query({
  args: {
    tapPaymentAgreementId: v.string(),
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
    const agreement = await ctx.db
      .query("payment_agreements")
      .withIndex("by_tap_payment_agreement_id", (q) =>
        q.eq("tap_payment_agreement_id", args.tapPaymentAgreementId),
      )
      .first();

    return agreement ?? null;
  },
});

/**
 * Internal query version for use in scheduled functions
 */
export const getSubscriptionsForBilling = internalQuery({
  args: {},
  returns: v.array(
    v.object({
      _id: v.id("subscriptions"),
      _creationTime: v.number(),
      user_id: v.string(),
      plan_id: v.string(),
      payment_agreement_id: v.optional(v.id("payment_agreements")),
      amount: v.number(),
      currency: v.string(),
      status: v.union(
        v.literal("active"),
        v.literal("cancelled"),
        v.literal("failed"),
        v.literal("expired"),
      ),
      next_billing_date: v.number(),
      created_at: v.number(),
      cancelled_at: v.optional(v.number()),
      last_billing_date: v.optional(v.number()),
      last_billing_charge_id: v.optional(v.string()),
    }),
  ),
  handler: async (ctx) => {
    const now = Date.now();
    const subscriptions = await ctx.db
      .query("subscriptions")
      .withIndex("by_next_billing_date", (q) => q.lte("next_billing_date", now))
      .filter((q) => q.eq(q.field("status"), "active"))
      .collect();

    return subscriptions;
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
