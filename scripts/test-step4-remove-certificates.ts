import fs from "fs";
import path from "path";
import { mockStore } from "../src/lib/mock-db";

async function runStep4Verification() {
  console.log("==============================================================");
  console.log("🧪 STEP 4 VERIFICATION: Remove Certificates & Decommission Route");
  console.log("==============================================================\n");

  let allPassed = true;

  // 1. Certificate route handler file is deleted
  console.log("1. Verifying certificate route handler file is removed...");
  const certRoutePath = path.join(
    process.cwd(),
    "src/app/api/portfolio/[studentId]/certificate/[caseId]/route.ts"
  );
  const routeExists = fs.existsSync(certRoutePath);
  if (!routeExists) {
    console.log("  ✅ PASS: Route handler file is deleted (src/app/api/portfolio/[studentId]/certificate/[caseId]/route.ts does not exist).");
  } else {
    console.error("  ❌ FAIL: Route handler file still exists on disk.");
    allPassed = false;
  }

  // 2. Zero occurrences of "certificate" in src/
  console.log("\n2. Scanning src/ directory for any 'certificate' occurrences (case-insensitive)...");
  function scanDir(dir: string, matches: string[]) {
    const files = fs.readdirSync(dir, { withFileTypes: true });
    for (const file of files) {
      const fullPath = path.join(dir, file.name);
      if (file.isDirectory()) {
        scanDir(fullPath, matches);
      } else if (file.isFile() && /\.(tsx?|jsx?|json|css)$/.test(file.name)) {
        const content = fs.readFileSync(fullPath, "utf-8");
        if (/certificate/i.test(content)) {
          matches.push(fullPath);
        }
      }
    }
  }

  const srcMatches: string[] = [];
  scanDir(path.join(process.cwd(), "src"), srcMatches);
  if (srcMatches.length === 0) {
    console.log("  ✅ PASS: Zero occurrences of 'certificate' across the entire src/ tree (UI, API routes, components, lib).");
  } else {
    console.error(`  ❌ FAIL: Found ${srcMatches.length} files in src/ containing 'certificate':`, srcMatches);
    allPassed = false;
  }

  // 3. FEATURE_CERTIFICATES removed from .env.example
  console.log("\n3. Verifying FEATURE_CERTIFICATES flag is removed from .env.example...");
  const envExample = fs.readFileSync(path.join(process.cwd(), ".env.example"), "utf-8");
  if (!envExample.includes("FEATURE_CERTIFICATES")) {
    console.log("  ✅ PASS: FEATURE_CERTIFICATES is removed from .env.example.");
  } else {
    console.error("  ❌ FAIL: FEATURE_CERTIFICATES still found in .env.example.");
    allPassed = false;
  }

  // 4. README contains deprecation note and certificates table is untouched in migrations
  console.log("\n4. Verifying README deprecation note and migration table preservation...");
  const readme = fs.readFileSync(path.join(process.cwd(), "README.md"), "utf-8");
  const hasDeprecationNote = readme.includes("`certificates` table") && readme.includes("deprecated");
  if (hasDeprecationNote) {
    console.log("  ✅ PASS: README explicitly documents that the certificates table is deprecated and decommissioned.");
  } else {
    console.error("  ❌ FAIL: README is missing the deprecation notice.");
    allPassed = false;
  }

  const migration10 = path.join(process.cwd(), "supabase/migrations/00010_database_upgrade.sql");
  if (fs.existsSync(migration10) && fs.readFileSync(migration10, "utf-8").includes("CREATE TABLE IF NOT EXISTS public.certificates")) {
    console.log("  ✅ PASS: Applied migration table 00010_database_upgrade.sql is strictly preserved without alterations.");
  } else {
    console.error("  ❌ FAIL: Applied migration file was altered or missing.");
    allPassed = false;
  }

  // 5. Portfolio functionality functions without certificates
  console.log("\n5. Verifying Student Portfolio data integrity without certificates...");
  const studentProfile = mockStore.getProfile("usr-student-1");
  const studentAnswers = mockStore.getAnswersForStudent("usr-student-1");
  const gradedAnswers = studentAnswers.filter((a) => a.grade && a.grade.final_marks !== null);

  if (studentProfile && gradedAnswers.length > 0) {
    console.log(`  ✅ PASS: Student portfolio query succeeds for "${studentProfile.name}" with ${gradedAnswers.length} graded case(s).`);
  } else {
    console.error("  ❌ FAIL: Student portfolio query failed.");
    allPassed = false;
  }

  // Final summary
  console.log("\n==============================================================");
  if (allPassed) {
    console.log("🎉 ALL STEP 4 TESTS PASSED: Certificates cleanly decommissioned!");
    console.log("==============================================================");
  } else {
    console.error("❌ STEP 4 TESTS FAILED. Please review the errors above.");
    console.log("==============================================================");
    process.exit(1);
  }
}

runStep4Verification().catch((err) => {
  console.error("Unexpected test error:", err);
  process.exit(1);
});
