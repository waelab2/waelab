import { cronJobs } from "convex/server";
import { internal } from "./_generated/api";
import type { FunctionReference } from "convex/server";

const crons = cronJobs();

// Run recurring billing daily at 2 AM UTC
// Type assertion needed until Convex regenerates types after adding the action
const processRecurringBillingRef = (internal.subscriptionBilling as any)
  .processRecurringBilling as FunctionReference<
  "action",
  "internal",
  Record<string, never>,
  { processed: number; succeeded: number; failed: number }
>;

crons.cron(
  "process-recurring-billing",
  "0 2 * * *", // Daily at 2 AM UTC
  processRecurringBillingRef,
  {},
);

export default crons;
