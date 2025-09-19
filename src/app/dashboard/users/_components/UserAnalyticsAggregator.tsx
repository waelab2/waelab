"use client";

import { DashboardCard } from "@/components/ui/dashboard-card";
// import { useMultipleUsersAnalytics } from "@/hooks/use-analytics";
import { formatNumber } from "@/lib/utils";
import { Activity, CheckCircle, Users, Zap } from "lucide-react";
import { useMemo } from "react";

interface UserAnalyticsAggregatorProps {
  userIds: string[];
  totalUsers: number;
  activeUsers: number;
  isLoading?: boolean;
}

export function UserAnalyticsAggregator({
  userIds: _userIds,
  totalUsers,
  activeUsers,
  isLoading = false,
}: UserAnalyticsAggregatorProps) {
  // Get analytics for all users at once
  // Temporarily disabled until Convex deployment is fixed
  // const userAnalytics = useMultipleUsersAnalytics(userIds);
  // const userAnalytics = null;

  const stats = useMemo(() => {
    if (isLoading) {
      return [
        {
          title: "Total Users",
          value: "Loading...",
          change: "0%",
          changeType: "positive" as const,
          icon: Users,
          color: "text-blue-500",
          bgColor: "bg-blue-500/10",
        },
        {
          title: "Active Users",
          value: "Loading...",
          change: "0%",
          changeType: "positive" as const,
          icon: CheckCircle,
          color: "text-green-500",
          bgColor: "bg-green-500/10",
        },
        {
          title: "Total Generations",
          value: "Loading...",
          change: "0%",
          changeType: "positive" as const,
          icon: Activity,
          color: "text-purple-500",
          bgColor: "bg-purple-500/10",
        },
        {
          title: "Avg. per User",
          value: "Loading...",
          change: "0%",
          changeType: "positive" as const,
          icon: Zap,
          color: "text-orange-500",
          bgColor: "bg-orange-500/10",
        },
      ];
    }

    // Get totals from the aggregated analytics
    // Temporarily set to 0 until Convex deployment is fixed
    const totalGenerations = 0;
    const avgGenerationsPerUser = 0;

    return [
      {
        title: "Total Users",
        value: formatNumber(totalUsers),
        change: "0%",
        changeType: "positive" as const,
        icon: Users,
        color: "text-blue-500",
        bgColor: "bg-blue-500/10",
      },
      {
        title: "Active Users",
        value: formatNumber(activeUsers),
        change: "0%",
        changeType: "positive" as const,
        icon: CheckCircle,
        color: "text-green-500",
        bgColor: "bg-green-500/10",
      },
      {
        title: "Total Generations",
        value: formatNumber(totalGenerations),
        change: "0%",
        changeType: "positive" as const,
        icon: Activity,
        color: "text-purple-500",
        bgColor: "bg-purple-500/10",
      },
      {
        title: "Avg. per User",
        value: formatNumber(avgGenerationsPerUser),
        change: "0%",
        changeType: "positive" as const,
        icon: Zap,
        color: "text-orange-500",
        bgColor: "bg-orange-500/10",
      },
    ];
  }, [totalUsers, activeUsers, isLoading]);

  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4 lg:grid-cols-4">
      {stats.map((stat, index) => (
        <DashboardCard key={stat.title} stat={stat} index={index} />
      ))}
    </div>
  );
}
