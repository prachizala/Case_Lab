"use client";

import { useEffect, useState, useMemo } from "react";
import Link from "next/link";
import { AppShell } from "@/components/AppShell";
import { getCachedUser } from "@/lib/auth-client";
import { StateLoading } from "@/components/StateLoading";
import { StateError } from "@/components/StateError";
import { StateEmpty } from "@/components/StateEmpty";
import {
  CaseStudy,
  CaseStatus,
  CaseVisibility,
  Profile,
  AuditLog,
} from "@/lib/types";
import { COLLEGE_NAME_WITH_SHORT, COLLEGE_SHORT } from "@/config/college";
import {
  ClipboardCheck,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Eye,
  MessageSquare,
  Sparkles,
  FileText,
  Search,
  Filter,
  Layers,
  ArrowRight,
  ShieldCheck,
  History,
  Lock,
  Globe,
  Building,
  Archive,
  Send,
  X,
  Check,
  RotateCcw,
  User,
  Calendar,
} from "lucide-react";

export default function ReviewQueuePage() {
  const [currentUser, setCurrentUser] = useState<Profile | null>(null);
  const [cases, setCases] = useState<CaseStudy[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filters & Tabs
  const [activeTab, setActiveTab] = useState<"in_review" | "changes_requested" | "approved" | "published" | "archived" | "all">("in_review");
  const [searchQuery, setSearchQuery] = useState("");
  const [domainFilter, setDomainFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");
  const [visibilityFilter, setVisibilityFilter] = useState("all");

  // Workflow Action Modals
  const [selectedCase, setSelectedCase] = useState<CaseStudy | null>(null);
  const [actionType, setActionType] = useState<"approve" | "request-changes" | "reject" | "publish" | "audit" | null>(null);
  const [actionComment, setActionComment] = useState("");
  const [actionVisibility, setActionVisibility] = useState<CaseVisibility>("sbs_only");
  const [isSubmittingAction, setIsSubmittingAction] = useState(false);
  const [actionSuccessMsg, setActionSuccessMsg] = useState<string | null>(null);

  // Case Audit Trail State
  const [caseAuditLogs, setCaseAuditLogs] = useState<AuditLog[]>([]);
  const [loadingAudit, setLoadingAudit] = useState(false);

  // Load user
  const loadUser = async () => {
    try {
      const user = await getCachedUser();
      if (user) setCurrentUser(user);
    } catch (err) {
      console.error("Failed to load user:", err);
    }
  };

  // Load all cases for review
  const loadCases = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/cases?scope=all");
      if (!res.ok) throw new Error(`HTTP ${res.status}: Failed to fetch repository cases.`);
      const data = await res.json();
      if (data.cases) {
        setCases(data.cases);
      }
    } catch (err: unknown) {
      console.error("Load review cases error:", err);
      setError(err instanceof Error ? err.message : "Failed to load review queue.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUser();
    loadCases();
  }, []);

  // Fetch audit logs for selected case
  const fetchAuditLogs = async (caseId: string) => {
    setLoadingAudit(true);
    try {
      const res = await fetch(`/api/cases/${caseId}/audit`);
      if (res.ok) {
        const data = await res.json();
        setCaseAuditLogs(data.auditLogs || []);
      }
    } catch (err) {
      console.error("Fetch audit logs error:", err);
    } finally {
      setLoadingAudit(false);
    }
  };

  // Tab counts
  const counts = useMemo(() => {
    return {
      in_review: cases.filter((c) => c.status === "in_review").length,
      changes_requested: cases.filter((c) => c.status === "changes_requested").length,
      approved: cases.filter((c) => c.status === "approved").length,
      published: cases.filter((c) => c.status === "published").length,
      archived: cases.filter((c) => c.status === "archived").length,
      all: cases.length,
    };
  }, [cases]);

  // Filtered cases list
  const filteredCases = useMemo(() => {
    return cases.filter((c) => {
      // Tab filter
      if (activeTab !== "all" && c.status !== activeTab) {
        return false;
      }

      // Domain filter
      if (domainFilter !== "all" && c.domain !== domainFilter) {
        return false;
      }

      // Type filter
      if (typeFilter !== "all" && c.type !== typeFilter) {
        return false;
      }

      // Visibility filter
      if (visibilityFilter !== "all") {
        const vis = c.visibility || "sbs_only";
        if (vis !== visibilityFilter) return false;
      }

      // Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchTitle = c.title.toLowerCase().includes(q);
        const matchAuthor = (c.author_name || "").toLowerCase().includes(q);
        const matchIndustry = (c.industry || "").toLowerCase().includes(q);
        const matchSummary = (c.content?.summary || "").toLowerCase().includes(q);
        if (!matchTitle && !matchAuthor && !matchIndustry && !matchSummary) return false;
      }

      return true;
    });
  }, [cases, activeTab, domainFilter, typeFilter, visibilityFilter, searchQuery]);

  // Execute workflow action
  const handleWorkflowSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCase || !actionType) return;

    if ((actionType === "request-changes" || actionType === "reject") && !actionComment.trim()) {
      alert("Please provide specific feedback comments for the author.");
      return;
    }

    setIsSubmittingAction(true);
    try {
      let endpoint = `/api/cases/${selectedCase.id}/workflow`;
      let payload: Record<string, any> = { action: actionType };

      if (actionType === "approve") {
        payload.comment = actionComment.trim() || undefined;
      } else if (actionType === "request-changes") {
        payload.comment = actionComment.trim();
      } else if (actionType === "reject") {
        payload.comment = actionComment.trim();
      } else if (actionType === "publish") {
        payload.visibility = actionVisibility;
      }

      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Workflow request failed.");
      }

      setActionSuccessMsg(data.message || "Case status updated successfully.");
      setTimeout(() => setActionSuccessMsg(null), 4000);

      // Close modal and refresh cases
      setActionType(null);
      setSelectedCase(null);
      setActionComment("");
      loadCases();
    } catch (err: unknown) {
      console.error("Workflow submit error:", err);
      alert(err instanceof Error ? err.message : "Failed to execute workflow action.");
    } finally {
      setIsSubmittingAction(false);
    }
  };

  // Quick Archive
  const handleQuickArchive = async (caseStudy: CaseStudy) => {
    if (!confirm(`Are you sure you want to archive "${caseStudy.title}"? It will be hidden from student directories.`)) {
      return;
    }

    try {
      const res = await fetch(`/api/cases/${caseStudy.id}/workflow`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "archive" }),
      });
      const data = await res.json();
      if (data.success) {
        setActionSuccessMsg(`"${caseStudy.title}" has been archived.`);
        setTimeout(() => setActionSuccessMsg(null), 4000);
        loadCases();
      } else {
        alert(data.error || "Failed to archive case.");
      }
    } catch (err) {
      console.error("Archive error:", err);
      alert("Failed to archive case.");
    }
  };

  // Render Status Badge
  const renderStatusBadge = (status: CaseStatus) => {
    switch (status) {
      case "in_review":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/30">
            <Clock className="w-3 h-3" />
            <span>Under Review</span>
          </span>
        );
      case "changes_requested":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-rose-500/15 text-rose-600 dark:text-rose-400 border border-rose-500/30">
            <AlertTriangle className="w-3 h-3" />
            <span>Changes Requested</span>
          </span>
        );
      case "approved":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30">
            <CheckCircle2 className="w-3 h-3" />
            <span>Approved</span>
          </span>
        );
      case "published":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-primary text-white border border-primary/40 shadow-xs">
            <Sparkles className="w-3 h-3 text-white" />
            <span className="text-white">Published</span>
          </span>
        );
      case "archived":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-500/15 text-slate-500 border border-slate-500/30">
            <Archive className="w-3 h-3" />
            <span>Archived</span>
          </span>
        );
      case "draft":
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-muted/20 text-muted border border-border">
            <span>Draft</span>
          </span>
        );
    }
  };

  // Render Visibility Badge
  const renderVisibilityBadge = (visibility?: CaseVisibility) => {
    const vis = visibility || "sbs_only";
    switch (vis) {
      case "public":
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
            <Globe className="w-2.5 h-2.5" />
            <span>Public</span>
          </span>
        );
      case "private":
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-semibold bg-slate-500/10 text-slate-500 border border-slate-500/20">
            <Lock className="w-2.5 h-2.5" />
            <span>Private</span>
          </span>
        );
      case "sbs_only":
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-semibold bg-primary/10 text-primary dark:text-blue-300 border border-primary/20">
            <Building className="w-2.5 h-2.5" />
            <span>SBS-Only</span>
          </span>
        );
    }
  };

  // Student Access Restriction Safeguard
  const isStudent = currentUser?.role === "student";
  if (!loading && isStudent) {
    return (
      <AppShell>
        <div className="max-w-4xl mx-auto py-12">
          <StateError
            title="Access Restricted: Faculty & Admin Portal"
            message="The Curriculum Review Queue is restricted to verified SBS faculty reviewers, curriculum committees, and institutional administrators."
            backHref="/library"
            backText="Return to Case Library"
          />
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell>
      <div className="space-y-6 pb-20">
        {/* HEADER SECTION */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-border pb-6">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-bold uppercase tracking-wider text-accent bg-accent/10 px-2.5 py-0.5 rounded-full border border-accent/20">
                Curriculum Governance
              </span>
              <span className="text-xs text-muted">
                {COLLEGE_NAME_WITH_SHORT}
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-serif font-bold text-text flex items-center gap-2.5">
              <ClipboardCheck className="w-7 h-7 text-accent" />
              <span>Curriculum Review Queue</span>
            </h1>
            <p className="text-sm text-muted max-w-2xl">
              Conduct peer reviews, request pedagogical revisions, certify learning objectives, and publish vetted business cases to student directories.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/create"
              className="inline-flex items-center gap-2 px-3.5 py-2 rounded-lg bg-accent hover:bg-accent-hover text-accent-text text-xs font-semibold shadow-sm transition-all"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Generate New Case</span>
            </Link>
            <Link
              href="/library"
              className="inline-flex items-center gap-2 px-3.5 py-2 rounded-lg border border-border text-xs font-semibold text-text hover:border-accent hover:text-accent transition-colors"
            >
              <FileText className="w-3.5 h-3.5" />
              <span>Case Library</span>
            </Link>
          </div>
        </div>

        {/* NOTIFICATION TOAST */}
        {actionSuccessMsg && (
          <div className="flex items-center gap-2 p-3 rounded-lg bg-emerald-500/15 border border-emerald-500/30 text-emerald-700 dark:text-emerald-300 text-xs font-semibold animate-in fade-in">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>{actionSuccessMsg}</span>
          </div>
        )}

        {/* TABS */}
        <div className="flex items-center gap-2 border-b border-border overflow-x-auto pb-1 scrollbar-none">
          <button
            type="button"
            onClick={() => setActiveTab("in_review")}
            className={`flex items-center gap-2 px-4 py-2.5 border-b-2 text-xs font-bold transition-all whitespace-nowrap ${
              activeTab === "in_review"
                ? "border-accent text-accent"
                : "border-transparent text-muted hover:text-text"
            }`}
          >
            <span>Under Review</span>
            <span
              className={`px-1.5 py-0.5 rounded-full text-[10px] font-bold ${
                activeTab === "in_review"
                  ? "bg-accent text-accent-text"
                  : "bg-surface border border-border text-muted"
              }`}
            >
              {counts.in_review}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("changes_requested")}
            className={`flex items-center gap-2 px-4 py-2.5 border-b-2 text-xs font-bold transition-all whitespace-nowrap ${
              activeTab === "changes_requested"
                ? "border-accent text-accent"
                : "border-transparent text-muted hover:text-text"
            }`}
          >
            <span>Changes Requested</span>
            <span
              className={`px-1.5 py-0.5 rounded-full text-[10px] font-bold ${
                activeTab === "changes_requested"
                  ? "bg-accent text-accent-text"
                  : "bg-surface border border-border text-muted"
              }`}
            >
              {counts.changes_requested}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("approved")}
            className={`flex items-center gap-2 px-4 py-2.5 border-b-2 text-xs font-bold transition-all whitespace-nowrap ${
              activeTab === "approved"
                ? "border-accent text-accent"
                : "border-transparent text-muted hover:text-text"
            }`}
          >
            <span>Approved (Unpublished)</span>
            <span className="px-1.5 py-0.5 rounded-full text-[10px] font-bold bg-surface border border-border text-muted">
              {counts.approved}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("published")}
            className={`flex items-center gap-2 px-4 py-2.5 border-b-2 text-xs font-bold transition-all whitespace-nowrap ${
              activeTab === "published"
                ? "border-accent text-accent"
                : "border-transparent text-muted hover:text-text"
            }`}
          >
            <span>Published</span>
            <span className="px-1.5 py-0.5 rounded-full text-[10px] font-bold bg-surface border border-border text-muted">
              {counts.published}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("archived")}
            className={`flex items-center gap-2 px-4 py-2.5 border-b-2 text-xs font-bold transition-all whitespace-nowrap ${
              activeTab === "archived"
                ? "border-accent text-accent"
                : "border-transparent text-muted hover:text-text"
            }`}
          >
            <span>Archived</span>
            <span className="px-1.5 py-0.5 rounded-full text-[10px] font-bold bg-surface border border-border text-muted">
              {counts.archived}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("all")}
            className={`flex items-center gap-2 px-4 py-2.5 border-b-2 text-xs font-bold transition-all whitespace-nowrap ${
              activeTab === "all"
                ? "border-accent text-accent"
                : "border-transparent text-muted hover:text-text"
            }`}
          >
            <span>All Repository Cases</span>
            <span className="px-1.5 py-0.5 rounded-full text-[10px] font-bold bg-surface border border-border text-muted">
              {counts.all}
            </span>
          </button>
        </div>

        {/* SEARCH & FILTERS BAR */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 bg-surface p-3.5 rounded-xl border border-border shadow-xs">
          {/* Search Box */}
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
            <input
              type="text"
              placeholder="Search case, author, or keyword..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 rounded-lg border border-border bg-background text-xs text-text placeholder:text-muted focus:outline-none focus:border-accent"
            />
          </div>

          {/* Domain Filter */}
          <div>
            <select
              value={domainFilter}
              onChange={(e) => setDomainFilter(e.target.value)}
              className="w-full px-3 py-1.5 rounded-lg border border-border bg-background text-xs text-text focus:outline-none focus:border-accent"
            >
              <option value="all">All Domains</option>
              <option value="Marketing">Marketing</option>
              <option value="Finance">Finance</option>
              <option value="Operations">Operations</option>
              <option value="Strategy">Strategy</option>
              <option value="HR">HR</option>
              <option value="Analytics">Analytics</option>
            </select>
          </div>

          {/* Type Filter */}
          <div>
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="w-full px-3 py-1.5 rounded-lg border border-border bg-background text-xs text-text focus:outline-none focus:border-accent"
            >
              <option value="all">All Case Types</option>
              <option value="full">Full Case (8-10 pgs)</option>
              <option value="short">Short Case (~2 pgs)</option>
              <option value="flash">FlashCase (25-Min Sim)</option>
              <option value="research">Case Research (Multi-Firm)</option>
            </select>
          </div>

          {/* Visibility Filter */}
          <div>
            <select
              value={visibilityFilter}
              onChange={(e) => setVisibilityFilter(e.target.value)}
              className="w-full px-3 py-1.5 rounded-lg border border-border bg-background text-xs text-text focus:outline-none focus:border-accent"
            >
              <option value="all">All Visibility Levels</option>
              <option value="sbs_only">SBS-Only (Restricted)</option>
              <option value="public">Public (Open Library)</option>
              <option value="private">Private (Author Only)</option>
            </select>
          </div>
        </div>

        {/* LOADING & ERROR STATES */}
        {loading && (
          <div className="py-12">
            <StateLoading
              title="Loading Review Cases..."
              subtitle="Synchronizing submission queue and peer review status."
            />
          </div>
        )}

        {error && (
          <StateError
            title="Failed to Load Queue"
            message={error}
            onRetry={loadCases}
          />
        )}

        {/* EMPTY STATE */}
        {!loading && !error && filteredCases.length === 0 && (
          <StateEmpty
            title="No Cases Found in Queue"
            message={
              searchQuery || domainFilter !== "all" || typeFilter !== "all"
                ? "No cases matched your filter criteria. Try resetting your search filters."
                : `There are currently no cases in the "${activeTab.replace("_", " ")}" queue.`
            }
            actionLabel="View All Cases"
            onAction={() => {
              setActiveTab("all");
              setSearchQuery("");
              setDomainFilter("all");
              setTypeFilter("all");
              setVisibilityFilter("all");
            }}
          />
        )}

        {/* CASE QUEUE CARDS */}
        {!loading && !error && filteredCases.length > 0 && (
          <div className="space-y-4">
            {filteredCases.map((c) => {
              return (
                <div
                  key={c.id}
                  className="bg-surface rounded-xl border border-border p-5 shadow-xs hover:border-accent/40 transition-all flex flex-col justify-between gap-4"
                >
                  {/* Top Row: Badges & Metadata */}
                  <div className="flex flex-wrap items-center justify-between gap-2.5">
                    <div className="flex flex-wrap items-center gap-2">
                      {renderStatusBadge(c.status)}
                      {renderVisibilityBadge(c.visibility)}

                      <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-primary-soft text-text border border-border">
                        {c.type === "flash"
                          ? "FlashCase"
                          : c.type === "short"
                          ? "Short Case"
                          : c.type === "research"
                          ? "Case Research"
                          : "Full Case"}
                      </span>

                      {c.domain && (
                        <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-accent/10 text-accent border border-accent/20">
                          {c.domain}
                        </span>
                      )}

                      <span className="px-2 py-0.5 rounded text-[10px] font-medium bg-muted/10 text-muted border border-border">
                        {c.language.toUpperCase()}
                      </span>

                      <span className="text-[11px] text-muted">
                        v{c.version || 1}
                      </span>
                    </div>

                    <div className="flex items-center gap-3 text-xs text-muted">
                      <div className="flex items-center gap-1.5">
                        <User className="w-3.5 h-3.5" />
                        <span className="font-medium text-text">{c.author_name || "Faculty Member"}</span>
                      </div>
                      <span>•</span>
                      <div className="flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5" />
                        <span>{new Date(c.created_at).toLocaleDateString()}</span>
                      </div>
                    </div>
                  </div>

                  {/* Title & Summary */}
                  <div>
                    <Link
                      href={`/cases/${c.id}`}
                      className="group inline-flex items-start gap-2"
                    >
                      <h2 className="text-base sm:text-lg font-serif font-bold text-text group-hover:text-accent transition-colors leading-snug">
                        {c.title}
                      </h2>
                    </Link>

                    {c.content?.summary && (
                      <p className="text-xs sm:text-sm text-muted mt-1.5 line-clamp-2 leading-relaxed">
                        {c.content.summary}
                      </p>
                    )}
                  </div>

                  {/* Feedback / Reviewer Comments Alert Box */}
                  {c.reviewer_comment && (
                    <div className="p-3 rounded-lg bg-accent/5 border border-accent/20 text-xs">
                      <div className="flex items-center gap-1.5 font-bold text-accent mb-1">
                        <MessageSquare className="w-3.5 h-3.5" />
                        <span>Reviewer Feedback Note:</span>
                      </div>
                      <p className="text-text italic leading-relaxed">
                        &ldquo;{c.reviewer_comment}&rdquo;
                      </p>
                    </div>
                  )}

                  {/* Action Bar */}
                  <div className="pt-3 border-t border-border flex flex-wrap items-center justify-between gap-3">
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => {
                          setSelectedCase(c);
                          setActionType("audit");
                          fetchAuditLogs(c.id);
                        }}
                        className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-border text-xs font-semibold text-muted hover:text-text hover:border-text transition-colors"
                        title="View audit trail of changes and approvals"
                      >
                        <History className="w-3.5 h-3.5" />
                        <span>Audit Trail</span>
                      </button>

                      {c.status !== "archived" && (
                        <button
                          type="button"
                          onClick={() => handleQuickArchive(c)}
                          className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-border text-xs font-medium text-muted hover:text-rose-500 hover:border-rose-500/30 transition-colors"
                          title="Move to archive"
                        >
                          <Archive className="w-3.5 h-3.5" />
                          <span>Archive</span>
                        </button>
                      )}
                    </div>

                    <div className="flex flex-wrap items-center gap-2">
                      {/* Reviewer Actions based on status */}
                      {c.status === "in_review" && (
                        <>
                          <button
                            type="button"
                            onClick={() => {
                              setSelectedCase(c);
                              setActionType("request-changes");
                              setActionComment("");
                            }}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-rose-500/30 bg-rose-500/10 text-rose-600 dark:text-rose-400 text-xs font-bold hover:bg-rose-500/20 transition-all"
                          >
                            <AlertTriangle className="w-3.5 h-3.5" />
                            <span>Request Changes</span>
                          </button>

                          {currentUser?.role === "admin" && (
                            <button
                              type="button"
                              onClick={() => {
                                setSelectedCase(c);
                                setActionType("approve");
                                setActionComment("");
                              }}
                              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-xs transition-all"
                            >
                              <CheckCircle2 className="w-3.5 h-3.5 text-white" />
                              <span>Approve Case</span>
                            </button>
                          )}
                        </>
                      )}

                      {c.status === "approved" && (
                        <button
                          type="button"
                          onClick={() => {
                            setSelectedCase(c);
                            setActionType("publish");
                            setActionVisibility(c.visibility || "sbs_only");
                          }}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-primary hover:opacity-90 text-white text-xs font-bold shadow-xs transition-all"
                        >
                          <Globe className="w-3.5 h-3.5 text-white" />
                          <span className="text-white">Publish to Students</span>
                        </button>
                      )}

                      {c.status === "changes_requested" && (
                        <button
                          type="button"
                          onClick={() => {
                            setSelectedCase(c);
                            setActionType("approve");
                            setActionComment("");
                          }}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-emerald-500/40 text-emerald-600 dark:text-emerald-400 text-xs font-bold hover:bg-emerald-500/10 transition-all"
                        >
                          <Check className="w-3.5 h-3.5" />
                          <span>Approve Revisions</span>
                        </button>
                      )}

                      {/* Primary Open Case Link */}
                      <Link
                        href={`/cases/${c.id}`}
                        className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-accent hover:bg-accent-hover text-accent-text text-xs font-bold shadow-xs transition-all"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>Inspect & Grade</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </Link>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* WORKFLOW ACTION MODAL (APPROVE / REQUEST CHANGES / REJECT / PUBLISH) */}
        {actionType && actionType !== "audit" && selectedCase && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in">
            <div className="bg-surface border border-border rounded-xl shadow-xl max-w-lg w-full p-6 space-y-5">
              <div className="flex items-center justify-between border-b border-border pb-3">
                <div className="flex items-center gap-2">
                  {actionType === "approve" && <CheckCircle2 className="w-5 h-5 text-emerald-500" />}
                  {actionType === "request-changes" && <AlertTriangle className="w-5 h-5 text-rose-500" />}
                  {actionType === "publish" && <Globe className="w-5 h-5 text-primary dark:text-blue-400" />}
                  <h3 className="text-base font-serif font-bold text-text">
                    {actionType === "approve" && "Approve Case for Curriculum"}
                    {actionType === "request-changes" && "Request Pedagogical Revisions"}
                    {actionType === "reject" && "Reject Case Submission"}
                    {actionType === "publish" && "Publish Case to Directory"}
                  </h3>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setActionType(null);
                    setSelectedCase(null);
                  }}
                  className="p-1 rounded-lg hover:bg-muted/10 text-muted hover:text-text"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="text-xs text-muted">
                <span className="font-semibold text-text">{selectedCase.title}</span> (by {selectedCase.author_name || "Faculty"})
              </div>

              <form onSubmit={handleWorkflowSubmit} className="space-y-4">
                {/* Publish Visibility Selector */}
                {actionType === "publish" && (
                  <div className="space-y-2">
                    <label className="block text-xs font-bold text-text">
                      Directory Visibility Scope
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        type="button"
                        onClick={() => setActionVisibility("sbs_only")}
                        className={`p-3 rounded-lg border text-left flex flex-col gap-1 transition-all ${
                          actionVisibility === "sbs_only"
                            ? "border-accent bg-accent/5 text-text font-bold"
                            : "border-border bg-background text-muted"
                        }`}
                      >
                        <div className="flex items-center gap-1.5 text-xs font-bold text-text">
                          <Building className="w-3.5 h-3.5 text-accent" />
                          <span>SBS-Only</span>
                        </div>
                        <span className="text-[11px] text-muted">
                          Accessible strictly to SBS authenticated students & faculty.
                        </span>
                      </button>

                      <button
                        type="button"
                        onClick={() => setActionVisibility("public")}
                        className={`p-3 rounded-lg border text-left flex flex-col gap-1 transition-all ${
                          actionVisibility === "public"
                            ? "border-accent bg-accent/5 text-text font-bold"
                            : "border-border bg-background text-muted"
                        }`}
                      >
                        <div className="flex items-center gap-1.5 text-xs font-bold text-text">
                          <Globe className="w-3.5 h-3.5 text-accent" />
                          <span>Public</span>
                        </div>
                        <span className="text-[11px] text-muted">
                          Accessible to external executive participants & public visitors.
                        </span>
                      </button>
                    </div>
                  </div>
                )}

                {/* Comment / Feedback Input */}
                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-text">
                    {actionType === "approve"
                      ? "Approval Note (Optional Commendation)"
                      : actionType === "publish"
                      ? "Publication Announcement Note (Optional)"
                      : "Required Reviewer Feedback & Revision Points *"}
                  </label>
                  <textarea
                    rows={4}
                    value={actionComment}
                    onChange={(e) => setActionComment(e.target.value)}
                    placeholder={
                      actionType === "request-changes"
                        ? "Detail the exhibits, calculations, or discussion questions that require revision before approval..."
                        : "Enter optional comments or commendations for the author..."
                    }
                    className="w-full p-2.5 rounded-lg border border-border bg-background text-xs text-text placeholder:text-muted focus:outline-none focus:border-accent"
                    required={actionType === "request-changes" || actionType === "reject"}
                  />
                </div>

                <div className="flex items-center justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => {
                      setActionType(null);
                      setSelectedCase(null);
                    }}
                    className="px-3.5 py-2 rounded-lg border border-border text-xs font-semibold text-muted hover:text-text"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmittingAction}
                    className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-bold shadow-xs transition-all ${
                      actionType === "request-changes" || actionType === "reject"
                        ? "bg-rose-600 hover:bg-rose-700 text-white"
                        : actionType === "publish"
                        ? "bg-primary hover:opacity-90 text-white"
                        : "bg-emerald-600 hover:bg-emerald-700 text-white"
                    } ${isSubmittingAction ? "opacity-60 cursor-not-allowed" : ""}`}
                  >
                    {isSubmittingAction ? (
                      <span>Saving...</span>
                    ) : (
                      <>
                        <Check className="w-3.5 h-3.5" />
                        <span>Confirm {actionType.replace("-", " ")}</span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* AUDIT TRAIL MODAL */}
        {actionType === "audit" && selectedCase && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in">
            <div className="bg-surface border border-border rounded-xl shadow-xl max-w-2xl w-full p-6 space-y-4 max-h-[85vh] flex flex-col">
              <div className="flex items-center justify-between border-b border-border pb-3 shrink-0">
                <div className="flex items-center gap-2">
                  <History className="w-5 h-5 text-accent" />
                  <div>
                    <h3 className="text-base font-serif font-bold text-text">
                      Case Governance Audit Trail
                    </h3>
                    <p className="text-xs text-muted truncate max-w-md">
                      {selectedCase.title}
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setActionType(null);
                    setSelectedCase(null);
                  }}
                  className="p-1 rounded-lg hover:bg-muted/10 text-muted hover:text-text"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="overflow-y-auto flex-1 pr-1 space-y-3">
                {loadingAudit && (
                  <div className="py-8 text-center text-xs text-muted">
                    Loading compliance audit log records...
                  </div>
                )}

                {!loadingAudit && caseAuditLogs.length === 0 && (
                  <div className="py-8 text-center text-xs text-muted">
                    No recorded compliance audit entries found for this case.
                  </div>
                )}

                {!loadingAudit &&
                  caseAuditLogs.map((log) => (
                    <div
                      key={log.id}
                      className="p-3 rounded-lg border border-border bg-background space-y-1 text-xs"
                    >
                      <div className="flex items-center justify-between gap-2">
                        <span className="font-bold text-text uppercase tracking-wider text-[10px] px-2 py-0.5 rounded bg-muted/15 border border-border">
                          {log.action.replace(/_/g, " ")}
                        </span>
                        <span className="text-[11px] text-muted">
                          {new Date(log.created_at).toLocaleString()}
                        </span>
                      </div>
                      <div className="text-muted flex items-center gap-1.5 pt-1">
                        <User className="w-3 h-3 text-muted" />
                        <span className="text-text font-medium">{log.actor_email}</span>
                      </div>
                      {log.metadata && Object.keys(log.metadata).length > 0 && (
                        <div className="mt-1 text-[11px] text-muted font-mono bg-surface p-2 rounded border border-border/50">
                          {JSON.stringify(log.metadata, null, 2)}
                        </div>
                      )}
                    </div>
                  ))}
              </div>

              <div className="pt-3 border-t border-border shrink-0 flex justify-end">
                <button
                  type="button"
                  onClick={() => {
                    setActionType(null);
                    setSelectedCase(null);
                  }}
                  className="px-4 py-2 rounded-lg bg-surface border border-border text-xs font-semibold text-text hover:border-accent"
                >
                  Close Audit View
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </AppShell>
  );
}
