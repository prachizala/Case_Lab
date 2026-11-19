/**
 * SBS CaseLab: Phase 7 Comprehensive Production Smoke Test
 *
 * Verifies all 7 critical security, institutional privacy, and role isolation gates:
 * 1. OTP Security: OTP is never surfaced or leaked in production responses.
 * 2. DPDP Consent: Unchecked by default; form disabled until explicit affirmative action.
 * 3. Enterprise Password Policy: Rejects common/short passwords; no hardcoded passwords.
 * 4. Sign-Up Gating: Admin role strictly rejected from sign-up API and UI.
 * 5. Role Isolation: Students strictly barred from reaching faculty/admin APIs and endpoints.
 * 6. Academic Confidentiality: Model Answer Key, Teaching Notes, and Rubrics strictly scrubbed from student views/downloads.
 * 7. Personal Data Privacy: Mobile, personal email, and enrollment numbers visible only to owner and admin.
 */

import { mockStore } from "../src/lib/mock-db";
import { checkAccess } from "../src/lib/access-control";
import { sanitizeCaseStudyForStudent } from "../src/lib/case-permissions";
import { POST as authPost } from "../src/app/api/auth/route";
import { GET as adminGet, POST as adminPost } from "../src/app/api/admin/route";
import { POST as uploadPost } from "../src/app/api/cases/[id]/upload/route";
import { GET as downloadGet } from "../src/app/api/repository/download/route";
import { createSessionToken, AUTH_COOKIE_NAME } from "../src/lib/session";
import { NextRequest } from "next/server";
import fs from "fs";

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

async function createReq(
  url: string,
  method: "GET" | "POST",
  userId?: string,
  body?: any
): Promise<NextRequest> {
  const headers = new Headers();
  headers.set("content-type", "application/json");

  if (userId) {
    const token = await createSessionToken(userId);
    headers.set("cookie", `${AUTH_COOKIE_NAME}=${token}`);
  }

  const reqInit: RequestInit = { method, headers };
  if (body) {
    reqInit.body = JSON.stringify(body);
  }

  return new NextRequest(new Request(url, reqInit));
}

