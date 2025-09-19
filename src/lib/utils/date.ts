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
 * Calculate the start and end timestamps for today
 * @returns Object with start and end timestamps for today
 */
export const getTodayRange = () => {
  const now = new Date();
  const start = new Date(
    now.getFullYear(),
    now.getMonth(),
    now.getDate(),
  ).getTime();
  const end = new Date(
    now.getFullYear(),
    now.getMonth(),
    now.getDate(),
    23,
    59,
    59,
    999,
  ).getTime();

  return { start, end };
};

/**
 * Calculate the start and end timestamps for this week (Monday to Sunday)
 * @returns Object with start and end timestamps for this week
 */
export const getThisWeekRange = () => {
  const now = new Date();
  const dayOfWeek = now.getDay();
  const daysToMonday = dayOfWeek === 0 ? 6 : dayOfWeek - 1; // Sunday is 0, so 6 days to Monday

  const startOfWeek = new Date(now);
  startOfWeek.setDate(now.getDate() - daysToMonday);
  startOfWeek.setHours(0, 0, 0, 0);

  const endOfWeek = new Date(startOfWeek);
  endOfWeek.setDate(startOfWeek.getDate() + 6);
  endOfWeek.setHours(23, 59, 59, 999);

  return { start: startOfWeek.getTime(), end: endOfWeek.getTime() };
};

/**
 * Calculate the start and end timestamps for this year
 * @returns Object with start and end timestamps for this year
 */
export const getThisYearRange = () => {
  const now = new Date();
  const start = new Date(now.getFullYear(), 0, 1).getTime();
  const end = new Date(now.getFullYear(), 11, 31, 23, 59, 59, 999).getTime();

  return { start, end };
};

/**
 * Get date range for a specific time period
 * @param period - The time period to get range for
 * @returns Object with start and end timestamps
 */
export const getDateRange = (period: "today" | "week" | "month" | "year") => {
  switch (period) {
    case "today":
      return getTodayRange();
    case "week":
      return getThisWeekRange();
    case "month":
      return getCurrentMonthRange();
    case "year":
      return getThisYearRange();
    default:
      return getCurrentMonthRange();
  }
};

/**
 * Get the previous equivalent date range for comparison
 * @param period - The time period to get previous range for
 * @returns Object with start and end timestamps for previous period
 */
export const getPreviousDateRange = (
  period: "today" | "week" | "month" | "year",
) => {
  const now = new Date();
  switch (period) {
    case "today": {
      const yesterday = new Date(now);
      yesterday.setDate(now.getDate() - 1);
      const start = new Date(
        yesterday.getFullYear(),
        yesterday.getMonth(),
        yesterday.getDate(),
      ).getTime();
      const end = new Date(
        yesterday.getFullYear(),
        yesterday.getMonth(),
        yesterday.getDate(),
        23,
        59,
        59,
        999,
      ).getTime();
      return { start, end };
    }
    case "week": {
      const lastWeek = new Date(now);
      lastWeek.setDate(now.getDate() - 7);
      const dayOfWeek = lastWeek.getDay();
      const daysToMonday = dayOfWeek === 0 ? 6 : dayOfWeek - 1;

      const startOfWeek = new Date(lastWeek);
      startOfWeek.setDate(lastWeek.getDate() - daysToMonday);
      startOfWeek.setHours(0, 0, 0, 0);

      const endOfWeek = new Date(startOfWeek);
      endOfWeek.setDate(startOfWeek.getDate() + 6);
      endOfWeek.setHours(23, 59, 59, 999);

      return { start: startOfWeek.getTime(), end: endOfWeek.getTime() };
    }
    case "month":
      return getLastMonthRange();
    case "year": {
      const lastYear = now.getFullYear() - 1;
      const start = new Date(lastYear, 0, 1).getTime();
      const end = new Date(lastYear, 11, 31, 23, 59, 59, 999).getTime();
      return { start, end };
    }
    default:
      return getLastMonthRange();
  }
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
