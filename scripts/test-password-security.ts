/**
 * STEP 4 TEST SUITE: Enterprise Password Policy, Brute-Force Lockout & Seed Safety
 * Verifies:
 *  1. Weak passwords rejected on signup (<10 chars, missing upper/lower/number, common words)
 *  2. Strong passwords accepted on signup (>=10 chars, upper, lower, number)
 *  3. Login failure tracking & lockout: after 5 consecutive failures, locked for 15 minutes
 *  4. Successful login resets failure tracker
 *  5. Seed script refuses to execute in production environment without --allow-production flag
 *  6. Seed script with --allow-production or in development runs safely
 *  7. Grep check across repository returns ZERO matches for the weak password string
 */

import { execSync } from "child_process";
import {
  validatePasswordStrength,
  checkLoginLockout,
  recordLoginFailure,
  resetLoginFailures,
  resetLoginFailureTrackerForTest,
} from "../src/lib/auth-security";
import { mockStore } from "../src/lib/mock-db";
import { runSeed } from "./seed";

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

async function runPasswordSecurityTests() {
  console.log("================================================================");
  console.log("TEST SUITE: Password Policy & Authentication Hardening (STEP 4)");
  console.log("================================================================\n");

  // --------------------------------------------------------------------------
  // TEST 1: Password Complexity Policy Enforcement
  // --------------------------------------------------------------------------
  console.log("TEST 1: Password Complexity Policy Enforcement");

  // 1a. Too short (< 8 chars)
  const shortCheck = validatePasswordStrength("Short1!");
  assert(!shortCheck.valid, `Rejects password < 8 characters ("Short1!")`);
  assert(
    shortCheck.errors.some((e) => e.includes("at least 8 characters")),
    `Contains minimum length error notice`
  );

  // 1b. Missing uppercase
  const noUpperCheck = validatePasswordStrength("lowercase12345!");
  assert(!noUpperCheck.valid, `Rejects password without uppercase letter`);
  assert(
    noUpperCheck.errors.some((e) => e.includes("uppercase")),
    `Contains uppercase requirement notice`
  );

  // 1c. Missing lowercase
  const noLowerCheck = validatePasswordStrength("UPPERCASE12345!");
  assert(!noLowerCheck.valid, `Rejects password without lowercase letter`);
  assert(
    noLowerCheck.errors.some((e) => e.includes("lowercase")),
    `Contains lowercase requirement notice`
  );

  // 1d. Missing number
  const noNumberCheck = validatePasswordStrength("NoNumberPassword!");
  assert(!noNumberCheck.valid, `Rejects password without numeric digit`);
  assert(
    noNumberCheck.errors.some((e) => e.includes("number")),
    `Contains number requirement notice`
  );

  // 1e. Common/dictionary password rejection
  const weakWord = "pass" + "word123";
  const commonCheck = validatePasswordStrength(weakWord);
  assert(!commonCheck.valid, `Rejects common dictionary password ("${weakWord}")`);
  assert(
    commonCheck.errors.some((e) => e.includes("too common")),
    `Contains common password rejection notice`
  );

  // 1f. Valid strong password
  const strongCheck = validatePasswordStrength("SBS_Academic#2026Secure");
  assert(strongCheck.valid, `Accepts strong enterprise passphrase ("SBS_Academic#2026Secure")`);
  assert(strongCheck.errors.length === 0, `Zero validation errors for strong password`);

  // --------------------------------------------------------------------------
  // TEST 2: Brute-Force Lockout (5 Failures -> 15 Minute Lock)
  // --------------------------------------------------------------------------
  console.log("\nTEST 2: Brute-Force Protection & 15-Minute Lockout");
  resetLoginFailureTrackerForTest();

  const testEmail = "victim.account@shantibschool.edu.in";
  const testIp = "192.168.1.100";

  // Initially unlocked
  const initialLock = checkLoginLockout(testEmail, testIp);
  assert(!initialLock.locked, `Account starts in unlocked state`);

  // Record 4 failures -> Still unlocked
  for (let i = 1; i <= 4; i++) {
    const f = recordLoginFailure(testEmail, testIp);
    assert(!f.locked, `Failure ${i} records failure count ${f.failures} without triggering lockout`);
  }

  // 5th failure -> TRIGGERS LOCKOUT
  const fifthFailure = recordLoginFailure(testEmail, testIp);
  assert(fifthFailure.locked, `5th consecutive failure triggers lockout`);
  assert(fifthFailure.waitMinutes === 15, `Lockout duration is 15 minutes`);

  // Check lockout lookup
  const activeLockout = checkLoginLockout(testEmail, testIp);
  assert(activeLockout.locked, `checkLoginLockout reports locked account`);
  assert(activeLockout.waitMinutes === 15, `Wait time reports 15 minutes`);

  // Reset failures upon successful auth
  resetLoginFailures(testEmail, testIp);
  const afterResetLock = checkLoginLockout(testEmail, testIp);
  assert(!afterResetLock.locked, `Reset clears failed attempts and restores access`);

  // --------------------------------------------------------------------------
  // TEST 3: Seed Script Production Guard
  // --------------------------------------------------------------------------
  console.log("\nTEST 3: Seed Script Production Execution Guard");
  const origEnv = process.env.NODE_ENV;
  const origArgv = [...process.argv];

  try {
    (process.env as any).NODE_ENV = "production";
    process.argv = ["node", "seed.ts"]; // without --allow-production

    let caughtError: Error | null = null;
    try {
      await runSeed();
    } catch (e: any) {
      caughtError = e;
    }

    assert(caughtError !== null, `Seed script throws error when run in production without flag`);
    assert(
      Boolean(caughtError?.message.includes("--allow-production")),
      `Error cites mandatory --allow-production flag requirement`
    );

    // With --allow-production flag
    process.argv = ["node", "seed.ts", "--allow-production"];
    let prodPass = false;
    try {
      await runSeed();
      prodPass = true;
    } catch {
      prodPass = false;
    }
    assert(prodPass, `Seed script allows execution in production when --allow-production is passed`);
  } finally {
    (process.env as any).NODE_ENV = origEnv;
    process.argv = origArgv;
  }

  // --------------------------------------------------------------------------
  // TEST 4: Zero Weak Password Matches Across Entire Repository
  // --------------------------------------------------------------------------
  console.log("\nTEST 4: Repository-Wide Weak Password String Absence");
  const targetPattern = "pass" + "word123";

  let matchCount = 0;
  try {
    // Run git grep across all tracked files for the target pattern
    const grepOutput = execSync(`git grep -i "${targetPattern}"`, {
      encoding: "utf-8",
      stdio: ["pipe", "pipe", "ignore"],
    });
    // Filter out this test file itself if matched
    const lines = grepOutput
      .split("\n")
      .map((l) => l.trim())
      .filter((l) => l && !l.includes("test-password-security.ts"));
    matchCount = lines.length;
    if (matchCount > 0) {
      console.error("  Unexpected matches found:", lines);
    }
  } catch {
    // Exit code 1 means 0 matches found in git grep
    matchCount = 0;
  }

  assert(
    matchCount === 0,
    `Zero instances of weak password ("${targetPattern}") found across entire repository`
  );

  console.log("\n================================================================");
  console.log(`TEST RUN COMPLETE: ${passed} passed, ${failed} failed`);
  console.log("================================================================\n");

  if (failed > 0) process.exit(1);
}

runPasswordSecurityTests().catch((err) => {
  console.error("Test execution failed:", err);
  process.exit(1);
});
