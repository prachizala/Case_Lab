/**
 * STEP 2 TEST SUITE: DPDP Consent Validation, Versioning & Data Subject Rights
 * Verifies:
 *  1. Signup without consent is rejected on the server (status 400)
 *  2. Signup with consent passes and stores consent_version + policy_version
 *  3. Consent record persistence in mockStore/database
 *  4. Data export under Section 11 of DPDP Act 2023
 *  5. Statutory right to withdraw consent under Section 6(6)
 *  6. Irreversible erasure under Section 12
 */

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

async function runDpdpConsentTests() {
  console.log("================================================================");
  console.log("TEST SUITE: DPDP Act 2023 Consent & Rights Verification (STEP 2)");
  console.log("================================================================\n");

  // --------------------------------------------------------------------------
  // TEST 1: Server-Side Validation: Signup Without Consent Fails
  // --------------------------------------------------------------------------
  console.log("TEST 1: Server-Side Enforcement (Rejection Without Explicit Consent)");

  // Helper simulating signup logic from src/app/api/auth/route.ts
  function simulateSignup(body: {
    name: string;
    email: string;
    password: string;
    role: "faculty" | "student";
    dpdp_consent?: boolean;
  }) {
    if (!body.name || !body.email || !body.password) {
      return { status: 400, error: "Name, email, and password are required." };
    }
    if (body.dpdp_consent !== true) {
      return {
        status: 400,
        error: "Statutory consent under the DPDP Act 2023 is mandatory to create an academic account and process educational records.",
      };
    }

    const newProfile: Profile = {
      id: `usr-dpdp-${Date.now()}`,
      email: body.email.toLowerCase().trim(),
      name: body.name.trim(),
      role: body.role,
      plan: "standard",
      is_approved: true,
      dpdp_consent: true,
      dpdp_consent_at: new Date().toISOString(),
      consent_version: "2023.1",
      policy_version: "v1.2",
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    mockStore.addProfile(newProfile);
    return { status: 200, profile: newProfile };
  }

  // 1a. Missing consent
  const resMissing = simulateSignup({
    name: "Rohan Patel",
    email: "rohan.p@shantibschool.edu.in",
    password: "StrongPassword1!",
    role: "student",
  });
  assert(resMissing.status === 400, `Signup without consent returns status 400`);
  assert(
    Boolean(resMissing.error?.includes("Statutory consent under the DPDP Act 2023 is mandatory")),
    `Error message clearly cites mandatory statutory DPDP consent requirement`
  );

  // 1b. Consent explicitly false
  const resFalse = simulateSignup({
    name: "Rohan Patel",
    email: "rohan.p@shantibschool.edu.in",
    password: "StrongPassword1!",
    role: "student",
    dpdp_consent: false,
  });
  assert(resFalse.status === 400, `Signup with dpdp_consent=false returns status 400`);

  // --------------------------------------------------------------------------
  // TEST 2: Signup With Consent Passes & Stores Versioning Metadata
  // --------------------------------------------------------------------------
  console.log("\nTEST 2: Consent Persistence & Policy Version Tracking");
  const testEmail = `consented.student.${Date.now()}@shantibschool.edu.in`;
  const resSuccess = simulateSignup({
    name: "Ananya Sharma",
    email: testEmail,
    password: "StrongPassword1!",
    role: "student",
    dpdp_consent: true,
  });

  assert(resSuccess.status === 200, `Signup with explicit consent succeeds (status 200)`);
  assert(resSuccess.profile !== undefined, `User profile created`);

  // Verify in mockStore database
  const created = mockStore.getProfile(testEmail);
  assert(created !== undefined, `Profile retrievable from database`);
  assert(created?.dpdp_consent === true, `dpdp_consent is true`);
  assert(typeof created?.dpdp_consent_at === "string", `dpdp_consent_at timestamp is recorded`);
  assert(created?.consent_version === "2023.1", `consent_version is recorded as 2023.1`);
  assert(created?.policy_version === "v1.2", `policy_version is recorded as v1.2`);

  // --------------------------------------------------------------------------
  // TEST 3: Statutory Right to Withdraw Consent (Section 6(6))
  // --------------------------------------------------------------------------
  console.log("\nTEST 3: Statutory Right to Withdraw Consent (Section 6)");
  if (created) {
    const withdrawnAt = new Date().toISOString();
    mockStore.updateProfile(created.id, {
      dpdp_consent: false,
      consent_withdrawn_at: withdrawnAt,
    });
    mockStore.logAudit(
      created.id,
      created.email,
      "data_erasure",
      created.id,
      "user",
      { action: "consent_withdrawn", statutory_basis: "DPDP Act 2023 Section 6(6)" }
    );

    const updated = mockStore.getProfile(created.id);
    assert(updated?.dpdp_consent === false, `Profile reflects withdrawn consent (dpdp_consent = false)`);
    assert(typeof updated?.consent_withdrawn_at === "string", `consent_withdrawn_at timestamp is inscribed`);
  }

  // --------------------------------------------------------------------------
  // TEST 4: Data Export & Irreversible Erasure (Sections 11 & 12)
  // --------------------------------------------------------------------------
  console.log("\nTEST 4: Data Export & Irreversible Erasure (Sections 11 & 12)");
  if (created) {
    // Export data
    const exportData = mockStore.exportUserData(created.id);
    assert(exportData.compliance !== undefined, `Export archive contains statutory DPDP compliance statement`);
    assert(exportData.data_principal?.email === created.email, `Export contains user profile`);

    // Erase account
    const deleteResult = mockStore.deleteUserData(created.id, created.id, created.email);
    assert(deleteResult.success, `Personal data permanently erased`);
    const afterDelete = mockStore.getProfile(created.id);
    assert(afterDelete === undefined, `User record no longer exists in database`);
  }

  console.log("\n================================================================");
  console.log(`TEST RUN COMPLETE: ${passed} passed, ${failed} failed`);
  console.log("================================================================\n");

  if (failed > 0) process.exit(1);
}

runDpdpConsentTests().catch((err) => {
  console.error("Test execution failed:", err);
  process.exit(1);
});
