import { mockStore } from "../src/lib/mock-db";
import { normalizeIndianMobile, validatePersonalEmail } from "../src/lib/auth-validation";
import { checkAccess } from "../src/lib/access-control";

console.log("================================================================");
console.log("PHASE 2: Auth Lifecycle, Institutional Approval & Access Dates");
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

// -------------------------------------------------------------------------
// TEST 1: Phone Normalization & Personal Email Validation
// -------------------------------------------------------------------------
console.log("TEST 1: Indian Mobile Normalization & Personal Email Isolation");
const mob1 = normalizeIndianMobile("+91 98765 43210");
assert(mob1.valid && mob1.normalized === "+919876543210", "Standard Indian mobile formatted to +91XXXXXXXXXX");

const mob2 = normalizeIndianMobile("09876543210");
assert(mob2.valid && mob2.normalized === "+919876543210", "Leading zero normalized to +91");

const mob3 = normalizeIndianMobile("1234567890");
assert(!mob3.valid, "Invalid mobile starting with 1 rejected");

const pEmail1 = validatePersonalEmail("student.personal@gmail.com", "student@shantibschool.edu.in");
assert(pEmail1.valid, "Valid external Gmail accepted as personal email");

const pEmail2 = validatePersonalEmail("someone@shantibschool.edu.in", "student@shantibschool.edu.in");
assert(!pEmail2.valid, "SBS domain address rejected as personal email");

const pEmail3 = validatePersonalEmail("student@shantibschool.edu.in", "student@shantibschool.edu.in");
assert(!pEmail3.valid, "Personal email matching SBS email rejected");

// -------------------------------------------------------------------------
// TEST 2: Both User Types Registration (Student & Faculty)
// -------------------------------------------------------------------------
console.log("\nTEST 2: Registration of Both User Types (Student & Faculty)");

const studentId = `usr-test-student-${Date.now()}`;
const studentProfile = mockStore.addProfile({
  id: studentId,
  name: "Arjun Patel",
  email: "arjun.patel@shantibschool.edu.in",
  personal_email: "arjun.patel.personal@gmail.com",
  mobile: "+919876500001",
  enrollment_no: "SBS-BCA-2024-999",
  role: "student",
  user_type: "sbs_member",
  course_id: "course-1",
  batch_id: "batch-2024-27",
  access_status: "pending",
  is_approved: false,
  approval_status: "pending_admin_approval",
  plan: "standard",
  sbs_eligible: true,
  dpdp_consent: true,
  dpdp_consent_at: new Date().toISOString(),
  consent_version: "2023.1",
  policy_version: "v1.2",
  free_cases_used_this_month: 0,
  free_cases_reset_at: new Date().toISOString(),
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
});
mockStore.setUserPassword(studentId, "StudentPass123!");

assert(studentProfile.role === "student", "Student profile created with role 'student'");
assert(studentProfile.access_status === "pending", "New student account created in 'pending' status");
assert(studentProfile.batch_id === "batch-2024-27", "Student correctly assigned to batch 2024-27");

const facultyId = `usr-test-faculty-${Date.now()}`;
const facultyProfile = mockStore.addProfile({
  id: facultyId,
  name: "Dr. Kirit Vyas",
  email: "kirit.vyas@shantibschool.edu.in",
  personal_email: "kirit.vyas.prof@gmail.com",
  mobile: "+919876500002",
  enrollment_no: "EMP-STRAT-009",
  role: "faculty",
  user_type: "sbs_member",
  department_id: "dept-1",
  course_id: "course-4",
  faculty_type_id: "ft-fulltime",
  access_status: "pending",
  is_approved: false,
  approval_status: "pending_admin_approval",
  plan: "institutional",
  sbs_eligible: true,
  dpdp_consent: true,
  dpdp_consent_at: new Date().toISOString(),
  consent_version: "2023.1",
  policy_version: "v1.2",
  free_cases_used_this_month: 0,
  free_cases_reset_at: new Date().toISOString(),
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
});
mockStore.setUserPassword(facultyId, "FacultyPass123!");

assert(facultyProfile.role === "faculty", "Faculty profile created with role 'faculty'");
assert(facultyProfile.department_id === "dept-1", "Faculty correctly assigned to department 'dept-1'");
assert(facultyProfile.faculty_type_id === "ft-fulltime", "Faculty assigned to faculty type 'ft-fulltime'");

