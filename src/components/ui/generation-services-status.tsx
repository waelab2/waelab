"use client";

import type { ModelAnalytics } from "@/hooks/use-analytics";
import { formatFileSize, formatNumber } from "@/lib/utils";
import { motion } from "framer-motion";
import {
  Activity,
  AlertTriangle,
  CheckCircle,
  Clock,
  Database,
  HardDrive,
  TrendingUp,
  Users,
  Zap,
} from "lucide-react";
import { memo, useMemo } from "react";

interface ServiceStatusItem {
  label: string;
  status: string;
  color: string;
  icon: React.ComponentType<{ className?: string }>;
  percentage: number;
  value?: string;
}

export const GenerationServicesStatus = memo(
  ({ modelAnalytics }: { modelAnalytics?: ModelAnalytics | null }) => {
    const totals = useMemo(() => {
      if (!modelAnalytics) return null;

      const { model_breakdown } = modelAnalytics;
      let total_requests = 0;
      let completed_requests = 0;
      let failed_requests = 0;
      let total_credits_used = 0;
      let total_file_size = 0;
      let total_generation_time = 0;
      let completed_count = 0;

      Object.values(model_breakdown).forEach((stats) => {
        total_requests += stats.total_requests;
        completed_requests += stats.completed_requests;
        failed_requests += stats.failed_requests;
        total_credits_used += stats.total_credits_used;
        total_file_size += stats.total_file_size;
        if (stats.average_generation_time_ms > 0) {
          total_generation_time += stats.average_generation_time_ms;
          completed_count++;
        }
      });

      const average_generation_time_ms =
        completed_count > 0 ? total_generation_time / completed_count : 0;
      const pending_requests = 0;

      return {
        total_requests,
        completed_requests,
        failed_requests,
        total_credits_used,
        total_file_size,
        average_generation_time_ms,
        pending_requests,
      };
    }, [modelAnalytics]);

    const statusItems = useMemo((): ServiceStatusItem[] => {
      if (!modelAnalytics || !totals) {
        return [
          {
            label: "fal.ai Service",
            status: "Loading...",
            color: "text-gray-400",
            icon: Database,
            percentage: 0,
          },
          {
            label: "ElevenLabs Service",
            status: "Loading...",
            color: "text-gray-400",
            icon: Activity,
            percentage: 0,
          },
          {
            label: "Runway Service",
            status: "Loading...",
            color: "text-gray-400",
            icon: Zap,
            percentage: 0,
          },
          {
            label: "Request Queue",
            status: "Loading...",
            color: "text-gray-400",
            icon: Clock,
            percentage: 0,
          },
        ];
      }

      const { model_breakdown } = modelAnalytics;
      const { total_requests, average_generation_time_ms, pending_requests } =
        totals;

      const getServiceMetrics = (service: "fal" | "elevenlabs" | "runway") => {
        const serviceModels = Object.entries(model_breakdown).filter(
          ([modelId]) => modelId.includes(service),
        );

        const serviceRequests = serviceModels.reduce(
          (sum, [, stats]) => sum + stats.total_requests,
          0,
        );

        let serviceCompleted = 0;
        let serviceTotal = 0;
        let serviceAvgTime = 0;

        serviceModels.forEach(([, stats]) => {
          serviceTotal += stats.total_requests;
          serviceCompleted += stats.completed_requests;
          serviceAvgTime += stats.average_generation_time_ms;
        });

        const serviceSuccessRate =
          serviceTotal > 0
            ? Math.round((serviceCompleted / serviceTotal) * 100)
            : 100;

        const avgTime =
          serviceModels.length > 0
            ? Math.round(serviceAvgTime / serviceModels.length)
            : 0;

        return {
          successRate: serviceSuccessRate,
          avgTime,
          requests: serviceRequests,
          isHealthy: serviceSuccessRate >= 90 && serviceRequests > 0,
        };
      };

      const falMetrics = getServiceMetrics("fal");
      const elevenLabsMetrics = getServiceMetrics("elevenlabs");
      const runwayMetrics = getServiceMetrics("runway");

      const queueHealth =
        pending_requests < 10
          ? "Healthy"
          : pending_requests < 25
            ? "Moderate"
            : "High Load";
      const queueColor =
        pending_requests < 10
          ? "text-green-500"
          : pending_requests < 25
            ? "text-yellow-500"
            : "text-red-500";
      const queuePercentage = Math.min((pending_requests / 50) * 100, 100);

      return [
        {
          label: "fal.ai Service",
          status: falMetrics.isHealthy ? "Healthy" : "Issues",
          color: falMetrics.isHealthy ? "text-green-500" : "text-yellow-500",
          icon: Database,
          percentage: falMetrics.successRate,
          value: `${falMetrics.successRate}% success`,
        },
        {
          label: "ElevenLabs Service",
          status: elevenLabsMetrics.isHealthy ? "Healthy" : "Issues",
          color: elevenLabsMetrics.isHealthy
            ? "text-green-500"
            : "text-yellow-500",
          icon: Activity,
          percentage: elevenLabsMetrics.successRate,
          value: `${elevenLabsMetrics.successRate}% success`,
        },
        {
          label: "Runway Service",
          status: runwayMetrics.isHealthy ? "Healthy" : "Issues",
          color: runwayMetrics.isHealthy ? "text-green-500" : "text-yellow-500",
          icon: Zap,
          percentage: runwayMetrics.successRate,
          value: `${runwayMetrics.successRate}% success`,
        },
        {
          label: "Request Queue",
          status: queueHealth,
          color: queueColor,
          icon: Clock,
          percentage: queuePercentage,
          value: `${pending_requests} pending`,
        },
        {
          label: "Avg Response Time",
          status:
            average_generation_time_ms < 30000
              ? "Fast"
              : average_generation_time_ms < 60000
                ? "Moderate"
                : "Slow",
          color:
            average_generation_time_ms < 30000
              ? "text-green-500"
              : average_generation_time_ms < 60000
                ? "text-yellow-500"
                : "text-red-500",
          icon: TrendingUp,
          percentage: Math.min(
            (30000 / Math.max(average_generation_time_ms, 1)) * 100,
            100,
          ),
          value: `${Math.round(average_generation_time_ms / 1000)}s avg`,
        },
        {
          label: "Active Users",
          status: "Active",
          color: "text-blue-500",
          icon: Users,
          percentage: Math.min((total_requests / 100) * 100, 100),
          value: `${formatNumber(total_requests)} requests`,
        },
      ];
    }, [modelAnalytics, totals]);

    return (
      <div className="rounded-xl border border-gray-700 bg-gray-800/40 p-6">
        <h3 className="mb-4 text-xl font-semibold text-white">
          Generation Services Status
        </h3>
        <div className="space-y-4">
          {statusItems.map((item, index) => {
            const Icon = item.icon;
            return (
              <motion.div
                key={item.label}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className="flex cursor-pointer items-center justify-between rounded-lg p-3 transition-colors hover:bg-gray-700/50"
              >
                <div className="flex items-center gap-3">
                  <Icon className={`h-4 w-4 ${item.color}`} />
                  <span className="text-sm font-medium text-white">
                    {item.label}
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="h-2 w-16 overflow-hidden rounded-full bg-gray-700">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${item.percentage}%` }}
                      transition={{ duration: 1, delay: index * 0.1 }}
                      className={`h-full rounded-full ${item.color.replace("text-", "bg-")}`}
                    />
                  </div>
                  <div className="flex flex-col items-end">
                    <span
                      className={`text-sm font-medium ${item.color} min-w-[60px] text-right`}
                    >
                      {item.status}
                    </span>
                    {item.value && (
                      <span className="text-xs text-gray-400">{item.value}</span>
                    )}
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>

        {totals && (
          <div className="mt-4 border-t border-gray-700 pt-4">
            <div className="grid grid-cols-2 gap-4 text-xs text-gray-400">
              <div className="flex items-center gap-2">
                <CheckCircle className="h-3 w-3 text-green-500" />
                <span>{formatNumber(totals.completed_requests)} completed</span>
              </div>
              <div className="flex items-center gap-2">
                <AlertTriangle className="h-3 w-3 text-red-500" />
                <span>{formatNumber(totals.failed_requests)} failed</span>
              </div>
              <div className="flex items-center gap-2">
                <Zap className="h-3 w-3 text-purple-500" />
                <span>{formatNumber(totals.total_credits_used)} credits</span>
              </div>
              <div className="flex items-center gap-2">
                <HardDrive className="h-3 w-3 text-orange-500" />
                <span>{formatFileSize(totals.total_file_size)} generated</span>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  },
);

GenerationServicesStatus.displayName = "GenerationServicesStatus";
