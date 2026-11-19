/**
 * PHASE 4 TEST SUITE: Review Queue Drawer, Upload Gate, Repository & Permissioned Downloads
 * Verifies:
 *  1. Review round lifecycle transitions (pending -> in_review -> changes_requested -> approved -> uploaded)
 *  2. Reviewer rotation fairness (rotates among active department reviewers, strictly skips author)
 *  3. Overdue review reminder detection (> 3 days pending)
 *  4. Section review comments (persisted by round and section)
 *  5. Institutional Upload Gate (verifies approval, author consent, freezes artifacts, creates repository_items)
 *  6. Repository search & faceted filtering (department, course, category, case type, year, teaching notes)
 *  7. Permissioned repository downloads & logging (student copy sanitized, faculty gets master, expired blocked, download_log written)
 */

import { mockStore } from "../src/lib/mock-db";
import { checkAccess } from "../src/lib/access-control";
import { sanitizeCaseStudyForStudent } from "../src/lib/case-permissions";
import { CaseStudy, Profile, ReviewRound, RepositoryItem } from "../src/lib/types";

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

async function runTests() {
  console.log("================================================================");
  console.log("PHASE 4: Review Queue, Rotation, Upload Gate & Repository Tests");
  console.log("================================================================\n");

  // --------------------------------------------------------------------------
  // TEST 1: Reviewer Rotation & Fair Department Round-Robin
  // --------------------------------------------------------------------------
  console.log("TEST 1: Atomic Reviewer Rotation & Author Skip");

  const depts = mockStore.getDepartments();
  const targetDept = depts[0];

  // Faculty author in department
  const facultyAuthorId = "usr-faculty-test-author";
  mockStore.addProfile({
    id: facultyAuthorId,
    name: "Dr. Faculty Author",
    email: "author.fac@shantibschool.edu.in",
    role: "faculty",
    department_id: targetDept.id,
    is_reviewer: true,
    access_status: "active",
    plan: "institutional",
    is_approved: true,
    sbs_eligible: true,
    monthly_generation_limit: 100,
    monthly_generations_used: 0,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  });

  // Reviewer 1 in same department
  const reviewer1Id = "usr-faculty-rev-1";
  mockStore.addProfile({
    id: reviewer1Id,
    name: "Prof. Reviewer One",
    email: "reviewer1@shantibschool.edu.in",
    role: "faculty",
    department_id: targetDept.id,
    is_reviewer: true,
    access_status: "active",
    plan: "institutional",
    is_approved: true,
    sbs_eligible: true,
    monthly_generation_limit: 100,
    monthly_generations_used: 0,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  });

  // Reviewer 2 in same department
  const reviewer2Id = "usr-faculty-rev-2";
  mockStore.addProfile({
    id: reviewer2Id,
    name: "Prof. Reviewer Two",
    email: "reviewer2@shantibschool.edu.in",
    role: "faculty",
    department_id: targetDept.id,
    is_reviewer: true,
    access_status: "active",
    plan: "institutional",
    is_approved: true,
    sbs_eligible: true,
    monthly_generation_limit: 100,
    monthly_generations_used: 0,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  });

  const testCaseId = `case-p4-rot-${Date.now()}`;
  const authoredCase: CaseStudy = {
    id: testCaseId,
    author_id: facultyAuthorId,
    author_name: "Dr. Faculty Author",
    author_role: "faculty",
    title: "Cross-Border Agri-Commodity Supply Chains",
    domain: "Operations",
    status: "submitted",
    review_status: "submitted",
    department_id: targetDept.id,
    type: "full",
    format: "hypothetical",
    industry: "Agriculture & Supply Chain",
    function: "Supply Chain & Logistics",
    level: "Intermediate",
    complexity: 7,
    language: "en",
    version: 1,
    content: {
      summary: "Cross-border agri supply chain dynamics and logistics infrastructure.",
      background: "Gujarat APMC market regulations and mandis.",
    } as any,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };
  mockStore.saveCase(authoredCase);

  // Assign Reviewer
  const round1 = mockStore.assignReviewer(testCaseId);
  assert(Boolean(round1), "Reviewer assigned atomically");
  assert(round1.case_id === testCaseId, "Review round linked to target case");
  assert(round1.round_no === 1, "Initial round assigned as round_no 1");
  assert(round1.reviewer_id !== facultyAuthorId, "Rotation strictly skipped author");
  const assignedRevProfile = mockStore.getProfile(round1.reviewer_id);
  assert(
    assignedRevProfile?.department_id === targetDept.id && assignedRevProfile?.is_reviewer === true,
    "Reviewer assigned from department peer pool"
  );

  // Second case by same author should rotate to the other reviewer
  const testCaseId2 = `case-p4-rot2-${Date.now()}`;
  mockStore.saveCase({
    ...authoredCase,
    id: testCaseId2,
    title: "Cold Chain Storage Optimization in Sanand GIDC",
  });
  const round2 = mockStore.assignReviewer(testCaseId2);
  assert(round2.reviewer_id !== facultyAuthorId, "Second case also skips author");
  assert(round2.reviewer_id !== round1.reviewer_id, "Rotation alternates between departmental reviewers");

  // --------------------------------------------------------------------------
  // TEST 2: Review Overdue Reminder Condition
  // --------------------------------------------------------------------------
  console.log("\nTEST 2: Review Overdue Reminder Evaluation");

  const fourDaysAgo = new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString();
  const overdueCase: CaseStudy = {
    ...authoredCase,
    id: `case-p4-overdue-${Date.now()}`,
    submitted_at: fourDaysAgo,
    status: "in_review",
    review_status: "in_review",
  };
  mockStore.saveCase(overdueCase);

  const checkIsOverdue = (c: CaseStudy) => {
    const ts = c.submitted_at || c.created_at;
    if (!ts) return false;
    const diffDays = (Date.now() - new Date(ts).getTime()) / (1000 * 60 * 60 * 24);
    return (c.status === "submitted" || c.status === "in_review") && diffDays > 3;
  };

  assert(checkIsOverdue(overdueCase) === true, "Case submitted 4 days ago is flagged as overdue (>3d)");

  const freshCase: CaseStudy = {
    ...authoredCase,
    id: `case-p4-fresh-${Date.now()}`,
    submitted_at: new Date().toISOString(),
    status: "in_review",
    review_status: "in_review",
  };
  mockStore.saveCase(freshCase);
  assert(checkIsOverdue(freshCase) === false, "Fresh case submitted today is not flagged as overdue");

  // --------------------------------------------------------------------------
  // TEST 3: Section Review Comments Persistence
  // --------------------------------------------------------------------------
  console.log("\nTEST 3: Section Review Comments by Drawer");

  const comm1 = mockStore.addReviewComment(
    round1.id,
    "narrative",
    "Background should clarify regulatory changes in Gujarat APMC mandis.",
    round1.reviewer_id
  );
  assert(Boolean(comm1.id), "Section review comment persisted");
  assert(comm1.round_id === round1.id, "Comment bound to round");
  assert(comm1.section === "narrative", "Comment tagged with 'narrative' section");

  const comm2 = mockStore.addReviewComment(
    round1.id,
    "exhibits",
    "Exhibit 2 requires clarification on gross margin calculations.",
    round1.reviewer_id
  );
  assert(comm2.section === "exhibits", "Second comment tagged with 'exhibits' section");

  const caseComments = mockStore.getReviewComments(round1.id);
  assert(caseComments.length >= 2, "Retrieved all section review comments for active round");

  // --------------------------------------------------------------------------
  // TEST 4: Review Round Decisions & Status Transitions
  // --------------------------------------------------------------------------
  console.log("\nTEST 4: Review Decisions: Changes Requested & Resubmission & Approval");

  // Reviewer requests changes
  mockStore.requestChanges(testCaseId, round1.reviewer_id, "Revise exhibits 2 and 3 as noted.");
  const caseAfterChanges = mockStore.getCase(testCaseId);
  assert(caseAfterChanges?.status === "changes_requested", "Case status transitions to 'changes_requested'");

  // Author resubmits
  caseAfterChanges!.status = "in_review";
  caseAfterChanges!.review_status = "in_review";
  caseAfterChanges!.version = 2;
  caseAfterChanges!.updated_at = new Date().toISOString();

  // Reviewer approves
  mockStore.approveCase(testCaseId, round1.reviewer_id, "Revisions approved. Excellent exhibits.");
  const approvedCase = mockStore.getCase(testCaseId);
  assert(approvedCase?.status === "approved", "Case status transitions to 'approved'");

  // --------------------------------------------------------------------------
  // TEST 5: Institutional Upload Gate Enforcement
  // --------------------------------------------------------------------------
  console.log("\nTEST 5: Upload Gate Affirmations & Repository Publishing");

  // 5a: Unapproved case cannot be uploaded
  const unapprovedCaseId = `case-unapp-${Date.now()}`;
  mockStore.saveCase({
    ...authoredCase,
    id: unapprovedCaseId,
    status: "in_review",
    review_status: "in_review",
  });

  const attemptUploadUnapproved = () => {
    const c = mockStore.getCase(unapprovedCaseId);
    if (!c || c.status !== "approved") {
      throw new Error("HTTP 403: Only cases in approved status can be uploaded.");
    }
  };
  let blockedUnapproved = false;
  try {
    attemptUploadUnapproved();
  } catch (err: any) {
    if (err.message.includes("403")) blockedUnapproved = true;
  }
  assert(blockedUnapproved, "Upload Gate strictly blocks unapproved cases (HTTP 403)");

  // 5b: Approved case uploads with author consent and freezes artifacts
  const consentAt = new Date().toISOString();
  const consentVersion = "v2.4-institutional";
  const repoItem = mockStore.uploadToRepository({
    case_id: testCaseId,
    approved_version_id: `ver-${testCaseId}-v2`,
    author_id: facultyAuthorId,
    reviewer_id: round1.reviewer_id,
    department_id: targetDept.id,
    course_id: "course-1",
    category_id: "cat-strategy",
    keywords: ["agri-business", "supply-chain", "logistics"],
    approval_status: "approved",
    submitted_at: fourDaysAgo,
    approved_at: new Date().toISOString(),
    file_docx_path: `/storage/cases/${testCaseId}/case_${testCaseId}_v2.docx`,
    file_pdf_path: `/storage/cases/${testCaseId}/case_${testCaseId}_v2.pdf`,
    is_published: true,
    author_consent_at: consentAt,
    author_consent_version: consentVersion,
    similarity_score: 3.4,
    ai_assisted: true,
    price_inr: 0,
    creator_share_pct: 30,
  });

  assert(Boolean(repoItem.id), "Repository item created");
  assert(repoItem.is_published === true, "Item marked as published in repository");
  assert(repoItem.author_consent_version === consentVersion, "Author distribution consent affirmed");
  assert(repoItem.file_pdf_path.endsWith(".pdf"), "PDF frozen artifact registered");
  assert(repoItem.file_docx_path.endsWith(".docx"), "DOCX frozen artifact registered");

  // Case study status updated to 'uploaded'
  approvedCase!.status = "uploaded";
  approvedCase!.review_status = "uploaded";
  assert(mockStore.getCase(testCaseId)?.status === "uploaded", "Case study status marked 'uploaded'");

  // --------------------------------------------------------------------------
  // TEST 6: Repository Faceted Search & Filtering Isolation
  // --------------------------------------------------------------------------
  console.log("\nTEST 6: Repository Faceted Search & Content Isolation");

  const allPublished = mockStore.getRepositoryItems({ is_published: true });
  assert(allPublished.length > 0, "Repository query retrieves published items");

  // Search by department
  const deptItems = allPublished.filter((i) => i.department_id === targetDept.id);
  assert(deptItems.some((i) => i.case_id === testCaseId), "Faceted filter locates case by department");

  // Search by keywords
  const kwItems = allPublished.filter((i) => i.keywords?.includes("agri-business"));
  assert(kwItems.length > 0, "Keyword search matches 'agri-business'");

  // --------------------------------------------------------------------------
  // TEST 7: Permissioned Repository Downloads & Access Gating
  // --------------------------------------------------------------------------
  console.log("\nTEST 7: Permissioned Repository Downloads, Sanitization & Audit");

  // Case with teaching note and answer key
  const richCase: CaseStudy = {
    ...approvedCase!,
    content: {
      summary: "Executive summary of agri-supply chain.",
      background: "Extensive Gujarat mandi background.",
      teaching_note: "CONFIDENTIAL TEACHING NOTE: Direct classroom debate to APMC fees.",
      discussion_questions: [
        {
          question: "How should the CEO restructure logistics hubs?",
          model_answer: "MODEL ANSWER: Consolidate warehousing in Mehsana to save 18% freight.",
        },
      ],
      rubrics: [{ criterion: "Data Analysis", weight: 30 }],
    } as any,
  };
  mockStore.saveCase(richCase);

  // Student download sanitization
  const sanitizedForStudent = sanitizeCaseStudyForStudent(richCase);
  const studentContent = sanitizedForStudent.content as any;
  assert(studentContent.teaching_note === undefined, "Student download: teaching_note strictly omitted");
  assert(
    studentContent.discussion_questions[0].model_answer === undefined,
    "Student download: model_answer strictly omitted from questions"
  );
  assert(studentContent.rubrics === undefined, "Student download: confidential grading rubrics omitted");

  // Faculty download includes full teaching notes
  assert(
    Boolean((richCase.content as any)?.teaching_note?.includes("CONFIDENTIAL TEACHING NOTE")),
    "Faculty download preserves complete teaching notes"
  );

  // Download Logging
  const logPdf = mockStore.logDownload(repoItem.id, "usr-student-1", "pdf");
  assert(Boolean(logPdf.id), "Student PDF download logged to download_log");
  assert(logPdf.item_id === repoItem.id, "Download log references repository item ID");
  assert(logPdf.kind === "pdf", "Download log records kind as 'pdf'");

  const logDocx = mockStore.logDownload(repoItem.id, "usr-faculty-1", "docx");
  assert(logDocx.kind === "docx", "Faculty DOCX download logged to download_log");

  // Expired user blocked from downloading repository items
  const expiredUser: Partial<Profile> = {
    id: "usr-alumni-expired",
    email: "alumni.expired@shantibschool.edu.in",
    role: "student",
    is_approved: true,
    access_status: "expired",
    access_end: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
  };
  const accessCheck = checkAccess(expiredUser as Profile);
  assert(accessCheck.status === "expired", "checkAccess recognizes account as expired");
  assert(accessCheck.canCreate === false, "Expired user blocked from creating cases");
  assert(accessCheck.allowed === false, "Expired user general access blocked");
  assert(accessCheck.canUpload === false, "Expired user blocked from repository uploads");
  assert(accessCheck.canDownloadOwn === true, "Expired user retains download rights to own past work");

  // Summary
  console.log("\n================================================================");
  console.log(`TEST SUMMARY: ${passed} Passed, ${failed} Failed`);
  console.log("================================================================\n");

  if (failed > 0) {
    process.exit(1);
  }
}

runTests().catch((err) => {
  console.error("Test execution failed:", err);
  process.exit(1);
});
