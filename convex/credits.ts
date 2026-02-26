import { v } from "convex/values";
import { internalMutation, mutation, query } from "./_generated/server";
import type { MutationCtx, QueryCtx } from "./_generated/server";

const PLAN_PRICES = {
  starter: 75,
  pro: 180,
  premium: 375,
} as const;
const SAR_TO_USD = 0.27;
const USD_PER_CREDIT = 0.01;

const serviceValidator = v.union(
  v.literal("fal"),
  v.literal("elevenlabs"),
  v.literal("runway"),
);

type ReadCtx = Pick<QueryCtx, "db"> | Pick<MutationCtx, "db">;

function getPlanCredits(planId: string): number {
  const planPrice = PLAN_PRICES[planId as keyof typeof PLAN_PRICES];
  if (planPrice === undefined) {
    throw new Error(`Invalid planId: ${planId}`);
  }
  return Math.ceil((planPrice * SAR_TO_USD) / USD_PER_CREDIT);
}

async function getOrCreateCreditAccount(
  ctx: MutationCtx,
  userId: string,
) {
  const existing = await ctx.db
    .query("credit_accounts")
    .withIndex("by_user", (q) => q.eq("user_id", userId))
    .first();

  if (existing) {
    return existing;
  }

  const accountId = await ctx.db.insert("credit_accounts", {
    user_id: userId,
    available_credits: 0,
    reserved_credits: 0,
    updated_at: Date.now(),
  });

  const created = await ctx.db.get(accountId);
  if (!created) {
    throw new Error("Failed to create credit account");
  }

  return created;
}

async function hasActiveSubscription(
  ctx: ReadCtx,
  userId: string,
) {
  const subscription = await ctx.db
    .query("subscriptions")
    .withIndex("by_user_and_status", (q) =>
      q.eq("user_id", userId).eq("status", "active"),
    )
    .first();

  return subscription;
}

async function findEventByIdempotencyKey(
  ctx: ReadCtx,
  idempotencyKey: string,
) {
  return await ctx.db
    .query("credit_events")
    .withIndex("by_idempotency_key", (q) =>
      q.eq("idempotency_key", idempotencyKey),
    )
    .first();
}

async function insertCreditEventIfMissing(
  ctx: MutationCtx,
  args: {
    userId: string;
    type: "grant" | "reserve" | "capture" | "release" | "adjustment";
    credits: number;
    balanceAfter: number;
    referenceType: string;
    referenceId: string;
    idempotencyKey: string;
  },
) {
  const existing = await findEventByIdempotencyKey(ctx, args.idempotencyKey);
  if (existing) {
    return existing._id;
  }

  return await ctx.db.insert("credit_events", {
    user_id: args.userId,
    type: args.type,
    credits: args.credits,
    balance_after: args.balanceAfter,
    reference_type: args.referenceType,
    reference_id: args.referenceId,
    idempotency_key: args.idempotencyKey,
    created_at: Date.now(),
  });
}

async function grantPlanCredits(
  ctx: MutationCtx,
  args: {
    userId: string;
    planId: string;
    idempotencyKey: string;
    referenceType: string;
    referenceId: string;
  },
) {
  const existingEvent = await findEventByIdempotencyKey(ctx, args.idempotencyKey);
  const account = await getOrCreateCreditAccount(ctx, args.userId);

  if (existingEvent) {
    return {
      granted_credits: account.available_credits,
      available_credits: account.available_credits,
      reserved_credits: account.reserved_credits,
      was_idempotent: true,
    };
  }

  const planCredits = getPlanCredits(args.planId);

  await ctx.db.patch(account._id, {
    available_credits: planCredits,
    reserved_credits: 0,
    updated_at: Date.now(),
  });

  await insertCreditEventIfMissing(ctx, {
    userId: args.userId,
    type: "grant",
    credits: planCredits,
    balanceAfter: planCredits,
    referenceType: args.referenceType,
    referenceId: args.referenceId,
    idempotencyKey: args.idempotencyKey,
  });

  return {
    granted_credits: planCredits,
    available_credits: planCredits,
    reserved_credits: 0,
    was_idempotent: false,
  };
}

