"use client";

import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { BarChart3, Calendar } from "lucide-react";
import { memo } from "react";

const chartData = [
  { month: "Jan", value: 4000, growth: 12, color: "bg-blue-500" },
  { month: "Feb", value: 3000, growth: -8, color: "bg-red-500" },
  { month: "Mar", value: 5000, growth: 25, color: "bg-green-500" },
  { month: "Apr", value: 4500, growth: 15, color: "bg-yellow-500" },
  { month: "May", value: 6000, growth: 33, color: "bg-purple-500" },
  { month: "Jun", value: 5500, growth: 22, color: "bg-cyan-500" },
];

export const RevenueChart = memo(() => {
  return (
    <div className="rounded-xl border border-gray-700 bg-gray-800/40 p-6">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h3 className="flex items-center gap-2 text-lg font-semibold text-white">
            <BarChart3 className="h-5 w-5 text-green-500" />
            Revenue Analytics
          </h3>
          <p className="text-sm text-gray-400">Monthly revenue performance</p>
        </div>
        <Button variant="outline" size="sm">
          <Calendar className="mr-2 h-4 w-4" />
          Last 6 months
        </Button>
      </div>

      {/* Fixed Chart Area */}
      <div className="relative mb-4 h-64 rounded-lg p-4">
        <div className="flex h-full items-end justify-between gap-3">
          {chartData.map((item, index) => (
            <div
              key={item.month}
              className="group flex flex-1 flex-col items-center"
            >
              <motion.div
                initial={{ height: 0 }}
                animate={{ height: `${(item.value / 6000) * 180}px` }}
                transition={{ duration: 1, delay: index * 0.1 }}
                className={`w-full ${item.color} relative min-h-[20px] cursor-pointer rounded-t-lg transition-opacity hover:opacity-80`}
              >
                {/* Tooltip */}
                <div className="absolute -top-16 left-1/2 z-10 -translate-x-1/2 transform rounded-lg border border-gray-600 bg-gray-800 px-3 py-2 text-sm whitespace-nowrap text-white opacity-0 shadow-lg transition-opacity group-hover:opacity-100">
                  <div className="font-medium">
                    ${item.value.toLocaleString()}
                  </div>
                  <div
                    className={`text-xs ${item.growth > 0 ? "text-green-500" : "text-red-500"}`}
                  >
                    {item.growth > 0 ? "+" : ""}
                    {item.growth}%
                  </div>
                </div>
              </motion.div>
              <div className="mt-2 text-center text-xs font-medium text-gray-400">
                {item.month}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-3 gap-4 border-t border-gray-700/50 pt-4">
        <div className="text-center">
          <div className="text-2xl font-bold text-green-500">$27K</div>
          <div className="text-xs text-gray-400">Total Revenue</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-blue-500">+18%</div>
          <div className="text-xs text-gray-400">Growth Rate</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-purple-500">$4.5K</div>
          <div className="text-xs text-gray-400">Average</div>
        </div>
      </div>
    </div>
  );
});

RevenueChart.displayName = "RevenueChart";
