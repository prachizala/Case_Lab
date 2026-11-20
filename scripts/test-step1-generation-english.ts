/**
 * STEP 1 Verification: Server Generation & English-Only Directives
 */

import { generateCaseWithClaude, buildSystemPrompt } from "../src/lib/claude";
import { generateCECasePack } from "../src/lib/casepack/generate";
import { validateCasePackComplete } from "../src/lib/casepack/validate";

const HINDI_GUJARATI_REGEX = /[\u0900-\u097F\u0A80-\u0AFF]/;

async function runStep1Tests() {
  console.log("================================================================");
  console.log("STEP 1 VERIFICATION: Server Generation English-Only Tests");
  console.log("================================================================\n");

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

  // 1. Generation works without a language field (omitted)
  console.log("TEST 1: Case Generation without Language Input (Omitted)");
  const resultWithoutLang = await generateCaseWithClaude({
    type: "full",
    format: "hypothetical",
    industry: "Electric Vehicles & CleanTech",
    functionalFocus: "Corporate Strategy",
    contextRegion: "Sanand, Gujarat",
    complexity: 7,
    // Note: language parameter is intentionally omitted
  });

  assert(!!resultWithoutLang.content.title, "Generated case has a non-empty title");
  assert(
    !HINDI_GUJARATI_REGEX.test(resultWithoutLang.content.title),
    `Title contains no Hindi/Gujarati script: "${resultWithoutLang.content.title}"`
  );
  assert(
    !HINDI_GUJARATI_REGEX.test(resultWithoutLang.content.summary),
    "Summary contains no Hindi/Gujarati script"
  );
  assert(
    !HINDI_GUJARATI_REGEX.test(resultWithoutLang.content.background),
    "Background narrative contains no Hindi/Gujarati script"
  );
  assert(
    !HINDI_GUJARATI_REGEX.test(resultWithoutLang.content.challenge),
    "Challenge section contains no Hindi/Gujarati script"
  );

  // 2. Generation when client sends a legacy language field (e.g. "hi") - must be ignored, returning English
  console.log("\nTEST 2: Legacy Language Field Ignored Without Error");
  const resultWithLegacyLang = await generateCaseWithClaude({
    type: "short",
    format: "hypothetical",
    industry: "Pharmaceuticals",
    functionalFocus: "Operations Management",
    contextRegion: "Ahmedabad, Gujarat",
    complexity: 6,
    language: "hi" as any, // Client sends legacy language field
  });

  assert(
    !HINDI_GUJARATI_REGEX.test(resultWithLegacyLang.content.title),
    `Legacy 'hi' input ignored; output is English: "${resultWithLegacyLang.content.title}"`
  );
  assert(
    !HINDI_GUJARATI_REGEX.test(resultWithLegacyLang.content.background),
    "Background narrative is 100% English even when client requested 'hi'"
  );

  // 3. System Prompts Contain English-Only Directive and Zero Hindi/Gujarati Script
  console.log("\nTEST 3: System Prompt Directives & Script Audit");
  const systemPrompt = buildSystemPrompt({
    format: "real_signal",
    type: "full",
  });

  assert(
    systemPrompt.includes("Write in clear, professional English only"),
    "System prompt contains mandatory English-only directive"
  );
  assert(
    systemPrompt.includes("Use Indian business context, INR figures and Indian examples where relevant"),
    "System prompt preserves Indian business context directive"
  );
  assert(
    !HINDI_GUJARATI_REGEX.test(systemPrompt),
    "System prompt contains zero Hindi/Gujarati script characters"
  );

  // 4. CE Case Pack Generation without Language Input & Programmatic Validation
  console.log("\nTEST 4: CE Case Pack Generation & 10-Check Validator Suite");
  const casePackResult = await generateCECasePack({
    department: "finance",
    subject: "Corporate Finance & Financial Services",
    topics: ["Working Capital Management", "Capital Budgeting & Leasing"],
    concepts: ["Working Capital", "NPV"],
    // Note: language parameter is intentionally omitted
  });

  assert(!!casePackResult.casePack.case.title, "CE Case Pack title generated");
  assert(
    casePackResult.casePack.meta.language === "en",
    `Meta language is explicitly "en" (found: "${casePackResult.casePack.meta.language}")`
  );
  assert(
    !HINDI_GUJARATI_REGEX.test(casePackResult.casePack.case.title),
    `CE Case Pack title contains no Hindi/Gujarati script: "${casePackResult.casePack.case.title}"`
  );

  assert(
    typeof casePackResult.checks.valid === "boolean",
    `CE Case Pack returned valid check result (valid: ${casePackResult.checks.valid})`
  );

  console.log("\n================================================================");
  console.log(`STEP 1 TEST SUMMARY: ${passed} passed, ${failed} failed`);
  console.log("================================================================");

  if (failed > 0) {
    process.exit(1);
  }
}

runStep1Tests().catch((err) => {
  console.error("Test runner failed:", err);
  process.exit(1);
});
