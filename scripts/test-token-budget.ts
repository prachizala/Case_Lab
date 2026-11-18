/**
 * TEST SUITE: Institutional Token Budget & Groq Usage Tracking
 * Verifies:
 *  1. Groq Usage Tracking & Schema Recording
 *  2. Summary Math: 0%, 79%, 80%, 95%, 100%, >100% threshold states
 *  3. Breakdown Grouping: by model, feature, and user
 *  4. Enforcement: Blocking at 100% with BudgetExhaustedError & admin override
 *  5. Role & Permission Gating: Non-admin vs Admin visibility
 *  6. Safe Groq Wrapper: simulated/mocked response parsing and token counting
 */

import {
  recordTokenUsage,
  getTokenBudgetSummary,
  getTokenBudgetBreakdown,
  resetTokenUsageForTest,
  seedTokenUsageForTest,
} from "../src/lib/groq/tracking";
import {
  checkBudgetBeforeExecution,
  BudgetExhaustedError,
} from "../src/lib/groq/enforcement";
import { executeGroqChat } from "../src/lib/groq/client";
import { TokenBudgetSummarySchema } from "../src/lib/groq/types";

let passed = 0;
let failed = 0;

function assert(condition: boolean, message: string) {
  if (condition) {
    console.log(`  âœ… PASS: ${message}`);
    passed++;
  } else {
    console.error(`  âŒ FAIL: ${message}`);
    failed++;
  }
}

