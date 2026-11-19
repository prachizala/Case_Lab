import { NextRequest, NextResponse } from "next/server";
import { validateEmailDomain } from "@/lib/auth";
import {
  AUTH_COOKIE_NAME,
  setSessionCookie,
  clearSessionCookie,
  verifySessionToken,
} from "@/lib/session";
import { mockStore } from "@/lib/mock-db";
import { Profile, UserRole, UserType } from "@/lib/types";
import { ALLOWED_EMAIL_DOMAIN, COLLEGE_SHORT, getNextMonthResetKolkata } from "@/config/college";
import { checkAuthRateLimit } from "@/lib/rate-limit";
import {
  generateSecureOtp,
  canShowOtpOnScreen,
  isProductionEnv,
  assertNoDemoOtpInProduction,
  checkOtpResendRateLimit,
  validatePasswordStrength,
  checkLoginLockout,
  recordLoginFailure,
  resetLoginFailures,
} from "@/lib/auth-security";
import { isEmailProviderConfigured, sendOtpEmail } from "@/lib/email/send";
import { validatePersonalEmail, normalizeIndianMobile } from "@/lib/auth-validation";
import { checkAccess } from "@/lib/access-control";

export async function GET(req: NextRequest) {
  const sessionCookie = req.cookies.get(AUTH_COOKIE_NAME)?.value;
  if (!sessionCookie) {
    return NextResponse.json({ user: null, isAuthenticated: false }, { status: 200 });
  }

  const payload = await verifySessionToken(sessionCookie);
  if (!payload?.userId) {
    return NextResponse.json({ user: null, isAuthenticated: false }, { status: 200 });
  }

  // Load user from database, never trusting client
  const profile = mockStore.getProfile(payload.userId);
  if (profile) {
    return NextResponse.json({ user: profile, isAuthenticated: true });
  }

  return NextResponse.json({ user: null, isAuthenticated: false }, { status: 200 });
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { action, email, password, name, role = "student", otp } = body;
    const clientIp = req.headers.get("x-forwarded-for") || "local";

    if (action === "signup") {
      assertNoDemoOtpInProduction();

      if (!email || !password || !name) {
        return NextResponse.json(
          { error: "Name, email, and password are required." },
          { status: 400 }
        );
      }

      // Enforce enterprise password policy (>= 10 chars, upper, lower, number, no common words)
      const pwdPolicy = validatePasswordStrength(password);
      if (!pwdPolicy.valid) {
        return NextResponse.json(
          {
            error: pwdPolicy.errors[0],
            details: pwdPolicy.errors,
          },
          { status: 400 }
        );
      }

      // Mandatory statutory consent under DPDP Act 2023
      if (body.dpdp_consent !== true) {
        return NextResponse.json(
          { error: "Statutory consent under the DPDP Act 2023 is mandatory to create an academic account and process educational records." },
          { status: 400 }
        );
      }

      // Rate limit signup attempts by IP/email
      const rateKey = `signup:${email.toLowerCase().trim()}:${clientIp}`;
      const rate = checkAuthRateLimit(rateKey, 5, 15 * 60 * 1000);
      if (!rate.allowed) {
        return NextResponse.json(
          { error: "Too many registration attempts. Please wait 15 minutes before trying again." },
          { status: 429 }
        );
      }

      // Strict email format and disposable blocking check
      const validation = validateEmailDomain(email, mockStore.getAllowedDomains());
      if (!validation.isValid) {
        return NextResponse.json(
          { error: validation.errorMessage },
          { status: 400 }
        );
      }

      // Admin role cannot be registered via sign-up
      if (
        body.role === "admin" ||
        body.user_type === "admin" ||
        (email && email.toLowerCase().trim() === `admin@${ALLOWED_EMAIL_DOMAIN}`)
      ) {
        return NextResponse.json(
          { error: "Admin role cannot be registered via sign-up. The institutional administrator account is managed exclusively by the case centre." },
          { status: 400 }
        );
      }

      const userType = body.user_type || body.role;
      if (userType !== "student" && userType !== "faculty") {
        return NextResponse.json(
          { error: "Registration role must be either 'student' or 'faculty'." },
          { status: 400 }
        );
      }

      // Personal email validation
      let validatedPersonalEmail: string | null = null;
      if (body.personal_email) {
        const pCheck = validatePersonalEmail(body.personal_email, email);
        if (!pCheck.valid) {
          return NextResponse.json({ error: pCheck.error }, { status: 400 });
        }
        const existingPersonal = mockStore.getProfiles().find(
          (p) => p.personal_email && p.personal_email.toLowerCase() === body.personal_email.toLowerCase().trim()
        );
        if (existingPersonal) {
          return NextResponse.json(
            { error: "An account with this personal email address already exists. Please sign in instead." },
            { status: 409 }
          );
        }
        validatedPersonalEmail = body.personal_email.toLowerCase().trim();
      }

      // Indian mobile validation
      let normalizedMobile: string | null = null;
      if (body.mobile) {
        const mCheck = normalizeIndianMobile(body.mobile);
        if (!mCheck.valid) {
          return NextResponse.json({ error: mCheck.error }, { status: 400 });
        }
        normalizedMobile = mCheck.normalized || null;
      }

      // Enrollment number / Employee ID uniqueness
      const enrollmentNo = (body.enrollment_no || "").trim();
      if (enrollmentNo) {
        const existingEnrollment = mockStore.getProfiles().find(
          (p) => p.enrollment_no && p.enrollment_no.toLowerCase() === enrollmentNo.toLowerCase()
        );
        if (existingEnrollment) {
          return NextResponse.json(
            { error: "This Enrollment Number / Employee ID is already registered." },
            { status: 409 }
          );
        }
      }

      // Reject cross-type fields
      if (userType === "student") {
        if (body.faculty_type_id) {
          return NextResponse.json(
            { error: "Students cannot be assigned a faculty appointment type." },
            { status: 400 }
          );
        }
      } else if (userType === "faculty") {
        if (body.batch_id) {
          return NextResponse.json(
            { error: "Faculty members cannot be assigned to an academic student batch." },
            { status: 400 }
          );
        }
      }

      // Check if user with this SBS email already exists
      const existing = mockStore.getProfile(email.toLowerCase().trim());
      if (existing) {
        return NextResponse.json(
          { error: "An account with this email address already exists. Please sign in instead." },
          { status: 409 }
        );
      }

      const hasEmailProvider = isEmailProviderConfigured();
      const newRole: UserRole = userType as UserRole;

      const newProfile: Profile = {
        id: `usr-${Date.now()}`,
        email: email.toLowerCase().trim(),
        name: name.trim(),
        role: newRole,
        user_type: "sbs_member",
        personal_email: validatedPersonalEmail,
        mobile: normalizedMobile,
        enrollment_no: enrollmentNo || null,
        roll_no: body.roll_no?.trim() || null,
        course_id: body.course_id || null,
        batch_id: userType === "student" ? (body.batch_id || null) : null,
        department_id: userType === "faculty" ? (body.department_id || null) : null,
        faculty_type_id: userType === "faculty" ? (body.faculty_type_id || null) : null,
        is_reviewer: false,
        access_status: "pending",
        is_approved: false,
        approval_status: "pending_admin_approval",
        access_start: null,
        access_end: null,
        registered_at: new Date().toISOString(),
        email_verified_at: null,
        verification_otp: null,
        otp_expires_at: null,
        free_cases_used_this_month: 0,
        free_cases_reset_at: getNextMonthResetKolkata(),
        plan: "standard",
        sbs_eligible: true,
        dpdp_consent: true,
        dpdp_consent_at: new Date().toISOString(),
        consent_version: "2023.1",
        policy_version: "v1.2",
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      mockStore.addProfile(newProfile);
      mockStore.setUserPassword(newProfile.id, password);

      // Log registration and notify admin
      mockStore.logAudit(
        newProfile.id,
        newProfile.email,
        "registration_pending",
        newProfile.id,
        "user",
        {
          name: newProfile.name,
          role: newProfile.role,
          personal_email: newProfile.personal_email,
          mobile: newProfile.mobile,
          enrollment_no: newProfile.enrollment_no,
        }
      );

      // Flow 1: Default Institutional Approval Flow
      const generatedOtp = generateSecureOtp();
      const otpExpiresAt = new Date(Date.now() + 10 * 60 * 1000).toISOString(); // 10 minutes
      mockStore.setUserOtp(newProfile.id, generatedOtp, otpExpiresAt);

      if (hasEmailProvider) {
        await sendOtpEmail({
          to: newProfile.email,
          otp: generatedOtp,
          userName: newProfile.name,
        });
      }

      const showOtp = canShowOtpOnScreen();

      return NextResponse.json({
        success: true,
        pending_approval: true,
        message: "Your registration has been submitted and is awaiting institutional approval by Dean Academics.",
        user: newProfile,
        ...(showOtp ? { debug_otp: generatedOtp } : {}),
      });
    }

    if (action === "request-otp") {
      assertNoDemoOtpInProduction();
      const targetEmail = email?.toLowerCase().trim() || "";
      if (!targetEmail) {
        return NextResponse.json({ error: "Email is required to request a verification code." }, { status: 400 });
      }

      // Enforce 3 resends per hour limit per email and IP
      const resendCheck = checkOtpResendRateLimit(targetEmail, clientIp);
      if (!resendCheck.allowed) {
        return NextResponse.json(
          { error: "Maximum 3 resends per hour reached. Please wait before requesting another code." },
          { status: 429 }
        );
      }

      const profile = mockStore.getProfile(targetEmail);
      // Generic message to prevent email enumeration
      if (!profile) {
        return NextResponse.json({
          success: true,
          message: "If an account exists with this email address, a 6-digit verification code has been dispatched.",
        });
      }

      const generatedOtp = generateSecureOtp();
      const otpExpiresAt = new Date(Date.now() + 10 * 60 * 1000).toISOString(); // 10 minutes
      mockStore.setUserOtp(profile.id, generatedOtp, otpExpiresAt);

      if (isEmailProviderConfigured()) {
        await sendOtpEmail({
          to: profile.email,
          otp: generatedOtp,
          userName: profile.name,
        });
      }

      const showOtp = canShowOtpOnScreen();

      return NextResponse.json({
        success: true,
        message: "If an account exists with this email address, a 6-digit verification code has been dispatched.",
        ...(showOtp ? { debug_otp: generatedOtp } : {}),
      });
    }

    if (action === "verify-otp") {
      const targetEmail = email?.toLowerCase().trim() || "";
      const inputOtp = otp?.toString().trim() || "";

      if (!targetEmail || !inputOtp) {
        return NextResponse.json({ error: "Email and verification code are required." }, { status: 400 });
      }

      const rateKey = `otp-verify:${targetEmail}:${clientIp}`;
      const rate = checkAuthRateLimit(rateKey, 5, 15 * 60 * 1000);
      if (!rate.allowed) {
        return NextResponse.json(
          { error: "Too many verification attempts. Please wait 15 minutes." },
          { status: 429 }
        );
      }

      const result = mockStore.verifyUserOtp(targetEmail, inputOtp);
      if (!result.success) {
        return NextResponse.json({ error: result.message }, { status: 400 });
      }

      const response = NextResponse.json({
        success: true,
        message: result.message,
        user: result.profile,
      });

      if (result.profile) {
        await setSessionCookie(response, result.profile.id);
      }

      return response;
    }

    if (action === "login") {
      if (!email || !password) {
        return NextResponse.json(
          { error: "Email and password are required." },
          { status: 400 }
        );
      }

      // Check lockout from 5 previous failed attempts (15-minute lockout)
      const lockout = checkLoginLockout(email, clientIp);
      if (lockout.locked) {
        return NextResponse.json(
          { error: `Account is temporarily locked due to multiple failed login attempts. Please wait ${lockout.waitMinutes} minute(s).` },
          { status: 429 }
        );
      }

      const profile = mockStore.getProfile(email.toLowerCase().trim());
      if (!profile) {
        const failure = recordLoginFailure(email, clientIp);
        const remaining = Math.max(0, 5 - failure.failures);
        return NextResponse.json(
          {
            error: failure.locked
              ? "Maximum 5 failed login attempts exceeded. Account is locked for 15 minutes."
              : `Invalid credentials. ${remaining} attempt(s) remaining before temporary lockout.`,
          },
          { status: failure.locked ? 429 : 401 }
        );
      }

      // Verify password against stored hash or configured demo password
      const isPasswordValid = mockStore.verifyUserPassword(profile.id, password);
      if (!isPasswordValid) {
        const failure = recordLoginFailure(email, clientIp);
        const remaining = Math.max(0, 5 - failure.failures);
        return NextResponse.json(
          {
            error: failure.locked
              ? "Maximum 5 failed login attempts exceeded. Account is locked for 15 minutes."
              : `Invalid credentials. ${remaining} attempt(s) remaining before temporary lockout.`,
          },
          { status: failure.locked ? 429 : 401 }
        );
      }

      // Access status checks via checkAccess helper
      const access = checkAccess(profile);
      if (access.status === "pending") {
        return NextResponse.json(
          {
            error: "Your account registration is pending institutional administrator approval. You cannot sign in until approved.",
            access_status: "pending",
            registered_at: profile.registered_at,
            admin_contact: "admin@shantibschool.edu.in",
          },
          { status: 403 }
        );
      }

      if (access.status === "inactive") {
        return NextResponse.json(
          {
            error: "Your account is currently inactive. Please contact administration.",
            access_status: "inactive",
          },
          { status: 403 }
        );
      }

      // Successful login resets failure tracker
      resetLoginFailures(email, clientIp);

      const response = NextResponse.json({
        success: true,
        user: profile,
        access_status: access.status,
        access_end: profile.access_end,
      });

      // Set signed, tamper-proof session cookie
      await setSessionCookie(response, profile.id);

      return response;
    }

    if (action === "demo-login") {
      const targetEmail = (email || "").toLowerCase().trim();
      const officialDemoAccounts = [
        "admin@shantibschool.edu.in",
        "faculty@shantibschool.edu.in",
        "student@shantibschool.edu.in",
        "neha.sharma@shantibschool.edu.in",
        "reena.paswan@shantibschool.edu.in",
        "prachi.z24bca@shantibschool.edu.in",
      ];
      const isOfficialDemo = officialDemoAccounts.includes(targetEmail);
      const isDemoModeDisabled = process.env.NEXT_PUBLIC_ENABLE_DEMO_MODE === "false";

      // Allowed in dev, demo environments, or for official evaluation personas
      if (isDemoModeDisabled && !isOfficialDemo) {
        return NextResponse.json(
          { error: "One-click demo persona access is restricted to development and evaluation environments." },
          { status: 403 }
        );
      }

      if (!email) {
        return NextResponse.json({ error: "Email is required." }, { status: 400 });
      }

      const profile = mockStore.getProfile(targetEmail);
      if (!profile) {
        return NextResponse.json({ error: "Demo account not found." }, { status: 404 });
      }

      const response = NextResponse.json({
        success: true,
        user: profile,
      });

      await setSessionCookie(response, profile.id);
      return response;
    }

    if (action === "switch-role") {
      const targetUserId = body.userId;
      const allowedDemoUserIds = [
        "usr-admin-1",
        "usr-faculty-1",
        "usr-student-1",
      ];
      const isOfficialDemoUser = allowedDemoUserIds.includes(targetUserId);
      const isDemoModeDisabled = process.env.NEXT_PUBLIC_ENABLE_DEMO_MODE === "false";

      // Allows quick switching between Admin, Faculty, and Student personas for evaluators
      if (isDemoModeDisabled && !isOfficialDemoUser) {
        return NextResponse.json(
          { error: "Persona switching is strictly restricted to development and demo modes." },
          { status: 403 }
        );
      }

      const profile = mockStore.getProfile(targetUserId);
      if (!profile) {
        return NextResponse.json({ error: "User profile not found." }, { status: 404 });
      }

      const response = NextResponse.json({ success: true, user: profile });
      await setSessionCookie(response, profile.id);

      return response;
    }

    if (action === "logout") {
      const response = NextResponse.json({ success: true });
      clearSessionCookie(response);
      return response;
    }

    return NextResponse.json({ error: "Invalid auth action." }, { status: 400 });
  } catch (err: unknown) {
    console.error("Auth route error:", err);
    return NextResponse.json(
      {
        error: "Authentication service error.",
        details: err instanceof Error ? err.stack || err.message : String(err),
      },
      { status: 500 }
    );
  }
}
