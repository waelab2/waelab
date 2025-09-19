"use client";

import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import {
  Calendar,
  Mail,
  MapPin,
  MoreHorizontal,
  Plus,
  TrendingUp,
} from "lucide-react";
import { memo } from "react";

const users = [
  {
    id: 1,
    name: "Alex Johnson",
    email: "alex@example.com",
    avatar: "https://i.pravatar.cc",
    role: "Admin",
    status: "active",
    joinDate: "2024-01-15",
    location: "New York, US",
  },
  {
    id: 2,
    name: "Sarah Chen",
    email: "sarah@example.com",
    avatar: "https://i.pravatar.cc",
    role: "User",
    status: "active",
    joinDate: "2024-02-20",
    location: "San Francisco, US",
  },
  {
    id: 3,
    name: "Michael Brown",
    email: "michael@example.com",
    avatar: "https://i.pravatar.cc",
    role: "Moderator",
    status: "inactive",
    joinDate: "2024-01-08",
    location: "London, UK",
  },
];

interface UsersTableProps {
  onAddUser: () => void;
}

export const UsersTable = memo(({ onAddUser }: UsersTableProps) => {
  return (
    <div className="rounded-xl border border-gray-700 bg-gray-800/40 p-3 sm:p-6">
      <div className="mb-6 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h3 className="text-lg font-semibold text-white sm:text-xl">
            Recent Users
          </h3>
          <p className="text-sm text-gray-400">
            Latest user registrations and activity
          </p>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1 text-sm text-green-500">
            <TrendingUp className="h-4 w-4" />
            <span>+12%</span>
          </div>
          <Button variant="outline" size="sm" onClick={onAddUser}>
            <Plus className="mr-2 h-4 w-4" />
            <span className="hidden sm:inline">Add User</span>
            <span className="sm:hidden">Add</span>
          </Button>
        </div>
      </div>

      <div className="space-y-2">
        {users.map((user, index) => (
          <motion.div
            key={user.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
            className="group flex flex-col items-start gap-4 rounded-lg p-4 transition-colors hover:bg-gray-700/50 sm:flex-row sm:items-center"
          >
            <div className="flex w-full items-center gap-4 sm:w-auto">
              <div className="relative">
                <img
                  src={user.avatar}
                  alt={user.name}
                  width={40}
                  height={40}
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
                <div className="mt-1 flex flex-col gap-2 text-xs text-gray-400 sm:flex-row sm:items-center sm:gap-4">
                  <div className="flex items-center gap-1">
                    <Mail className="h-3 w-3" />
                    <span className="truncate">{user.email}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <MapPin className="h-3 w-3" />
                    <span>{user.location}</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="ml-auto flex items-center gap-3">
              <div className="flex items-center gap-1 text-xs text-gray-400">
                <Calendar className="h-3 w-3" />
                <span>{new Date(user.joinDate).toLocaleDateString()}</span>
              </div>

              <Button variant="ghost" size="sm" className="ml-auto">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
});

UsersTable.displayName = "UsersTable";
