"use client";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Calendar, Clock } from "lucide-react";

export type TimePeriod = "today" | "week" | "month" | "year";

interface TimePeriodSelectorProps {
  selectedPeriod: TimePeriod;
  onPeriodChange: (period: TimePeriod) => void;
  className?: string;
}

const timePeriods: {
  value: TimePeriod;
  label: string;
  icon?: React.ComponentType<{ className?: string }>;
}[] = [
  { value: "today", label: "Today", icon: Clock },
  { value: "week", label: "This Week", icon: Calendar },
  { value: "month", label: "This Month", icon: Calendar },
  { value: "year", label: "This Year", icon: Calendar },
];

export function TimePeriodSelector({
  selectedPeriod,
  onPeriodChange,
  className,
}: TimePeriodSelectorProps) {
  return (
    <div className={cn("flex items-center gap-2", className)}>
      <div className="flex items-center gap-2 rounded-lg bg-gray-800/50 p-1">
        {timePeriods.map((period) => {
          const Icon = period.icon;
          return (
            <Button
              key={period.value}
              variant="ghost"
              size="sm"
              onClick={() => onPeriodChange(period.value)}
              className={cn(
                "h-8 px-3 text-xs font-medium transition-all duration-200",
                "hover:bg-gray-700/50 hover:text-white",
                "focus:ring-2 focus:ring-blue-500/20 focus:ring-offset-2 focus:ring-offset-gray-900",
                selectedPeriod === period.value
                  ? "bg-blue-600 text-white shadow-sm"
                  : "text-gray-400 hover:text-gray-200",
              )}
            >
              {Icon && <Icon className="mr-1.5 h-3.5 w-3.5" />}
              {period.label}
            </Button>
          );
        })}
      </div>
    </div>
  );
}
