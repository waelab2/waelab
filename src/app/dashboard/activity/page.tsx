"use client";

import { Switch } from "@/components/ui/switch";
import { TextReveal } from "@/components/ui/text-reveal";
import { api } from "@/trpc/react";
import { motion } from "framer-motion";
import {
  Activity,
  CheckCircle,
  Clock,
  Play,
  Settings,
  User,
  Users,
  Video,
  Volume2,
  XCircle,
} from "lucide-react";
import { useMemo, useState } from "react";

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

const formatDate = (timestamp: number): string => {
  return new Date(timestamp).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

export default function ActivityPage() {
  const [isUserScope, setIsUserScope] = useState(false);

  const { data: viewerAccess } = api.users.getViewerAccess.useQuery();
  const isAdmin = viewerAccess?.isAdmin ?? false;
  const effectiveScope = isAdmin ? (isUserScope ? "my" : "all") : "my";

  const { data: requests } = api.analytics.getGenerationRequests.useQuery({
    limit: 100,
    scope: effectiveScope,
  });

  const groupedRequests = useMemo(() => {
    if (!requests) return {};

    const groups: Record<string, typeof requests> = {};

    requests.forEach((request) => {
      const date = new Date(request.created_at).toDateString();
      groups[date] ??= [];
      groups[date].push(request);
    });

    const sortedGroups: Record<string, typeof requests> = {};
    Object.keys(groups)
      .sort((a, b) => new Date(b).getTime() - new Date(a).getTime())
      .forEach((date) => {
        sortedGroups[date] = groups[date] ?? [];
      });

    return sortedGroups;
  }, [requests]);

  const stats = useMemo(() => {
    if (!requests) {
      return {
        total: 0,
        completed: 0,
        failed: 0,
        pending: 0,
      };
    }

    return {
      total: requests.length,
      completed: requests.filter((r) => r.status === "completed").length,
      failed: requests.filter((r) => r.status === "failed").length,
      pending: requests.filter((r) => r.status === "pending").length,
    };
  }, [requests]);

  return (
    <main className="flex flex-col gap-6 py-6 text-white">
      <div className="px-2 sm:px-0">
        <div className="flex flex-col gap-6">
          <div>
            <TextReveal
              className="text-2xl font-bold tracking-tight sm:text-3xl"
              split="letter"
            >
              Activity
            </TextReveal>
            <TextReveal
              className="text-sm text-gray-400 sm:text-base"
              delay={0.15}
              duration={0.2}
            >
              {isAdmin
                ? "View all recent generation requests and their status"
                : "View your recent generation requests and their status"}
            </TextReveal>
          </div>
          {isAdmin ? (
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-2">
                <Users className="h-4 w-4 text-gray-400" />
                <span className="text-sm text-gray-400">All Users</span>
              </div>
              <Switch
                checked={isUserScope}
                onCheckedChange={setIsUserScope}
                aria-label="Toggle between all users and user-specific data"
              />
              <div className="flex items-center gap-2">
                <User className="h-4 w-4 text-gray-400" />
                <span className="text-sm text-gray-400">My Activity</span>
              </div>
            </div>
          ) : null}

          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 sm:gap-4">
            <div className="rounded-xl border border-gray-700 bg-gray-800/40 p-4">
              <div className="flex items-center gap-2">
                <Activity className="h-4 w-4 text-blue-500" />
                <span className="text-sm text-gray-400">Total</span>
              </div>
              <div className="text-2xl font-bold text-white">{stats.total}</div>
            </div>
            <div className="rounded-xl border border-gray-700 bg-gray-800/40 p-4">
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-500" />
                <span className="text-sm text-gray-400">Completed</span>
              </div>
              <div className="text-2xl font-bold text-white">
                {stats.completed}
              </div>
            </div>
            <div className="rounded-xl border border-gray-700 bg-gray-800/40 p-4">
              <div className="flex items-center gap-2">
                <XCircle className="h-4 w-4 text-red-500" />
                <span className="text-sm text-gray-400">Failed</span>
              </div>
              <div className="text-2xl font-bold text-white">{stats.failed}</div>
            </div>
            <div className="rounded-xl border border-gray-700 bg-gray-800/40 p-4">
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-yellow-500" />
                <span className="text-sm text-gray-400">Pending</span>
              </div>
              <div className="text-2xl font-bold text-white">{stats.pending}</div>
            </div>
          </div>
        </div>
      </div>

      <div className="px-2 sm:px-0">
        {!requests ? (
          <div className="flex items-center justify-center py-12">
            <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-white"></div>
          </div>
        ) : Object.keys(groupedRequests).length === 0 ? (
          <div className="rounded-xl border border-gray-700 bg-gray-800/40 p-8 text-center">
            <Activity className="mx-auto mb-4 h-12 w-12 text-gray-500" />
            <h3 className="mb-2 text-lg font-semibold text-white">
              No Activity
            </h3>
            <p className="text-gray-400">
              No generation requests found. Start using the playground to see
              activity here.
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            {Object.entries(groupedRequests).map(([date, requests]) => (
              <div key={date} className="space-y-3">
                <h2 className="border-b border-gray-700 pb-2 text-lg font-semibold text-white">
                  {new Date(date).toLocaleDateString("en-US", {
                    weekday: "long",
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </h2>
                <div className="space-y-2">
                  {requests.map((request, index) => {
                    const serviceInfo = getServiceInfo(request.service);
                    const statusInfo = getStatusInfo(request.status);
                    const ServiceIcon = serviceInfo.icon;
                    const StatusIcon = statusInfo.icon;

                    return (
                      <motion.div
                        key={request._id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.05 }}
                        className="flex items-center gap-4 rounded-lg border border-gray-700 bg-gray-800/40 p-4 transition-colors hover:bg-gray-700/50"
                      >
                        <div className={`rounded-lg bg-gray-700/50 p-2`}>
                          <ServiceIcon
                            className={`h-5 w-5 ${serviceInfo.color}`}
                          />
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="mb-1 flex items-center gap-2">
                            <div className="text-sm font-medium text-white">
                              {serviceInfo.label} Generation
                            </div>
                            <StatusIcon
                              className={`h-3 w-3 ${statusInfo.color}`}
                            />
                          </div>
                          <div className="truncate text-xs text-gray-400">
                            Model: {request.model_id}
                          </div>
                          <div className="mt-1 flex items-center gap-4 text-xs text-gray-500">
                            <span>ID: {request.request_id}</span>
                            {request.credits_used !== undefined && (
                              <span>Credits: {request.credits_used}</span>
                            )}
                            {request.file_size !== undefined && (
                              <span>
                                Size: {(request.file_size / 1024 / 1024).toFixed(2)}
                                MB
                              </span>
                            )}
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-xs text-gray-400">
                            {formatTimeAgo(request.created_at)}
                          </div>
                          <div className="text-xs text-gray-500">
                            {formatDate(request.created_at)}
                          </div>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
