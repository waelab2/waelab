"use client";

import { DashboardCard } from "@/components/ui/dashboard-card";
// import { useMultipleUsersAnalytics } from "@/hooks/use-analytics";
import { formatNumber } from "@/lib/utils";
import { CheckCircle, Clock, Mail, Users } from "lucide-react";
import { useMemo } from "react";

interface UserAnalyticsAggregatorProps {
  userIds: string[];
  totalUsers: number;
  activeUsers: number;
  invitationStats?: {
    total: number;
    pending: number;
    accepted: number;
    revoked: number;
  };
  isLoading?: boolean;
}

export function UserAnalyticsAggregator({
  userIds: _userIds,
  totalUsers,
  activeUsers,
  invitationStats,
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
          title: "Total Invitations",
          value: "Loading...",
          change: "0%",
          changeType: "positive" as const,
          icon: Mail,
          color: "text-indigo-500",
          bgColor: "bg-indigo-500/10",
        },
        {
          title: "Pending Invitations",
          value: "Loading...",
          change: "0%",
          changeType: "positive" as const,
          icon: Clock,
          color: "text-yellow-500",
          bgColor: "bg-yellow-500/10",
        },
      ];
    }

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
        title: "Total Invitations",
        value: formatNumber(invitationStats?.total ?? 0),
        change: "0%",
        changeType: "positive" as const,
        icon: Mail,
        color: "text-indigo-500",
        bgColor: "bg-indigo-500/10",
      },
      {
        title: "Pending Invitations",
        value: formatNumber(invitationStats?.pending ?? 0),
        change: "0%",
        changeType: "positive" as const,
        icon: Clock,
        color: "text-yellow-500",
        bgColor: "bg-yellow-500/10",
      },
    ];
  }, [totalUsers, activeUsers, invitationStats, isLoading]);

  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4 lg:grid-cols-4">
      {stats.map((stat, index) => (
        <DashboardCard key={stat.title} stat={stat} index={index} />
      ))}
    </div>
  );
}
