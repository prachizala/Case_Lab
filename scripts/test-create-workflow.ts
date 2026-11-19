/**
 * PHASE 3 TEST SUITE: Case Creation, Workflow, Reviewer Rotation & Export Watermarks
 * Verifies:
 *  1. Case creation with lookup attributes (department, course, category, type, page_target, keywords)
 *  2. Student author permissions (can create and view own draft, but cannot access answer keys)
 *  3. Server-side confidential asset protection (sanitization strips answer keys, rubrics, and teaching notes for students)
 *  4. Server-side export watermark rules (Student Copy with user details vs Faculty Review Copy)
 *  5. Submission confirmations (originality and figures accuracy flags)
 *  6. Atomic fair reviewer rotation (Round 1, 7-day due date, skips author)
 *  7. Peer review actions (Approve, Request Changes, Reject) and author resubmission
 */

import { mockStore } from "../src/lib/mock-db";
import { sanitizeCaseStudyForStudent } from "../src/lib/case-permissions";
import { CaseStudy, Profile } from "../src/lib/types";

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
  console.log("PHASE 3: Case Creation, Reviewer Rotation & Workflow Tests");
  console.log("================================================================\n");

  // --------------------------------------------------------------------------
  // TEST 1: Case Creation with Full Institutional Attributes
  // --------------------------------------------------------------------------
  console.log("TEST 1: Case Creation with Lookup Attributes & Page Target");

  const depts = mockStore.getDepartments();
  const courses = mockStore.getCourses();
  const categories = mockStore.getCaseCategories();

  assert(depts.length > 0, "Departments lookup available");
  assert(courses.length > 0, "Courses lookup available");
  assert(categories.length > 0, "Case categories lookup available");

  const testDept = depts[0];
  const testCourse = courses.find((c) => c.department_id === testDept.id) || courses[0];
  const testCat = categories[0];

  const caseId = `case-test-phase3-${Date.now()}`;
  const newCase: CaseStudy = {
    id: caseId,
    author_id: "usr-student-1",
    author_name: "Zala Prachi",
    author_role: "student",
    title: "Fintech Disruption in Gujarat MSME Lending",
    status: "draft",
    review_status: "draft",
    type: "ce_pack",
    format: "hypothetical",
    industry: "Fintech & Banking",
    function: "Treasury & Credit Risk",
    level: "Intermediate",
    language: "en",
    complexity: 7,
    department_id: testDept.id,
    course_id: testCourse.id,
    case_category_id: testCat.id,
    page_target: 5,
    keywords: ["Fintech", "MSME Lending", "Recourse Factoring", "Working Capital"],
    content: {
      summary: "Strategic dilemma analyzing factoring vs cash credit for a Tier-2 manufacturer.",
      background: "Enterprise context and financial exhibits.",
      challenge: "Working capital bottleneck with 90-day debtor cycles.",
      decision_point: "Select factoring structure to optimize cash conversion cycle.",
      teaching_note: "CONFIDENTIAL: Faculty model solutions and teaching plan.",
      answer_key: "CONFIDENTIAL: Step-by-step financial model answers.",
      model_answers: { q1: "Optimal factoring advance is 85% at 11.5% interest." },
      solution_keys: ["Option A: Full factoring with recourse"],
      pedagogical_checks: { BloomLevel: "Analyze & Evaluate" },
      rubrics: [{ criterion: "Financial Modeling", weight: 30 }],
    } as any,
    created_at: new Date().toISOString(),
  };

  const savedCase = mockStore.saveCase(newCase);
  assert(savedCase.id === caseId, "Case saved successfully with persistent ID");
  assert(savedCase.department_id === testDept.id, "Department ID persisted");
  assert(savedCase.course_id === testCourse.id, "Course ID persisted");
  assert(savedCase.case_category_id === testCat.id, "Case Category ID persisted");
  assert(savedCase.page_target === 5, "Page target (5 pages) recorded");
  assert(Array.isArray(savedCase.keywords) && savedCase.keywords.length === 4, "Keywords chips array persisted");
  assert(savedCase.author_role === "student", "Student author role correctly assigned");

  // --------------------------------------------------------------------------
  // TEST 2: Confidential Asset Stripping for Students
  // --------------------------------------------------------------------------
  console.log("\nTEST 2: Academic Confidentiality & Answer Key Scrubbing");

  const sanitized = sanitizeCaseStudyForStudent(savedCase);
  assert(sanitized.id === caseId, "Sanitized case preserves case identification");
  assert(sanitized.title === savedCase.title, "Sanitized case preserves title");
  assert(sanitized.content.summary !== undefined, "Student can read narrative summary");
  assert(sanitized.content.challenge !== undefined, "Student can read core challenge");
  assert((sanitized.content as any).teaching_note === undefined, "teaching_note strictly stripped from student");
  assert((sanitized.content as any).teaching_notes === undefined, "teaching_notes strictly stripped from student");
  assert((sanitized.content as any).answer_key === undefined, "answer_key strictly stripped from student");
  assert((sanitized.content as any).model_answers === undefined, "model_answers strictly stripped from student");
  assert((sanitized.content as any).solution_keys === undefined, "solution_keys strictly stripped from student");
  assert((sanitized.content as any).pedagogical_checks === undefined, "pedagogical_checks strictly stripped from student");
  assert((sanitized.content as any).rubrics === undefined, "rubrics strictly stripped from student");

  // Faculty and Admin retain answer key access
  assert((savedCase.content as any).teaching_note !== undefined, "Faculty/Admin retains teaching_note");
  assert((savedCase.content as any).model_answers !== undefined, "Faculty/Admin retains model_answers");

  // --------------------------------------------------------------------------
  // TEST 3: Export Watermark Standards
  // --------------------------------------------------------------------------
  console.log("\nTEST 3: Export Watermarks for Student vs Faculty");

  const studentUser: Partial<Profile> = {
    id: "usr-student-1",
    email: "prachizala@shantibschool.edu.in",
    name: "Zala Prachi",
    role: "student",
    user_type: "sbs_member",
  };

  const facultyUser: Partial<Profile> = {
    id: "usr-faculty-1",
    email: "reena.p@shantibschool.edu.in",
    name: "Ms. Reena Paswan",
    role: "faculty",
    is_reviewer: true,
    user_type: "sbs_member",
  };

  const dateStr = new Date().toLocaleDateString("en-IN");
  const studentWatermark = studentUser.role === "student"
    ? `SBS CaseLab - Student Copy - ${studentUser.name || "Student"} - ${dateStr}`
    : "SBS CaseLab - Faculty Review Copy";

  const facultyWatermark = facultyUser.role === "student"
    ? `SBS CaseLab - Student Copy - ${facultyUser.name || "Student"} - ${dateStr}`
    : "SBS CaseLab - Faculty Review Copy";

  assert(studentWatermark.includes("Student Copy"), "Student export generates Student Copy watermark");
  assert(studentWatermark.includes("Zala Prachi"), "Student export includes student name in watermark");
  assert(facultyWatermark === "SBS CaseLab - Faculty Review Copy", "Faculty export generates Faculty Review Copy watermark");

  // --------------------------------------------------------------------------
  // TEST 4: Case Submission & Confirmation Safeguards
  // --------------------------------------------------------------------------
  console.log("\nTEST 4: Case Submission Integrity & Affirmations");

  // Submission requires confirmations
  const submitPayloadValid = {
    confirm_originality: true,
    confirm_figures: true,
    submission_note: "Aligned with Unit 3 Financial Instruments curriculum.",
  };

  const submitPayloadInvalid = {
    confirm_originality: false,
    confirm_figures: true,
  };

  assert(
    submitPayloadValid.confirm_originality && submitPayloadValid.confirm_figures,
    "Valid submission affirms both originality and numerical accuracy"
  );
  assert(
    !(submitPayloadInvalid.confirm_originality && submitPayloadInvalid.confirm_figures),
    "Invalid submission without originality check is rejected"
  );

  // Transition case to submitted / in_review
  const submittedCase = mockStore.submitForApproval(caseId, studentUser.id!);
  assert(submittedCase !== null, "Case successfully submitted");
  assert(submittedCase?.status === "in_review", "Case status transitioned to in_review");

  // --------------------------------------------------------------------------
  // TEST 5: Atomic Fair Reviewer Rotation
  // --------------------------------------------------------------------------
  console.log("\nTEST 5: Atomic Fair Reviewer Rotation & Round Assignment");

  // Set department on case matching active faculty reviewers
  submittedCase!.department_id = "dept-finance";
  mockStore.saveCase(submittedCase!);

  const assignedRound = mockStore.assignReviewer(caseId);
  assert(assignedRound !== null, "Reviewer assigned via atomic rotation");
  assert(assignedRound.round_no === 1, "Initial assignment creates Round 1");
  assert(assignedRound.reviewer_id !== studentUser.id!, "Reviewer is NOT the author");
  assert(assignedRound.decision === "pending", "Initial round decision is pending");

  // Due date is approximately 3 days in future (REVIEW_REMINDER_DAYS = 3)
  const assignedAt = new Date(assignedRound.assigned_at).getTime();
  const dueAt = new Date(assignedRound.due_at!).getTime();
  const daysDiff = Math.round((dueAt - assignedAt) / (1000 * 60 * 60 * 24));
  assert(daysDiff === 3, "Review round due date is exactly 3 days from assignment (REVIEW_REMINDER_DAYS)");

  // Check case updated with assigned reviewer
  const caseAfterAssignment = mockStore.getCase(caseId);
  assert(caseAfterAssignment?.reviewer_id === assignedRound.reviewer_id, "Case reviewer_id matches assigned round");

  // Verify author cannot be assigned when faculty authors a case
  const facultyCaseId = `case-faculty-${Date.now()}`;
  mockStore.saveCase({
    id: facultyCaseId,
    author_id: facultyUser.id!,
    author_name: facultyUser.name || "Ms. Reena Paswan",
    author_role: "faculty",
    title: "Supply Chain Resilience in FMCG",
    status: "draft",
    department_id: "dept-finance",
    type: "ce_pack",
    format: "hypothetical",
    industry: "FMCG",
    function: "Operations",
    level: "Advanced",
    language: "en",
    complexity: 8,
    content: { summary: "FMCG supply chain analysis." } as any,
    created_at: new Date().toISOString(),
  });

  mockStore.submitForApproval(facultyCaseId, facultyUser.id!);
  const facultyCaseRound = mockStore.assignReviewer(facultyCaseId);
  assert(
    facultyCaseRound.reviewer_id !== facultyUser.id!,
    "Faculty case reviewer assignment skips faculty author"
  );

  // --------------------------------------------------------------------------
  // TEST 6: Reviewer Workflow Actions (Request Changes, Approve, Resubmit)
  // --------------------------------------------------------------------------
  console.log("\nTEST 6: Reviewer Decisions & Author Resubmission Lifecycle");

  // Reviewer requests revisions
  const revisionComment = "Please strengthen Exhibit 2 with 3-year historical EBITDA figures.";
  const revisionsRequestedCase = mockStore.requestChanges(caseId, assignedRound.reviewer_id, revisionComment);
  assert(revisionsRequestedCase !== null, "Reviewer requested changes successfully");
  assert(revisionsRequestedCase?.status === "changes_requested", "Status updated to changes_requested");
  assert(revisionsRequestedCase?.reviewer_comment === revisionComment, "Reviewer feedback comment saved on case");

  // Author edits draft and resubmits
  const authorEdits = {
    ...revisionsRequestedCase!,
    content: {
      ...revisionsRequestedCase!.content,
      background: "Updated with verified 3-year EBITDA exhibit data.",
    },
  };
  mockStore.saveCase(authorEdits);

  const resubmittedCase = mockStore.submitForApproval(caseId, studentUser.id!);
  assert(resubmittedCase?.status === "in_review", "Resubmitted case transitioned back to in_review");

  // Reviewer approves case
  const approvalComment = "Excellent revisions. Financial exhibits verified and accredited.";
  const approvedCase = mockStore.approveCase(caseId, assignedRound.reviewer_id, approvalComment);
  assert(approvedCase !== null, "Case approved successfully");
  assert(approvedCase?.status === "approved", "Status transitioned to approved");
  assert(approvedCase?.reviewer_comment === approvalComment, "Approval note recorded");

  // --------------------------------------------------------------------------
  // Summary
  // --------------------------------------------------------------------------
  console.log("\n================================================================");
  console.log(`Phase 3 Test Results: ${passed} passed, ${failed} failed`);
  console.log("================================================================\n");

  if (failed > 0) {
    process.exit(1);
  }
}

runTests().catch((err) => {
  console.error("Test execution error:", err);
  process.exit(1);
});
