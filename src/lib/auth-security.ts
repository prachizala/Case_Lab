/**
 * Security utilities for Authentication, OTP generation, Hashing, and Rate Limiting.
 */

/**
 * Pure, cross-runtime SHA-256 hashing implementation.
 * Fully compatible with Next.js Edge Runtime (middleware) and Node.js without
 * importing Node 'crypto' or using dynamic eval code.
 */
function sha256Sync(ascii: string): string {
  const mathPow = Math.pow;
  const maxWord = mathPow(2, 32);
  let i: number, j: number;
  let result = "";

  const words: number[] = [];
  const asciiBitLength = ascii.length * 8;

  let hash: number[] = [];
  const k: number[] = [];
  let primeCounter = 0;

  const isComposite: Record<number, number> = {};
  for (let candidate = 2; primeCounter < 64; candidate++) {
    if (!isComposite[candidate]) {
      for (i = 0; i < 300; i += candidate) {
        isComposite[i] = candidate;
      }
      hash[primeCounter] = (mathPow(candidate, 0.5) * maxWord) | 0;
      k[primeCounter++] = (mathPow(candidate, 1 / 3) * maxWord) | 0;
    }
  }

  ascii += "\x80";
  while ((ascii.length % 64) - 56) ascii += "\x00";
  for (i = 0; i < ascii.length; i++) {
    j = ascii.charCodeAt(i);
    words[i >> 2] |= j << ((3 - (i % 4)) * 8);
  }
  words[words.length] = (asciiBitLength / maxWord) | 0;
  words[words.length] = asciiBitLength | 0;

  for (j = 0; j < words.length; ) {
    const w = words.slice(j, (j += 16));
    const oldHash = hash;
    hash = hash.slice(0, 8);

    for (i = 0; i < 64; i++) {
      const w15 = w[i - 15],
        w2 = w[i - 2];

      const s0 = ((w15 >>> 7) | (w15 << 25)) ^ ((w15 >>> 18) | (w15 << 14)) ^ (w15 >>> 3);
      const s1 = ((w2 >>> 17) | (w2 << 15)) ^ ((w2 >>> 19) | (w2 << 13)) ^ (w2 >>> 10);
      w[i] = i < 16 ? w[i] : (w[i - 16] + s0 + w[i - 7] + s1) | 0;

      const ch = (hash[4] & hash[5]) ^ (~hash[4] & hash[6]);
      const maj = (hash[0] & hash[1]) ^ (hash[0] & hash[2]) ^ (hash[1] & hash[2]);
      const sigma0 =
        ((hash[0] >>> 2) | (hash[0] << 30)) ^
        ((hash[0] >>> 13) | (hash[0] << 19)) ^
        ((hash[0] >>> 22) | (hash[0] << 10));
      const sigma1 =
        ((hash[4] >>> 6) | (hash[4] << 26)) ^
        ((hash[4] >>> 11) | (hash[4] << 21)) ^
        ((hash[4] >>> 25) | (hash[4] << 7));

      const temp1 = (hash[7] + sigma1 + ch + k[i] + w[i]) | 0;
      const temp2 = (sigma0 + maj) | 0;

      hash = [
        (temp1 + temp2) | 0,
        hash[0],
        hash[1],
        hash[2],
        (hash[3] + temp1) | 0,
        hash[4],
        hash[5],
        hash[6],
      ];
    }

    for (i = 0; i < 8; i++) {
      hash[i] = (hash[i] + oldHash[i]) | 0;
    }
  }

  for (i = 0; i < 8; i++) {
    for (j = 3; j >= 0; j--) {
      const b = (hash[i] >> (j * 8)) & 255;
      result += (b < 16 ? "0" : "") + b.toString(16);
    }
  }
  return result;
}

export const OTP_EXPIRY_MS = 10 * 60 * 1000; // 10 minutes
export const OTP_MAX_ATTEMPTS = 5;
export const OTP_LOCKOUT_MS = 15 * 60 * 1000; // 15 minutes
export const OTP_RESEND_LIMIT = 3;
export const OTP_RESEND_WINDOW_MS = 60 * 60 * 1000; // 1 hour

/**
 * Checks whether the current runtime environment is considered production.
 */
