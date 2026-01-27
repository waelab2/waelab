"use client";

import { useUserAnalytics } from "@/hooks/use-analytics";
import { useUserSubscription } from "@/hooks/use-subscription";
import { formatNumber } from "@/lib/utils";
import { motion } from "framer-motion";
import {
  Activity,
  Calendar,
  CreditCard,
  Mail,
  Zap,
} from "lucide-react";
import Image from "next/image";
import { memo } from "react";

export interface UserWithStats {
  id: string;
  name: string;
  email: string;
  avatar: string;
  role: string;
  status: "active" | "inactive";
  joinDate: string;
  totalGenerations?: number;
  totalCredits?: number;
  lastActivity?: string;
}

interface UsersTableWithStatsProps {
  users?: UserWithStats[];
  isLoading?: boolean;
}

export const UsersTableWithStats = memo(
  ({ users = [], isLoading = false }: UsersTableWithStatsProps) => {
    if (isLoading) {
      return (
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, index) => (
            <div key={index} className="animate-pulse">
              <div className="flex items-center gap-4 rounded-lg bg-gray-700/30 p-4">
                <div className="h-12 w-12 rounded-full bg-gray-600"></div>
                <div className="flex-1 space-y-2">
                  <div className="h-4 w-32 rounded bg-gray-600"></div>
                  <div className="h-3 w-48 rounded bg-gray-600"></div>
                </div>
                <div className="space-y-2">
                  <div className="h-4 w-16 rounded bg-gray-600"></div>
                  <div className="h-3 w-12 rounded bg-gray-600"></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      );
    }

    return (
      <div className="space-y-2">
        {users.length === 0 ? (
          <div className="py-8 text-center">
            <p className="text-gray-400">No users found</p>
          </div>
        ) : (
          users.map((user, index) => (
            <UserRowWithStats key={user.id} user={user} index={index} />
          ))
        )}
      </div>
    );
  },
);

UsersTableWithStats.displayName = "UsersTableWithStats";

const UserRowWithStats = memo(
  ({ user, index }: { user: UserWithStats; index: number }) => {
    const userAnalytics = useUserAnalytics(user.id);
    const subscription = useUserSubscription(user.id);

    // Format plan name
    const getPlanName = (planId: string) => {
      return planId.charAt(0).toUpperCase() + planId.slice(1);
    };

    // Format subscription status badge
    const getStatusBadge = (status: string) => {
      const statusColors = {
        active: "bg-green-500/10 text-green-500",
        cancelled: "bg-red-500/10 text-red-500",
        failed: "bg-orange-500/10 text-orange-500",
        expired: "bg-gray-500/10 text-gray-500",
      };
      return (
        statusColors[status as keyof typeof statusColors] ??
        "bg-gray-500/10 text-gray-500"
      );
    };

    // Format amount (amounts are always in SAR, not halalas)
    const formatAmount = (amount: number, currency: string) => {
      return `${amount.toFixed(2)} ${currency}`;
    };

    return (
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: index * 0.05 }}
        className="group flex flex-col gap-4 rounded-lg border border-gray-700/50 bg-gray-800/20 p-4 transition-all hover:border-gray-600/50 hover:bg-gray-700/30"
      >
        {/* User Info */}
        <div className="flex w-full items-center gap-4">
          <div className="relative">
            <Image
              src={user.avatar}
              alt={user.name}
              width={48}
              height={48}
              className="rounded-full"
            />
            <div
              className={`absolute -right-1 -bottom-1 h-3 w-3 rounded-full border-2 border-gray-800 ${
                user.status === "active" ? "bg-green-500" : "bg-red-500"
              }`}
            />
          </div>

          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <h4 className="truncate text-sm font-medium text-white">
                {user.name}
              </h4>
              <span
                className={`rounded-full px-2 py-1 text-xs font-medium ${
                  user.role === "Admin"
                    ? "bg-purple-500/10 text-purple-500"
                    : user.role === "Moderator"
                      ? "bg-blue-500/10 text-blue-500"
                      : "bg-gray-500/10 text-gray-500"
                }`}
              >
                {user.role}
              </span>
            </div>
            <div className="mt-1 flex flex-col gap-2 text-xs text-gray-400">
              <div className="flex items-center gap-1">
                <Mail className="h-3 w-3" />
                <span className="truncate">{user.email}</span>
              </div>
              <div className="flex items-center gap-1">
                <Calendar className="h-3 w-3" />
                <span>
                  Joined {new Date(user.joinDate).toLocaleDateString()}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Stats and Subscription */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:gap-6">
          {/* Analytics Stats */}
          <div className="flex flex-wrap gap-4 sm:gap-6">
            <div className="flex items-center gap-2 text-sm">
              <Activity className="h-4 w-4 text-purple-500" />
              <div className="text-right">
                <div className="font-medium text-white">
                  {userAnalytics
                    ? formatNumber(userAnalytics.total_requests)
                    : "0"}
                </div>
                <div className="text-xs text-gray-400">Generations</div>
              </div>
            </div>

            <div className="flex items-center gap-2 text-sm">
              <Zap className="h-4 w-4 text-orange-500" />
              <div className="text-right">
                <div className="font-medium text-white">
                  {userAnalytics
                    ? formatNumber(userAnalytics.total_credits_used)
                    : "0"}
                </div>
                <div className="text-xs text-gray-400">Credits</div>
              </div>
            </div>

            <div className="flex items-center gap-2 text-sm">
              <div className="h-2 w-2 rounded-full bg-green-500"></div>
              <div className="text-right">
                <div className="font-medium text-white">
                  {userAnalytics && userAnalytics.total_requests > 0
                    ? `${Math.round((userAnalytics.completed_requests / userAnalytics.total_requests) * 100)}%`
                    : "0%"}
                </div>
                <div className="text-xs text-gray-400">Success</div>
              </div>
            </div>
          </div>

          {/* Subscription Info */}
          <div className="flex flex-col gap-2 border-t border-gray-700/50 pt-4 sm:border-t-0 sm:border-l sm:pl-6 sm:pt-0">
            <div className="flex items-center gap-2 text-sm">
              <CreditCard className="h-4 w-4 text-blue-500" />
              <div className="flex-1">
                {subscription ? (
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-white">
                        {getPlanName(subscription.plan_id)}
                      </span>
                      <span
                        className={`rounded-full px-2 py-0.5 text-xs font-medium ${getStatusBadge(
                          subscription.status,
                        )}`}
                      >
                        {subscription.status}
                      </span>
                    </div>
                    <div className="text-xs text-gray-400">
                      {formatAmount(subscription.amount, subscription.currency)}
                      /month
                    </div>
                    {subscription.status === "active" && (
                      <div className="text-xs text-gray-400">
                        Next billing:{" "}
                        {new Date(
                          subscription.next_billing_date,
                        ).toLocaleDateString()}
                      </div>
                    )}
                    {subscription.cancelled_at && (
                      <div className="text-xs text-gray-400">
                        Cancelled:{" "}
                        {new Date(subscription.cancelled_at).toLocaleDateString()}
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="text-xs text-gray-500">No subscription</div>
                )}
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    );
  },
);

UserRowWithStats.displayName = "UserRowWithStats";
