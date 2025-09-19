/**
 * Utility functions index
 * Re-exports all utility functions for easier importing
 */

export * from "./date";
export * from "./format";

import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
