import { ConvexHttpClient } from "convex/browser";
import { z } from "zod";
import { api as convexApi } from "../../../../convex/_generated/api";
import { env } from "~/env";
import { getViewerAccessByUserId } from "~/server/authz";
import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";

const convexClient = new ConvexHttpClient(env.NEXT_PUBLIC_CONVEX_URL);

const scopeSchema = z.enum(["my", "all"]).default("my");

async function resolveScopedUserId(userId: string, scope: "my" | "all") {
  const viewerAccess = await getViewerAccessByUserId(userId);
  const canReadAll = viewerAccess.isAdmin && scope === "all";
  return canReadAll ? undefined : userId;
}

export const analyticsRouter = createTRPCRouter({
  getGenerationRequests: protectedProcedure
    .input(
      z.object({
        limit: z.number().min(1).max(200).optional(),
        service: z.enum(["fal", "elevenlabs", "runway"]).optional(),
        status: z.enum(["pending", "completed", "failed"]).optional(),
        scope: scopeSchema.optional(),
      }),
    )
    .query(async ({ ctx, input }) => {
      const scopedUserId = await resolveScopedUserId(
        ctx.userId,
        input.scope ?? "my",
      );

      return convexClient.query(convexApi.generationRequests.getGenerationRequests, {
        limit: input.limit,
        service: input.service,
        status: input.status,
        user_id: scopedUserId,
      });
    }),

  getModelUsageStatsForDateRange: protectedProcedure
    .input(
      z.object({
        startDate: z.number(),
        endDate: z.number(),
        service: z.enum(["fal", "elevenlabs", "runway"]).optional(),
        scope: scopeSchema.optional(),
      }),
    )
    .query(async ({ ctx, input }) => {
      const scopedUserId = await resolveScopedUserId(
        ctx.userId,
        input.scope ?? "my",
      );

      return convexClient.query(
        convexApi.generationRequests.getModelUsageStatsForDateRange,
        {
          start_date: input.startDate,
          end_date: input.endDate,
          service: input.service,
          user_id: scopedUserId,
        },
      );
    }),
});
