"use client";

import React, { useState, useEffect } from "react";
import { AppShell } from "@/components/AppShell";
import {
  ShieldCheck,
  Download,
  Trash2,
  Lock,
  FileText,
  AlertTriangle,
  CheckCircle2,
  HelpCircle,
  Building,
  Mail,
  UserCheck,
  RefreshCw,
} from "lucide-react";
import { useRouter } from "next/navigation";
import {
  ALLOWED_EMAIL_DOMAIN,
  COLLEGE_NAME,
  COLLEGE_NAME_WITH_SHORT,
  COLLEGE_SHORT,
} from "@/config/college";

export default function PrivacyPage() {
  const router = useRouter();
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [exporting, setExporting] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [actionMessage, setActionMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  useEffect(() => {
    try {
      const stored = localStorage.getItem("sbs_caselab_user");
      if (stored) {
        setCurrentUser(JSON.parse(stored));
      } else {
        setCurrentUser({
          id: "usr-student-1",
          email: `prachi.z24bca@${ALLOWED_EMAIL_DOMAIN}`,
          name: "Zala Prachi",
          role: "student",
        });
      }
    } catch {
      // ignore
    }
  }, []);

  const handleExportData = async () => {
    setExporting(true);
    setActionMessage(null);
    try {
      const userId = currentUser?.id || "usr-student-1";
      const res = await fetch(`/api/user/data-export?userId=${userId}`);
      if (!res.ok) throw new Error("Failed to export personal data.");

      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `sbs-caselab-dpdp-export-${userId}.json`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);

      setActionMessage({
        type: "success",
        text: "Your machine-readable personal data archive (DPDP Act 2023 Sec 11) has been downloaded successfully.",
      });
    } catch (err: any) {
      setActionMessage({
        type: "error",
        text: err.message || "Could not generate data export archive.",
      });
    } finally {
      setExporting(false);
    }
  };

  const handleDeleteData = async () => {
    setDeleting(true);
    setActionMessage(null);
    try {
      const userId = currentUser?.id || "usr-student-1";
      const res = await fetch("/api/user/data-delete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId,
          confirmErasure: true,
          actorEmail: currentUser?.email || `user@${ALLOWED_EMAIL_DOMAIN}`,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Failed to process erasure request.");
      }

      localStorage.removeItem("sbs_caselab_user");
      setDeleteModalOpen(false);
      alert("Your account and all associated personal submissions have been permanently erased under DPDP Act 2023 compliance. Redirecting to login.");
      router.push("/login");
    } catch (err: any) {
      setActionMessage({
        type: "error",
        text: err.message || "Failed to erase personal data.",
      });
      setDeleting(false);
      setDeleteModalOpen(false);
    }
  };

  return (
    <AppShell>
      <div className="max-w-5xl mx-auto space-y-10 pb-16">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-success/15 text-success text-xs font-bold uppercase tracking-wider">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Digital Personal Data Protection (DPDP) Act 2023</span>
          </div>
          <h1 className="font-serif text-3xl sm:text-4xl font-extrabold text-text">
            Privacy Policy & Data Principal Rights
          </h1>
          <p className="text-sm text-muted leading-relaxed">
            {COLLEGE_NAME_WITH_SHORT} is committed to the highest standards of student, faculty, and alumni privacy governance, algorithmic transparency, and data sovereignty.
          </p>
        </div>

        {/* Action Message Banner */}
        {actionMessage && (
          <div
            className={`p-4 rounded-xl flex items-center justify-between gap-3 text-xs font-semibold ${
              actionMessage.type === "success"
                ? "bg-success/10 text-success border border-success/30"
                : "bg-danger/10 text-danger border border-danger/30"
            }`}
          >
            <div className="flex items-center gap-2">
              {actionMessage.type === "success" ? (
                <CheckCircle2 className="w-4 h-4 text-success shrink-0" />
              ) : (
                <AlertTriangle className="w-4 h-4 text-danger shrink-0" />
              )}
              <span>{actionMessage.text}</span>
            </div>
            <button
              onClick={() => setActionMessage(null)}
              className="text-muted hover:text-text text-xs underline"
            >
              Dismiss
            </button>
          </div>
        )}

        {/* Data Principal Rights Action Hub */}
        <div className="bg-surface border-2 border-accent/40 rounded-3xl p-8 shadow-sm space-y-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-border pb-4">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-accent">
                Data Principal Action Panel
              </span>
              <h2 className="font-serif text-xl font-bold text-text">
                Exercise Your Statutory Rights
              </h2>
            </div>
            <div className="text-xs text-muted">
              Active User: <span className="font-semibold text-text">{currentUser?.email || `student.patel@${ALLOWED_EMAIL_DOMAIN}`}</span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Export Card */}
            <div className="p-6 rounded-2xl border border-border bg-primary-soft/30 flex flex-col justify-between space-y-4">
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-accent font-bold text-sm">
                  <Download className="w-4 h-4" />
                  <span>Right to Access & Portability (Section 11)</span>
                </div>
                <p className="text-xs text-muted leading-relaxed">
                  Download a comprehensive, machine-readable JSON export of your complete profile, submitted answers, AI grading feedback, certificate ledger, subscription history, and tamper-evident audit logs.
                </p>
              </div>

              <button
                type="button"
                disabled={exporting}
                onClick={handleExportData}
                className="w-full py-3 px-4 bg-accent hover:bg-accent-hover text-accent-text rounded-xl font-serif font-bold text-xs shadow transition-all flex items-center justify-center gap-2"
              >
                {exporting ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    <span>Compiling JSON Archive...</span>
                  </>
                ) : (
                  <>
                    <Download className="w-3.5 h-3.5" />
                    <span>Export My Data (JSON)</span>
                  </>
                )}
              </button>
            </div>

            {/* Erasure Card */}
            <div className="p-6 rounded-2xl border border-danger/30 bg-danger/10 flex flex-col justify-between space-y-4">
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-danger font-bold text-sm">
                  <Trash2 className="w-4 h-4" />
                  <span>Right to Erasure & Forgetting (Section 12)</span>
                </div>
                <p className="text-xs text-text leading-relaxed">
                  Permanently delete your user profile, all case submissions, AI evaluations, certificates, and billing records from our Postgres databases and memory caches. This action is irreversible.
                </p>
              </div>

              <button
                type="button"
                onClick={() => setDeleteModalOpen(true)}
                className="w-full py-3 px-4 bg-danger hover:bg-danger/90 text-white rounded-xl font-serif font-bold text-xs shadow transition-all flex items-center justify-center gap-2"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Delete My Account and Data</span>
              </button>
            </div>
          </div>
        </div>

        {/* Legal & Compliance Overview Sections */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-surface border border-border rounded-2xl p-6 space-y-3">
            <div className="p-2.5 bg-primary-soft rounded-xl text-accent w-fit">
              <Building className="w-5 h-5" />
            </div>
            <h3 className="font-serif font-bold text-base text-text">
              Data Fiduciary
            </h3>
            <p className="text-xs text-muted leading-relaxed">
              {COLLEGE_NAME_WITH_SHORT} acts as the certified Data Fiduciary under the DPDP Act 2023, determining the educational and pedagogical purposes of personal data processing.
            </p>
          </div>

          <div className="bg-surface border border-border rounded-2xl p-6 space-y-3">
            <div className="p-2.5 bg-primary-soft rounded-xl text-accent w-fit">
              <Mail className="w-5 h-5" />
            </div>
            <h3 className="font-serif font-bold text-base text-text">
              Data Protection Officer
            </h3>
            <p className="text-xs text-muted leading-relaxed">
              Contact our Campus DPO at <a href={`mailto:dpo@${ALLOWED_EMAIL_DOMAIN}`} className="underline font-bold text-accent">dpo@{ALLOWED_EMAIL_DOMAIN}</a>. Statutory grievances receive an official response and resolution within 72 business hours.
            </p>
          </div>

          <div className="bg-surface border border-border rounded-2xl p-6 space-y-3">
            <div className="p-2.5 bg-primary-soft rounded-xl text-accent w-fit">
              <Lock className="w-5 h-5" />
            </div>
            <h3 className="font-serif font-bold text-base text-text">
              Lawful Grounds
            </h3>
            <p className="text-xs text-muted leading-relaxed">
              Processing is carried out strictly on the basis of explicit consent given during registration, and for specified educational purposes under Sections 4 & 7 of the DPDP Act 2023.
            </p>
          </div>
        </div>

        {/* Detailed Policies Accordion Style */}
        <div className="bg-surface border border-border rounded-2xl p-8 space-y-6 text-xs text-text leading-relaxed">
          <h2 className="font-serif text-lg font-bold text-text">
            Institutional Privacy Commitments & AI Ethics
          </h2>

          <div className="space-y-4">
            <div className="space-y-1">
              <h4 className="font-bold text-text">1. Zero Student Training Data Leakage</h4>
              <p className="text-muted">
                Student answer submissions and faculty teaching notes processed through the Claude API are governed by zero-retention enterprise agreements. Your case analyses are never utilized to train public or proprietary commercial frontier models.
              </p>
            </div>

            <div className="space-y-1">
              <h4 className="font-bold text-text">2. Row-Level Security & Cryptographic Segregation</h4>
              <p className="text-muted">
                All student records are guarded by PostgreSQL Row Level Security (RLS) policies. Cross-student answer inspection is cryptographically prevented at the database kernel level.
              </p>
            </div>

            <div className="space-y-1">
              <h4 className="font-bold text-text">3. Tamper-Evident Audit Logging</h4>
              <p className="text-muted">
                Every administrative role elevation, peer-review case approval, grade override, and data erasure request is permanently inscribed in an immutable, append-only system audit ledger.
              </p>
            </div>
          </div>
        </div>

        {/* Confirmation Modal for Data Erasure */}
        {deleteModalOpen && (
          <div className="fixed inset-0 z-60 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-surface border border-danger/40 rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl space-y-4">
              <div className="flex items-center gap-3 text-danger">
                <AlertTriangle className="w-6 h-6 shrink-0" />
                <h3 className="font-serif text-lg font-bold">
                  Confirm Irreversible Data Erasure
                </h3>
              </div>

              <p className="text-xs text-muted leading-relaxed">
                Under Section 12 of the DPDP Act 2023, confirming this request will immediately and permanently erase your account, login credentials, submitted case answers, Dean's certificates, and active subscription. This cannot be undone.
              </p>

              <div className="pt-4 flex items-center justify-end gap-3">
                <button
                  type="button"
                  disabled={deleting}
                  onClick={() => setDeleteModalOpen(false)}
                  className="px-4 py-2 border border-border text-muted hover:bg-primary-soft rounded-xl text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  disabled={deleting}
                  onClick={handleDeleteData}
                  className="px-4 py-2 bg-danger hover:bg-danger/90 text-white rounded-xl text-xs font-bold shadow flex items-center gap-2"
                >
                  {deleting ? (
                    <>
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                      <span>Erasing Data...</span>
                    </>
                  ) : (
                    <span>Permanently Erase All Data</span>
                  )}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </AppShell>
  );
}
