import { NextRequest, NextResponse } from "next/server";
import { mockStore } from "@/lib/mock-db";
import { COLLEGE_NAME_WITH_SHORT, COLLEGE_SHORT } from "@/config/college";
import { authenticateUser } from "@/lib/session";

export interface SystemNotification {
  id: string;
  category: "action_required" | "academic" | "billing" | "security";
  title: string;
  message: string;
  href: string;
  timestamp: string;
  unread: boolean;
  priority: "high" | "medium" | "low";
}

export async function GET(req: NextRequest) {
  try {
    const { user, errorResponse } = await authenticateUser(req);
    if (errorResponse || !user) {
      return errorResponse || NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = user.id;
    const notifications: SystemNotification[] = [];
    const now = new Date().toISOString();

    // 2. USER QUOTA WARNINGS (80% Amber, 90% Red, 100% Blocked)
    const userQuota = mockStore.checkUserGenerationQuota(userId);
    if (userQuota.limit > 0) {
      const usageRatio = userQuota.used / userQuota.limit;
      if (usageRatio >= 1.0) {
        notifications.push({
          id: `notif-quota-blocked-${userId}`,
          category: "security",
          title: "Monthly Generation Quota Blocked (100%)",
          message: `You have consumed all ${userQuota.limit} allowed case generations for this monthly billing cycle (${userQuota.used}/${userQuota.limit}). Please request an administrative quota expansion.`,
          href: user.role === "admin" ? "/admin" : "/pricing",
          timestamp: now,
          unread: true,
          priority: "high",
        });
      } else if (usageRatio >= 0.9) {
        notifications.push({
          id: `notif-quota-critical-${userId}`,
          category: "security",
          title: "Monthly Quota Critical Alert (90%+ Used)",
          message: `You have used ${userQuota.used} of ${userQuota.limit} monthly case generations (${Math.round(usageRatio * 100)}%). Only ${userQuota.remaining} generation(s) remaining before automated cutoff.`,
          href: user.role === "admin" ? "/admin" : "/pricing",
          timestamp: now,
          unread: true,
          priority: "high",
        });
      } else if (usageRatio >= 0.8) {
        notifications.push({
          id: `notif-quota-warning-${userId}`,
          category: "security",
          title: "Monthly Quota Approaching Limit (80%+ Used)",
          message: `You have used ${userQuota.used} of ${userQuota.limit} monthly case generations (${Math.round(usageRatio * 100)}%). Review your remaining allocation.`,
          href: user.role === "admin" ? "/admin" : "/pricing",
          timestamp: now,
          unread: true,
          priority: "medium",
        });
      }
    }

    // 2b. ADMIN & INSTITUTIONAL TOKEN BUDGET WARNINGS
    if (user.role === "admin") {
      const budget = mockStore.getTokenBudgetInfo();
      if (budget.is_warning_threshold) {
        notifications.push({
          id: "notif-budget-warning",
          category: "security",
          title: "Institutional AI Token Budget Alert",
          message: `Campus AI generation usage has reached ${budget.usage_percentage}% of the monthly quota (${budget.tokens_used_this_month.toLocaleString()} / ${budget.monthly_budget_tokens.toLocaleString()} tokens).`,
          href: "/admin",
          timestamp: now,
          unread: true,
          priority: "high",
        });
      }

      const pendingUsers = mockStore.getProfiles().filter((p) => !p.is_approved);
      if (pendingUsers.length > 0) {
        notifications.push({
          id: "notif-pending-users",
          category: "action_required",
          title: "Pending User Approvals",
          message: `${pendingUsers.length} prospective ${COLLEGE_SHORT} affiliate(s) are awaiting credential verification and role activation.`,
          href: "/admin",
          timestamp: now,
          unread: true,
          priority: "medium",
        });
      }
    }

    // 3. FACULTY NOTIFICATIONS (Pending Reviews, Author Case Updates, Submissions to Grade, News Signals)
    if (user.role === "faculty" || user.role === "admin") {
      // Pending review queue notifications for reviewers
      const pendingReviews = mockStore.getCases().filter((c) => c.status === "in_review");
      if (pendingReviews.length > 0 && user.role === "admin") {
        notifications.push({
          id: "notif-case-reviews",
          category: "action_required",
          title: "Curriculum Approvals Pending",
          message: `${pendingReviews.length} case study draft(s) have been submitted and require administrative approval.`,
          href: "/review-queue",
          timestamp: now,
          unread: true,
          priority: "high",
        });
      }

      // Author workflow status updates for authored cases
      const authoredCases = mockStore.getCases().filter((c) => c.author_id === userId);
      authoredCases.forEach((c) => {
        if (c.status === "approved" || c.status === "published") {
          notifications.push({
            id: `notif-case-approved-${c.id}`,
            category: "academic",
            title: c.status === "published" ? "Case Published to Library" : "Case Curriculum Approved",
            message: `"${c.title}" has been peer-verified and is now ${c.status === "published" ? "accessible in the curriculum repository" : "approved for student distribution"}.`,
            href: `/cases/${c.id}`,
            timestamp: c.updated_at || c.created_at,
            unread: false,
            priority: "medium",
          });
        } else if (c.status === "changes_requested") {
          notifications.push({
            id: `notif-case-changes-${c.id}`,
            category: "action_required",
            title: "Peer Review Changes Requested",
            message: `Reviewer feedback received for "${c.title}": ${c.reviewer_comment || "Please update exhibits and pedagogical questions."}`,
            href: `/cases/${c.id}`,
            timestamp: c.updated_at || c.created_at,
            unread: true,
            priority: "high",
          });
        }
      });

      const allAnswers = mockStore.getAnswers();
      const pendingGrading = allAnswers.filter((a) => a.status === "submitted");
      if (pendingGrading.length > 0) {
        notifications.push({
          id: "notif-submissions-grade",
          category: "academic",
          title: "Student Submissions Awaiting Final Marks",
          message: `${pendingGrading.length} student submission(s) have completed AI evaluation and await faculty publication.`,
          href: "/analytics",
          timestamp: now,
          unread: true,
          priority: "medium",
        });
      }

      const radarSignals = mockStore.getSignals();
      const highValueSignals = radarSignals.filter((s) => s.potential_score >= 8);
      if (highValueSignals.length > 0) {
        notifications.push({
          id: `notif-signal-${highValueSignals[0].id}`,
          category: "academic",
          title: "High-Potential Business Signal Detected",
          message: `Radar detected: "${highValueSignals[0].title}" (${highValueSignals[0].potential_score}/10 case score). Generate a real-signal case now.`,
          href: `/create?signalId=${highValueSignals[0].id}`,
          timestamp: now,
          unread: false,
          priority: "low",
        });
      }
    }

    // 3b. REPOSITORY SHARING & NEW CASE PUBLISHING ANNOUNCEMENTS
    const publishedCases = mockStore.getCases().filter((c) => c.status === "published");
    if (publishedCases.length > 0) {
      const latestPublished = publishedCases[0];
      notifications.push({
        id: `notif-shared-case-${latestPublished.id}`,
        category: "academic",
        title: "New Case Available in Library",
        message: `"${latestPublished.title}" has been published by ${latestPublished.author_name || "Faculty"} in ${latestPublished.domain || latestPublished.industry}.`,
        href: `/cases/${latestPublished.id}`,
        timestamp: latestPublished.created_at,
        unread: false,
        priority: "low",
      });
    }

    // 4. STUDENT NOTIFICATIONS (Published Grades, Academic Feedback, Live Polls)
    if (user.role === "student") {
      const myAnswers = mockStore.getAnswersForStudent(userId);
      const gradedAnswers = myAnswers.filter((a) => a.grade !== null && a.grade !== undefined);
      if (gradedAnswers.length > 0) {
        notifications.push({
          id: "notif-grades-published",
          category: "academic",
          title: "Official Faculty Evaluation Published",
          message: `Your final score and pedagogical feedback for "${gradedAnswers[0].case_title || "Strategic Decision Analysis"}" is now available in your academic transcript.`,
          href: "/my-answers",
          timestamp: now,
          unread: false,
          priority: "medium",
        });
      }

      notifications.push({
        id: "notif-cert-ready",
        category: "academic",
        title: "Dean's Certificate of Case Mastery",
        message: "You have verified course completion. Download your tamper-evident Dean-signed certificate in your portfolio.",
        href: "/portfolio",
        timestamp: now,
        unread: false,
        priority: "low",
      });
    }

    return NextResponse.json({
      success: true,
      notifications,
      unread_count: notifications.filter((n) => n.unread).length,
    });
  } catch (err: unknown) {
    console.error("Notifications fetch error:", err);
    return NextResponse.json(
      { error: "Failed to fetch notifications." },
      { status: 500 }
    );
  }
}
