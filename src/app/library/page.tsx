"use client";

import { useEffect, useState, useMemo } from "react";
import Link from "next/link";
import { AppShell } from "@/components/AppShell";
import { getCachedUser } from "@/lib/auth-client";
import { StateEmpty } from "@/components/StateEmpty";
import { StateLoading } from "@/components/StateLoading";
import { StateError } from "@/components/StateError";
import { CaseStudy, CaseCollection, Profile } from "@/lib/types";
import { COLLEGE_NAME_WITH_SHORT, COLLEGE_SHORT } from "@/config/college";
import { getIndustryTintClass } from "@/config/theme";
import {
  Search,
  LayoutGrid,
  List,
  Sparkles,
  BookOpen,
  Filter,
  PlusCircle,
  Clock,
  Layers,
  CheckCircle2,
  AlertTriangle,
  Folder,
  FolderPlus,
  Edit2,
  Trash2,
  Check,
  X,
  FileText,
  ChevronRight,
  MoreVertical,
  Download,
  Share2,
  Tag,
  Building,
  GraduationCap,
  BookmarkPlus,
  RefreshCw,
  ArrowRight,
} from "lucide-react";

export default function LibraryPage() {
  const [cases, setCases] = useState<CaseStudy[]>([]);
  const [collections, setCollections] = useState<CaseCollection[]>([]);
  const [currentUser, setCurrentUser] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // View & Filter states
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [scope, setScope] = useState<"all" | "my-cases">("all");
  const [selectedCollectionId, setSelectedCollectionId] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [domainFilter, setDomainFilter] = useState<string>("all");
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [languageFilter, setLanguageFilter] = useState<string>("all");
  const [difficultyFilter, setDifficultyFilter] = useState<string>("all");
  const [authorFilter, setAuthorFilter] = useState<string>("all");
  const [activeTag, setActiveTag] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>("all");

  // Collection modal / inline states
  const [isCreatingCollection, setIsCreatingCollection] = useState(false);
  const [newCollectionName, setNewCollectionName] = useState("");
  const [newCollectionDesc, setNewCollectionDesc] = useState("");
  const [editingCollectionId, setEditingCollectionId] = useState<string | null>(null);
  const [editingCollectionName, setEditingCollectionName] = useState("");

  // Popover for adding a case to collection
  const [activeCollectionPopoverCaseId, setActiveCollectionPopoverCaseId] = useState<string | null>(null);

  // Load user
  const loadUser = async () => {
    try {
      const user = await getCachedUser();
      if (user) {
        setCurrentUser(user);
      }
    } catch (err) {
      console.error("Failed to load user:", err);
    }
  };

  // Load collections
  const loadCollections = async () => {
    try {
      const res = await fetch("/api/collections");
      const data = await res.json();
      if (data.collections) {
        setCollections(data.collections);
      }
    } catch (err) {
      console.error("Failed to load collections:", err);
    }
  };

  // Load cases
  const loadCases = async () => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams();
      if (scope === "my-cases") params.set("scope", "my-cases");
      if (domainFilter !== "all") params.set("domain", domainFilter);
      if (typeFilter !== "all") params.set("type", typeFilter);
      if (languageFilter !== "all") params.set("language", languageFilter);
      if (difficultyFilter !== "all") params.set("difficulty", difficultyFilter);
      if (authorFilter !== "all") params.set("author", authorFilter);
      if (activeTag) params.set("tag", activeTag);
      if (statusFilter !== "all") params.set("status", statusFilter);
      if (selectedCollectionId) params.set("collectionId", selectedCollectionId);
      if (search.trim()) params.set("q", search.trim());

      const res = await fetch(`/api/cases?${params.toString()}`);
      if (!res.ok) {
        throw new Error(`Failed to load cases (HTTP ${res.status})`);
      }
      const data = await res.json();
      if (data.cases) {
        setCases(data.cases);
      }
    } catch (err: unknown) {
      console.error("Error loading cases:", err);
      setError(err instanceof Error ? err.message : "Failed to load case studies.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUser();
    loadCollections();
  }, []);

  useEffect(() => {
    loadCases();
  }, [
    scope,
    domainFilter,
    typeFilter,
    languageFilter,
    difficultyFilter,
    authorFilter,
    activeTag,
    statusFilter,
    selectedCollectionId,
    search,
  ]);

  // Industry options with dynamic counts from entire database
  const industryList = useMemo(() => {
    const defaultIndustries = [
      "Fintech & Banking",
      "Renewable Energy & CleanTech",
      "Supply Chain & Logistics",
      "Healthcare & Pharma",
      "Manufacturing & Heavy Industry",
      "AgriTech & Food Systems",
      "Retail & E-Commerce",
      "Software & AI Services",
    ];
    return defaultIndustries;
  }, []);

  // Collection Handlers
  const handleCreateCollection = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCollectionName.trim()) return;

    try {
      const res = await fetch("/api/collections", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "create",
          name: newCollectionName.trim(),
          description: newCollectionDesc.trim(),
        }),
      });
      const data = await res.json();
      if (data.success && data.collection) {
        setCollections((prev) => [...prev, data.collection]);
        setNewCollectionName("");
        setNewCollectionDesc("");
        setIsCreatingCollection(false);
        setSelectedCollectionId(data.collection.id);
      }
    } catch (err) {
      console.error("Create collection error:", err);
      alert("Failed to create collection.");
    }
  };

  const handleRenameCollection = async (colId: string) => {
    if (!editingCollectionName.trim()) return;
    try {
      const res = await fetch("/api/collections", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "rename",
          collectionId: colId,
          name: editingCollectionName.trim(),
        }),
      });
      const data = await res.json();
      if (data.success && data.collection) {
        setCollections((prev) =>
          prev.map((c) => (c.id === colId ? data.collection : c))
        );
        setEditingCollectionId(null);
        setEditingCollectionName("");
      }
    } catch (err) {
      console.error("Rename collection error:", err);
      alert("Failed to rename collection.");
    }
  };

  const handleDeleteCollection = async (colId: string, colName: string) => {
    if (!confirm(`Are you sure you want to delete the collection "${colName}"?`)) return;
    try {
      const res = await fetch("/api/collections", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "delete",
          collectionId: colId,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setCollections((prev) => prev.filter((c) => c.id !== colId));
        if (selectedCollectionId === colId) {
          setSelectedCollectionId(null);
        }
      }
    } catch (err) {
      console.error("Delete collection error:", err);
      alert("Failed to delete collection.");
    }
  };

  const handleToggleCaseInCollection = async (colId: string, caseId: string) => {
    try {
      const res = await fetch("/api/collections", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "toggle-case",
          collectionId: colId,
          caseId,
        }),
      });
      const data = await res.json();
      if (data.success && data.collection) {
        setCollections((prev) =>
          prev.map((c) => (c.id === colId ? data.collection : c))
        );
      }
    } catch (err) {
      console.error("Toggle case in collection error:", err);
    }
  };

  const popularTags = [
    "Fintech",
    "CleanTech",
    "Quick-Commerce",
    "Supply Chain",
    "Platform Economy",
    "Dairy",
    "Electric Vehicles",
    "Micro-Lending",
    "Startups",
    "Diamond Industry",
    "Banking",
    "Solar",
  ];

  const resetFilters = () => {
    setSearch("");
    setDomainFilter("all");
    setTypeFilter("all");
    setLanguageFilter("all");
    setDifficultyFilter("all");
    setAuthorFilter("all");
    setActiveTag(null);
    setStatusFilter("all");
    setSelectedCollectionId(null);
    setScope("all");
  };

  const hasActiveFilters =
    search.trim() !== "" ||
    domainFilter !== "all" ||
    typeFilter !== "all" ||
    languageFilter !== "all" ||
    difficultyFilter !== "all" ||
    authorFilter !== "all" ||
    activeTag !== null ||
    statusFilter !== "all" ||
    selectedCollectionId !== null ||
    scope === "my-cases";

  const isFacultyOrAdmin = currentUser?.role === "faculty" || currentUser?.role === "admin";

  return (
    <AppShell>
      <div className="space-y-6">
        {/* HEADER SECTION */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-5">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold text-accent uppercase tracking-wider mb-1">
              <span>Curriculum Archive</span>
              <span>•</span>
              <span>Peer-Generated Case Library</span>
            </div>
            <h1 className="font-serif text-3xl font-bold text-text tracking-tight">
              Case Library & Collections
            </h1>
            <p className="text-sm text-muted mt-1">
              Explore accredited teaching cases, real-signal dilemmas, and organize custom classroom collections.
            </p>
          </div>

          <div className="flex items-center gap-3">
            {isFacultyOrAdmin && (
              <Link
                href="/create"
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-accent hover:bg-accent-hover text-accent-text font-serif font-bold text-sm hover:shadow-md transition-all border border-accent"
              >
                <PlusCircle className="w-4 h-4 text-accent-text" />
                <span>Generate New Case</span>
              </Link>
            )}
          </div>
        </div>


        {/* MAIN TWO-COLUMN WORKSPACE: LEFT COLLECTIONS SIDEBAR & RIGHT CASE DIRECTORY */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 items-start">
          {/* LEFT SIDEBAR: COLLECTIONS PANEL */}
          <div className="lg:col-span-1 space-y-4">
            <div className="p-4 rounded-2xl border border-border bg-surface shadow-sm space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Folder className="w-4 h-4 text-accent" />
                  <h3 className="font-serif font-bold text-sm text-text">
                    Collections
                  </h3>
                </div>
                <button
                  type="button"
                  onClick={() => setIsCreatingCollection(true)}
                  className="p-1 rounded-md text-muted hover:text-accent hover:bg-primary-soft"
                  title="Create New Collection"
                >
                  <FolderPlus className="w-4 h-4" />
                </button>
              </div>

              {/* Create Collection Inline Form */}
              {isCreatingCollection && (
                <form
                  onSubmit={handleCreateCollection}
                  className="p-3 rounded-xl border border-accent/30 bg-primary-soft/50 space-y-2"
                >
                  <input
                    type="text"
                    placeholder="Collection name (e.g., FIN-101 Core)"
                    value={newCollectionName}
                    onChange={(e) => setNewCollectionName(e.target.value)}
                    className="w-full px-2.5 py-1.5 text-xs rounded-lg border border-border bg-surface text-text focus:outline-none focus:border-accent"
                    autoFocus
                  />
                  <input
                    type="text"
                    placeholder="Optional description"
                    value={newCollectionDesc}
                    onChange={(e) => setNewCollectionDesc(e.target.value)}
                    className="w-full px-2.5 py-1 text-[11px] rounded-lg border border-border bg-surface text-text focus:outline-none focus:border-accent"
                  />
                  <div className="flex items-center justify-end gap-1.5 pt-1">
                    <button
                      type="button"
                      onClick={() => setIsCreatingCollection(false)}
                      className="px-2 py-1 text-[11px] font-semibold text-muted hover:bg-border/50 rounded"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={!newCollectionName.trim()}
                      className="px-2.5 py-1 text-[11px] font-bold bg-accent hover:bg-accent-hover text-accent-text rounded hover:shadow-sm disabled:opacity-50"
                    >
                      Save
                    </button>
                  </div>
                </form>
              )}

              {/* Collections List */}
              <div className="space-y-1">
                <button
                  type="button"
                  onClick={() => setSelectedCollectionId(null)}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold transition-all ${
                    selectedCollectionId === null
                      ? "bg-accent text-accent-text shadow-sm"
                      : "text-muted hover:bg-primary-soft/50"
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <BookOpen className="w-3.5 h-3.5" />
                    <span>All Repository Cases</span>
                  </div>
                  <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-black/10 dark:bg-white/10 font-bold">
                    {cases.length}
                  </span>
                </button>

                {collections.map((col) => {
                  const isSelected = selectedCollectionId === col.id;
                  const isEditing = editingCollectionId === col.id;

                  if (isEditing) {
                    return (
                      <div
                        key={col.id}
                        className="p-2 rounded-xl border border-border bg-surface space-y-1.5"
                      >
                        <input
                          type="text"
                          value={editingCollectionName}
                          onChange={(e) => setEditingCollectionName(e.target.value)}
                          className="w-full px-2 py-1 text-xs rounded border border-border bg-surface text-text"
                        />
                        <div className="flex items-center justify-end gap-1">
                          <button
                            type="button"
                            onClick={() => setEditingCollectionId(null)}
                            className="p-1 text-muted hover:text-text"
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleRenameCollection(col.id)}
                            className="p-1 text-success hover:opacity-80"
                          >
                            <Check className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    );
                  }

                  return (
                    <div
                      key={col.id}
                      className={`group flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold transition-all ${
                        isSelected
                          ? "bg-primary-soft text-primary border border-border font-bold"
                          : "text-text hover:bg-primary-soft/40"
                      }`}
                    >
                      <button
                        type="button"
                        onClick={() => setSelectedCollectionId(col.id)}
                        className="flex-1 flex items-center gap-2 text-left truncate mr-2"
                      >
                        <Folder className={`w-3.5 h-3.5 shrink-0 ${isSelected ? "text-accent" : "text-muted"}`} />
                        <span className="truncate">{col.name}</span>
                      </button>

                      <div className="flex items-center gap-1">
                        <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-primary-soft text-text font-bold">
                          {col.case_ids.length}
                        </span>

                        <div className="opacity-0 group-hover:opacity-100 flex items-center transition-opacity">
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setEditingCollectionId(col.id);
                              setEditingCollectionName(col.name);
                            }}
                            className="p-1 text-muted hover:text-text"
                            title="Rename"
                          >
                            <Edit2 className="w-3 h-3" />
                          </button>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeleteCollection(col.id, col.name);
                            }}
                            className="p-1 text-muted hover:text-danger"
                            title="Delete"
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}

                {collections.length === 0 && (
                  <p className="text-[11px] text-muted italic px-3 py-2">
                    No custom collections yet. Click + to organize syllabus tracks.
                  </p>
                )}
              </div>
            </div>

            {/* QUICK STATS CARD */}
            <div className="p-4 rounded-2xl border border-border bg-surface shadow-sm space-y-2">
              <h4 className="text-xs font-bold uppercase tracking-wider text-muted">
                Library Metrics
              </h4>
              <div className="space-y-1.5 text-xs text-text">
                <div className="flex justify-between py-1 border-b border-border">
                  <span>Total Available Cases</span>
                  <span className="font-bold text-text">{cases.length}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-border">
                  <span>Approved for Students</span>
                  <span className="font-bold text-success">
                    {cases.filter((c) => c.status === "approved").length}
                  </span>
                </div>
                {isFacultyOrAdmin && (
                  <div className="flex justify-between py-1 border-b border-border">
                    <span>Curriculum In Review</span>
                    <span className="font-bold text-warning">
                      {cases.filter((c) => c.status === "in_review").length}
                    </span>
                  </div>
                )}
                <div className="flex justify-between py-1">
                  <span>Custom Collections</span>
                  <span className="font-bold text-text">{collections.length}</span>
                </div>
              </div>
            </div>
          </div>

          {/* RIGHT COLUMN: SEARCH, FILTERS & CASE CATALOG */}
          <div className="lg:col-span-3 space-y-4">
            {/* TABS & SEARCH BAR */}
            <div className="p-4 rounded-2xl border border-border bg-surface shadow-sm space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                {/* Scope Switcher: All Cases vs My Cases */}
                <div className="inline-flex p-1 rounded-xl bg-primary-soft border border-border text-xs font-semibold">
                  <button
                    type="button"
                    onClick={() => setScope("all")}
                    className={`px-3 py-1.5 rounded-lg transition-all ${
                      scope === "all"
                        ? "bg-surface text-text shadow-sm font-bold"
                        : "text-muted hover:text-text"
                    }`}
                  >
                    All Repository Cases
                  </button>
                  {isFacultyOrAdmin && (
                    <button
                      type="button"
                      onClick={() => setScope("my-cases")}
                      className={`px-3 py-1.5 rounded-lg transition-all ${
                        scope === "my-cases"
                          ? "bg-surface text-text shadow-sm font-bold"
                          : "text-muted hover:text-text"
                      }`}
                    >
                      My Authored Cases
                    </button>
                  )}
                </div>

                {/* View Mode Toggle: Grid vs List */}
                <div className="flex items-center gap-1 p-1 rounded-xl bg-primary-soft border border-border">
                  <button
                    type="button"
                    onClick={() => setViewMode("grid")}
                    className={`p-1.5 rounded-lg transition-all ${
                      viewMode === "grid"
                        ? "bg-surface text-text shadow-sm"
                        : "text-muted hover:text-text"
                    }`}
                    title="Grid View"
                  >
                    <LayoutGrid className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => setViewMode("list")}
                    className={`p-1.5 rounded-lg transition-all ${
                      viewMode === "list"
                        ? "bg-surface text-text shadow-sm"
                        : "text-muted hover:text-text"
                    }`}
                    title="List View"
                  >
                    <List className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Search Input */}
              <div className="relative">
                <Search className="w-4 h-4 absolute left-3.5 top-3 text-muted" />
                <input
                  type="text"
                  placeholder="Search by case title, industry, function, or keywords..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 text-xs rounded-xl border border-border bg-surface text-text focus:outline-none focus:border-accent"
                />
                {search && (
                  <button
                    type="button"
                    onClick={() => setSearch("")}
                    className="absolute right-3 top-2.5 text-muted hover:text-text"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>

              {/* Filters Row: Domain, Type, Language, Difficulty, Author, Status */}
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2 pt-1">
                {/* Domain Filter */}
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-muted mb-1">
                    Domain
                  </label>
                  <select
                    value={domainFilter}
                    onChange={(e) => setDomainFilter(e.target.value)}
                    className="w-full px-2.5 py-1.5 text-xs rounded-lg border border-border bg-surface text-text focus:outline-none focus:border-accent"
                  >
                    <option value="all">All Domains</option>
                    <option value="Finance">Finance</option>
                    <option value="Marketing">Marketing</option>
                    <option value="Operations">Operations</option>
                    <option value="Supply Chain">Supply Chain</option>
                    <option value="HR">HR</option>
                    <option value="Strategy">Strategy</option>
                    <option value="Analytics">Analytics</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                {/* Case Type Filter */}
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-muted mb-1">
                    Case Type
                  </label>
                  <select
                    value={typeFilter}
                    onChange={(e) => setTypeFilter(e.target.value)}
                    className="w-full px-2.5 py-1.5 text-xs rounded-lg border border-border bg-surface text-text focus:outline-none focus:border-accent"
                  >
                    <option value="all">All Types</option>
                    <option value="short">Short Case (~2 pgs)</option>
                    <option value="full">Full Case Study</option>
                    <option value="research">Case Research</option>
                    <option value="flash">FlashCase (25-Min)</option>
                  </select>
                </div>

                {/* Language Filter */}
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-muted mb-1">
                    Language
                  </label>
                  <select
                    value={languageFilter}
                    onChange={(e) => setLanguageFilter(e.target.value)}
                    className="w-full px-2.5 py-1.5 text-xs rounded-lg border border-border bg-surface text-text focus:outline-none focus:border-accent"
                  >
                    <option value="all">All Languages</option>
                    <option value="en">English (EN)</option>
                    <option value="hi">Hindi (हिन्दी)</option>
                    <option value="gu">Gujarati (ગુજરાતી)</option>
                  </select>
                </div>

                {/* Difficulty Filter */}
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-muted mb-1">
                    Difficulty
                  </label>
                  <select
                    value={difficultyFilter}
                    onChange={(e) => setDifficultyFilter(e.target.value)}
                    className="w-full px-2.5 py-1.5 text-xs rounded-lg border border-border bg-surface text-text focus:outline-none focus:border-accent"
                  >
                    <option value="all">All Difficulties</option>
                    <option value="Beginner">Beginner</option>
                    <option value="Intermediate">Intermediate</option>
                    <option value="Advanced">Advanced</option>
                    <option value="Executive">Executive</option>
                  </select>
                </div>

                {/* Author Filter */}
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-muted mb-1">
                    Author
                  </label>
                  <select
                    value={authorFilter}
                    onChange={(e) => setAuthorFilter(e.target.value)}
                    className="w-full px-2.5 py-1.5 text-xs rounded-lg border border-border bg-surface text-text focus:outline-none focus:border-accent"
                  >
                    <option value="all">All Faculty</option>
                    <option value="Ms. Reena Paswan">Ms. Reena Paswan</option>
                    <option value="Dr. Neha Sharma">Dr. Neha Sharma</option>
                  </select>
                </div>

                {/* Status Filter */}
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-muted mb-1">
                    Status
                  </label>
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="w-full px-2.5 py-1.5 text-xs rounded-lg border border-border bg-surface text-text focus:outline-none focus:border-accent"
                  >
                    <option value="all">All Statuses</option>
                    <option value="published">Published</option>
                    <option value="approved">Approved</option>
                    {isFacultyOrAdmin && <option value="in_review">In Review</option>}
                    {isFacultyOrAdmin && <option value="draft">Draft</option>}
                    {isFacultyOrAdmin && <option value="changes_requested">Changes Requested</option>}
                  </select>
                </div>
              </div>

              {/* Topics / Pedagogical Tags Row */}
              <div className="space-y-1.5 pt-2 border-t border-border">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-muted flex items-center gap-1">
                    <Tag className="w-3 h-3 text-accent" />
                    <span>Curricular Tags & Topics</span>
                  </span>
                  {activeTag && (
                    <button
                      type="button"
                      onClick={() => setActiveTag(null)}
                      className="text-[11px] text-accent hover:underline flex items-center gap-1"
                    >
                      <span>Active: #{activeTag} (Clear)</span>
                      <X className="w-3 h-3" />
                    </button>
                  )}
                </div>
                <div className="flex flex-wrap items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => setActiveTag(null)}
                    className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold transition-all ${
                      activeTag === null
                        ? "bg-accent text-accent-text shadow-sm font-bold"
                        : "bg-primary-soft text-muted hover:text-text hover:bg-primary-soft/80"
                    }`}
                  >
                    All Topics
                  </button>
                  {popularTags.map((t) => {
                    const isSelected = activeTag?.toLowerCase() === t.toLowerCase();
                    return (
                      <button
                        key={t}
                        type="button"
                        onClick={() => setActiveTag(isSelected ? null : t)}
                        className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold transition-all flex items-center gap-1 ${
                          isSelected
                            ? "bg-accent text-accent-text shadow-sm font-bold"
                            : "bg-surface border border-border text-text hover:border-accent hover:text-accent"
                        }`}
                      >
                        <span>#{t}</span>
                        {isSelected && <Check className="w-3 h-3" />}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Reset filter active indicator */}
              {hasActiveFilters && (
                <div className="flex items-center justify-between pt-2 border-t border-border text-xs">
                  <span className="text-muted">
                    Active Filters Applied: {cases.length} result{cases.length === 1 ? "" : "s"} found.
                  </span>
                  <button
                    type="button"
                    onClick={resetFilters}
                    className="text-xs font-semibold text-accent hover:underline flex items-center gap-1"
                  >
                    <RefreshCw className="w-3 h-3" />
                    <span>Reset All Filters</span>
                  </button>
                </div>
              )}
            </div>

            {/* RESULTS STATE: LOADING, ERROR, EMPTY, OR LIST */}
            {loading ? (
              <div className="p-8 rounded-2xl border border-border bg-surface shadow-sm">
                <StateLoading
                  title="Querying Case Repository..."
                  subtitle="Retrieving peer-reviewed cases and collections."
                />
              </div>
            ) : error ? (
              <div className="p-8 rounded-2xl border border-border bg-surface shadow-sm">
                <StateError
                  title="Failed to Load Cases"
                  message={error}
                  onRetry={loadCases}
                />
              </div>
            ) : cases.length === 0 ? (
              <div className="p-8 rounded-2xl border border-border bg-surface shadow-sm">
                <StateEmpty
                  title="No Cases Match Your Criteria"
                  description={
                    hasActiveFilters
                      ? "Try adjusting your search query, clearing industry filters, or switching collections."
                      : "The case repository does not currently have cases matching your role permissions."
                  }
                  actionText={isFacultyOrAdmin ? "Generate New Case" : "Clear Filters"}
                  actionHref={isFacultyOrAdmin ? "/create" : undefined}
                  onAction={!isFacultyOrAdmin ? resetFilters : undefined}
                />
              </div>
            ) : viewMode === "grid" ? (
              /* GRID VIEW */
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {cases.map((c) => (
                  <div
                    key={c.id}
                    className="rounded-2xl border border-border bg-surface shadow-xs hover:border-accent/40 transition-all flex flex-col justify-between group relative overflow-hidden folder-card card-hover-lift"
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
                        {/* Top Badges */}
                        <div className="flex flex-wrap items-center justify-between gap-2">
                          <div className="flex flex-wrap items-center gap-1.5">
                            <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-primary text-on-primary">
                              {c.type === "flash" ? "⚡ FlashCase" : "Full Case"}
                            </span>
                            {c.format === "real_signal" && (
                              <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-warning/15 text-warning border border-warning/30">
                                Real Signal
                              </span>
                            )}
                            <span className="px-1.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-primary-soft text-text">
                              {c.language.toUpperCase()}
                            </span>
                          </div>

                          {/* Status Stamp Badge */}
                          <div>
                            {c.status === "approved" && (
                              <span className="stamp-badge stamp-badge-approved">
                                <CheckCircle2 className="w-3 h-3" />
                                <span>Approved {c.version ? `v${c.version}` : ""}</span>
                              </span>
                            )}
                            {c.status === "published" && (
                              <span className="stamp-badge stamp-badge-published">
                                <BookOpen className="w-3 h-3" />
                                <span>Published</span>
                              </span>
                            )}
                            {c.status === "in_review" && (
                              <span className="stamp-badge stamp-badge-review">
                                <Clock className="w-3 h-3" />
                                <span>Under Review</span>
                              </span>
                            )}
                            {c.status === "changes_requested" && (
                              <span className="stamp-badge stamp-badge-review">
                                <AlertTriangle className="w-3 h-3" />
                                <span>Changes Requested</span>
                              </span>
                            )}
                            {c.status === "draft" && (
                              <span className="stamp-badge stamp-badge-draft">
                                <span>Draft</span>
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Title */}
                        <Link href={`/cases/${c.id}`} className="block">
                          <h3 className="font-serif font-bold text-base text-text group-hover:text-accent transition-colors line-clamp-2">
                            {c.title}
                          </h3>
                        </Link>

                        {/* Summary Excerpt */}
                        <p className="text-xs text-muted line-clamp-2 leading-relaxed">
                          {c.content?.summary || "Pedagogical business case study."}
                        </p>

                        {/* Meta Chips: Domain, Difficulty, Author */}
                        <div className="flex flex-wrap items-center gap-2 pt-1 text-[11px] text-muted">
                          {c.domain && (
                            <span className="px-2 py-0.5 rounded-md bg-accent/10 text-accent font-bold text-[10px]">
                              {c.domain}
                            </span>
                          )}
                          {c.difficulty && (
                            <span className="px-2 py-0.5 rounded-md bg-primary-soft text-text font-semibold text-[10px]">
                              {c.difficulty}
                            </span>
                          )}
                          <span className="truncate max-w-[150px] font-medium text-text">{c.author_name || "Faculty Author"}</span>
                        </div>

                        {/* Pedagogical Tags */}
                        {c.tags && c.tags.length > 0 && (
                          <div className="flex flex-wrap items-center gap-1 pt-1">
                            {c.tags.slice(0, 4).map((t) => (
                              <button
                                key={t}
                                type="button"
                                onClick={(e) => {
                                  e.preventDefault();
                                  e.stopPropagation();
                                  setActiveTag(activeTag === t ? null : t);
                                }}
                                className={`text-[10px] px-2 py-0.5 rounded-full transition-all ${
                                  activeTag === t
                                    ? "bg-accent text-accent-text font-bold"
                                    : "bg-surface border border-border text-muted hover:border-accent hover:text-accent"
                                }`}
                              >
                                #{t}
                              </button>
                            ))}
                          </div>
                        )}
                      </div>

                      {/* Bottom Action Footer */}
                      <div className="pt-4 mt-3 border-t border-border flex items-center justify-between gap-2">
                        {/* Add to Collection Button & Popover */}
                        <div className="relative">
                          <button
                            type="button"
                            onClick={() =>
                              setActiveCollectionPopoverCaseId(
                                activeCollectionPopoverCaseId === c.id ? null : c.id
                              )
                            }
                            className="p-1.5 rounded-lg border border-border text-muted hover:border-accent hover:text-accent text-xs flex items-center gap-1"
                            title="Add / Remove from Collection"
                          >
                            <BookmarkPlus className="w-3.5 h-3.5" />
                            <span className="text-[11px]">Save</span>
                          </button>

                          {/* Collections Popover Dropdown */}
                          {activeCollectionPopoverCaseId === c.id && (
                            <div
                              style={{ backgroundColor: "var(--surface)" }}
                              className="absolute left-0 bottom-full mb-2 w-56 p-2 rounded-xl bg-surface border border-border shadow-2xl z-50 space-y-1.5"
                            >
                              <div className="flex items-center justify-between pb-1 border-b border-border px-1">
                                <span className="text-[11px] font-bold text-text">
                                  My Collections
                                </span>
                                <button
                                  type="button"
                                  onClick={() => setActiveCollectionPopoverCaseId(null)}
                                  className="text-muted hover:text-text"
                                >
                                  <X className="w-3.5 h-3.5" />
                                </button>
                              </div>

                              {collections.length === 0 ? (
                                <p className="text-[11px] text-muted p-1">
                                  No collections yet. Create one on the left panel first.
                                </p>
                              ) : (
                                <div className="max-h-40 overflow-y-auto space-y-1">
                                  {collections.map((col) => {
                                    const isInCol = col.case_ids.includes(c.id);
                                    return (
                                      <button
                                        key={col.id}
                                        type="button"
                                        onClick={() => handleToggleCaseInCollection(col.id, c.id)}
                                        className="w-full flex items-center justify-between px-2 py-1.5 rounded-lg text-xs hover:bg-primary-soft text-left transition-colors"
                                      >
                                        <span className="truncate pr-2 text-text">
                                          {col.name}
                                        </span>
                                        <div
                                          className={`w-4 h-4 rounded flex items-center justify-center border ${
                                            isInCol
                                              ? "bg-accent border-accent text-accent-text"
                                              : "border-border"
                                          }`}
                                        >
                                          {isInCol && <Check className="w-3 h-3 stroke-[3]" />}
                                        </div>
                                      </button>
                                    );
                                  })}
                                </div>
                              )}
                            </div>
                          )}
                        </div>

                        {/* Right Link */}
                        <div className="flex items-center gap-1.5">
                          <Link
                            href={`/cases/${c.id}`}
                            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-primary-soft text-text text-xs font-semibold hover:bg-accent hover:text-accent-text transition-all"
                          >
                            <span>Open Dossier</span>
                            <ChevronRight className="w-3.5 h-3.5" />
                          </Link>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              /* LIST VIEW */
              <div className="rounded-2xl border border-border bg-surface shadow-sm overflow-hidden divide-y divide-border">
                {cases.map((c) => (
                  <div
                    key={c.id}
                    className="p-4 hover:bg-primary-soft/30 transition-colors flex flex-col md:flex-row md:items-center justify-between gap-3 group"
                  >
                    <div className="space-y-1.5 flex-1 min-w-0 pr-4">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-primary text-on-primary">
                          {c.type === "flash" ? "FlashCase" : "Full Case"}
                        </span>
                        {c.format === "real_signal" && (
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-warning/15 text-warning border border-warning/30">
                            Real Signal
                          </span>
                        )}
                        {/* Status */}
                        {c.status === "approved" && (
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-success/15 text-success">
                            Approved {c.version ? `v${c.version}` : ""}
                          </span>
                        )}
                        {c.status === "in_review" && (
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-warning/15 text-warning">
                            In Review
                          </span>
                        )}
                        {c.status === "changes_requested" && (
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-danger/15 text-danger">
                            Changes Requested
                          </span>
                        )}
                        {c.status === "draft" && (
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-primary-soft text-muted">
                            Draft
                          </span>
                        )}
                      </div>

                      <Link href={`/cases/${c.id}`} className="block">
                        <h4 className="font-serif font-bold text-sm text-text group-hover:text-accent transition-colors truncate">
                          {c.title}
                        </h4>
                      </Link>

                      <div className="flex flex-wrap items-center gap-2 text-xs text-muted pt-1">
                        {c.domain && (
                          <span className="px-2 py-0.5 rounded-md bg-accent/10 text-accent font-bold text-[10px]">
                            {c.domain}
                          </span>
                        )}
                        {c.difficulty && (
                          <span className="px-2 py-0.5 rounded-md bg-primary-soft text-text font-semibold text-[10px]">
                            {c.difficulty}
                          </span>
                        )}
                        <span className="font-semibold text-text">{c.author_name || "Faculty"}</span>
                        <span>•</span>
                        <span className="font-medium text-text">{c.industry}</span>
                        <span>•</span>
                        <span>Level {c.complexity}/10</span>
                        <span>•</span>
                        <span className="font-mono uppercase font-bold text-[10px] px-1.5 py-0.5 rounded bg-primary-soft text-text">
                          {c.language}
                        </span>

                        {c.tags && c.tags.length > 0 && (
                          <div className="flex flex-wrap items-center gap-1 pl-2 border-l border-border">
                            {c.tags.slice(0, 3).map((t) => (
                              <button
                                key={t}
                                type="button"
                                onClick={(e) => {
                                  e.preventDefault();
                                  e.stopPropagation();
                                  setActiveTag(activeTag === t ? null : t);
                                }}
                                className={`text-[10px] px-1.5 py-0.5 rounded-full transition-all ${
                                  activeTag === t
                                    ? "bg-accent text-accent-text font-bold"
                                    : "bg-surface border border-border text-muted hover:border-accent hover:text-accent"
                                }`}
                              >
                                #{t}
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      {/* Save to collection in list view */}
                      <button
                        type="button"
                        onClick={() =>
                          setActiveCollectionPopoverCaseId(
                            activeCollectionPopoverCaseId === c.id ? null : c.id
                          )
                        }
                        className="p-2 rounded-xl border border-border text-muted hover:border-accent hover:text-accent text-xs flex items-center gap-1"
                        title="Add to Collection"
                      >
                        <BookmarkPlus className="w-4 h-4" />
                      </button>

                      <Link
                        href={`/cases/${c.id}`}
                        className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-accent hover:bg-accent-hover text-accent-text text-xs font-semibold hover:shadow-sm transition-all"
                      >
                        <span>Open</span>
                        <ChevronRight className="w-3.5 h-3.5" />
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </AppShell>
  );
}
