/**
 * SBS CaseLab: Phase 5 Admin Dashboard, Telemetry & Role Moderation Test Suite
 *
 * Verifies:
 * 1. Admin RBAC & Route Security (Faculty & Students barred from administrative governance).
 * 2. Institutional Telemetry & KPI Math (Counts match underlying store).
 * 3. Faculty Reviewer Toggle & Open Review Safeguard (Cannot remove reviewer with pending reviews).
 * 4. Atomic Reviewer Reassignment (Non-author faculty reviewer enforced, updates review_rounds).
 * 5. Student Access Lifecycle (Renewal, custom date, bulk batch renewal & deactivation, admin self-deactivation blocked).
 * 6. Repository Moderation (Unpublish / Republish toggles, download logs aggregation).
 * 7. Tamper-evident Audit Logging for all administrative actions.
 */

import { mockStore } from "../src/lib/mock-db";
import { GET as adminGet, POST as adminPost } from "../src/app/api/admin/route";
import { createSessionToken, AUTH_COOKIE_NAME } from "../src/lib/session";
import { NextRequest } from "next/server";

let passed = 0;
let failed = 0;

function assert(condition: boolean, desc: string) {
  if (condition) {
    console.log(`  ✅ PASS: ${desc}`);
    passed++;
  } else {
    console.error(`  ❌ FAIL: ${desc}`);
    failed++;
  }
}

async function createRequest(
  method: "GET" | "POST",
  userId?: string,
  body?: any
): Promise<NextRequest> {
  const headers = new Headers();
  headers.set("content-type", "application/json");

  if (userId) {
    const token = await createSessionToken(userId);
    headers.set("cookie", `${AUTH_COOKIE_NAME}=${token}`);
  }

  const url = "http://localhost:3000/api/admin";
  const reqInit: RequestInit = {
    method,
    headers,
  };

  if (body) {
    reqInit.body = JSON.stringify(body);
  }

  return new NextRequest(new Request(url, reqInit));
}

