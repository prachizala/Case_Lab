"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { AppShell } from "@/components/AppShell";
import {
  Layers,
  GraduationCap,
  Calendar,
  Users,
  Tag,
  Plus,
  Edit2,
  Check,
  X,
  Power,
  ArrowLeft,
  Loader2,
  AlertCircle,
  Building2,
} from "lucide-react";
import {
  Department,
  Course,
  AcademicBatch,
  FacultyType,
  CaseCategory,
} from "@/lib/types";

type ListTab = "departments" | "courses" | "batches" | "faculty_types" | "categories";

export default function AcademicListsAdminPage() {
  const [activeTab, setActiveTab] = useState<ListTab>("batches");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const [departments, setDepartments] = useState<Department[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [batches, setBatches] = useState<AcademicBatch[]>([]);
  const [facultyTypes, setFacultyTypes] = useState<FacultyType[]>([]);
  const [categories, setCategories] = useState<CaseCategory[]>([]);

  // Editing state
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");

  // New item state
  const [isAdding, setIsAdding] = useState(false);
  const [newLabel, setNewLabel] = useState("");
  const [newCode, setNewCode] = useState("");
  const [newDesc, setNewDesc] = useState("");
  const [newStartYear, setNewStartYear] = useState<number>(2026);
  const [newEndYear, setNewEndYear] = useState<number>(2029);

  const fetchLists = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/academic-lists");
      if (!res.ok) throw new Error("Failed to load academic lists.");
      const json = await res.json();
      if (json.data) {
        setDepartments(json.data.departments || []);
        setCourses(json.data.courses || []);
        setBatches(json.data.batches || []);
        setFacultyTypes(json.data.facultyTypes || []);
        setCategories(json.data.categories || []);
      }
    } catch (err: any) {
      setError(err.message || "Failed to load lists.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLists();
  }, []);

  const handleToggleActive = async (listType: string, id: string) => {
    setError(null);
    setSuccess(null);
    try {
      const res = await fetch("/api/admin/academic-lists", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          listType,
          action: "toggle_active",
          id,
        }),
      });
      if (!res.ok) throw new Error("Status update failed.");
      setSuccess("Status updated successfully.");
      fetchLists();
    } catch (err: any) {
      setError(err.message || "Action failed.");
    }
  };

  const handleRename = async (listType: string, id: string) => {
    if (!editName.trim()) return;
    setError(null);
    setSuccess(null);
    try {
      const payload: any = {};
      if (listType === "batch") payload.label = editName.trim();
      else payload.name = editName.trim();

      const res = await fetch("/api/admin/academic-lists", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          listType,
          action: "update",
          id,
          data: payload,
        }),
      });
      if (!res.ok) throw new Error("Rename failed.");
      setSuccess("Renamed successfully.");
      setEditingId(null);
      fetchLists();
    } catch (err: any) {
      setError(err.message || "Rename failed.");
    }
  };

  const handleCreateBatch = async () => {
    if (!newLabel.trim()) return;
    try {
      const endDate = `${newEndYear}-06-30T23:59:59+05:30`;
      const res = await fetch("/api/admin/academic-lists", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          listType: "batch",
          action: "create",
          data: {
            label: newLabel.trim(),
            start_year: newStartYear,
            end_year: newEndYear,
            end_date: endDate,
            is_active: true,
          },
        }),
      });
      if (!res.ok) throw new Error("Failed to create batch.");
      setSuccess("New batch created successfully.");
      setIsAdding(false);
      setNewLabel("");
      fetchLists();
    } catch (err: any) {
      setError(err.message);
    }
  };

  return (
    <AppShell>
      <div className="max-w-6xl mx-auto w-full px-4 sm:px-6 py-8">
        {/* Breadcrumb & Header */}
        <div className="flex items-center gap-2 mb-2 text-xs text-text-muted">
          <Link href="/admin" className="hover:text-text flex items-center gap-1">
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Admin Center</span>
          </Link>
          <span>/</span>
          <span>Academic Lists Configuration</span>
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-text">
              Academic Lists & Governance
            </h1>
            <p className="text-sm text-text-muted mt-1">
              Configure and maintain official academic departments, courses, batches, faculty appointments, and case taxonomy.
            </p>
          </div>
        </div>

        {error && (
          <div className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/30 text-red-600 dark:text-red-400 text-sm flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {success && (
          <div className="mb-6 p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 text-sm flex items-center gap-2">
            <Check className="w-4 h-4 shrink-0" />
            <span>{success}</span>
          </div>
        )}

        {/* Tab Navigation */}
        <div className="flex items-center gap-2 border-b border-border mb-6 overflow-x-auto pb-1">
          <button
            onClick={() => setActiveTab("batches")}
            className={`px-4 py-2.5 text-sm font-medium rounded-t-lg transition-colors flex items-center gap-2 border-b-2 ${
              activeTab === "batches"
                ? "border-blue-600 text-blue-600 dark:text-blue-400 bg-surface"
                : "border-transparent text-text-muted hover:text-text"
            }`}
          >
            <Calendar className="w-4 h-4" />
            <span>Academic Batches</span>
            <span className="text-xs px-2 py-0.5 rounded-full bg-border text-text-muted">
              {batches.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab("departments")}
            className={`px-4 py-2.5 text-sm font-medium rounded-t-lg transition-colors flex items-center gap-2 border-b-2 ${
              activeTab === "departments"
                ? "border-blue-600 text-blue-600 dark:text-blue-400 bg-surface"
                : "border-transparent text-text-muted hover:text-text"
            }`}
          >
            <Building2 className="w-4 h-4" />
            <span>Departments</span>
            <span className="text-xs px-2 py-0.5 rounded-full bg-border text-text-muted">
              {departments.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab("courses")}
            className={`px-4 py-2.5 text-sm font-medium rounded-t-lg transition-colors flex items-center gap-2 border-b-2 ${
              activeTab === "courses"
                ? "border-blue-600 text-blue-600 dark:text-blue-400 bg-surface"
                : "border-transparent text-text-muted hover:text-text"
            }`}
          >
            <GraduationCap className="w-4 h-4" />
            <span>Courses</span>
            <span className="text-xs px-2 py-0.5 rounded-full bg-border text-text-muted">
              {courses.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab("faculty_types")}
            className={`px-4 py-2.5 text-sm font-medium rounded-t-lg transition-colors flex items-center gap-2 border-b-2 ${
              activeTab === "faculty_types"
                ? "border-blue-600 text-blue-600 dark:text-blue-400 bg-surface"
                : "border-transparent text-text-muted hover:text-text"
            }`}
          >
            <Users className="w-4 h-4" />
            <span>Faculty Types</span>
            <span className="text-xs px-2 py-0.5 rounded-full bg-border text-text-muted">
              {facultyTypes.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab("categories")}
            className={`px-4 py-2.5 text-sm font-medium rounded-t-lg transition-colors flex items-center gap-2 border-b-2 ${
              activeTab === "categories"
                ? "border-blue-600 text-blue-600 dark:text-blue-400 bg-surface"
                : "border-transparent text-text-muted hover:text-text"
            }`}
          >
            <Tag className="w-4 h-4" />
            <span>Case Categories</span>
            <span className="text-xs px-2 py-0.5 rounded-full bg-border text-text-muted">
              {categories.length}
            </span>
          </button>
        </div>

        {/* Tab Content */}
        {loading ? (
          <div className="py-20 flex flex-col items-center justify-center gap-3">
            <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
            <p className="text-sm text-text-muted">Loading academic configurations...</p>
          </div>
        ) : (
          <div className="bg-surface rounded-2xl border border-border shadow-xs overflow-hidden">
            {/* 1. Academic Batches */}
            {activeTab === "batches" && (
              <div>
                <div className="p-4 sm:p-6 border-b border-border flex items-center justify-between">
                  <div>
                    <h2 className="text-base font-semibold text-text">Student Academic Cohorts / Batches</h2>
                    <p className="text-xs text-text-muted mt-0.5">
                      Controls student access period (Graduation date + 1 year free access).
                    </p>
                  </div>
                  <button
                    onClick={() => setIsAdding(!isAdding)}
                    className="px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-medium flex items-center gap-1.5 transition-colors shadow-xs"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Add Batch</span>
                  </button>
                </div>

                {isAdding && (
                  <div className="p-4 sm:p-6 bg-surface-hover/50 border-b border-border">
                    <h3 className="text-sm font-semibold mb-3">Add New Academic Batch</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-4">
                      <div>
                        <label className="block text-xs text-text-muted mb-1">Batch Label (e.g. 2026-29)</label>
                        <input
                          type="text"
                          value={newLabel}
                          onChange={(e) => setNewLabel(e.target.value)}
                          placeholder="2026-29"
                          className="w-full px-3 py-2 rounded-lg bg-surface border border-border text-sm"
                        />
                      </div>
                      <div>
                        <label className="block text-xs text-text-muted mb-1">Start Year</label>
                        <input
                          type="number"
                          value={newStartYear}
                          onChange={(e) => setNewStartYear(parseInt(e.target.value))}
                          className="w-full px-3 py-2 rounded-lg bg-surface border border-border text-sm"
                        />
                      </div>
                      <div>
                        <label className="block text-xs text-text-muted mb-1">Graduation Year</label>
                        <input
                          type="number"
                          value={newEndYear}
                          onChange={(e) => setNewEndYear(parseInt(e.target.value))}
                          className="w-full px-3 py-2 rounded-lg bg-surface border border-border text-sm"
                        />
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={handleCreateBatch}
                        className="px-4 py-2 rounded-lg bg-blue-600 text-white text-xs font-medium"
                      >
                        Save Batch
                      </button>
                      <button
                        onClick={() => setIsAdding(false)}
                        className="px-4 py-2 rounded-lg bg-surface border border-border text-text-muted text-xs"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                )}

                <div className="divide-y divide-border">
                  {batches.map((batch) => (
                    <div key={batch.id} className="p-4 sm:p-5 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center font-bold text-xs">
                          {batch.start_year.toString().slice(2)}-{batch.end_year.toString().slice(2)}
                        </div>
                        <div>
                          {editingId === batch.id ? (
                            <div className="flex items-center gap-2">
                              <input
                                type="text"
                                value={editName}
                                onChange={(e) => setEditName(e.target.value)}
                                className="px-2.5 py-1 rounded bg-surface border border-border text-sm"
                              />
                              <button
                                onClick={() => handleRename("batch", batch.id)}
                                className="p-1.5 text-emerald-600 hover:bg-emerald-500/10 rounded"
                              >
                                <Check className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => setEditingId(null)}
                                className="p-1.5 text-text-muted hover:bg-border rounded"
                              >
                                <X className="w-4 h-4" />
                              </button>
                            </div>
                          ) : (
                            <div className="flex items-center gap-2">
                              <span className="font-semibold text-sm text-text">Batch {batch.label}</span>
                              <button
                                onClick={() => {
                                  setEditingId(batch.id);
                                  setEditName(batch.label);
                                }}
                                className="p-1 text-text-muted hover:text-text rounded"
                              >
                                <Edit2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          )}
                          <p className="text-xs text-text-muted">
                            Graduation Date: {new Date(batch.end_date).toLocaleDateString("en-IN")} • Access valid through {batch.end_year + 1}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        <span
                          className={`text-xs px-2.5 py-1 rounded-full font-medium ${
                            batch.is_active
                              ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                              : "bg-red-500/10 text-red-600 dark:text-red-400"
                          }`}
                        >
                          {batch.is_active ? "Active Cohort" : "Archived / Inactive"}
                        </span>
                        <button
                          onClick={() => handleToggleActive("batch", batch.id)}
                          className="px-3 py-1.5 rounded-lg border border-border text-xs text-text-muted hover:text-text transition-colors"
                        >
                          {batch.is_active ? "Deactivate" : "Activate"}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* 2. Departments */}
            {activeTab === "departments" && (
              <div>
                <div className="p-4 sm:p-6 border-b border-border">
                  <h2 className="text-base font-semibold text-text">Academic Departments</h2>
                  <p className="text-xs text-text-muted mt-0.5">
                    Defines institutional faculties, curricula ownership, and peer review rotation pools.
                  </p>
                </div>
                <div className="divide-y divide-border">
                  {departments.map((dept) => (
                    <div key={dept.id} className="p-4 sm:p-5 flex items-center justify-between">
                      <div>
                        {editingId === dept.id ? (
                          <div className="flex items-center gap-2">
                            <input
                              type="text"
                              value={editName}
                              onChange={(e) => setEditName(e.target.value)}
                              className="px-2.5 py-1 rounded bg-surface border border-border text-sm"
                            />
                            <button
                              onClick={() => handleRename("department", dept.id)}
                              className="p-1.5 text-emerald-600 hover:bg-emerald-500/10 rounded"
                            >
                              <Check className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => setEditingId(null)}
                              className="p-1.5 text-text-muted hover:bg-border rounded"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </div>
                        ) : (
                          <div className="flex items-center gap-2">
                            <span className="font-semibold text-sm text-text">{dept.name}</span>
                            <span className="text-xs px-2 py-0.5 rounded bg-surface-hover text-text-muted">
                              {dept.code}
                            </span>
                            <button
                              onClick={() => {
                                setEditingId(dept.id);
                                setEditName(dept.name);
                              }}
                              className="p-1 text-text-muted hover:text-text rounded"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        )}
                        <p className="text-xs text-text-muted mt-0.5">{dept.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* 3. Courses */}
            {activeTab === "courses" && (
              <div>
                <div className="p-4 sm:p-6 border-b border-border">
                  <h2 className="text-base font-semibold text-text">Academic Courses & Syllabi</h2>
                  <p className="text-xs text-text-muted mt-0.5">
                    Courses grounded in Bloom's taxonomy and institutional outcome attainment.
                  </p>
                </div>
                <div className="divide-y divide-border">
                  {courses.map((course) => (
                    <div key={course.id} className="p-4 sm:p-5 flex items-center justify-between">
                      <div>
                        {editingId === course.id ? (
                          <div className="flex items-center gap-2">
                            <input
                              type="text"
                              value={editName}
                              onChange={(e) => setEditName(e.target.value)}
                              className="px-2.5 py-1 rounded bg-surface border border-border text-sm"
                            />
                            <button
                              onClick={() => handleRename("course", course.id)}
                              className="p-1.5 text-emerald-600 hover:bg-emerald-500/10 rounded"
                            >
                              <Check className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => setEditingId(null)}
                              className="p-1.5 text-text-muted hover:bg-border rounded"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </div>
                        ) : (
                          <div className="flex items-center gap-2">
                            <span className="font-semibold text-sm text-text">{course.name}</span>
                            <span className="text-xs px-2 py-0.5 rounded bg-surface-hover text-text-muted">
                              {course.code}
                            </span>
                            <button
                              onClick={() => {
                                setEditingId(course.id);
                                setEditName(course.name);
                              }}
                              className="p-1 text-text-muted hover:text-text rounded"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        )}
                        <p className="text-xs text-text-muted mt-0.5">
                          Department: {course.dept} • Semester: {course.semester}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* 4. Faculty Types */}
            {activeTab === "faculty_types" && (
              <div>
                <div className="p-4 sm:p-6 border-b border-border">
                  <h2 className="text-base font-semibold text-text">Faculty Appointment Types</h2>
                  <p className="text-xs text-text-muted mt-0.5">
                    Categorizes regular, visiting, guest, and adjunct faculty members.
                  </p>
                </div>
                <div className="divide-y divide-border">
                  {facultyTypes.map((ft) => (
                    <div key={ft.id} className="p-4 sm:p-5 flex items-center justify-between">
                      <div>
                        <span className="font-semibold text-sm text-text">{ft.name}</span>
                        <p className="text-xs text-text-muted mt-0.5">{ft.description}</p>
                      </div>
                      <div className="flex items-center gap-3">
                        <span
                          className={`text-xs px-2.5 py-1 rounded-full font-medium ${
                            ft.is_active
                              ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                              : "bg-red-500/10 text-red-600 dark:text-red-400"
                          }`}
                        >
                          {ft.is_active ? "Active" : "Disabled"}
                        </span>
                        <button
                          onClick={() => handleToggleActive("faculty_type", ft.id)}
                          className="px-3 py-1.5 rounded-lg border border-border text-xs text-text-muted hover:text-text"
                        >
                          {ft.is_active ? "Deactivate" : "Activate"}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* 5. Case Categories */}
            {activeTab === "categories" && (
              <div>
                <div className="p-4 sm:p-6 border-b border-border">
                  <h2 className="text-base font-semibold text-text">Case Study Taxonomy & Categories</h2>
                  <p className="text-xs text-text-muted mt-0.5">
                    Repository indexing disciplines for institutional accreditation.
                  </p>
                </div>
                <div className="divide-y divide-border">
                  {categories.map((cat) => (
                    <div key={cat.id} className="p-4 sm:p-5 flex items-center justify-between">
                      <div>
                        <span className="font-semibold text-sm text-text">{cat.name}</span>
                        <p className="text-xs text-text-muted mt-0.5">{cat.description}</p>
                      </div>
                      <div className="flex items-center gap-3">
                        <span
                          className={`text-xs px-2.5 py-1 rounded-full font-medium ${
                            cat.is_active
                              ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                              : "bg-red-500/10 text-red-600 dark:text-red-400"
                          }`}
                        >
                          {cat.is_active ? "Active" : "Disabled"}
                        </span>
                        <button
                          onClick={() => handleToggleActive("category", cat.id)}
                          className="px-3 py-1.5 rounded-lg border border-border text-xs text-text-muted hover:text-text"
                        >
                          {cat.is_active ? "Deactivate" : "Activate"}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </AppShell>
  );
}
