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

export interface DownloadCheckResult {
  allowed: boolean;
  isPaidRequired: boolean;
  priceInr?: number | null;
  reason?: string;
}

/**
 * Repository Download Permissions & Commercialization Extension Point:
 * Determines whether a user is authorized to download a repository item.
 * Evaluates:
 * - Active institutional status (students/faculty/admin).
 * - Author self-download rights (perpetual even if expired).
 * - Commercial / Paid case download checks (when PAYMENTS_ENABLED / PAID_DOWNLOADS is true).
 */
export function canDownload(
  user: Partial<Profile> | null | undefined,
  item?: { author_id?: string; price_inr?: number | null; is_published?: boolean } | null
): DownloadCheckResult {
  const access = checkAccess(user);

  // Author can always download their own work, even if account has expired
  if (user?.id && item?.author_id === user.id) {
    return { allowed: true, isPaidRequired: false };
  }

  // If user account is expired, inactive, or unapproved, they cannot download general repository items
  if (!access.allowed) {
    return {
      allowed: false,
      isPaidRequired: false,
      reason: access.reason || "Institutional access expired or inactive. Renew subscription to download repository items.",
    };
  }

  // Commercial / Paid Case Downloads Extension Point
  const isPaidEnabled = process.env.PAYMENTS_ENABLED === "true" || process.env.PAID_DOWNLOADS === "true";
  if (isPaidEnabled && item?.price_inr && item.price_inr > 0) {
    return {
      allowed: false,
      isPaidRequired: true,
      priceInr: item.price_inr,
      reason: `Paid case study (₹${item.price_inr}). Payment required or institutional subscription needed.`,
    };
  }

  // Default: Authorized active institutional members can download
  return { allowed: true, isPaidRequired: false };
}