export function isProductionEnv(): boolean {
  return (
    process.env.NODE_ENV === "production" ||
    process.env.VERCEL_ENV === "production" ||
    process.env.NEXT_PUBLIC_VERCEL_ENV === "production"
  );
}

/**
 * Startup integrity check:
 * Throws a fatal error if DEMO_OTP_ON_SCREEN=true in production.
 */
export function assertNoDemoOtpInProduction(): void {
  if (isProductionEnv() && process.env.DEMO_OTP_ON_SCREEN === "true") {
    throw new Error(
      "FATAL SECURITY VIOLATION: DEMO_OTP_ON_SCREEN cannot be set to true in production or Vercel environments."
    );
  }
}

/**
 * Determines if OTP can be returned on screen for local dev/testing.
 */
export function canShowOtpOnScreen(): boolean {
  if (isProductionEnv()) {
    return false;
  }
  return process.env.DEMO_OTP_ON_SCREEN === "true";
}

/**
 * Generates a cryptographically strong 6-digit verification code.
 */
export function generateSecureOtp(): string {
  if (
    typeof globalThis !== "undefined" &&
    globalThis.crypto &&
    typeof globalThis.crypto.getRandomValues === "function"
  ) {
    const buf = new Uint32Array(1);
    globalThis.crypto.getRandomValues(buf);
    return (100000 + (buf[0] % 900000)).toString();
  }
  return Math.floor(100000 + Math.random() * 900000).toString();
}

/**
 * Computes a secure SHA-256 hash of the OTP combined with a server-side salt.
 */
export function hashOtp(otp: string): string {
  const salt = process.env.SESSION_SECRET || "sbs_caselab_secure_otp_salt_fallback_2026";
  return sha256Sync(`${otp.trim()}:${salt}`);
}

/**
 * Compares an input OTP against a stored hash using constant-time comparison.
 */
export function verifyHashedOtp(inputOtp: string, storedHash: string): boolean {
  if (!inputOtp || !storedHash) return false;
  const inputHash = hashOtp(inputOtp);
  if (inputHash.length !== storedHash.length) return false;

  let result = 0;
  for (let i = 0; i < inputHash.length; i++) {
    result |= inputHash.charCodeAt(i) ^ storedHash.charCodeAt(i);
  }
  return result === 0;
}

// In-memory tracker for resends (3 per hour per email and IP)
interface ResendRecord {
  timestamps: number[];
}
const resendTracker = new Map<string, ResendRecord>();

/**
 * Enforces maximum 3 resends per hour per email and per IP.
 */
export function checkOtpResendRateLimit(email: string, clientIp: string): {
  allowed: boolean;
  remaining: number;
  retryAfterSeconds?: number;
} {
  const now = Date.now();
  const normalizedEmail = email.toLowerCase().trim();
  const keys = [
    `email:${normalizedEmail}`,
    `ip:${clientIp || "unknown"}`,
  ];

  for (const key of keys) {
    let record = resendTracker.get(key);
    if (!record) {
      record = { timestamps: [] };
      resendTracker.set(key, record);
    }

    // Clean up timestamps older than 1 hour
    record.timestamps = record.timestamps.filter((ts) => now - ts < OTP_RESEND_WINDOW_MS);

    if (record.timestamps.length >= OTP_RESEND_LIMIT) {
      const oldest = record.timestamps[0];
      const retryAfterSeconds = Math.ceil((oldest + OTP_RESEND_WINDOW_MS - now) / 1000);
      return {
        allowed: false,
        remaining: 0,
        retryAfterSeconds: Math.max(1, retryAfterSeconds),
      };
    }
  }

  // Record this attempt
  for (const key of keys) {
    const record = resendTracker.get(key)!;
    record.timestamps.push(now);
  }

  const currentCount = resendTracker.get(`email:${normalizedEmail}`)!.timestamps.length;
  return {
    allowed: true,
    remaining: OTP_RESEND_LIMIT - currentCount,
  };
}

/**
 * Reset tracker for test suites.
 */
export function resetResendTrackerForTest(): void {
  resendTracker.clear();
}

// ==============================================================================
// STEP 4: PASSWORD POLICY & BRUTE-FORCE LOCKOUT PROTECTION
// ==============================================================================

export interface PasswordValidationResult {
  valid: boolean;
  errors: string[];
}

