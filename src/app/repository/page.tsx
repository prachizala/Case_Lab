"use client";

import { useEffect, useState, useMemo } from "react";
import Link from "next/link";
import { AppShell } from "@/components/AppShell";
import { getCachedUser } from "@/lib/auth-client";
import { StateEmpty } from "@/components/StateEmpty";
import { StateLoading } from "@/components/StateLoading";
import { StateError } from "@/components/StateError";
import { Profile } from "@/lib/types";
import { DOMAINS } from "@/config/domains";
import { COLLEGE_NAME_WITH_SHORT, COLLEGE_SHORT } from "@/config/college";
import {
  Search,
  BookOpen,
  Filter,
  Download,
  Calendar,
  Layers,
  Sparkles,
  FileText,
  Building,
  GraduationCap,
  Tag,
  ShieldCheck,
  CheckCircle2,
  X,
  ExternalLink,
  Lock,
  Unlock,
  AlertCircle,
  FileCheck,
} from "lucide-react";

interface RepositoryRecord {
  id: string;
  case_id: string;
  author_id: string;
  author_name?: string;
  department_id: string;
  department_name: string;
  course_id: string;
  course_name: string;
  category_id: string;
  category_name: string;
  keywords: string[];
  uploaded_at: string;
  year: number;
  page_target: number;
  is_published: boolean;
  similarity_score?: number;
  ai_assisted?: boolean;
  caseStudy: {
    id: string;
    title: string;
    domain: string;
    type: string;
    difficulty?: string;
    content?: {
      summary?: string;
      background?: string;
      challenge?: string;
      decision_point?: string;
      learning_objectives?: string[];
      key_data?: any[];
      teaching_note?: string;
    };
  };
}

interface LookupData {
  departments: Array<{ id: string; name: string }>;
  courses: Array<{ id: string; name: string }>;
  categories: Array<{ id: string; name: string }>;
  caseTypes: Array<{ id: string; name: string }>;
}