function normalizeCredits(credits: number): number {
  if (!Number.isFinite(credits) || credits <= 0) {
    throw new Error("Credits must be a finite number greater than 0");
  }
  return Math.ceil(credits);
}

export const getMyCreditBalance = query({
  args: {
    userId: v.string(),
  },
  returns: v.object({
    available_credits: v.number(),
    reserved_credits: v.number(),
    total_credits: v.number(),
    has_active_subscription: v.boolean(),
    plan_id: v.optional(v.string()),
    next_billing_date: v.optional(v.number()),
  }),
  handler: async (ctx, args) => {
    const account = await ctx.db
      .query("credit_accounts")
      .withIndex("by_user", (q) => q.eq("user_id", args.userId))
      .first();

    const subscription = await hasActiveSubscription(ctx, args.userId);

    const available = account?.available_credits ?? 0;
    const reserved = account?.reserved_credits ?? 0;

    return {
      available_credits: available,
      reserved_credits: reserved,
      total_credits: available + reserved,
      has_active_subscription: !!subscription,
      plan_id: subscription?.plan_id,
      next_billing_date: subscription?.next_billing_date,
    };
  },
});

export const listUsersWithReservedCredits = query({
  args: {},
  returns: v.array(
    v.object({
      user_id: v.string(),
      reserved_credits: v.number(),
      available_credits: v.number(),
    }),
  ),
  handler: async (ctx) => {
    const accounts = await ctx.db.query("credit_accounts").collect();
    return accounts
      .filter((account) => account.reserved_credits > 0)
      .map((account) => ({
        user_id: account.user_id,
        reserved_credits: account.reserved_credits,
        available_credits: account.available_credits,
      }));
  },
});

export const getLatestReservedReservationIdForUserService = query({
  args: {
    userId: v.string(),
    service: serviceValidator,
  },
  returns: v.union(v.string(), v.null()),
  handler: async (ctx, args) => {
    const reservations = await ctx.db
      .query("credit_reservations")
      .withIndex("by_user", (q) => q.eq("user_id", args.userId))
      .collect();

    const latest = reservations
      .filter(
        (reservation) =>
          reservation.service === args.service && reservation.status === "reserved",
      )
      .sort((a, b) => b.created_at - a.created_at)[0];

    return latest?.reservation_id ?? null;
  },
});

export const releaseReservedCreditsForUser = mutation({
  args: {
    userId: v.string(),
    service: v.optional(serviceValidator),
  },
  returns: v.object({
    released_reservations: v.number(),
    released_credits: v.number(),
    available_credits: v.number(),
    reserved_credits: v.number(),
  }),
  handler: async (ctx, args) => {
    const reservations = await ctx.db
      .query("credit_reservations")
      .withIndex("by_user", (q) => q.eq("user_id", args.userId))
      .collect();

    const pendingReservations = reservations
      .filter((reservation) => reservation.status === "reserved")
      .filter((reservation) =>
        args.service ? reservation.service === args.service : true,
      )
      .sort((a, b) => a.created_at - b.created_at);

    const account = await getOrCreateCreditAccount(ctx, args.userId);
    let nextAvailable = account.available_credits;
    let nextReserved = account.reserved_credits;
    let releasedCredits = 0;

    for (const reservation of pendingReservations) {
      nextAvailable += reservation.estimated_credits;
      nextReserved = Math.max(0, nextReserved - reservation.estimated_credits);
      releasedCredits += reservation.estimated_credits;

      await ctx.db.patch(reservation._id, {
        status: "released",
        finalized_at: Date.now(),
      });

      await insertCreditEventIfMissing(ctx, {
        userId: reservation.user_id,
        type: "release",
        credits: reservation.estimated_credits,
        balanceAfter: nextAvailable,
        referenceType: "reservation",
        referenceId: reservation.reservation_id,
        idempotencyKey: `release:${reservation.reservation_id}`,
      });
    }

    if (pendingReservations.length > 0) {
      await ctx.db.patch(account._id, {
        available_credits: nextAvailable,
        reserved_credits: nextReserved,
        updated_at: Date.now(),
      });
    }

    return {
      released_reservations: pendingReservations.length,
      released_credits: releasedCredits,
      available_credits: nextAvailable,
      reserved_credits: nextReserved,
    };
  },
});

