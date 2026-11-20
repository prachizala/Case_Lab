/**
 * STEP 2 TEST SUITE: Free Student Case Generation & Academic Confidentiality
 *
 * Verifies:
 *  1. Student generation access enabled by default (no student gating)
 *  2. Default student generation limit is 0 (unlimited per-user generation)
 *  3. Student can generate cases in all 8 domains (Finance, Marketing, HR, IT, Supply Chain, Strategy, Analytics, Operations)
 *  4. Loop of 30 student generations completes without hitting any limit
 *  5. Token usage is logged with student role
 *  6. Institutional token budget warning triggers at >= 80%
 *  7. Student payloads strictly contain NO answer key, teaching notes, or checks
 *  8. Account access rules: expired or inactive accounts are blocked (HTTP 403)
 */

import { DOMAINS, DomainName } from "../src/config/domains";
import { generateCECasePack } from "../src/lib/casepack/generate";
import {
  checkCaseGenerationAccess,
  checkStudentDailyLimit,
  getStudentDailyGenerationLimit,
  isStudentCaseGenerationEnabled,
  sanitizeCasePackForStudent,
  sanitizeCaseStudyForStudent,
} from "../src/lib/case-permissions";
import { checkAccess } from "../src/lib/access-control";
import { mockStore } from "../src/lib/mock-db";
import { recordGenerationUsage } from "../src/lib/rate-limit";
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

