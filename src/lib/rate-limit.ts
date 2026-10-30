import { mockStore } from "./mock-db";

const HOURLY_LIMIT = 10;

export interface RateLimitResult {
  allowed: boolean;
  count: number;
  remaining: number;
  limit: number;
  resetMinutes: number;
}

export async function checkRateLimit(userId: string): Promise<RateLimitResult> {
  const currentCount = mockStore.getUserHourlyUsageCount(userId);
  const remaining = Math.max(0, HOURLY_LIMIT - currentCount);
  const allowed = currentCount < HOURLY_LIMIT;

  return {
    allowed,
    count: currentCount,
    remaining,
    limit: HOURLY_LIMIT,
    resetMinutes: 60,
  };
}

export async function recordGenerationUsage(
  userId: string,
  tokens: number,
  model: string,
  caseId?: string
) {
  return mockStore.logUsage(userId, tokens, model, caseId);
}

// In-memory rate limiter for auth operations (OTP request/verification, signup, login)
interface AuthRateLimitEntry {
  attempts: number;
  resetAt: number;
}
const authAttempts = new Map<string, AuthRateLimitEntry>();

export function checkAuthRateLimit(
  key: string,
  maxAttempts = 5,
  windowMs = 15 * 60 * 1000
): { allowed: boolean; remaining: number } {
  const now = Date.now();
  const entry = authAttempts.get(key);
  if (!entry || now > entry.resetAt) {
    authAttempts.set(key, { attempts: 1, resetAt: now + windowMs });
    return { allowed: true, remaining: maxAttempts - 1 };
  }
  if (entry.attempts >= maxAttempts) {
    return { allowed: false, remaining: 0 };
  }
  entry.attempts += 1;
  return { allowed: true, remaining: maxAttempts - entry.attempts };
}
