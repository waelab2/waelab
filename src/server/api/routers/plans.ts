import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";

export const plansRouter = createTRPCRouter({
  handlePlanCheckout: protectedProcedure
    .input(
      z.object({
        planId: z.string(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      // Simulate network delay
      await new Promise((resolve) => setTimeout(resolve, 2000));
      
      console.log("handlePlanCheckout called with planId:", input.planId);
      console.log("User ID:", ctx.userId);
      return { success: true };
    }),
});
