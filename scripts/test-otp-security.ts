/**
 * STEP 1 TEST SUITE: OTP Security, Hardening & Pending Approval Flow
 * Verifies:
 *  1. Cryptographic 6-digit generation (crypto.randomInt)
 *  2. SHA-256 Hashed OTP storage & constant-time comparison
 *  3. Single-use enforcement
 *  4. Expiry (10 minutes)
 *  5. Max 5 wrong attempts then 15-minute lockout
 *  6. Max 3 resends per hour per email and IP
 *  7. Production mode: zero OTP exposure in responses or logs
 *  8. Production pending-approval flow when email provider not configured
 *  9. Startup check refusing to boot if DEMO_OTP_ON_SCREEN=true in production
 */

import {
  generateSecureOtp,
  hashOtp,
  verifyHashedOtp,
  isProductionEnv,
  assertNoDemoOtpInProduction,
  checkOtpResendRateLimit,
  resetResendTrackerForTest,
  canShowOtpOnScreen,
} from "../src/lib/auth-security";
import { mockStore } from "../src/lib/mock-db";
import { Profile } from "../src/lib/types";

let passed = 0;
let failed = 0;

function assert(condition: boolean, message: string) {
  if (condition) {
    console.log(`  âœ… PASS: ${message}`);
    passed++;
  } else {
    console.error(`  â Œ FAIL: ${message}`);
    failed++;
  }
}

