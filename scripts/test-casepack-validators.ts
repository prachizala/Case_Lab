/**
 * SBS CaseLab - CE Case Pack Validator Unit Tests
 * 
 * Tests all 10 programmatic checks with passing and failing fixtures,
 * plus verifies deterministic math formulas.
 */

import * as fs from "fs";
import * as path from "path";
import {
  check1_SchemaValid,
  check2_WordCountBounds,
  check3_ConceptCoverage,
  check4_BloomAndConceptsInQuestions,
  check5_AnswerStructure,
  check6_CaseFactsDensity,
  check7_ConsistentSpelling,
  check8_NoPlaceholders,
  check9_GoldExamplesOverlap,
  check10_DepartmentSpecific,
  validateCasePackComplete,
  calculateNPV,
  calculatePayback,
  calculateWACC,
  calculateDOL,
  calculateDFL,
  calculateEOQ,
  calculateWorkingCapitalCycle,
} from "../src/lib/casepack/validate";
import { CECasePack } from "../src/lib/casepack/schema";

async function runValidatorUnitTests() {
  console.log("==============================================================");
  console.log("🧪 SBS CaseLab: CE Case Pack Validator Unit Test Suite");
  console.log("==============================================================\n");

  let allPassed = true;
  let testCount = 0;
  let passCount = 0;

  function assert(condition: boolean, desc: string) {
    testCount++;
    if (condition) {
      passCount++;
      console.log(`  ✅ PASS: ${desc}`);
    } else {
      allPassed = false;
      console.error(`  ❌ FAIL: ${desc}`);
    }
  }

  // 1. Load Gold Reference as baseline passing fixture
  const goldPath = path.join(process.cwd(), "reference", "gold", "finance_approved.json");
  let validFinancePack: CECasePack;

  try {
    const raw = fs.readFileSync(goldPath, "utf-8");
    validFinancePack = JSON.parse(raw) as CECasePack;
  } catch (err) {
    console.error("Failed to read finance_approved.json baseline:", err);
    process.exit(1);
  }

  // ---------------------------------------------------------------------------
  // TEST CHECK 1: Schema Validation
  // ---------------------------------------------------------------------------
  console.log("\n--- Check 1: Schema Validation ---");
  const chk1Pass = check1_SchemaValid(validFinancePack);
  assert(chk1Pass.passed, "Valid gold pack passes Zod schema validation");

  const chk1Fail = check1_SchemaValid({ meta: { title: "Bad Pack" } });
  assert(!chk1Fail.passed && chk1Fail.critical, "Incomplete pack fails Zod schema validation critically");

  // ---------------------------------------------------------------------------
  // TEST CHECK 2: Word Count Bounds & Question Count
  // ---------------------------------------------------------------------------
  console.log("\n--- Check 2: Word Count & Scope Bounds ---");
  const chk2Pass = check2_WordCountBounds(validFinancePack);
  assert(chk2Pass.passed, "Standard length case pack is within word count and question count bounds");

  const shortPack = JSON.parse(JSON.stringify(validFinancePack)) as CECasePack;
  shortPack.questions = [shortPack.questions[0]]; // Only 1 question (minimum 2 required)
  const chk2Fail = check2_WordCountBounds(shortPack);
  assert(!chk2Fail.passed, "Pack with only 1 question fails check 2 (expected 2-4 questions)");

  // ---------------------------------------------------------------------------
  // TEST CHECK 3: Concept Coverage
  // ---------------------------------------------------------------------------
  console.log("\n--- Check 3: Concept Presence in Case ---");
  const chk3Pass = check3_ConceptCoverage(validFinancePack);
  assert(chk3Pass.passed, "All declared syllabus concepts are present in case narrative");

  const unmentionedConceptPack = JSON.parse(JSON.stringify(validFinancePack)) as CECasePack;
  unmentionedConceptPack.meta.concepts = ["Quantum Cryptography Derivative Pricing"];
  const chk3Fail = check3_ConceptCoverage(unmentionedConceptPack);
  assert(!chk3Fail.passed, "Pack with unmentioned concept fails check 3");

  // ---------------------------------------------------------------------------
  // TEST CHECK 4: Bloom Verbs & Concept Naming in Questions
  // ---------------------------------------------------------------------------
  console.log("\n--- Check 4: Bloom Verbs & Concept Naming ---");
  const chk4Pass = check4_BloomAndConceptsInQuestions(validFinancePack);
  assert(chk4Pass.passed, "Gold questions pass Bloom verb and concept naming check");

  const badBloomPack = JSON.parse(JSON.stringify(validFinancePack)) as CECasePack;
  badBloomPack.questions[0].bloom_verb = "Chat";
  badBloomPack.questions[0].text = "Chat about what Rajesh did in the company.";
  badBloomPack.questions[0].concepts = [];
  const chk4Fail = check4_BloomAndConceptsInQuestions(badBloomPack);
  assert(!chk4Fail.passed, "Question lacking approved Bloom verb or concept fails check 4");

  // ---------------------------------------------------------------------------
  // TEST CHECK 5: Answer Architecture (Intro, >=2 sections, Compare Table)
  // ---------------------------------------------------------------------------
  console.log("\n--- Check 5: Answer Architecture & Component Structure ---");
  const chk5Pass = check5_AnswerStructure(validFinancePack);
  assert(chk5Pass.passed, "Gold pack model answers satisfy architectural requirements");

  const badAnswerPack = JSON.parse(JSON.stringify(validFinancePack)) as CECasePack;
  // Strip comparison table from compare question answer
  badAnswerPack.answers[0].comparison_table = undefined;
  const chk5Fail = check5_AnswerStructure(badAnswerPack);
  assert(!chk5Fail.passed, "Compare question lacking comparison table fails check 5");

  // ---------------------------------------------------------------------------
  // TEST CHECK 6: Case Facts Density in Answers
  // ---------------------------------------------------------------------------
  console.log("\n--- Check 6: Case Facts Density in Answers ---");
  const chk6Pass = check6_CaseFactsDensity(validFinancePack);
  assert(chk6Pass.passed, "Gold answers cite verified facts from case narrative");

  const genericAnswerPack = JSON.parse(JSON.stringify(validFinancePack)) as CECasePack;
  genericAnswerPack.answers[0].introduction = "This is a purely theoretical answer with zero numbers or specific entity names.";
  genericAnswerPack.answers[0].sections = [
    { heading: "General Theory", points: ["The instruments are different."], evaluation: ["Good"], limitation: "Bad" },
    { heading: "General Analysis", points: ["Trade is useful in commerce."], evaluation: ["Practical"], limitation: "Risky" }
  ];
  genericAnswerPack.answers[0].comparison_table = undefined;
  genericAnswerPack.answers[0].conclusion = "In conclusion, both options are financial mechanisms.";
  const chk6Fail = check6_CaseFactsDensity(genericAnswerPack);
  assert(!chk6Fail.passed, "Answer with insufficient specific case citations fails check 6");

  // ---------------------------------------------------------------------------
  // TEST CHECK 7: Terminology & Spelling Consistency
  // ---------------------------------------------------------------------------
  console.log("\n--- Check 7: Terminology & Consistent Spelling ---");
  const chk7Pass = check7_ConsistentSpelling(validFinancePack);
  assert(chk7Pass.passed, "Gold pack terminology is consistent");

  const badSpellingPack = JSON.parse(JSON.stringify(validFinancePack)) as CECasePack;
  badSpellingPack.case.sections[0].paragraphs[0] += " The company engaged in forfeiting transactions.";
  const chk7Fail = check7_ConsistentSpelling(badSpellingPack);
  assert(!chk7Fail.passed, "Erratic spelling 'forfeiting' correctly flagged by check 7");

  // ---------------------------------------------------------------------------
  // TEST CHECK 8: Absence of Placeholders
  // ---------------------------------------------------------------------------
  console.log("\n--- Check 8: Absence of Placeholders ---");
  const chk8Pass = check8_NoPlaceholders(validFinancePack);
  assert(chk8Pass.passed, "Zero placeholders in gold pack verified");

  const placeholderPack = JSON.parse(JSON.stringify(validFinancePack)) as CECasePack;
  placeholderPack.case.sections[0].paragraphs[0] += " Please contact [Company Name] for further details.";
  const chk8Fail = check8_NoPlaceholders(placeholderPack);
  assert(!chk8Fail.passed, "Placeholder token '[Company Name]' correctly caught by check 8");

  // ---------------------------------------------------------------------------
  // TEST CHECK 9: Gold Overlap Check
  // ---------------------------------------------------------------------------
  console.log("\n--- Check 9: Gold Overlap & Isolation ---");
  // For the exact gold file, it matches title so check9 skips self
  const chk9GoldSelf = check9_GoldExamplesOverlap(validFinancePack);
  assert(chk9GoldSelf.passed, "Gold example itself is not flagged as self-overlapping");

  const copiedPack = JSON.parse(JSON.stringify(validFinancePack)) as CECasePack;
  copiedPack.id = "case-gen-12345";
  copiedPack.status = "draft";
  copiedPack.case.title = "A Brand New Manufacturing Firm in Gujarat";
  // But narrative still has "Shakti Engineering"
  const chk9Fail = check9_GoldExamplesOverlap(copiedPack);
  assert(!chk9Fail.passed, "New case copying proprietary gold names ('Shakti Engineering') is caught by check 9");

  // ---------------------------------------------------------------------------
  // TEST CHECK 10: Department Specific Rules
  // ---------------------------------------------------------------------------
  console.log("\n--- Check 10: Department Specific Rules ---");
  // Finance pass
  const chk10FinPass = check10_DepartmentSpecific(validFinancePack);
  assert(chk10FinPass.passed, "Finance pack passes department checks");

  // Finance fail without tables
  const noTableFinPack = JSON.parse(JSON.stringify(validFinancePack)) as CECasePack;
  noTableFinPack.case.data_tables = [];
  const chk10FinFail = check10_DepartmentSpecific(noTableFinPack);
  assert(!chk10FinFail.passed, "Finance pack without data tables fails check 10");

  // HR Checks
  const hrPack = JSON.parse(JSON.stringify(validFinancePack)) as CECasePack;
  hrPack.meta.department = "hr";
  hrPack.case.sections[0].paragraphs[0] = "Meenakshi Sundaram was appointed Chief People Officer at AuraTek to resolve widespread talent attrition.";
  hrPack.case.data_tables = [{
    title: "Table 1: Workforce Attrition & Headcount Metrics",
    columns: ["Department", "Headcount", "Attrition Rate", "eNPS"],
    rows: [["Engineering", "120", "18.5%", "+12"], ["Sales", "80", "24.0%", "-5"]]
  }];
  hrPack.questions[0].text = "Analyze the employee engagement and stakeholder impact of the revised incentive scheme.";
  const chk10HrPass = check10_DepartmentSpecific(hrPack);
  assert(chk10HrPass.passed, "HR pack with workforce metrics, HR protagonist, and stakeholder question passes check 10");

  // HR Fail: Non-HR protagonist
  const badHrPack = JSON.parse(JSON.stringify(hrPack)) as CECasePack;
  badHrPack.case.sections[0].paragraphs[0] = "Ramesh Verma served as Chief Financial Officer dealing strictly with financial ledgers.";
  const chk10HrFail = check10_DepartmentSpecific(badHrPack);
  assert(!chk10HrFail.passed, "HR pack with non-HR protagonist fails check 10");

  // Marketing Checks
  const mktPack = JSON.parse(JSON.stringify(validFinancePack)) as CECasePack;
  mktPack.meta.department = "marketing";
  mktPack.case.data_tables = [{
    title: "Table 1: Competitive Landscape & Price Points",
    columns: ["Brand", "Market Share", "Price Point (₹)", "Distribution Channel"],
    rows: [["Brand A", "25%", "₹450", "Modern Retail"], ["Brand B", "18%", "₹380", "D2C"]]
  }];
  mktPack.questions[0].text = "Formulate a positioning strategy for the premium segment.";
  mktPack.questions[0].bloom_verb = "formulate";
  mktPack.answers[0].sections[0].points = ["For health-conscious urban professionals, NourishRoots offers 100% certified organic snacks because every ingredient is sourced from traceable farmers."];
  const chk10MktPass = check10_DepartmentSpecific(mktPack);
  assert(chk10MktPass.passed, "Marketing pack with market data and canonical positioning template passes check 10");

  // ---------------------------------------------------------------------------
  // TEST: Complete Suite Orchestration
  // ---------------------------------------------------------------------------
  console.log("\n--- Full Suite Verification ---");
  const fullReport = validateCasePackComplete(validFinancePack);
  assert(fullReport.valid, "Master validation suite passes full gold case pack (valid = true)");
  assert(fullReport.score === 100, `Gold case pack achieves 100% quality score (score: ${fullReport.score}%)`);

  // ---------------------------------------------------------------------------
  // TEST: Deterministic Financial Formulas
  // ---------------------------------------------------------------------------
  console.log("\n--- Deterministic Financial Math Formulas ---");
  // NPV: discountRate 10%, outflow 1000, flows [400, 500, 600]
  // Year 1: 400 / 1.1 = 363.64
  // Year 2: 500 / 1.21 = 413.22
  // Year 3: 600 / 1.331 = 450.79
  // Total PV = 1227.65; NPV = 227.65
  const npv = calculateNPV(0.10, 1000, [400, 500, 600]);
  assert(Math.abs(npv - 227.65) < 0.1, `calculateNPV is deterministic and accurate (${npv} vs expected ~227.65)`);

  // Payback: outflow 500, annual 125 -> 4.0 years
  const payback = calculatePayback(500, 125);
  assert(payback === 4.0, `calculatePayback correct (${payback} years)`);

  // WACC: equity 60% @ 15%, debt 40% @ 10%, tax 25%
  // 0.60 * 0.15 + 0.40 * 0.10 * (1 - 0.25) = 0.09 + 0.03 = 0.12 (12%)
  const wacc = calculateWACC(0.6, 0.15, 0.4, 0.10, 0.25);
  assert(wacc === 0.12, `calculateWACC correct (${wacc} vs 0.12)`);

  // DOL: Contribution 500, EBIT 250 -> 2.0
  const dol = calculateDOL(500, 250);
  assert(dol === 2.0, `calculateDOL correct (${dol})`);

  // DFL: EBIT 250, Interest 50 -> 250 / 200 = 1.25
  const dfl = calculateDFL(250, 50);
  assert(dfl === 1.25, `calculateDFL correct (${dfl})`);

  // EOQ: Demand 10000, Ordering 50, Holding 4 -> sqrt(2 * 10000 * 50 / 4) = sqrt(250000) = 500
  const eoq = calculateEOQ(10000, 50, 4);
  assert(eoq === 500, `calculateEOQ correct (${eoq})`);

  // Working Capital Cycle: Debtor 60 + Inventory 45 - Creditor 30 = 75 days
  const wcc = calculateWorkingCapitalCycle(60, 45, 30);
  assert(wcc === 75, `calculateWorkingCapitalCycle correct (${wcc} days)`);

  // Summary
  console.log("\n==============================================================");
  console.log(`Validator Unit Test Results: ${passCount} / ${testCount} Passed`);
  console.log("==============================================================");

  if (!allPassed) {
    process.exit(1);
  }
}

runValidatorUnitTests().catch((err) => {
  console.error("Test execution threw error:", err);
  process.exit(1);
});