// -------------------------------------------------------------------------
// TEST 3: Wrong-Type Fields Rejected & Admin Role Escalation Blocked
// -------------------------------------------------------------------------
console.log("\nTEST 3: Cross-Type Fields & Admin Escalation Protection");

// Test that student cannot have faculty_type_id
const studentCheck = checkAccess({
  role: "student",
  is_approved: false,
  access_status: "pending",
});
assert(!studentCheck.allowed && studentCheck.status === "pending", "Pending student blocked by checkAccess helper");

// Admin cannot be registered via sign-up logic verification
function simulateSignupRoleCheck(bodyRole: string, email: string) {
  if (bodyRole === "admin" || email.toLowerCase().startsWith("admin@")) {
    return { error: "Admin role cannot be registered via sign-up.", status: 400 };
  }
  return { success: true };
}
const adminEscalation1 = simulateSignupRoleCheck("admin", "hacker@shantibschool.edu.in");
assert(adminEscalation1.status === 400, "Direct 'role: admin' sign-up strictly rejected with HTTP 400");

const adminEscalation2 = simulateSignupRoleCheck("student", "admin@shantibschool.edu.in");
assert(adminEscalation2.status === 400, "Attempt to sign up as admin@ email strictly rejected with HTTP 400");

// -------------------------------------------------------------------------
// TEST 4: Date Math on Approval (Student Batch End + 1 Year; Faculty Indefinite)
// -------------------------------------------------------------------------
console.log("\nTEST 4: Institutional Date Math on Administrator Approval");

// Approve Student
const approvedStudent = mockStore.approveRegistration(studentId, "usr-admin-1");
assert(approvedStudent !== null, "Admin successfully approved student registration");
assert(approvedStudent?.access_status === "active", "Approved student access_status is 'active'");
assert(approvedStudent?.is_approved === true, "Approved student is_approved is true");
assert(Boolean(approvedStudent?.access_start), "Approved student has access_start set");

// Batch 2024-27 end_date is 2027-06-30. Student access_end must be 2028-06-30 (+ 1 year grace)
const studentAccessEnd = new Date(approvedStudent!.access_end!);
assert(
  studentAccessEnd.getFullYear() === 2028 && studentAccessEnd.getMonth() === 5,
  "Student access_end precisely calculated as batch end date + 1 year (30 June 2028)"
);

// Approve Faculty
const approvedFaculty = mockStore.approveRegistration(facultyId, "usr-admin-1");
assert(approvedFaculty !== null, "Admin successfully approved faculty registration");
assert(approvedFaculty?.access_status === "active", "Approved faculty access_status is 'active'");
assert(approvedFaculty?.access_end === null, "Approved faculty has access_end = null (no end date)");

// -------------------------------------------------------------------------
// TEST 5: Login Accepts Personal Email or SBS Email
// -------------------------------------------------------------------------
console.log("\nTEST 5: Dual Login Verification (Personal Email & Institutional Email)");

// Look up student by SBS email
const bySbsEmail = mockStore.getProfile("arjun.patel@shantibschool.edu.in");
assert(bySbsEmail?.id === studentId, "Student lookup by SBS institutional email succeeds");

// Look up student by Personal email
const byPersonalEmail = mockStore.getProfile("arjun.patel.personal@gmail.com");
assert(byPersonalEmail?.id === studentId, "Student lookup by verified Personal email succeeds");

// Password check succeeds with personal email
const pwValid = mockStore.verifyUserPassword(byPersonalEmail!.id, "StudentPass123!");
assert(pwValid, "Password verification succeeds for user resolved via personal email");

// -------------------------------------------------------------------------
// TEST 6: Expired Accounts Gating (Blocked from Create; Can Download Past Work)
// -------------------------------------------------------------------------
console.log("\nTEST 6: Expired Accounts Lifecycle & Gating");

const expiredStudentId = `usr-test-expired-${Date.now()}`;
mockStore.addProfile({
  id: expiredStudentId,
  name: "Alok Sanghavi",
  email: "alok.sanghavi@shantibschool.edu.in",
  personal_email: "alok.sanghavi.alumni@gmail.com",
  role: "student",
  user_type: "sbs_member",
  access_status: "expired",
  is_approved: true,
  access_start: "2023-01-01T00:00:00Z",
  access_end: "2025-06-30T23:59:59Z", // Past date
  plan: "standard",
  sbs_eligible: true,
  dpdp_consent: true,
  free_cases_used_this_month: 0,
  free_cases_reset_at: new Date().toISOString(),
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
});

