"use client";

import { useEffect, useState } from "react";
import { AppShell } from "@/components/AppShell";
import { StateLoading } from "@/components/StateLoading";
import { StateError } from "@/components/StateError";
import { Profile, Department, Course, UserRole, UserPlan, AuditLog, AuditAction, PlatformSettings, UserType } from "@/lib/types";
import { COLLEGE_NAME_WITH_SHORT, COLLEGE_SHORT } from "@/config/college";
import {
  Users,
  Building,
  GraduationCap,
  ShieldCheck,
  CheckCircle2,
  XCircle,
  Plus,
  Search,
  Filter,
  RefreshCw,
  BadgeCheck,
  History,
  FileSpreadsheet,
  FileJson,
  Award,
  Download,
  CheckSquare,
  Square,
  ChevronDown,
  ChevronUp,
  AlertCircle,
  Eye,
  Calendar,
  Lock,
  Edit3,
  Sliders,
  UserCheck,
  UserX,
  Check,
  X,
} from "lucide-react";

export default function AdminPage() {
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [stats, setStats] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Active Tab: 'users' | 'departments' | 'courses' | 'audit_logs' | 'graduation' | 'settings'
  const [activeTab, setActiveTab] = useState<"users" | "departments" | "courses" | "audit_logs" | "graduation" | "settings">("users");

  // Platform Settings & Allowed Domains State
  const [platformSettings, setPlatformSettings] = useState<PlatformSettings>({
    external_free_limit: 3,
    sbs_fair_use_limit: 30,
    allowed_domains: ["shantibschool.edu.in"],
  });
  const [allowedDomains, setAllowedDomains] = useState<string[]>(["shantibschool.edu.in"]);
  const [newDomainInput, setNewDomainInput] = useState<string>("");
  const [editingExternalLimit, setEditingExternalLimit] = useState<number>(3);
  const [editingSbsLimit, setEditingSbsLimit] = useState<number>(30);
  const [savingSettings, setSavingSettings] = useState<boolean>(false);
  const [domainUpdating, setDomainUpdating] = useState<boolean>(false);

  // Audit Logs State
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [auditActionFilter, setAuditActionFilter] = useState<string>("all");
  const [auditSearch, setAuditSearch] = useState<string>("");
  const [auditLoading, setAuditLoading] = useState<boolean>(false);
  const [expandedAuditId, setExpandedAuditId] = useState<string | null>(null);

  // Cohort Graduation Runner State
  const [selectedCohort, setSelectedCohort] = useState<string>("MBA Class of 2026");
  const [gradDeptFilter, setGradDeptFilter] = useState<string>("all");
  const [selectedStudentIds, setSelectedStudentIds] = useState<string[]>([]);
  const [isGraduating, setIsGraduating] = useState<boolean>(false);

  // User search & filters
  const [userSearch, setUserSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState<string>("all");
  const [updatingUserId, setUpdatingUserId] = useState<string | null>(null);
  const [actionSuccessMsg, setActionSuccessMsg] = useState<string | null>(null);

  // Department creation modal/form state
  const [newDeptCode, setNewDeptCode] = useState("");
  const [newDeptName, setNewDeptName] = useState("");
  const [newDeptDesc, setNewDeptDesc] = useState("");
  const [isCreatingDept, setIsCreatingDept] = useState(false);

  // Course creation modal/form state
  const [newCourseDeptId, setNewCourseDeptId] = useState("");
  const [newCourseCode, setNewCourseCode] = useState("");
  const [newCourseName, setNewCourseName] = useState("");
  const [newCourseSemester, setNewCourseSemester] = useState("Fall 2026");
  const [isCreatingCourse, setIsCreatingCourse] = useState(false);

  const loadAdminData = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/admin");
      if (!res.ok) throw new Error("Failed to fetch administrative data.");
      const data = await res.json();
      setProfiles(data.profiles || []);
      setDepartments(data.departments || []);
      setCourses(data.courses || []);
      setStats(data.stats || {});
      if (data.platformSettings) {
        setPlatformSettings(data.platformSettings);
        setEditingExternalLimit(data.platformSettings.external_free_limit ?? 3);
        setEditingSbsLimit(data.platformSettings.sbs_fair_use_limit ?? 30);
      }
      if (data.allowedDomains) {
        setAllowedDomains(data.allowedDomains);
      }
      if (data.departments && data.departments.length > 0 && !newCourseDeptId) {
        setNewCourseDeptId(data.departments[0].id);
      }
    } catch (err: unknown) {
      console.error("Admin load error:", err);
      const msg = err instanceof Error ? err.message : "Error loading data.";
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleSavePlatformLimits = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingSettings(true);
    try {
      const res = await fetch("/api/admin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "update-platform-settings",
          external_free_limit: editingExternalLimit,
          sbs_fair_use_limit: editingSbsLimit,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to update platform settings.");
      if (data.platformSettings) {
        setPlatformSettings(data.platformSettings);
      }
      triggerNotification("Platform generation quotas updated successfully.");
    } catch (err: unknown) {
      console.error(err);
      alert(err instanceof Error ? err.message : "Failed to update platform settings.");
    } finally {
      setSavingSettings(false);
    }
  };

  const handleAddAllowedDomain = async (e: React.FormEvent) => {
    e.preventDefault();
    const domain = newDomainInput.trim().toLowerCase();
    if (!domain) return;
    setDomainUpdating(true);
    try {
      const res = await fetch("/api/admin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "add-allowed-domain",
          domain,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to add domain.");
      if (data.allowedDomains) {
        setAllowedDomains(data.allowedDomains);
      }
      setNewDomainInput("");
      triggerNotification(data.message || `Domain @${domain} added.`);
      loadAdminData();
    } catch (err: unknown) {
      console.error(err);
      alert(err instanceof Error ? err.message : "Failed to add domain.");
    } finally {
      setDomainUpdating(false);
    }
  };

  const handleRemoveAllowedDomain = async (domain: string) => {
    if (domain === "shantibschool.edu.in") {
      alert("The primary SBS institutional domain cannot be removed.");
      return;
    }
    if (!confirm(`Are you sure you want to remove @${domain} from verified SBS domains?`)) return;
    setDomainUpdating(true);
    try {
      const res = await fetch("/api/admin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "remove-allowed-domain",
          domain,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to remove domain.");
      if (data.allowedDomains) {
        setAllowedDomains(data.allowedDomains);
      }
      triggerNotification(data.message || `Domain @${domain} removed.`);
      loadAdminData();
    } catch (err: unknown) {
      console.error(err);
      alert(err instanceof Error ? err.message : "Failed to remove domain.");
    } finally {
      setDomainUpdating(false);
    }
  };

  useEffect(() => {
    loadAdminData();
  }, []);

  const triggerNotification = (msg: string) => {
    setActionSuccessMsg(msg);
    setTimeout(() => setActionSuccessMsg(null), 3500);
  };

  const loadAuditLogs = async () => {
    setAuditLoading(true);
    try {
      const params = new URLSearchParams();
      if (auditActionFilter !== "all") params.set("action", auditActionFilter);
      if (auditSearch.trim()) params.set("search", auditSearch.trim());
      const res = await fetch(`/api/admin/audit-logs?${params.toString()}`);
      if (res.ok) {
        const data = await res.json();
        setAuditLogs(data.logs || []);
      }
    } catch (err) {
      console.error("Failed to load audit logs:", err);
    } finally {
      setAuditLoading(false);
    }
  };

  useEffect(() => {
    if (activeTab === "audit_logs") {
      loadAuditLogs();
    }
  }, [activeTab, auditActionFilter, auditSearch]);

  const handleExportAuditJson = () => {
    const blob = new Blob([JSON.stringify(auditLogs, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `sbs-caselab-audit-ledger-${new Date().toISOString().split("T")[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleExportAuditCsv = () => {
    const headers = ["Timestamp", "Action", "Actor Email", "Actor ID", "Target Type", "Target ID", "IP Address", "Metadata"];
    const rows = auditLogs.map((l) => [
      `"${l.created_at}"`,
      `"${l.action}"`,
      `"${l.actor_email}"`,
      `"${l.actor_id}"`,
      `"${l.target_type}"`,
      `"${l.target_id}"`,
      `"${l.ip_address || "127.0.0.1"}"`,
      `"${l.metadata ? JSON.stringify(l.metadata).replace(/"/g, '""') : ""}"`,
    ]);
    const csvContent = "\uFEFF" + [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `sbs-caselab-audit-ledger-${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleToggleStudentSelection = (studentId: string) => {
    setSelectedStudentIds((prev) =>
      prev.includes(studentId)
        ? prev.filter((id) => id !== studentId)
        : [...prev, studentId]
    );
  };

  const handleSelectAllStudents = (studentList: Profile[]) => {
    if (selectedStudentIds.length === studentList.length) {
      setSelectedStudentIds([]);
    } else {
      setSelectedStudentIds(studentList.map((s) => s.id));
    }
  };

  const handleBatchGraduation = async () => {
    if (selectedStudentIds.length === 0) {
      alert("Please select at least one student to graduate.");
      return;
    }
    const confirmGrad = confirm(
      `Confer ${COLLEGE_SHORT} Alumni status upon ${selectedStudentIds.length} candidate(s) for "${selectedCohort}"?\n\nThis will transition candidate accounts to Alumni status while preserving all lifetime answers and certificates.`
    );
    if (!confirmGrad) return;

    setIsGraduating(true);
    try {
      const res = await fetch("/api/admin/graduate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          studentIds: selectedStudentIds,
          cohortName: selectedCohort,
          actorId: "usr-admin-1",
          actorEmail: "admin@shantibschool.edu.in",
        }),
      });

      if (!res.ok) throw new Error("Batch graduation failed.");
      const data = await res.json();

      setProfiles((prev) =>
        prev.map((p) =>
          selectedStudentIds.includes(p.id) ? { ...p, plan: "lifetime" } : p
        )
      );

      triggerNotification(
        `Successfully graduated ${selectedStudentIds.length} student(s) to ${COLLEGE_SHORT} Alumni status!`
      );
      setSelectedStudentIds([]);
      loadAdminData();
    } catch (err) {
      console.error("Graduation error:", err);
      alert("Failed to process batch graduation.");
    } finally {
      setIsGraduating(false);
    }
  };

  // Quota & Plan Management State
  const [editingQuotaUser, setEditingQuotaUser] = useState<Profile | null>(null);
  const [newQuotaValue, setNewQuotaValue] = useState<number>(10);

  const handlePlanChange = async (userId: string, newPlan: UserPlan) => {
    setUpdatingUserId(userId);
    try {
      const res = await fetch("/api/admin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "update-user-plan",
          userId,
          plan: newPlan,
        }),
      });
      if (!res.ok) throw new Error("Failed to update user plan.");
      const data = await res.json();
      setProfiles((prev) =>
        prev.map((p) => (p.id === userId ? { ...p, ...data.profile } : p))
      );
      triggerNotification(`Updated plan to ${newPlan.toUpperCase()} for user.`);
    } catch (err) {
      console.error(err);
      alert("Failed to update user plan.");
    } finally {
      setUpdatingUserId(null);
    }
  };

  const handleSaveQuota = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingQuotaUser) return;
    setUpdatingUserId(editingQuotaUser.id);
    try {
      const res = await fetch("/api/admin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "update-user-quota",
          userId: editingQuotaUser.id,
          limit: newQuotaValue,
        }),
      });
      if (!res.ok) throw new Error("Failed to update user quota.");
      const data = await res.json();
      setProfiles((prev) =>
        prev.map((p) => (p.id === editingQuotaUser.id ? { ...p, ...data.profile } : p))
      );
      triggerNotification(`Updated monthly generation quota to ${newQuotaValue} cases.`);
      setEditingQuotaUser(null);
    } catch (err) {
      console.error(err);
      alert("Failed to update user quota.");
    } finally {
      setUpdatingUserId(null);
    }
  };

  const handleRejectUser = async (userId: string, userName: string) => {
    const reason = prompt(`Enter reason for declining registration for ${userName}:`, "Credentials could not be verified with registrar.");
    if (reason === null) return;
    setUpdatingUserId(userId);
    try {
      const res = await fetch("/api/admin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "reject-user",
          userId,
          reason,
        }),
      });
      if (!res.ok) throw new Error("Failed to reject user.");
      setProfiles((prev) => prev.filter((p) => p.id !== userId));
      triggerNotification(`Registration for ${userName} declined.`);
    } catch (err) {
      console.error(err);
      alert("Failed to reject registration.");
    } finally {
      setUpdatingUserId(null);
    }
  };

  // Change User Role handler
  const handleRoleChange = async (userId: string, newRole: UserRole) => {
    setUpdatingUserId(userId);
    try {
      const res = await fetch("/api/admin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "update-user-role",
          userId,
          role: newRole,
        }),
      });

      if (!res.ok) throw new Error("Failed to update role.");
      const data = await res.json();

      setProfiles((prev) =>
        prev.map((p) => (p.id === userId ? { ...p, role: newRole } : p))
      );
      triggerNotification(`User role updated to ${newRole.toUpperCase()}.`);
    } catch (err) {
      console.error("Role update failed:", err);
      alert("Failed to update user role.");
    } finally {
      setUpdatingUserId(null);
    }
  };

  // Toggle User Approval handler
  const handleToggleApproval = async (userId: string, currentApproval: boolean) => {
    setUpdatingUserId(userId);
    try {
      const res = await fetch("/api/admin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "toggle-approval",
          userId,
          isApproved: !currentApproval,
        }),
      });

      if (!res.ok) throw new Error("Failed to update approval status.");

      setProfiles((prev) =>
        prev.map((p) =>
          p.id === userId ? { ...p, is_approved: !currentApproval } : p
        )
      );
      triggerNotification(
        `Account ${!currentApproval ? "approved and verified" : "set to pending"}.`
      );
    } catch (err) {
      console.error("Approval toggle failed:", err);
      alert("Failed to toggle approval status.");
    } finally {
      setUpdatingUserId(null);
    }
  };

  // Create Department handler
  const handleCreateDepartment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDeptCode || !newDeptName) return;

    setIsCreatingDept(true);
    try {
      const res = await fetch("/api/admin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "create-department",
          code: newDeptCode.trim().toUpperCase(),
          name: newDeptName.trim(),
          description: newDeptDesc.trim(),
        }),
      });

      if (!res.ok) throw new Error("Failed to create department.");
      const data = await res.json();

      setDepartments((prev) => [...prev, data.department]);
      setNewDeptCode("");
      setNewDeptName("");
      setNewDeptDesc("");
      triggerNotification(`Department ${data.department.code} created.`);
    } catch (err) {
      console.error("Create department error:", err);
      alert("Failed to create department.");
    } finally {
      setIsCreatingDept(false);
    }
  };

  // Create Course handler
  const handleCreateCourse = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCourseCode || !newCourseName || !newCourseDeptId) return;

    setIsCreatingCourse(true);
    try {
      const selectedDept = departments.find((d) => d.id === newCourseDeptId);
      const res = await fetch("/api/admin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "create-course",
          departmentId: newCourseDeptId,
          dept: selectedDept?.code || "GEN",
          code: newCourseCode.trim(),
          name: newCourseName.trim(),
          semester: newCourseSemester,
        }),
      });

      if (!res.ok) throw new Error("Failed to create course.");
      const data = await res.json();

      setCourses((prev) => [...prev, data.course]);
      setNewCourseCode("");
      setNewCourseName("");
      triggerNotification(`Course ${data.course.code} added.`);
    } catch (err) {
      console.error("Create course error:", err);
      alert("Failed to create course.");
    } finally {
      setIsCreatingCourse(false);
    }
  };

  const filteredProfiles = profiles.filter((p) => {
    if (roleFilter !== "all" && p.role !== roleFilter) return false;
    if (userSearch.trim()) {
      const q = userSearch.toLowerCase();
      return (
        p.name.toLowerCase().includes(q) || p.email.toLowerCase().includes(q)
      );
    }
    return true;
  });

  return (
    <AppShell>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-5">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold text-accent uppercase tracking-wider mb-1">
              <ShieldCheck className="w-4 h-4 text-accent" />
              <span>{COLLEGE_SHORT} Administration & Governance</span>
            </div>
            <h1 className="font-serif text-3xl font-bold text-text tracking-tight">
              Admin Control Center
            </h1>
            <p className="text-sm text-muted mt-1">
              Manage faculty credentials, approve student registrations, set user roles, and configure departments & courses.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={loadAdminData}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl border border-border bg-surface text-xs font-semibold hover:border-accent text-text transition-colors"
            >
              <RefreshCw className="w-3.5 h-3.5 text-accent" />
              <span>Refresh Data</span>
            </button>
          </div>
        </div>

        {/* Global Notification Banner */}
        {actionSuccessMsg && (
          <div className="p-3 rounded-xl bg-success/15 border border-success/30 text-success text-xs font-semibold flex items-center gap-2 animate-fade-in">
            <CheckCircle2 className="w-4 h-4 text-success" />
            <span>{actionSuccessMsg}</span>
          </div>
        )}

        {/* STATS OVERVIEW CARDS */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          <div className="p-4 rounded-xl border border-border bg-surface shadow-sm">
            <span className="text-[10px] uppercase font-bold text-muted">Total Users</span>
            <p className="font-serif text-2xl font-bold text-text mt-1">
              {stats.totalUsers || profiles.length}
            </p>
          </div>

          <div className="p-4 rounded-xl border border-border bg-surface shadow-sm">
            <span className="text-[10px] uppercase font-bold text-muted">Faculty</span>
            <p className="font-serif text-2xl font-bold text-info mt-1">
              {stats.facultyCount || profiles.filter((p) => p.role === "faculty").length}
            </p>
          </div>

          <div className="p-4 rounded-xl border border-border bg-surface shadow-sm">
            <span className="text-[10px] uppercase font-bold text-muted">Students</span>
            <p className="font-serif text-2xl font-bold text-success mt-1">
              {stats.studentCount || profiles.filter((p) => p.role === "student").length}
            </p>
          </div>

          <div className="p-4 rounded-xl border border-border bg-surface shadow-sm">
            <span className="text-[10px] uppercase font-bold text-muted">Pending Approvals</span>
            <p className="font-serif text-2xl font-bold text-warning mt-1">
              {stats.pendingApprovalCount || profiles.filter((p) => !p.is_approved).length}
            </p>
          </div>

          <div className="p-4 rounded-xl border border-border bg-surface shadow-sm">
            <span className="text-[10px] uppercase font-bold text-muted">Departments</span>
            <p className="font-serif text-2xl font-bold text-primary dark:text-text mt-1">
              {departments.length}
            </p>
          </div>

          <div className="p-4 rounded-xl border border-border bg-surface shadow-sm">
            <span className="text-[10px] uppercase font-bold text-muted">Courses</span>
            <p className="font-serif text-2xl font-bold text-primary dark:text-text mt-1">
              {courses.length}
            </p>
          </div>
        </div>

        {/* TABS NAVIGATION */}
        <div className="flex border-b border-border gap-2">
          <button
            onClick={() => setActiveTab("users")}
            className={`flex items-center gap-2 px-5 py-3 text-sm font-semibold border-b-2 transition-all ${
              activeTab === "users"
                ? "border-accent text-accent font-bold"
                : "border-transparent text-muted hover:text-text"
            }`}
          >
            <Users className="w-4 h-4" />
            <span>User Directory & Role Approvals</span>
          </button>

          <button
            onClick={() => setActiveTab("departments")}
            className={`flex items-center gap-2 px-5 py-3 text-sm font-semibold border-b-2 transition-all ${
              activeTab === "departments"
                ? "border-accent text-accent font-bold"
                : "border-transparent text-muted hover:text-text"
            }`}
          >
            <Building className="w-4 h-4" />
            <span>Departments ({departments.length})</span>
          </button>

          <button
            onClick={() => setActiveTab("courses")}
            className={`flex items-center gap-2 px-5 py-3 text-sm font-semibold border-b-2 transition-all ${
              activeTab === "courses"
                ? "border-accent text-accent font-bold"
                : "border-transparent text-muted hover:text-text"
            }`}
          >
            <GraduationCap className="w-4 h-4" />
            <span>Courses & Semesters ({courses.length})</span>
          </button>

          <button
            onClick={() => setActiveTab("audit_logs")}
            className={`flex items-center gap-2 px-5 py-3 text-sm font-semibold border-b-2 transition-all ${
              activeTab === "audit_logs"
                ? "border-accent text-accent font-bold"
                : "border-transparent text-muted hover:text-text"
            }`}
          >
            <History className="w-4 h-4" />
            <span>Audit & Compliance Ledger</span>
          </button>

          <button
            onClick={() => setActiveTab("graduation")}
            className={`flex items-center gap-2 px-5 py-3 text-sm font-semibold border-b-2 transition-all ${
              activeTab === "graduation"
                ? "border-accent text-accent font-bold"
                : "border-transparent text-muted hover:text-text"
            }`}
          >
            <Award className="w-4 h-4" />
            <span>Cohort Graduation Runner</span>
          </button>

          <button
            onClick={() => setActiveTab("settings")}
            className={`flex items-center gap-2 px-5 py-3 text-sm font-semibold border-b-2 transition-all ${
              activeTab === "settings"
                ? "border-accent text-accent font-bold"
                : "border-transparent text-muted hover:text-text"
            }`}
          >
            <Sliders className="w-4 h-4" />
            <span>Usage Limits & Domains</span>
          </button>
        </div>

        {/* TAB 1: USERS & ROLES */}
        {activeTab === "users" && (
          <div className="space-y-4">
            {/* Filter Bar */}
            <div className="p-4 rounded-2xl border border-border bg-surface shadow-sm flex flex-col sm:flex-row gap-3 items-center justify-between">
              <div className="relative flex-1 w-full">
                <Search className="w-4 h-4 absolute left-3.5 top-3 text-muted" />
                <input
                  type="text"
                  placeholder={`Filter users by name or @${COLLEGE_SHORT.toLowerCase()}...`}
                  value={userSearch}
                  onChange={(e) => setUserSearch(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 text-xs rounded-xl bg-primary-soft/30 border border-border text-text placeholder:text-muted focus:outline-none focus:ring-1 focus:ring-accent"
                />
              </div>

              <div className="flex items-center gap-2 w-full sm:w-auto">
                <Filter className="w-4 h-4 text-muted" />
                <select
                  value={roleFilter}
                  onChange={(e) => setRoleFilter(e.target.value)}
                  className="text-xs p-2 rounded-xl bg-surface border border-border text-text focus:outline-none"
                >
                  <option value="all">All Roles</option>
                  <option value="admin">Admins</option>
                  <option value="faculty">Faculty</option>
                  <option value="student">Students</option>
                </select>
              </div>
            </div>

            {/* Users Table */}
            <div className="overflow-x-auto rounded-2xl border border-border bg-surface shadow-sm">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-primary-soft/40 border-b border-border text-muted font-bold uppercase tracking-wider">
                    <th className="p-3.5">User Identity & Dept</th>
                    <th className="p-3.5">Classification & Verification</th>
                    <th className="p-3.5">Role</th>
                    <th className="p-3.5">Institutional Approval</th>
                    <th className="p-3.5">Subscription Plan</th>
                    <th className="p-3.5">Monthly Quota</th>
                    <th className="p-3.5">Joined</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {filteredProfiles.map((p) => {
                    const isBusy = updatingUserId === p.id;
                    const used = p.free_cases_used_this_month ?? p.monthly_generations_used ?? 0;
                    const isSbs = p.user_type === "sbs_member" || p.email.endsWith("@shantibschool.edu.in");
                    const limit = p.monthly_generation_limit ?? (isSbs ? (platformSettings.sbs_fair_use_limit ?? 30) : (platformSettings.external_free_limit ?? 3));
                    const pct = limit > 0 ? Math.min(100, Math.round((used / limit) * 100)) : 100;
                    const dept = departments.find((d) => d.id === p.department_id);

                    return (
                      <tr key={p.id} className="hover:bg-primary-soft/20 transition-colors">
                        <td className="p-3.5">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-primary text-on-primary font-bold text-xs flex items-center justify-center shrink-0">
                              {p.name ? p.name[0] : "U"}
                            </div>
                            <div>
                              <p className="font-semibold text-text">
                                {p.name}
                              </p>
                              <p className="text-[11px] text-muted font-mono">
                                {p.email}
                              </p>
                              {dept && (
                                <span className="inline-block mt-0.5 px-1.5 py-0.2 rounded bg-primary-soft text-[10px] text-muted font-mono">
                                  {dept.code}
                                </span>
                              )}
                            </div>
                          </div>
                        </td>

                        {/* Classification & Verification */}
                        <td className="p-3.5">
                          <div className="space-y-1">
                            {isSbs ? (
                              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-success/15 text-success border border-success/30">
                                <BadgeCheck className="w-3.5 h-3.5" />
                                <span>SBS Member</span>
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-primary/10 text-primary border border-primary/30">
                                <AlertCircle className="w-3.5 h-3.5" />
                                <span>External Guest</span>
                              </span>
                            )}
                            <div>
                              {p.email_verified_at ? (
                                <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-success">
                                  <Check className="w-3 h-3" />
                                  <span>Verified</span>
                                </span>
                              ) : (
                                <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-warning">
                                  <AlertCircle className="w-3 h-3" />
                                  <span>Unverified OTP</span>
                                </span>
                              )}
                            </div>
                          </div>
                        </td>

                        {/* Role Selector */}
                        <td className="p-3.5">
                          <div className="flex items-center gap-2">
                            <select
                              value={p.role}
                              disabled={isBusy}
                              onChange={(e) =>
                                handleRoleChange(p.id, e.target.value as UserRole)
                              }
                              className={`p-1.5 rounded-lg text-xs font-bold uppercase border transition-all cursor-pointer ${
                                p.role === "admin"
                                  ? "bg-accent/15 text-accent border-accent/30"
                                  : p.role === "faculty"
                                  ? "bg-primary-soft text-primary font-bold border-primary/30"
                                  : "bg-success/15 text-success border-success/30"
                              }`}
                            >
                              <option value="admin">ADMIN</option>
                              <option value="faculty">FACULTY</option>
                              <option value="student">STUDENT</option>
                            </select>
                            {isBusy && <RefreshCw className="w-3.5 h-3.5 animate-spin text-accent" />}
                          </div>
                        </td>

                        {/* Institutional Approval / Reject */}
                        <td className="p-3.5">
                          {p.is_approved ? (
                            <button
                              type="button"
                              disabled={isBusy}
                              onClick={() => handleToggleApproval(p.id, p.is_approved)}
                              className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold bg-success/15 text-success border border-success/30 hover:bg-danger/10 hover:text-danger hover:border-danger/30 transition-all"
                              title="Click to revoke approval"
                            >
                              <CheckCircle2 className="w-3 h-3 text-success" />
                              <span>Approved</span>
                            </button>
                          ) : (
                            <div className="flex items-center gap-1.5">
                              <button
                                type="button"
                                disabled={isBusy}
                                onClick={() => handleToggleApproval(p.id, false)}
                                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-bold bg-success hover:bg-success-hover text-white transition-all shadow-sm"
                                title="Approve institutional membership"
                              >
                                <UserCheck className="w-3 h-3" />
                                <span>Approve</span>
                              </button>
                              <button
                                type="button"
                                disabled={isBusy}
                                onClick={() => handleRejectUser(p.id, p.name)}
                                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-bold bg-danger/15 hover:bg-danger text-danger hover:text-white border border-danger/30 transition-all"
                                title="Decline registration request"
                              >
                                <UserX className="w-3 h-3" />
                                <span>Reject</span>
                              </button>
                            </div>
                          )}
                        </td>

                        {/* Subscription Plan Selector */}
                        <td className="p-3.5">
                          <select
                            value={p.plan || "standard"}
                            disabled={isBusy}
                            onChange={(e) => handlePlanChange(p.id, e.target.value as UserPlan)}
                            className="p-1.5 rounded-lg text-xs font-semibold border border-border bg-surface text-text focus:outline-none cursor-pointer"
                          >
                            <option value="standard">Standard</option>
                            <option value="premium">Premium</option>
                            <option value="institutional">Institutional</option>
                            <option value="lifetime">Lifetime</option>
                          </select>
                        </td>

                        {/* Monthly Quota Progress & Edit */}
                        <td className="p-3.5 min-w-[170px]">
                          <div className="space-y-1">
                            <div className="flex items-center justify-between text-[11px]">
                              <span className="font-semibold text-text">
                                {used} / {limit}
                              </span>
                              <button
                                type="button"
                                onClick={() => {
                                  setEditingQuotaUser(p);
                                  setNewQuotaValue(limit);
                                }}
                                className="inline-flex items-center gap-0.5 text-[10px] font-semibold text-accent hover:underline"
                                title="Adjust monthly quota"
                              >
                                <Edit3 className="w-3 h-3" />
                                <span>Edit</span>
                              </button>
                            </div>
                            <div className="w-full h-1.5 rounded-full bg-border overflow-hidden">
                              <div
                                className={`h-full transition-all rounded-full ${
                                  pct >= 100
                                    ? "bg-danger"
                                    : pct >= 80
                                    ? "bg-warning"
                                    : "bg-accent"
                                }`}
                                style={{ width: `${pct}%` }}
                              />
                            </div>
                          </div>
                        </td>

                        <td className="p-3.5 text-muted text-[11px] whitespace-nowrap">
                          {p.created_at ? new Date(p.created_at).toLocaleDateString() : "Just now"}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 2: DEPARTMENTS */}
        {activeTab === "departments" && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Create Department Form (5 cols) */}
            <div className="lg:col-span-5 p-6 rounded-2xl border border-border bg-surface shadow-sm space-y-4">
              <h3 className="font-serif text-lg font-bold text-text">
                Register New Department
              </h3>
              <form onSubmit={handleCreateDepartment} className="space-y-3 text-xs">
                <div>
                  <label className="font-semibold text-text mb-1 block">
                    Department Code (e.g. MKT, OPS, TECH)
                  </label>
                  <input
                    type="text"
                    required
                    maxLength={10}
                    value={newDeptCode}
                    onChange={(e) => setNewDeptCode(e.target.value)}
                    placeholder="e.g. FIN, STRAT, MKT"
                    className="w-full p-2.5 rounded-xl border border-border bg-primary-soft/30 text-text font-mono uppercase"
                  />
                </div>

                <div>
                  <label className="font-semibold text-text mb-1 block">
                    Department Name
                  </label>
                  <input
                    type="text"
                    required
                    value={newDeptName}
                    onChange={(e) => setNewDeptName(e.target.value)}
                    placeholder="e.g. Marketing & Digital Commerce"
                    className="w-full p-2.5 rounded-xl border border-border bg-primary-soft/30 text-text"
                  />
                </div>

                <div>
                  <label className="font-semibold text-text mb-1 block">
                    Curricular Focus & Scope
                  </label>
                  <textarea
                    rows={3}
                    value={newDeptDesc}
                    onChange={(e) => setNewDeptDesc(e.target.value)}
                    placeholder="Brief description of research domains and case topics..."
                    className="w-full p-2.5 rounded-xl border border-border bg-primary-soft/30 text-text"
                  />
                </div>

                <button
                  type="submit"
                  disabled={isCreatingDept}
                  className="w-full py-2.5 rounded-xl bg-accent hover:bg-accent-hover text-accent-text font-bold transition-colors shadow-sm flex items-center justify-center gap-2"
                >
                  <Plus className="w-4 h-4" />
                  <span>{isCreatingDept ? "Creating..." : "Add Department"}</span>
                </button>
              </form>
            </div>

            {/* Departments Listing (7 cols) */}
            <div className="lg:col-span-7 space-y-3">
              {departments.map((dept) => {
                const deptCourses = courses.filter((c) => c.department_id === dept.id || c.dept === dept.code);

                return (
                  <div
                    key={dept.id}
                    className="p-5 rounded-2xl border border-border bg-surface shadow-sm space-y-2"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2.5">
                        <span className="px-2.5 py-1 rounded-lg bg-primary text-on-primary font-mono font-bold text-xs">
                          {dept.code}
                        </span>
                        <h4 className="font-serif text-base font-bold text-text">
                          {dept.name}
                        </h4>
                      </div>
                      <span className="text-xs text-muted font-medium">
                        {deptCourses.length} Courses
                      </span>
                    </div>

                    <p className="text-xs text-muted leading-relaxed">
                      {dept.description || "Core faculty academic division."}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* TAB 3: COURSES */}
        {activeTab === "courses" && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Create Course Form (5 cols) */}
            <div className="lg:col-span-5 p-6 rounded-2xl border border-border bg-surface shadow-sm space-y-4">
              <h3 className="font-serif text-lg font-bold text-text">
                Register New Course
              </h3>
              <form onSubmit={handleCreateCourse} className="space-y-3 text-xs">
                <div>
                  <label className="font-semibold text-text mb-1 block">
                    Academic Department
                  </label>
                  <select
                    value={newCourseDeptId}
                    onChange={(e) => setNewCourseDeptId(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-border bg-surface text-text"
                  >
                    {departments.map((d) => (
                      <option key={d.id} value={d.id}>
                        {d.code} - {d.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="font-semibold text-text mb-1 block">
                    Course Code (e.g. FIN-402, STRAT-510)
                  </label>
                  <input
                    type="text"
                    required
                    value={newCourseCode}
                    onChange={(e) => setNewCourseCode(e.target.value)}
                    placeholder="e.g. STRAT-412"
                    className="w-full p-2.5 rounded-xl border border-border bg-primary-soft/30 text-text font-mono"
                  />
                </div>

                <div>
                  <label className="font-semibold text-text mb-1 block">
                    Course Name
                  </label>
                  <input
                    type="text"
                    required
                    value={newCourseName}
                    onChange={(e) => setNewCourseName(e.target.value)}
                    placeholder="e.g. Private Equity & Buyouts"
                    className="w-full p-2.5 rounded-xl border border-border bg-primary-soft/30 text-text"
                  />
                </div>

                <div>
                  <label className="font-semibold text-text mb-1 block">
                    Semester
                  </label>
                  <select
                    value={newCourseSemester}
                    onChange={(e) => setNewCourseSemester(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-border bg-surface text-text"
                  >
                    <option value="Fall 2026">Fall 2026</option>
                    <option value="Spring 2027">Spring 2027</option>
                    <option value="Summer 2027">Summer 2027</option>
                  </select>
                </div>

                <button
                  type="submit"
                  disabled={isCreatingCourse}
                  className="w-full py-2.5 rounded-xl bg-accent hover:bg-accent-hover text-accent-text font-bold transition-colors shadow-sm flex items-center justify-center gap-2"
                >
                  <Plus className="w-4 h-4" />
                  <span>{isCreatingCourse ? "Creating..." : "Add Course"}</span>
                </button>
              </form>
            </div>

            {/* Courses Table (7 cols) */}
            <div className="lg:col-span-7 overflow-x-auto rounded-2xl border border-border bg-surface shadow-sm">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-primary-soft/40 border-b border-border text-muted font-bold uppercase tracking-wider">
                    <th className="p-3.5">Code</th>
                    <th className="p-3.5">Course Name</th>
                    <th className="p-3.5">Dept</th>
                    <th className="p-3.5">Semester</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {courses.map((course) => (
                    <tr key={course.id} className="hover:bg-primary-soft/20">
                      <td className="p-3.5 font-mono font-bold text-accent">
                        {course.code}
                      </td>
                      <td className="p-3.5 font-semibold text-text">
                        {course.name}
                      </td>
                      <td className="p-3.5">
                        <span className="px-2 py-0.5 rounded bg-primary-soft text-text font-mono text-[10px]">
                          {course.dept}
                        </span>
                      </td>
                      <td className="p-3.5 text-muted">
                        {course.semester}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 4: AUDIT & COMPLIANCE LEDGER */}
        {activeTab === "audit_logs" && (
          <div className="space-y-4">
            {/* Filter Bar & Export Actions */}
            <div className="p-4 rounded-2xl border border-border bg-surface shadow-sm flex flex-col sm:flex-row gap-3 items-center justify-between">
              <div className="flex flex-1 flex-col sm:flex-row gap-3 w-full">
                <div className="relative flex-1">
                  <Search className="w-4 h-4 absolute left-3.5 top-3 text-muted" />
                  <input
                    type="text"
                    placeholder="Search by actor, target ID, metadata or IP..."
                    value={auditSearch}
                    onChange={(e) => setAuditSearch(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 rounded-xl border border-border bg-primary-soft/30 text-text placeholder:text-muted text-xs focus:outline-none focus:border-accent"
                  />
                </div>

                <div className="flex items-center gap-2">
                  <Filter className="w-4 h-4 text-muted" />
                  <select
                    value={auditActionFilter}
                    onChange={(e) => setAuditActionFilter(e.target.value)}
                    className="p-2 rounded-xl border border-border bg-surface text-text text-xs font-semibold focus:outline-none focus:border-accent"
                  >
                    <option value="all">All Audit Actions ({auditLogs.length})</option>
                    <option value="role_change">Role Changes (role_change)</option>
                    <option value="case_approval">Case Approvals (case_approval)</option>
                    <option value="case_changes_requested">Changes Requested (case_changes_requested)</option>
                    <option value="grade_override">Grade Overrides (grade_override)</option>
                    <option value="user_graduation">User Graduations (user_graduation)</option>
                    <option value="subscription_created">Subscriptions (subscription_created)</option>
                    <option value="data_export">DPDP Data Export (data_export)</option>
                    <option value="data_erasure">DPDP Data Erasure (data_erasure)</option>
                    <option value="admin_action">Administrative Actions (admin_action)</option>
                  </select>
                </div>
              </div>

              <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
                <button
                  type="button"
                  onClick={handleExportAuditCsv}
                  className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl border border-border bg-surface text-xs font-semibold hover:border-accent text-text transition-colors shadow-sm"
                  title="Export compliance audit ledger as CSV"
                >
                  <FileSpreadsheet className="w-3.5 h-3.5 text-success" />
                  <span>Export CSV</span>
                </button>
                <button
                  type="button"
                  onClick={handleExportAuditJson}
                  className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl border border-border bg-surface text-xs font-semibold hover:border-accent text-text transition-colors shadow-sm"
                  title="Export raw cryptographic audit log as JSON"
                >
                  <FileJson className="w-3.5 h-3.5 text-info" />
                  <span>Export JSON</span>
                </button>
              </div>
            </div>

            {/* Compliance Guarantee Banner */}
            <div className="p-4 rounded-2xl bg-primary text-white border border-white/20 flex items-start gap-3 shadow-sm">
              <ShieldCheck className="w-5 h-5 text-on-primary shrink-0 mt-0.5" />
              <div className="text-xs leading-relaxed space-y-1">
                <div className="flex items-center gap-2">
                  <span className="font-serif font-bold text-white">
                    Tamper-Evident Institutional Audit Ledger
                  </span>
                  <span className="px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider bg-white/15 text-on-primary border border-white/20">
                    DPDP Section 11 & NAAC Certified
                  </span>
                </div>
                <p className="text-white/80 text-[11px]">
                  All role modifications, curriculum approvals, grade overrides, cohort graduations, and DPDP data subject requests are immutably logged with actor verification and IP telemetry.
                </p>
              </div>
            </div>

            {/* Audit Logs Table */}
            <div className="overflow-x-auto rounded-2xl border border-border bg-surface shadow-sm">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-primary-soft/40 border-b border-border text-muted font-bold uppercase tracking-wider">
                    <th className="p-3.5">Timestamp</th>
                    <th className="p-3.5">Action</th>
                    <th className="p-3.5">Actor (Authority)</th>
                    <th className="p-3.5">Target Entity</th>
                    <th className="p-3.5">IP Address</th>
                    <th className="p-3.5 text-right">Details</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {auditLoading ? (
                    <tr>
                      <td colSpan={6} className="p-8 text-center text-muted">
                        <div className="w-5 h-5 border-2 border-accent border-t-transparent rounded-full animate-spin mx-auto mb-2" />
                        <span>Querying institutional audit ledger...</span>
                      </td>
                    </tr>
                  ) : auditLogs.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="p-8 text-center text-muted">
                        No audit events recorded matching current criteria.
                      </td>
                    </tr>
                  ) : (
                    auditLogs.map((log) => {
                      const isExpanded = expandedAuditId === log.id;
                      const getActionBadge = (act: string) => {
                        switch (act) {
                          case "role_change":
                            return "bg-info/15 text-info border border-info/30";
                          case "case_approval":
                            return "bg-success/15 text-success border border-success/30";
                          case "case_changes_requested":
                            return "bg-warning/15 text-warning border border-warning/30";
                          case "grade_override":
                            return "bg-accent/15 text-accent border border-accent/30";
                          case "user_graduation":
                            return "bg-primary-soft text-primary font-bold border border-primary/30";
                          case "data_erasure":
                            return "bg-danger/15 text-danger border border-danger/30";
                          case "data_export":
                            return "bg-info/15 text-info border border-info/30";
                          default:
                            return "bg-primary-soft text-text border border-border";
                        }
                      };

                      return (
                        <tr key={log.id} className="hover:bg-primary-soft/20 transition-colors">
                          <td className="p-3.5 font-mono text-[11px] text-muted whitespace-nowrap">
                            {new Date(log.created_at).toLocaleString("en-US", {
                              month: "short",
                              day: "numeric",
                              year: "numeric",
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </td>
                          <td className="p-3.5">
                            <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold font-mono uppercase ${getActionBadge(log.action)}`}>
                              {log.action}
                            </span>
                          </td>
                          <td className="p-3.5">
                            <div className="font-semibold text-text">
                              {log.actor_email}
                            </div>
                            <span className="font-mono text-[10px] text-muted">
                              {log.actor_id}
                            </span>
                          </td>
                          <td className="p-3.5">
                            <span className="font-semibold text-text capitalize">
                              {log.target_type}:{" "}
                            </span>
                            <span className="font-mono text-[11px] text-muted">
                              {log.target_id}
                            </span>
                          </td>
                          <td className="p-3.5 font-mono text-[11px] text-muted">
                            {log.ip_address || "127.0.0.1"}
                          </td>
                          <td className="p-3.5 text-right">
                            <button
                              type="button"
                              onClick={() => setExpandedAuditId(isExpanded ? null : log.id)}
                              className="inline-flex items-center gap-1 text-[11px] font-semibold text-accent hover:underline"
                            >
                              <span>{isExpanded ? "Hide" : "Inspect"}</span>
                              {isExpanded ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                            </button>
                            {isExpanded && log.metadata && (
                              <div className="mt-2 text-left p-3 rounded-xl bg-primary/95 text-on-primary font-mono text-[10px] overflow-x-auto border border-border">
                                <pre>{JSON.stringify(log.metadata, null, 2)}</pre>
                              </div>
                            )}
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 5: COHORT GRADUATION RUNNER */}
        {activeTab === "graduation" && (
          <div className="space-y-5">
            {/* Header & Cohort Selection */}
            <div className="p-5 rounded-2xl border border-border bg-surface shadow-sm space-y-4">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2 text-xs font-semibold text-accent uppercase tracking-wider mb-1">
                    <Award className="w-4 h-4 text-accent" />
                    <span>Degree Conferral & Alumni Transition Office</span>
                  </div>
                  <h3 className="font-serif text-xl font-bold text-text">
                    Cohort Graduation Runner
                  </h3>
                  <p className="text-xs text-muted mt-1">
                    Select enrolled students to confer {COLLEGE_SHORT} Alumni credentials. Graduated students retain permanent free access to all past submissions, transcripts, and Dean certificates.
                  </p>
                </div>

                <div className="flex items-center gap-3">
                  <div>
                    <label className="text-[10px] uppercase font-bold text-muted block mb-1">
                      Conferral Cohort Label:
                    </label>
                    <select
                      value={selectedCohort}
                      onChange={(e) => setSelectedCohort(e.target.value)}
                      className="p-2 rounded-xl border border-border bg-surface text-xs font-bold text-accent focus:outline-none"
                    >
                      <option value="MBA Class of 2026">MBA Class of 2026</option>
                      <option value="PGDM Class of 2026">PGDM Class of 2026</option>
                      <option value={`${COLLEGE_SHORT} Executive MBA 2026`}>{COLLEGE_SHORT} Executive MBA 2026</option>
                      <option value="Fellowship Cohort 2026">Fellowship Cohort 2026</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-[10px] uppercase font-bold text-muted block mb-1">
                      Department Filter:
                    </label>
                    <select
                      value={gradDeptFilter}
                      onChange={(e) => setGradDeptFilter(e.target.value)}
                      className="p-2 rounded-xl border border-border bg-surface text-text text-xs font-semibold focus:outline-none"
                    >
                      <option value="all">All Academic Departments</option>
                      {departments.map((dept) => (
                        <option key={dept.id} value={dept.id}>
                          {dept.code} - {dept.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              {/* Action Bar */}
              {(() => {
                const enrolledStudents = profiles.filter(
                  (p) =>
                    p.role === "student" &&
                    (gradDeptFilter === "all" || p.department_id === gradDeptFilter)
                );
                const allSelected =
                  enrolledStudents.length > 0 &&
                  enrolledStudents.every((s) => selectedStudentIds.includes(s.id));

                return (
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-3 border-t border-border">
                    <div className="flex items-center gap-3">
                      <button
                        type="button"
                        onClick={() => handleSelectAllStudents(enrolledStudents)}
                        className="inline-flex items-center gap-2 text-xs font-semibold text-text hover:text-accent transition-colors"
                      >
                        {allSelected ? (
                          <CheckSquare className="w-4 h-4 text-accent" />
                        ) : (
                          <Square className="w-4 h-4 text-muted" />
                        )}
                        <span>
                          {allSelected ? "Deselect All" : `Select All Eligible (${enrolledStudents.length})`}
                        </span>
                      </button>

                      <span className="text-border">•</span>

                      <span className="text-xs text-muted">
                        <strong>{selectedStudentIds.length}</strong> candidate(s) selected for conferral
                      </span>
                    </div>

                    <button
                      type="button"
                      disabled={selectedStudentIds.length === 0 || isGraduating}
                      onClick={handleBatchGraduation}
                      className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-accent hover:bg-accent-hover text-accent-text font-serif font-bold text-xs transition-colors shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <Award className="w-4 h-4" />
                      <span>
                        {isGraduating
                          ? "Conferring Degrees..."
                          : `Graduate Selected Candidates (${selectedStudentIds.length})`}
                      </span>
                    </button>
                  </div>
                );
              })()}
            </div>

            {/* Students Roster Table */}
            <div className="overflow-x-auto rounded-2xl border border-border bg-surface shadow-sm">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-primary-soft/40 border-b border-border text-muted font-bold uppercase tracking-wider">
                    <th className="p-3.5 w-10">Select</th>
                    <th className="p-3.5">Student Name</th>
                    <th className="p-3.5">Email</th>
                    <th className="p-3.5">Department</th>
                    <th className="p-3.5">Current Role</th>
                    <th className="p-3.5">Academic Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {(() => {
                    const candidateStudents = profiles.filter(
                      (p) =>
                        p.role === "student" &&
                        (gradDeptFilter === "all" || p.department_id === gradDeptFilter)
                    );

                    if (candidateStudents.length === 0) {
                      return (
                        <tr>
                          <td colSpan={6} className="p-8 text-center text-muted">
                            No students found matching current department filter.
                          </td>
                        </tr>
                      );
                    }

                    return candidateStudents.map((candidate) => {
                      const isGraduated = candidate.plan === "lifetime";
                      const isChecked = selectedStudentIds.includes(candidate.id);
                      const dept = departments.find((d) => d.id === candidate.department_id);

                      return (
                        <tr
                          key={candidate.id}
                          className={`hover:bg-primary-soft/20 transition-colors ${
                            isGraduated ? "opacity-75 bg-primary-soft/10" : ""
                          }`}
                        >
                          <td className="p-3.5 text-center">
                            {isGraduated ? (
                              <span title="Already Graduated">
                                <BadgeCheck className="w-4 h-4 text-success mx-auto" />
                              </span>
                            ) : (
                              <input
                                type="checkbox"
                                checked={isChecked}
                                onChange={() => handleToggleStudentSelection(candidate.id)}
                                className="w-4 h-4 accent-accent rounded cursor-pointer"
                              />
                            )}
                          </td>
                          <td className="p-3.5 font-bold text-text">
                            {candidate.name}
                          </td>
                          <td className="p-3.5 text-muted font-mono text-[11px]">
                            {candidate.email}
                          </td>
                          <td className="p-3.5">
                            <span className="px-2 py-0.5 rounded bg-primary-soft text-text font-mono text-[10px]">
                              {dept?.code || "GEN"}
                            </span>
                          </td>
                          <td className="p-3.5">
                            <span
                              className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                                isGraduated
                                  ? "bg-primary-soft text-primary font-bold border border-primary/30"
                                  : "bg-success/15 text-success border border-success/30"
                              }`}
                            >
                              {candidate.role}
                            </span>
                          </td>
                          <td className="p-3.5">
                            {isGraduated ? (
                              <span className="inline-flex items-center gap-1 text-[11px] text-success font-semibold">
                                <CheckCircle2 className="w-3.5 h-3.5" />
                                <span>Alumni Credentials Active</span>
                              </span>
                            ) : (
                              <span className="text-[11px] text-muted">
                                Enrolled Candidate • Ready for Conferral
                              </span>
                            )}
                          </td>
                        </tr>
                      );
                    });
                  })()}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 6: USAGE LIMITS & DOMAINS */}
        {activeTab === "settings" && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Card 1: Platform Monthly Generation Quotas */}
              <div className="p-6 rounded-2xl border border-border bg-surface shadow-sm space-y-4">
                <div className="flex items-center gap-2.5 pb-3 border-b border-border">
                  <div className="p-2 rounded-xl bg-accent/15 text-accent">
                    <Sliders className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-serif font-bold text-base text-text">
                      Platform Generation Quotas
                    </h3>
                    <p className="text-xs text-muted">
                      Default limits for calendar month (Asia/Kolkata timezone)
                    </p>
                  </div>
                </div>

                <form onSubmit={handleSavePlatformLimits} className="space-y-4 text-xs">
                  <div>
                    <label className="font-semibold text-text mb-1 block">
                      External User Monthly Free Limit
                    </label>
                    <input
                      type="number"
                      min={0}
                      max={100}
                      required
                      value={editingExternalLimit}
                      onChange={(e) => setEditingExternalLimit(parseInt(e.target.value) || 0)}
                      className="w-full px-3 py-2 rounded-xl border border-border bg-surface text-text font-mono"
                    />
                    <p className="text-[11px] text-muted mt-1">
                      Free case generations granted to verified non-SBS external users per calendar month (Default: 3).
                    </p>
                  </div>

                  <div>
                    <label className="font-semibold text-text mb-1 block">
                      SBS Member Monthly Fair-Use Cap
                    </label>
                    <input
                      type="number"
                      min={0}
                      max={500}
                      required
                      value={editingSbsLimit}
                      onChange={(e) => setEditingSbsLimit(parseInt(e.target.value) || 0)}
                      className="w-full px-3 py-2 rounded-xl border border-border bg-surface text-text font-mono"
                    />
                    <p className="text-[11px] text-muted mt-1">
                      Fair-use generation cap for verified SBS faculty, students, and staff per month (Default: 30).
                    </p>
                  </div>

                  <div className="pt-2">
                    <button
                      type="submit"
                      disabled={savingSettings}
                      className="w-full py-2.5 rounded-xl bg-accent hover:bg-accent-hover text-accent-text font-serif font-bold text-xs shadow-sm transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                    >
                      {savingSettings ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Check className="w-3.5 h-3.5" />}
                      <span>{savingSettings ? "Saving..." : "Save Quota Defaults"}</span>
                    </button>
                  </div>
                </form>
              </div>

              {/* Card 2: SBS Institutional Allowed Domains */}
              <div className="p-6 rounded-2xl border border-border bg-surface shadow-sm space-y-4">
                <div className="flex items-center gap-2.5 pb-3 border-b border-border">
                  <div className="p-2 rounded-xl bg-primary/10 text-primary">
                    <Building className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-serif font-bold text-base text-text">
                      Verified SBS Institutional Domains
                    </h3>
                    <p className="text-xs text-muted">
                      Emails matching these domains qualify for 30 fair-use cases/month
                    </p>
                  </div>
                </div>

                {/* Add domain form */}
                <form onSubmit={handleAddAllowedDomain} className="flex gap-2">
                  <input
                    type="text"
                    required
                    placeholder="e.g. sbs.ac.in or sub.sbs.edu"
                    value={newDomainInput}
                    onChange={(e) => setNewDomainInput(e.target.value)}
                    className="flex-1 px-3 py-2 rounded-xl border border-border bg-surface text-text font-mono text-xs focus:outline-none focus:ring-1 focus:ring-accent"
                  />
                  <button
                    type="submit"
                    disabled={domainUpdating || !newDomainInput.trim()}
                    className="px-4 py-2 rounded-xl bg-accent hover:bg-accent-hover text-accent-text font-serif font-bold text-xs shadow-sm transition-all flex items-center gap-1.5 shrink-0 disabled:opacity-50"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add Domain</span>
                  </button>
                </form>

                {/* Domains list */}
                <div className="space-y-2 pt-2">
                  <p className="text-xs font-semibold text-text">Active Allowed Domains ({allowedDomains.length}):</p>
                  <div className="space-y-2">
                    {allowedDomains.map((dom) => {
                      const isDefault = dom === "shantibschool.edu.in";
                      return (
                        <div
                          key={dom}
                          className="flex items-center justify-between p-3 rounded-xl bg-surface-raised border border-border text-xs"
                        >
                          <div className="flex items-center gap-2 font-mono">
                            <span className="text-muted">@</span>
                            <span className="font-bold text-text">{dom}</span>
                            {isDefault && (
                              <span className="text-[10px] px-2 py-0.5 rounded-full bg-accent/15 text-accent font-sans font-bold">
                                Default Primary
                              </span>
                            )}
                          </div>

                          {!isDefault && (
                            <button
                              type="button"
                              disabled={domainUpdating}
                              onClick={() => handleRemoveAllowedDomain(dom)}
                              className="p-1 rounded-lg text-danger hover:bg-danger/10 transition-colors"
                              title={`Remove @${dom}`}
                            >
                              <X className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* EDIT QUOTA MODAL */}
        {editingQuotaUser && (
          <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-surface border border-border rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-border">
                <div className="flex items-center gap-2">
                  <Sliders className="w-5 h-5 text-accent" />
                  <h3 className="font-serif text-lg font-bold text-text">
                    Adjust Monthly Quota
                  </h3>
                </div>
                <button
                  type="button"
                  onClick={() => setEditingQuotaUser(null)}
                  className="p-1 rounded-lg hover:bg-primary-soft text-muted hover:text-text transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div>
                <p className="text-xs text-muted mb-1">Target Account:</p>
                <div className="p-3 rounded-xl bg-primary-soft/40 border border-border">
                  <p className="font-bold text-text text-sm">{editingQuotaUser.name}</p>
                  <p className="text-xs font-mono text-muted">{editingQuotaUser.email}</p>
                  <div className="flex items-center gap-2 mt-2 text-[11px]">
                    <span className="capitalize px-2 py-0.5 rounded bg-surface border border-border font-semibold">
                      Role: {editingQuotaUser.role}
                    </span>
                    <span className="capitalize px-2 py-0.5 rounded bg-surface border border-border font-semibold">
                      Plan: {editingQuotaUser.plan}
                    </span>
                    <span className="text-muted">
                      Current Usage: {editingQuotaUser.monthly_generations_used ?? 0} cases
                    </span>
                  </div>
                </div>
              </div>

              <form onSubmit={handleSaveQuota} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-text mb-1">
                    Monthly Case Generation Limit
                  </label>
                  <input
                    type="number"
                    min={0}
                    max={1000}
                    required
                    value={newQuotaValue}
                    onChange={(e) => setNewQuotaValue(parseInt(e.target.value) || 0)}
                    className="w-full px-3 py-2 text-sm rounded-xl bg-surface border border-border text-text focus:outline-none focus:ring-1 focus:ring-accent"
                  />
                  <p className="text-[11px] text-muted mt-1.5">
                    Recommended defaults: Standard (10), Premium (30), Institutional (50), Admin (100).
                  </p>
                </div>

                <div className="flex items-center justify-end gap-2 pt-2 border-t border-border">
                  <button
                    type="button"
                    onClick={() => setEditingQuotaUser(null)}
                    className="px-4 py-2 rounded-xl border border-border text-xs font-semibold text-text hover:bg-primary-soft transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={updatingUserId === editingQuotaUser.id}
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-accent hover:bg-accent-hover text-accent-text text-xs font-serif font-bold transition-colors shadow-sm disabled:opacity-50"
                  >
                    {updatingUserId === editingQuotaUser.id ? (
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    ) : (
                      <Check className="w-3.5 h-3.5" />
                    )}
                    <span>Save Quota</span>
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </AppShell>
  );
}
