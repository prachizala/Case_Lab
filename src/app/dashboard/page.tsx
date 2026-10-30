"use client";

import { useEffect, useState, use } from "react";
import Link from "next/link";
import { AppShell } from "@/components/AppShell";
import { getCachedUser } from "@/lib/auth-client";
import { StateLoading } from "@/components/StateLoading";
import { Profile, CaseStudy, CaseSignal, TokenBudgetInfo, DashboardTelemetry, RecentActivityItem } from "@/lib/types";
import { COLLEGE_NAME, COLLEGE_NAME_WITH_SHORT, COLLEGE_SHORT, AI_ENGINE_LABEL } from "@/config/college";
import {
  Sparkles,
  BookOpen,
  ShieldCheck,
  GraduationCap,
  Clock,
  ArrowRight,
  AlertTriangle,
  Layers,
  FileQuestion,
  Briefcase,
  TrendingUp,
  Radio,
  ExternalLink,
  Sliders,
  CheckCircle2,
  Users,
  Compass,
  Zap,
  Check,
  X,
  UserCheck,
  UserX,
  Activity,
  ChevronDown,
  ChevronUp,
  ShieldAlert,
  PieChart,
  Building,
} from "lucide-react";

const ALL_WATCH_INDUSTRIES = [
  "Fintech & Banking",
  "Renewable Energy & CleanTech",
  "Supply Chain & Manufacturing",
  "Consumer & Retail",
  "Technology & Enterprise Software",
  "Healthcare & Pharmaceuticals",
  "Automotive & Electric Vehicles",
  "Infrastructure & Maritime Ports",
  "Chemicals & Petrochemicals",
  "Agri-Tech & Commodity Logistics",
  "Aviation & Mobility",
  "EdTech & Future of Work",
];

