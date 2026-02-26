import { clerkClient } from "@clerk/nextjs/server";
import { ConvexHttpClient } from "convex/browser";
import { z } from "zod";
import { api as convexApi } from "../../../../convex/_generated/api";
import { env } from "~/env";
import { getViewerAccessByUserId } from "~/server/authz";
import {
  adminProcedure,
  createTRPCRouter,
  protectedProcedure,
} from "~/server/api/trpc";

const convexClient = new ConvexHttpClient(env.NEXT_PUBLIC_CONVEX_URL);

interface ClerkUser {
  id: string;
  firstName?: string | null;
  lastName?: string | null;
  username?: string | null;
  emailAddresses: Array<{ emailAddress: string }>;
  imageUrl?: string | null;
  publicMetadata?: Record<string, unknown>;
  banned: boolean;
  createdAt: number;
}

interface TransformedUser {
  id: string;
  name: string;
  email: string;
  avatar: string;
  role: string;
  status: "active" | "inactive";
  joinDate: string;
}

export const usersRouter = createTRPCRouter({
  getViewerAccess: protectedProcedure.query(async ({ ctx }) => {
    return getViewerAccessByUserId(ctx.userId);
  }),

  getAll: adminProcedure.query(async () => {
    try {
      // Fetch all users from Clerk
      const client = await clerkClient();
      const users = await client.users.getUserList({
        limit: 100, // Adjust as needed
        orderBy: "-created_at", // Most recent first
      });

      // Transform the data to match your UsersTable component structure
      const transformedUsers: TransformedUser[] = users.data.map(
        (user: ClerkUser) => ({
          id: user.id,
          name:
            `${user.firstName ?? ""} ${user.lastName ?? ""}`.trim() ??
            user.username ??
            "Unknown User",
          email: user.emailAddresses[0]?.emailAddress ?? "No email",
          avatar: user.imageUrl ?? "https://i.pravatar.cc",
          role: (user.publicMetadata?.role as string) ?? "User",
          status: user.banned ? "inactive" : "active",
          joinDate:
            new Date(user.createdAt).toISOString().split("T")[0] ?? "Unknown", // Format as YYYY-MM-DD
        }),
      );

      return transformedUsers;
    } catch (error) {
      console.error("Error fetching users from Clerk:", error);

      // Provide more detailed error information
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error";
      const errorStack = error instanceof Error ? error.stack : undefined;

      console.error("Detailed error info:", {
        message: errorMessage,
        stack: errorStack,
        errorType: typeof error,
        errorConstructor: error?.constructor?.name,
      });

      throw new Error(`Failed to fetch users: ${errorMessage}`);
    }
  }),

  getRecent: adminProcedure
    .input(z.object({ limit: z.number().min(1).max(50).default(10) }))
    .query(async ({ input }) => {
      try {
        const client = await clerkClient();
        const users = await client.users.getUserList({
          limit: input.limit,
          orderBy: "-created_at",
        });

        const transformedUsers: TransformedUser[] = users.data.map(
          (user: ClerkUser) => ({
            id: user.id,
            name:
              `${user.firstName ?? ""} ${user.lastName ?? ""}`.trim() ??
              user.username ??
              "Unknown User",
            email: user.emailAddresses[0]?.emailAddress ?? "No email",
            avatar: user.imageUrl ?? "https://i.pravatar.cc",
            role: (user.publicMetadata?.role as string) ?? "User",
            status: user.banned ? "inactive" : "active",
            joinDate:
              new Date(user.createdAt).toISOString().split("T")[0] ?? "Unknown",
          }),
        );

        return transformedUsers;
      } catch (error) {
        console.error("Error fetching recent users from Clerk:", error);
        throw new Error("Failed to fetch recent users");
      }
    }),

  // Tap customer ID procedures
  setTapCustomerId: protectedProcedure
    .input(z.object({ tapCustomerId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      try {
        const client = await clerkClient();

        // Update the user's privateMetadata with tap_customer_id
        await client.users.updateUser(ctx.userId, {
          privateMetadata: {
            tap_customer_id: input.tapCustomerId,
          },
        });

        return { success: true };
      } catch (error) {
        console.error("Error setting tap_customer_id:", error);
        throw new Error("Failed to set tap_customer_id");
      }
    }),

  hasTapCustomerId: protectedProcedure.query(async ({ ctx }) => {
    try {
      const client = await clerkClient();
      const user = await client.users.getUser(ctx.userId);

      const tapCustomerId = user.privateMetadata?.tap_customer_id as
        | string
        | undefined;

      return {
        exists: !!tapCustomerId,
        tapCustomerId: tapCustomerId ?? null,
      };
    } catch (error) {
      console.error("Error checking tap_customer_id:", error);
      throw new Error("Failed to check tap_customer_id");
    }
  }),

  // Invitation procedures
  createInvitation: adminProcedure
    .input(z.object({ emailAddress: z.string().email() }))
    .mutation(async ({ input }) => {
      try {
        const client = await clerkClient();
        const invitation = await client.invitations.createInvitation({
          emailAddress: input.emailAddress,
        });
        return invitation;
      } catch (error) {
        console.error("Error creating invitation:", error);
        throw new Error("Failed to create invitation");
      }
    }),

  getAllInvitations: adminProcedure.query(async () => {
    try {
      const client = await clerkClient();
      const invitations = await client.invitations.getInvitationList({
        limit: 100,
      });
      return invitations.data;
    } catch (error) {
      console.error("Error fetching invitations from Clerk:", error);
      throw new Error("Failed to fetch invitations");
    }
  }),

  getInvitationStats: adminProcedure.query(async () => {
    try {
      const client = await clerkClient();
      const invitations = await client.invitations.getInvitationList({
        limit: 100,
      });

      const stats = {
        total: invitations.data.length,
        pending: invitations.data.filter((inv) => inv.status === "pending")
          .length,
        accepted: invitations.data.filter((inv) => inv.status === "accepted")
          .length,
        revoked: invitations.data.filter((inv) => inv.status === "revoked")
          .length,
      };

      return stats;
    } catch (error) {
      console.error("Error fetching invitation stats:", error);
      throw new Error("Failed to fetch invitation stats");
    }
  }),

  revokeInvitation: adminProcedure
    .input(z.object({ invitationId: z.string() }))
    .mutation(async ({ input }) => {
      try {
        const client = await clerkClient();
        const invitation = await client.invitations.revokeInvitation(
          input.invitationId,
        );
        return invitation;
      } catch (error) {
        console.error("Error revoking invitation:", error);
        throw new Error("Failed to revoke invitation");
      }
    }),

  releaseReservedCreditsForUser: adminProcedure
    .input(
      z.object({
        userId: z.string(),
        service: z.enum(["fal", "elevenlabs", "runway"]).optional(),
        reason: z.string().min(3),
        confirmed: z.literal(true),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      console.log("[SUPPORT_ACTION] releaseReservedCreditsForUser", {
        adminUserId: ctx.userId,
        targetUserId: input.userId,
        service: input.service ?? "all",
        reason: input.reason,
      });

      return convexClient.mutation(
        convexApi.credits.releaseReservedCreditsForUser,
        {
          userId: input.userId,
          service: input.service,
        },
      );
    }),

  grantPlanCreditsForUser: adminProcedure
    .input(
      z.object({
        userId: z.string(),
        planId: z.enum(["starter", "pro", "premium"]),
        reason: z.string().min(3),
        confirmed: z.literal(true),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const chargeId = `support_${Date.now()}_${ctx.userId}_${input.userId}`;

      console.log("[SUPPORT_ACTION] grantPlanCreditsForUser", {
        adminUserId: ctx.userId,
        targetUserId: input.userId,
        planId: input.planId,
        reason: input.reason,
        chargeId,
      });

      return convexClient.mutation(convexApi.credits.grantPlanCreditsForCharge, {
        userId: input.userId,
        planId: input.planId,
        chargeId,
        source: "support_manual_grant",
      });
    }),
});

export type UsersRouter = typeof usersRouter;
