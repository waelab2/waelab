"use client";

import { useAuth } from "@clerk/nextjs";
import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";

export function useCreditBalance() {
  const { userId } = useAuth();

  return useQuery(
    api.credits.getMyCreditBalance,
    userId ? { userId } : "skip",
  );
}

