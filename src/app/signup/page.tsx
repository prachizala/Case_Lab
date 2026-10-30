"use client";

import { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { ThemeToggle } from "@/components/ThemeToggle";
import { validateEmailDomain } from "@/lib/auth";
import { invalidateAuthCache } from "@/lib/auth-client";
import {
  ALLOWED_EMAIL_DOMAIN,
  COLLEGE_NAME_WITH_SHORT,
  COLLEGE_SHORT,
  APP_NAME,
  isSbsDomain,
  isDisposableEmail,
} from "@/config/college";
import {
  ShieldAlert,
  CheckCircle2,
  Lock,
  Mail,
  User,
  ArrowRight,
  KeyRound,
  RefreshCw,
  Sparkles,
  Globe,
} from "lucide-react";

function SignUpForm() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const initialEmail = searchParams.get("email") || "";
  const initialName = searchParams.get("name") || "";
  const errorParam = searchParams.get("error");
  const initialError = errorParam || null;

  const [step, setStep] = useState<"form" | "otp">("form");
  const [name, setName] = useState(initialName);
  const [email, setEmail] = useState(initialEmail);
  const [password, setPassword] = useState("");
  const [dpdpConsent, setDpdpConsent] = useState(false);
  const [error, setError] = useState<string | null>(initialError);
  const [success, setSuccess] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // OTP Verification state
  const [otpCode, setOtpCode] = useState("");
  const [debugOtp, setDebugOtp] = useState<string | null>(null);
  const [verifyingOtp, setVerifyingOtp] = useState(false);
  const [resendingOtp, setResendingOtp] = useState(false);

  // Email classification indicators
  const trimmedEmail = email.trim().toLowerCase();
  const isDisposable = trimmedEmail.length > 3 && isDisposableEmail(trimmedEmail);
  const isSbs = trimmedEmail.length > 3 && isSbsDomain(trimmedEmail);
  const isStandardEmail = trimmedEmail.includes("@") && trimmedEmail.includes(".") && !isDisposable && !isSbs;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (!dpdpConsent) {
      setError("Statutory consent is required under the DPDP Act 2023 to process educational records.");
      return;
    }

    const check = validateEmailDomain(email);
    if (!check.isValid) {
      setError(check.errorMessage || "Please provide a valid email address.");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("/api/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "signup",
          name,
          email: trimmedEmail,
          password,
          dpdp_consent: true,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to complete registration.");
      }

      setDebugOtp(data.debug_otp || null);
      setSuccess(data.message || "Account created! Please verify your email with the 6-digit OTP code.");
      setStep("otp");
    } catch (err: unknown) {
      console.error("Signup error:", err);
      const msg = err instanceof Error ? err.message : "Registration failed.";
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (!otpCode || otpCode.trim().length !== 6) {
      setError("Please enter the complete 6-digit verification code.");
      return;
    }

    setVerifyingOtp(true);

    try {
      const res = await fetch("/api/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "verify-otp",
          email: trimmedEmail,
          otp: otpCode.trim(),
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Verification failed. Please check your code.");
      }

      invalidateAuthCache();
      setSuccess("Email verified successfully! Taking you to the case generator...");
      setTimeout(() => {
        window.location.href = "/create";
      }, 1200);
    } catch (err: unknown) {
      console.error("OTP verification error:", err);
      const msg = err instanceof Error ? err.message : "Failed to verify code.";
      setError(msg);
    } finally {
      setVerifyingOtp(false);
    }
  };

  const handleResendOtp = async () => {
    setError(null);
    setSuccess(null);
    setResendingOtp(true);

    try {
      const res = await fetch("/api/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "request-otp",
          email: trimmedEmail,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to resend code.");
      }

      setDebugOtp(data.debug_otp || null);
      setSuccess(data.message || "A new 6-digit verification code has been generated.");
    } catch (err: unknown) {
      console.error("OTP resend error:", err);
      const msg = err instanceof Error ? err.message : "Failed to resend code.";
      setError(msg);
    } finally {
      setResendingOtp(false);
    }
  };

  return (
    <div className="min-h-screen bg-background text-text flex flex-col justify-between p-4 sm:p-8">
      {/* Top Brand Nav */}
      <div className="flex items-center justify-between max-w-5xl mx-auto w-full">
        <Link href="/" className="flex items-center gap-3">
          <div className="h-10 px-2.5 py-1 rounded-xl bg-white border border-border shadow-xs flex items-center justify-center shrink-0">
            <img
              src="/sbs-logo.png"
              alt="Shanti Business School Logo"
              className="h-8 w-auto object-contain"
            />
          </div>
          <div>
            <span className="font-serif font-bold text-lg text-text">
              {APP_NAME}
            </span>
            <span className="text-[10px] uppercase font-bold text-accent block tracking-widest">
              {COLLEGE_NAME_WITH_SHORT}
            </span>
          </div>
        </Link>
        <ThemeToggle />
      </div>

      {/* Main Card */}
      <div className="max-w-md mx-auto w-full my-8">
        <div className="p-8 rounded-3xl border border-border bg-surface shadow-xl space-y-6">
          <div className="text-center space-y-2">
            <div className="mx-auto w-fit p-2 rounded-2xl bg-white border border-border/80 shadow-xs mb-2">
              <img
                src="/sbs-logo.png"
                alt="Shanti Business School Logo"
                className="h-10 w-auto object-contain mx-auto"
              />
            </div>
            <h1 className="font-serif text-2xl font-bold text-text">
              {step === "otp" ? "Verify Your Email" : "Create CaseLab Account"}
            </h1>
            <p className="text-xs text-muted leading-relaxed">
              {step === "otp" ? (
                <span>
                  Enter the 6-digit verification code sent to{" "}
                  <strong className="font-mono text-text">{email}</strong>
                </span>
              ) : (
                <span>
                  Sign up with any valid email. SBS members get 30 cases/month. External guests get 3 free cases/month.
                </span>
              )}
            </p>
          </div>

          {/* Error Banner */}
          {error && (
            <div className="p-3.5 rounded-xl border border-danger/30 bg-danger/15 text-danger text-xs flex items-start gap-2.5">
              <ShieldAlert className="w-4 h-4 text-danger shrink-0 mt-0.5" />
              <div className="font-medium leading-relaxed">{error}</div>
            </div>
          )}

          {/* Success Banner */}
          {success && (
            <div className="p-3.5 rounded-xl border border-success/30 bg-success/15 text-success text-xs flex items-start gap-2.5">
              <CheckCircle2 className="w-4 h-4 text-success shrink-0 mt-0.5" />
              <div className="font-medium leading-relaxed">{success}</div>
            </div>
          )}

          {/* STEP 1: Registration Form */}
          {step === "form" && (
            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              <div>
                <label className="font-semibold text-text mb-1 block">
                  Full Name
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-muted absolute left-3 top-2.5" />
                  <input
                    type="text"
                    required
                    placeholder="e.g. Zala Prachi or Reena Paswan"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 rounded-xl border border-border bg-surface text-text focus:outline-none focus:ring-1 focus:ring-accent"
                  />
                </div>
              </div>

              <div>
                <label className="font-semibold text-text mb-1 flex items-center justify-between">
                  <span>Email Address</span>
                  <span className="text-[10px] text-muted font-normal">
                    Institutional or personal
                  </span>
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-muted absolute left-3 top-2.5" />
                  <input
                    type="email"
                    required
                    placeholder="you@shantibschool.edu.in or you@gmail.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 rounded-xl border border-border bg-surface text-text focus:outline-none focus:ring-1 focus:ring-accent font-mono text-xs"
                  />
                </div>

                {/* Inline Classification & Status Indicators */}
                {isDisposable && (
                  <p className="mt-1.5 text-[11px] text-danger flex items-center gap-1.5">
                    <ShieldAlert className="w-3.5 h-3.5 text-danger shrink-0" />
                    <span>Temporary or disposable email domains are blocked.</span>
                  </p>
                )}

                {isSbs && (
                  <p className="mt-1.5 text-[11px] text-success flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-success shrink-0" />
                    <span>Official SBS domain recognized — 30 fair-use cases/month</span>
                  </p>
                )}

                {isStandardEmail && (
                  <p className="mt-1.5 text-[11px] text-accent flex items-center gap-1.5">
                    <Globe className="w-3.5 h-3.5 text-accent shrink-0" />
                    <span>External Guest account — 3 free case generations/month</span>
                  </p>
                )}
              </div>

              <div>
                <label className="font-semibold text-text mb-1 block">
                  Password
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-muted absolute left-3 top-2.5" />
                  <input
                    type="password"
                    required
                    placeholder="••••••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 rounded-xl border border-border bg-surface text-text focus:outline-none focus:ring-1 focus:ring-accent font-mono"
                  />
                </div>
              </div>

              {/* Informative Role Banner */}
              <div className="p-3 rounded-xl bg-surface-raised border border-border/80 flex items-center gap-2.5 text-[11px] text-muted">
                <div className="w-6 h-6 rounded-lg bg-primary/10 text-primary flex items-center justify-center shrink-0 font-bold font-mono text-xs">
                  S
                </div>
                <div>
                  <span className="font-semibold text-text block">Default Access: Student & Member</span>
                  <span>Faculty and administrative permissions are provisioned by an institution administrator.</span>
                </div>
              </div>

              {/* DPDP Act 2023 Consent Checkbox */}
              <div className="pt-2">
                <label className="flex items-start gap-2.5 cursor-pointer select-none text-muted">
                  <input
                    type="checkbox"
                    required
                    checked={dpdpConsent}
                    onChange={(e) => setDpdpConsent(e.target.checked)}
                    className="mt-0.5 rounded text-accent focus:ring-accent w-4 h-4"
                  />
                  <span className="text-[11px] leading-relaxed">
                    I give explicit statutory consent under the{" "}
                    <strong className="text-text">DPDP Act 2023</strong>{" "}
                    for {COLLEGE_NAME_WITH_SHORT} to process my educational records, submissions, and credentials as detailed in the{" "}
                    <Link href="/privacy" target="_blank" className="underline text-accent font-semibold">
                      Privacy Policy
                    </Link>.
                  </span>
                </label>
              </div>

              <button
                type="submit"
                disabled={loading || !dpdpConsent || isDisposable}
                className="w-full py-3 rounded-xl bg-accent hover:bg-accent-hover text-accent-text font-serif font-bold text-sm shadow-md transition-all flex items-center justify-center gap-2 disabled:opacity-50"
              >
                <span>{loading ? "Creating Account..." : "Create Account & Send Code"}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>
          )}

          {/* STEP 2: OTP Verification Form */}
          {step === "otp" && (
            <form onSubmit={handleVerifyOtp} className="space-y-4 text-xs">
              <div>
                <label className="font-semibold text-text mb-1 block">
                  6-Digit Verification Code
                </label>
                <div className="relative">
                  <KeyRound className="w-4 h-4 text-muted absolute left-3 top-2.5" />
                  <input
                    type="text"
                    required
                    maxLength={6}
                    placeholder="123456"
                    value={otpCode}
                    onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, ""))}
                    className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-border bg-surface text-text tracking-widest font-mono text-center text-lg font-bold focus:outline-none focus:ring-2 focus:ring-accent"
                  />
                </div>

                {debugOtp && (
                  <div className="mt-2 p-2 rounded-lg bg-accent/10 border border-accent/20 text-[11px] text-accent flex items-center justify-between">
                    <span>Dev/Evaluation Code: <strong className="font-mono">{debugOtp}</strong></span>
                    <button
                      type="button"
                      onClick={() => setOtpCode(debugOtp)}
                      className="underline font-bold"
                    >
                      Fill Code
                    </button>
                  </div>
                )}
              </div>

              <button
                type="submit"
                disabled={verifyingOtp || otpCode.length !== 6}
                className="w-full py-3 rounded-xl bg-accent hover:bg-accent-hover text-accent-text font-serif font-bold text-sm shadow-md transition-all flex items-center justify-center gap-2 disabled:opacity-50"
              >
                <span>{verifyingOtp ? "Verifying Code..." : "Verify & Continue"}</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <div className="flex items-center justify-between pt-2 text-xs">
                <button
                  type="button"
                  onClick={() => setStep("form")}
                  className="text-muted hover:text-text transition-colors"
                >
                  ← Edit registration details
                </button>
                <button
                  type="button"
                  disabled={resendingOtp}
                  onClick={handleResendOtp}
                  className="text-accent font-semibold hover:underline flex items-center gap-1 disabled:opacity-50"
                >
                  <RefreshCw className={`w-3 h-3 ${resendingOtp ? "animate-spin" : ""}`} />
                  <span>{resendingOtp ? "Sending..." : "Resend code"}</span>
                </button>
              </div>
            </form>
          )}

          <div className="text-center text-xs text-muted border-t border-border pt-4">
            Already have an authorized account?{" "}
            <Link
              href="/login"
              className="font-semibold text-accent hover:underline"
            >
              Sign In
            </Link>
          </div>
        </div>
      </div>

      <div className="text-center text-xs text-muted">
        {COLLEGE_NAME_WITH_SHORT} • {APP_NAME} Platform
      </div>
    </div>
  );
}

export default function SignUpPage() {
  return (
    <Suspense fallback={null}>
      <SignUpForm />
    </Suspense>
  );
}