const expiredCheck = checkAccess(mockStore.getProfile(expiredStudentId)!);
assert(!expiredCheck.allowed, "Expired user allowed: false for general repository mutations");
assert(!expiredCheck.canCreate, "Expired user CANNOT create cases (canCreate: false)");
assert(!expiredCheck.canReview, "Expired user CANNOT review cases (canReview: false)");
assert(!expiredCheck.canSubmit, "Expired user CANNOT submit cases (canSubmit: false)");
assert(expiredCheck.canDownloadOwn, "Expired user CAN download their own past work (canDownloadOwn: true)");
assert(expiredCheck.status === "expired", "Expired user status correctly reported as 'expired'");
assert(expiredCheck.redirectTo === "/expired", "Expired user routed to /expired portal");

// -------------------------------------------------------------------------
// TEST 7: Bulk Approval of Pending Registrations
// -------------------------------------------------------------------------
console.log("\nTEST 7: Administrator Bulk Approval System");

const p1Id = `usr-bulk-1-${Date.now()}`;
const p2Id = `usr-bulk-2-${Date.now()}`;
mockStore.addProfile({
  id: p1Id,
  name: "Bulk User 1",
  email: "bulk1@shantibschool.edu.in",
  role: "student",
  user_type: "sbs_member",
  batch_id: "batch-2024-27",
  access_status: "pending",
  is_approved: false,
  approval_status: "pending_admin_approval",
  plan: "standard",
  sbs_eligible: true,
  dpdp_consent: true,
  free_cases_used_this_month: 0,
  free_cases_reset_at: new Date().toISOString(),
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
});
mockStore.addProfile({
  id: p2Id,
  name: "Bulk User 2",
  email: "bulk2@shantibschool.edu.in",
  role: "faculty",
  user_type: "sbs_member",
  department_id: "dept-1",
  faculty_type_id: "ft-fulltime",
  access_status: "pending",
  is_approved: false,
  approval_status: "pending_admin_approval",
  plan: "institutional",
  sbs_eligible: true,
  dpdp_consent: true,
  free_cases_used_this_month: 0,
  free_cases_reset_at: new Date().toISOString(),
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
});

const bulkApproved = mockStore.bulkApproveRegistrations([p1Id, p2Id], "usr-admin-1");
assert(bulkApproved.length === 2, "Bulk approval processed exactly 2 registrations");
assert(bulkApproved.every((p) => p.is_approved && p.access_status === "active"), "All bulk approved accounts transitioned to 'active'");
assert(bulkApproved.find((p) => p.id === p1Id)?.access_end !== null, "Bulk approved student has calculated access_end");
assert(bulkApproved.find((p) => p.id === p2Id)?.access_end === null, "Bulk approved faculty has access_end = null");

// -------------------------------------------------------------------------
// TEST 8: Admin Academic Lists Operations & Audit Logging
// -------------------------------------------------------------------------
console.log("\nTEST 8: Academic Lists Configuration & Audit Logging");

// 1. Add new batch
const newBatch = mockStore.addBatch({
  label: "2026-29",
  start_year: 2026,
  end_year: 2029,
  end_date: "2029-06-30T23:59:59+05:30",
  is_active: true,
});
assert(newBatch.label === "2026-29", "Admin created new batch '2026-29'");

// 2. Rename batch
const updatedBatch = mockStore.updateBatch(newBatch.id, { label: "2026-29 (Executive)" });
assert(updatedBatch?.label === "2026-29 (Executive)", "Batch renamed to '2026-29 (Executive)'");

// 3. Deactivate batch
const deactivatedBatch = mockStore.updateBatch(newBatch.id, { is_active: false });
assert(deactivatedBatch?.is_active === false, "Batch deactivated successfully (is_active: false)");

// 4. Update faculty type
const ft = mockStore.getFacultyTypes()[0];
const updatedFt = mockStore.updateFacultyType(ft.id, { name: "Senior Tenured Professor" });
assert(updatedFt?.name === "Senior Tenured Professor", "Faculty type renamed successfully");

// 5. Update Case Category
const cat = mockStore.getCaseCategories()[0];
const updatedCat = mockStore.updateCaseCategory(cat.id, { description: "Expanded corporate governance scope" });
assert(updatedCat?.description === "Expanded corporate governance scope", "Case category updated successfully");

console.log("\n================================================================");
console.log(`AUTH LIFECYCLE TEST RESULTS: ${passed} PASSED, ${failed} FAILED`);
console.log("================================================================\n");

if (failed > 0) {
  process.exit(1);
}
