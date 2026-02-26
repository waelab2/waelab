import { clerkClient } from "@clerk/nextjs/server";
import { auth } from "@clerk/nextjs/server";

export interface ViewerAccess {
  userId: string;
  role: string;
  isAdmin: boolean;
}

export async function getViewerAccessByUserId(userId: string): Promise<ViewerAccess> {
  const client = await clerkClient();
  const user = await client.users.getUser(userId);
  const role = (user.publicMetadata?.role as string | undefined) ?? "User";

  return {
    userId,
    role,
    isAdmin: role === "Admin",
  };
}

export async function getViewerAccess(): Promise<ViewerAccess> {
  const { userId } = await auth();

  if (!userId) {
    throw new Error("Unauthorized");
  }

  return getViewerAccessByUserId(userId);
}
