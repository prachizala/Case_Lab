"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ThemeToggle } from "@/components/ThemeToggle";
import {
  Clock,
  Download,
  FileText,
  Mail,
  LogOut,
  AlertCircle,
  ShieldCheck,
  Building2,
  ExternalLink,
} from "lucide-react";
import { Profile } from "@/lib/types";

export default function ExpiredAccessPage() {
  const router = useRouter();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState(false);
  const [exportSuccess, setExportSuccess] = useState(false);

  useEffect(() => {
    async function loadUser() {
      try {
        const res = await fetch("/api/auth");
        const data = await res.json();
        if (data?.user) {
          setProfile(data.user);
        }
      } catch (err) {
        console.error("Failed to load user session:", err);
      } finally {
        setLoading(false);
      }
    }
    loadUser();
  }, []);

  const handleLogout = async () => {
    try {
      await fetch("/api/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "logout" }),
      });
      window.location.href = "/login";
    } catch {
      window.location.href = "/login";
    }
  };

  const handleExportData = async () => {
    setExporting(true);
    setExportSuccess(false);
    try {
      const res = await fetch("/api/user/data-export");
      if (!res.ok) throw new Error("Export failed");
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `sbs-caselab-data-archive-${profile?.id || "user"}.json`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      setExportSuccess(true);
    } catch (err) {
      console.error("Export error:", err);
      alert("Failed to download data archive. Please contact support.");
    } finally {
      setExporting(false);
    }
  };

  const formattedExpiry = profile?.access_end
    ? new Date(profile.access_end).toLocaleDateString("en-IN", {
        day: "numeric",
        month: "long",
        year: "numeric",
      })
    : "Batch Completion + 1 Year Grace Period";

  return (
    <div className="min-h-screen bg-background text-text flex flex-col justify-between p-4 sm:p-8">
      {/* Brand Header */}
      <header className="flex items-center justify-between max-w-4xl mx-auto w-full mb-8">
        <div className="flex items-center gap-3">
          <div className="h-10 px-2.5 py-1 rounded-xl bg-white border border-border shadow-xs flex items-center justify-center shrink-0">
            <img
              src="/sbs-logo.png"
              alt="Shanti Business School Logo"
              className="h-8 w-auto object-contain"
            />
          </div>
          <div>
            <h1 className="text-base font-bold text-text leading-tight">SBS CaseLab</h1>
            <p className="text-xs text-text-muted">Academic Repository & Alumni Archive</p>
          </div>
        </div>
        <ThemeToggle />
      </header>

      {/* Main Expired Card */}
      <main className="max-w-xl mx-auto w-full my-auto">
        <div className="bg-surface rounded-2xl border border-border shadow-lg p-6 sm:p-8">
          {/* Status Badge */}
          <div className="flex items-center gap-3 mb-6 p-4 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-700 dark:text-amber-400">
            <Clock className="w-6 h-6 shrink-0" />
            <div>
              <h2 className="text-sm font-semibold">Institutional Access Period Ended</h2>
              <p className="text-xs text-text-muted mt-0.5">
                Active student access expired on <span className="font-medium text-text">{formattedExpiry}</span>.
              </p>
            </div>
          </div>

          <h3 className="text-xl font-bold text-text mb-2">
            Welcome back, {profile?.name || "Alumnus"}
          </h3>
          <p className="text-sm text-text-muted mb-6 leading-relaxed">
            In accordance with Shanti Business School academic policies, accounts maintain perpetual access to past work and submitted case solutions. New case creation and repository downloads require an active academic cohort renewal.
          </p>

          {/* Perpetual Rights Notice */}
          <div className="mb-6 space-y-2 text-xs text-text-muted border-t border-border pt-4">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
              <span>You retain full access to view and export your past submissions.</span>
            </div>
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
              <span>Full compliance with Digital Personal Data Protection (DPDP) Act 2023.</span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="space-y-3">
            <Link
              href="/my-answers"
              className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-medium text-sm transition-colors shadow-xs"
            >
              <FileText className="w-4 h-4 text-white" />
              <span>View My Past Case Submissions</span>
            </Link>

            <button
              onClick={handleExportData}
              disabled={exporting}
              className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-surface border border-border hover:bg-surface-hover text-text font-medium text-sm transition-colors disabled:opacity-50"
            >
              <Download className="w-4 h-4 text-text-muted" />
              <span>{exporting ? "Generating Archive..." : "Download Personal Data Archive"}</span>
            </button>

            {exportSuccess && (
              <p className="text-xs text-emerald-600 dark:text-emerald-400 text-center font-medium">
                Personal archive JSON downloaded successfully.
              </p>
            )}

            <a
              href="mailto:admin@shantibschool.edu.in?subject=CaseLab%20Access%20Renewal%20Request"
              className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-surface border border-border hover:bg-surface-hover text-text font-medium text-sm transition-colors"
            >
              <Mail className="w-4 h-4 text-text-muted" />
              <span>Contact Dean Academics to Renew Access</span>
            </a>

            <button
              onClick={handleLogout}
              className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-text-muted hover:text-red-600 dark:hover:text-red-400 text-xs transition-colors mt-2"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Sign Out of CaseLab</span>
            </button>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="text-center py-6 text-xs text-text-muted border-t border-border mt-8">
        <p>
          Shanti Business School (SBS) Case Study Repository • Section 11 DPDP Compliance
        </p>
      </footer>
    </div>
  );
}
