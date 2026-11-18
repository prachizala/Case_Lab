/**
 * Groq Token Usage Storage, Atomic Aggregation & Budget Configuration
 */

import { mockStore } from "@/lib/mock-db";
import {
  TokenUsageRecord,
  TokenBudgetSummary,
  TokenBudgetBreakdown,
  BudgetStatus,
} from "./types";

// Configuration defaults with environment overrides
export function getBudgetConfig() {
  const budgetLimit = parseInt(process.env.TOKEN_BUDGET || "500000", 10);
  const warnThreshold = parseInt(process.env.WARN_AT || "80", 10);
  const criticalThreshold = parseInt(process.env.CRITICAL_AT || "95", 10);

  return {
    limit: isNaN(budgetLimit) || budgetLimit <= 0 ? 500000 : budgetLimit,
    warn: isNaN(warnThreshold) ? 80 : warnThreshold,
    critical: isNaN(criticalThreshold) ? 95 : criticalThreshold,
  };
}

export function getCurrentPeriodString(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  return `${year}-${month}`;
}

// In-memory token records for current runtime session (mirrors mockStore usage_logs)
class TokenUsageTracker {
  private records: TokenUsageRecord[] = [];

  constructor() {
    this.seedFromMockStore();
  }

  private seedFromMockStore() {
    // Seed records matching 420,000 used / 500,000 tokens (84% warning state)
    this.records = [
      {
        id: "usage-groq-seed-1",
        created_at: new Date(Date.now() - 86400000 * 3).toISOString(),
        user_id: "usr-faculty-1",
        user_email: "faculty@shantibschool.edu.in",
        feature: "case_generation",
        model: "llama-3.3-70b-versatile",
        prompt_tokens: 180000,
        completion_tokens: 65000,
        total_tokens: 245000,
      },
      {
        id: "usage-groq-seed-2",
        created_at: new Date(Date.now() - 86400000 * 1).toISOString(),
        user_id: "usr-faculty-1",
        user_email: "faculty@shantibschool.edu.in",
        feature: "casepack_generation",
        model: "llama-3.3-70b-versatile",
        prompt_tokens: 120000,
        completion_tokens: 55000,
        total_tokens: 175000,
      },
    ];
  }

  public recordUsage(item: Omit<TokenUsageRecord, "id" | "created_at">): TokenUsageRecord {
    const record: TokenUsageRecord = {
      id: `tok-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      created_at: new Date().toISOString(),
      ...item,
    };
    this.records.unshift(record);

    // Also mirror into mockStore to maintain legacy audit telemetry
    mockStore.logUsage(
      item.user_id || "anonymous",
      item.total_tokens,
      item.model
    );

    return record;
  }

  public getRecords(period?: string): TokenUsageRecord[] {
    const targetPeriod = period || getCurrentPeriodString();
    return this.records.filter((r) => r.created_at.startsWith(targetPeriod));
  }

  public getSummary(period?: string): TokenBudgetSummary {
    const targetPeriod = period || getCurrentPeriodString();
    const records = this.getRecords(targetPeriod);
    const { limit, warn, critical } = getBudgetConfig();

    const used = records.reduce((acc, curr) => acc + (curr.total_tokens || 0), 0);
    const remaining = Math.max(0, limit - used);
    const percent = Math.round((used / limit) * 100);

    let status: BudgetStatus = "normal";
    if (percent >= 100) {
      status = "exhausted";
    } else if (percent >= critical) {
      status = "critical";
    } else if (percent >= warn) {
      status = "warning";
    }

    return {
      used,
      limit,
      remaining,
      percent,
      status,
      period: targetPeriod,
      warn_threshold: warn,
      critical_threshold: critical,
      is_blocked: percent >= 100,
    };
  }

  public getBreakdown(period?: string, includeUser = false): TokenBudgetBreakdown {
    const targetPeriod = period || getCurrentPeriodString();
    const records = this.getRecords(targetPeriod);
    const totalUsed = records.reduce((acc, curr) => acc + curr.total_tokens, 0);

    // Group by model
    const modelMap = new Map<string, number>();
    for (const r of records) {
      modelMap.set(r.model, (modelMap.get(r.model) || 0) + r.total_tokens);
    }
    const by_model = Array.from(modelMap.entries()).map(([model, tokens]) => ({
      model,
      tokens,
      percentage: totalUsed > 0 ? Math.round((tokens / totalUsed) * 100) : 0,
    }));

    // Group by feature
    const featureMap = new Map<string, number>();
    for (const r of records) {
      featureMap.set(r.feature, (featureMap.get(r.feature) || 0) + r.total_tokens);
    }
    const by_feature = Array.from(featureMap.entries()).map(([feature, tokens]) => ({
      feature,
      tokens,
      percentage: totalUsed > 0 ? Math.round((tokens / totalUsed) * 100) : 0,
    }));

    // Group by user (if admin authorized)
    let by_user: TokenBudgetBreakdown["by_user"] = undefined;
    if (includeUser) {
      const userMap = new Map<string, { email: string; tokens: number }>();
      for (const r of records) {
        const uid = r.user_id || "anonymous";
        const email = r.user_email || "Anonymous / System";
        const current = userMap.get(uid) || { email, tokens: 0 };
        current.tokens += r.total_tokens;
        userMap.set(uid, current);
      }
      by_user = Array.from(userMap.entries()).map(([userId, data]) => ({
        user_id: userId,
        user_email: data.email,
        tokens: data.tokens,
        percentage: totalUsed > 0 ? Math.round((data.tokens / totalUsed) * 100) : 0,
      }));
    }

    return {
      period: targetPeriod,
      total_used: totalUsed,
      by_model,
      by_feature,
      by_user,
    };
  }

  // Testing helper to reset or set specific token usage levels
  public reset() {
    this.records = [];
  }

  public __setSimulatedUsage(tokens: number) {
    if (tokens === 0) {
      this.records = [];
      return;
    }
    this.records = [
      {
        id: "usage-simulated",
        created_at: new Date().toISOString(),
        user_id: "usr-simulated",
        user_email: "test@shantibschool.edu.in",
        feature: "simulation",
        model: "llama-3.3-70b-versatile",
        prompt_tokens: Math.round(tokens * 0.7),
        completion_tokens: Math.round(tokens * 0.3),
        total_tokens: tokens,
      },
    ];
  }
}

export const tokenUsageTracker = new TokenUsageTracker();

export function recordTokenUsage(params: {
  userId?: string | null;
  userEmail?: string;
  feature: string;
  model: string;
  promptTokens: number;
  completionTokens: number;
  totalTokens: number;
}) {
  return tokenUsageTracker.recordUsage({
    user_id: params.userId || null,
    user_email: params.userEmail,
    feature: params.feature,
    model: params.model,
    prompt_tokens: params.promptTokens,
    completion_tokens: params.completionTokens,
    total_tokens: params.totalTokens,
  });
}

export function getTokenBudgetSummary(period?: string): TokenBudgetSummary {
  return tokenUsageTracker.getSummary(period);
}

export function getTokenBudgetBreakdown(includeUser = false, period?: string): TokenBudgetBreakdown {
  return tokenUsageTracker.getBreakdown(period, includeUser);
}

export function resetTokenUsageForTest() {
  tokenUsageTracker.__setSimulatedUsage(0);
}

export function seedTokenUsageForTest(tokens: number) {
  tokenUsageTracker.__setSimulatedUsage(tokens);
}
