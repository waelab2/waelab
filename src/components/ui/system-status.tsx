"use client";

import { motion } from "framer-motion";
import { Activity, Database, Shield, Zap } from "lucide-react";
import { memo } from "react";

const statusItems = [
  {
    label: "Server Status",
    status: "Online",
    color: "text-green-500",
    icon: Shield,
    percentage: 100,
  },
  {
    label: "Database",
    status: "Healthy",
    color: "text-green-500",
    icon: Database,
    percentage: 95,
  },
  {
    label: "API Response",
    status: "Fast",
    color: "text-green-500",
    icon: Zap,
    percentage: 98,
  },
  {
    label: "Storage",
    status: "85% Used",
    color: "text-yellow-500",
    icon: Activity,
    percentage: 85,
  },
];

export const SystemStatus = memo(() => {
  return (
    <div className="rounded-xl border border-gray-700 bg-gray-800/40 p-6">
      <h3 className="mb-4 text-xl font-semibold text-white">System Status</h3>
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
                <span
                  className={`text-sm font-medium ${item.color} min-w-[60px] text-right`}
                >
                  {item.status}
                </span>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
});

SystemStatus.displayName = "SystemStatus";
