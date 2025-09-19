"use client";

import { DashboardCard } from "@/components/ui/dashboard-card";
import { QuickActions } from "@/components/ui/quick-actions";
import { RecentActivity } from "@/components/ui/recent-activity";
import { RevenueChart } from "@/components/ui/revenue-chart";
import { SystemStatus } from "@/components/ui/system-status";
import type { TimePeriod } from "@/components/ui/time-period-selector";
import { TimePeriodSelector } from "@/components/ui/time-period-selector";
import { UsersTable } from "@/components/ui/users-table";
import {
  useGenerationRequests,
  useModelUsageStatsForDateRange,
} from "@/hooks/use-analytics";
import {
  calculatePercentageChange,
  formatFileSize,
  formatNumber,
  getDateRange,
  getPreviousDateRange,
} from "@/lib/utils";
import { Activity, CheckCircle, Eye, Zap } from "lucide-react";
import { useMemo, useState } from "react";

export default function DashboardPage() {
  // State for selected time period
  const [selectedPeriod, setSelectedPeriod] = useState<TimePeriod>("month");

  // Calculate date ranges based on selected period
  const { start: currentStart, end: currentEnd } = getDateRange(selectedPeriod);
  const { start: previousStart, end: previousEnd } =
    getPreviousDateRange(selectedPeriod);

  // Fetch analytics data
  const currentAnalytics = useModelUsageStatsForDateRange(
    currentStart,
    currentEnd,
  );
  const previousAnalytics = useModelUsageStatsForDateRange(
    previousStart,
    previousEnd,
  );
  const recentRequests = useGenerationRequests({ limit: 10 });

  // Calculate stats from analytics data with period-over-period comparison
  const stats = useMemo(() => {
    // Get current period data
    const currentData = currentAnalytics?.model_breakdown;
    const previousData = previousAnalytics?.model_breakdown;

    if (!currentData) {
      return [
        {
          title: "Total Requests",
          value: "0",
          change: "0%",
          changeType: "positive" as const,
          icon: Activity,
          color: "text-blue-500",
          bgColor: "bg-blue-500/10",
        },
        {
          title: "Success Rate",
          value: "0%",
          change: "0%",
          changeType: "positive" as const,
          icon: CheckCircle,
          color: "text-green-500",
          bgColor: "bg-green-500/10",
        },
        {
          title: "Credits Used",
          value: "0",
          change: "0%",
          changeType: "positive" as const,
          icon: Zap,
          color: "text-purple-500",
          bgColor: "bg-purple-500/10",
        },
        {
          title: "Data Generated",
          value: "0 B",
          change: "0%",
          changeType: "positive" as const,
          icon: Eye,
          color: "text-orange-500",
          bgColor: "bg-orange-500/10",
        },
      ];
    }

    // Calculate current month totals
    let currentRequests = 0;
    let currentCompleted = 0;
    let currentCredits = 0;
    let currentFileSize = 0;

    // Calculate last month totals
    let lastRequests = 0;
    let lastCompleted = 0;
    let lastCredits = 0;
    let lastFileSize = 0;

    // Safely iterate through current month data
    for (const modelId in currentData) {
      const model = currentData[modelId];
      if (model) {
        currentRequests += model.total_requests ?? 0;
        currentCompleted += model.completed_requests ?? 0;
        currentCredits += model.total_credits_used ?? 0;
        currentFileSize += model.total_file_size ?? 0;
      }
    }

    // Safely iterate through previous period data
    if (previousData) {
      for (const modelId in previousData) {
        const model = previousData[modelId];
        if (model) {
          lastRequests += model.total_requests ?? 0;
          lastCompleted += model.completed_requests ?? 0;
          lastCredits += model.total_credits_used ?? 0;
          lastFileSize += model.total_file_size ?? 0;
        }
      }
    }

    const currentSuccessRate =
      currentRequests > 0
        ? Math.round((currentCompleted / currentRequests) * 100)
        : 0;
    const lastSuccessRate =
      lastRequests > 0 ? Math.round((lastCompleted / lastRequests) * 100) : 0;

    // Calculate percentage changes
    const requestsChange = calculatePercentageChange(
      currentRequests,
      lastRequests,
    );
    const successRateChange = calculatePercentageChange(
      currentSuccessRate,
      lastSuccessRate,
    );
    const creditsChange = calculatePercentageChange(
      currentCredits,
      lastCredits,
    );
    const fileSizeChange = calculatePercentageChange(
      currentFileSize,
      lastFileSize,
    );

    return [
      {
        title: "Total Requests",
        value: formatNumber(currentRequests),
        change: requestsChange.change,
        changeType: requestsChange.changeType,
        icon: Activity,
        color: "text-blue-500",
        bgColor: "bg-blue-500/10",
      },
      {
        title: "Success Rate",
        value: `${currentSuccessRate}%`,
        change: successRateChange.change,
        changeType: successRateChange.changeType,
        icon: CheckCircle,
        color: "text-green-500",
        bgColor: "bg-green-500/10",
      },
      {
        title: "Credits Used",
        value: formatNumber(currentCredits),
        change: creditsChange.change,
        changeType: creditsChange.changeType,
        icon: Zap,
        color: "text-purple-500",
        bgColor: "bg-purple-500/10",
      },
      {
        title: "Data Generated",
        value: formatFileSize(currentFileSize),
        change: fileSizeChange.change,
        changeType: fileSizeChange.changeType,
        icon: Eye,
        color: "text-orange-500",
        bgColor: "bg-orange-500/10",
      },
    ];
  }, [currentAnalytics, previousAnalytics]);

  const handleExport = () => {
    console.log("Exporting data...");
  };

  const handleAddUser = () => {
    console.log("Adding new user...");
  };

  return (
    <main className="flex flex-col gap-6 py-6 text-white">
      <div className="px-2 sm:px-0">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="animate-fade-in text-2xl font-bold tracking-tight sm:text-3xl">
              Welcome back!
            </h1>
            <p className="text-sm text-gray-400 sm:text-base">
              Here&apos;s what&apos;s happening with your platform today.
            </p>
          </div>
          <TimePeriodSelector
            selectedPeriod={selectedPeriod}
            onPeriodChange={setSelectedPeriod}
            className="sm:ml-auto"
          />
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4 lg:grid-cols-4">
        {stats.map((stat, index) => (
          <DashboardCard key={stat.title} stat={stat} index={index} />
        ))}
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 gap-4 sm:gap-6 xl:grid-cols-3">
        {/* Charts Section */}
        <div className="space-y-4 sm:space-y-6 xl:col-span-2">
          <RevenueChart
            modelAnalytics={currentAnalytics}
            timePeriod={selectedPeriod}
          />
          <UsersTable onAddUser={handleAddUser} />
        </div>

        {/* Sidebar Section */}
        <div className="space-y-4 sm:space-y-6">
          <QuickActions onAddUser={handleAddUser} onExport={handleExport} />
          <SystemStatus />
          <RecentActivity
            recentRequests={recentRequests}
            startDate={currentStart}
            endDate={currentEnd}
          />
        </div>
      </div>
    </main>
  );
}
