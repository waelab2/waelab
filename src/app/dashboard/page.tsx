import { Bot, Settings2, SquareTerminal } from "lucide-react";
import QuickLinkCard from "./_components/QuickLinkCard";

export default function DashboardPage() {
  return (
    <main className="flex flex-col gap-6 py-6">
      <h1 className="text-2xl font-semibold tracking-tight">Welcome back!</h1>
      <section className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        <QuickLinkCard
          href="/dashboard/playground"
          title="Playground"
          description="Browse and select AI video models."
          Icon={SquareTerminal}
        />
        <QuickLinkCard
          href="/dashboard/models/list"
          title="Models"
          description="View and compare available models."
          Icon={Bot}
        />
        <QuickLinkCard
          href="/dashboard/settings/general"
          title="Settings"
          description="Manage your account and preferences."
          Icon={Settings2}
        />
      </section>
    </main>
  );
}
