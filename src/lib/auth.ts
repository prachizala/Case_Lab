import { Profile, UserRole, UserType } from "./types";
import { mockStore } from "./mock-db";
import { ALLOWED_EMAIL_DOMAIN, isSbsDomain, isDisposableEmail, COLLEGE_NAME } from "@/config/college";

export const ALLOWED_DOMAIN = ALLOWED_EMAIL_DOMAIN;

/**
 * Validates user email for registration:
 * - Rejects empty or malformed email strings.
 * - Rejects disposable / temporary email domains.
 * - Accepts any legitimate personal, work or institutional email.
 * - Classifies users into "sbs_member" (if matching SBS allowed domains) or "external".
 */
export function validateEmailDomain(
  email: string,
  dynamicAllowedDomains?: string[]
): {
  isValid: boolean;
  domain: string;
  isSbsDomain: boolean;
  userType: UserType;
  errorMessage?: string;
} {
  const normalized = email?.trim().toLowerCase() || "";
  const parts = normalized.split("@");
  const domainPart = parts.length === 2 ? parts[1] : "";

  if (!normalized || parts.length !== 2 || !parts[0] || !parts[1] || !parts[1].includes(".")) {
    return {
      isValid: false,
      domain: "",
      isSbsDomain: false,
      userType: "external",
      errorMessage: "Please provide a valid email address.",
    };
  }

  // Reject disposable / throwaway email addresses
  if (isDisposableEmail(normalized)) {
    return {
      isValid: false,
      domain: domainPart,
      isSbsDomain: false,
      userType: "external",
      errorMessage: "Disposable or temporary email addresses are not permitted. Please use your personal, work or institutional email.",
    };
  }

  const isMatch = isSbsDomain(normalized, dynamicAllowedDomains);

  return {
    isValid: true,
    domain: domainPart,
    isSbsDomain: isMatch,
    userType: isMatch ? "sbs_member" : "external",
  };
}

export {
  AUTH_COOKIE_NAME,
  authenticateUser,
  setSessionCookie,
  clearSessionCookie,
  createSessionToken,
  verifySessionToken,
} from "./session";

export interface AuthSession {
  userId: string;
  email: string;
  name: string;
  role: UserRole;
  isApproved: boolean;
  plan: string;
}

export function getMockUserByEmail(email: string): Profile | undefined {
  return mockStore.getProfile(email.toLowerCase().trim());
}

export function getDefaultDemoUsers() {
  return [
    {
      role: "admin" as UserRole,
      label: "Dr. Neha Sharma (Admin)",
      email: "neha.sharma@shantibschool.edu.in",
      description: "Dean, Academics & Accreditation — Management & Strategy",
    },
    {
      role: "faculty" as UserRole,
      label: "Ms. Reena Paswan (Faculty)",
      email: "reena.paswan@shantibschool.edu.in",
      description: "Assistant Professor — Business Analytics / Marketing",
    },
    {
      role: "student" as UserRole,
      label: "Zala Prachi (Student)",
      email: "prachi.z24bca@shantibschool.edu.in",
      description: "BCA, Semester 5 — Case library, answers & portfolio",
    },
  ];
}