async function runAdminTests() {
  console.log("==================================================================");
  console.log("🛡️ PHASE 5: ADMIN DASHBOARD, TELEMETRY & ROLE MODERATION SUITE");
  console.log("==================================================================\n");

  // TEST 1: Role-Based Access Control (RBAC) on Admin Endpoint
  console.log("TEST 1: Admin RBAC & Gating Enforcement");
  {
    // Unauthenticated request
    const unauthReq = await createRequest("GET");
    const unauthRes = await adminGet(unauthReq);
    assert(unauthRes.status === 401, "Unauthenticated GET /api/admin returns HTTP 401 Unauthorized");

    // Student GET request (forbidden)
    const studentGetReq = await createRequest("GET", "usr-student-1");
    const studentGetRes = await adminGet(studentGetReq);
    assert(studentGetRes.status === 403, "Student GET /api/admin returns HTTP 403 Forbidden");

    // Student POST request (forbidden)
    const studentPostReq = await createRequest("POST", "usr-student-1", {
      action: "toggle-reviewer",
      userId: "usr-faculty-1",
      isReviewer: true,
    });
    const studentPostRes = await adminPost(studentPostReq);
    assert(studentPostRes.status === 403, "Student POST /api/admin returns HTTP 403 Forbidden");

    // Faculty POST request (forbidden from admin governance)
    const facultyPostReq = await createRequest("POST", "usr-faculty-1", {
      action: "toggle-reviewer",
      userId: "usr-faculty-2",
      isReviewer: true,
    });
    const facultyPostRes = await adminPost(facultyPostReq);
    assert(facultyPostRes.status === 403, "Faculty POST /api/admin returns HTTP 403 Forbidden");

    // Admin GET request (allowed)
    const adminGetReq = await createRequest("GET", "usr-admin-1");
    const adminGetRes = await adminGet(adminGetReq);
    assert(adminGetRes.status === 200, "Admin GET /api/admin returns HTTP 200 OK");
    const cacheHeader = adminGetRes.headers.get("Cache-Control");
    assert(Boolean(cacheHeader && cacheHeader.includes("s-maxage=30")), "Admin telemetry response carries short TTL cache header");
  }

  // TEST 2: Institutional Telemetry Consistency
  console.log("\nTEST 2: Institutional Telemetry & Metric Math Consistency");
  {
    const adminReq = await createRequest("GET", "usr-admin-1");
    const res = await adminGet(adminReq);
    const data = await res.json();

    const dbProfiles = mockStore.getProfiles();
    const dbBatches = mockStore.getBatches();
    const dbFacultyTypes = mockStore.getFacultyTypes();

    assert(data.stats.totalUsers === dbProfiles.length, `totalUsers (${data.stats.totalUsers}) matches profile count (${dbProfiles.length})`);
    assert(data.stats.studentCount === dbProfiles.filter((p: any) => p.role === "student").length, "studentCount matches student profiles");
    assert(data.stats.facultyCount === dbProfiles.filter((p: any) => p.role === "faculty").length, "facultyCount matches faculty profiles");
    assert(data.stats.reviewersCount === dbProfiles.filter((p: any) => p.role === "faculty" && p.is_reviewer).length, "reviewersCount matches faculty with is_reviewer=true");
    assert(Array.isArray(data.reviewerLoads), "reviewerLoads is provided as an array of reviewer workload objects");
    assert(data.batches.length === dbBatches.length, `batches count (${data.batches.length}) matches database records`);
    assert(data.facultyTypes.length === dbFacultyTypes.length, `facultyTypes count (${data.facultyTypes.length}) matches database records`);
    assert(typeof data.usersByDepartment === "object", "usersByDepartment is returned as structured mapping");
  }

  // TEST 3: Faculty Reviewer Toggle & Open Review Safeguard
  console.log("\nTEST 3: Faculty Reviewer Toggle & Safeguard Against Unassigning with Pending Reviews");
  {
    // Ensure faculty exists
    const faculty = mockStore.getProfiles().find((p) => p.role === "faculty");
    assert(Boolean(faculty), "Found faculty member for reviewer governance");

    if (faculty) {
      // Admin designates faculty as reviewer
      const req = await createRequest("POST", "usr-admin-1", {
        action: "toggle-reviewer",
        userId: faculty.id,
        isReviewer: true,
      });
      const res = await adminPost(req);
      const data = await res.json();
      assert(res.status === 200, "Admin can designate faculty as reviewer");
      assert(data.profile.is_reviewer === true, "Faculty is_reviewer is true");
      assert(Boolean(data.profile.reviewer_since), "reviewer_since timestamp is set");

      // Create a test case study assigned to this reviewer with a pending round
      const testCase = mockStore.saveCase({
        id: `case-safeguard-test-${Date.now()}`,
        title: "Admin Reviewer Safeguard Test Case",
        type: "full",
        format: "hypothetical",
        author_id: "usr-student-test-1",
        author_name: "Test Student Author",
        author_role: "student",
        department_id: faculty.department_id || "dept-1",
        industry: "Finance",
        function: "Strategy",
        level: "intermediate",
        complexity: "medium",
        status: "in_review",
        review_status: "in_review",
        reviewer_id: faculty.id,
      } as any);

      // Add a pending review round for this reviewer
      const round = mockStore.assignReviewer(testCase.id);
      round.reviewer_id = faculty.id; // ensure assigned to this reviewer

      // Attempting to remove reviewer status while having pending reviews should be rejected
      const removeReq = await createRequest("POST", "usr-admin-1", {
        action: "toggle-reviewer",
        userId: faculty.id,
        isReviewer: false,
      });
      const removeRes = await adminPost(removeReq);
      const removeData = await removeRes.json();

      assert(removeRes.status === 400, "Reject removing reviewer designation when open review rounds exist");
      assert(removeData.error.includes("open review"), "Clear error instructs admin to reassign open reviews first");

      // Mark the review as decided
      round.decision = "approved";
      round.decided_at = new Date().toISOString();

      // Now removing reviewer should succeed
      const retryReq = await createRequest("POST", "usr-admin-1", {
        action: "toggle-reviewer",
        userId: faculty.id,
        isReviewer: false,
      });
      const retryRes = await adminPost(retryReq);
      assert(retryRes.status === 200, "Successfully removed reviewer role after reviews cleared");
    }
  }

  // TEST 4: Atomic Reviewer Reassignment Workflow
  console.log("\nTEST 4: Atomic Reviewer Reassignment Workflow");
  {
    // Setup two faculty reviewers
    const fac1 = mockStore.getProfiles().find((p) => p.role === "faculty");
    const fac2 = mockStore.getProfiles().find((p) => p.role === "faculty" && p.id !== fac1?.id);

    if (fac1 && fac2) {
      mockStore.setFacultyReviewer(fac1.id, true);
      mockStore.setFacultyReviewer(fac2.id, true);

      // Create a case by fac1
      const caseStudy = mockStore.saveCase({
        id: `case-reassign-test-${Date.now()}`,
        title: "Reassignment Lifecycle Test Case",
        type: "full",
        format: "hypothetical",
        author_id: fac1.id,
        author_name: fac1.name,
        author_role: "faculty",
        department_id: fac1.department_id || "dept-1",
        industry: "Marketing",
        function: "Branding",
        level: "advanced",
        complexity: "high",
        status: "in_review",
        review_status: "in_review",
        reviewer_id: fac2.id,
      } as any);

      // Attempting to reassign reviewer to the author (fac1) must be rejected
      const invalidReq = await createRequest("POST", "usr-admin-1", {
        action: "reassign-reviewer",
        caseId: caseStudy.id,
        newReviewerId: fac1.id,
      });
      const invalidRes = await adminPost(invalidReq);
      const invalidData = await invalidRes.json();
      assert(invalidRes.status === 400, "Reject assigning case study author as its reviewer");
      assert(invalidData.error.includes("Author cannot be assigned"), "Returns explicit error prohibiting author as reviewer");

      // Reassign to fac2 (valid)
      const validReq = await createRequest("POST", "usr-admin-1", {
        action: "reassign-reviewer",
        caseId: caseStudy.id,
        newReviewerId: fac2.id,
      });
      const validRes = await adminPost(validReq);
      assert(validRes.status === 200, "Admin can reassign reviewer to another eligible faculty member");

      const updatedCase = mockStore.getCase(caseStudy.id);
      assert(updatedCase?.reviewer_id === fac2.id, "Case study reviewer_id updated in database");
    }
  }

  // TEST 5: Student Access Lifecycle (Renewal, Expiration, Bulk Batch Ops, Admin Immunity)
  console.log("\nTEST 5: Student Access Lifecycle & Batch Moderation");
  {
    const student = mockStore.getProfiles().find((p) => p.role === "student");
    assert(Boolean(student), "Found student profile for access testing");

    if (student) {
      const origEnd = student.access_end || new Date().toISOString();

      // Quick +1 Year Renewal
      const renewReq = await createRequest("POST", "usr-admin-1", {
        action: "renew-student-access",
        userId: student.id,
        extensionYears: 1,
      });
      const renewRes = await adminPost(renewReq);
      const renewData = await renewRes.json();

      assert(renewRes.status === 200, "Admin can renew student access (+1 year)");
      assert(renewData.profile.access_status === "active", "Renewed student status is active");
      assert(new Date(renewData.profile.access_end).getTime() > new Date(origEnd).getTime(), "access_end timestamp increased by 1 year");

      // Custom Expiration Date
      const customDate = "2029-12-31T23:59:59.000Z";
      const customReq = await createRequest("POST", "usr-admin-1", {
        action: "renew-student-access",
        userId: student.id,
        customEndDate: customDate,
      });
      const customRes = await adminPost(customReq);
      const customData = await customRes.json();
      assert(customRes.status === 200, "Admin can set custom access expiry date");
      assert(customData.profile.access_end === new Date(customDate).toISOString(), "Custom access_end date persisted");

      // Bulk Batch Renewal
      const batchId = student.batch_id || "batch-2024-27";
      const bulkRenewReq = await createRequest("POST", "usr-admin-1", {
        action: "bulk-renew-batch",
        batchId,
        extensionYears: 1,
      });
      const bulkRenewRes = await adminPost(bulkRenewReq);
      const bulkRenewData = await bulkRenewRes.json();
      assert(bulkRenewRes.status === 200, "Admin can perform bulk renewal on entire student batch");
      assert(bulkRenewData.affectedCount > 0, `Bulk renewal affected ${bulkRenewData.affectedCount} students`);

      // Deactivate student account
      const deactReq = await createRequest("POST", "usr-admin-1", {
        action: "set-user-status",
        userId: student.id,
        status: "inactive",
      });
      const deactRes = await adminPost(deactReq);
      const deactData = await deactRes.json();
      assert(deactRes.status === 200, "Admin can deactivate user account");
      assert(deactData.profile.access_status === "inactive", "User access_status updated to inactive");

      // Admin Immunity: Admin cannot deactivate themselves
      const adminSelfDeactReq = await createRequest("POST", "usr-admin-1", {
        action: "set-user-status",
        userId: "usr-admin-1",
        status: "inactive",
      });
      const adminSelfDeactRes = await adminPost(adminSelfDeactReq);
      assert(adminSelfDeactRes.status === 400, "System blocks admin self-deactivation");

      // Re-activate student
      mockStore.setUserAccessStatus(student.id, "active");
    }
  }

  // TEST 6: Repository Moderation (Unpublish / Republish & Download Logs)
  console.log("\nTEST 6: Repository Moderation & Download Logging");
  {
    // Upload a test case to repository
    const repoItem = mockStore.uploadToRepository({
      case_id: "case-admin-test-repo",
      title: "Admin Repository Moderation Test Case",
      approved_version_id: "v1",
      author_id: "usr-faculty-1",
      reviewer_id: "usr-faculty-2",
      department_id: "dept-1",
      course_id: "course-1",
      category_id: "Finance",
      keywords: ["Finance", "Governance"],
      approval_status: "approved",
      file_docx_path: "repo/case-test.docx",
      file_pdf_path: "repo/case-test.pdf",
      is_published: true,
      author_consent_at: new Date().toISOString(),
      author_consent_version: "v1.0",
      ai_assisted: true,
      similarity_score: 96,
      submitted_at: new Date().toISOString(),
      approved_at: new Date().toISOString(),
    } as any);

    assert(repoItem.is_published === true, "Item uploaded with is_published=true");

    // Unpublish repository item
    const unpubReq = await createRequest("POST", "usr-admin-1", {
      action: "moderate-repository-item",
      itemId: repoItem.id,
      isPublished: false,
    });
    const unpubRes = await adminPost(unpubReq);
    const unpubData = await unpubRes.json();
    assert(unpubRes.status === 200, "Admin can unpublish repository item");
    assert(unpubData.item.is_published === false, "Repository item is_published is now false");

    // Log simulated downloads
    mockStore.logDownload(repoItem.id, "usr-student-1", "pdf");
    mockStore.logDownload(repoItem.id, "usr-faculty-2", "docx");

    const dlLogs = mockStore.getDownloadLogs(repoItem.id);
    assert(dlLogs.length === 2, "Download logs tracked and retrievable for repository item");

    // Republish repository item
    const repubReq = await createRequest("POST", "usr-admin-1", {
      action: "moderate-repository-item",
      itemId: repoItem.id,
      isPublished: true,
    });
    const repubRes = await adminPost(repubReq);
    const repubData = await repubRes.json();
    assert(repubRes.status === 200, "Admin can republish repository item");
    assert(repubData.item.is_published === true, "Repository item is_published restored to true");
  }

  // TEST 7: Tamper-Evident Audit Logging
  console.log("\nTEST 7: Audit Logging for All Administrative Mutations");
  {
    const auditLogs = mockStore.getAuditLogs();
    const hasRoleChange = auditLogs.some((l) => l.action === "role_change");
    const hasReassigned = auditLogs.some((l) => l.action === "reviewer_reassigned");
    const hasAccessRenewed = auditLogs.some((l) => l.action === "access_renewed");
    const hasUnpublished = auditLogs.some((l) => l.action === "case_unpublished");
    const hasPublished = auditLogs.some((l) => l.action === "case_published");

    assert(hasRoleChange, "Audit ledger records role_change for reviewer toggle");
    assert(hasReassigned, "Audit ledger records reviewer_reassigned");
    assert(hasAccessRenewed, "Audit ledger records access_renewed");
    assert(hasUnpublished, "Audit ledger records case_unpublished");
    assert(hasPublished, "Audit ledger records case_published");
  }

  console.log("\n==================================================================");
  console.log(`📊 PHASE 5 TEST RESULTS: ${passed} PASSED, ${failed} FAILED`);
  console.log("==================================================================");

  if (failed > 0) {
    process.exit(1);
  }
}

runAdminTests().catch((err) => {
  console.error("Test execution error:", err);
  process.exit(1);
});