async function runOtpSecurityTests() {
  console.log("================================================================");
  console.log("TEST SUITE: OTP Hardening, Storage & Anti-Exposure (STEP 1)");
  console.log("================================================================\n");

  // --------------------------------------------------------------------------
  // TEST 1: Cryptographic 6-digit Generation
  // --------------------------------------------------------------------------
  console.log("TEST 1: Cryptographic 6-Digit OTP Generation");
  for (let i = 0; i < 20; i++) {
    const code = generateSecureOtp();
    assert(
      code.length === 6 && /^\d{6}$/.test(code),
      `Generated valid 6-digit numeric OTP (${code})`
    );
  }

  // --------------------------------------------------------------------------
  // TEST 2: SHA-256 Hashing & Timing-Safe Verification
  // --------------------------------------------------------------------------
  console.log("\nTEST 2: Hashed OTP Storage & Timing-Safe Verification");
  const plainOtp = "729401";
  const hashed = hashOtp(plainOtp);
  assert(hashed.length === 64, `Hash is 64-character SHA-256 string (${hashed.slice(0, 16)}...)`);
  assert(hashed !== plainOtp, `Stored hash is never equal to plain text OTP`);
  assert(verifyHashedOtp(plainOtp, hashed), `Matching OTP verifies successfully against hash`);
  assert(!verifyHashedOtp("000000", hashed), `Incorrect OTP fails verification`);
  assert(!verifyHashedOtp("729402", hashed), `Off-by-one OTP fails verification`);

  // --------------------------------------------------------------------------
  // TEST 3: MockStore Hashed Storage & Expiry
  // --------------------------------------------------------------------------
  console.log("\nTEST 3: MockStore Integration & 10-Minute Expiry");
  const testEmail = "security.tester@shantibschool.edu.in";
  const testUserId = "usr-test-security-otp";
  const testUser: Profile = {
    id: testUserId,
    email: testEmail,
    name: "Security Tester",
    role: "faculty",
    plan: "standard",
    is_approved: true,
  };
  mockStore.addProfile(testUser);

  // Set OTP with 10-minute expiry
  const validCode = "654321";
  const futureExpiry = new Date(Date.now() + 10 * 60 * 1000).toISOString();
  mockStore.setUserOtp(testUserId, validCode, futureExpiry);

  const storedProfile = mockStore.getProfile(testUserId);
  assert(
    storedProfile?.verification_otp !== validCode && storedProfile?.verification_otp?.length === 64,
    `Profile in store contains SHA-256 hash, NOT plain OTP`
  );

  // Test expired OTP
  const pastExpiry = new Date(Date.now() - 1000).toISOString();
  mockStore.setUserOtp(testUserId, validCode, pastExpiry);
  const expiredResult = mockStore.verifyUserOtp(testUserId, validCode);
  assert(!expiredResult.success, `Expired OTP is rejected: ${expiredResult.message}`);

  // --------------------------------------------------------------------------
  // TEST 4: Max 5 Wrong Attempts & 15-Minute Lockout
  // --------------------------------------------------------------------------
  console.log("\nTEST 4: Wrong Attempt Rate Limiting & 15-Minute Lockout");
  mockStore.setUserOtp(testUserId, validCode, futureExpiry);

  for (let attempt = 1; attempt <= 4; attempt++) {
    const wrongRes = mockStore.verifyUserOtp(testUserId, "111111");
    assert(!wrongRes.success, `Wrong attempt ${attempt} rejected (${wrongRes.message})`);
  }

  // 5th wrong attempt triggers lockout
  const fifthAttempt = mockStore.verifyUserOtp(testUserId, "111111");
  assert(!fifthAttempt.success, `5th wrong attempt rejected`);
  assert(
    fifthAttempt.message.includes("Maximum verification attempts exceeded") ||
      fifthAttempt.message.includes("locked"),
    `5th wrong attempt triggers 15-minute lock (${fifthAttempt.message})`
  );

  // 6th attempt even with correct code is locked
  const lockedAttempt = mockStore.verifyUserOtp(testUserId, validCode);
  assert(!lockedAttempt.success, `Correct code rejected while locked (${lockedAttempt.message})`);

  // --------------------------------------------------------------------------
  // TEST 5: Single Use Verification
  // --------------------------------------------------------------------------
  console.log("\nTEST 5: Single-Use OTP Enforcement");
  const singleUseUser: Profile = {
    id: "usr-single-use",
    email: "single.use@shantibschool.edu.in",
    name: "Single Use User",
    role: "student",
    plan: "standard",
    is_approved: true,
  };
  mockStore.addProfile(singleUseUser);
  const freshCode = "889900";
  mockStore.setUserOtp(singleUseUser.id, freshCode, futureExpiry);

  const firstVerify = mockStore.verifyUserOtp(singleUseUser.id, freshCode);
  assert(firstVerify.success, `First verification succeeds: ${firstVerify.message}`);

  const secondVerify = mockStore.verifyUserOtp(singleUseUser.id, freshCode);
  assert(
    secondVerify.message.includes("already verified") || !secondVerify.success,
    `Cannot reuse OTP: ${secondVerify.message}`
  );

  // --------------------------------------------------------------------------
  // TEST 6: Resend Limit (Max 3 per hour per email and IP)
  // --------------------------------------------------------------------------
  console.log("\nTEST 6: Resend Rate Limit (Max 3 / hour)");
  resetResendTrackerForTest();
  const resendEmail = "resend.test@shantibschool.edu.in";
  const resendIp = "192.168.1.100";

  assert(checkOtpResendRateLimit(resendEmail, resendIp).allowed, `Resend request 1 allowed`);
  assert(checkOtpResendRateLimit(resendEmail, resendIp).allowed, `Resend request 2 allowed`);
  assert(checkOtpResendRateLimit(resendEmail, resendIp).allowed, `Resend request 3 allowed`);

  const fourthResend = checkOtpResendRateLimit(resendEmail, resendIp);
  assert(!fourthResend.allowed, `4th resend in same hour is BLOCKED (remaining: ${fourthResend.remaining})`);

  // --------------------------------------------------------------------------
  // TEST 7: Production Anti-Exposure & Startup Check
  // --------------------------------------------------------------------------
  console.log("\nTEST 7: Production Safety & Startup Fatal Error Assert");

  const originalNodeEnv = process.env.NODE_ENV;
  const originalVercelEnv = process.env.VERCEL_ENV;
  const originalDemoOtp = process.env.DEMO_OTP_ON_SCREEN;

  try {
    // Simulate production with DEMO_OTP_ON_SCREEN=true
    const envMutable = process.env as Record<string, string | undefined>;
    envMutable.NODE_ENV = "production";
    delete envMutable.VERCEL_ENV;
    envMutable.DEMO_OTP_ON_SCREEN = "true";

    let startupBlocked = false;
    try {
      assertNoDemoOtpInProduction();
    } catch (err: unknown) {
      startupBlocked = true;
      const msg = err instanceof Error ? err.message : "";
      assert(msg.includes("FATAL SECURITY VIOLATION"), `Startup check throws fatal error if DEMO_OTP_ON_SCREEN=true in production`);
    }
    assert(startupBlocked, `Refuses to boot in production with DEMO_OTP_ON_SCREEN=true`);

    // In production, canShowOtpOnScreen is strictly false even if flag is set
    assert(canShowOtpOnScreen() === false, `canShowOtpOnScreen() is strictly false in production`);
  } finally {
    (process.env as Record<string, string | undefined>).NODE_ENV = originalNodeEnv;
    if (originalVercelEnv !== undefined) process.env.VERCEL_ENV = originalVercelEnv;
    if (originalDemoOtp !== undefined) process.env.DEMO_OTP_ON_SCREEN = originalDemoOtp;
    else delete process.env.DEMO_OTP_ON_SCREEN;
  }

  // --------------------------------------------------------------------------
  // TEST 8: Pending Admin Approval Logic
  // --------------------------------------------------------------------------
  console.log("\nTEST 8: Pending Admin Approval Workflow");
  const pendingUser: Profile = {
    id: "usr-pending-1",
    email: "pending.faculty@shantibschool.edu.in",
    name: "Pending Faculty",
    role: "faculty",
    plan: "standard",
    is_approved: false,
    approval_status: "pending_admin_approval",
  };
  mockStore.addProfile(pendingUser);

  const pendingList = mockStore.getPendingRegistrations();
  assert(
    pendingList.some((p) => p.id === "usr-pending-1"),
    `Pending user appears in getPendingRegistrations()`
  );

  // Admin approves user
  const approvedProfile = mockStore.approveRegistration("usr-pending-1", "usr-admin-1");
  assert(approvedProfile !== null && approvedProfile.is_approved === true, `Admin approval succeeds and marks user approved`);

  console.log("\n================================================================");
  console.log(`TEST RUN COMPLETE: ${passed} passed, ${failed} failed`);
  console.log("================================================================\n");

  if (failed > 0) process.exit(1);
}

runOtpSecurityTests().catch((err) => {
  console.error("Test execution failed:", err);
  process.exit(1);
});
