"use client";

import { useEffect, useState, useMemo } from "react";
import Link from "next/link";
import { AppShell } from "@/components/AppShell";
import { getCachedUser } from "@/lib/auth-client";
import { StateEmpty } from "@/components/StateEmpty";
import { StateLoading } from "@/components/StateLoading";
import { StateError } from "@/components/StateError";
import { CaseStudy } from "@/lib/types";
import { COLLEGE_NAME_WITH_SHORT, COLLEGE_SHORT } from "@/config/college";
import { getIndustryTintClass } from "@/config/theme";
import {
  TrendingUp,
  Search,
  Sparkles,
  CheckCircle2,
  Clock,
  Building,
  GraduationCap,
  Layers,
  ChevronRight,
  ShieldCheck,
  Zap,
  ArrowUpDown,
  Filter,
  Check,
  RefreshCw,
} from "lucide-react";

interface DifficultyBracket {
  id: string;
  label: string;
  min: number;
  max: number;
}

const DIFFICULTY_BRACKETS: DifficultyBracket[] = [
  { id: "beginner", label: "Foundational (Level 1–3)", min: 1, max: 3 },
  { id: "intermediate", label: "Intermediate (Level 4–6)", min: 4, max: 6 },
  { id: "advanced", label: "Advanced (Level 7–8)", min: 7, max: 8 },
  { id: "executive", label: "Executive / C-Suite (Level 9–10)", min: 9, max: 10 },
];

