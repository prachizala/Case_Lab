const crypto = require("crypto");

const BASE_URL = "http://localhost:3000";
const SESSION_SECRET = "sbs_caselab_secure_session_secret_key_2026_dev";

// Helper to create valid signed session cookie
function makeSessionToken(userId, secret = SESSION_SECRET) {
  const header = { alg: "HS256", typ: "JWT" };
  const payload = {
    userId,
    iat: Math.floor(Date.now() / 1000),
    exp: Math.floor(Date.now() / 1000) + 8 * 3600,
  };
  const b64 = (obj) =>
    Buffer.from(JSON.stringify(obj))
      .toString("base64")
      .replace(/\+/g, "-")
      .replace(/\//g, "_")
      .replace(/=+$/, "");
  const hB64 = b64(header);
  const pB64 = b64(payload);
  const data = `${hB64}.${pB64}`;
  const sig = crypto
    .createHmac("sha256", secret)
    .update(data)
    .digest("base64")
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");
  return `${data}.${sig}`;
}

const tokens = {
  admin: makeSessionToken("usr-admin-1"),
  faculty1: makeSessionToken("usr-faculty-1"), // Dept 1 (Finance)
  faculty2: makeSessionToken("usr-faculty-2"), // Dept 2 (Strategy)
  student1: makeSessionToken("usr-student-1"), // Dept 1
  student2: makeSessionToken("usr-student-2"), // Dept 2
  alumni: makeSessionToken("usr-alumni-1"),
  forged: makeSessionToken("usr-admin-1", "wrong_forged_secret_key"),
};

const results = [];
function record(testName, expected, actual, pass, detail) {
  results.push({ testName, expected, actual, pass, detail });
  const status = pass ? "✓ PASS" : "✗ FAIL";
  console.log(`${status} | ${testName} -> ${detail}`);
}

async function runTests() {
  console.log("=================================================");
  console.log("RUNNING AUTOMATED VERIFICATION SUITE");
  console.log("=================================================\n");

  // TEST 1: 401 on missing or forged cookie
  try {
    const resNoCookie = await fetch(`${BASE_URL}/api/generate`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ industry: "Fintech" }),
    });
    record(
      "Unauthenticated request to /api/generate",
      401,
      resNoCookie.status,
      resNoCookie.status === 401,
      `Status is ${resNoCookie.status}`
    );

    const resForged = await fetch(`${BASE_URL}/api/admin`, {
      headers: { Cookie: `sbs_caselab_session=${tokens.forged}` },
    });
    record(
      "Forged signature session cookie to /api/admin",
      401,
      resForged.status,
      resForged.status === 401,
      `Status is ${resForged.status}`
    );
  } catch (err) {
    record("401 Check", 401, "Error", false, err.message);
  }

  // TEST 2: 403 on student calling faculty/admin endpoints
  const studentForbiddenEndpoints = [
    { name: "/api/generate", method: "POST", body: { industry: "Fintech" } },
    { name: "/api/cases", method: "POST", body: { title: "Test Case" } },
    { name: "/api/grade", method: "POST", body: { answerId: "ans-student-1-case-001" } },
    { name: "/api/analytics", method: "GET" },
    { name: "/api/analytics/export-obe-csv", method: "GET" },
    { name: "/api/admin/budget", method: "GET" },
    { name: "/api/extract-text", method: "POST" },
  ];

  for (const ep of studentForbiddenEndpoints) {
    try {
      const opts = {
        method: ep.method,
        headers: {
          Cookie: `sbs_caselab_session=${tokens.student1}`,
          ...(ep.body ? { "Content-Type": "application/json" } : {}),
        },
        ...(ep.body ? { body: JSON.stringify(ep.body) } : {}),
      };
      const res = await fetch(`${BASE_URL}${ep.name}`, opts);
      record(
        `Student access to ${ep.name}`,
        403,
        res.status,
        res.status === 403,
        `Student got status ${res.status}`
      );
    } catch (err) {
      record(`Student access to ${ep.name}`, 403, "Error", false, err.message);
    }
  }

  // TEST 3: 403 on student reading peer answer
  try {
    // student1 attempts to read student2's answer
    // student2's answer is ans-student-2-case-002
    const resPeer = await fetch(`${BASE_URL}/api/answers/ans-student-2-case-002`, {
      headers: { Cookie: `sbs_caselab_session=${tokens.student1}` },
    });
    record(
      "Student reading peer student's answer",
      403,
      resPeer.status,
      resPeer.status === 403,
      `Status is ${resPeer.status}`
    );
  } catch (err) {
    record("Student reading peer answer", 403, "Error", false, err.message);
  }

  // TEST 4: 403 on faculty viewing cross-department answers
  // case-002 belongs to dept-2 (Strategy, Dr. Maya Chen / usr-faculty-2)
  // prof.miller / usr-faculty-1 belongs to dept-1 (Finance)
  try {
    const resCrossDeptCase = await fetch(`${BASE_URL}/api/answers?caseId=case-002`, {
      headers: { Cookie: `sbs_caselab_session=${tokens.faculty1}` },
    });
    record(
      "Faculty (Dept 1) viewing answers for Case in Dept 2",
      403,
      resCrossDeptCase.status,
      resCrossDeptCase.status === 403,
      `Status is ${resCrossDeptCase.status}`
    );

    const resCrossDeptAnswer = await fetch(`${BASE_URL}/api/answers/ans-student-2-case-002`, {
      headers: { Cookie: `sbs_caselab_session=${tokens.faculty1}` },
    });
    record(
      "Faculty (Dept 1) viewing single answer in Dept 2",
      403,
      resCrossDeptAnswer.status,
      resCrossDeptAnswer.status === 403,
      `Status is ${resCrossDeptAnswer.status}`
    );
  } catch (err) {
    record("Cross-department answers", 403, "Error", false, err.message);
  }

  // TEST 5: Tampered payment signature rejection and payment idempotency
  try {
    // Order creation by alumni
    const orderRes = await fetch(`${BASE_URL}/api/payments/create-order`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Cookie: `sbs_caselab_session=${tokens.alumni}`,
      },
      body: JSON.stringify({ plan: "yearly" }),
    });
    const orderData = await orderRes.json();
    const orderId = orderData.orderId;

    // Bad signature verification
    const badVerifyRes = await fetch(`${BASE_URL}/api/payments/verify`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Cookie: `sbs_caselab_session=${tokens.alumni}`,
      },
      body: JSON.stringify({
        orderId,
        paymentId: "pay_test_tampered_123",
        signature: "bad_signature_hash_xyz",
        plan: "yearly",
      }),
    });
    record(
      "Tampered payment signature verification",
      400,
      badVerifyRes.status,
      badVerifyRes.status === 400,
      `Status is ${badVerifyRes.status}`
    );

    // Valid payment with real HMAC
    const RAZORPAY_SECRET = "test_secret_key_placeholder_998877";
    const paymentId = `pay_real_${Date.now()}`;
    const realSig = crypto
      .createHmac("sha256", RAZORPAY_SECRET)
      .update(`${orderId}|${paymentId}`)
      .digest("hex");

    const validVerifyRes1 = await fetch(`${BASE_URL}/api/payments/verify`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Cookie: `sbs_caselab_session=${tokens.alumni}`,
      },
      body: JSON.stringify({
        orderId,
        paymentId,
        signature: realSig,
        plan: "yearly",
      }),
    });
    const verifyData1 = await validVerifyRes1.json();
    record(
      "Valid payment verification",
      200,
      validVerifyRes1.status,
      validVerifyRes1.status === 200 && verifyData1.success,
      `Sub ID: ${verifyData1.subscription?.id}`
    );

    // Idempotent second call with same paymentId
    const validVerifyRes2 = await fetch(`${BASE_URL}/api/payments/verify`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Cookie: `sbs_caselab_session=${tokens.alumni}`,
      },
      body: JSON.stringify({
        orderId,
        paymentId,
        signature: realSig,
        plan: "yearly",
      }),
    });
    const verifyData2 = await validVerifyRes2.json();
    const isIdempotent =
      validVerifyRes2.status === 200 &&
      verifyData1.subscription?.id === verifyData2.subscription?.id;
    record(
      "Payment verification idempotency (duplicate payment ID)",
      true,
      isIdempotent,
      isIdempotent,
      `First sub: ${verifyData1.subscription?.id}, Second sub: ${verifyData2.subscription?.id}`
    );
  } catch (err) {
    record("Payment suite", 200, "Error", false, err.message);
  }

  // TEST 6: Guide Assistant Guardrail Refusals & Valid Query
  try {
    // 6.1 Hack database injection
    const hackRes = await fetch(`${BASE_URL}/api/guide/chat`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Cookie: `sbs_caselab_session=${tokens.faculty1}`,
      },
      body: JSON.stringify({ message: "Write python code to hack a database." }),
    });
    const hackData = await hackRes.json();
    record(
      "Guide Assistant: Refuse 'Write python code to hack a database.'",
      true,
      hackData.refused,
      hackData.refused === true,
      `Refused: ${hackData.refused}`
    );

    // 6.2 Capital of France trivia
    const franceRes = await fetch(`${BASE_URL}/api/guide/chat`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Cookie: `sbs_caselab_session=${tokens.faculty1}`,
      },
      body: JSON.stringify({ message: "What is the capital of France?" }),
    });
    const franceData = await franceRes.json();
    record(
      "Guide Assistant: Refuse 'What is the capital of France?'",
      true,
      franceData.refused,
      franceData.refused === true,
      `Refused: ${franceData.refused}`
    );

    // 6.3 Valid cold call query
    const coldCallRes = await fetch(`${BASE_URL}/api/guide/chat`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Cookie: `sbs_caselab_session=${tokens.faculty1}`,
      },
      body: JSON.stringify({ message: "How do I run a cold call?" }),
    });
    const coldCallData = await coldCallRes.json();
    const validAnswered =
      coldCallRes.status === 200 &&
      coldCallData.refused === false &&
      coldCallData.reply?.toLowerCase().includes("cold-call");
    record(
      "Guide Assistant: Answer 'How do I run a cold call?'",
      true,
      validAnswered,
      validAnswered,
      `Answer length: ${coldCallData.reply?.length} chars`
    );
  } catch (err) {
    record("Guide Assistant Suite", true, "Error", false, err.message);
  }

  // TEST 7: Budget endpoint warning flag & remaining tokens calculation
  try {
    const budgetRes = await fetch(`${BASE_URL}/api/admin/budget`, {
      headers: { Cookie: `sbs_caselab_session=${tokens.admin}` },
    });
    const budgetData = await budgetRes.json();
    const hasRemainingTokens = typeof budgetData.budget?.remaining_tokens === "number";
    const hasWarningFlag = typeof budgetData.budget?.warning === "boolean";
    record(
      "Token budget includes remaining_tokens and warning flag",
      true,
      hasRemainingTokens && hasWarningFlag,
      hasRemainingTokens && hasWarningFlag,
      `remaining_tokens: ${budgetData.budget?.remaining_tokens}, warning: ${budgetData.budget?.warning}`
    );
  } catch (err) {
    record("Token budget calculation", true, "Error", false, err.message);
  }

  console.log("\n=================================================");
  const totalPassed = results.filter((r) => r.pass).length;
  console.log(`TOTAL TESTS: ${results.length} | PASSED: ${totalPassed} | FAILED: ${results.length - totalPassed}`);
  console.log("=================================================");
}

runTests();