export default function RepositoryCatalogPage() {
  const [currentUser, setCurrentUser] = useState<Profile | null>(null);
  const [items, setItems] = useState<RepositoryRecord[]>([]);
  const [lookup, setLookup] = useState<LookupData>({
    departments: [],
    courses: [],
    categories: [],
    caseTypes: [],
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filters
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedDept, setSelectedDept] = useState("all");
  const [selectedDomain, setSelectedDomain] = useState("all");
  const [selectedCourse, setSelectedCourse] = useState("all");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedType, setSelectedType] = useState("all");
  const [selectedYear, setSelectedYear] = useState("all");
  const [onlyTeachingNotes, setOnlyTeachingNotes] = useState(false);

  // Modal inspection
  const [activeItem, setActiveItem] = useState<RepositoryRecord | null>(null);
  const [isDownloading, setIsDownloading] = useState(false);

  // Load User & Lookups
  useEffect(() => {
    async function init() {
      try {
        const u = await getCachedUser();
        if (u) setCurrentUser(u);

        const lookupRes = await fetch("/api/lookup");
        if (lookupRes.ok) {
          const lData = await lookupRes.json();
          if (lData.data) {
            setLookup({
              departments: lData.data.departments || [],
              courses: lData.data.courses || [],
              categories: lData.data.categories || [],
              caseTypes: lData.data.caseTypes || [],
            });
          }
        }
      } catch (err) {
        console.error("Initialization error:", err);
      }
    }
    init();
  }, []);

  // Fetch Repository Items
  const fetchRepository = async () => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams();
      if (searchQuery.trim()) params.set("q", searchQuery.trim());
      if (selectedDept !== "all") params.set("department_id", selectedDept);
      if (selectedDomain !== "all") params.set("domain", selectedDomain);
      if (selectedCourse !== "all") params.set("course_id", selectedCourse);
      if (selectedCategory !== "all") params.set("category_id", selectedCategory);
      if (selectedType !== "all") params.set("case_type", selectedType);
      if (selectedYear !== "all") params.set("year", selectedYear);
      if (onlyTeachingNotes) params.set("has_teaching_notes", "true");

      const res = await fetch(`/api/repository?${params.toString()}`);
      if (!res.ok) {
        throw new Error(`HTTP ${res.status}: Failed to load repository records.`);
      }
      const data = await res.json();
      setItems(data.items || []);
    } catch (err: unknown) {
      console.error("Repository fetch error:", err);
      setError(err instanceof Error ? err.message : "Failed to load repository.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRepository();
  }, [
    searchQuery,
    selectedDept,
    selectedDomain,
    selectedCourse,
    selectedCategory,
    selectedType,
    selectedYear,
    onlyTeachingNotes,
  ]);

  const canViewTeachingNotes =
    currentUser?.role === "faculty" || currentUser?.role === "admin";

  const handleDownload = (itemId: string, kind: "pdf" | "docx") => {
    if (currentUser?.role === "student") {
      alert("Download will be available after purchase (coming soon).");
      return;
    }
    setIsDownloading(true);
    const url = `/api/repository/download?itemId=${encodeURIComponent(itemId)}&kind=${kind}`;
    window.open(url, "_blank");
    setTimeout(() => setIsDownloading(false), 1500);
  };

  const getCaseTypeLabel = (typeKey: string) => {
    switch (typeKey) {
      case "ce_pack":
        return "Comprehensive Case Pack";
      case "full":
        return "Full Case Study";
      case "short":
        return "Short Case";
      case "flash":
        return "Flash Problem";
      default:
        return typeKey.toUpperCase();
    }
  };

  return (
    <AppShell>
      <div className="space-y-6 pb-20">
        {/* HEADER SECTION */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-border pb-6">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-bold uppercase tracking-wider text-accent bg-accent/10 px-2.5 py-0.5 rounded-full border border-accent/20">
                Institutional Archive
              </span>
              <span className="text-xs text-muted">
                {COLLEGE_NAME_WITH_SHORT}
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-serif font-bold text-text flex items-center gap-2.5">
              <BookOpen className="w-7 h-7 text-accent" />
              <span>Institutional Case Study Repository</span>
            </h1>
            <p className="text-sm text-muted max-w-2xl">
              Official repository of peer-reviewed, dean-approved pedagogical business case studies. Formatted for academic curriculum, case competitions, and classroom instruction.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/create"
              className="inline-flex items-center gap-2 px-3.5 py-2 rounded-lg bg-accent hover:bg-accent-hover text-accent-text text-xs font-semibold shadow-sm transition-all"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Author New Case</span>
            </Link>
            <Link
              href="/review-queue"
              className="inline-flex items-center gap-2 px-3.5 py-2 rounded-lg border border-border text-xs font-semibold text-text hover:border-accent hover:text-accent transition-colors"
            >
              <FileCheck className="w-3.5 h-3.5" />
              <span>Review Queue</span>
            </Link>
          </div>
        </div>

        {/* SEARCH & FACETED FILTERS */}
        <div className="p-4 rounded-2xl bg-surface border border-border shadow-xs space-y-4">
          <div className="flex flex-col sm:flex-row items-center gap-3">
            <div className="relative flex-1 w-full">
              <Search className="w-4 h-4 text-muted absolute left-3 top-3" />
              <input
                type="text"
                placeholder="Search repository by case title, author, keyword, or company..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-2 rounded-xl border border-border bg-background text-text text-xs focus:outline-none focus:ring-1 focus:ring-accent"
              />
            </div>
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery("")}
                className="px-3 py-2 text-xs font-semibold text-muted hover:text-text transition-colors"
              >
                Clear Search
              </button>
            )}
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-7 gap-2 text-xs">
            {/* Department */}
            <div>
              <label className="text-[10px] uppercase font-bold text-muted mb-1 block">
                Department
              </label>
              <select
                value={selectedDept}
                onChange={(e) => setSelectedDept(e.target.value)}
                className="w-full p-2 rounded-lg border border-border bg-background text-text text-xs focus:ring-1 focus:ring-accent"
              >
                <option value="all">All Departments</option>
                {lookup.departments.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Domain */}
            <div>
              <label className="text-[10px] uppercase font-bold text-muted mb-1 block">
                Domain
              </label>
              <select
                value={selectedDomain}
                onChange={(e) => setSelectedDomain(e.target.value)}
                className="w-full p-2 rounded-lg border border-border bg-background text-text text-xs focus:ring-1 focus:ring-accent"
              >
                <option value="all">All Domains</option>
                {DOMAINS.map((d) => (
                  <option key={d.id} value={d.name}>
                    {d.name}
                  </option>
                ))}
                <option value="unassigned">Unassigned</option>
              </select>
            </div>

            {/* Course */}
            <div>
              <label className="text-[10px] uppercase font-bold text-muted mb-1 block">
                Course
              </label>
              <select
                value={selectedCourse}
                onChange={(e) => setSelectedCourse(e.target.value)}
                className="w-full p-2 rounded-lg border border-border bg-background text-text text-xs focus:ring-1 focus:ring-accent"
              >
                <option value="all">All Courses</option>
                {lookup.courses.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Category */}
            <div>
              <label className="text-[10px] uppercase font-bold text-muted mb-1 block">
                Category
              </label>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full p-2 rounded-lg border border-border bg-background text-text text-xs focus:ring-1 focus:ring-accent"
              >
                <option value="all">All Categories</option>
                {lookup.categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Case Type */}
            <div>
              <label className="text-[10px] uppercase font-bold text-muted mb-1 block">
                Case Type
              </label>
              <select
                value={selectedType}
                onChange={(e) => setSelectedType(e.target.value)}
                className="w-full p-2 rounded-lg border border-border bg-background text-text text-xs focus:ring-1 focus:ring-accent"
              >
                <option value="all">All Case Types</option>
                <option value="ce_pack">Comprehensive Pack</option>
                <option value="full">Full Case (10p)</option>
                <option value="short">Short Case (5p)</option>
                <option value="flash">Flash Problem</option>
              </select>
            </div>

            {/* Academic Year */}
            <div>
              <label className="text-[10px] uppercase font-bold text-muted mb-1 block">
                Year
              </label>
              <select
                value={selectedYear}
                onChange={(e) => setSelectedYear(e.target.value)}
                className="w-full p-2 rounded-lg border border-border bg-background text-text text-xs focus:ring-1 focus:ring-accent"
              >
                <option value="all">All Years</option>
                <option value="2026">2026</option>
                <option value="2025">2025</option>
                <option value="2024">2024</option>
              </select>
            </div>

            {/* Faculty Teaching Notes Toggle */}
            <div className="flex flex-col justify-end">
              {canViewTeachingNotes ? (
                <label className="flex items-center gap-2 p-2 rounded-lg border border-border bg-background text-text text-[11px] font-semibold cursor-pointer select-none hover:border-accent">
                  <input
                    type="checkbox"
                    checked={onlyTeachingNotes}
                    onChange={(e) => setOnlyTeachingNotes(e.target.checked)}
                    className="rounded border-border text-accent focus:ring-accent"
                  />
                  <span>Teaching Notes Only</span>
                </label>
              ) : (
                <div className="p-2 rounded-lg border border-border/50 bg-background/50 text-[10px] text-muted flex items-center gap-1">
                  <Lock className="w-3 h-3 shrink-0" />
                  <span>Notes restricted</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* RESULTS GRID */}
        {loading ? (
          <StateLoading
            title="Indexing Institutional Repository..."
            subtitle="Searching catalog records and verified faculty case packs."
          />
        ) : error ? (
          <StateError title="Repository Query Failed" message={error} onRetry={fetchRepository} />
        ) : items.length === 0 ? (
          <StateEmpty
            icon={<BookOpen className="w-7 h-7" />}
            title="No Case Studies Found"
            message="No cases match your active search filters. Try broadening your criteria or search keywords."
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {items.map((item) => {
              const c = item.caseStudy;
              return (
                <div
                  key={item.id}
                  className="rounded-2xl border border-border bg-surface hover:border-accent/60 transition-all p-5 flex flex-col justify-between shadow-xs group"
                >
                  <div className="space-y-3">
                    {/* Badges */}
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-accent bg-accent/10 px-2 py-0.5 rounded-full border border-accent/20">
                        {getCaseTypeLabel(c.type)}
                      </span>
                      <span className="text-[11px] font-mono text-muted flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        <span>{item.year}</span>
                      </span>
                    </div>

                    {/* Title */}
                    <h3 className="font-serif font-bold text-base text-text group-hover:text-accent transition-colors line-clamp-2">
                      {c.title}
                    </h3>

                    {/* Academic Metadata */}
                    <div className="space-y-1 text-xs text-muted">
                      <div className="flex items-center gap-1.5">
                        <Building className="w-3.5 h-3.5 text-accent shrink-0" />
                        <span className="font-semibold text-text truncate">
                          {item.department_name}
                        </span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <GraduationCap className="w-3.5 h-3.5 text-muted shrink-0" />
                        <span className="truncate">{item.course_name}</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Tag className="w-3.5 h-3.5 text-muted shrink-0" />
                        <span className="truncate">{item.category_name}</span>
                      </div>
                    </div>

                    {/* Summary Excerpt */}
                    <p className="text-xs text-muted line-clamp-3 leading-relaxed">
                      {c.content?.summary || "No executive summary available."}
                    </p>

                    {/* Keywords Chips */}
                    {item.keywords && item.keywords.length > 0 && (
                      <div className="flex flex-wrap gap-1 pt-1">
                        {item.keywords.slice(0, 4).map((kw, idx) => (
                          <span
                            key={idx}
                            className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-background border border-border text-muted"
                          >
                            #{kw}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Footer & Actions */}
                  <div className="pt-4 mt-4 border-t border-border flex items-center justify-between gap-2">
                    <div className="text-[11px] font-mono text-muted">
                      ~{item.page_target} Pages
                    </div>

                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={() => setActiveItem(item)}
                        className="px-3 py-1.5 rounded-lg border border-border text-text text-xs font-semibold hover:border-accent hover:text-accent transition-colors"
                      >
                        Inspect
                      </button>
                      {currentUser?.role === "student" ? (
                        <span
                          className="px-2.5 py-1.5 rounded-lg border border-border text-muted text-[11px] font-medium bg-surface/50 cursor-not-allowed"
                          title="Download will be available after purchase (coming soon)"
                        >
                          Purchase to download
                        </span>
                      ) : (
                        <button
                          type="button"
                          onClick={() => handleDownload(item.id, "pdf")}
                          className="px-3 py-1.5 rounded-lg bg-accent text-accent-text text-xs font-semibold hover:bg-accent-hover transition-colors flex items-center gap-1.5"
                        >
                          <Download className="w-3.5 h-3.5" />
                          <span>PDF</span>
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* CASE DETAIL INSPECTION MODAL */}
        {activeItem && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in">
            <div className="w-full max-w-2xl max-h-[90vh] flex flex-col rounded-3xl bg-surface border border-border shadow-2xl overflow-hidden">
              {/* Modal Header */}
              <div className="p-6 border-b border-border flex items-start justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-accent bg-accent/10 px-2 py-0.5 rounded-full border border-accent/20">
                      {getCaseTypeLabel(activeItem.caseStudy.type)}
                    </span>
                    <span className="text-xs text-muted font-mono">
                      Target ~{activeItem.page_target} Pages • {activeItem.year}
                    </span>
                  </div>
                  <h2 className="font-serif font-bold text-xl text-text">
                    {activeItem.caseStudy.title}
                  </h2>
                  <p className="text-xs text-muted">
                    Authored by <span className="font-semibold text-text">{activeItem.author_name || "Faculty Author"}</span> • {activeItem.department_name} • {activeItem.course_name}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setActiveItem(null)}
                  className="p-1.5 rounded-xl text-muted hover:text-text hover:bg-background transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Modal Body */}
              <div className="p-6 overflow-y-auto space-y-5 text-xs">
                {/* Confidentiality Notice */}
                {currentUser?.role === "student" ? (
                  <div className="p-3.5 rounded-xl border border-accent/20 bg-accent/5 text-text flex items-start gap-2.5">
                    <Lock className="w-4 h-4 text-accent shrink-0 mt-0.5" />
                    <div>
                      <span className="font-bold block text-accent text-xs">
                        Student Copy Protection Active
                      </span>
                      <span className="text-[11px] text-muted">
                        In accordance with SBS academic regulations, pedagogical model answers, teaching notes, and grading rubrics are automatically withheld from student downloads.
                      </span>
                    </div>
                  </div>
                ) : (
                  <div className="p-3.5 rounded-xl border border-success/30 bg-success/10 text-text flex items-start gap-2.5">
                    <ShieldCheck className="w-4 h-4 text-success shrink-0 mt-0.5" />
                    <div>
                      <span className="font-bold block text-success text-xs">
                        Faculty & Admin Master Edition
                      </span>
                      <span className="text-[11px] text-muted">
                        You are authorized to view full instructional guidelines, discussion prompts, Bloom's pedagogical benchmarks, and complete model answer keys.
                      </span>
                    </div>
                  </div>
                )}

                {/* Executive Summary */}
                <div className="space-y-1.5">
                  <h4 className="font-serif font-bold text-sm text-text">
                    Executive Summary
                  </h4>
                  <p className="text-muted leading-relaxed">
                    {activeItem.caseStudy.content?.summary || "No summary recorded for this case."}
                  </p>
                </div>

                {/* Learning Objectives */}
                {activeItem.caseStudy.content?.learning_objectives && (
                  <div className="space-y-1.5">
                    <h4 className="font-serif font-bold text-sm text-text">
                      Pedagogical Learning Objectives
                    </h4>
                    <ul className="list-disc pl-5 space-y-1 text-muted">
                      {activeItem.caseStudy.content.learning_objectives.map((obj, i) => (
                        <li key={i}>{obj}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Central Dilemma / Challenge */}
                {activeItem.caseStudy.content?.challenge && (
                  <div className="space-y-1.5">
                    <h4 className="font-serif font-bold text-sm text-text">
                      Central Dilemma
                    </h4>
                    <p className="text-muted leading-relaxed">
                      {activeItem.caseStudy.content.challenge}
                    </p>
                  </div>
                )}

                {/* Exhibits Summary */}
                <div className="flex items-center gap-4 p-3 rounded-xl border border-border bg-background">
                  <div>
                    <span className="text-[10px] uppercase font-bold text-muted block">
                      Financial Exhibits
                    </span>
                    <span className="font-mono text-sm font-bold text-text">
                      {activeItem.caseStudy.content?.key_data?.length || 0} Tables
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] uppercase font-bold text-muted block">
                      Similarity Score
                    </span>
                    <span className="font-mono text-sm font-bold text-accent">
                      {activeItem.similarity_score ? `${activeItem.similarity_score}%` : "0.0%"}
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] uppercase font-bold text-muted block">
                      Format Compliance
                    </span>
                    <span className="text-xs font-semibold text-text">
                      SBS Standard Template v2.4
                    </span>
                  </div>
                </div>
              </div>

              {/* Modal Footer with Download buttons */}
              <div className="p-6 border-t border-border bg-background flex flex-col sm:flex-row items-center justify-between gap-3">
                <Link
                  href={`/cases/${activeItem.case_id}`}
                  className="text-xs font-semibold text-muted hover:text-text flex items-center gap-1.5"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  <span>Open Full Interactive Case</span>
                </Link>

                {currentUser?.role === "student" ? (
                  <div className="text-xs text-muted font-medium py-1.5 px-3 rounded-lg border border-border bg-surface/50 text-center">
                    Download will be available after purchase (coming soon)
                  </div>
                ) : (
                  <div className="flex items-center gap-2 w-full sm:w-auto">
                    <button
                      type="button"
                      disabled={isDownloading}
                      onClick={() => handleDownload(activeItem.id, "docx")}
                      className="flex-1 sm:flex-initial px-4 py-2.5 rounded-xl border border-border text-xs font-bold text-text hover:border-accent hover:text-accent transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
                    >
                      <Download className="w-4 h-4" />
                      <span>Download DOCX</span>
                    </button>
                    <button
                      type="button"
                      disabled={isDownloading}
                      onClick={() => handleDownload(activeItem.id, "pdf")}
                      className="flex-1 sm:flex-initial px-4 py-2.5 rounded-xl bg-accent text-accent-text text-xs font-bold hover:bg-accent-hover transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
                    >
                      <Download className="w-4 h-4" />
                      <span>Download PDF</span>
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </AppShell>
  );
}
