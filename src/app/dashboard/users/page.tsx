"use client";

import { TextReveal } from "@/components/ui/text-reveal";
import { api } from "@/trpc/react";
import { UserAnalyticsAggregator } from "./_components/UserAnalyticsAggregator";
import { UsersTableWithStats } from "./_components/UsersTableWithStats";

export default function UsersPage() {
  // Fetch all users using tRPC
  const { data: users, isLoading: usersLoading } = api.users.getAll.useQuery();

  return (
    <main className="flex flex-col gap-6 py-6 text-white">
      <div className="px-2 sm:px-0">
        <div className="flex flex-col gap-6">
          <div>
            <TextReveal
              className="text-2xl font-bold tracking-tight sm:text-3xl"
              split="letter"
            >
              Users
            </TextReveal>
            <TextReveal
              className="text-sm text-gray-400 sm:text-base"
              delay={0.15}
              duration={0.2}
            >
              Manage and monitor all platform users and their activity.
            </TextReveal>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      {users && (
        <UserAnalyticsAggregator
          userIds={users.map((user) => user.id)}
          totalUsers={users.length}
          activeUsers={users.filter((user) => user.status === "active").length}
          isLoading={usersLoading}
        />
      )}

      {/* Users Table */}
      <div className="rounded-xl border border-gray-700 bg-gray-800/40 p-3 sm:p-6">
        <div className="mb-6 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <div>
            <h3 className="text-lg font-semibold text-white sm:text-xl">
              All Users
            </h3>
            <p className="text-sm text-gray-400">
              Complete list of registered users with their activity stats
            </p>
          </div>
        </div>

        <UsersTableWithStats users={users} isLoading={usersLoading} />
      </div>
    </main>
  );
}
