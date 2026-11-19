import { NextRequest, NextResponse } from "next/server";
import { mockStore } from "@/lib/mock-db";
import { UserRole, UserPlan } from "@/lib/types";
import { authenticateUser } from "@/lib/session";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  // Allow admin and faculty (for course catalogue in generation), reject students and unauthenticated
  const auth = await authenticateUser(req, ["admin", "faculty"]);
  if (auth.errorResponse) return auth.errorResponse;

  const departments = mockStore.getDepartments();
  const courses = mockStore.getCourses();

  // If faculty, only provide course and department catalog, not user governance
  if (auth.user?.role === "faculty") {
    return NextResponse.json({
      departments,
      courses,
    });
  }

  // Admin receives full user profiles and institutional telemetry
  const profiles = mockStore.getProfiles();
  const cases = mockStore.getCases();
  const reviewRounds = mockStore.getReviewRounds();
  const repositoryItems = mockStore.getRepositoryItems();
  const downloadLogs = mockStore.getDownloadLogs();
  const batches = mockStore.getBatches();
  const facultyTypes = mockStore.getFacultyTypes();
  const categories = mockStore.getCaseCategories();

  const now = Date.now();
  const THREE_DAYS_MS = 3 * 24 * 3600 * 1000;

  // Reviewer loads
  const facultyReviewers = profiles.filter((p) => p.role === "faculty" && p.is_reviewer);
  const reviewerLoads = facultyReviewers.map((rev) => {
    const assignedCases = cases.filter(
      (c) => c.reviewer_id === rev.id && ["submitted", "in_review", "changes_requested"].includes(c.status)
    );
    const assignedRounds = reviewRounds.filter(
      (r) => r.reviewer_id === rev.id && r.decision === "pending"
    );
    const overdueCount = assignedRounds.filter(
      (r) => now - new Date(r.assigned_at).getTime() > THREE_DAYS_MS
    ).length;

    const dept = departments.find((d) => d.id === rev.department_id);
    return {
      reviewerId: rev.id,
      name: rev.name,
      email: rev.email,
      departmentId: rev.department_id,
      departmentName: dept?.name || "General",
      assignedCount: Math.max(assignedCases.length, assignedRounds.length),
      overdueCount,
    };
  });

  // Grouped by department
  const usersByDepartment: Record<string, { faculty: number; students: number; total: number }> = {};
  for (const dept of departments) {
    const faculty = profiles.filter((p) => p.role === "faculty" && p.department_id === dept.id).length;
    const students = profiles.filter((p) => p.role === "student" && p.department_id === dept.id).length;
    usersByDepartment[dept.code || dept.name] = {
      faculty,
      students,
      total: faculty + students,
    };
  }

  // Grouped by course
  const usersByCourse: Record<string, number> = {};
  for (const course of courses) {
    const count = profiles.filter((p) => p.role === "student" && p.course_id === course.id).length;
    usersByCourse[course.code] = count;
  }

  return NextResponse.json({
    profiles,
    departments,
    courses,
    batches,
    facultyTypes,
    categories,
    cases,
    reviewRounds,
    repositoryItems,
    downloadLogs,
    platformSettings: mockStore.getPlatformSettings(),
    allowedDomains: mockStore.getAllowedDomains(),
    studentCaseGeneration: {
      enabled: process.env.STUDENT_CASE_GENERATION === "true",
      dailyLimit: parseInt(process.env.STUDENT_GENERATION_LIMIT || "3", 10) || 3,
    },
    usersByDepartment,
    usersByCourse,
    reviewerLoads,
    stats: {
      totalUsers: profiles.length,
      sbsMembersCount: profiles.filter((p) => p.user_type === "sbs_member").length,
      externalUsersCount: profiles.filter((p) => p.user_type === "external").length,
      facultyCount: profiles.filter((p) => p.role === "faculty").length,
      studentCount: profiles.filter((p) => p.role === "student").length,
      reviewersCount: facultyReviewers.length,
      adminCount: profiles.filter((p) => p.role === "admin").length,
      activeUsersCount: profiles.filter((p) => p.access_status === "active").length,
      inactiveUsersCount: profiles.filter((p) => p.access_status === "inactive").length,
      expiredUsersCount: profiles.filter((p) => p.access_status === "expired").length,
      pendingApprovalCount: profiles.filter((p) => !p.is_approved || p.access_status === "pending").length,
      pendingSubmissionsCount: cases.filter((c) => ["submitted", "in_review", "changes_requested"].includes(c.status)).length,
      approvedCasesCount: cases.filter((c) => c.status === "approved" || c.status === "uploaded").length,
      rejectedCasesCount: cases.filter((c) => c.status === "rejected").length,
      repositoryItemsCount: repositoryItems.filter((i) => i.is_published).length,
      overdueReviewsCount: reviewRounds.filter(
        (r) => r.decision === "pending" && now - new Date(r.assigned_at).getTime() > THREE_DAYS_MS
      ).length,
      totalDepartments: departments.length,
      totalCourses: courses.length,
      totalCases: cases.length,
    },
  }, {
    headers: {
      "Cache-Control": "private, s-maxage=30, stale-while-revalidate=60",
    },
  });
}

