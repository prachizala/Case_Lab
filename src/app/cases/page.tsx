"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { AppShell } from "@/components/AppShell";
import { getCachedUser } from "@/lib/auth-client";
import {
  FileText,
  Plus,
  Clock,
  AlertTriangle,
  CheckCircle2,
  Upload,
  XCircle,
  Eye,
  Download,
  RotateCcw,
  Sparkles,
  MessageSquare,
  ArrowRight,
  BookOpen,
} from "lucide-react";
import { CaseStudy, CaseStatus, Profile, ReviewRound, ReviewComment } from "@/lib/types";

type StatusTab = "all" | "draft" | "in_review" | "changes_requested" | "approved" | "uploaded" | "rejected";

export default function MyCasesPage() {
  const [currentUser, setCurrentUser] = useState<Profile | null>(null);
  const [cases, setCases] = useState<CaseStudy[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<StatusTab>("all");
  const [resubmittingId, setResubmittingId] = useState<string | null>(null);
  const [resubmitSuccess, setResubmitSuccess] = useState<string | null>(null);

  useEffect(() => {
    async function loadData() {
      try {
        const user = await getCachedUser();
        if (user) setCurrentUser(user);

        const res = await fetch("/api/cases?scope=mine");
        if (res.ok) {
          const json = await res.json();
          setCases(json.cases || []);
        }
      } catch (err) {
        console.error("Failed to load author cases:", err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const handleResubmit = async (caseId: string) => {
    setResubmittingId(caseId);
    setResubmitSuccess(null);
    try {
      const res = await fetch(`/api/cases/${caseId}/workflow`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "submit-approval",
          confirm_originality: true,
          confirm_figures: true,
        }),
      });
      if (!res.ok) throw new Error("Failed to resubmit case.");
      setResubmitSuccess(`Case successfully resubmitted for peer review.`);
      // Refresh list
      const updated = await fetch("/api/cases?scope=mine").then((r) => r.json());
      setCases(updated.cases || []);
    } catch (err: any) {
      alert(err.message || "Resubmission failed.");
    } finally {
      setResubmittingId(null);
    }
  };

  const filteredCases = cases.filter((c) => {
    if (activeTab === "all") return true;
    return c.status === activeTab;
  });

  const getStatusBadge = (status: CaseStatus) => {
    switch (status) {
      case "draft":
        return <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-surface-hover text-text-muted border border-border">Draft</span>;
      case "in_review":
        return <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/30 flex items-center gap-1"><Clock className="w-3 h-3" /> In Review</span>;
      case "changes_requested":
        return <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/30 flex items-center gap-1"><AlertTriangle className="w-3 h-3" /> Changes Requested</span>;
      case "approved":
        return <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30 flex items-center gap-1"><CheckCircle2 className="w-3 h-3" /> Approved</span>;
      case "uploaded":
      case "published":
        return <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/30 flex items-center gap-1"><Upload className="w-3 h-3" /> Uploaded to Repository</span>;
      case "rejected":
        return <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-red-500/10 text-red-600 dark:text-red-400 border border-red-500/30 flex items-center gap-1"><XCircle className="w-3 h-3" /> Rejected</span>;
      default:
        return <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-surface-hover text-text-muted">{status}</span>;
    }
  };

  return (
    <AppShell>
      <div className="max-w-6xl mx-auto w-full px-4 sm:px-6 py-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-text">
              My Case Studies
            </h1>
            <p className="text-sm text-text-muted mt-1">
              Author, edit, track blind peer reviews, and submit curriculum case revisions.
            </p>
          </div>

          <Link
            href="/create"
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-medium text-sm transition-colors shadow-xs"
          >
            <Plus className="w-4 h-4 text-white" />
            <span>Create New Case Study</span>
          </Link>
        </div>

        {resubmitSuccess && (
          <div className="mb-6 p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 text-sm flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>{resubmitSuccess}</span>
          </div>
        )}

        {/* Status Tabs */}
        <div className="flex items-center gap-2 border-b border-border mb-6 overflow-x-auto pb-1">
          {[
            { id: "all", label: "All Cases" },
            { id: "draft", label: "Drafts" },
            { id: "in_review", label: "In Review" },
            { id: "changes_requested", label: "Changes Requested" },
            { id: "approved", label: "Approved" },
            { id: "uploaded", label: "Uploaded" },
            { id: "rejected", label: "Rejected" },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as StatusTab)}
              className={`px-4 py-2 text-xs sm:text-sm font-semibold rounded-t-lg transition-colors border-b-2 whitespace-nowrap ${
                activeTab === tab.id
                  ? "border-blue-600 text-blue-600 dark:text-blue-400 bg-surface"
                  : "border-transparent text-text-muted hover:text-text"
              }`}
            >
              {tab.label}
              <span className="ml-1.5 text-xs px-2 py-0.5 rounded-full bg-border text-text-muted font-normal">
                {cases.filter((c) => (tab.id === "all" ? true : c.status === tab.id)).length}
              </span>
            </button>
          ))}
        </div>

        {/* Content */}
        {loading ? (
          <div className="py-20 text-center text-text-muted text-sm">
            Loading your authored cases...
          </div>
        ) : filteredCases.length === 0 ? (
          <div className="p-12 text-center rounded-2xl bg-surface border border-border shadow-xs">
            <BookOpen className="w-12 h-12 text-text-muted mx-auto mb-3 opacity-40" />
            <h3 className="text-base font-semibold text-text">No cases found in this category</h3>
            <p className="text-xs text-text-muted max-w-sm mx-auto mt-1 mb-5">
              Start by creating a teaching case study calibrated to Bloom's taxonomy with the AI Case Engine.
            </p>
            <Link
              href="/create"
              className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-medium text-xs shadow-xs"
            >
              Generate First Case
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredCases.map((c) => (
              <div
                key={c.id}
                className="bg-surface rounded-2xl border border-border shadow-xs p-5 sm:p-6 transition-all hover:border-text-muted/40"
              >
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 mb-3">
                  <div>
                    <div className="flex flex-wrap items-center gap-2 mb-1.5">
                      {getStatusBadge(c.status)}
                      <span className="text-xs font-semibold px-2 py-0.5 rounded bg-surface-hover text-text-muted uppercase">
                        {c.type || "Full Case"}
                      </span>
                      {c.page_target && (
                        <span className="text-xs px-2 py-0.5 rounded bg-surface-hover text-text-muted">
                          {c.page_target} Pages Target
                        </span>
                      )}
                    </div>
                    <h3 className="text-base sm:text-lg font-bold text-text hover:text-blue-600 transition-colors">
                      <Link href={`/cases/${c.id}`}>{c.title}</Link>
                    </h3>
                  </div>

                  <div className="text-xs text-text-muted sm:text-right shrink-0">
                    <div>Last updated</div>
                    <div className="font-medium text-text">
                      {new Date(c.updated_at || c.created_at).toLocaleDateString("en-IN")}
                    </div>
                  </div>
                </div>

                {/* Reviewer Feedback Callout when Changes Requested */}
                {c.status === "changes_requested" && (
                  <div className="my-4 p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-700 dark:text-rose-300">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2 font-bold text-xs uppercase tracking-wider">
                        <MessageSquare className="w-4 h-4" />
                        <span>Peer Reviewer Feedback & Required Revisions</span>
                      </div>
                      <span className="text-[11px] text-text-muted">Round 1</span>
                    </div>
                    <p className="text-xs leading-relaxed mb-3">
                      Please address the reviewer comments below before resubmitting for curriculum approval.
                    </p>
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleResubmit(c.id)}
                        disabled={resubmittingId === c.id}
                        className="px-3.5 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold flex items-center gap-1.5 shadow-xs transition-colors"
                      >
                        <RotateCcw className="w-3.5 h-3.5 text-white" />
                        <span>{resubmittingId === c.id ? "Resubmitting..." : "Resubmit for Review"}</span>
                      </button>
                      <Link
                        href={`/cases/${c.id}`}
                        className="px-3.5 py-1.5 rounded-lg bg-surface border border-border hover:bg-surface-hover text-text text-xs font-semibold flex items-center gap-1.5"
                      >
                        <Eye className="w-3.5 h-3.5 text-text-muted" />
                        <span>Edit Section Drafts</span>
                      </Link>
                    </div>
                  </div>
                )}

                {/* Case Footer & Actions */}
                <div className="pt-3 border-t border-border flex flex-wrap items-center justify-between gap-3 text-xs">
                  <div className="flex items-center gap-3 text-text-muted">
                    <span>Target: {c.target_audience || "Undergraduate / MBA"}</span>
                    <span>•</span>
                    <span>Domain: {c.industry || "Management"}</span>
                  </div>

                  <div className="flex items-center gap-2">
                    {currentUser?.role === "student" ? (
                      <span
                        className="px-2.5 py-1 rounded-lg border border-border bg-surface/50 text-muted text-[11px] font-medium cursor-not-allowed"
                        title="Download will be available after purchase (coming soon)"
                      >
                        Download available after purchase
                      </span>
                    ) : (
                      <>
                        <a
                          href={`/api/cases/${c.id}/export/pdf`}
                          className="px-2.5 py-1 rounded-lg border border-border hover:bg-surface-hover text-text-muted hover:text-text flex items-center gap-1 transition-colors"
                        >
                          <Download className="w-3 h-3" />
                          <span>PDF</span>
                        </a>
                        <a
                          href={`/api/cases/${c.id}/export/docx`}
                          className="px-2.5 py-1 rounded-lg border border-border hover:bg-surface-hover text-text-muted hover:text-text flex items-center gap-1 transition-colors"
                        >
                          <Download className="w-3 h-3" />
                          <span>DOCX</span>
                        </a>
                      </>
                    )}
                    <Link
                      href={`/cases/${c.id}`}
                      className="px-3 py-1 rounded-lg bg-surface-hover text-text font-semibold hover:bg-blue-600 hover:text-white transition-colors flex items-center gap-1"
                    >
                      <span>Open</span>
                      <ArrowRight className="w-3 h-3" />
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </AppShell>
  );
}