export const reconcileCreditAccountForUser = mutation({
  args: {
    userId: v.string(),
  },
  returns: v.object({
    available_before: v.number(),
    reserved_before: v.number(),
    available_after: v.number(),
    reserved_after: v.number(),
    reserved_delta: v.number(),
  }),
  handler: async (ctx, args) => {
    const account = await getOrCreateCreditAccount(ctx, args.userId);
    const reservations = await ctx.db
      .query("credit_reservations")
      .withIndex("by_user", (q) => q.eq("user_id", args.userId))
      .collect();

    const reservedFromReservations = reservations
      .filter((reservation) => reservation.status === "reserved")
      .reduce((sum, reservation) => sum + reservation.estimated_credits, 0);

    const availableBefore = account.available_credits;
    const reservedBefore = account.reserved_credits;
    const reservedDelta = reservedBefore - reservedFromReservations;

    let availableAfter = availableBefore;
    if (reservedDelta > 0) {
      // Recover leaked reserved credits back to available balance.
      availableAfter = availableBefore + reservedDelta;
    } else if (reservedDelta < 0) {
      // Keep total credits consistent if reserved reservations exceed account value.
      availableAfter = Math.max(0, availableBefore + reservedDelta);
    }

    await ctx.db.patch(account._id, {
      available_credits: availableAfter,
      reserved_credits: reservedFromReservations,
      updated_at: Date.now(),
    });

    if (reservedDelta !== 0) {
      await insertCreditEventIfMissing(ctx, {
        userId: args.userId,
        type: "adjustment",
        credits: Math.abs(reservedDelta),
        balanceAfter: availableAfter,
        referenceType: "reconcile",
        referenceId: args.userId,
        idempotencyKey: `reconcile:${args.userId}:${reservedFromReservations}:${reservedBefore}`,
      });
    }

    return {
      available_before: availableBefore,
      reserved_before: reservedBefore,
      available_after: availableAfter,
      reserved_after: reservedFromReservations,
      reserved_delta: reservedDelta,
    };
  },
});

