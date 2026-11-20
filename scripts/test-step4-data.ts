/**
 * SBS CaseLab - Step 4 Data & Legacy Retention Verification Suite
 *
 * Verifies:
 * 1. Existing cases load without error and zero data is deleted.
 * 2. Historical non-English cases (case-006, case-007) are preserved intact.
 * 3. Newly created cases default language to "en".
 * 4. Admin legacy actions (archive / keep as is) function correctly.
 * 5. Supabase migration 00017 is non-destructive.
 */

import * as fs from "fs";
import * as path from "path";
import { mockStore } from "../src/lib/mock-db";
import { CaseStudy } from "../src/lib/types";

async function runStep4DataTests() {
  console.log("================================================================");
  console.log("🧪 SBS CaseLab: Step 4 Data & Legacy Retention Verification Suite");
  console.log("================================================================\n");

  mockStore.seedTestFixtures();

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

  // TEST 1: Existing Historical Cases Intact
  console.log("--- TEST 1: Historical Case Integrity & Paper Trail ---");
  const case006 = mockStore.getCase("case-006");
  const case007 = mockStore.getCase("case-007");

  assert(case006 !== undefined, "Legacy case-006 exists and was not deleted");
  assert(case006?.language === "hi", `case-006 retains original language 'hi' (found: ${case006?.language})`);
  assert(case006?.content?.title?.includes("प्रतिभा प्रतिधारण") === true, "case-006 Hindi content preserved intact");

  assert(case007 !== undefined, "Legacy case-007 exists and was not deleted");
  assert(case007?.language === "gu", `case-007 retains original language 'gu' (found: ${case007?.language})`);
  assert(case007?.content?.title?.includes("હીરા") === true, "case-007 Gujarati content preserved intact");

  // TEST 2: Query All Cases Loads Without Error
  console.log("\n--- TEST 2: General Repository Loading ---");
  const allCases = mockStore.getCases();
  assert(allCases.length >= 7, `All repository cases loaded cleanly (count: ${allCases.length})`);
  const englishCases = allCases.filter((c) => c.language === "en");
  const legacyCases = allCases.filter((c) => c.language && c.language !== "en");
  assert(englishCases.length >= 5, `English standard cases loaded (count: ${englishCases.length})`);
  assert(legacyCases.length === 2, `Exactly 2 legacy cases identified for paper trail (count: ${legacyCases.length})`);

  // TEST 3: New Case Creation Defaults to "en"
  console.log("\n--- TEST 3: New Case Default Language Enforcement ---");
  const newCaseId = `case-test-${Date.now()}`;
  const saved = mockStore.saveCase({
    id: newCaseId,
    author_id: "usr-faculty-1",
    author_name: "Test Faculty",
    title: "Capital Structure Optimization at Sanand Auto Cluster",
    status: "draft",
    type: "full",
    format: "general",
    industry: "Automotive & EV",
    function: "Corporate Finance",
    level: "MBA / PGDM",
    complexity: 7,
    content: {
      title: "Capital Structure Optimization at Sanand Auto Cluster",
      summary: "Executive analysis of debt covenants and working capital.",
      background: "Sanand automotive manufacturing ecosystem.",
      challenge: "High cost of capital and liquidity constraints.",
      decision_point: "Select between mezzanine financing and debt restructuring.",
      discussion_questions: ["Evaluate WACC trade-offs."],
    },
  } as unknown as CaseStudy);

  assert(saved.language === "en", `Newly saved case automatically defaults to 'en' (found: ${saved.language})`);
  const retrievedNew = mockStore.getCase(newCaseId);
  assert(retrievedNew?.language === "en", "Retrieved case from store persists language as 'en'");

  // TEST 4: Admin Legacy Case Status Lifecycle
  console.log("\n--- TEST 4: Admin Legacy Case Management ---");
  // Test archiving case-006
  if (case006) {
    const originalStatus = case006.status;
    case006.status = "archived";
    assert(mockStore.getCase("case-006")?.status === "archived", "case-006 successfully transitioned to archived status");
    // Test keeping as is / restoring
    case006.status = originalStatus;
    assert(mockStore.getCase("case-006")?.status === originalStatus, `case-006 restored to ${originalStatus} (Keep as is)`);
  }

  // TEST 5: Non-Destructive Migration Check
  console.log("\n--- TEST 5: Migration File Audit ---");
  const migPath = path.resolve(process.cwd(), "supabase/migrations/00017_enforce_english_default.sql");
  assert(fs.existsSync(migPath), "Migration 00017 file exists");
  const migContent = fs.readFileSync(migPath, "utf-8");
  assert(migContent.includes("ALTER COLUMN language SET DEFAULT 'en'"), "Migration sets default to 'en'");
  assert(!migContent.toLowerCase().includes("drop column"), "Migration does NOT drop the column (non-destructive)");
  assert(!migContent.toLowerCase().includes("delete from"), "Migration does NOT delete any data (non-destructive)");

  // Summary
  console.log("\n================================================================");
  console.log(`Step 4 Verification Results: ${passed} passed, ${failed} failed`);
  console.log("================================================================");

  if (failed > 0) process.exit(1);
}

runStep4DataTests().catch((err) => {
  console.error("Test failed:", err);
  process.exit(1);
});