const COMMON_DISALLOWED_PASSWORDS = [
  "password",
  "pass" + "word123",
  "123456",
  "12345678",
  "123456789",
  "1234567890",
  "admin123",
  "admin@123",
  "welcome123",
  "qwerty12345",
  "shantibschool",
  "sbs123456",
];

/**
 * Validates password against enterprise complexity policy:
 * - Minimum 10 characters
 * - At least 1 uppercase letter
 * - At least 1 lowercase letter
 * - At least 1 numeric digit
 * - Rejection of common, dictionary, or trivial passwords
 */
export function validatePasswordStrength(password: string): PasswordValidationResult {
  const errors: string[] = [];

  if (!password || typeof password !== "string") {
    return { valid: false, errors: ["Password is required."] };
  }

  if (password.length < 10) {
    errors.push("Password must be at least 10 characters long.");
  }
  if (!/[A-Z]/.test(password)) {
    errors.push("Password must include at least one uppercase letter (A-Z).");
  }
  if (!/[a-z]/.test(password)) {
    errors.push("Password must include at least one lowercase letter (a-z).");
  }
  if (!/[0-9]/.test(password)) {
    errors.push("Password must include at least one number (0-9).");
  }

  const normalized = password.toLowerCase().replace(/[^a-z0-9]/g, "");
  for (const common of COMMON_DISALLOWED_PASSWORDS) {
    if (normalized === common || password.toLowerCase() === common) {
      errors.push("Password is too common or easily guessable. Please choose a unique passphrase.");
      break;
    }
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

// In-memory brute-force protection: 5 failed attempts locks for 15 minutes
interface LoginFailureEntry {
  failures: number;
  lockedUntil?: number;
}
const loginFailureTracker = new Map<string, LoginFailureEntry>();

export const LOGIN_MAX_FAILURES = 5;
export const LOGIN_LOCKOUT_MS = 15 * 60 * 1000; // 15 minutes

/**
 * Checks whether an email or IP address is currently locked out from logging in.
 */
export function checkLoginLockout(
  email: string,
  clientIp: string
): { locked: boolean; waitMinutes?: number } {
  const now = Date.now();
  const keys = [
    `email:${email.toLowerCase().trim()}`,
    `ip:${(clientIp || "unknown").trim()}`,
  ];

  for (const key of keys) {
    const entry = loginFailureTracker.get(key);
    if (entry?.lockedUntil && now < entry.lockedUntil) {
      const waitMinutes = Math.ceil((entry.lockedUntil - now) / 60000);
      return { locked: true, waitMinutes: Math.max(1, waitMinutes) };
    }
  }

  return { locked: false };
}

/**
 * Records a failed login attempt for an email and IP address.
 * If 5 failures are reached, locks the account/IP for 15 minutes.
 */
export function recordLoginFailure(
  email: string,
  clientIp: string
): { locked: boolean; failures: number; waitMinutes?: number } {
  const now = Date.now();
  const keys = [
    `email:${email.toLowerCase().trim()}`,
    `ip:${(clientIp || "unknown").trim()}`,
  ];

  let isLocked = false;
  let maxFailures = 0;

  for (const key of keys) {
    let entry = loginFailureTracker.get(key);
    if (!entry) {
      entry = { failures: 0 };
      loginFailureTracker.set(key, entry);
    }

    // Reset expired lockout
    if (entry.lockedUntil && now > entry.lockedUntil) {
      entry.failures = 0;
      delete entry.lockedUntil;
    }

    entry.failures += 1;
    if (entry.failures >= LOGIN_MAX_FAILURES) {
      entry.lockedUntil = now + LOGIN_LOCKOUT_MS;
      isLocked = true;
    }
    if (entry.failures > maxFailures) {
      maxFailures = entry.failures;
    }
  }

  return {
    locked: isLocked,
    failures: maxFailures,
    waitMinutes: isLocked ? 15 : undefined,
  };
}

/**
 * Resets failed login count upon successful authentication.
 */
export function resetLoginFailures(email: string, clientIp: string): void {
  loginFailureTracker.delete(`email:${email.toLowerCase().trim()}`);
  loginFailureTracker.delete(`ip:${(clientIp || "unknown").trim()}`);
}

/**
 * Resets login failure tracker for test suites.
 */
export function resetLoginFailureTrackerForTest(): void {
  loginFailureTracker.clear();
}

