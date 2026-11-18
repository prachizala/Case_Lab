/**
 * Budget Enforcement, Overrides, and Rate Limit Backoff Safety
 */

import { tokenUsageTracker } from "./tracking";

export class BudgetExhaustedError extends Error {
  public statusCode = 429;
  public code = "BUDGET_EXHAUSTED";
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  public details: any;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  constructor(summary: any) {
    super(
      `Institutional Groq token budget exhausted (${summary.used.toLocaleString()} / ${summary.limit.toLocaleString()} tokens used, ${summary.percent}%). AI operations are suspended until monthly reset or quota upgrade.`
    );
    this.name = "BudgetExhaustedError";
    this.details = {
      used: summary.used,
      limit: summary.limit,
      remaining: summary.remaining,
      percent: summary.percent,
      period: summary.period,
      upgrade_url: process.env.NEXT_PUBLIC_QUOTA_UPGRADE_URL || "/pricing",
    };
  }
}

/**
 * Checks current budget status. Throws BudgetExhaustedError if 100% used,
 * unless adminOverride is explicitly true.
 */
export function checkBudgetBeforeExecution(adminOverride = false): {
  allowed: boolean;
  summary: ReturnType<typeof tokenUsageTracker.getSummary>;
} {
  const summary = tokenUsageTracker.getSummary();

  if (summary.is_blocked && !adminOverride) {
    throw new BudgetExhaustedError(summary);
  }

  return {
    allowed: true,
    summary,
  };
}