export default function DashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const unwrappedParams = use(searchParams);
  const unauthorizedError = unwrappedParams.error;

  const [user, setUser] = useState<Profile | null>(null);
  const [cases, setCases] = useState<CaseStudy[]>([]);
  const [signals, setSignals] = useState<CaseSignal[]>([]);
  const [watchIndustries, setWatchIndustries] = useState<string[]>([]);
  const [watchModalOpen, setWatchModalOpen] = useState(false);
  const [tempIndustries, setTempIndustries] = useState<string[]>([]);
  const [selectedIndustryFilter, setSelectedIndustryFilter] = useState<string>("ALL");
  const [dashboardStats, setDashboardStats] = useState<DashboardTelemetry>({
    totalCases: 0,
    pendingApprovals: 0,
    activeFaculty: 0,
    activeStudents: 0,
    casesCreatedThisMonth: 0,
  });
  const [pendingRegistrations, setPendingRegistrations] = useState<(Profile & { department_name?: string })[]>([]);
  const [recentActivities, setRecentActivities] = useState<RecentActivityItem[]>([]);
  const [budget, setBudget] = useState<TokenBudgetInfo | null>(null);
  const [budgetDismissed, setBudgetDismissed] = useState(false);
  const [deptBreakdownOpen, setDeptBreakdownOpen] = useState(false);
  const [registrationActionLoading, setRegistrationActionLoading] = useState<string | null>(null);
  const [dashboardFeedback, setDashboardFeedback] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const handleDismissBudget = () => {
    setBudgetDismissed(true);
    try {
      localStorage.setItem("sbs_budget_alert_dismissed", "true");
    } catch {}
  };

  const handleApproveRegistration = async (targetUserId: string) => {
    setRegistrationActionLoading(targetUserId);
    try {
      const res = await fetch("/api/dashboard", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "approve-registration", userId: targetUserId }),
      });
      const data = await res.json();
      if (data.success) {
        setPendingRegistrations((prev) => prev.filter((p) => p.id !== targetUserId));
        if (data.stats) setDashboardStats(data.stats);
        setDashboardFeedback(data.message || "Registration successfully approved.");
        setTimeout(() => setDashboardFeedback(null), 4000);
      } else {
        alert(data.error || "Failed to approve registration.");
      }
    } catch (err) {
      console.error("Approve registration error:", err);
      alert("Error approving registration.");
    } finally {
      setRegistrationActionLoading(null);
    }
  };

  const handleRejectRegistration = async (targetUserId: string) => {
    if (!confirm("Are you sure you want to reject this registration application?")) return;
    setRegistrationActionLoading(targetUserId);
    try {
      const res = await fetch("/api/dashboard", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "reject-registration", userId: targetUserId }),
      });
      const data = await res.json();
      if (data.success) {
        setPendingRegistrations((prev) => prev.filter((p) => p.id !== targetUserId));
        if (data.stats) setDashboardStats(data.stats);
        setDashboardFeedback("Registration rejected.");
        setTimeout(() => setDashboardFeedback(null), 4000);
      } else {
        alert(data.error || "Failed to reject registration.");
      }
    } catch (err) {
      console.error("Reject registration error:", err);
      alert("Error rejecting registration.");
    } finally {
      setRegistrationActionLoading(null);
    }
  };

  useEffect(() => {
    try {
      if (localStorage.getItem("sbs_budget_alert_dismissed") === "true") {
        setBudgetDismissed(true);
      }
    } catch {}

    const handleAuthChanged = () => {
      getCachedUser(true).then((u) => {
        if (u) {
          setUser(u);
          if (u.watch_industries) {
            setWatchIndustries(u.watch_industries);
            setTempIndustries(u.watch_industries);
          }
        }
      });
    };
    window.addEventListener("sbs-auth-changed", handleAuthChanged);
    return () => window.removeEventListener("sbs-auth-changed", handleAuthChanged);
  }, []);

  useEffect(() => {
    Promise.all([
      getCachedUser().then((u) => ({ user: u })),
      fetch("/api/cases").then((r) => r.json()),
      fetch("/api/signals").then((r) => r.json()),
      fetch("/api/dashboard").then((r) => r.json()).catch(() => null),
    ])
      .then(([authData, casesData, signalsData, dashboardData]) => {
        if (authData.user) {
          setUser(authData.user);
          if (authData.user.watch_industries) {
            setWatchIndustries(authData.user.watch_industries);
            setTempIndustries(authData.user.watch_industries);
          }
        }
        if (casesData.cases) setCases(casesData.cases);
        if (signalsData.signals) {
          setSignals(signalsData.signals);
          if (signalsData.watchIndustries) {
            setWatchIndustries(signalsData.watchIndustries);
            setTempIndustries(signalsData.watchIndustries);
          }
        }
        if (dashboardData?.stats) {
          setDashboardStats(dashboardData.stats);
        }
        if (dashboardData?.pendingRegistrations) {
          setPendingRegistrations(dashboardData.pendingRegistrations);
        }
        if (dashboardData?.recentActivity) {
          setRecentActivities(dashboardData.recentActivity);
        }
        if (dashboardData?.budget) {
          setBudget(dashboardData.budget);
        }
      })
      .catch((err) => console.error("Dashboard fetch error:", err))
      .finally(() => setLoading(false));
  }, []);

  const role = user?.role || "faculty";

  // 1. Time of Day Greeting
  const getTimeGreeting = () => {
    const hour = new Date().getHours();
    let timeGreeting = "Good morning";
    if (hour >= 12 && hour < 17) {
      timeGreeting = "Good afternoon";
    } else if (hour >= 17) {
      timeGreeting = "Good evening";
    }
    return `${timeGreeting}, ${user?.name || "Colleague"}`;
  };

  const handleToggleIndustry = (ind: string) => {
    if (tempIndustries.includes(ind)) {
      setTempIndustries(tempIndustries.filter((i) => i !== ind));
    } else {
      if (tempIndustries.length >= 8) {
        alert("You can select up to 8 watch industries.");
        return;
      }
      setTempIndustries([...tempIndustries, ind]);
    }
  };

  const handleSaveWatchIndustries = async () => {
    try {
      const res = await fetch("/api/signals", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ industries: tempIndustries }),
      });
      const data = await res.json();
      if (data.watchIndustries) {
        setWatchIndustries(data.watchIndustries);
        setWatchModalOpen(false);
      }
    } catch (err) {
      console.error("Failed to save watch industries:", err);
    }
  };

  const filteredSignals = signals.filter((s) => {
    if (selectedIndustryFilter === "ALL") {
      return (
        watchIndustries.length === 0 ||
        watchIndustries.some(
          (wi) => wi.toLowerCase() === s.industry.toLowerCase()
        )
      );
    }
    return s.industry.toLowerCase() === selectedIndustryFilter.toLowerCase();
  });

  function formatTimeAgo(date: Date): string {
    const seconds = Math.floor((Date.now() - date.getTime()) / 1000);
    if (seconds < 60) return "Just now";
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    if (days < 30) return `${days}d ago`;
    return date.toLocaleDateString();
  }

  if (loading) {
    return (
      <AppShell>
        <div className="max-w-6xl mx-auto py-8">
          <StateLoading
            title="Assembling Executive Workspace..."
            subtitle="Syncing course catalogs, teaching cases, and institutional authorizations."
          />
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell>
      <div className="space-y-8 pb-12">
        {/* REDIRECT UNAUTHORIZED ALERT (Student tries to open faculty URL) */}
        {unauthorizedError && (
          <div className="p-4 rounded-2xl border border-danger/30 bg-danger/15 text-danger flex items-start gap-3 shadow-sm animate-shake">
            <AlertTriangle className="w-5 h-5 text-danger shrink-0 mt-0.5" />
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-danger">
                Route Access Denied & Redirected
              </h4>
              <p className="text-xs mt-1 leading-relaxed">
                {unauthorizedError}
              </p>
            </div>
          </div>
        )}

        {/* INSTITUTIONAL AI TOKEN BUDGET ALERT: COMPACT PILL WITH CIRCULAR PROGRESS RING */}
        {budget && (budget.usage_percentage >= 80 || budget.is_warning_threshold) && (!budgetDismissed || budget.usage_percentage >= 100) && (
          <div
            className={`p-4 rounded-2xl border transition-all shadow-sm space-y-3 ${
              budget.usage_percentage >= 100
                ? "border-red-600/70 bg-red-500/10 text-text"
                : budget.usage_percentage >= 90
                ? "border-red-500/50 bg-red-500/10 text-text"
                : "border-amber-500/50 bg-amber-500/10 text-text"
            }`}
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-3.5 min-w-0">
                {/* SVG CIRCULAR PROGRESS RING */}
                <div className="relative w-11 h-11 shrink-0 flex items-center justify-center">
                  <svg className="w-11 h-11 -rotate-90" viewBox="0 0 36 36">
                    <circle
                      cx="18"
                      cy="18"
                      r="15"
                      fill="none"
                      className="stroke-muted/20"
                      strokeWidth="3"
                    />
                    <circle
                      cx="18"
                      cy="18"
                      r="15"
                      fill="none"
                      strokeWidth="3.2"
                      strokeDasharray="94.25"
                      strokeDashoffset={94.25 - (94.25 * Math.min(100, budget.usage_percentage)) / 100}
                      strokeLinecap="round"
                      className={
                        budget.usage_percentage >= 100
                          ? "stroke-red-600"
                          : budget.usage_percentage >= 90
                          ? "stroke-red-500"
                          : "stroke-amber-500"
                      }
                    />
                  </svg>
                  <span className="absolute text-[10px] font-mono font-bold text-text">
                    {budget.usage_percentage}%
                  </span>
                </div>

                <div className="space-y-0.5 min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-serif font-bold text-xs sm:text-sm text-text">
                      {budget.usage_percentage >= 100
                        ? "AI Token Quota Exhausted"
                        : budget.usage_percentage >= 90
                        ? "Critical Token Allocation Alert"
                        : "Institutional Token Budget Warning"}
                    </span>
                    <span
                      className={`px-2 py-0.5 rounded-full text-white font-mono text-[9px] font-bold uppercase tracking-wider ${
                        budget.usage_percentage >= 100
                          ? "bg-red-600"
                          : budget.usage_percentage >= 90
                          ? "bg-red-500"
                          : "bg-amber-500"
                      }`}
                    >
                      {budget.usage_percentage >= 100 ? "Blocked" : `${budget.usage_percentage}% Used`}
                    </span>
                  </div>
                  <p className="text-[11px] text-muted font-mono truncate">
                    Used {budget.tokens_used_this_month.toLocaleString()} / {budget.monthly_budget_tokens.toLocaleString()} tokens •{" "}
                    <strong>{budget.remaining_tokens.toLocaleString()} remaining</strong>
                  </p>
                </div>
              </div>

              {/* Action Controls & Department Drawer Toggle */}
              <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
                {budget.department_breakdown && budget.department_breakdown.length > 0 && (
                  <button
                    type="button"
                    onClick={() => setDeptBreakdownOpen(!deptBreakdownOpen)}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-border bg-surface text-text hover:bg-muted/10 text-xs font-medium transition-colors"
                  >
                    <PieChart className="w-3.5 h-3.5 text-accent" />
                    <span>Breakdown</span>
                    {deptBreakdownOpen ? (
                      <ChevronUp className="w-3.5 h-3.5" />
                    ) : (
                      <ChevronDown className="w-3.5 h-3.5" />
                    )}
                  </button>
                )}

                <Link
                  href="/pricing"
                  className="px-3 py-1.5 rounded-xl bg-accent hover:bg-accent-hover text-accent-text font-serif font-bold text-xs shadow-xs transition-all flex items-center gap-1"
                >
                  <span>Quota Upgrade</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>

                {budget.usage_percentage < 100 && (
                  <button
                    onClick={handleDismissBudget}
                    className="p-1.5 rounded-lg text-muted hover:text-text hover:bg-surface/50 transition-colors"
                    title="Dismiss alert for this session"
                    aria-label="Dismiss alert"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>

            {/* EXPANDABLE DEPARTMENT ALLOCATION BREAKDOWN */}
            {deptBreakdownOpen && budget.department_breakdown && (
              <div className="pt-2 border-t border-border/40 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5 animate-fadeIn">
                {budget.department_breakdown.map((dept) => (
                  <div
                    key={dept.department_id}
                    className="p-3 rounded-xl bg-surface-raised border border-[#D9E1EC] dark:border-border text-xs space-y-1.5 shadow-2xs"
                  >
                    <div className="flex justify-between items-center">
                      <span className="font-serif font-bold text-text truncate pr-1">
                        {dept.department_name}
                      </span>
                      <span className="font-mono font-bold text-accent shrink-0">
                        {dept.percentage}%
                      </span>
                    </div>
                    <div className="w-full bg-muted/20 rounded-full h-1.5 overflow-hidden">
                      <div
                        className="h-full bg-accent rounded-full transition-all duration-300"
                        style={{ width: `${Math.min(100, dept.percentage)}%` }}
                      />
                    </div>
                    <p className="text-[10px] font-mono text-muted text-right">
                      {dept.tokens_used.toLocaleString()} tokens
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* 1. HERO GREETING BANNER WITH NON-CROPPED WATERMARK & "TODAY AT THE CASE CENTRE" */}
        <div className="p-6 md:p-8 rounded-3xl hero-banner text-white shadow-xl relative overflow-hidden folder-card">
          {/* Subtle gold signature detail */}
          <div className="w-20 h-1 bg-gradient-to-r from-accent via-amber-400 to-accent rounded-full mb-3" />

          <div className="relative z-10 max-w-xl lg:max-w-2xl space-y-3.5 pr-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/12 text-white border border-white/20 text-xs font-bold uppercase tracking-wider backdrop-blur-xs">
              <span>{COLLEGE_SHORT}</span>
              <span>•</span>
              <span className="capitalize">{role} Portal</span>
            </div>

            {/* Time of day greeting */}
            <h1 className="font-serif text-2xl md:text-4xl font-extrabold tracking-tight text-white leading-tight">
              {getTimeGreeting()}
            </h1>

            {/* "Today at the Case Centre" strip */}
            <div className="pt-0.5 pb-1 flex flex-wrap items-center gap-2">
              <span className="text-[11px] font-mono uppercase font-bold tracking-wider text-amber-400 flex items-center gap-1.5 shrink-0">
                <Activity className="w-3.5 h-3.5 text-amber-400" />
                Today at the Case Centre:
              </span>
              <div className="flex flex-wrap items-center gap-1.5">
                <span className="px-2.5 py-1 rounded-full bg-white/12 border border-white/20 text-[11px] font-medium text-white shadow-2xs backdrop-blur-xs">
                  <strong className="text-white font-bold">{dashboardStats.pendingApprovals}</strong> Pending Approvals
                </span>
                <span className="px-2.5 py-1 rounded-full bg-white/12 border border-white/20 text-[11px] font-medium text-white shadow-2xs backdrop-blur-xs">
                  <strong className="text-white font-bold">{cases.filter((c) => c.status === "in_review").length}</strong> In Review
                </span>
                <span className="px-2.5 py-1 rounded-full bg-white/12 border border-white/20 text-[11px] font-medium text-white shadow-2xs backdrop-blur-xs">
                  <strong className="text-white font-bold">{budget ? `${100 - budget.usage_percentage}%` : "100%"}</strong> Quota Intact
                </span>
              </div>
            </div>

            <p className="text-xs md:text-sm text-[var(--hero-text-muted)] leading-relaxed">
              {role === "student"
                ? "Access assigned case studies, review quantitative exhibits, and track your analytical portfolio."
                : role === "admin"
                ? `Administer the ${COLLEGE_NAME_WITH_SHORT} curriculum platform, approve faculty/student registrations, and configure academic departments.`
                : `Generate high-impact business cases using the ${AI_ENGINE_LABEL}, design multi-phased classroom simulations, and review facilitator guides.`}
            </p>

            <div className="pt-2 flex flex-wrap items-center gap-3">
              {role === "student" ? (
                <>
                  <Link
                    href="/library"
                    className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-accent hover:bg-accent-hover text-accent-text font-serif font-bold text-xs shadow-md transition-all hover:scale-[1.02]"
                  >
                    <BookOpen className="w-4 h-4" />
                    <span>Open Case Library</span>
                  </Link>
                  <Link
                    href="/my-answers"
                    className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-white/40 bg-white/10 hover:bg-white/20 hover:border-white/70 text-white font-serif font-semibold text-xs shadow-2xs transition-all hover:scale-[1.02] backdrop-blur-xs focus:outline-hidden focus-visible:ring-2 focus-visible:ring-white"
                  >
                    <FileQuestion className="w-4 h-4" />
                    <span>My Answers</span>
                  </Link>
                </>
              ) : role === "admin" ? (
                <>
                  <Link
                    href="/admin"
                    className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-accent hover:bg-accent-hover text-accent-text font-serif font-bold text-xs shadow-md transition-all hover:scale-[1.02]"
                  >
                    <ShieldCheck className="w-4 h-4" />
                    <span>Admin Control Center</span>
                  </Link>
                  <Link
                    href="/create"
                    className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-white/40 bg-white/10 hover:bg-white/20 hover:border-white/70 text-white font-serif font-semibold text-xs shadow-2xs transition-all hover:scale-[1.02] backdrop-blur-xs focus:outline-hidden focus-visible:ring-2 focus-visible:ring-white"
                  >
                    <Sparkles className="w-4 h-4" />
                    <span>Generate Case</span>
                  </Link>
                </>
              ) : (
                <>
                  <Link
                    href="/create"
                    className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-accent hover:bg-accent-hover text-accent-text font-serif font-bold text-xs shadow-md transition-all hover:scale-[1.02]"
                  >
                    <Sparkles className="w-4 h-4" />
                    <span>Generate New Case ({AI_ENGINE_LABEL})</span>
                  </Link>
                  <Link
                    href="/library"
                    className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-white/40 bg-white/10 hover:bg-white/20 hover:border-white/70 text-white font-serif font-semibold text-xs shadow-2xs transition-all hover:scale-[1.02] backdrop-blur-xs focus:outline-hidden focus-visible:ring-2 focus-visible:ring-white"
                  >
                    <BookOpen className="w-4 h-4" />
                    <span>Browse Case Library</span>
                  </Link>
                </>
              )}
            </div>
          </div>

          {/* DECORATIVE WATERMARK: FULLY INSIDE BANNER WITH COMFORTABLE PADDING ON ALL SIDES */}
          <div
            aria-hidden="true"
            className="absolute right-4 sm:right-8 lg:right-12 top-1/2 -translate-y-1/2 pointer-events-none select-none font-serif font-black tracking-tight text-white opacity-[0.07] text-[clamp(96px,14vw,220px)] leading-none hidden sm:block"
          >
            {COLLEGE_SHORT}
          </div>
        </div>

        {/* 2. GENERATE A NEW CASE CARD WITH 5-STEP WORKFLOW STEPPER (FACULTY / ADMIN) */}
        {role !== "student" && (
          <div className="p-6 md:p-8 rounded-3xl border border-accent/25 bg-surface shadow-sm space-y-6 folder-card card-hover-lift">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div className="space-y-2 max-w-2xl">
                <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-md bg-accent text-accent-text text-[10px] font-mono font-bold uppercase tracking-wider">
                  <Sparkles className="w-3 h-3" />
                  <span>{AI_ENGINE_LABEL} Workflow</span>
                </div>
                <h2 className="font-serif text-2xl md:text-3xl font-extrabold text-text tracking-tight">
                  Generate a New Teaching Case Study
                </h2>
                <p className="text-xs md:text-sm text-muted leading-relaxed">
                  Generate classroom simulations calibrated to Bloom&apos;s Taxonomy with the {AI_ENGINE_LABEL}. Includes executive summaries, 5 discussion questions, illustrative exhibit data, and teaching notes in English, Hindi, or Gujarati.
                </p>
              </div>

              <div className="shrink-0">
                <Link
                  href="/create"
                  className="inline-flex items-center gap-2 px-5 py-3 rounded-2xl bg-accent hover:bg-accent-hover text-accent-text font-serif font-extrabold text-sm shadow-md hover:shadow-lg transition-all"
                >
                  <Sparkles className="w-4 h-4 text-accent-text" />
                  <span>Open Generate Studio</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>

            {/* 5-STEP VISUAL PIPELINE STEPPER PREVIEW */}
            <div className="pt-4 border-t border-border/60">
              <p className="text-[10px] font-mono uppercase tracking-wider text-muted font-bold mb-3">
                Pedagogical Generation Pipeline:
              </p>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
                {[
                  { step: "01", title: "Topic & Domain", desc: "Select from 7 business disciplines & protagonists" },
                  { step: "02", title: "Case Format", desc: "Short Case, Full Study, or Comparative Research" },
                  { step: "03", title: "Language", desc: "English, Hindi (Devanagari), or Gujarati" },
                  { step: "04", title: "AI Generation", desc: "Schema-validated quantitative & qualitative exhibits" },
                  { step: "05", title: "Faculty Review", desc: "Accredited peer approval & publication" },
                ].map((st, i) => (
                  <div
                    key={st.step}
                    className="p-3 rounded-xl bg-surface-raised border border-[#D9E1EC] dark:border-border/70 space-y-1 relative group hover:border-accent/40 transition-colors"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-[10px] font-bold text-accent">
                        {st.step}
                      </span>
                      {i < 4 && (
                        <ArrowRight className="w-3 h-3 text-muted/50 hidden md:block" />
                      )}
                    </div>
                    <p className="font-serif font-bold text-xs text-text">{st.title}</p>
                    <p className="text-[10px] text-muted leading-tight">{st.desc}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* 3. 5 INSTITUTIONAL TELEMETRY STAT CARDS */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          {/* Stat 1: Total Cases */}
          <div className="p-5 rounded-2xl border border-border bg-surface shadow-xs space-y-2 hover:border-accent/40 transition-all folder-card card-hover-lift">
            <div className="flex items-center justify-between text-muted">
              <span className="text-[10px] uppercase font-bold tracking-wider">Total Cases</span>
              <BookOpen className="w-4 h-4 text-accent" />
            </div>
            <div className="flex items-baseline justify-between">
              <p className="font-serif text-3xl font-extrabold text-text">
                {dashboardStats.totalCases || cases.length}
              </p>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-accent/15 text-accent font-bold">
                {cases.filter((c) => c.status === "approved").length} Approved
              </span>
            </div>
            <p className="text-[11px] text-muted">Institutional repository</p>
          </div>

          {/* Stat 2: Pending Approvals */}
          <div className="p-5 rounded-2xl border border-border bg-surface shadow-xs space-y-2 hover:border-amber-400/50 transition-all folder-card card-hover-lift">
            <div className="flex items-center justify-between text-muted">
              <span className="text-[10px] uppercase font-bold tracking-wider">Pending Approvals</span>
              <Clock className="w-4 h-4 text-amber-500" />
            </div>
            <div className="flex items-baseline justify-between">
              <p className="font-serif text-3xl font-extrabold text-amber-600 dark:text-amber-400">
                {dashboardStats.pendingApprovals}
              </p>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-amber-500/15 text-amber-600 dark:text-amber-400 font-bold">
                Awaiting Review
              </span>
            </div>
            <p className="text-[11px] text-muted">Curriculum submissions</p>
          </div>

          {/* Stat 3: Active Faculty */}
          <div className="p-5 rounded-2xl border border-border bg-surface shadow-xs space-y-2 hover:border-primary/40 transition-all folder-card card-hover-lift">
            <div className="flex items-center justify-between text-muted">
              <span className="text-[10px] uppercase font-bold tracking-wider">Active Faculty</span>
              <GraduationCap className="w-4 h-4 text-primary" />
            </div>
            <div className="flex items-baseline justify-between">
              <p className="font-serif text-3xl font-extrabold text-text">
                {dashboardStats.activeFaculty || 2}
              </p>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-primary/10 text-primary font-bold">
                Authors
              </span>
            </div>
            <p className="text-[11px] text-muted">Verified case authors</p>
          </div>

          {/* Stat 4: Active Students */}
          <div className="p-5 rounded-2xl border border-border bg-surface shadow-xs space-y-2 hover:border-info/40 transition-all folder-card card-hover-lift">
            <div className="flex items-center justify-between text-muted">
              <span className="text-[10px] uppercase font-bold tracking-wider">Active Students</span>
              <Users className="w-4 h-4 text-info" />
            </div>
            <div className="flex items-baseline justify-between">
              <p className="font-serif text-3xl font-extrabold text-text">
                {dashboardStats.activeStudents || 10}
              </p>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-info/10 text-info font-bold">
                Enrolled
              </span>
            </div>
            <p className="text-[11px] text-muted">Cohort simulation learners</p>
          </div>

          {/* Stat 5: Cases Created This Month */}
          <div className="p-5 rounded-2xl border border-border bg-surface shadow-xs space-y-2 hover:border-emerald-400/50 transition-all folder-card card-hover-lift">
            <div className="flex items-center justify-between text-muted">
              <span className="text-[10px] uppercase font-bold tracking-wider">Created This Month</span>
              <Sparkles className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            </div>
            <div className="flex items-baseline justify-between">
              <p className="font-serif text-3xl font-extrabold text-emerald-600 dark:text-emerald-400">
                {dashboardStats.casesCreatedThisMonth || cases.length}
              </p>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 font-bold">
                {new Date().toLocaleString("default", { month: "short" })} 2026
              </span>
            </div>
            <p className="text-[11px] text-muted">Current academic cycle</p>
          </div>
        </div>

        {/* 4. PENDING REGISTRATIONS WIDGET (ADMIN VIEW OR GLOBAL REGISTRATION MONITOR) */}
        {role === "admin" && (
          <div className="p-6 md:p-8 rounded-3xl border border-border bg-surface shadow-sm space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border pb-4">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-accent/15 text-accent">
                  <UserCheck className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-serif text-lg font-bold text-text">
                      Pending Registrations
                    </h3>
                    {pendingRegistrations.length > 0 && (
                      <span className="px-2 py-0.5 rounded-full bg-accent text-accent-text font-mono text-[10px] font-bold">
                        {pendingRegistrations.length} Awaiting Approval
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-muted">
                    New faculty and student onboarding applications requiring Dean / Administrator authorization.
                  </p>
                </div>
              </div>

              <Link
                href="/admin"
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-accent hover:underline shrink-0"
              >
                <span>Directory Governance</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            {/* Notification toast for registration action */}
            {dashboardFeedback && (
              <div className="p-3 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-700 dark:text-emerald-300 text-xs font-medium flex items-center gap-2 animate-fadeIn">
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                <span>{dashboardFeedback}</span>
              </div>
            )}

            {pendingRegistrations.length === 0 ? (
              <div className="p-8 text-center rounded-2xl border border-dashed border-border bg-surface/40 space-y-2">
                <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto" />
                <h4 className="font-serif font-bold text-sm text-text">All Registrations Approved</h4>
                <p className="text-xs text-muted max-w-md mx-auto">
                  There are no pending student or faculty access applications in the queue.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {pendingRegistrations.map((cand) => {
                  const isLoading = registrationActionLoading === cand.id;
                  return (
                    <div
                      key={cand.id}
                      className="p-5 rounded-2xl border border-border bg-surface/70 hover:border-accent/40 transition-all flex flex-col justify-between space-y-4 shadow-2xs"
                    >
                      <div className="space-y-2.5">
                        <div className="flex items-center justify-between gap-2">
                          <span
                            className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                              cand.role === "faculty"
                                ? "bg-primary text-on-primary"
                                : "bg-info/20 text-info"
                            }`}
                          >
                            {cand.role}
                          </span>
                          <span className="text-[10px] font-mono text-muted">
                            {cand.created_at ? new Date(cand.created_at).toLocaleDateString() : "Recent"}
                          </span>
                        </div>

                        <div>
                          <h4 className="font-serif text-sm font-bold text-text">
                            {cand.name}
                          </h4>
                          <p className="text-xs text-muted truncate" title={cand.email}>
                            {cand.email}
                          </p>
                        </div>

                        <div className="flex items-center gap-1.5 text-[11px] text-muted">
                          <Building className="w-3.5 h-3.5 shrink-0 text-accent" />
                          <span className="truncate">{cand.department_name || "General Management"}</span>
                        </div>
                      </div>

                      <div className="pt-3 border-t border-border flex items-center gap-2">
                        <button
                          onClick={() => handleApproveRegistration(cand.id)}
                          disabled={isLoading}
                          className="flex-1 py-1.5 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-serif font-bold transition-all flex items-center justify-center gap-1.5 shadow-xs disabled:opacity-50"
                        >
                          <Check className="w-3.5 h-3.5" />
                          <span>Approve</span>
                        </button>
                        <button
                          onClick={() => handleRejectRegistration(cand.id)}
                          disabled={isLoading}
                          className="py-1.5 px-3 rounded-xl border border-rose-300 dark:border-rose-900 bg-rose-50 dark:bg-rose-950/40 text-rose-600 hover:bg-rose-100 dark:hover:bg-rose-900/60 text-xs font-serif font-bold transition-all flex items-center justify-center gap-1.5 disabled:opacity-50"
                        >
                          <X className="w-3.5 h-3.5" />
                          <span>Reject</span>
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* 5. RECENT INSTITUTIONAL ACTIVITY FEED */}
        <div className="p-6 md:p-8 rounded-3xl border border-border bg-surface shadow-sm space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border pb-4">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-primary text-on-primary">
                <Activity className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-serif text-lg font-bold text-text">
                  Recent Institutional Activity
                </h3>
                <p className="text-xs text-muted">
                  Audit trail of case creations, submissions, peer reviews, and institutional approvals.
                </p>
              </div>
            </div>

            <Link
              href="/admin"
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-accent hover:underline shrink-0"
            >
              <span>View Audit History</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="space-y-3">
            {recentActivities.map((act) => {
              const getBadge = () => {
                switch (act.type) {
                  case "case_created":
                    return {
                      label: "Draft Created",
                      stampClass: "stamp-badge stamp-badge-draft",
                      iconBg: "bg-muted/15 text-muted",
                      icon: <Sparkles className="w-3.5 h-3.5" />,
                    };
                  case "case_submitted":
                    return {
                      label: "Under Review",
                      stampClass: "stamp-badge stamp-badge-review",
                      iconBg: "bg-amber-500/15 text-amber-600 dark:text-amber-400",
                      icon: <Clock className="w-3.5 h-3.5" />,
                    };
                  case "case_approved":
                    return {
                      label: "Approved",
                      stampClass: "stamp-badge stamp-badge-approved",
                      iconBg: "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400",
                      icon: <CheckCircle2 className="w-3.5 h-3.5" />,
                    };
                  case "case_published":
                    return {
                      label: "Published",
                      stampClass: "stamp-badge stamp-badge-published",
                      iconBg: "bg-primary/10 text-primary dark:text-accent",
                      icon: <BookOpen className="w-3.5 h-3.5" />,
                    };
                  default:
                    return {
                      label: "Certified",
                      stampClass: "stamp-badge stamp-badge-approved",
                      iconBg: "bg-accent/15 text-accent",
                      icon: <ShieldCheck className="w-3.5 h-3.5" />,
                    };
                }
              };

              const badge = getBadge();
              const dateObj = new Date(act.timestamp);
              const timeAgo = formatTimeAgo(dateObj);

              return (
                <div
                  key={act.id}
                  className="p-4 rounded-2xl border border-border/80 bg-surface/50 hover:bg-surface hover:border-accent/30 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 card-hover-lift"
                >
                  <div className="flex items-start sm:items-center gap-3 min-w-0">
                    <span className={`p-2 rounded-xl shrink-0 ${badge.iconBg}`}>
                      {badge.icon}
                    </span>
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-serif font-bold text-sm text-text truncate">
                          {act.title}
                        </span>
                        <span className={badge.stampClass}>
                          {badge.label}
                        </span>
                      </div>
                      <p className="text-xs text-muted truncate">
                        {act.details || "Pedagogical milestone completed"} • by{" "}
                        <strong className="text-text">{act.actor_name}</strong> ({act.actor_role})
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 shrink-0 self-end sm:self-center">
                    <span className="text-[11px] font-mono text-muted">{timeAgo}</span>
                    {act.case_id && (
                      <Link
                        href={`/cases/${act.case_id}`}
                        className="p-1.5 rounded-lg border border-border hover:border-accent hover:text-accent transition-colors text-muted"
                        title="View Case Dossier"
                      >
                        <ArrowRight className="w-3.5 h-3.5" />
                      </Link>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* 4. CASE SIGNALS RADAR (INDIAN BUSINESS NEWS + CLAUDE POTENTIAL) */}
        {role !== "student" && (
          <div id="signals-radar" className="p-6 md:p-8 rounded-3xl border border-border bg-surface shadow-md space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-border pb-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2 text-accent text-xs font-bold uppercase tracking-wider">
                  <Radio className="w-4 h-4 text-success animate-pulse" />
                  <span>Curriculum Radar • Live Indian Business Feeds</span>
                </div>
                <h3 className="font-serif text-xl font-bold text-text">
                  Real Signal Case Candidates
                </h3>
                <p className="text-xs text-muted">
                  Continuous news intelligence analyzed by Claude AI for teaching case potential, governance conflicts, and capital allocation dilemmas.
                </p>
              </div>

              <button
                onClick={() => setWatchModalOpen(true)}
                className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl border border-border bg-surface text-xs font-serif font-bold text-text hover:border-accent transition-colors"
              >
                <Sliders className="w-3.5 h-3.5 text-accent" />
                <span>Watch Industries ({watchIndustries.length}/8)</span>
              </button>
            </div>

            {/* INDUSTRY FILTER PILLS */}
            <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1">
              <button
                onClick={() => setSelectedIndustryFilter("ALL")}
                className={`px-3 py-1 rounded-full text-xs font-bold transition-all shrink-0 ${
                  selectedIndustryFilter === "ALL"
                    ? "bg-primary text-on-primary"
                    : "bg-primary-soft text-muted hover:text-text"
                }`}
              >
                All Watch Signals
              </button>
              {watchIndustries.map((ind) => (
                <button
                  key={ind}
                  onClick={() => setSelectedIndustryFilter(ind)}
                  className={`px-3 py-1 rounded-full text-xs font-bold transition-all shrink-0 ${
                    selectedIndustryFilter === ind
                      ? "bg-primary text-on-primary"
                      : "bg-primary-soft text-muted hover:text-text"
                  }`}
                >
                  {ind}
                </button>
              ))}
            </div>

            {/* SIGNALS LIST */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredSignals.slice(0, 4).map((sig) => {
                const createUrl = `/create?format=real_signal&industry=${encodeURIComponent(
                  sig.industry
                )}&title=${encodeURIComponent(
                  sig.title
                )}&sourceNotes=${encodeURIComponent(
                  `${sig.summary}\n\nSource: ${sig.source} (${sig.url})\nPedagogical Angle: ${sig.potential_reason}`
                )}&region=Gujarat,%20India`;

                return (
                  <div
                    key={sig.id}
                    className="p-5 rounded-2xl border border-border bg-surface/50 hover:border-accent transition-all flex flex-col justify-between space-y-4 group"
                  >
                    <div className="space-y-2.5">
                      <div className="flex items-center justify-between gap-2">
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-primary text-on-primary">
                          {sig.industry}
                        </span>
                        <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-success/15 border border-success/30 text-success text-[10px] font-mono font-bold">
                          <Zap className="w-3 h-3 text-success" />
                          <span>Potential: {sig.potential_score}/10</span>
                        </div>
                      </div>

                      <h4 className="font-serif text-sm font-bold text-text group-hover:text-accent transition-colors">
                        {sig.title}
                      </h4>

                      <p className="text-xs text-muted line-clamp-2 leading-relaxed">
                        {sig.summary}
                      </p>

                      <div className="p-2.5 rounded-xl bg-primary-soft/60 border border-border text-[11px] text-text italic">
                        &ldquo;{sig.potential_reason}&rdquo;
                      </div>
                    </div>

                    <div className="pt-3 border-t border-border flex items-center justify-between text-[11px]">
                      <span className="text-muted">{sig.source}</span>

                      {/* "CREATE CASE FROM THIS" BUTTON */}
                      <Link
                        href={createUrl}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-accent hover:bg-accent-hover text-accent-text text-xs font-serif font-bold shadow-sm transition-all"
                      >
                        <Sparkles className="w-3.5 h-3.5 text-accent-text" />
                        <span>Create case from this</span>
                      </Link>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* WATCH INDUSTRIES CONFIGURATION MODAL */}
        {watchModalOpen && (
          <div className="fixed inset-0 z-60 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-surface border border-border rounded-3xl max-w-lg w-full p-6 space-y-5 shadow-2xl animate-scaleIn">
              <div className="flex items-center justify-between border-b border-border pb-3">
                <div className="flex items-center gap-2">
                  <Sliders className="w-4 h-4 text-accent" />
                  <h3 className="font-serif text-lg font-bold text-text">
                    Configure Watch Industries
                  </h3>
                </div>
                <span className="text-xs font-mono font-bold text-accent">
                  {tempIndustries.length} / 8 Selected
                </span>
              </div>

              <p className="text-xs text-muted">
                Select up to 8 industries to monitor via the Case Signals scheduled radar. The engine monitors Indian corporate news feeds and scores them for case study potential.
              </p>

              <div className="grid grid-cols-2 gap-2 max-h-60 overflow-y-auto pr-1">
                {ALL_WATCH_INDUSTRIES.map((ind) => {
                  const isChecked = tempIndustries.includes(ind);
                  return (
                    <button
                      key={ind}
                      onClick={() => handleToggleIndustry(ind)}
                      className={`p-2.5 rounded-xl border text-left text-xs font-medium transition-all flex items-center justify-between ${
                        isChecked
                          ? "bg-accent text-accent-text border-accent"
                          : "bg-surface border-border text-text hover:border-accent"
                      }`}
                    >
                      <span className="truncate pr-1">{ind}</span>
                      {isChecked && <Check className="w-3.5 h-3.5 text-accent-text shrink-0" />}
                    </button>
                  );
                })}
              </div>

              <div className="pt-2 flex items-center justify-end gap-3 border-t border-border">
                <button
                  onClick={() => setWatchModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-muted hover:bg-primary-soft"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSaveWatchIndustries}
                  className="px-4 py-2 rounded-xl bg-accent hover:bg-accent-hover text-accent-text text-xs font-serif font-bold shadow-sm"
                >
                  Save Watch Preferences
                </button>
              </div>
            </div>
          </div>
        )}

        {/* RECENT CASES DIRECTORY */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-serif text-xl font-bold text-text">
              Curricular Case Dossiers
            </h3>
            <Link
              href="/library"
              className="inline-flex items-center gap-1 text-xs font-semibold text-accent hover:underline"
            >
              <span>View Case Library</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {cases.slice(0, 4).map((c) => (
              <Link
                key={c.id}
                href={`/cases/${c.id}`}
                className="p-6 rounded-2xl border border-border bg-surface hover:border-accent transition-all shadow-sm space-y-3 group"
              >
                <div className="flex items-center justify-between">
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-primary text-on-primary">
                    {c.type === "flash" ? "FlashCase" : "Full Case"}
                  </span>
                  <span className="text-[11px] font-mono text-accent font-bold">
                    L{c.complexity} • {c.language.toUpperCase()}
                  </span>
                </div>

                <h4 className="font-serif text-base font-bold text-text group-hover:text-accent transition-colors">
                  {c.title}
                </h4>

                <p className="text-xs text-muted line-clamp-2 leading-relaxed">
                  {c.content?.summary}
                </p>

                <div className="pt-2 flex items-center justify-between text-[11px] text-muted border-t border-border">
                  <span>{c.industry}</span>
                  <span className="capitalize">{c.status}</span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </AppShell>
  );
}
