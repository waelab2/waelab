"use client";

import type { GenerationRequest } from "@/hooks/use-analytics";
import { motion } from "framer-motion";
import {
  CheckCircle,
  Clock,
  Download,
  Play,
  Settings,
  User,
  Users,
  Video,
  Volume2,
  XCircle,
} from "lucide-react";
import { memo } from "react";

// Helper function to format time ago
const formatTimeAgo = (timestamp: number): string => {
  const now = Date.now();
  const diff = now - timestamp;
  const minutes = Math.floor(diff / (1000 * 60));
  const hours = Math.floor(diff / (1000 * 60 * 60));
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));

  if (minutes < 1) return "Just now";
  if (minutes < 60) return `${minutes} min ago`;
  if (hours < 24) return `${hours} hour${hours > 1 ? "s" : ""} ago`;
  return `${days} day${days > 1 ? "s" : ""} ago`;
};

// Helper function to get service icon and color
const getServiceInfo = (service: string) => {
  switch (service) {
    case "fal":
      return { icon: Video, color: "text-blue-500", label: "Fal.ai" };
    case "elevenlabs":
      return { icon: Volume2, color: "text-green-500", label: "ElevenLabs" };
    case "runway":
      return { icon: Play, color: "text-purple-500", label: "Runway" };
    default:
      return { icon: Settings, color: "text-gray-500", label: "Unknown" };
  }
};

// Helper function to get status icon and color
const getStatusInfo = (status: string) => {
  switch (status) {
    case "completed":
      return { icon: CheckCircle, color: "text-green-500" };
    case "failed":
      return { icon: XCircle, color: "text-red-500" };
    case "pending":
      return { icon: Clock, color: "text-yellow-500" };
    default:
      return { icon: Clock, color: "text-gray-500" };
  }
};

interface RecentActivityProps {
  recentRequests?: GenerationRequest[];
}

export const RecentActivity = memo(
  ({ recentRequests }: RecentActivityProps) => {
    // Show loading state or fallback if no data
    if (!recentRequests || recentRequests.length === 0) {
      return (
        <div className="rounded-xl border border-gray-700 bg-gray-800/40 p-6">
          <h3 className="mb-4 text-xl font-semibold text-white">
            Recent Activity
          </h3>
          <div className="space-y-3">
            <div className="flex items-center gap-3 rounded-lg p-2">
              <div className="rounded-lg bg-gray-700/50 p-2">
                <Clock className="h-4 w-4 text-gray-500" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="text-sm font-medium text-white">
                  No recent activity
                </div>
                <div className="text-xs text-gray-400">
                  Generation requests will appear here
                </div>
              </div>
            </div>
          </div>
        </div>
      );
    }

    return (
      <div className="rounded-xl border border-gray-700 bg-gray-800/40 p-6">
        <h3 className="mb-4 text-xl font-semibold text-white">
          Recent Activity
        </h3>
        <div className="space-y-3">
          {recentRequests.slice(0, 5).map((request, index) => {
            const serviceInfo = getServiceInfo(request.service);
            const statusInfo = getStatusInfo(request.status);
            const ServiceIcon = serviceInfo.icon;
            const StatusIcon = statusInfo.icon;

            return (
              <motion.div
                key={request._id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="flex items-center gap-3 rounded-lg p-2 transition-colors hover:bg-gray-700/50"
              >
                <div className={`rounded-lg bg-gray-700/50 p-2`}>
                  <ServiceIcon className={`h-4 w-4 ${serviceInfo.color}`} />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="text-sm font-medium text-white">
                    {serviceInfo.label} Generation
                  </div>
                  <div className="truncate text-xs text-gray-400">
                    {request.model_id} •{" "}
                    {request.user_id
                      ? `User: ${request.user_id.slice(0, 8)}...`
                      : "Anonymous"}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <StatusIcon className={`h-3 w-3 ${statusInfo.color}`} />
                  <div className="text-xs text-gray-400">
                    {formatTimeAgo(request.created_at)}
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    );
  },
);

RecentActivity.displayName = "RecentActivity";
