"use client";

import type { ModelAnalytics } from "@/hooks/use-analytics";
import { motion } from "framer-motion";
import { BarChart3, Play, Video, Volume2 } from "lucide-react";
import { memo, useMemo } from "react";

// Helper function to format numbers
const formatNumber = (num: number | undefined | null): string => {
  if (num === undefined || num === null || isNaN(num)) {
    return "0";
  }
  if (num >= 1000000) {
    return (num / 1000000).toFixed(1) + "M";
  } else if (num >= 1000) {
    return (num / 1000).toFixed(1) + "K";
  }
  return num.toString();
};

// Helper function to get period description
const getPeriodDescription = (
  period: "today" | "week" | "month" | "year",
): string => {
  switch (period) {
    case "today":
      return "Today's service usage and performance";
    case "week":
      return "This week's service usage and performance";
    case "month":
      return "This month's service usage and performance";
    case "year":
      return "This year's service usage and performance";
    default:
      return "Service usage and performance";
  }
};

interface RevenueChartProps {
  modelAnalytics?: ModelAnalytics | null | undefined;
  timePeriod?: "today" | "week" | "month" | "year";
}

export const RevenueChart = memo(
  ({ modelAnalytics, timePeriod = "month" }: RevenueChartProps) => {
    // Process analytics data for chart display
    const chartData = useMemo(() => {
      if (!modelAnalytics) {
        return [
          {
            service: "Fal.ai",
            value: 0,
            requests: 0,
            color: "bg-blue-500",
            icon: Video,
          },
          {
            service: "ElevenLabs",
            value: 0,
            requests: 0,
            color: "bg-green-500",
            icon: Volume2,
          },
          {
            service: "Runway",
            value: 0,
            requests: 0,
            color: "bg-purple-500",
            icon: Play,
          },
        ];
      }

      const modelBreakdown = modelAnalytics.model_breakdown;
      const serviceData: Record<string, { requests: number; credits: number }> =
        {};

      // Group by service
      Object.entries(modelBreakdown).forEach(([modelId, stats]) => {
        const service = modelId.split("/")[0];
        if (!serviceData[service]) {
          serviceData[service] = { requests: 0, credits: 0 };
        }
        serviceData[service].requests += stats.total_requests;
        serviceData[service].credits += stats.total_credits_used;
      });

      return [
        {
          service: "Fal.ai",
          value: serviceData.fal?.credits ?? 0,
          requests: serviceData.fal?.requests ?? 0,
          color: "bg-blue-500",
          icon: Video,
        },
        {
          service: "ElevenLabs",
          value: serviceData.elevenlabs?.credits ?? 0,
          requests: serviceData.elevenlabs?.requests ?? 0,
          color: "bg-green-500",
          icon: Volume2,
        },
        {
          service: "Runway",
          value: serviceData.runway?.credits ?? 0,
          requests: serviceData.runway?.requests ?? 0,
          color: "bg-purple-500",
          icon: Play,
        },
      ];
    }, [modelAnalytics]);

    const maxValue = Math.max(...chartData.map((item) => item.value), 1);
    const totalRequests = chartData.reduce(
      (sum, item) => sum + item.requests,
      0,
    );
    const totalCredits = chartData.reduce((sum, item) => sum + item.value, 0);
    const successRate =
      modelAnalytics && modelAnalytics.model_breakdown
        ? Math.round(
            (Object.values(modelAnalytics.model_breakdown).reduce(
              (sum, model) => sum + (model.completed_requests ?? 0),
              0,
            ) /
              Math.max(
                Object.values(modelAnalytics.model_breakdown).reduce(
                  (sum, model) => sum + (model.total_requests ?? 0),
                  0,
                ),
                1,
              )) *
              100,
          )
        : 0;
    return (
      <div className="rounded-xl border border-gray-700 bg-gray-800/40 p-6">
        <div className="mb-6">
          <h3 className="flex items-center gap-2 text-lg font-semibold text-white">
            <BarChart3 className="h-5 w-5 text-green-500" />
            Generation Analytics
          </h3>
          <p className="text-sm text-gray-400">
            {getPeriodDescription(timePeriod)}
          </p>
        </div>

        {/* Service Chart Area */}
        <div className="relative mb-4 h-64 rounded-lg p-4">
          <div className="flex h-full items-end justify-between gap-3">
            {chartData.map((item, index) => {
              const Icon = item.icon;
              return (
                <div
                  key={item.service}
                  className="group flex flex-1 flex-col items-center"
                >
                  <motion.div
                    initial={{ height: 0 }}
                    animate={{ height: `${(item.value / maxValue) * 180}px` }}
                    transition={{ duration: 1, delay: index * 0.1 }}
                    className={`w-full ${item.color} relative min-h-[20px] cursor-pointer rounded-t-lg transition-opacity hover:opacity-80`}
                  >
                    {/* Tooltip */}
                    <div className="absolute -top-20 left-1/2 z-10 -translate-x-1/2 transform rounded-lg border border-gray-600 bg-gray-800 px-3 py-2 text-sm whitespace-nowrap text-white opacity-0 shadow-lg transition-opacity group-hover:opacity-100">
                      <div className="font-medium">
                        {formatNumber(item.credits)} credits
                      </div>
                      <div className="text-xs text-gray-300">
                        {formatNumber(item.requests)} requests
                      </div>
                    </div>
                  </motion.div>
                  <div className="mt-2 flex flex-col items-center">
                    <Icon className="mb-1 h-4 w-4 text-gray-400" />
                    <div className="text-center text-xs font-medium text-gray-400">
                      {item.service}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Summary Stats */}
        <div className="grid grid-cols-3 gap-4 border-t border-gray-700/50 pt-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-green-500">
              {formatNumber(totalRequests)}
            </div>
            <div className="text-xs text-gray-400">Total Requests</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-500">
              {successRate}%
            </div>
            <div className="text-xs text-gray-400">Success Rate</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-purple-500">
              {formatNumber(totalCredits)}
            </div>
            <div className="text-xs text-gray-400">Credits Used</div>
          </div>
        </div>
      </div>
    );
  },
);

RevenueChart.displayName = "RevenueChart";
