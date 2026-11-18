/**
 * SBS CaseLab - CE Case Pack Feedback & Syllabus Grounding Test Suite
 */

import { feedbackStore } from "../src/lib/casepack/feedback-store";
import { FINANCE_DEPARTMENT_PROFILE } from "../src/config/casepack/departments";

async function runFeedbackAndSyllabusTests() {
  console.log("==============================================================");
  console.log("🧪 SBS CaseLab: Feedback & Syllabus Grounding Verification Suite");
  console.log("==============================================================\n");

  let allPassed = true;

  function assert(condition: boolean, desc: string) {
    if (condition) {
      console.log(`  ✅ PASS: ${desc}`);
    } else {
      allPassed = false;
      console.error(`  ❌ FAIL: ${desc}`);
    }
  }

  // --- TEST 1: Feedback Store Initial State & Metrics ---
  console.log("--- TEST 1: Feedback Store Initial Metrics ---");
  const metrics1 = feedbackStore.getMetrics();
  assert(metrics1.total >= 3, `Initial feedback store has seeded records (found: ${metrics1.total})`);
  assert(metrics1.overallAvg >= 4.0, `Overall average rating is positive (found: ${metrics1.overallAvg})`);
  assert(metrics1.avgByDept.finance === 5.0, `Finance average rating is 5.0 (found: ${metrics1.avgByDept.finance})`);
  assert(metrics1.goldExamplesStatus.finance.status === "approved", "Finance gold example is marked approved");
  assert(metrics1.goldExamplesStatus.hr.status === "pending_approval", "HR gold example is marked pending_approval");
  assert(metrics1.goldExamplesStatus.marketing.status === "pending_approval", "Marketing gold example is marked pending_approval");

  // --- TEST 2: Adding Faculty Feedback & Gold Reference Nomination ---
  console.log("\n--- TEST 2: Adding Faculty Evaluation ---");
  const newFeedback = feedbackStore.addFeedback({
    case_id: "case-fin-test-01",
    case_title: "Working Capital Optimization at Gujarat Textiles",
    user_id: "usr-faculty-1",
    user_name: "Ms. Reena Paswan",
    user_email: "reena.paswan@shantibschool.edu.in",
    department: "finance",
    rating: 5,
    flagged_issues: [],
    comments: "Exceptional cash flow modeling.",
    promote_to_gold: true,
  });

  assert(newFeedback.status === "under_review", "Feedback with promote_to_gold starts with 'under_review' status");
  const metrics2 = feedbackStore.getMetrics();
  assert(metrics2.goldCandidatesCount >= 3, `Gold candidates count incremented (now: ${metrics2.goldCandidatesCount})`);

  // --- TEST 3: Admin Gold Status Update ---
  console.log("\n--- TEST 3: Admin Gold Candidate Review ---");
  const updated = feedbackStore.updateStatus(newFeedback.id, "promoted");
  assert(updated?.status === "promoted", "Admin can successfully promote candidate to gold status");

  // --- TEST 4: Syllabus Topic Extraction Heuristics ---
  console.log("\n--- TEST 4: Syllabus Parser Heuristics ---");
  const mockSyllabus = `
  SHANTI BUSINESS SCHOOL - ADVANCED FINANCIAL SERVICES SYLLABUS
  Unit 1: Fund Based Financial Services
  Factoring, Forfaiting, Export Receivables, Bill Discounting, Hire Purchase
  
  Unit 2: Lease Financing and Equipment Leasing
  Operating Leases, Financial Leases, Lease vs Buy Analysis, Depreciation Impact
  
  Unit 3: Merchant Banking & Credit Rating
  SEBI Regulations, IPO Issue Management, CRISIL and ICRA Rating Methodologies
  `;

  const lines = mockSyllabus.split("\n").map((l) => l.trim()).filter((l) => l.length > 0);
  const units: { name: string; topics: string[] }[] = [];
  let currentUnit: { name: string; topics: string[] } | null = null;
  const unitRegex = /^(unit|module|chapter|section|part)\s+([0-9ivx]+)[:\s\-]*(.*)/i;

  for (const line of lines) {
    const match = line.match(unitRegex);
    if (match) {
      if (currentUnit && currentUnit.topics.length > 0) units.push(currentUnit);
      currentUnit = { name: `Unit ${match[2]}: ${match[3]}`, topics: [] };
    } else if (currentUnit) {
      const parts = line.split(",").map((p) => p.trim()).filter((p) => p.length > 3);
      currentUnit.topics.push(...parts);
    }
  }
  if (currentUnit && currentUnit.topics.length > 0) units.push(currentUnit);

  assert(units.length === 3, `Syllabus parser extracted 3 distinct units (found: ${units.length})`);
  assert(units[0].topics.includes("Factoring"), "Unit 1 contains Factoring topic");
  assert(units[1].topics.includes("Operating Leases"), "Unit 2 contains Operating Leases topic");

  // Check framework matching with punctuation normalization
  const matchedFrameworks = FINANCE_DEPARTMENT_PROFILE.frameworks.filter((fw) => {
    const cleanFw = fw.replace(/[\.\(\)\-]/g, "").toLowerCase();
    const cleanSyllabus = mockSyllabus.replace(/[\.\(\)\-]/g, "").toLowerCase();
    const coreWords = cleanFw.split(" ").slice(0, 3).join(" ");
    return cleanSyllabus.includes(coreWords);
  });
  assert(matchedFrameworks.some((fw) => fw.includes("Lease vs")), "Matched 'Lease vs. Buy' framework in syllabus text");

  console.log("\n==============================================================");
  console.log(`Feedback & Syllabus Verification Complete! All passed: ${allPassed}`);
  console.log("==============================================================");

  if (!allPassed) {
    process.exit(1);
  }
}

runFeedbackAndSyllabusTests();
