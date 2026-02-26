import { redirect } from "next/navigation";
import { getViewerAccess } from "~/server/authz";

export default async function UsersLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const viewerAccess = await getViewerAccess();

  if (!viewerAccess.isAdmin) {
    redirect("/dashboard");
  }

  return <>{children}</>;
}
