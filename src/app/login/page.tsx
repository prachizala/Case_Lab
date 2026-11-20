"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ThemeToggle } from "@/components/ThemeToggle";
import { getDefaultDemoUsers } from "@/lib/auth";
import { invalidateAuthCache } from "@/lib/auth-client";
import {
  ALLOWED_EMAIL_DOMAIN,
  COLLEGE_NAME_WITH_SHORT,
  COLLEGE_SHORT,
  APP_NAME,
} from "@/config/college";
import {
  Lock,
  Mail,
  ArrowRight,
  AlertCircle,
  Sparkles,
  Eye,
  EyeOff,
} from "lucide-react";

export default function LoginPage() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const demoUsers = getDefaultDemoUsers();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const res = await fetch("/api/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "login", email, password }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Login credentials could not be verified.");
      }

      invalidateAuthCache();
      window.location.href = "/dashboard";
    } catch (err: unknown) {
      console.error("Login error:", err);
      const msg = err instanceof Error ? err.message : "Authentication failed.";
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleQuickDemoLogin = async (targetEmail: string) => {
    setError(null);
    setLoading(true);

    try {
      const res = await fetch("/api/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "demo-login", email: targetEmail }),
      });

      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(data.error || "Could not log into demo account.");
      }
      invalidateAuthCache();
      window.location.href = "/dashboard";
    } catch (err: unknown) {
      console.error(err);
      const msg = err instanceof Error ? err.message : "Demo login failed.";
      setError(msg);
    } finally {
      setLoading(false);
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
        <div className="flex items-center gap-3">
          <ThemeToggle />
          <Link
            href="/signup"
            className="px-4 py-2 rounded-xl text-xs font-semibold text-accent hover:underline transition-colors"
          >
            Register
          </Link>
        </div>
      </div>

      {/* Main Login Card */}
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
              Sign In to {APP_NAME}
            </h1>
            <p className="text-xs text-muted">
              Sign in with your email address
            </p>
          </div>

          {/* Quick Persona Access for Evaluators */}
          <div className="p-3.5 rounded-2xl bg-primary-soft/60 border border-border space-y-2">
            <div className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-accent">
              <Sparkles className="w-3.5 h-3.5" />
              <span>One-Click Test Persona:</span>
            </div>
            <div className="grid grid-cols-3 gap-1.5">
              {demoUsers.map((u) => {
                const personaName = u.role === "admin" ? "Admin" : u.role === "faculty" ? "Faculty" : "Student";
                return (
                  <button
                    key={u.role}
                    type="button"
                    onClick={() => {
                      setEmail(u.email);
                      setPassword("");
                      handleQuickDemoLogin(u.email);
                    }}
                    className="p-2.5 rounded-xl border border-border bg-surface text-center hover:border-accent hover:bg-primary-soft/40 transition-all shadow-xs group"
                    title={`Sign in as ${personaName} (${u.email})`}
                  >
                    <span className="text-[11px] font-bold block uppercase text-text group-hover:text-accent">
                      {u.role}
                    </span>
                    <span className="text-[10px] text-muted block font-semibold">
                      {personaName}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {error && (
            <div className="p-3 rounded-xl border border-danger/30 bg-danger/15 text-danger text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4 text-xs">
            <div>
              <label className="font-semibold text-text mb-1 block">
                Email Address
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-muted absolute left-3 top-2.5" />
                <input
                  type="text"
                  required
                  placeholder="e.g. name@shantibschool.edu.in or personal email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 rounded-xl border border-border bg-surface text-text focus:outline-none focus:ring-1 focus:ring-accent font-mono"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="font-semibold text-text">
                  Password
                </label>
              </div>
              <div className="relative">
                <Lock className="w-4 h-4 text-muted absolute left-3 top-2.5" />
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  placeholder="••••••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-9 pr-10 py-2 rounded-xl border border-border bg-surface text-text focus:outline-none focus:ring-1 focus:ring-accent font-mono"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-2.5 text-muted hover:text-text transition-colors cursor-pointer"
                  title={showPassword ? "Hide password" : "Show password"}
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-xl bg-accent hover:bg-accent-hover text-accent-text font-serif font-bold text-sm shadow-md transition-all flex items-center justify-center gap-2 disabled:opacity-50"
            >
              <span>{loading ? "Signing In..." : "Sign In"}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          <div className="text-center text-xs text-muted border-t border-border pt-4">
            Don&apos;t have an account yet?{" "}
            <Link
              href="/signup"
              className="font-semibold text-accent hover:underline"
            >
              Register here
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
