import { Profile, AccessStatus } from "./types";

export interface AccessCheckResult {
  allowed: boolean;
  canCreate: boolean;
  canReview: boolean;
  canSubmit: boolean;
  canUpload: boolean;
  canDownloadOwn: boolean;
  status: AccessStatus | "unauthenticated";
  reason?: string;
  redirectTo?: string;
}

/**
 * Institutional Access Gatekeeper:
 * Evaluates whether a user's account is permitted to create, review, submit, or upload cases.
 * Handles active, pending, inactive, and expired accounts.
 *
 * Expired accounts (e.g. former students after 1-year grace period):
 * - Can log in
 * - Can view and download their past submissions/cases and personal data export
 * - CANNOT create, curate, submit, review, or upload new repository cases
 */
export function checkAccess(user: Partial<Profile> | null | undefined): AccessCheckResult {
  if (!user || (!user.id && !user.email && !user.access_status)) {
    return {
      allowed: false,
      canCreate: false,
      canReview: false,
      canSubmit: false,
      canUpload: false,
      canDownloadOwn: false,
      status: "unauthenticated",
      reason: "Please sign in to access the SBS CaseLab repository.",
      redirectTo: "/login",
    };
  }

  // 1. Pending Institutional Approval
  if (user.access_status === "pending" || !user.is_approved) {
    return {
      allowed: false,
      canCreate: false,
      canReview: false,
      canSubmit: false,
      canUpload: false,
      canDownloadOwn: false,
      status: "pending",
      reason: "Your account registration is pending institutional approval by Dean Academics.",
      redirectTo: "/login?status=pending",
    };
  }

  // 2. Inactive / Suspended Account
  if (user.access_status === "inactive") {
    return {
      allowed: false,
      canCreate: false,
      canReview: false,
      canSubmit: false,
      canUpload: false,
      canDownloadOwn: false,
      status: "inactive",
      reason: "Your account is currently inactive. Please contact the Case Centre Administrator.",
      redirectTo: "/login?status=inactive",
    };
  }

  // 3. Expiration Check (Students have access_end = batch.end_date + 1 year; faculty/admin have null unless set)
  const isDateExpired = user.access_end
    ? new Date(user.access_end).getTime() < Date.now()
    : false;

  if (user.access_status === "expired" || isDateExpired) {
    return {
      allowed: false,
      canCreate: false,
      canReview: false,
      canSubmit: false,
      canUpload: false,
      canDownloadOwn: true, // Crucial: expired accounts keep perpetual read/download access to their own past work
      status: "expired",
      reason: `Institutional access expired on ${user.access_end ? new Date(user.access_end).toLocaleDateString("en-IN") : "past date"}. You can view and download your past work. Contact admin@shantibschool.edu.in to renew.`,
      redirectTo: "/expired",
    };
  }

  // 4. Active Account
  const isFacultyReviewer = user.role === "faculty" && Boolean(user.is_reviewer);
  const isAdmin = user.role === "admin";

  return {
    allowed: true,
    canCreate: true, // Both students and faculty can create cases!
    canReview: isFacultyReviewer || isAdmin,
    canSubmit: true,
    canUpload: isAdmin || isFacultyReviewer,
    canDownloadOwn: true,
    status: "active",
  };
}