export default function TrendingCasesPage() {
  const [cases, setCases] = useState<CaseStudy[]>([]);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filter & Search state
  const [search, setSearch] = useState("");
  const [selectedIndustries, setSelectedIndustries] = useState<string[]>([]);
  const [selectedDifficulties, setSelectedDifficulties] = useState<string[]>([]);
  const [sortBy, setSortBy] = useState<"recent" | "complexity-desc" | "complexity-asc" | "alpha">("recent");

  // Load all approved cases
  const loadApprovedCases = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/cases?status=approved");
      if (!res.ok) {
        throw new Error(`Failed to load approved cases (HTTP ${res.status}).`);
      }
      const data = await res.json();
      if (data.cases) {
        // Enforce that only approved cases are present
        const approvedOnly = (data.cases as CaseStudy[]).filter((c) => c.status === "approved");
        setCases(approvedOnly);
      }
    } catch (err: unknown) {
      console.error("Trending cases load error:", err);
      setError(err instanceof Error ? err.message : "Failed to load trending cases.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadApprovedCases();
    getCachedUser()
      .then((user) => {
        if (user) setCurrentUser(user);
      })
      .catch(() => null);
  }, []);

  // Compute industry counts matching actual data
  const industryStats = useMemo(() => {
    const counts: Record<string, number> = {};
    cases.forEach((c) => {
      const ind = c.industry || "General Management";
      counts[ind] = (counts[ind] || 0) + 1;
    });

    return Object.entries(counts)
      .map(([industry, count]) => ({ industry, count }))
      .sort((a, b) => b.count - a.count || a.industry.localeCompare(b.industry));
  }, [cases]);

  // Compute difficulty bracket counts matching actual data
  const difficultyStats = useMemo(() => {
    return DIFFICULTY_BRACKETS.map((bracket) => {
      const count = cases.filter(
        (c) => c.complexity >= bracket.min && c.complexity <= bracket.max
      ).length;
      return { ...bracket, count };
    });
  }, [cases]);

  // Toggle industry selection
  const toggleIndustry = (industry: string) => {
    setSelectedIndustries((prev) =>
      prev.includes(industry) ? prev.filter((i) => i !== industry) : [...prev, industry]
    );
  };

  // Toggle difficulty selection
  const toggleDifficulty = (bracketId: string) => {
    setSelectedDifficulties((prev) =>
      prev.includes(bracketId) ? prev.filter((d) => d !== bracketId) : [...prev, bracketId]
    );
  };

  // Reset all filters
  const resetFilters = () => {
    setSearch("");
    setSelectedIndustries([]);
    setSelectedDifficulties([]);
    setSortBy("recent");
  };

  // Filter & Sort logic
  const filteredAndSortedCases = useMemo(() => {
    return cases
      .filter((c) => {
        // Industry filter
        if (selectedIndustries.length > 0 && !selectedIndustries.includes(c.industry)) {
          return false;
        }

        // Difficulty filter
        if (selectedDifficulties.length > 0) {
          const matchesAnyDifficulty = selectedDifficulties.some((diffId) => {
            const bracket = DIFFICULTY_BRACKETS.find((b) => b.id === diffId);
            if (!bracket) return false;
            return c.complexity >= bracket.min && c.complexity <= bracket.max;
          });
          if (!matchesAnyDifficulty) return false;
        }

        // Search query
        if (search.trim()) {
          const query = search.toLowerCase();
          const matchTitle = c.title.toLowerCase().includes(query);
          const matchInd = c.industry.toLowerCase().includes(query);
          const matchFunc = c.function.toLowerCase().includes(query);
          const matchSummary = c.content?.summary?.toLowerCase().includes(query);
          return matchTitle || matchInd || matchFunc || matchSummary;
        }

        return true;
      })
      .sort((a, b) => {
        if (sortBy === "recent") {
          return new Date(b.created_at || "").getTime() - new Date(a.created_at || "").getTime();
        }
        if (sortBy === "complexity-desc") {
          return b.complexity - a.complexity;
        }
        if (sortBy === "complexity-asc") {
          return a.complexity - b.complexity;
        }
        if (sortBy === "alpha") {
          return a.title.localeCompare(b.title);
        }
        return 0;
      });
  }, [cases, selectedIndustries, selectedDifficulties, search, sortBy]);

  const hasActiveFilters =
    search.trim() !== "" ||
    selectedIndustries.length > 0 ||
    selectedDifficulties.length > 0 ||
    sortBy !== "recent";

  return (
    <AppShell>
      <div className="space-y-6">
        {/* TOP INSTITUTIONAL HEADER */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-5">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold text-accent uppercase tracking-wider mb-1">
              <TrendingUp className="w-3.5 h-3.5" />
              <span>Campus Benchmark Curriculum</span>
              <span>•</span>
              <span>Peer-Approved & Free for All Students</span>
            </div>
            <h1 className="font-serif text-3xl font-bold text-text tracking-tight">
              Trending Cases & Approved Repository
            </h1>
            <p className="text-sm text-muted mt-1">
              Browse top-tier, faculty-reviewed {COLLEGE_NAME_WITH_SHORT} business cases. Free institutional cohort access with zero student royalties.
            </p>
          </div>

          <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-success/15 border border-success/30 text-success text-xs font-semibold">
            <ShieldCheck className="w-4 h-4 text-success" />
            <span>100% Free Institutional Licensing</span>
          </div>
        </div>


        {/* SEARCH & SORT HEADER BAR */}
        <div className="p-4 rounded-2xl border border-border bg-surface shadow-sm flex flex-col md:flex-row gap-3 items-center justify-between">
          <div className="relative flex-1 w-full">
            <Search className="w-4 h-4 absolute left-3.5 top-3 text-muted" />
            <input
              type="text"
              placeholder="Search approved cases by title, protagonist, macro signals, or industry..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 text-xs rounded-xl border border-border bg-surface text-text focus:outline-none focus:border-accent"
            />
          </div>

          {/* Sort Dropdown */}
          <div className="flex items-center gap-2 shrink-0 w-full md:w-auto">
            <ArrowUpDown className="w-4 h-4 text-muted shrink-0" />
            <span className="text-xs font-semibold text-muted shrink-0">
              Sort by:
            </span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="w-full md:w-auto px-3 py-2 text-xs font-semibold rounded-xl border border-border bg-surface text-text focus:outline-none focus:border-accent"
            >
              <option value="recent">Most Recent</option>
              <option value="complexity-desc">Highest Complexity (10 → 1)</option>
              <option value="complexity-asc">Lowest Complexity (1 → 10)</option>
              <option value="alpha">Alphabetical (A - Z)</option>
            </select>
          </div>
        </div>

        {/* TWO-COLUMN LAYOUT: LEFT SIDEBAR FILTERS WITH COUNTS, RIGHT RESULTS */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 items-start">
          {/* LEFT SIDEBAR: FILTERS WITH LIVE COUNTS */}
          <div className="lg:col-span-1 space-y-4">
            {/* Filter Card */}
            <div className="p-4 rounded-2xl border border-border bg-surface shadow-sm space-y-5">
              <div className="flex items-center justify-between pb-3 border-b border-border">
                <div className="flex items-center gap-2">
                  <Filter className="w-4 h-4 text-accent" />
                  <h3 className="font-serif font-bold text-sm text-text">
                    Curriculum Filters
                  </h3>
                </div>
                {hasActiveFilters && (
                  <button
                    type="button"
                    onClick={resetFilters}
                    className="text-[11px] font-semibold text-accent hover:underline flex items-center gap-1"
                  >
                    <RefreshCw className="w-3 h-3" />
                    <span>Clear</span>
                  </button>
                )}
              </div>

              {/* 1. Industry Checkboxes with Real Counts */}
              <div className="space-y-2.5">
                <h4 className="text-[11px] font-bold uppercase tracking-wider text-muted">
                  Industry Sector
                </h4>
                <div className="space-y-1.5 max-h-56 overflow-y-auto pr-1">
                  {industryStats.length === 0 ? (
                    <p className="text-xs text-muted italic">No approved cases yet.</p>
                  ) : (
                    industryStats.map(({ industry, count }) => {
                      const isChecked = selectedIndustries.includes(industry);
                      return (
                        <label
                          key={industry}
                          onClick={() => toggleIndustry(industry)}
                          className={`flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs cursor-pointer transition-colors ${
                            isChecked
                              ? "bg-primary-soft font-semibold text-text"
                              : "text-text hover:bg-primary-soft/50"
                          }`}
                        >
                          <div className="flex items-center gap-2 min-w-0 pr-2">
                            <div
                              className={`w-3.5 h-3.5 rounded flex items-center justify-center border transition-all ${
                                isChecked
                                  ? "bg-accent border-accent text-accent-text"
                                  : "border-border bg-surface"
                              }`}
                            >
                              {isChecked && <Check className="w-2.5 h-2.5 stroke-[3]" />}
                            </div>
                            <span className="truncate">{industry}</span>
                          </div>
                          <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-primary-soft text-muted font-bold shrink-0">
                            {count}
                          </span>
                        </label>
                      );
                    })
                  )}
                </div>
              </div>

              {/* 2. Difficulty Checkboxes with Counts */}
              <div className="space-y-2.5 pt-3 border-t border-border">
                <h4 className="text-[11px] font-bold uppercase tracking-wider text-muted">
                  Analytical Difficulty
                </h4>
                <div className="space-y-1.5">
                  {difficultyStats.map((bracket) => {
                    const isChecked = selectedDifficulties.includes(bracket.id);
                    return (
                      <label
                        key={bracket.id}
                        onClick={() => toggleDifficulty(bracket.id)}
                        className={`flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs cursor-pointer transition-colors ${
                          isChecked
                            ? "bg-primary-soft font-semibold text-text"
                            : "text-text hover:bg-primary-soft/50"
                        }`}
                      >
                        <div className="flex items-center gap-2 min-w-0 pr-2">
                          <div
                            className={`w-3.5 h-3.5 rounded flex items-center justify-center border transition-all ${
                              isChecked
                                ? "bg-accent border-accent text-accent-text"
                                : "border-border bg-surface"
                            }`}
                          >
                            {isChecked && <Check className="w-2.5 h-2.5 stroke-[3]" />}
                          </div>
                          <span className="truncate">{bracket.label}</span>
                        </div>
                        <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-primary-soft text-muted font-bold shrink-0">
                          {bracket.count}
                        </span>
                      </label>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Zero Royalty Banner */}
            <div className="p-4 rounded-2xl border border-border bg-primary-soft/40 space-y-2">
              <div className="flex items-center gap-2 text-accent text-xs font-bold uppercase tracking-wider">
                <Sparkles className="w-4 h-4" />
                <span>Zero Royalty Guarantee</span>
              </div>
              <p className="text-xs text-muted leading-relaxed">
                All approved cases are open to {COLLEGE_SHORT} faculty, students, and alumni for classroom and study-group use at zero incremental cost.
              </p>
            </div>
          </div>

          {/* RIGHT COLUMN: CASE CARDS */}
          <div className="lg:col-span-3 space-y-4">
            {/* Results Counter Bar */}
            <div className="flex items-center justify-between text-xs text-muted px-1">
              <span>
                Displaying <strong>{filteredAndSortedCases.length}</strong> approved case
                {filteredAndSortedCases.length === 1 ? "" : "s"} across {COLLEGE_SHORT}
              </span>
              {hasActiveFilters && (
                <button
                  type="button"
                  onClick={resetFilters}
                  className="text-accent hover:underline font-semibold"
                >
                  Reset Filters
                </button>
              )}
            </div>

            {loading ? (
              <div className="p-8 rounded-2xl border border-border bg-surface shadow-sm">
                <StateLoading
                  title="Loading Approved Benchmark Cases..."
                  subtitle="Filtering accredited curriculum cases and live signal exhibits."
                />
              </div>
            ) : error ? (
              <div className="p-8 rounded-2xl border border-border bg-surface shadow-sm">
                <StateError
                  title="Error Querying Trending Cases"
                  message={error}
                  onRetry={loadApprovedCases}
                />
              </div>
            ) : filteredAndSortedCases.length === 0 ? (
              <div className="p-8 rounded-2xl border border-border bg-surface shadow-sm">
                <StateEmpty
                  title="No Approved Cases Match Filters"
                  description="Try selecting different industry sectors, clearing difficulty thresholds, or resetting your search query."
                  actionText="Clear All Filters"
                  onAction={resetFilters}
                />
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {filteredAndSortedCases.map((c) => {
                  const isRealSignal = c.format === "real_signal";
                  return (
                    <div
                      key={c.id}
                      className="rounded-2xl border border-border bg-surface shadow-sm hover:shadow-md transition-all flex flex-col justify-between group relative overflow-hidden"
                    >
                      {/* Industry Soft Tint Header Strip */}
                      <div className={`px-5 py-2.5 border-b flex items-center justify-between ${getIndustryTintClass(c.industry)}`}>
                        <span className="text-[11px] font-bold uppercase tracking-wider flex items-center gap-1.5">
                          <Building className="w-3.5 h-3.5" />
                          <span>{c.industry}</span>
                        </span>
                        <span className="text-[10px] font-semibold opacity-80">
                          Level {c.complexity}/10
                        </span>
                      </div>

                      <div className="p-5 space-y-3 flex-1 flex flex-col justify-between">
                        <div className="space-y-3">
                          {/* Header Badges */}
                          <div className="flex flex-wrap items-center justify-between gap-2">
                            <div className="flex flex-wrap items-center gap-1.5">
                              <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-primary text-on-primary">
                                {c.type === "flash" ? "⚡ FlashCase" : "Full Case"}
                              </span>

                              {/* Real Signal Badge */}
                              {isRealSignal && (
                                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-warning/15 text-warning border border-warning/30">
                                  <Zap className="w-3 h-3 fill-warning text-warning" />
                                  <span>Real Signal</span>
                                </span>
                              )}

                              <span className="px-1.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-primary-soft text-text">
                                {c.language.toUpperCase()}
                              </span>
                            </div>

                            {/* Free Badge */}
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-success/15 text-success flex items-center gap-1">
                              <CheckCircle2 className="w-3 h-3" />
                              <span>Free Access</span>
                            </span>
                          </div>

                          {/* Title */}
                          <Link href={`/cases/${c.id}`} className="block">
                            <h3 className="font-serif font-bold text-base text-text group-hover:text-accent transition-colors line-clamp-2">
                              {c.title}
                            </h3>
                          </Link>

                          {/* Executive Summary Snippet */}
                          <p className="text-xs text-muted line-clamp-2 leading-relaxed">
                            {c.content?.summary || "Pedagogical business case study."}
                          </p>

                          {/* Metadata row */}
                          <div className="flex flex-wrap items-center gap-3 pt-1 text-[11px] text-muted">
                            <span className="flex items-center gap-1">
                              <Building className="w-3 h-3 text-muted" />
                              <span className="truncate max-w-[140px]">{c.industry}</span>
                            </span>
                            <span>•</span>
                            <span className="flex items-center gap-1">
                              <GraduationCap className="w-3 h-3 text-muted" />
                              <span>Level {c.complexity}/10</span>
                            </span>
                            {c.version && (
                              <>
                                <span>•</span>
                                <span>v{c.version}</span>
                              </>
                            )}
                          </div>
                        </div>

                        {/* Footer Actions */}
                        <div className="pt-4 mt-3 border-t border-border flex items-center justify-between gap-2">
                          <span className="text-[11px] font-semibold text-muted">
                            {c.author_name || "Faculty Review Board"}
                          </span>

                          <Link
                            href={`/cases/${c.id}`}
                            className="inline-flex items-center gap-1 px-3.5 py-1.5 rounded-xl bg-accent hover:bg-accent-hover text-accent-text text-xs font-semibold shadow-sm transition-all"
                          >
                            <span>Open Dossier</span>
                            <ChevronRight className="w-3.5 h-3.5" />
                          </Link>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </AppShell>
  );
}
