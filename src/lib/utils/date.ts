/**
 * Utility functions for date calculations and formatting
 */

/**
 * Calculate the start and end timestamps for the current month
 * @returns Object with start and end timestamps for current month
 */
export const getCurrentMonthRange = () => {
  const now = new Date();
  const start = new Date(now.getFullYear(), now.getMonth(), 1).getTime();
  const end = new Date(
    now.getFullYear(),
    now.getMonth() + 1,
    0,
    23,
    59,
    59,
    999,
  ).getTime();

  return { start, end };
};

/**
 * Calculate the start and end timestamps for the previous month
 * @returns Object with start and end timestamps for last month
 */
export const getLastMonthRange = () => {
  const now = new Date();
  const start = new Date(now.getFullYear(), now.getMonth() - 1, 1).getTime();
  const end = new Date(
    now.getFullYear(),
    now.getMonth(),
    0,
    23,
    59,
    59,
    999,
  ).getTime();

  return { start, end };
};

/**
 * Calculate percentage change between two values
 * @param current - Current value
 * @param previous - Previous value
 * @returns Object with change percentage and type (positive/negative)
 */
export const calculatePercentageChange = (
  current: number,
  previous: number,
): { change: string; changeType: "positive" | "negative" } => {
  if (previous === 0) {
    return current > 0
      ? { change: "+100%", changeType: "positive" as const }
      : { change: "0%", changeType: "positive" as const };
  }
  const percentage = Math.round(((current - previous) / previous) * 100);
  return {
    change: `${percentage >= 0 ? "+" : ""}${percentage}%`,
    changeType: percentage >= 0 ? ("positive" as const) : ("negative" as const),
  };
};