export const reserveCreditsForGeneration = mutation({
  args: {
    userId: v.string(),
    service: serviceValidator,
    modelId: v.string(),
    estimatedCredits: v.number(),
    reservationId: v.optional(v.string()),
  },
  returns: v.object({
    reservation_id: v.string(),
    estimated_credits: v.number(),
    available_credits: v.number(),
    reserved_credits: v.number(),
  }),
  handler: async (ctx, args) => {
    const estimated = normalizeCredits(args.estimatedCredits);
    const activeSubscription = await hasActiveSubscription(ctx, args.userId);

    if (!activeSubscription) {
      throw new Error("Active subscription required");
    }

    const reservationId =
      args.reservationId ??
      `res_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;

    const existingReservation = await ctx.db
      .query("credit_reservations")
      .withIndex("by_reservation_id", (q) => q.eq("reservation_id", reservationId))
      .first();

    if (existingReservation) {
      if (existingReservation.user_id !== args.userId) {
        throw new Error("Reservation belongs to another user");
      }

      const existingAccount = await getOrCreateCreditAccount(ctx, args.userId);
      return {
        reservation_id: existingReservation.reservation_id,
        estimated_credits: existingReservation.estimated_credits,
        available_credits: existingAccount.available_credits,
        reserved_credits: existingAccount.reserved_credits,
      };
    }

    const account = await getOrCreateCreditAccount(ctx, args.userId);

    if (account.available_credits < estimated) {
      throw new Error("Insufficient credits");
    }

    const newAvailable = account.available_credits - estimated;
    const newReserved = account.reserved_credits + estimated;

    await ctx.db.patch(account._id, {
      available_credits: newAvailable,
      reserved_credits: newReserved,
      updated_at: Date.now(),
    });

    await ctx.db.insert("credit_reservations", {
      reservation_id: reservationId,
      user_id: args.userId,
      service: args.service,
      model_id: args.modelId,
      estimated_credits: estimated,
      status: "reserved",
      created_at: Date.now(),
    });

    await insertCreditEventIfMissing(ctx, {
      userId: args.userId,
      type: "reserve",
      credits: estimated,
      balanceAfter: newAvailable,
      referenceType: "reservation",
      referenceId: reservationId,
      idempotencyKey: `reserve:${reservationId}`,
    });

    return {
      reservation_id: reservationId,
      estimated_credits: estimated,
      available_credits: newAvailable,
      reserved_credits: newReserved,
    };
  },
});

export const attachExternalRequestIdToReservation = mutation({
  args: {
    reservationId: v.string(),
    externalRequestId: v.string(),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    const reservation = await ctx.db
      .query("credit_reservations")
      .withIndex("by_reservation_id", (q) => q.eq("reservation_id", args.reservationId))
      .first();

    if (!reservation) {
      throw new Error("Reservation not found");
    }

    if (
      reservation.external_request_id &&
      reservation.external_request_id !== args.externalRequestId
    ) {
      throw new Error("Reservation already linked to another external request");
    }

    if (reservation.external_request_id === args.externalRequestId) {
      return null;
    }

    await ctx.db.patch(reservation._id, {
      external_request_id: args.externalRequestId,
    });

    return null;
  },
});

export const finalizeCreditReservation = mutation({
  args: {
    userId: v.optional(v.string()),
    reservationId: v.optional(v.string()),
    externalRequestId: v.optional(v.string()),
    success: v.boolean(),
    actualCredits: v.optional(v.number()),
  },
  returns: v.union(
    v.object({
      reservation_id: v.string(),
      status: v.union(v.literal("captured"), v.literal("released"), v.literal("noop")),
      captured_credits: v.number(),
      released_credits: v.number(),
      available_credits: v.number(),
      reserved_credits: v.number(),
    }),
    v.null(),
  ),
  handler: async (ctx, args) => {
    if (!args.reservationId && !args.externalRequestId) {
      throw new Error("Either reservationId or externalRequestId is required");
    }

    const reservation =
      args.reservationId !== undefined
        ? await ctx.db
            .query("credit_reservations")
            .withIndex("by_reservation_id", (q) =>
              q.eq("reservation_id", args.reservationId!),
            )
            .first()
        : await ctx.db
            .query("credit_reservations")
            .withIndex("by_external_request_id", (q) =>
              q.eq("external_request_id", args.externalRequestId!),
            )
            .first();

    if (!reservation) {
      return null;
    }

    if (args.userId && reservation.user_id !== args.userId) {
      throw new Error("Reservation belongs to another user");
    }

    const account = await getOrCreateCreditAccount(ctx, reservation.user_id);

    if (reservation.status !== "reserved") {
      return {
        reservation_id: reservation.reservation_id,
        status: "noop" as const,
        captured_credits: reservation.actual_credits ?? 0,
        released_credits:
          reservation.status === "released" ? reservation.estimated_credits : 0,
        available_credits: account.available_credits,
        reserved_credits: account.reserved_credits,
      };
    }

    const estimated = reservation.estimated_credits;
    const accountReservedAfter = Math.max(0, account.reserved_credits - estimated);

    if (!args.success) {
      const availableAfter = account.available_credits + estimated;

      await ctx.db.patch(account._id, {
        available_credits: availableAfter,
        reserved_credits: accountReservedAfter,
        updated_at: Date.now(),
      });

      await ctx.db.patch(reservation._id, {
        status: "released",
        finalized_at: Date.now(),
      });

      await insertCreditEventIfMissing(ctx, {
        userId: reservation.user_id,
        type: "release",
        credits: estimated,
        balanceAfter: availableAfter,
        referenceType: "reservation",
        referenceId: reservation.reservation_id,
        idempotencyKey: `release:${reservation.reservation_id}`,
      });

      return {
        reservation_id: reservation.reservation_id,
        status: "released" as const,
        captured_credits: 0,
        released_credits: estimated,
        available_credits: availableAfter,
        reserved_credits: accountReservedAfter,
      };
    }

    const requestedActual =
      args.actualCredits !== undefined ? normalizeCredits(args.actualCredits) : estimated;
    const capturedCredits = Math.max(1, Math.min(requestedActual, estimated));
    const releasedCredits = Math.max(0, estimated - capturedCredits);
    const availableAfter = account.available_credits + releasedCredits;

    await ctx.db.patch(account._id, {
      available_credits: availableAfter,
      reserved_credits: accountReservedAfter,
      updated_at: Date.now(),
    });

    await ctx.db.patch(reservation._id, {
      status: "captured",
      actual_credits: capturedCredits,
      finalized_at: Date.now(),
    });

    await insertCreditEventIfMissing(ctx, {
      userId: reservation.user_id,
      type: "capture",
      credits: capturedCredits,
      balanceAfter: availableAfter,
      referenceType: "reservation",
      referenceId: reservation.reservation_id,
      idempotencyKey: `capture:${reservation.reservation_id}`,
    });

    if (releasedCredits > 0) {
      await insertCreditEventIfMissing(ctx, {
        userId: reservation.user_id,
        type: "release",
        credits: releasedCredits,
        balanceAfter: availableAfter,
        referenceType: "reservation_release",
        referenceId: reservation.reservation_id,
        idempotencyKey: `release_after_capture:${reservation.reservation_id}`,
      });
    }

    return {
      reservation_id: reservation.reservation_id,
      status: "captured" as const,
      captured_credits: capturedCredits,
      released_credits: releasedCredits,
      available_credits: availableAfter,
      reserved_credits: accountReservedAfter,
    };
  },
});

export const grantPlanCreditsForCharge = mutation({
  args: {
    userId: v.string(),
    planId: v.string(),
    chargeId: v.string(),
    source: v.optional(v.string()),
  },
  returns: v.object({
    granted_credits: v.number(),
    available_credits: v.number(),
    reserved_credits: v.number(),
    was_idempotent: v.boolean(),
  }),
  handler: async (ctx, args) => {
    return await grantPlanCredits(ctx, {
      userId: args.userId,
      planId: args.planId,
      idempotencyKey: `subscription_grant:${args.chargeId}`,
      referenceType: args.source ?? "subscription_charge",
      referenceId: args.chargeId,
    });
  },
});

export const grantPlanCreditsForChargeInternal = internalMutation({
  args: {
    userId: v.string(),
    planId: v.string(),
    chargeId: v.string(),
    source: v.optional(v.string()),
  },
  returns: v.object({
    granted_credits: v.number(),
    available_credits: v.number(),
    reserved_credits: v.number(),
    was_idempotent: v.boolean(),
  }),
  handler: async (ctx, args) => {
    return await grantPlanCredits(ctx, {
      userId: args.userId,
      planId: args.planId,
      idempotencyKey: `subscription_grant:${args.chargeId}`,
      referenceType: args.source ?? "subscription_charge",
      referenceId: args.chargeId,
    });
  },
});

export const backfillCreditsForActiveSubscribers = mutation({
  args: {},
  returns: v.object({
    processed: v.number(),
    granted: v.number(),
    skipped: v.number(),
  }),
  handler: async (ctx) => {
    const activeSubscriptions = await ctx.db
      .query("subscriptions")
      .withIndex("by_status", (q) => q.eq("status", "active"))
      .collect();

    let granted = 0;
    let skipped = 0;
    const processedUsers = new Set<string>();

    for (const subscription of activeSubscriptions) {
      if (processedUsers.has(subscription.user_id)) {
        skipped++;
        continue;
      }

      processedUsers.add(subscription.user_id);

      const idempotencyKey = `backfill:${subscription.user_id}:${subscription.plan_id}`;
      const existingEvent = await findEventByIdempotencyKey(ctx, idempotencyKey);

      if (existingEvent) {
        skipped++;
        continue;
      }

      await grantPlanCredits(ctx, {
        userId: subscription.user_id,
        planId: subscription.plan_id,
        idempotencyKey,
        referenceType: "backfill",
        referenceId: `${subscription.user_id}:${subscription.plan_id}`,
      });
      granted++;
    }

    return {
      processed: activeSubscriptions.length,
      granted,
      skipped,
    };
  },
});
