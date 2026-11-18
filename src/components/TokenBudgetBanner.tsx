"use client";

import React, { useEffect, useState } from "react";
import {
  ChevronDown,
  ChevronUp,
  X,
  ArrowRight,
  RefreshCw,
  Sliders,
  Cpu,
  Layers,
  Users,
} from "lucide-react";
import { TokenBudgetSummary, TokenBudgetBreakdown } from "@/lib/groq/types";

export interface TokenBudgetBannerProps {
  className?: string;
  refreshTrigger?: number; // Increment to force immediate refetch after AI operations
}

export function TokenBudgetBanner({ className = "", refreshTrigger }: TokenBudgetBannerProps) {
  const [summary, setSummary] = useState<TokenBudgetSummary | null>(null);
  const [breakdown, setBreakdown] = useState<TokenBudgetBreakdown | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isDismissed, setIsDismissed] = useState(false);
  const [isBreakdownOpen, setIsBreakdownOpen] = useState(false);
  const [loadingBreakdown, setLoadingBreakdown] = useState(false);

  const upgradeUrl = process.env.NEXT_PUBLIC_QUOTA_UPGRADE_URL || "/pricing";

  // Check sessionStorage for dismissed state on mount
  useEffect(() => {
    try {
      const dismissed = sessionStorage.getItem("sbs_token_budget_dismissed");
      if (dismissed === "true") {
        setIsDismissed(true);
      }
    } catch {
      // Ignore storage access errors
    }
  }, []);

  const fetchSummary = async () => {
    try {
      const res = await fetch("/api/usage/summary");
      if (!res.ok) {
        throw new Error(`Failed to load budget telemetry (${res.status})`);
      }
      const data: TokenBudgetSummary = await res.json();
      setSummary(data);
      setError(null);

      // Critical state (>= 95%) forces re-showing even if previously dismissed
      if (data.percent >= data.critical_threshold) {
        setIsDismissed(false);
        try {
          sessionStorage.removeItem("sbs_token_budget_dismissed");
        } catch {}
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Budget telemetry unavailable";
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  const fetchBreakdown = async () => {
    if (breakdown) return;
    setLoadingBreakdown(true);
    try {
      const res = await fetch("/api/usage/breakdown");
      if (res.ok) {
        const data: TokenBudgetBreakdown = await res.json();
        setBreakdown(data);
      }
    } catch (err) {
      console.error("Failed to load breakdown:", err);
    } finally {
      setLoadingBreakdown(false);
    }
  };

  const handleToggleBreakdown = () => {
    const nextState = !isBreakdownOpen;
    setIsBreakdownOpen(nextState);
    if (nextState) {
      fetchBreakdown();
    }
  };

  const handleDismiss = () => {
    setIsDismissed(true);
    try {
      sessionStorage.setItem("sbs_token_budget_dismissed", "true");
    } catch {}
  };

  // Initial fetch and 60-second polling
  useEffect(() => {
    fetchSummary();
    const interval = setInterval(fetchSummary, 60000);
    return () => clearInterval(interval);
  }, [refreshTrigger]);

  // Loading skeleton state
  if (loading && !summary) {
    return (
      <div
        className={`w-full p-4 rounded-2xl border border-border bg-[#FBF8F3] dark:bg-surface animate-pulse flex items-center justify-between ${className}`}
        role="status"
        aria-live="polite"
      >
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-full bg-muted/20" />
          <div className="space-y-1.5">
            <div className="w-48 h-3.5 bg-muted/20 rounded" />
            <div className="w-64 h-2.5 bg-muted/20 rounded font-mono" />
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (error || !summary) {
    return null; // Silently hide or return error badge if preferred
  }

  // Under 80% threshold: hidden per banner spec
  if (summary.status === "normal" && summary.percent < summary.warn_threshold) {
    return null;
  }

  // If dismissed and not critical, do not render
  if (isDismissed && summary.percent < summary.critical_threshold) {
    return null;
  }

  // Theme styling based on percentage
  const isExhausted = summary.status === "exhausted" || summary.percent >= 100;
  const isCritical = summary.status === "critical" || summary.percent >= summary.critical_threshold;

  const cardBorderClass = isExhausted
    ? "border-red-600/70"
    : isCritical
    ? "border-red-500/50"
    : "border-[#E59866]/50";

  // Soft beige background per specification
  const cardBgClass = isExhausted
    ? "bg-[#FEF2F2] dark:bg-red-950/20"
    : isCritical
    ? "bg-[#FFF5F5] dark:bg-red-950/15"
    : "bg-[#FDF9F3] dark:bg-[#25201B]";

  const ringStrokeClass = isExhausted
    ? "stroke-red-600"
    : isCritical
    ? "stroke-red-500"
    : "stroke-[#E67E22]";

  const badgeBgClass = isExhausted
    ? "bg-red-600 text-white"
    : isCritical
    ? "bg-red-500 text-white"
    : "bg-[#E67E22] text-white";

  const titleText = isExhausted
    ? "Institutional Token Budget Exhausted"
    : isCritical
    ? "Critical Token Allocation Alert"
    : "Institutional Token Budget Warning";

  const badgeText = isExhausted ? "EXHAUSTED" : `${summary.percent}% USED`;

  // Circular progress calculations
  const radius = 15;
  const circumference = 2 * Math.PI * radius; // ~94.25
  const strokeOffset = circumference - (circumference * Math.min(100, summary.percent)) / 100;

  return (
    <div
      className={`w-full p-4 rounded-2xl border transition-all shadow-sm space-y-3 ${cardBorderClass} ${cardBgClass} ${className}`}
      role="region"
      aria-label="Institutional Token Budget Notification"
    >
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        {/* Left Side: Circular Progress Ring + Title + Monospace Subtext */}
        <div className="flex items-center gap-3.5 min-w-0">
          <div
            className="relative w-11 h-11 shrink-0 flex items-center justify-center"
            aria-hidden="true"
          >
            <svg className="w-11 h-11 -rotate-90" viewBox="0 0 36 36">
              <circle
                cx="18"
                cy="18"
                r={radius}
                fill="none"
                className="stroke-muted/20"
                strokeWidth="3"
              />
              <circle
                cx="18"
                cy="18"
                r={radius}
                fill="none"
                strokeWidth="3.2"
                strokeDasharray={circumference}
                strokeDashoffset={strokeOffset}
                strokeLinecap="round"
                className={`transition-all duration-500 ${ringStrokeClass}`}
              />
            </svg>
            <span className="absolute text-[10px] font-mono font-bold text-text">
              {summary.percent}%
            </span>
          </div>

          <div className="space-y-0.5 min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <h3 className="font-serif font-bold text-xs sm:text-sm text-text">
                {titleText}
              </h3>
              <span
                className={`px-2 py-0.5 rounded-full font-mono text-[9px] font-bold uppercase tracking-wider ${badgeBgClass}`}
              >
                {badgeText}
              </span>
            </div>
            <p className="text-[11px] text-muted font-mono truncate">
              Used {summary.used.toLocaleString()} / {summary.limit.toLocaleString()} tokens •{" "}
              <strong className="text-text font-bold">
                {summary.remaining.toLocaleString()} remaining
              </strong>
            </p>
          </div>
        </div>

        {/* Right Side: Breakdown Button + Quota Upgrade Button + Close Icon */}
        <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
          {/* Breakdown Toggle */}
          <button
            type="button"
            onClick={handleToggleBreakdown}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-border bg-surface text-text text-xs font-semibold hover:border-accent hover:text-accent transition-all"
            aria-expanded={isBreakdownOpen}
            aria-label="Toggle token usage breakdown"
          >
            <Sliders className="w-3.5 h-3.5 text-muted" />
            <span>Breakdown</span>
            {isBreakdownOpen ? (
              <ChevronUp className="w-3.5 h-3.5 text-muted" />
            ) : (
              <ChevronDown className="w-3.5 h-3.5 text-muted" />
            )}
          </button>

          {/* Quota Upgrade Button (Red) */}
          <a
            href={upgradeUrl}
            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-red-600 hover:bg-red-700 text-white font-serif font-bold text-xs shadow-sm transition-all focus:ring-2 focus:ring-red-400 focus:outline-none"
            aria-label="Upgrade token quota"
          >
            <span>Quota Upgrade</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </a>

          {/* Close Icon */}
          <button
            type="button"
            onClick={handleDismiss}
            className="p-1.5 rounded-lg text-muted hover:text-text hover:bg-muted/15 transition-colors focus:ring-2 focus:ring-accent focus:outline-none"
            title="Dismiss warning for current session"
            aria-label="Dismiss warning for current session"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Breakdown Dropdown Drawer */}
      {isBreakdownOpen && (
        <div
          className="pt-3 border-t border-border/70 space-y-3 animate-in fade-in duration-200"
          id="token-breakdown-panel"
        >
          {loadingBreakdown && !breakdown ? (
            <div className="flex items-center justify-center py-4 text-xs text-muted">
              <RefreshCw className="w-3.5 h-3.5 animate-spin mr-2" />
              <span>Loading usage breakdown...</span>
            </div>
          ) : breakdown ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
              {/* Models Breakdown */}
              <div className="p-3 rounded-xl bg-surface/70 border border-border/80 space-y-2">
                <div className="flex items-center gap-1.5 font-bold text-text">
                  <Cpu className="w-3.5 h-3.5 text-accent" />
                  <span>Consumption by Model</span>
                </div>
                <div className="space-y-1.5">
                  {breakdown.by_model.map((m, idx) => (
                    <div key={idx} className="flex items-center justify-between text-[11px]">
                      <span className="font-mono text-muted truncate max-w-[160px]">
                        {m.model}
                      </span>
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-text">
                          {m.tokens.toLocaleString()}
                        </span>
                        <span className="px-1.5 py-0.2 rounded text-[9px] font-mono font-semibold bg-muted/15 text-muted">
                          {m.percentage}%
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Features Breakdown */}
              <div className="p-3 rounded-xl bg-surface/70 border border-border/80 space-y-2">
                <div className="flex items-center gap-1.5 font-bold text-text">
                  <Layers className="w-3.5 h-3.5 text-accent" />
                  <span>Consumption by Feature</span>
                </div>
                <div className="space-y-1.5">
                  {breakdown.by_feature.map((f, idx) => (
                    <div key={idx} className="flex items-center justify-between text-[11px]">
                      <span className="capitalize text-muted">{f.feature.replace(/_/g, " ")}</span>
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-text">
                          {f.tokens.toLocaleString()}
                        </span>
                        <span className="px-1.5 py-0.2 rounded text-[9px] font-mono font-semibold bg-muted/15 text-muted">
                          {f.percentage}%
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Optional User Breakdown if present (Admin) */}
              {breakdown.by_user && breakdown.by_user.length > 0 && (
                <div className="col-span-1 md:col-span-2 p-3 rounded-xl bg-surface/70 border border-border/80 space-y-2">
                  <div className="flex items-center gap-1.5 font-bold text-text">
                    <Users className="w-3.5 h-3.5 text-accent" />
                    <span>Top User Consumption (Administrative Audit)</span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px]">
                    {breakdown.by_user.map((u, idx) => (
                      <div
                        key={idx}
                        className="flex items-center justify-between p-1.5 rounded bg-surface border border-border/50"
                      >
                        <span className="font-mono text-muted truncate max-w-[180px]">
                          {u.user_email}
                        </span>
                        <span className="font-mono font-bold text-text">
                          {u.tokens.toLocaleString()} tokens
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ) : null}
        </div>
      )}
    </div>
  );
}