export async function POST(req: NextRequest) {
  try {
    // Strictly admin only
    const auth = await authenticateUser(req, ["admin"]);
    if (auth.errorResponse) return auth.errorResponse;

    const body = await req.json();
    const { action } = body;

    if (action === "update-user-role") {
      const { userId, role, isApproved } = body;
      if (!userId || !role) {
        return NextResponse.json(
          { error: "User ID and new role are required." },
          { status: 400 }
        );
      }

      const updated = mockStore.updateProfileRole(
        userId,
        role as UserRole,
        isApproved
      );

      if (!updated) {
        return NextResponse.json({ error: "User not found." }, { status: 404 });
      }

      return NextResponse.json({ success: true, profile: updated });
    }

    if (action === "toggle-approval") {
      const { userId, isApproved } = body;
      const user = mockStore.getProfile(userId);
      if (!user) {
        return NextResponse.json({ error: "User not found." }, { status: 404 });
      }

      const updated = mockStore.updateProfileRole(userId, user.role, isApproved);
      return NextResponse.json({ success: true, profile: updated });
    }

    if (action === "update-user-plan") {
      const { userId, plan } = body;
      if (!userId || !plan) {
        return NextResponse.json({ error: "User ID and plan are required." }, { status: 400 });
      }
      const updated = mockStore.updateUserPlan(userId, plan as UserPlan, auth.user?.id);
      if (!updated) {
        return NextResponse.json({ error: "User not found." }, { status: 404 });
      }
      return NextResponse.json({ success: true, profile: updated });
    }

    if (action === "update-user-quota") {
      const { userId, limit } = body;
      if (!userId || limit === undefined) {
        return NextResponse.json({ error: "User ID and quota limit are required." }, { status: 400 });
      }
      const numLimit = Number(limit);
      if (isNaN(numLimit) || numLimit < 0) {
        return NextResponse.json({ error: "Quota limit must be a valid non-negative number." }, { status: 400 });
      }
      const updated = mockStore.updateUserQuota(userId, numLimit, auth.user?.id);
      if (!updated) {
        return NextResponse.json({ error: "User not found." }, { status: 404 });
      }
      return NextResponse.json({ success: true, profile: updated });
    }

    if (action === "reject-user") {
      const { userId, reason } = body;
      if (!userId) {
        return NextResponse.json({ error: "User ID is required." }, { status: 400 });
      }
      const rejected = mockStore.rejectUserRegistration(userId, auth.user?.id, reason);
      if (!rejected) {
        return NextResponse.json({ error: "User not found for rejection." }, { status: 404 });
      }
      return NextResponse.json({ success: true, message: "User registration rejected." });
    }

    if (action === "create-department") {
      const { code, name, description } = body;
      if (!code || !name) {
        return NextResponse.json(
          { error: "Department code and name are required." },
          { status: 400 }
        );
      }

      const newDept = mockStore.addDepartment({ code, name, description });
      return NextResponse.json({ success: true, department: newDept });
    }

    if (action === "create-course") {
      const { departmentId, dept, code, name, semester } = body;
      if (!departmentId || !code || !name || !semester) {
        return NextResponse.json(
          { error: "Course code, name, semester and department are required." },
          { status: 400 }
        );
      }

      const newCourse = mockStore.addCourse({
        department_id: departmentId,
        dept: dept || "GEN",
        code,
        name,
        semester,
      });

      return NextResponse.json({ success: true, course: newCourse });
    }

    if (action === "update-platform-settings") {
      const { external_free_limit, sbs_fair_use_limit, allowed_domains } = body;
      const updated = mockStore.updatePlatformSettings(
        {
          external_free_limit: external_free_limit !== undefined ? Number(external_free_limit) : undefined,
          sbs_fair_use_limit: sbs_fair_use_limit !== undefined ? Number(sbs_fair_use_limit) : undefined,
          allowed_domains: Array.isArray(allowed_domains) ? allowed_domains : undefined,
        },
        auth.user?.id
      );
      return NextResponse.json({ success: true, platformSettings: updated });
    }

    if (action === "add-allowed-domain") {
      const { domain } = body;
      if (!domain) {
        return NextResponse.json({ error: "Domain name is required." }, { status: 400 });
      }
      const res = mockStore.addAllowedDomain(domain, auth.user?.id);
      if (!res.success) {
        return NextResponse.json({ error: res.message }, { status: 400 });
      }
      return NextResponse.json({ success: true, message: res.message, allowedDomains: res.domains });
    }

    if (action === "remove-allowed-domain") {
      const { domain } = body;
      if (!domain) {
        return NextResponse.json({ error: "Domain name is required." }, { status: 400 });
      }
      const res = mockStore.removeAllowedDomain(domain, auth.user?.id);
      if (!res.success) {
        return NextResponse.json({ error: res.message }, { status: 400 });
      }
      return NextResponse.json({ success: true, message: res.message, allowedDomains: res.domains });
    }

    if (action === "toggle-reviewer") {
      const { userId, isReviewer } = body;
      if (!userId || isReviewer === undefined) {
        return NextResponse.json({ error: "User ID and reviewer status are required." }, { status: 400 });
      }
      const res = mockStore.setFacultyReviewer(userId, Boolean(isReviewer), auth.user?.id);
      if (!res.success) {
        return NextResponse.json({ error: res.error }, { status: 400 });
      }
      return NextResponse.json({ success: true, profile: res.profile });
    }

    if (action === "reassign-reviewer") {
      const { caseId, newReviewerId } = body;
      if (!caseId || !newReviewerId) {
        return NextResponse.json({ error: "Case ID and new reviewer ID are required." }, { status: 400 });
      }
      const res = mockStore.reassignReviewer(caseId, newReviewerId, auth.user?.id);
      if (!res.success) {
        return NextResponse.json({ error: res.error }, { status: 400 });
      }
      return NextResponse.json({ success: true, round: res.round });
    }

    if (action === "renew-student-access") {
      const { userId, extensionYears, customEndDate } = body;
      if (!userId) {
        return NextResponse.json({ error: "User ID is required." }, { status: 400 });
      }
      const res = mockStore.renewStudentAccess(userId, extensionYears || 1, auth.user?.id, customEndDate);
      if (!res.success) {
        return NextResponse.json({ error: res.error }, { status: 400 });
      }
      return NextResponse.json({ success: true, profile: res.profile });
    }

    if (action === "bulk-renew-batch") {
      const { batchId, extensionYears } = body;
      if (!batchId) {
        return NextResponse.json({ error: "Batch ID is required." }, { status: 400 });
      }
      const res = mockStore.bulkRenewStudentsByBatch(batchId, extensionYears || 1, auth.user?.id);
      return NextResponse.json({ success: true, affectedCount: res.count, profiles: res.profiles });
    }

    if (action === "bulk-deactivate-batch") {
      const { batchId } = body;
      if (!batchId) {
        return NextResponse.json({ error: "Batch ID is required." }, { status: 400 });
      }
      const res = mockStore.bulkDeactivateStudentsByBatch(batchId, auth.user?.id);
      return NextResponse.json({ success: true, affectedCount: res.count, profiles: res.profiles });
    }

    if (action === "set-user-status") {
      const { userId, status } = body;
      if (!userId || !status) {
        return NextResponse.json({ error: "User ID and status are required." }, { status: 400 });
      }
      const res = mockStore.setUserAccessStatus(userId, status, auth.user?.id);
      if (!res.success) {
        return NextResponse.json({ error: res.error }, { status: 400 });
      }
      return NextResponse.json({ success: true, profile: res.profile });
    }

    if (action === "moderate-repository-item") {
      const { itemId, isPublished } = body;
      if (!itemId || isPublished === undefined) {
        return NextResponse.json({ error: "Item ID and publication status are required." }, { status: 400 });
      }
      const res = mockStore.moderateRepositoryItem(itemId, Boolean(isPublished), auth.user?.id);
      if (!res.success) {
        return NextResponse.json({ error: res.error }, { status: 400 });
      }
      return NextResponse.json({ success: true, item: res.item });
    }

    if (action === "reset-rate-limit") {
      const { userId } = body;
      if (userId) {
        mockStore.clearHourlyUsage(userId);
      }
      return NextResponse.json({ success: true, message: "Rate limit reset." });
    }

    return NextResponse.json({ error: "Unknown admin action." }, { status: 400 });
  } catch (err: unknown) {
    console.error("Admin API error:", err);
    return NextResponse.json({ error: "Admin request failed." }, { status: 500 });
  }
}
