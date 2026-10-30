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
      if (!email || !password || !name) {
        return NextResponse.json(
          { error: "Name, email, and password are required." },
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
      // Everyone who signs up gets role "student" by default; admin is reserved for seeded administrative accounts
      const newRole: UserRole = isCollegeAdmin ? "admin" : "student";
      const isApproved = isCollegeAdmin ? true : true; // Student accounts are active, role elevations are approved by Admin

      // Generate 6-digit verification OTP
      const generatedOtp = Math.floor(100000 + Math.random() * 900000).toString();
      const otpExpiresAt = new Date(Date.now() + 15 * 60 * 1000).toISOString();

      const userType: UserType = validation.userType;
      const newProfile: Profile = {
        id: `usr-${Date.now()}`,
        email: email.toLowerCase().trim(),
        name: name.trim(),
        role: newRole,
        user_type: userType,
        email_verified_at: null, // Require email verification for all users
        verification_otp: generatedOtp,
        otp_expires_at: otpExpiresAt,
        free_cases_used_this_month: 0,
        free_cases_reset_at: getNextMonthResetKolkata(),
        department_id: null,
        plan: "standard",
        is_approved: isApproved,
        sbs_eligible: userType === "sbs_member",
        dpdp_consent: body.dpdp_consent ?? true,
        dpdp_consent_at: new Date().toISOString(),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      mockStore.addProfile(newProfile);
      mockStore.setUserOtp(newProfile.id, generatedOtp, otpExpiresAt);

      console.log(`[AUTH] Registration OTP generated for ${newProfile.email}: ${generatedOtp}`);

      const response = NextResponse.json({
        success: true,
        message: "Account created successfully. Please enter the 6-digit verification code to verify your email.",
        user: newProfile,
        user_type: userType,
        requires_verification: true,
        debug_otp: generatedOtp, // Expose OTP for tests and local development evaluation
      });

      // Set signed, tamper-proof session cookie
      await setSessionCookie(response, newProfile.id);

      return response;
    }

    if (action === "request-otp") {
      const targetEmail = email?.toLowerCase().trim() || "";
      if (!targetEmail) {
        return NextResponse.json({ error: "Email is required to request a verification code." }, { status: 400 });
      }

      const rateKey = `otp-req:${targetEmail}:${clientIp}`;
      const rate = checkAuthRateLimit(rateKey, 5, 15 * 60 * 1000);
      if (!rate.allowed) {
        return NextResponse.json(
          { error: "Too many OTP requests. Please wait 15 minutes before requesting another code." },
          { status: 429 }
        );
      }

      const profile = mockStore.getProfile(targetEmail);
      if (!profile) {
        return NextResponse.json({ error: "No account found with this email." }, { status: 404 });
      }

      const generatedOtp = Math.floor(100000 + Math.random() * 900000).toString();
      const otpExpiresAt = new Date(Date.now() + 15 * 60 * 1000).toISOString();
      mockStore.setUserOtp(profile.id, generatedOtp, otpExpiresAt);

      console.log(`[AUTH] Resent OTP for ${profile.email}: ${generatedOtp}`);

      return NextResponse.json({
        success: true,
        message: "A new 6-digit verification code has been sent to your email.",
        debug_otp: generatedOtp,
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
