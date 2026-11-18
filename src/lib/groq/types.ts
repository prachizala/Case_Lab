/**
 * Groq Institutional Token Budget & Usage Types
 */

import { z } from "zod";

export interface TokenUsageRecord {
  id: string;
  created_at: string;
  user_id: string | null;
  user_email?: string | null;
  feature: string; // e.g. "case_generation", "flash_case", "grading"
  model: string;   // e.g. "llama-3.3-70b-versatile"
  prompt_tokens: number;
  completion_tokens: number;
  total_tokens: number;
}

export type BudgetStatus = "normal" | "warning" | "critical" | "exhausted";

export interface TokenBudgetSummary {
  used: number;
  limit: number;
  remaining: number;
  percent: number;
  status: BudgetStatus;
  period: string; // "YYYY-MM"
  warn_threshold: number;
  critical_threshold: number;
  is_blocked: boolean;
}

export interface ModelBreakdownItem {
  model: string;
  tokens: number;
  percentage: number;
}

export interface FeatureBreakdownItem {
  feature: string;
  tokens: number;
  percentage: number;
}

export interface UserBreakdownItem {
  user_id: string;
  user_email: string;
  tokens: number;
  percentage: number;
}

export interface TokenBudgetBreakdown {
  period: string;
  total_used: number;
  by_model: ModelBreakdownItem[];
  by_feature: FeatureBreakdownItem[];
  by_user?: UserBreakdownItem[];
}

export const TokenBudgetSummarySchema = z.object({
  used: z.number().int().nonnegative(),
  limit: z.number().int().positive(),
  remaining: z.number().int().nonnegative(),
  percent: z.number().min(0),
  status: z.enum(["normal", "warning", "critical", "exhausted"]),
  period: z.string(),
  warn_threshold: z.number(),
  critical_threshold: z.number(),
  is_blocked: z.boolean(),
});
