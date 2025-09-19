import { clerkClient } from "@clerk/nextjs/server";
import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";

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
  getAll: protectedProcedure.query(async () => {
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

  getRecent: protectedProcedure
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
});

export type UsersRouter = typeof usersRouter;
