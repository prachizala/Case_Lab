/**
 * STEP 3 TEST SUITE: Case Download Gating & Commercialization Deterrent Model
 *
 * Verifies:
 *  1. canDownload(user, item):
 *     - Admin: allowed
 *     - Faculty: allowed
 *     - Reviewer (faculty with is_reviewer: true): allowed
 *     - Student: FORBIDDEN (HTTP 403) even for own generated cases
 *     - Inactive/Pending account: FORBIDDEN (HTTP 403)
 *     - Unauthenticated: FORBIDDEN (HTTP 401)
 *  2. hasPaidEntitlement(user, item):
 *     - Returns false by default as payment extension point
 *  3. Server Export & Download Routes Enforcement:
 *     - /api/cases/[id]/export/pdf returns 403 for student, 200 for faculty
 *     - /api/cases/[id]/export/docx returns 403 for student, 200 for faculty
 *     - /api/repository/download returns 403 for student, 200 for admin
 *  4. Denied attempts are inscribed in the institutional audit ledger (action: "download_denied")
 *  5. Submission, review, and learning workflows operate independently of downloads
 */

import { canDownload, hasPaidEntitlement } from "../src/lib/access-control";
import { mockStore } from "../src/lib/mock-db";
import { Profile, CaseStudy } from "../src/lib/types";
import { createSessionToken, AUTH_COOKIE_NAME } from "../src/lib/session";
import { NextRequest } from "next/server";
import { GET as getPdfExport } from "../src/app/api/cases/[id]/export/pdf/route";
import { GET as getDocxExport } from "../src/app/api/cases/[id]/export/docx/route";
import { GET as getRepoDownload } from "../src/app/api/repository/download/route";

let passed = 0;
let failed = 0;

function assert(condition: boolean, message: string) {
  if (condition) {
    console.log(`  ✅ PASS: ${message}`);
    passed++;
  } else {
    console.error(`  ❌ FAIL: ${message}`);
    failed++;
  }
}

