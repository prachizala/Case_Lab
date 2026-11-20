/**
 * STEP 3 TEST SUITE: Role-Based Case Generation & Student Practice Access
 * Verifies:
 *  1. Faculty & Admin can generate full cases (with answers, teaching notes, checks)
 *  2. Student with STUDENT_CASE_GENERATION=false (default) gets 403
 *  3. Student with STUDENT_CASE_GENERATION=true can generate practice cases
 *  4. Student practice case has Model Answer Key, Teaching Notes & Checks stripped on server
 *  5. Case is marked student_practice: true and never published to library without review
 *  6. Student daily generation rate limit (STUDENT_GENERATION_LIMIT=3) blocks 4th request
 *  7. Usage is recorded in usage logs with student role and counts against institutional token budget
 */

import { mockStore } from "../src/lib/mock-db";
import { Profile, CaseStudy } from "../src/lib/types";
import {
  checkCaseGenerationAccess,
  checkStudentDailyLimit,
  isStudentCaseGenerationEnabled,
  getStudentDailyGenerationLimit,
  sanitizeCasePackForStudent,
  sanitizeCaseStudyForStudent,
} from "../src/lib/case-permissions";
import { CECasePack } from "../src/lib/casepack/schema";

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

async function runStudentAccessTests() {
  console.log("================================================================");
  console.log("TEST SUITE: Role Design & Student Case Generation (STEP 3)");
  console.log("================================================================\n");

  const procEnv = process.env as Record<string, string | undefined>;

  // --------------------------------------------------------------------------
  // TEST 1: Default Environment (STUDENT_CASE_GENERATION default = true)
  // --------------------------------------------------------------------------
  console.log("TEST 1: Default Role Permissions (Free Student Generation Enabled by Default)");
  delete procEnv.STUDENT_CASE_GENERATION;

  assert(isStudentCaseGenerationEnabled() === true, `Default state is enabled (true)`);

  const facultyAccess = checkCaseGenerationAccess("faculty");
  assert(facultyAccess.allowed === true, `Faculty is allowed to generate cases`);

  const adminAccess = checkCaseGenerationAccess("admin");
  assert(adminAccess.allowed === true, `Admin is allowed to generate cases`);

  const studentAccessDefault = checkCaseGenerationAccess("student");
  assert(studentAccessDefault.allowed === true, `Student is allowed to generate cases freely by default (allowed = true)`);

  // --------------------------------------------------------------------------
  // TEST 2: Configurable Flag (STUDENT_CASE_GENERATION=false)
  // --------------------------------------------------------------------------
  console.log("\nTEST 2: Configurable Flag (STUDENT_CASE_GENERATION=false)");
  procEnv.STUDENT_CASE_GENERATION = "false";

  assert(isStudentCaseGenerationEnabled() === false, `Flag "false" correctly disables student generation`);

  const studentAccessDisabled = checkCaseGenerationAccess("student");
  assert(studentAccessDisabled.allowed === false, `Student access blocked when flag is set to false`);
  assert(studentAccessDisabled.status === 403, `Returns HTTP 403 status`);

  // Restore to default true for remainder of suite
  procEnv.STUDENT_CASE_GENERATION = "true";

  // --------------------------------------------------------------------------
  // TEST 3: Server-Side Stripping of Answers, Teaching Notes & Checks
  // --------------------------------------------------------------------------
  console.log("\nTEST 3: Confidential Asset Stripping (Answers, Teaching Notes & Checks)");

  // Sample full CE Case Pack with confidential answers and teaching notes
  const mockFullPack: CECasePack = {
    status: "draft",
    meta: {
      department: "finance",
      subject: "Corporate Finance",
      topic: ["Capital Budgeting"],
      concepts: ["NPV", "IRR"],
      level: "MBA / PGDM",
      language: "en",
      industry: "Manufacturing",
      geography: "Gujarat, India",
      length: "standard",
      max_marks: 40,
    },
    case: {
      title: "Financing Solar Expansion at SunTech Ltd.",
      sections: [
        { heading: "Executive Summary", paragraphs: ["SunTech evaluates rooftop solar capex."] },
        { heading: "Financial Dilemma", paragraphs: ["Management compares debt vs equity."] },
      ],
      data_tables: [
        {
          title: "Cash Flows",
          columns: ["Year", "Cash Flow"],
          rows: [
            ["0", -500],
            ["1", 200],
          ],
        },
      ],
      word_count: 1200,
    },
    questions: [
      {
        id: "q1",
        bloom_verb: "Evaluate",
        text: "Evaluate the viability using NPV criteria.",
        concepts: ["NPV"],
        marks: 20,
      },
    ],
    answers: [
      {
        question_id: "q1",
        introduction: "CONFIDENTIAL MODEL ANSWER: Calculate discount rate at 12%.",
        sections: [{ heading: "Analytical Breakdown", points: ["Point 1: NPV is +25L."] }],
        conclusion: "Recommendation: Approve capital allocation.",
        word_count: 350,
      },
    ],
    teaching_notes: {
      synopsis: "CONFIDENTIAL FACULTY SYNOPSIS: Intended pedagogy and trick nuances.",
      objectives: ["Understand capital allocation"],
      teaching_approach: "80-minute case discussion board plan",
      frameworks: ["DCF Analysis"],
      common_mistakes: ["Using book value debt weight instead of market value"],
      marking_scheme: [{ criterion: "NPV Formula Accuracy", marks: 10 }],
    },
    quality: {
      facts_to_verify: ["Verify 12% hurdle rate from Exhibit 1"],
      illustrative_figures: ["Figure 1.1"],
    },
  };

  const studentSafePack = sanitizeCasePackForStudent(mockFullPack);

  assert(studentSafePack.answers.length === 0, `Model answers array is strictly empty on server`);
  assert(
    !JSON.stringify(studentSafePack.answers).includes("CONFIDENTIAL MODEL ANSWER"),
    `Confidential model answer text does not appear in sanitized payload`
  );
  assert(
    !studentSafePack.teaching_notes.synopsis.includes("CONFIDENTIAL FACULTY SYNOPSIS"),
    `Confidential teaching notes synopsis is stripped`
  );
  assert(
    studentSafePack.teaching_notes.marking_scheme.length === 0,
    `Confidential marking scheme is stripped`
  );
  assert(studentSafePack.quality.facts_to_verify.length === 0, `Checks/facts to verify are stripped`);

  // Verify CaseStudy stripping
  const mockCaseStudy: CaseStudy = {
    id: "case-student-test-1",
    author_id: "usr-student-test",
    title: "Student Practice Simulation",
    status: "draft",
    type: "ce_pack",
    format: "hypothetical",
    industry: "Manufacturing",
    function: "FINANCE",
    level: "MBA / PGDM",
    complexity: 6,
    language: "en",
    content: {
      title: "Student Practice Simulation",
      summary: "Practice case",
      background: "SunTech evaluates rooftop solar capex in Ahmedabad.",
      challenge: "Funding decision",
      key_data: [{ metric: "Capex", value: "50 Cr" }],
      decision_point: "Select capital structure",
      exhibits: [],
      discussion_questions: [
        {
          id: "q1",
          question: "Calculate WACC",
          suggested_answer: "CONFIDENTIAL ANSWER: 11.4%",
        } as any,
      ],
      teaching_note: {
        pedagogical_objectives: ["WACC calculation"],
        discussion_plan: "Plan",
        analysis: "CONFIDENTIAL ANALYSIS",
      } as any,
    },
    created_at: new Date().toISOString(),
  };

  const sanitizedCase = sanitizeCaseStudyForStudent(mockCaseStudy);
  assert(sanitizedCase.student_practice === true, `CaseStudy is explicitly tagged student_practice: true`);
  assert(sanitizedCase.status === "draft", `CaseStudy status is draft`);
  assert(
    (sanitizedCase.content as any).teaching_note === undefined,
    `content.teaching_note is stripped from student payload`
  );
  assert(
    (sanitizedCase.content as any).discussion_questions[0].suggested_answer === undefined,
    `suggested_answer is stripped from discussion questions`
  );

  // --------------------------------------------------------------------------
  // TEST 4: Student Practice Case Isolation in Library
  // --------------------------------------------------------------------------
  console.log("\nTEST 4: Student Practice Case Isolation in Library");
  mockStore.saveCase(sanitizedCase);

  const libraryCasesForOtherStudents = mockStore.getCasesForUser("usr-student-2", "student");
  const foundOther = libraryCasesForOtherStudents.find((c) => c.id === sanitizedCase.id);
  assert(foundOther === undefined, `Student practice case is NOT visible in public library to other students`);

  // --------------------------------------------------------------------------
  // TEST 5: Student Daily Rate Limiting (Default 0 = Unlimited, Configurable Cap)
  // --------------------------------------------------------------------------
  console.log("\nTEST 5: Student Daily Rate Limiting (Default 0 = Unlimited, Configurable Cap)");
  delete procEnv.STUDENT_GENERATION_LIMIT;
  assert(getStudentDailyGenerationLimit() === 0, `Default student generation limit is 0 (unlimited)`);
  const unlimitedCheck = checkStudentDailyLimit("student-unlimited-test");
  assert(unlimitedCheck.allowed === true, `When limit is 0, checkStudentDailyLimit returns allowed: true`);

  procEnv.STUDENT_GENERATION_LIMIT = "3";
  assert(getStudentDailyGenerationLimit() === 3, `Configured student daily limit is 3`);

  const studentTestId = `usr-test-student-${Date.now()}`;
  // Ensure fresh usage
  mockStore.clearHourlyUsage(studentTestId);

  // Request 1: Allowed
  const limit1 = checkStudentDailyLimit(studentTestId);
  assert(limit1.allowed === true, `Request 1 allowed (used: ${limit1.count}/${limit1.limit})`);
  mockStore.logUsage(studentTestId, 1500, "claude-3-7-sonnet", undefined, "student");

  // Request 2: Allowed
  const limit2 = checkStudentDailyLimit(studentTestId);
  assert(limit2.allowed === true, `Request 2 allowed (used: ${limit2.count}/${limit2.limit})`);
  mockStore.logUsage(studentTestId, 1500, "claude-3-7-sonnet", undefined, "student");

  // Request 3: Allowed
  const limit3 = checkStudentDailyLimit(studentTestId);
  assert(limit3.allowed === true, `Request 3 allowed (used: ${limit3.count}/${limit3.limit})`);
  mockStore.logUsage(studentTestId, 1500, "claude-3-7-sonnet", undefined, "student");

  // Request 4: Blocked!
  const limit4 = checkStudentDailyLimit(studentTestId);
  assert(limit4.allowed === false, `4th request in 24 hours is BLOCKED (used: ${limit4.count}/${limit4.limit})`);
  assert(limit4.remaining === 0, `Remaining quota is 0`);

  // --------------------------------------------------------------------------
  // TEST 6: Usage Log Records Student Role & Counts Against Token Budget
  // --------------------------------------------------------------------------
  console.log("\nTEST 6: Usage Logging with Student Role & Institutional Budget Integration");
  const logs = mockStore.getUsageLogs();
  const studentLogs = logs.filter((l) => l.user_id === studentTestId);

  assert(studentLogs.length === 3, `3 usage logs recorded for student`);
  assert(studentLogs[0].user_role === "student", `Usage log explicitly inscribes user_role: "student"`);

  const budgetInfo = mockStore.getTokenBudgetInfo();
  assert(budgetInfo.tokens_used_this_month > 0, `Student generations count against institutional token budget`);

  console.log("\n================================================================");
  console.log(`TEST RUN COMPLETE: ${passed} passed, ${failed} failed`);
  console.log("================================================================\n");

  if (failed > 0) process.exit(1);
}

runStudentAccessTests().catch((err) => {
  console.error("Test execution failed:", err);
  process.exit(1);
});
