"use client";

import { motion } from "framer-motion";
import { Calendar, Mail } from "lucide-react";
import Image from "next/image";
import { memo } from "react";

export interface User {
  id: string;
  name: string;
  email: string;
  avatar: string;
  role: string;
  status: "active" | "inactive";
  joinDate: string;
}

interface UsersTableProps {
  users?: User[];
  isLoading?: boolean;
}

export const UsersTable = memo(
  ({ users = [], isLoading = false }: UsersTableProps) => {
    if (isLoading) {
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
          </div>
          <div className="space-y-3">
            {Array.from({ length: 3 }).map((_, index) => (
              <div key={index} className="animate-pulse">
                <div className="flex items-center gap-3 rounded-lg bg-gray-700/30 p-3">
                  <div className="h-10 w-10 rounded-full bg-gray-600"></div>
                  <div className="flex-1 space-y-2">
                    <div className="h-4 w-32 rounded bg-gray-600"></div>
                    <div className="h-3 w-48 rounded bg-gray-600"></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      );
    }

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
        </div>

        <div className="space-y-2">
          {users.length === 0 ? (
            <div className="py-8 text-center">
              <p className="text-gray-400">No users found</p>
            </div>
          ) : (
            users.map((user, index) => (
              <motion.div
                key={user.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className="group flex flex-col items-start gap-4 rounded-lg p-4 transition-colors hover:bg-gray-700/50 sm:flex-row sm:items-center"
              >
                <div className="flex w-full items-center gap-4">
                  <div className="relative">
                    <Image
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
              </motion.div>
            ))
          )}
        </div>
      </div>
    );
  },
);

UsersTable.displayName = "UsersTable";