async function runStep3Tests() {
  mockStore.seedTestFixtures();
  console.log("================================================================");
  console.log("🧪 STEP 3 TEST SUITE: No Downloads for Students Without Payment");
  console.log("================================================================\n");

  const testCase = mockStore.getCases().find((c) => c.status === "approved") || mockStore.getCases()[0];
  const testStudent = mockStore.getProfile("usr-student-1")!;
  const testFaculty = mockStore.getProfile("usr-faculty-1")!;
  const testReviewer = mockStore.getProfile("usr-faculty-2")!;
  const testAdmin = mockStore.getProfile("usr-admin-1")!;

  // --------------------------------------------------------------------------
  // TEST 1: canDownload Function Policy Enforcement
  // --------------------------------------------------------------------------
  console.log("TEST 1: canDownload Policy Gatekeeper");

  // Admin download check
  const adminCheck = canDownload(testAdmin, testCase);
  assert(adminCheck.allowed === true && adminCheck.status === 200, "Admin is permitted to download cases");

  // Faculty download check
  const facultyCheck = canDownload(testFaculty, testCase);
  assert(facultyCheck.allowed === true && facultyCheck.status === 200, "Faculty is permitted to download cases");

  // Reviewer download check
  const reviewerCheck = canDownload(testReviewer, testCase);
  assert(reviewerCheck.allowed === true && reviewerCheck.status === 200, "Faculty reviewer is permitted to download cases");

  // Student download check
  const studentCheck = canDownload(testStudent, testCase);
  assert(studentCheck.allowed === false, "Student is strictly denied case download");
  assert(studentCheck.status === 403, "Student check returns status: 403");
  assert(studentCheck.isPaidRequired === true, "Student check flags isPaidRequired: true");
  assert(
    Boolean(studentCheck.reason?.includes("Download will be available after purchase")),
    `Provides clear deterrent message: "${studentCheck.reason}"`
  );

  // Student authoring own case still cannot download without payment
  const studentAuthoredCase: CaseStudy = {
    ...testCase,
    id: "case-student-authored-1",
    author_id: testStudent.id,
  };
  const studentAuthorCheck = canDownload(testStudent, studentAuthoredCase);
  assert(studentAuthorCheck.allowed === false, "Student author CANNOT download their own case without payment");
  assert(studentAuthorCheck.status === 403, "Student author check returns HTTP 403");

  // Unauthenticated check
  const unauthCheck = canDownload(null, testCase);
  assert(unauthCheck.allowed === false && unauthCheck.status === 401, "Unauthenticated request returns HTTP 401");

  // Inactive user check
  const inactiveUser: Partial<Profile> = {
    id: "usr-inactive-test",
    email: "inactive@shantibschool.edu.in",
    role: "faculty",
    access_status: "inactive",
  };
  const inactiveCheck = canDownload(inactiveUser, testCase);
  assert(inactiveCheck.allowed === false && inactiveCheck.status === 403, "Inactive account is denied download");

  // --------------------------------------------------------------------------
  // TEST 2: hasPaidEntitlement Extension Point
  // --------------------------------------------------------------------------
  console.log("\nTEST 2: hasPaidEntitlement Extension Point");
  assert(hasPaidEntitlement(testStudent, testCase) === false, "hasPaidEntitlement returns false by default");
  assert(process.env.PAYMENTS_ENABLED !== "true", "PAYMENTS_ENABLED is false by default");

  // --------------------------------------------------------------------------
  // TEST 3: Server API Route Enforcement
  // --------------------------------------------------------------------------
  console.log("\nTEST 3: Server Export & Download API Route Enforcement");

  // Create real session tokens
  const studentToken = await createSessionToken(testStudent.id);
  const facultyToken = await createSessionToken(testFaculty.id);
  const adminToken = await createSessionToken(testAdmin.id);

  // A. PDF Export Route: Student -> 403 Forbidden
  const studentPdfReq = new NextRequest(`http://localhost:3000/api/cases/${testCase.id}/export/pdf`, {
    headers: { cookie: `${AUTH_COOKIE_NAME}=${studentToken}` },
  });
  const studentPdfRes = await getPdfExport(studentPdfReq, { params: Promise.resolve({ id: testCase.id }) });
  assert(studentPdfRes.status === 403, `PDF export returns HTTP 403 for student (received: ${studentPdfRes.status})`);
  const studentPdfBody = await studentPdfRes.json();
  assert(studentPdfBody.error_code === "DOWNLOAD_FORBIDDEN", "PDF export returns error_code: DOWNLOAD_FORBIDDEN");

  // B. DOCX Export Route: Student -> 403 Forbidden
  const studentDocxReq = new NextRequest(`http://localhost:3000/api/cases/${testCase.id}/export/docx`, {
    headers: { cookie: `${AUTH_COOKIE_NAME}=${studentToken}` },
  });
  const studentDocxRes = await getDocxExport(studentDocxReq, { params: Promise.resolve({ id: testCase.id }) });
  assert(studentDocxRes.status === 403, `DOCX export returns HTTP 403 for student (received: ${studentDocxRes.status})`);
  const studentDocxBody = await studentDocxRes.json();
  assert(studentDocxBody.error_code === "DOWNLOAD_FORBIDDEN", "DOCX export returns error_code: DOWNLOAD_FORBIDDEN");

  // C. Repository Download Route: Student -> 403 Forbidden
  const studentRepoReq = new NextRequest(`http://localhost:3000/api/repository/download?caseId=${testCase.id}&kind=pdf`, {
    headers: { cookie: `${AUTH_COOKIE_NAME}=${studentToken}` },
  });
  const studentRepoRes = await getRepoDownload(studentRepoReq);
  assert(studentRepoRes.status === 403, `Repository download returns HTTP 403 for student (received: ${studentRepoRes.status})`);

  // D. PDF Export Route: Faculty -> 200 OK
  const facultyPdfReq = new NextRequest(`http://localhost:3000/api/cases/${testCase.id}/export/pdf`, {
    headers: { cookie: `${AUTH_COOKIE_NAME}=${facultyToken}` },
  });
  const facultyPdfRes = await getPdfExport(facultyPdfReq, { params: Promise.resolve({ id: testCase.id }) });
  assert(facultyPdfRes.status === 200, `PDF export returns HTTP 200 for faculty (received: ${facultyPdfRes.status})`);

  // E. DOCX Export Route: Faculty -> 200 OK
  const facultyDocxReq = new NextRequest(`http://localhost:3000/api/cases/${testCase.id}/export/docx`, {
    headers: { cookie: `${AUTH_COOKIE_NAME}=${facultyToken}` },
  });
  const facultyDocxRes = await getDocxExport(facultyDocxReq, { params: Promise.resolve({ id: testCase.id }) });
  assert(facultyDocxRes.status === 200, `DOCX export returns HTTP 200 for faculty (received: ${facultyDocxRes.status})`);

  // F. Repository Download Route: Admin -> 307 Redirect to export generator (authorized)
  const adminRepoReq = new NextRequest(`http://localhost:3000/api/repository/download?caseId=${testCase.id}&kind=pdf`, {
    headers: { cookie: `${AUTH_COOKIE_NAME}=${adminToken}` },
  });
  const adminRepoRes = await getRepoDownload(adminRepoReq);
  assert(
    adminRepoRes.status === 307 || adminRepoRes.status === 200,
    `Repository download permits admin (received redirect: ${adminRepoRes.status})`
  );

  // --------------------------------------------------------------------------
  // TEST 4: Audit Ledger Telemetry for Denied Download Attempts
  // --------------------------------------------------------------------------
  console.log("\nTEST 4: Audit Ledger Denied Download Records");
  const auditLogs = mockStore.getAuditLogs();
  const deniedPdfLogs = auditLogs.filter(
    (l) => l.action === "download_denied" && l.actor_id === testStudent.id
  );

  assert(deniedPdfLogs.length >= 2, `Audit ledger records denied attempts (found ${deniedPdfLogs.length} entries)`);
  assert(deniedPdfLogs[0]?.action === "download_denied", "Audit action is explicitly 'download_denied'");
  assert(deniedPdfLogs[0]?.actor_email === testStudent.email, `Actor email matches student: ${testStudent.email}`);

  // --------------------------------------------------------------------------
  // TEST 5: Academic Workflows Operate Without Download Dependency
  // --------------------------------------------------------------------------
  console.log("\nTEST 5: Academic Workflows Independent of Downloads");
  // Verify student can create, edit, and submit cases without downloads
  const studentPractice = mockStore.saveCase({
    id: `case-workflow-test-${Date.now()}`,
    author_id: testStudent.id,
    author_name: testStudent.name,
    title: "Student On-Screen Practice Case",
    status: "draft",
    type: "ce_pack",
    format: "hypothetical",
    industry: "IT & Software",
    function: "IT",
    level: "MBA / PGDM",
    complexity: 5,
    language: "en",
    student_practice: true,
    content: {
      title: "Student On-Screen Practice Case",
      summary: "Case summary for practice.",
      background: "Case background.",
      challenge: "Strategic challenge.",
      key_data: [],
      decision_point: "Select path forward.",
      exhibits: [],
      discussion_questions: [{ id: "q1", question: "Evaluate strategy." } as any],
    },
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  });

  assert(Boolean(studentPractice.id), "Student can author and save drafts on screen");

  // Student submits for review
  const submitted = mockStore.submitForApproval(studentPractice.id);
  assert(submitted?.status === "in_review", "Student can submit case for review without download requirement");

  // Reviewer approves
  const approved = mockStore.approveCase(studentPractice.id, testReviewer.id);
  assert(approved?.status === "approved", "Reviewer can approve case without student having download access");

  console.log("\n================================================================");
  console.log(`🎉 ALL STEP 3 TESTS COMPLETE: ${passed} passed, ${failed} failed`);
  console.log("================================================================\n");

  if (failed > 0) process.exit(1);
}

runStep3Tests().catch((err) => {
  console.error("Test execution failed:", err);
  process.exit(1);
});
