"use client";

import { DashboardCard } from "@/components/ui/dashboard-card";
import { QuickActions } from "@/components/ui/quick-actions";
import { RecentActivity } from "@/components/ui/recent-activity";
import { RevenueChart } from "@/components/ui/revenue-chart";
import { SystemStatus } from "@/components/ui/system-status";
import { UsersTable } from "@/components/ui/users-table";
import { Activity, DollarSign, Eye, Users } from "lucide-react";
import { useState } from "react";

// Dashboard stats data
const stats = [
  {
    title: "Total Users",
    value: "12,345",
    change: "+12%",
    changeType: "positive" as const,
    icon: Users,
    color: "text-blue-500",
    bgColor: "bg-blue-500/10",
  },
  {
    title: "Revenue",
    value: "$45,678",
    change: "+8.2%",
    changeType: "positive" as const,
    icon: DollarSign,
    color: "text-green-500",
    bgColor: "bg-green-500/10",
  },
  {
    title: "Active Sessions",
    value: "2,456",
    change: "+15%",
    changeType: "positive" as const,
    icon: Activity,
    color: "text-purple-500",
    bgColor: "bg-purple-500/10",
  },
  {
    title: "Page Views",
    value: "34,567",
    change: "-2.4%",
    changeType: "negative" as const,
    icon: Eye,
    color: "text-orange-500",
    bgColor: "bg-orange-500/10",
  },
];

export default function DashboardPage() {
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await new Promise((resolve) => setTimeout(resolve, 1000));
    setIsRefreshing(false);
  };

  const handleExport = () => {
    console.log("Exporting data...");
  };

  const handleAddUser = () => {
    console.log("Adding new user...");
  };

  return (
    <main className="flex flex-col gap-6 py-6 text-white">
      <div className="px-2 sm:px-0">
        <h1 className="animate-fade-in text-2xl font-bold tracking-tight sm:text-3xl">
          Welcome back!
        </h1>
        <p className="text-sm text-gray-400 sm:text-base">
          Here's what's happening with your platform today.
        </p>
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
          <RevenueChart />
          <UsersTable onAddUser={handleAddUser} />
        </div>

        {/* Sidebar Section */}
        <div className="space-y-4 sm:space-y-6">
          <QuickActions onAddUser={handleAddUser} onExport={handleExport} />
          <SystemStatus />
          <RecentActivity />
        </div>
      </div>
    </main>
  );
}