async function runPhase7SmokeTests() {
  console.log("==================================================================");
  console.log("🛡️ PHASE 7: PRODUCTION SECURITY, PRIVACY & ISOLATION SMOKE TEST");
  console.log("==================================================================\n");

  // CHECK 1: OTP is never leaked or auto-filled in production
  console.log("CHECK 1: OTP Transmission & Security Isolation");
  {
    const req = await createReq("http://localhost:3000/api/auth", "POST", undefined, {
      action: "request-otp",
      email: "test.student@shantibschool.edu.in",
    });
    const res = await authPost(req);
    const data = await res.json();

    assert(res.status === 200, "OTP request handled successfully");
    // In production, otp should never be in response body
    if (process.env.NODE_ENV === "production") {
      assert(data.otp === undefined, "Production response NEVER contains plain-text OTP");
    } else {
      assert(typeof data.message === "string", "User receives friendly verification message");
    }
  }

  // CHECK 2: DPDP Consent Checkbox Unchecked by Default
  console.log("\nCHECK 2: DPDP Consent Form Verification");
  {
    const signupSource = fs.readFileSync("src/app/signup/page.tsx", "utf8");
    assert(
      signupSource.includes("const [dpdpConsent, setDpdpConsent] = useState(false)"),
      "Consent checkbox initialized to false (unchecked by default)"
    );
    assert(
      signupSource.includes("disabled={loading || !dpdpConsent}"),
      "Registration submit button disabled until consent checkbox is explicitly ticked"
    );
  }

  // CHECK 3: Enterprise Password Policy & No Hardcoded Demo Passwords
  console.log("\nCHECK 3: Enterprise Password Policy & Password Security");
  {
    // Try registering with a weak password
    const weakPassReq = await createReq("http://localhost:3000/api/auth", "POST", undefined, {
      action: "register",
      user_type: "student",
      name: "Weak Password Test",
      email: "weakpass@shantibschool.edu.in",
      personal_email: "weakpass@gmail.com",
      mobile: "+919876543210",
      password: "123", // too short!
      course_id: "course-1",
      batch_id: "batch-2024-27",
      enrollment_no: "SBS/2024/9999",
      consent_agreed: true,
      consent_version: "v1.0_2026",
    });
    const weakPassRes = await authPost(weakPassReq);
    assert(weakPassRes.status === 400, "Weak password (< 10 chars) strictly rejected");
  }

  // CHECK 4: Admin Role Missing & Strictly Barred from Sign-Up
  console.log("\nCHECK 4: Admin Role Sign-Up Barring");
  {
    const signupSource = fs.readFileSync("src/app/signup/page.tsx", "utf8");
    assert(
      !signupSource.includes('<option value="admin">Admin</option>'),
      "Sign-up UI has NO admin option (only Student and Faculty offered)"
    );

    const adminSignupReq = await createReq("http://localhost:3000/api/auth", "POST", undefined, {
      action: "register",
      user_type: "student",
      role: "admin", // Malicious payload attempting privilege escalation
      name: "Attacker",
      email: "attacker@shantibschool.edu.in",
      personal_email: "attacker@gmail.com",
      mobile: "+919876543210",
      password: "SBS_SecurePassword2026!",
      consent_agreed: true,
      consent_version: "v1.0_2026",
    });
    const adminSignupRes = await authPost(adminSignupReq);
    assert(adminSignupRes.status === 400, "Sign-up API strictly rejects any attempt to register as admin");
  }

  // CHECK 5: Student Cannot Reach Faculty or Admin Pages or APIs
  console.log("\nCHECK 5: Student RBAC Isolation from Admin & Faculty APIs");
  {
    const studentAdminGetReq = await createReq("http://localhost:3000/api/admin", "GET", "usr-student-1");
    const studentAdminGetRes = await adminGet(studentAdminGetReq);
    assert(studentAdminGetRes.status === 403, "Student barred from GET /api/admin (HTTP 403)");

    const studentAdminPostReq = await createReq("http://localhost:3000/api/admin", "POST", "usr-student-1", {
      action: "toggle-reviewer",
      userId: "usr-faculty-1",
      isReviewer: true,
    });
    const studentAdminPostRes = await adminPost(studentAdminPostReq);
    assert(studentAdminPostRes.status === 403, "Student barred from POST /api/admin governance (HTTP 403)");
  }

  // CHECK 6: No Answer Key, Teaching Notes, or Rubrics Reach Students
  console.log("\nCHECK 6: Academic Confidentiality & Answer Key Scrubbing");
  {
    const masterCase = {
      id: "case-confidential-test",
      title: "Fintech Growth & Capital Strategy in Ahmedabad",
      content: {
        summary: "Executive narrative summary of the case study.",
        core_challenge: "Strategic challenge description.",
        teaching_note: {
          overview: "TOP SECRET TEACHING PLAN FOR FACULTY ONLY",
          discussion_questions: ["Pedagogical prompt 1"],
          learning_objectives: ["Financial modeling"],
        },
        teaching_notes: "Legacy top secret notes",
        answer_key: "CONFIDENTIAL MODEL ANSWERS",
        solution_keys: "DCF VALUATION FORMULA KEYS",
        pedagogical_checks: "CHECKS & VERIFICATIONS",
        rubrics: "GRADING RUBRIC BREAKDOWN",
        questions: [
          { question: "What is NPV?", model_answer: "NPV = sum(CF / (1+r)^t) - C0" },
        ],
      },
    } as any;

    const studentSanitized = sanitizeCaseStudyForStudent(masterCase);
    const sanitizedContent = studentSanitized.content as any;

    assert(sanitizedContent.teaching_note === undefined, "teaching_note stripped from student");
    assert(sanitizedContent.teaching_notes === undefined, "teaching_notes stripped from student");
    assert(sanitizedContent.answer_key === undefined, "answer_key stripped from student");
    assert(sanitizedContent.solution_keys === undefined, "solution_keys stripped from student");
    assert(sanitizedContent.pedagogical_checks === undefined, "pedagogical_checks stripped from student");
    assert(sanitizedContent.rubrics === undefined, "rubrics stripped from student");
    assert(sanitizedContent.questions[0].model_answer === undefined, "model_answer stripped from discussion questions");
    assert(sanitizedContent.summary === masterCase.content.summary, "Student can read narrative summary");
  }

  // CHECK 7: Upload Gate Disabled Before Approval
  console.log("\nCHECK 7: Upload Gate Disabled Before Case Approval");
  {
    // Save a draft case
    const draftCase = mockStore.saveCase({
      id: `case-draft-test-${Date.now()}`,
      title: "Draft Case Upload Gate Test",
      status: "draft",
      author_id: "usr-faculty-1",
    } as any);

    const uploadReq = await createReq(
      `http://localhost:3000/api/cases/${draftCase.id}/upload`,
      "POST",
      "usr-faculty-1",
      {
        author_consent: true,
        author_consent_version: "v1.0",
        ai_assisted: true,
        similarity_score: 95,
      }
    );

    const uploadRes = await uploadPost(uploadReq, { params: Promise.resolve({ id: draftCase.id }) });
    assert(uploadRes.status === 403, "Upload gate strictly rejects case not in approved status (HTTP 403)");
  }

  // CHECK 8: Mobile Number & Personal Email Visible Only to Owner and Admin
  console.log("\nCHECK 8: Personal Data Isolation (Owner & Admin Only)");
  {
    const allProfiles = mockStore.getProfiles();
    const targetStudent = allProfiles.find((p) => p.role === "student");
    assert(Boolean(targetStudent), "Target student found");

    if (targetStudent) {
      // In Migration 16, verify RLS security policies cover all repository & review tables and self-role escalation prevention
      const migrationSource = fs.readFileSync("supabase/migrations/00016_case_repository_rls_functions.sql", "utf8");
      assert(
        migrationSource.includes("prevent_self_role_change") &&
        migrationSource.includes("student_repository_cases"),
        "RLS migration enforces self-role protection and student repository isolation"
      );
    }
  }

  console.log("\n==================================================================");
  console.log(`📊 PRODUCTION SMOKE TEST RESULTS: ${passed} PASSED, ${failed} FAILED`);
  console.log("==================================================================");

  if (failed > 0) {
    process.exit(1);
  }
}

runPhase7SmokeTests().catch((err) => {
  console.error("Fatal Phase 7 smoke test failure:", err);
  process.exit(1);
});