async function runStep2Tests() {
  console.log("================================================================");
  console.log("🧪 STEP 2 TEST SUITE: Students Can Generate Freely");
  console.log("================================================================\n");

  const procEnv = process.env as Record<string, string | undefined>;
  delete procEnv.STUDENT_CASE_GENERATION;
  delete procEnv.STUDENT_GENERATION_LIMIT;

  // --------------------------------------------------------------------------
  // TEST 1: Role Permissions & Default Unlimited Setting
  // --------------------------------------------------------------------------
  console.log("TEST 1: Role Access & Unlimited Student Default");
  assert(isStudentCaseGenerationEnabled() === true, "Student case generation is enabled by default");
  assert(getStudentDailyGenerationLimit() === 0, "Student generation limit defaults to 0 (unlimited)");

  const studentRoleAccess = checkCaseGenerationAccess("student");
  assert(studentRoleAccess.allowed === true, "Students have case generation access");

  const facultyRoleAccess = checkCaseGenerationAccess("faculty");
  assert(facultyRoleAccess.allowed === true, "Faculty have case generation access");

  const adminRoleAccess = checkCaseGenerationAccess("admin");
  assert(adminRoleAccess.allowed === true, "Admin has case generation access");

  // --------------------------------------------------------------------------
  // TEST 2: Student Can Generate Across All 8 Canonical Domains
  // --------------------------------------------------------------------------
  console.log("\nTEST 2: Student Generation in All 8 Business Domains");
  for (const domain of DOMAINS) {
    const firstUnit = domain.units[0];
    const testTopic = firstUnit?.topics[0] || "Foundations";

    const { casePack, checks } = await generateCECasePack({
      department: domain.id,
      topics: [testTopic],
      level: "MBA / PGDM",
    });

    assert(Boolean(casePack?.case?.title), `[${domain.name}] Generated case title: "${casePack.case.title.substring(0, 45)}..."`);
    assert(casePack.case.sections.length >= 2, `[${domain.name}] Contains >= 2 case sections`);
    assert(casePack.questions.length >= 1, `[${domain.name}] Contains discussion questions`);

    // Verify sanitization for this domain
    const safePack = sanitizeCasePackForStudent(casePack);
    assert(safePack.answers.length === 0, `[${domain.name}] Model answers strictly stripped`);
    assert(!safePack.teaching_notes?.marking_scheme?.length, `[${domain.name}] Marking scheme strictly stripped`);
  }

  // --------------------------------------------------------------------------
  // TEST 3: Loop of 30 Generations for Student User (Zero Limit Hits)
  // --------------------------------------------------------------------------
  console.log("\nTEST 3: Loop of 30 Student Generations (Unlimited Stress Test)");
  const loopStudentId = `usr-stress-student-${Date.now()}`;
  let loopPassedCount = 0;

  for (let i = 1; i <= 30; i++) {
    const dailyCheck = checkStudentDailyLimit(loopStudentId);
    if (!dailyCheck.allowed) {
      assert(false, `Generation ${i} unexpectedly blocked by daily rate limiter`);
      break;
    }

    const testCaseId = `case-loop-${loopStudentId}-${i}`;
    await recordGenerationUsage(loopStudentId, 1200, "claude-3-7-sonnet", testCaseId, "student");
    loopPassedCount++;
  }

  assert(loopPassedCount === 30, `Successfully completed all 30 consecutive student generations without hitting any limit`);

  // --------------------------------------------------------------------------
  // TEST 4: Token Usage Logging with Student Role
  // --------------------------------------------------------------------------
  console.log("\nTEST 4: Token Usage Telemetry & Role Logging");
  const studentLogs = mockStore.getUsageLogs().filter((l) => l.user_id === loopStudentId);
  assert(studentLogs.length === 30, `Exactly 30 usage records logged in persistent store`);
  const allLoggedAsStudent = studentLogs.every((l) => l.user_role === "student");
  assert(allLoggedAsStudent, `All 30 usage records explicitly record user_role: "student"`);
  const totalTokensLogged = studentLogs.reduce((acc, l) => acc + l.tokens_used, 0);
  assert(totalTokensLogged === 30 * 1200, `Token accounting matches: ${totalTokensLogged} tokens tracked`);

  // --------------------------------------------------------------------------
  // TEST 5: Institutional Monthly Token Budget & 80% Warning Telemetry
  // --------------------------------------------------------------------------
  console.log("\nTEST 5: Institutional Monthly Budget Warning Telemetry");
  const initialBudget = mockStore.getTokenBudgetInfo();
  assert(initialBudget.tokens_used_this_month > 0, `Student generations accumulate in college-wide monthly token count`);

  // Temporarily set a tight budget to verify the >= 80% warning threshold triggers
  const previousBudgetTokens = initialBudget.monthly_budget_tokens;
  mockStore.setMonthlyTokenBudget(Math.round(initialBudget.tokens_used_this_month / 0.85));
  const warningBudget = mockStore.getTokenBudgetInfo();

  assert(warningBudget.usage_percentage >= 80, `Utilization rate reaches >= 80% (${warningBudget.usage_percentage}%)`);
  assert(warningBudget.is_warning_threshold === true, `is_warning_threshold telemetry flag is ACTIVE for admin`);
  assert(warningBudget.warning === true, `Admin warning alert is ACTIVE`);

  // Restore previous budget
  mockStore.setMonthlyTokenBudget(previousBudgetTokens);

  // --------------------------------------------------------------------------
  // TEST 6: Student Payload Strictly Withholds Answers, Notes & Checks
  // --------------------------------------------------------------------------
  console.log("\nTEST 6: Complete Answer Key & Teaching Note Withholding");
  const confidentialCase: CaseStudy = {
    id: "case-confidential-test",
    author_id: loopStudentId,
    title: "Student Authored Practice Dilemma",
    status: "draft",
    type: "full",
    format: "hypothetical",
    industry: "IT & Software",
    function: "IT",
    level: "MBA / PGDM",
    complexity: 6,
    language: "en",
    content: {
      title: "Student Authored Practice Dilemma",
      summary: "ERP implementation dilemma at Titan Enterprise.",
      background: "Enterprise architecture transition.",
      challenge: "Cloud migration latency.",
      key_data: [{ metric: "Migration Cost", value: "10 Cr" }],
      decision_point: "Select hybrid or public cloud.",
      exhibits: [],
      discussion_questions: [
        {
          id: "q1",
          question: "Evaluate total cost of ownership (TCO) across 5 years.",
          suggested_answer: "CONFIDENTIAL MODEL ANSWER: TCO is 14.5 Cr under hybrid.",
        } as any,
      ],
      teaching_note: {
        objectives: ["Evaluate cloud economics"],
        class_flow: [{ phase: "Intro", duration_minutes: 15, activity: "Class debate" }],
        frameworks: [{ name: "TCO Analysis", application: "Cloud vs on-prem", key_takeaway: "Capex vs Opex" }],
      } as any,
      teaching_notes: { synopsis: "CONFIDENTIAL SYNOPSIS FOR FACULTY" } as any,
      answer_key: { key: "CONFIDENTIAL ANSWER KEY" } as any,
      answers: [{ answer: "CONFIDENTIAL ANSWER" }] as any,
      model_answers: { q1: "CONFIDENTIAL MODEL ANSWER" } as any,
      solution_keys: { s1: "CONFIDENTIAL SOLUTION KEY" } as any,
      pedagogical_checks: { valid: true, secret_metric: 42 } as any,
      rubrics: [{ criterion: "Accuracy", max_marks: 20 }] as any,
    } as any,
    created_at: new Date().toISOString(),
  };

  const studentSafe = sanitizeCaseStudyForStudent(confidentialCase);
  const jsonString = JSON.stringify(studentSafe);

  assert(!jsonString.includes("CONFIDENTIAL MODEL ANSWER"), "Model answer text does not exist in student payload");
  assert(!jsonString.includes("CONFIDENTIAL SYNOPSIS"), "Teaching note synopsis does not exist in student payload");
  assert(!jsonString.includes("CONFIDENTIAL ANSWER KEY"), "Answer key does not exist in student payload");
  assert(!jsonString.includes("CONFIDENTIAL SOLUTION KEY"), "Solution key does not exist in student payload");
  assert(!jsonString.includes("secret_metric"), "Pedagogical checks secret metrics do not exist in student payload");
  assert((studentSafe.content as any).teaching_note === undefined, "content.teaching_note is undefined");
  assert((studentSafe.content as any).teaching_notes === undefined, "content.teaching_notes is undefined");
  assert((studentSafe.content as any).answer_key === undefined, "content.answer_key is undefined");
  assert((studentSafe.content as any).pedagogical_checks === undefined, "content.pedagogical_checks is undefined");
  assert((studentSafe.content as any).discussion_questions[0].suggested_answer === undefined, "Question suggested_answer is stripped");
  assert(studentSafe.student_practice === true, "CaseStudy is explicitly tagged student_practice: true");

  // --------------------------------------------------------------------------
  // TEST 7: Account Access Rules (Expired & Inactive Cannot Generate)
  // --------------------------------------------------------------------------
  console.log("\nTEST 7: Account Status Governance (Expired & Inactive Barred)");
  const activeStudent: Partial<Profile> = {
    id: "usr-active-student",
    email: "student.active@shantibschool.edu.in",
    role: "student",
    access_status: "active",
    is_approved: true,
  };
  const activeCheck = checkAccess(activeStudent);
  assert(activeCheck.allowed === true && activeCheck.canCreate === true, "Active student account can generate cases");

  const expiredStudent: Partial<Profile> = {
    id: "usr-expired-student",
    email: "student.expired@shantibschool.edu.in",
    role: "student",
    access_status: "expired",
    access_end: "2024-01-01T00:00:00.000Z",
    is_approved: true,
  };
  const expiredCheck = checkAccess(expiredStudent);
  assert(expiredCheck.allowed === false && expiredCheck.canCreate === false, "Expired student account CANNOT generate cases (canCreate = false)");
  assert(expiredCheck.status === "expired", "Returns status: 'expired'");

  const inactiveStudent: Partial<Profile> = {
    id: "usr-inactive-student",
    email: "student.inactive@shantibschool.edu.in",
    role: "student",
    access_status: "inactive",
    is_approved: true,
  };
  const inactiveCheck = checkAccess(inactiveStudent);
  assert(inactiveCheck.allowed === false && inactiveCheck.canCreate === false, "Inactive student account CANNOT generate cases (canCreate = false)");
  assert(inactiveCheck.status === "inactive", "Returns status: 'inactive'");

  console.log("\n================================================================");
  console.log(`🎉 ALL STEP 2 TESTS COMPLETE: ${passed} passed, ${failed} failed`);
  console.log("================================================================\n");

  if (failed > 0) process.exit(1);
}

runStep2Tests().catch((err) => {
  console.error("Test execution failed:", err);
  process.exit(1);
});
