"use client";

import { useAutoAnimate } from "@formkit/auto-animate/react";
import { SquareTerminal } from "lucide-react";
import QuickLinkCard from "./_components/QuickLinkCard";

export default function DashboardPage() {
  const [parent] = useAutoAnimate();

  return (
    <main className="flex flex-col gap-6 py-6 text-white">
      <h1 className="animate-fade-in text-2xl font-semibold tracking-tight">
        Welcome back!
      </h1>
      <section
        ref={parent}
        className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3"
      >
        <QuickLinkCard
          href="/dashboard/playground"
          title="Playground"
          description="Browse and select AI video models."
          Icon={SquareTerminal}
          className="animate-fade-in-up animate-delay-100"
        />
      </section>
    </main>
  );
}
