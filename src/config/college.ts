/**
 * Institutional Configuration for Shanti Business School (SBS)
 *
 * Centralized, single source of truth for college email domain, institutional
 * branding, and application identity across client, server, database and seed scripts.
 */

// Comma-separated list of allowed domains (e.g., "shantibschool.edu.in")
const envDomainsRaw =
  process.env.NEXT_PUBLIC_COLLEGE_EMAIL_DOMAINS ||
  process.env.NEXT_PUBLIC_COLLEGE_EMAIL_DOMAIN ||
  "shantibschool.edu.in";

export const ALLOWED_EMAIL_DOMAINS: string[] = envDomainsRaw
  .split(",")
  .map((d) => d.trim().toLowerCase())
  .filter((d) => d.length > 0);

// Default / primary domain for placeholders, email examples, and backwards compatibility
export const ALLOWED_EMAIL_DOMAIN: string =
  ALLOWED_EMAIL_DOMAINS[0] || "shantibschool.edu.in";

export const COLLEGE_NAME = "Shanti Business School";
export const COLLEGE_SHORT = "SBS";
export const COLLEGE_NAME_WITH_SHORT = "Shanti Business School (SBS)";
export const APP_NAME = "SBS CaseLab";

// Generic configurable AI Engine label (no hardcoded model names in UI)
export const AI_ENGINE_LABEL =
  process.env.NEXT_PUBLIC_AI_ENGINE_LABEL || "AI Case Engine";

// Persona / Role Switcher Demo Protection Flag
// In production, persona switching is disabled unless explicitly set in NEXT_PUBLIC_ENABLE_DEMO_MODE
export const ENABLE_DEMO_PERSONA_SWITCHER =
  process.env.NEXT_PUBLIC_ENABLE_DEMO_MODE === "true" ||
  process.env.NODE_ENV !== "production";

export const ALLOWED_EMAIL_SUFFIX = `@${ALLOWED_EMAIL_DOMAIN}`;

/**
 * Validates whether an email strictly belongs to the official college domain(s).
 * - Trims and lowercases the input.
 * - Enforces exact domain match after "@", case-insensitively.
 * - Subdomains (e.g. shantibschool.edu.in.evil.com or sub.shantibschool.edu.in) do NOT pass unless explicitly added.
 */
export function isSbsDomain(email: string, dynamicAllowedDomains?: string[]): boolean {
  if (!email || typeof email !== "string") return false;
  const normalized = email.trim().toLowerCase();
  const parts = normalized.split("@");
  if (parts.length !== 2) return false;
  const [localPart, domainPart] = parts;
  if (!localPart || !domainPart) return false;

  const domainsToCheck = dynamicAllowedDomains && dynamicAllowedDomains.length > 0
    ? dynamicAllowedDomains
    : ALLOWED_EMAIL_DOMAINS;

  return domainsToCheck.some(
    (allowed) => domainPart.toLowerCase() === allowed.toLowerCase().trim()
  );
}

// Backward-compatible alias
export const isValidCollegeEmail = isSbsDomain;

/**
 * Common disposable / temporary email domains blocked from registration
 */
export const DISPOSABLE_EMAIL_DOMAINS: string[] = [
  "mailinator.com",
  "10minutemail.com",
  "tempmail.com",
  "temp-mail.org",
  "guerrillamail.com",
  "yopmail.com",
  "trashmail.com",
  "sharklasers.com",
  "throwawaymail.com",
  "getairmail.com",
  "dispostable.com",
  "fakeinbox.com",
  "nada.ltd",
  "crazymailing.com",
];

export function isDisposableEmail(email: string): boolean {
  if (!email || typeof email !== "string") return false;
  const parts = email.trim().toLowerCase().split("@");
  if (parts.length !== 2) return false;
  const domain = parts[1].toLowerCase();
  return DISPOSABLE_EMAIL_DOMAINS.includes(domain);
}

/**
 * Calculates start of the next calendar month at 00:00:00 in Asia/Kolkata (+05:30).
 * Returns ISO string in UTC.
 */
export function getNextMonthResetKolkata(referenceDate = new Date()): string {
  const formatter = new Intl.DateTimeFormat("en-US", {
    timeZone: "Asia/Kolkata",
    year: "numeric",
    month: "numeric",
    day: "numeric",
  });
  const parts = formatter.formatToParts(referenceDate);
  const year = parseInt(parts.find((p) => p.type === "year")!.value, 10);
  const month = parseInt(parts.find((p) => p.type === "month")!.value, 10);

  let nextYear = year;
  let nextMonth = month + 1;
  if (nextMonth > 12) {
    nextMonth = 1;
    nextYear += 1;
  }

  const monthStr = String(nextMonth).padStart(2, "0");
  const localIso = `${nextYear}-${monthStr}-01T00:00:00+05:30`;
  return new Date(localIso).toISOString();
}

/**
 * Formats a reset timestamp into a readable date in Asia/Kolkata (e.g. "1st November 2026")
 */
export function formatKolkataResetDate(isoString?: string | null): string {
  if (!isoString) return "1st of next month";
  try {
    const d = new Date(isoString);
    const day = d.toLocaleDateString("en-US", { timeZone: "Asia/Kolkata", day: "numeric" });
    const month = d.toLocaleDateString("en-US", { timeZone: "Asia/Kolkata", month: "long" });
    const year = d.toLocaleDateString("en-US", { timeZone: "Asia/Kolkata", year: "numeric" });

    const suffix =
      day === "1" || day === "21" || day === "31"
        ? "st"
        : day === "2" || day === "22"
        ? "nd"
        : day === "3" || day === "23"
        ? "rd"
        : "th";

    return `${day}${suffix} ${month} ${year}`;
  } catch {
    return "1st of next month";
  }
}
