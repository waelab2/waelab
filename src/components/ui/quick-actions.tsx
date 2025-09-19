"use client";

import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { BarChart3, Download, Settings, Users } from "lucide-react";
import { memo } from "react";

interface QuickActionsProps {
  onAddUser: () => void;
  onExport: () => void;
}

const actions = [
  {
    icon: Users,
    label: "Add New User",
    color: "blue",
    shortcut: "Ctrl+N",
    action: "addUser",
  },
  {
    icon: BarChart3,
    label: "View Analytics",
    color: "green",
    shortcut: "Ctrl+A",
    action: "analytics",
  },
  {
    icon: Download,
    label: "Export Data",
    color: "purple",
    shortcut: "Ctrl+E",
    action: "export",
  },
  {
    icon: Settings,
    label: "System Settings",
    color: "orange",
    shortcut: "Ctrl+S",
    action: "settings",
  },
];

export const QuickActions = memo(
  ({ onAddUser, onExport }: QuickActionsProps) => {
    const handleAction = (action: string) => {
      switch (action) {
        case "addUser":
          onAddUser();
          break;
        case "analytics":
          console.log("Viewing analytics...");
          break;
        case "export":
          onExport();
          break;
        case "settings":
          console.log("Opening settings...");
          break;
      }
    };

    return (
      <div className="rounded-xl border border-gray-700 bg-gray-800/40 p-6">
        <h3 className="mb-4 text-xl font-semibold text-white">Quick Actions</h3>
        <div className="space-y-3">
          {actions.map((action) => {
            const Icon = action.icon;
            return (
              <motion.div
                key={action.label}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <Button
                  variant="outline"
                  className={`h-12 w-full justify-start hover:bg-${action.color}-500/10 hover:border-${action.color}-500/50 transition-all duration-200`}
                  onClick={() => handleAction(action.action)}
                >
                  <Icon className={`mr-3 h-5 w-5 text-${action.color}-500`} />
                  <span className="font-medium">{action.label}</span>
                  <div className="ml-auto text-xs text-gray-400">
                    {action.shortcut}
                  </div>
                </Button>
              </motion.div>
            );
          })}
        </div>
      </div>
    );
  },
);

QuickActions.displayName = "QuickActions";
