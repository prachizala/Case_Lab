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
} from "@/lib/auth-security";
import { isEmailProviderConfigured, sendOtpEmail } from "@/lib/email/send";

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

      // Check if user already exists
      const existing = mockStore.getProfile(email.toLowerCase().trim());
      if (existing) {
        return NextResponse.json(
          { error: "An account with this email address already exists. Please sign in instead." },
          { status: 409 }
        );
      }

      const isCollegeAdmin = email.toLowerCase().trim() === `admin@${ALLOWED_EMAIL_DOMAIN}`;
      const requestedRole: UserRole = (body.role === "faculty" || body.role === "student") ? body.role : "faculty";
      const newRole: UserRole = isCollegeAdmin ? "admin" : requestedRole;
      const isProd = isProductionEnv();
      const hasEmailProvider = isEmailProviderConfigured();

      // If no email provider is configured in production, create as pending_admin_approval
      const isPendingAdminApproval = isProd && !hasEmailProvider && !isCollegeAdmin;
      const isApproved = !isPendingAdminApproval;
      const approvalStatus = isPendingAdminApproval ? "pending_admin_approval" : "approved";

      const userType: UserType = validation.userType;
      const newProfile: Profile = {
        id: `usr-${Date.now()}`,
        email: email.toLowerCase().trim(),
        name: name.trim(),
        role: newRole,
        user_type: userType,
        email_verified_at: null, // Require email verification
        verification_otp: null,
        otp_expires_at: null,
        free_cases_used_this_month: 0,
        free_cases_reset_at: getNextMonthResetKolkata(),
        department_id: null,
        plan: "standard",
        is_approved: isApproved,
        approval_status: approvalStatus,
        sbs_eligible: userType === "sbs_member",
        dpdp_consent: body.dpdp_consent ?? false,
        dpdp_consent_at: new Date().toISOString(),
        consent_version: "2023.1",
        policy_version: "v1.2",
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      mockStore.addProfile(newProfile);

      // Flow 1: Pending Admin Approval (Production without email provider)
      if (isPendingAdminApproval) {
        mockStore.logAudit(
          newProfile.id,
          newProfile.email,
          "registration_pending",
          newProfile.id,
          "user",
          { role: newProfile.role, reason: "No transactional email provider configured" }
        );

        return NextResponse.json({
          success: true,
          pending_approval: true,
          message: "Your registration is submitted for admin approval",
          user: newProfile,
        });
      }

      // Flow 2: Live or Dev OTP Verification
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

      // Safe debug OTP output: ONLY when explicitly configured in non-production environments
      const showOtp = canShowOtpOnScreen();

      const response = NextResponse.json({
        success: true,
        message: "Account created successfully. Please enter the 6-digit verification code sent to your email.",
        user: newProfile,
        user_type: userType,
        requires_verification: true,
        ...(showOtp ? { debug_otp: generatedOtp } : {}),
      });

      // Set signed, tamper-proof session cookie
      await setSessionCookie(response, newProfile.id);

      return response;
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

      const rateKey = `login:${email.toLowerCase().trim()}:${clientIp}`;
      const rate = checkAuthRateLimit(rateKey, 10, 15 * 60 * 1000);
      if (!rate.allowed) {
        return NextResponse.json(
          { error: "Too many login attempts. Please wait 15 minutes." },
          { status: 429 }
        );
      }

      const profile = mockStore.getProfile(email.toLowerCase().trim());
      if (!profile) {
        return NextResponse.json(
          { error: "Invalid credentials or account not found." },
          { status: 401 }
        );
      }

      if (!profile.is_approved || profile.approval_status === "pending_admin_approval") {
        return NextResponse.json(
          { error: "Your account registration is pending institutional administrator approval. You cannot sign in until approved." },
          { status: 403 }
        );
      }

      const response = NextResponse.json({
        success: true,
        user: profile,
      });

      // Set signed, tamper-proof session cookie
      await setSessionCookie(response, profile.id);

      return response;
    }

    if (action === "switch-role") {
      // Allows quick switching between Admin, Faculty, and Student personas only in dev/demo mode
      if (process.env.NODE_ENV === "production" && process.env.NEXT_PUBLIC_ENABLE_DEMO_MODE !== "true") {
        return NextResponse.json(
          { error: "Persona switching is strictly restricted to development and demo modes." },
          { status: 403 }
        );
      }

      const targetUserId = body.userId;
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