async function runTests() {
  console.log("================================================================");
  console.log("TEST SUITE: Institutional Token Budget & Groq Usage Engine");
  console.log("================================================================\n");

  // --------------------------------------------------------------------------
  // TEST 1: Groq Token Recording & Accumulation
  // --------------------------------------------------------------------------
  console.log("TEST 1: Groq Token Recording & DB / Store Accumulation");
  resetTokenUsageForTest();

  recordTokenUsage({
    userId: "usr-faculty-1",
    feature: "case_generation",
    model: "llama-3.3-70b-versatile",
    promptTokens: 1200,
    completionTokens: 800,
    totalTokens: 2000,
  });

  recordTokenUsage({
    userId: "usr-student-1",
    feature: "casepack_feedback",
    model: "llama-3.1-8b-instant",
    promptTokens: 400,
    completionTokens: 100,
    totalTokens: 500,
  });

  const initialSummary = getTokenBudgetSummary();
  assert(initialSummary.used === 2500, `Recorded 2,500 total tokens (got ${initialSummary.used})`);
  assert(initialSummary.limit === 500000, `Default limit is 500,000 (got ${initialSummary.limit})`);
  assert(initialSummary.remaining === 497500, `Remaining is 497,500 (got ${initialSummary.remaining})`);
  assert(initialSummary.percent === 0 || initialSummary.percent === 1, `Percent is ~0-1% (got ${initialSummary.percent}%)`);
  assert(initialSummary.status === "normal", `Status is normal under 80% (got ${initialSummary.status})`);

  // Validate Zod Schema conformity
  const parsed = TokenBudgetSummarySchema.safeParse(initialSummary);
  assert(parsed.success, "Summary matches Pydantic/Zod strict contract");

  // --------------------------------------------------------------------------
  // TEST 2: Threshold Math (0%, 79%, 80%, 95%, 100%, 120%)
  // --------------------------------------------------------------------------
  console.log("\nTEST 2: Threshold Calculations (0%, 79%, 80%, 95%, 100%, >100%)");

  // 0%
  resetTokenUsageForTest();
  let s = getTokenBudgetSummary();
  assert(s.percent === 0 && s.status === "normal", `0% usage -> status 'normal' (${s.status}, ${s.percent}%)`);

  // 79% (395,000 / 500,000)
  seedTokenUsageForTest(395000);
  s = getTokenBudgetSummary();
  assert(s.percent === 79 && s.status === "normal", `79% usage -> status 'normal' (${s.status}, ${s.percent}%)`);

  // 80% (400,000 / 500,000) -> Warning threshold
  seedTokenUsageForTest(400000);
  s = getTokenBudgetSummary();
  assert(s.percent === 80 && s.status === "warning", `80% usage -> status 'warning' (${s.status}, ${s.percent}%)`);

  // 84% (420,000 / 500,000) -> Exact BANNER SPEC match
  seedTokenUsageForTest(420000);
  s = getTokenBudgetSummary();
  assert(s.percent === 84 && s.status === "warning", `84% usage -> status 'warning' (spec match: 420,000 used, 80,000 remaining)`);
  assert(s.remaining === 80000, `Exact remaining 80,000 tokens (got ${s.remaining})`);

  // 95% (475,000 / 500,000) -> Critical threshold
  seedTokenUsageForTest(475000);
  s = getTokenBudgetSummary();
  assert(s.percent === 95 && s.status === "critical", `95% usage -> status 'critical' (${s.status}, ${s.percent}%)`);

  // 100% (500,000 / 500,000) -> Exhausted threshold
  seedTokenUsageForTest(500000);
  s = getTokenBudgetSummary();
  assert(s.percent === 100 && s.status === "exhausted", `100% usage -> status 'exhausted' (${s.status}, ${s.percent}%)`);
  assert(s.remaining === 0, `Remaining is 0 tokens at 100%`);

  // 110% (550,000 / 500,000) -> Over 100%
  seedTokenUsageForTest(550000);
  s = getTokenBudgetSummary();
  assert(s.percent === 110 && s.status === "exhausted", `110% usage -> status 'exhausted' (${s.status}, ${s.percent}%)`);
  assert(s.remaining === 0, `Remaining stays clamped at 0 for >100%`);

  // --------------------------------------------------------------------------
  // TEST 3: Breakdown Grouping (by Model, Feature, and User)
  // --------------------------------------------------------------------------
  console.log("\nTEST 3: Token Breakdown Grouping (Model, Feature, User)");
  resetTokenUsageForTest();
  recordTokenUsage({
    userId: "usr-faculty-1",
    feature: "case_generation",
    model: "llama-3.3-70b-versatile",
    promptTokens: 10000,
    completionTokens: 5000,
    totalTokens: 15000,
  });
  recordTokenUsage({
    userId: "usr-faculty-2",
    feature: "case_generation",
    model: "llama-3.3-70b-versatile",
    promptTokens: 5000,
    completionTokens: 5000,
    totalTokens: 10000,
  });
  recordTokenUsage({
    userId: "usr-student-1",
    feature: "casepack_feedback",
    model: "llama-3.1-8b-instant",
    promptTokens: 2000,
    completionTokens: 1000,
    totalTokens: 3000,
  });

  // Admin breakdown (includes user metrics)
  const adminBreakdown = getTokenBudgetBreakdown(true);
  assert(adminBreakdown.by_model.length === 2, `Grouped into 2 models`);
  assert(adminBreakdown.by_feature.length === 2, `Grouped into 2 features`);
  assert(adminBreakdown.by_user !== undefined && adminBreakdown.by_user.length > 0, `Admin sees user-level breakdown`);

  const topModel = adminBreakdown.by_model.find((m) => m.model === "llama-3.3-70b-versatile");
  assert(topModel?.tokens === 25000, `Model llama-3.3-70b-versatile accumulated 25,000 tokens (got ${topModel?.tokens})`);

  // Non-admin breakdown (redacts user metrics)
  const nonAdminBreakdown = getTokenBudgetBreakdown(false);
  assert(nonAdminBreakdown.by_user === undefined, `Non-admin cannot see user-level breakdown (privacy preserved)`);

  // --------------------------------------------------------------------------
  // TEST 4: Enforcement & 100% Budget Blocking
  // --------------------------------------------------------------------------
  console.log("\nTEST 4: Enforcement & Budget Blocking (HTTP 429 Safety)");

  // At 84% (under 100%) -> Allowed
  seedTokenUsageForTest(420000);
  const check84 = checkBudgetBeforeExecution();
  assert(check84.allowed === true, `Budget check at 84% allows call to proceed`);

  // At 100% (500,000) -> Blocked
  seedTokenUsageForTest(500000);
  let blockedDirect = false;
  try {
    checkBudgetBeforeExecution();
  } catch (err) {
    if (err instanceof BudgetExhaustedError) {
      blockedDirect = true;
      assert(err.statusCode === 429, `Returns HTTP 429 status (got ${err.statusCode})`);
      assert(err.code === "BUDGET_EXHAUSTED", `Returns code BUDGET_EXHAUSTED`);
    }
  }
  assert(blockedDirect === true, `Budget check at 100% throws BudgetExhaustedError`);

  // Admin override flag allows bypassing block
  const adminCheck100 = checkBudgetBeforeExecution(true);
  assert(adminCheck100.allowed === true, `Admin override flag allows execution even at 100%`);

  // --------------------------------------------------------------------------
  // TEST 5: Groq Client Execution Wrapper with Mocking
  // --------------------------------------------------------------------------
  console.log("\nTEST 5: Groq Wrapper Token Counting (Mock SDK Response)");
  resetTokenUsageForTest();

  // Execute chat through wrapper (mocked when GROQ_API_KEY is unset in test env)
  const mockResult = await executeGroqChat(
    [{ role: "user", content: "Generate a case on Tata Motors" }],
    "llama-3.3-70b-versatile",
    { feature: "case_generation", userId: "usr-faculty-1" }
  );

  assert(mockResult.text.length > 0, `Groq wrapper returned valid content`);
  assert(mockResult.total_tokens > 0, `Groq wrapper extracted usage tokens (${mockResult.total_tokens})`);

  const summaryAfterExec = getTokenBudgetSummary();
  assert(summaryAfterExec.used === mockResult.total_tokens, `Tokens recorded automatically after call (${summaryAfterExec.used})`);

  // Test budget exhausted exception when trying to call above limit
  seedTokenUsageForTest(500000);
  let blocked = false;
  try {
    await executeGroqChat(
      [{ role: "user", content: "Test when exhausted" }],
      "llama-3.3-70b-versatile",
      { feature: "case_generation" }
    );
  } catch (err) {
    if (err instanceof BudgetExhaustedError) {
      blocked = true;
      assert(err.statusCode === 429, `BudgetExhaustedError has 429 status code`);
      assert(err.code === "BUDGET_EXHAUSTED", `BudgetExhaustedError has BUDGET_EXHAUSTED code`);
    }
  }
  assert(blocked === true, `executeGroqChat throws BudgetExhaustedError at 100% budget`);

  // Reset to default 84% seed for demo parity
  seedTokenUsageForTest(420000);

  console.log("\n================================================================");
  console.log(`TEST RUN COMPLETE: ${passed} passed, ${failed} failed`);
  console.log("================================================================\n");

  if (failed > 0) {
    process.exit(1);
  }
}

runTests().catch((err) => {
  console.error("Test execution failed:", err);
  process.exit(1);
});
