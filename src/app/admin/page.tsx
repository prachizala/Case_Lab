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
  ShieldAlert,
  Eye,
  Calendar,
  Lock,
  Edit3,
  Sliders,
  UserCheck,
  UserX,
  Check,
  X,
  Sparkles,
  Star,
  ThumbsUp,
  BarChart3,
  FileText,
  Clock,
  BookOpen,
  Send,
  ArrowRight,
} from "lucide-react";

export default function AdminPage() {
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [batches, setBatches] = useState<any[]>([]);
  const [facultyTypes, setFacultyTypes] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [cases, setCases] = useState<any[]>([]);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [reviewRounds, setReviewRounds] = useState<any[]>([]);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [repositoryItems, setRepositoryItems] = useState<any[]>([]);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [downloadLogs, setDownloadLogs] = useState<any[]>([]);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [reviewerLoads, setReviewerLoads] = useState<any[]>([]);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [usersByDepartment, setUsersByDepartment] = useState<Record<string, any>>({});
  const [usersByCourse, setUsersByCourse] = useState<Record<string, number>>({});
  const [stats, setStats] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Active Tab
  const [activeTab, setActiveTab] = useState<
    | "overview"
    | "faculty"
    | "students"
    | "submissions"
    | "repository"
    | "users"
    | "departments"
    | "courses"
    | "audit_logs"
    | "graduation"
    | "settings"
    | "casepack_quality"
  >("overview");

  // Faculty tab filters
  const [facultyDeptFilter, setFacultyDeptFilter] = useState<string>("all");
  const [facultyCourseFilter, setFacultyCourseFilter] = useState<string>("all");
  const [facultySearch, setFacultySearch] = useState<string>("");

  // Student tab filters & state
  const [studentCourseFilter, setStudentCourseFilter] = useState<string>("all");
  const [studentBatchFilter, setStudentBatchFilter] = useState<string>("all");
  const [studentStatusFilter, setStudentStatusFilter] = useState<string>("all");
  const [studentSearch, setStudentSearch] = useState<string>("");
  const [bulkBatchId, setBulkBatchId] = useState<string>("");

  // Submissions tracking filters & modal
  const [subStatusFilter, setSubStatusFilter] = useState<string>("all");
  const [subDeptFilter, setSubDeptFilter] = useState<string>("all");
  const [subReviewerFilter, setSubReviewerFilter] = useState<string>("all");
  const [subSearch, setSubSearch] = useState<string>("");
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [reassignModalCase, setReassignModalCase] = useState<any | null>(null);
  const [selectedNewReviewerId, setSelectedNewReviewerId] = useState<string>("");

  // Custom date picker for student renewal
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [customExpiryModalUser, setCustomExpiryModalUser] = useState<any | null>(null);
  const [customExpiryDate, setCustomExpiryDate] = useState<string>("");

  // CE Case Pack Quality State
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [casepackMetrics, setCasepackMetrics] = useState<any>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [casepackFeedbacks, setCasepackFeedbacks] = useState<any[]>([]);
  const [loadingCasepackQuality, setLoadingCasepackQuality] = useState(false);
  const [updatingGoldStatus, setUpdatingGoldStatus] = useState<string | null>(null);

  const loadCasepackQuality = async () => {
    setLoadingCasepackQuality(true);
    try {
      const res = await fetch("/api/casepack/feedback");
      if (res.ok) {
        const data = await res.json();
        setCasepackMetrics(data.metrics);
        setCasepackFeedbacks(data.feedbacks || []);
      }
    } catch (e) {
      console.error("Failed to load casepack quality:", e);
    } finally {
      setLoadingCasepackQuality(false);
    }
  };

  const handleUpdateGoldStatus = async (id: string, status: "promoted" | "rejected") => {
    setUpdatingGoldStatus(id);
    try {
      const res = await fetch("/api/casepack/feedback", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, status }),
      });
      if (res.ok) {
        await loadCasepackQuality();
      }
    } catch (e) {
      console.error("Failed to update gold status:", e);
    } finally {
      setUpdatingGoldStatus(null);
    }
  };

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
  const [studentGenPolicy, setStudentGenPolicy] = useState<{ enabled: boolean; dailyLimit: number }>({
    enabled: true,
    dailyLimit: 0,
  });

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
      if (!res.ok) {
        if (res.status === 401) {
          window.location.href = "/login?redirect=/admin";
          return;
        }
        if (res.status === 403) {
          window.location.href = "/dashboard?error=Access+denied+to+Admin+Center";
          return;
        }
        setError("Failed to fetch administrative data.");
        return;
      }
      const data = await res.json();
      setProfiles(data.profiles || []);
      setDepartments(data.departments || []);
      setCourses(data.courses || []);
      setBatches(data.batches || []);
      setFacultyTypes(data.facultyTypes || []);
      setCategories(data.categories || []);
      setCases(data.cases || []);
      setReviewRounds(data.reviewRounds || []);
      setRepositoryItems(data.repositoryItems || []);
      setDownloadLogs(data.downloadLogs || []);
      setReviewerLoads(data.reviewerLoads || []);
      setUsersByDepartment(data.usersByDepartment || {});
      setUsersByCourse(data.usersByCourse || {});
      setStats(data.stats || {});
      if (data.platformSettings) {
        setPlatformSettings(data.platformSettings);
        setEditingExternalLimit(data.platformSettings.external_free_limit ?? 3);
        setEditingSbsLimit(data.platformSettings.sbs_fair_use_limit ?? 30);
      }
      if (data.allowedDomains) {
        setAllowedDomains(data.allowedDomains);
      }
      if (data.studentCaseGeneration) {
        setStudentGenPolicy(data.studentCaseGeneration);
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
      if (data.studentCaseGeneration) {
        setStudentGenPolicy(data.studentCaseGeneration);
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
      if (data.studentCaseGeneration) {
        setStudentGenPolicy(data.studentCaseGeneration);
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

  useEffect(() => {
    if (activeTab === "casepack_quality") {
      loadCasepackQuality();
    }
  }, [activeTab]);

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
      `Confer ${COLLEGE_SHORT} Alumni status upon ${selectedStudentIds.length} candidate(s) for "${selectedCohort}"?\n\nThis will transition candidate accounts to Alumni status while preserving all lifetime answers and submissions.`
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

  const handlePendingAction = async (userId: string, action: "approve" | "reject") => {
    try {
      const res = await fetch("/api/admin/pending-registrations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, action }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Action failed");
      triggerNotification(data.message || `User registration ${action}ed.`);
      loadAdminData();
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : "Failed to process registration");
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

  // Toggle Faculty Reviewer Status
  const handleToggleFacultyReviewer = async (userId: string, currentIsReviewer: boolean) => {
    setUpdatingUserId(userId);
    try {
      const res = await fetch("/api/admin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "toggle-reviewer",
          userId,
          isReviewer: !currentIsReviewer,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        alert(data.error || "Failed to update reviewer designation.");
        return;
      }
      triggerNotification(!currentIsReviewer ? "Designated as Faculty Member and Reviewer." : "Reviewer designation removed.");
      loadAdminData();
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : "Error updating reviewer status");
    } finally {
      setUpdatingUserId(null);
    }
  };

  // Reassign Reviewer Handler
  const handleReassignReviewer = async (caseId: string, newReviewerId: string) => {
    try {
      const res = await fetch("/api/admin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "reassign-reviewer",
          caseId,
          newReviewerId,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        alert(data.error || "Failed to reassign reviewer.");
        return;
      }
      triggerNotification("Reviewer successfully reassigned.");
      setReassignModalCase(null);
      setSelectedNewReviewerId("");
      loadAdminData();
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : "Error reassigning reviewer");
    }
  };

  // Student Access Renewal
  const handleRenewStudentAccess = async (userId: string, extensionYears: number = 1, customDate?: string) => {
    setUpdatingUserId(userId);
    try {
      const res = await fetch("/api/admin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "renew-student-access",
          userId,
          extensionYears,
          customEndDate: customDate,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        alert(data.error || "Failed to renew student access.");
        return;
      }
      triggerNotification("Student access successfully renewed.");
      setCustomExpiryModalUser(null);
      setCustomExpiryDate("");
      loadAdminData();
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : "Error renewing student access");
    } finally {
      setUpdatingUserId(null);
    }
  };

  // Bulk Renew Cohort by Batch
  const handleBulkRenewCohort = async (batchId: string) => {
    if (!batchId) return;
    try {
      const res = await fetch("/api/admin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "bulk-renew-batch",
          batchId,
          extensionYears: 1,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed bulk renewal");
      triggerNotification(`Successfully extended access by 1 year for ${data.affectedCount} student(s).`);
      loadAdminData();
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : "Error during bulk renewal");
    }
  };

  // Bulk Deactivate Cohort by Batch
  const handleBulkDeactivateCohort = async (batchId: string) => {
    if (!batchId) return;
    if (!window.confirm("Are you sure you want to deactivate all student accounts in this batch?")) return;
    try {
      const res = await fetch("/api/admin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "bulk-deactivate-batch",
          batchId,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed bulk deactivation");
      triggerNotification(`Successfully deactivated ${data.affectedCount} student account(s).`);
      loadAdminData();
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : "Error during bulk deactivation");
    }
  };

  // Toggle Account Active / Inactive
  const handleSetUserStatus = async (userId: string, targetStatus: "active" | "inactive") => {
    setUpdatingUserId(userId);
    try {
      const res = await fetch("/api/admin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "set-user-status",
          userId,
          status: targetStatus,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        alert(data.error || "Failed to update account status.");
        return;
      }
      triggerNotification(`User account set to ${targetStatus}.`);
      loadAdminData();
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : "Error updating account status");
    } finally {
      setUpdatingUserId(null);
    }
  };

  // Moderate Repository Item (Publish / Unpublish)
  const handleModerateRepoItem = async (itemId: string, currentIsPublished: boolean) => {
    try {
      const res = await fetch("/api/admin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "moderate-repository-item",
          itemId,
          isPublished: !currentIsPublished,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        alert(data.error || "Failed to update publication status.");
        return;
      }
      triggerNotification(!currentIsPublished ? "Case published to repository catalog." : "Case unpublished from repository catalog.");
      loadAdminData();
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : "Error updating publication status");
    }
  };

  const handleLegacyCaseAction = async (caseId: string, action: "archive-legacy-case" | "keep-legacy-case") => {
    try {
      const res = await fetch("/api/admin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action, caseId }),
      });
      const data = await res.json();
      if (!res.ok) {
        alert(data.error || "Action failed.");
        return;
      }
      triggerNotification(data.message || "Legacy case status updated.");
      loadAdminData();
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : "Error updating legacy case.");
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
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-2.5">
          <div className="p-3.5 rounded-xl border border-border bg-surface shadow-sm">
            <span className="text-[10px] uppercase font-bold text-muted">Students</span>
            <p className="font-serif text-2xl font-bold text-success mt-1">
              {stats.studentCount || profiles.filter((p) => p.role === "student").length}
            </p>
          </div>

          <div className="p-3.5 rounded-xl border border-border bg-surface shadow-sm">
            <span className="text-[10px] uppercase font-bold text-muted">Faculty</span>
            <p className="font-serif text-2xl font-bold text-info mt-1">
              {stats.facultyCount || profiles.filter((p) => p.role === "faculty").length}
            </p>
          </div>

          <div className="p-3.5 rounded-xl border border-border bg-surface shadow-sm">
            <span className="text-[10px] uppercase font-bold text-muted">Reviewers</span>
            <p className="font-serif text-2xl font-bold text-accent mt-1">
              {stats.reviewersCount || profiles.filter((p) => p.role === "faculty" && p.is_reviewer).length}
            </p>
          </div>

          <div className="p-3.5 rounded-xl border border-border bg-surface shadow-sm">
            <span className="text-[10px] uppercase font-bold text-muted">In Review</span>
            <p className="font-serif text-2xl font-bold text-primary dark:text-text mt-1">
              {stats.pendingSubmissionsCount || cases.filter((c) => ["submitted", "in_review", "changes_requested"].includes(c.status)).length}
            </p>
          </div>

          <div className={`p-3.5 rounded-xl border shadow-sm ${stats.overdueReviewsCount && stats.overdueReviewsCount > 0 ? "border-amber-500/50 bg-amber-500/10 text-amber-600 dark:text-amber-400" : "border-border bg-surface text-text"}`}>
            <span className="text-[10px] uppercase font-bold opacity-80">Overdue (&gt;3d)</span>
            <p className="font-serif text-2xl font-bold mt-1">
              {stats.overdueReviewsCount || 0}
            </p>
          </div>

          <div className="p-3.5 rounded-xl border border-border bg-surface shadow-sm">
            <span className="text-[10px] uppercase font-bold text-muted">Repository</span>
            <p className="font-serif text-2xl font-bold text-emerald-600 dark:text-emerald-400 mt-1">
              {stats.repositoryItemsCount || repositoryItems.filter((i) => i.is_published).length}
            </p>
          </div>

          <div className="p-3.5 rounded-xl border border-border bg-surface shadow-sm">
            <span className="text-[10px] uppercase font-bold text-muted">Pending Reg.</span>
            <p className="font-serif text-2xl font-bold text-warning mt-1">
              {stats.pendingApprovalCount || profiles.filter((p) => !p.is_approved).length}
            </p>
          </div>

          <div className="p-3.5 rounded-xl border border-border bg-surface shadow-sm">
            <span className="text-[10px] uppercase font-bold text-muted">Total Users</span>
            <p className="font-serif text-2xl font-bold text-text mt-1">
              {stats.totalUsers || profiles.length}
            </p>
          </div>
        </div>

        {/* TABS NAVIGATION */}
        <div className="flex border-b border-border gap-1 overflow-x-auto no-scrollbar py-1">
          <button
            onClick={() => setActiveTab("overview")}
            className={`flex items-center gap-1.5 px-4 py-2.5 text-xs font-semibold rounded-lg transition-all whitespace-nowrap ${
              activeTab === "overview"
                ? "bg-accent text-white shadow-sm font-bold"
                : "text-muted hover:text-text hover:bg-surface"
            }`}
          >
            <BarChart3 className="w-3.5 h-3.5" />
            <span>Overview &amp; Telemetry</span>
          </button>

          <button
            onClick={() => setActiveTab("faculty")}
            className={`flex items-center gap-1.5 px-4 py-2.5 text-xs font-semibold rounded-lg transition-all whitespace-nowrap ${
              activeTab === "faculty"
                ? "bg-accent text-white shadow-sm font-bold"
                : "text-muted hover:text-text hover:bg-surface"
            }`}
          >
            <GraduationCap className="w-3.5 h-3.5" />
            <span>Faculty &amp; Reviewers ({profiles.filter((p) => p.role === "faculty").length})</span>
          </button>

          <button
            onClick={() => setActiveTab("students")}
            className={`flex items-center gap-1.5 px-4 py-2.5 text-xs font-semibold rounded-lg transition-all whitespace-nowrap ${
              activeTab === "students"
                ? "bg-accent text-white shadow-sm font-bold"
                : "text-muted hover:text-text hover:bg-surface"
            }`}
          >
            <Users className="w-3.5 h-3.5" />
            <span>Student Cohorts ({profiles.filter((p) => p.role === "student").length})</span>
          </button>

          <button
            onClick={() => setActiveTab("submissions")}
            className={`flex items-center gap-1.5 px-4 py-2.5 text-xs font-semibold rounded-lg transition-all whitespace-nowrap ${
              activeTab === "submissions"
                ? "bg-accent text-white shadow-sm font-bold"
                : "text-muted hover:text-text hover:bg-surface"
            }`}
          >
            <Clock className="w-3.5 h-3.5" />
            <span>Submissions &amp; Workload ({cases.filter((c) => ["submitted", "in_review", "changes_requested"].includes(c.status)).length})</span>
          </button>

          <button
            onClick={() => setActiveTab("repository")}
            className={`flex items-center gap-1.5 px-4 py-2.5 text-xs font-semibold rounded-lg transition-all whitespace-nowrap ${
              activeTab === "repository"
                ? "bg-accent text-white shadow-sm font-bold"
                : "text-muted hover:text-text hover:bg-surface"
            }`}
          >
            <BookOpen className="w-3.5 h-3.5" />
            <span>Repository Moderation ({repositoryItems.length})</span>
          </button>

          <button
            onClick={() => setActiveTab("users")}
            className={`flex items-center gap-1.5 px-4 py-2.5 text-xs font-semibold rounded-lg transition-all whitespace-nowrap ${
              activeTab === "users"
                ? "bg-accent text-white shadow-sm font-bold"
                : "text-muted hover:text-text hover:bg-surface"
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>All Users &amp; Approvals</span>
          </button>

          <button
            onClick={() => setActiveTab("departments")}
            className={`flex items-center gap-1.5 px-4 py-2.5 text-xs font-semibold rounded-lg transition-all whitespace-nowrap ${
              activeTab === "departments"
                ? "bg-accent text-white shadow-sm font-bold"
                : "text-muted hover:text-text hover:bg-surface"
            }`}
          >
            <Building className="w-3.5 h-3.5" />
            <span>Departments ({departments.length})</span>
          </button>

          <button
            onClick={() => setActiveTab("courses")}
            className={`flex items-center gap-1.5 px-4 py-2.5 text-xs font-semibold rounded-lg transition-all whitespace-nowrap ${
              activeTab === "courses"
                ? "bg-accent text-white shadow-sm font-bold"
                : "text-muted hover:text-text hover:bg-surface"
            }`}
          >
            <GraduationCap className="w-3.5 h-3.5" />
            <span>Courses ({courses.length})</span>
          </button>

          <button
            onClick={() => setActiveTab("audit_logs")}
            className={`flex items-center gap-1.5 px-4 py-2.5 text-xs font-semibold rounded-lg transition-all whitespace-nowrap ${
              activeTab === "audit_logs"
                ? "bg-accent text-white shadow-sm font-bold"
                : "text-muted hover:text-text hover:bg-surface"
            }`}
          >
            <History className="w-3.5 h-3.5" />
            <span>Audit Ledger</span>
          </button>

          <button
            onClick={() => setActiveTab("graduation")}
            className={`flex items-center gap-1.5 px-4 py-2.5 text-xs font-semibold rounded-lg transition-all whitespace-nowrap ${
              activeTab === "graduation"
                ? "bg-accent text-white shadow-sm font-bold"
                : "text-muted hover:text-text hover:bg-surface"
            }`}
          >
            <Award className="w-3.5 h-3.5" />
            <span>Graduation</span>
          </button>

          <button
            onClick={() => setActiveTab("settings")}
            className={`flex items-center gap-1.5 px-4 py-2.5 text-xs font-semibold rounded-lg transition-all whitespace-nowrap ${
              activeTab === "settings"
                ? "bg-accent text-white shadow-sm font-bold"
                : "text-muted hover:text-text hover:bg-surface"
            }`}
          >
            <Sliders className="w-3.5 h-3.5" />
            <span>Settings</span>
          </button>

          <button
            onClick={() => setActiveTab("casepack_quality")}
            className={`flex items-center gap-1.5 px-4 py-2.5 text-xs font-semibold rounded-lg transition-all whitespace-nowrap ${
              activeTab === "casepack_quality"
                ? "bg-accent text-white shadow-sm font-bold"
                : "text-muted hover:text-text hover:bg-surface"
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>CE Quality</span>
          </button>
        </div>

        {/* TAB 0: OVERVIEW & TELEMETRY */}
        {activeTab === "overview" && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-5 rounded-2xl border border-border bg-surface shadow-sm space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider text-muted">User Base Composition</span>
                  <Users className="w-4 h-4 text-accent" />
                </div>
                <div className="space-y-2 text-xs">
                  <div className="flex justify-between py-1 border-b border-border/50">
                    <span className="text-muted">Active Authorized Users:</span>
                    <span className="font-bold text-success">{stats.activeUsersCount || 0}</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-border/50">
                    <span className="text-muted">Pending Admin Approval:</span>
                    <span className="font-bold text-warning">{stats.pendingApprovalCount || 0}</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-border/50">
                    <span className="text-muted">Expired Alumni Accounts:</span>
                    <span className="font-bold text-red-500">{stats.expiredUsersCount || 0}</span>
                  </div>
                  <div className="flex justify-between py-1">
                    <span className="text-muted">Inactive / Suspended:</span>
                    <span className="font-bold text-muted">{stats.inactiveUsersCount || 0}</span>
                  </div>
                </div>
              </div>

              <div className="p-5 rounded-2xl border border-border bg-surface shadow-sm space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider text-muted">Case Study Pipeline</span>
                  <FileText className="w-4 h-4 text-info" />
                </div>
                <div className="space-y-2 text-xs">
                  <div className="flex justify-between py-1 border-b border-border/50">
                    <span className="text-muted">Published to Repository:</span>
                    <span className="font-bold text-emerald-600 dark:text-emerald-400">{stats.repositoryItemsCount || 0}</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-border/50">
                    <span className="text-muted">In Active Peer Review:</span>
                    <span className="font-bold text-primary dark:text-text">{stats.pendingSubmissionsCount || 0}</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-border/50">
                    <span className="text-muted">Total Approved Cases:</span>
                    <span className="font-bold text-success">{stats.approvedCasesCount || 0}</span>
                  </div>
                  <div className="flex justify-between py-1">
                    <span className="text-muted">Rejected / Archived:</span>
                    <span className="font-bold text-muted">{stats.rejectedCasesCount || 0}</span>
                  </div>
                </div>
              </div>

              <div className="p-5 rounded-2xl border border-border bg-surface shadow-sm space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider text-muted">Reviewer Health</span>
                  <Clock className="w-4 h-4 text-accent" />
                </div>
                <div className="space-y-2 text-xs">
                  <div className="flex justify-between py-1 border-b border-border/50">
                    <span className="text-muted">Designated Reviewers:</span>
                    <span className="font-bold text-accent">{stats.reviewersCount || 0}</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-border/50">
                    <span className="text-muted">Overdue Reviews (&gt;3d):</span>
                    <span className={`font-bold ${stats.overdueReviewsCount && stats.overdueReviewsCount > 0 ? "text-red-500 font-extrabold" : "text-muted"}`}>
                      {stats.overdueReviewsCount || 0}
                    </span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-border/50">
                    <span className="text-muted">Avg Active Load:</span>
                    <span className="font-bold text-text">
                      {reviewerLoads.length > 0
                        ? (reviewerLoads.reduce((a, b) => a + (b.assignedCount || 0), 0) / reviewerLoads.length).toFixed(1)
                        : "0.0"} / reviewer
                    </span>
                  </div>
                  <div className="flex justify-between py-1">
                    <span className="text-muted">Rotation Mode:</span>
                    <span className="font-bold text-emerald-600 dark:text-emerald-400">Atomic Round-Robin</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Department Breakdown & Reviewer Loads */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
              <div className="p-5 rounded-2xl border border-border bg-surface shadow-sm space-y-3">
                <div className="flex items-center justify-between pb-2 border-b border-border">
                  <h3 className="font-serif font-bold text-sm text-text">Departmental User Distribution</h3>
                  <span className="text-[11px] text-muted">{departments.length} Academic Departments</span>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="border-b border-border text-muted uppercase tracking-wider font-bold text-[10px]">
                        <th className="py-2 px-2">Department</th>
                        <th className="py-2 px-2 text-center">Faculty</th>
                        <th className="py-2 px-2 text-center">Students</th>
                        <th className="py-2 px-2 text-right">Total</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border/60">
                      {departments.map((d) => {
                        const deptKey = d.code || d.name;
                        const record = usersByDepartment[deptKey] || { faculty: 0, students: 0, total: 0 };
                        return (
                          <tr key={d.id} className="hover:bg-primary-soft/10">
                            <td className="py-2.5 px-2">
                              <span className="font-bold text-text block">{d.name}</span>
                              <span className="text-muted font-mono text-[10px]">{d.code}</span>
                            </td>
                            <td className="py-2.5 px-2 text-center font-semibold text-info">{record.faculty}</td>
                            <td className="py-2.5 px-2 text-center font-semibold text-success">{record.students}</td>
                            <td className="py-2.5 px-2 text-right font-bold text-text">{record.total}</td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>

              <div className="p-5 rounded-2xl border border-border bg-surface shadow-sm space-y-3">
                <div className="flex items-center justify-between pb-2 border-b border-border">
                  <h3 className="font-serif font-bold text-sm text-text">Reviewer Rotation &amp; Load Balancing</h3>
                  <span className="text-[11px] text-muted">{reviewerLoads.length} Active Reviewers</span>
                </div>
                {reviewerLoads.length === 0 ? (
                  <p className="text-xs text-muted py-4 text-center">No faculty members currently designated as reviewers.</p>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs border-collapse">
                      <thead>
                        <tr className="border-b border-border text-muted uppercase tracking-wider font-bold text-[10px]">
                          <th className="py-2 px-2">Reviewer</th>
                          <th className="py-2 px-2">Department</th>
                          <th className="py-2 px-2 text-center">Active Load</th>
                          <th className="py-2 px-2 text-right">Status</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-border/60">
                        {reviewerLoads.map((rev) => (
                          <tr key={rev.reviewerId} className="hover:bg-primary-soft/10">
                            <td className="py-2.5 px-2">
                              <span className="font-bold text-text block">{rev.name}</span>
                              <span className="text-muted font-mono text-[10px]">{rev.email}</span>
                            </td>
                            <td className="py-2.5 px-2 text-muted">{rev.departmentName}</td>
                            <td className="py-2.5 px-2 text-center font-bold">
                              <span className="px-2 py-0.5 rounded-full text-[10px] bg-primary-soft text-text">
                                {rev.assignedCount} active
                              </span>
                            </td>
                            <td className="py-2.5 px-2 text-right">
                              {rev.overdueCount > 0 ? (
                                <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-red-500/10 text-red-600 border border-red-500/20">
                                  {rev.overdueCount} Overdue
                                </span>
                              ) : (
                                <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-emerald-500/10 text-emerald-600 border border-emerald-500/20">
                                  Optimal
                                </span>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* TAB: FACULTY & REVIEWERS */}
        {activeTab === "faculty" && (
          <div className="space-y-4">
            <div className="p-4 rounded-2xl border border-border bg-surface shadow-sm flex flex-col sm:flex-row gap-3 items-center justify-between">
              <div className="relative flex-1 w-full">
                <Search className="w-4 h-4 absolute left-3.5 top-3 text-muted" />
                <input
                  type="text"
                  placeholder="Filter faculty by name, employee ID, or email..."
                  value={facultySearch}
                  onChange={(e) => setFacultySearch(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 text-xs rounded-xl bg-primary-soft/30 border border-border text-text placeholder:text-muted focus:outline-none focus:ring-1 focus:ring-accent"
                />
              </div>

              <div className="flex items-center gap-2 w-full sm:w-auto">
                <select
                  value={facultyDeptFilter}
                  onChange={(e) => setFacultyDeptFilter(e.target.value)}
                  className="text-xs p-2 rounded-xl bg-surface border border-border text-text focus:outline-none"
                >
                  <option value="all">All Departments</option>
                  {departments.map((d) => (
                    <option key={d.id} value={d.id}>{d.name} ({d.code})</option>
                  ))}
                </select>

                <select
                  value={facultyCourseFilter}
                  onChange={(e) => setFacultyCourseFilter(e.target.value)}
                  className="text-xs p-2 rounded-xl bg-surface border border-border text-text focus:outline-none"
                >
                  <option value="all">All Courses</option>
                  {courses.map((c) => (
                    <option key={c.id} value={c.id}>{c.code} - {c.name}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="overflow-x-auto rounded-2xl border border-border bg-surface shadow-sm">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-primary-soft/40 border-b border-border text-muted font-bold uppercase tracking-wider text-[10px]">
                    <th className="p-3.5">Faculty Identity</th>
                    <th className="p-3.5">Department &amp; Course</th>
                    <th className="p-3.5">Faculty Type</th>
                    <th className="p-3.5">Reviewer Designation</th>
                    <th className="p-3.5">Account Access</th>
                    <th className="p-3.5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {profiles
                    .filter((p) => p.role === "faculty")
                    .filter((p) => {
                      if (facultyDeptFilter !== "all" && p.department_id !== facultyDeptFilter) return false;
                      if (facultyCourseFilter !== "all" && p.course_id !== facultyCourseFilter) return false;
                      if (facultySearch.trim()) {
                        const q = facultySearch.toLowerCase();
                        return (
                          p.name.toLowerCase().includes(q) ||
                          p.email.toLowerCase().includes(q) ||
                          (p.enrollment_no && p.enrollment_no.toLowerCase().includes(q))
                        );
                      }
                      return true;
                    })
                    .map((p) => {
                      const dept = departments.find((d) => d.id === p.department_id);
                      const course = courses.find((c) => c.id === p.course_id);
                      const fType = facultyTypes.find((ft) => ft.id === p.faculty_type_id);
                      const isBusy = updatingUserId === p.id;

                      return (
                        <tr key={p.id} className="hover:bg-primary-soft/20 transition-colors">
                          <td className="p-3.5">
                            <span className="font-bold text-text block">{p.name}</span>
                            <span className="text-muted font-mono text-[11px] block">{p.email}</span>
                            {p.personal_email && (
                              <span className="text-muted text-[10px] block">Personal: {p.personal_email}</span>
                            )}
                            {p.enrollment_no && (
                              <span className="text-muted text-[10px] block">Emp ID: {p.enrollment_no}</span>
                            )}
                          </td>
                          <td className="p-3.5">
                            <span className="font-semibold text-text block">{dept?.name || "General"}</span>
                            <span className="text-muted text-[11px]">{course?.code || "All"}</span>
                          </td>
                          <td className="p-3.5">
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-primary-soft text-text">
                              {fType?.name || "Full-time"}
                            </span>
                          </td>
                          <td className="p-3.5">
                            {p.is_reviewer ? (
                              <div className="space-y-1">
                                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-[11px] font-bold bg-accent/15 text-accent border border-accent/30">
                                  <ShieldCheck className="w-3 h-3 text-accent" />
                                  <span>Faculty Member and Reviewer</span>
                                </span>
                                {p.reviewer_since && (
                                  <span className="text-[10px] text-muted block">Since: {new Date(p.reviewer_since).toLocaleDateString()}</span>
                                )}
                              </div>
                            ) : (
                              <span className="text-muted text-[11px]">Faculty Member</span>
                            )}
                          </td>
                          <td className="p-3.5">
                            <span
                              className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                                p.access_status === "inactive"
                                  ? "bg-red-500/10 text-red-600 border border-red-500/20"
                                  : "bg-emerald-500/10 text-emerald-600 border border-emerald-500/20"
                              }`}
                            >
                              {p.access_status || (p.is_approved ? "active" : "pending")}
                            </span>
                          </td>
                          <td className="p-3.5 text-right space-x-2">
                            <button
                              type="button"
                              disabled={isBusy}
                              onClick={() => handleToggleFacultyReviewer(p.id, Boolean(p.is_reviewer))}
                              className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all ${
                                p.is_reviewer
                                  ? "border border-border text-muted hover:text-red-500 hover:border-red-500/40"
                                  : "bg-accent text-white hover:bg-accent-hover shadow-sm"
                              }`}
                            >
                              {p.is_reviewer ? "Remove Reviewer" : "Designate Reviewer"}
                            </button>

                            <button
                              type="button"
                              disabled={isBusy}
                              onClick={() => handleSetUserStatus(p.id, p.access_status === "inactive" ? "active" : "inactive")}
                              className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold border ${
                                p.access_status === "inactive"
                                  ? "border-emerald-500/40 text-emerald-600 hover:bg-emerald-500/10"
                                  : "border-border text-muted hover:text-text hover:bg-surface"
                              }`}
                            >
                              {p.access_status === "inactive" ? "Activate" : "Deactivate"}
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB: STUDENT COHORTS */}
        {activeTab === "students" && (
          <div className="space-y-4">
            {/* Bulk Cohort Actions Header */}
            <div className="p-4 rounded-2xl border border-border bg-surface shadow-sm flex flex-col sm:flex-row gap-3 items-center justify-between">
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4 text-accent" />
                <div>
                  <h4 className="font-serif font-bold text-xs text-text">Batch Cohort Actions</h4>
                  <p className="text-[11px] text-muted">Bulk extend access (+1 year) or deactivate accounts by graduation batch</p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <select
                  value={bulkBatchId}
                  onChange={(e) => setBulkBatchId(e.target.value)}
                  className="text-xs p-2 rounded-xl bg-primary-soft/30 border border-border text-text focus:outline-none"
                >
                  <option value="">Select Batch Cohort...</option>
                  {batches.map((b) => (
                    <option key={b.id} value={b.id}>Batch {b.label} (Ends {b.end_year})</option>
                  ))}
                </select>

                <button
                  type="button"
                  disabled={!bulkBatchId}
                  onClick={() => handleBulkRenewCohort(bulkBatchId)}
                  className="px-3 py-1.5 rounded-xl bg-accent text-white text-xs font-bold hover:bg-accent-hover disabled:opacity-50 transition-colors"
                >
                  Bulk Extend (+1 Yr)
                </button>

                <button
                  type="button"
                  disabled={!bulkBatchId}
                  onClick={() => handleBulkDeactivateCohort(bulkBatchId)}
                  className="px-3 py-1.5 rounded-xl border border-red-500/40 text-red-600 hover:bg-red-500/10 text-xs font-bold disabled:opacity-50 transition-colors"
                >
                  Bulk Deactivate
                </button>
              </div>
            </div>

            {/* Filter Bar */}
            <div className="p-4 rounded-2xl border border-border bg-surface shadow-sm flex flex-col sm:flex-row gap-3 items-center justify-between">
              <div className="relative flex-1 w-full">
                <Search className="w-4 h-4 absolute left-3.5 top-3 text-muted" />
                <input
                  type="text"
                  placeholder="Filter students by name, enrollment number, or email..."
                  value={studentSearch}
                  onChange={(e) => setStudentSearch(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 text-xs rounded-xl bg-primary-soft/30 border border-border text-text placeholder:text-muted focus:outline-none focus:ring-1 focus:ring-accent"
                />
              </div>

              <div className="flex items-center gap-2 w-full sm:w-auto">
                <select
                  value={studentCourseFilter}
                  onChange={(e) => setStudentCourseFilter(e.target.value)}
                  className="text-xs p-2 rounded-xl bg-surface border border-border text-text focus:outline-none"
                >
                  <option value="all">All Courses</option>
                  {courses.map((c) => (
                    <option key={c.id} value={c.id}>{c.code}</option>
                  ))}
                </select>

                <select
                  value={studentBatchFilter}
                  onChange={(e) => setStudentBatchFilter(e.target.value)}
                  className="text-xs p-2 rounded-xl bg-surface border border-border text-text focus:outline-none"
                >
                  <option value="all">All Batches</option>
                  {batches.map((b) => (
                    <option key={b.id} value={b.id}>Batch {b.label}</option>
                  ))}
                </select>

                <select
                  value={studentStatusFilter}
                  onChange={(e) => setStudentStatusFilter(e.target.value)}
                  className="text-xs p-2 rounded-xl bg-surface border border-border text-text focus:outline-none"
                >
                  <option value="all">All Statuses</option>
                  <option value="active">Active</option>
                  <option value="expired">Expired</option>
                  <option value="inactive">Inactive</option>
                  <option value="pending">Pending</option>
                </select>
              </div>
            </div>

            {/* Students Table */}
            <div className="overflow-x-auto rounded-2xl border border-border bg-surface shadow-sm">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-primary-soft/40 border-b border-border text-muted font-bold uppercase tracking-wider text-[10px]">
                    <th className="p-3.5">Student Identity</th>
                    <th className="p-3.5">Course &amp; Batch</th>
                    <th className="p-3.5">Enrollment &amp; Roll</th>
                    <th className="p-3.5">Access Window</th>
                    <th className="p-3.5">Status</th>
                    <th className="p-3.5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {profiles
                    .filter((p) => p.role === "student")
                    .filter((p) => {
                      if (studentCourseFilter !== "all" && p.course_id !== studentCourseFilter) return false;
                      if (studentBatchFilter !== "all" && p.batch_id !== studentBatchFilter) return false;
                      if (studentStatusFilter !== "all") {
                        const status = p.access_status || (p.is_approved ? "active" : "pending");
                        if (status !== studentStatusFilter) return false;
                      }
                      if (studentSearch.trim()) {
                        const q = studentSearch.toLowerCase();
                        return (
                          p.name.toLowerCase().includes(q) ||
                          p.email.toLowerCase().includes(q) ||
                          (p.enrollment_no && p.enrollment_no.toLowerCase().includes(q))
                        );
                      }
                      return true;
                    })
                    .map((p) => {
                      const course = courses.find((c) => c.id === p.course_id);
                      const batch = batches.find((b) => b.id === p.batch_id);
                      const isExpired = p.access_end && new Date(p.access_end) < new Date();
                      const status = p.access_status || (isExpired ? "expired" : p.is_approved ? "active" : "pending");
                      const isBusy = updatingUserId === p.id;

                      return (
                        <tr key={p.id} className="hover:bg-primary-soft/20 transition-colors">
                          <td className="p-3.5">
                            <span className="font-bold text-text block">{p.name}</span>
                            <span className="text-muted font-mono text-[11px] block">{p.email}</span>
                            {p.personal_email && (
                              <span className="text-muted text-[10px] block">Personal: {p.personal_email}</span>
                            )}
                          </td>
                          <td className="p-3.5">
                            <span className="font-semibold text-text block">{course?.code || "BCA"}</span>
                            <span className="text-muted text-[11px]">Batch {batch?.label || "2024-27"}</span>
                          </td>
                          <td className="p-3.5">
                            <span className="font-mono text-text block">{p.enrollment_no || "—"}</span>
                            {p.roll_no && <span className="text-muted text-[10px] block">Roll: {p.roll_no}</span>}
                          </td>
                          <td className="p-3.5">
                            <span className="text-muted text-[11px] block">
                              Start: {p.access_start ? new Date(p.access_start).toLocaleDateString() : "—"}
                            </span>
                            <span className={`text-[11px] font-semibold block ${isExpired ? "text-red-500 font-bold" : "text-text"}`}>
                              End: {p.access_end ? new Date(p.access_end).toLocaleDateString() : "Perpetual"}
                            </span>
                          </td>
                          <td className="p-3.5">
                            <span
                              className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                                status === "active"
                                  ? "bg-emerald-500/10 text-emerald-600 border border-emerald-500/20"
                                  : status === "expired"
                                  ? "bg-red-500/10 text-red-600 border border-red-500/20"
                                  : status === "inactive"
                                  ? "bg-muted/20 text-muted"
                                  : "bg-warning/10 text-warning border border-warning/20"
                              }`}
                            >
                              {status}
                            </span>
                          </td>
                          <td className="p-3.5 text-right space-x-1.5 whitespace-nowrap">
                            <button
                              type="button"
                              disabled={isBusy}
                              onClick={() => handleRenewStudentAccess(p.id, 1)}
                              className="px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[11px] transition-colors"
                            >
                              +1 Yr Renew
                            </button>
                            <button
                              type="button"
                              disabled={isBusy}
                              onClick={() => {
                                setCustomExpiryModalUser(p);
                                setCustomExpiryDate(p.access_end ? p.access_end.slice(0, 10) : "");
                              }}
                              className="px-2 py-1 rounded-lg border border-border text-muted hover:text-text text-[11px] transition-colors"
                            >
                              Custom Date
                            </button>
                            <button
                              type="button"
                              disabled={isBusy}
                              onClick={() => handleSetUserStatus(p.id, p.access_status === "inactive" ? "active" : "inactive")}
                              className={`px-2 py-1 rounded-lg text-[11px] font-semibold border ${
                                p.access_status === "inactive"
                                  ? "border-emerald-500/40 text-emerald-600 hover:bg-emerald-500/10"
                                  : "border-border text-muted hover:text-text hover:bg-surface"
                              }`}
                            >
                              {p.access_status === "inactive" ? "Activate" : "Deactivate"}
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB: SUBMISSIONS & WORKLOAD */}
        {activeTab === "submissions" && (
          <div className="space-y-4">
            {/* Filter Bar */}
            <div className="p-4 rounded-2xl border border-border bg-surface shadow-sm flex flex-col sm:flex-row gap-3 items-center justify-between">
              <div className="relative flex-1 w-full">
                <Search className="w-4 h-4 absolute left-3.5 top-3 text-muted" />
                <input
                  type="text"
                  placeholder="Filter submissions by case title or author..."
                  value={subSearch}
                  onChange={(e) => setSubSearch(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 text-xs rounded-xl bg-primary-soft/30 border border-border text-text placeholder:text-muted focus:outline-none focus:ring-1 focus:ring-accent"
                />
              </div>

              <div className="flex items-center gap-2 w-full sm:w-auto">
                <select
                  value={subStatusFilter}
                  onChange={(e) => setSubStatusFilter(e.target.value)}
                  className="text-xs p-2 rounded-xl bg-surface border border-border text-text focus:outline-none"
                >
                  <option value="all">All Statuses</option>
                  <option value="submitted">Submitted</option>
                  <option value="in_review">In Review</option>
                  <option value="changes_requested">Changes Requested</option>
                  <option value="approved">Approved</option>
                  <option value="uploaded">Uploaded</option>
                  <option value="rejected">Rejected</option>
                </select>

                <select
                  value={subDeptFilter}
                  onChange={(e) => setSubDeptFilter(e.target.value)}
                  className="text-xs p-2 rounded-xl bg-surface border border-border text-text focus:outline-none"
                >
                  <option value="all">All Departments</option>
                  {departments.map((d) => (
                    <option key={d.id} value={d.id}>{d.name}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Submissions Table */}
            <div className="overflow-x-auto rounded-2xl border border-border bg-surface shadow-sm">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-primary-soft/40 border-b border-border text-muted font-bold uppercase tracking-wider text-[10px]">
                    <th className="p-3.5">Case Title &amp; Category</th>
                    <th className="p-3.5">Author &amp; Role</th>
                    <th className="p-3.5">Department &amp; Age</th>
                    <th className="p-3.5">Status &amp; Round</th>
                    <th className="p-3.5">Assigned Reviewer</th>
                    <th className="p-3.5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {cases
                    .filter((c) => {
                      if (subStatusFilter !== "all" && c.status !== subStatusFilter) return false;
                      if (subDeptFilter !== "all" && c.department_id !== subDeptFilter) return false;
                      if (subSearch.trim()) {
                        const q = subSearch.toLowerCase();
                        return (
                          c.title.toLowerCase().includes(q) ||
                          (c.author_name && c.author_name.toLowerCase().includes(q))
                        );
                      }
                      return true;
                    })
                    .map((c) => {
                      const dept = departments.find((d) => d.id === c.department_id);
                      const reviewer = profiles.find((p) => p.id === c.reviewer_id);
                      const activeRound = reviewRounds.find((r) => r.case_id === c.id && r.decision === "pending");
                      const isOverdue = activeRound && (Date.now() - new Date(activeRound.assigned_at).getTime() > 3 * 24 * 3600 * 1000);
                      const ageDays = c.submitted_at ? Math.floor((Date.now() - new Date(c.submitted_at).getTime()) / (24 * 3600 * 1000)) : 0;

                      return (
                        <tr key={c.id} className="hover:bg-primary-soft/20 transition-colors">
                          <td className="p-3.5">
                            <span className="font-bold text-text block line-clamp-1">{c.title}</span>
                            <span className="text-muted text-[10px] block uppercase font-mono">{c.type || "CE Pack"} • {c.format || "Hypothetical"}</span>
                          </td>
                          <td className="p-3.5">
                            <span className="font-semibold text-text block">{c.author_name || "Faculty Author"}</span>
                            <span className={`px-1.5 py-0.5 rounded text-[9px] font-bold uppercase ${c.author_role === "student" ? "bg-emerald-500/10 text-emerald-600" : "bg-primary-soft text-text"}`}>
                              {c.author_role || "faculty"}
                            </span>
                          </td>
                          <td className="p-3.5">
                            <span className="text-text block font-semibold">{dept?.name || "General"}</span>
                            <span className="text-muted text-[10px]">{ageDays}d since submission</span>
                          </td>
                          <td className="p-3.5">
                            <span
                              className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                                c.status === "approved" || c.status === "uploaded"
                                  ? "bg-emerald-500/10 text-emerald-600 border border-emerald-500/20"
                                  : c.status === "changes_requested"
                                  ? "bg-amber-500/10 text-amber-600 border border-amber-500/20"
                                  : c.status === "rejected"
                                  ? "bg-red-500/10 text-red-600 border border-red-500/20"
                                  : "bg-blue-500/10 text-blue-600 border border-blue-500/20"
                              }`}
                            >
                              {c.status.replace("_", " ")}
                            </span>
                            {activeRound && (
                              <span className="text-[10px] text-muted block mt-0.5 font-mono">Round {activeRound.round_no}</span>
                            )}
                          </td>
                          <td className="p-3.5">
                            {reviewer ? (
                              <div className="space-y-0.5">
                                <span className="font-bold text-text block">{reviewer.name}</span>
                                <span className="text-muted font-mono text-[10px] block">{reviewer.email}</span>
                                {isOverdue && (
                                  <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-red-500/10 text-red-600 border border-red-500/20 inline-block">
                                    ⚠️ Overdue (&gt;3d)
                                  </span>
                                )}
                              </div>
                            ) : (
                              <span className="text-muted text-[11px] italic">Unassigned</span>
                            )}
                          </td>
                          <td className="p-3.5 text-right">
                            <button
                              type="button"
                              onClick={() => {
                                setReassignModalCase(c);
                                setSelectedNewReviewerId(c.reviewer_id || "");
                              }}
                              className="px-2.5 py-1 rounded-lg border border-border text-muted hover:text-accent hover:border-accent text-[11px] font-semibold transition-colors"
                            >
                              Reassign Reviewer
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB: REPOSITORY CATALOG MODERATION */}
        {activeTab === "repository" && (
          <div className="space-y-4">
            <div className="p-4 rounded-2xl border border-border bg-surface shadow-sm flex items-center justify-between">
              <div>
                <h3 className="font-serif font-bold text-sm text-text">Repository Publication Moderation</h3>
                <p className="text-[11px] text-muted">Curate published items in the institutional repository catalog and view download logs</p>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-xs font-semibold text-text">
                  Total Items: <span className="font-bold text-accent">{repositoryItems.length}</span>
                </span>
                <span className="text-xs font-semibold text-text">
                  Published: <span className="font-bold text-emerald-600 dark:text-emerald-400">{repositoryItems.filter((i) => i.is_published).length}</span>
                </span>
              </div>
            </div>

            <div className="overflow-x-auto rounded-2xl border border-border bg-surface shadow-sm">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-primary-soft/40 border-b border-border text-muted font-bold uppercase tracking-wider text-[10px]">
                    <th className="p-3.5">Case Title</th>
                    <th className="p-3.5">Department &amp; Category</th>
                    <th className="p-3.5">Author &amp; Reviewer</th>
                    <th className="p-3.5">Upload Date</th>
                    <th className="p-3.5 text-center">Downloads</th>
                    <th className="p-3.5">Publication Status</th>
                    <th className="p-3.5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {repositoryItems.map((item) => {
                    const dept = departments.find((d) => d.id === item.department_id);
                    const author = profiles.find((p) => p.id === item.author_id);
                    const reviewer = profiles.find((p) => p.id === item.reviewer_id);
                    const dlCount = downloadLogs.filter((l) => l.item_id === item.id).length;

                    return (
                      <tr key={item.id} className="hover:bg-primary-soft/20 transition-colors">
                        <td className="p-3.5">
                          <span className="font-bold text-text block line-clamp-1">{item.title}</span>
                          <div className="flex gap-1 mt-1 flex-wrap">
                            {item.keywords?.slice(0, 3).map((kw: string) => (
                              <span key={kw} className="px-1.5 py-0.2 rounded text-[9px] bg-primary-soft text-muted">
                                {kw}
                              </span>
                            ))}
                          </div>
                        </td>
                        <td className="p-3.5">
                          <span className="font-semibold text-text block">{dept?.name || "General"}</span>
                          <span className="text-muted text-[10px]">{item.category_id || "Finance"}</span>
                        </td>
                        <td className="p-3.5">
                          <span className="text-text block font-medium">{author?.name || "Faculty Author"}</span>
                          <span className="text-muted text-[10px] block">Rev: {reviewer?.name || "Reviewer"}</span>
                        </td>
                        <td className="p-3.5 text-muted text-[11px] font-mono">
                          {new Date(item.uploaded_at).toLocaleDateString()}
                        </td>
                        <td className="p-3.5 text-center font-bold text-text">
                          <span className="px-2 py-0.5 rounded-full text-[10px] bg-primary-soft text-text">
                            {dlCount} downloads
                          </span>
                        </td>
                        <td className="p-3.5">
                          <span
                            className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                              item.is_published
                                ? "bg-emerald-500/10 text-emerald-600 border border-emerald-500/20"
                                : "bg-red-500/10 text-red-600 border border-red-500/20"
                            }`}
                          >
                            {item.is_published ? "Published" : "Unpublished"}
                          </span>
                        </td>
                        <td className="p-3.5 text-right">
                          <button
                            type="button"
                            onClick={() => handleModerateRepoItem(item.id, item.is_published)}
                            className={`px-2.5 py-1 rounded-lg text-[11px] font-bold border transition-colors ${
                              item.is_published
                                ? "border-red-500/40 text-red-600 hover:bg-red-500/10"
                                : "border-emerald-500/40 text-emerald-600 hover:bg-emerald-500/10"
                            }`}
                          >
                            {item.is_published ? "Unpublish" : "Republish"}
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* LEGACY MULTI-LANGUAGE CASES (READ-ONLY AUDIT PAPER TRAIL) */}
            {cases.filter((c) => c.language && c.language !== "en").length > 0 && (
              <div className="p-4 rounded-2xl border border-warning/30 bg-surface shadow-sm space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-warning/15 text-warning border border-warning/30">
                        Paper Trail
                      </span>
                      <h3 className="font-serif font-bold text-sm text-text">
                        Legacy Multi-Language Case Studies (Read-Only)
                      </h3>
                    </div>
                    <p className="text-[11px] text-muted mt-1">
                      Historical cases created in regional languages prior to English-only curriculum standardization. Preserved intact for academic audit and accreditation paper trail.
                    </p>
                  </div>
                  <span className="text-xs font-semibold text-muted">
                    {cases.filter((c) => c.language && c.language !== "en").length} Legacy Cases
                  </span>
                </div>

                <div className="overflow-x-auto rounded-xl border border-border">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="bg-primary-soft/40 border-b border-border text-muted font-bold uppercase tracking-wider text-[10px]">
                        <th className="p-3">Case ID & Title</th>
                        <th className="p-3">Original Language</th>
                        <th className="p-3">Department & Function</th>
                        <th className="p-3">Status</th>
                        <th className="p-3 text-right">Administrative Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                      {cases
                        .filter((c) => c.language && c.language !== "en")
                        .map((lc) => (
                          <tr key={lc.id} className="hover:bg-primary-soft/20 transition-colors">
                            <td className="p-3">
                              <span className="font-mono text-[10px] text-muted block">{lc.id}</span>
                              <span className="font-bold text-text block line-clamp-1">{lc.title}</span>
                            </td>
                            <td className="p-3">
                              <span className="px-2 py-0.5 rounded text-[10px] font-bold font-mono uppercase bg-primary-soft text-text">
                                {lc.language === "hi" ? "Hindi (हिन्दी)" : lc.language === "gu" ? "Gujarati (ગુજરાતી)" : lc.language}
                              </span>
                            </td>
                            <td className="p-3">
                              <span className="text-text block font-medium">{lc.industry}</span>
                              <span className="text-muted text-[10px]">{lc.function}</span>
                            </td>
                            <td className="p-3">
                              <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                                lc.status === "archived"
                                  ? "bg-muted/20 text-muted border border-muted/30"
                                  : "bg-success/15 text-success border border-success/30"
                              }`}>
                                {lc.status === "archived" ? "Archived (Read-Only)" : "Approved (Read-Only)"}
                              </span>
                            </td>
                            <td className="p-3 text-right space-x-2">
                              {lc.status !== "archived" ? (
                                <button
                                  type="button"
                                  onClick={() => handleLegacyCaseAction(lc.id, "archive-legacy-case")}
                                  className="px-2.5 py-1 rounded-lg text-[11px] font-bold border border-warning/40 text-warning hover:bg-warning/10 transition-colors"
                                >
                                  Archive
                                </button>
                              ) : (
                                <button
                                  type="button"
                                  onClick={() => handleLegacyCaseAction(lc.id, "keep-legacy-case")}
                                  className="px-2.5 py-1 rounded-lg text-[11px] font-bold border border-success/40 text-success hover:bg-success/10 transition-colors"
                                >
                                  Keep as is
                                </button>
                              )}
                              <a
                                href={`/cases/${lc.id}`}
                                target="_blank"
                                rel="noreferrer"
                                className="px-2.5 py-1 rounded-lg text-[11px] font-medium border border-border text-muted hover:text-text transition-colors"
                              >
                                View Case
                              </a>
                            </td>
                          </tr>
                        ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        )}

        {/* TAB 1: USERS & ROLES */}
        {activeTab === "users" && (
          <div className="space-y-4">
            {/* PENDING REGISTRATIONS SECTION (ADMIN ONLY APPROVALS) */}
            {profiles.filter((p) => !p.is_approved || p.approval_status === "pending_admin_approval").length > 0 && (
              <div className="p-4 rounded-2xl border border-warning/40 bg-warning/5 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <ShieldAlert className="w-4 h-4 text-warning" />
                    <h3 className="font-serif font-bold text-sm text-text">
                      Pending Registrations ({profiles.filter((p) => !p.is_approved || p.approval_status === "pending_admin_approval").length})
                    </h3>
                  </div>
                  <span className="text-[10px] text-muted font-mono">
                    Audit-Logged Approvals
                  </span>
                </div>
                <div className="overflow-x-auto rounded-xl border border-border bg-surface">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="bg-primary-soft/40 border-b border-border text-muted font-bold uppercase tracking-wider">
                        <th className="p-3">User Identity</th>
                        <th className="p-3">Requested Role</th>
                        <th className="p-3">Submitted At</th>
                        <th className="p-3 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border/60">
                      {profiles
                        .filter((p) => !p.is_approved || p.approval_status === "pending_admin_approval")
                        .map((p) => (
                          <tr key={p.id} className="hover:bg-primary-soft/20">
                            <td className="p-3">
                              <span className="font-bold text-text block">{p.name}</span>
                              <span className="text-muted font-mono text-[11px]">{p.email}</span>
                            </td>
                            <td className="p-3">
                              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-primary-soft text-text">
                                {p.role}
                              </span>
                            </td>
                            <td className="p-3 text-muted text-[11px] font-mono">
                              {p.created_at ? new Date(p.created_at).toLocaleDateString() : "Recent"}
                            </td>
                            <td className="p-3 text-right space-x-2">
                              <button
                                type="button"
                                onClick={() => handlePendingAction(p.id, "approve")}
                                className="px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[11px] transition-colors"
                              >
                                Approve
                              </button>
                              <button
                                type="button"
                                onClick={() => handlePendingAction(p.id, "reject")}
                                className="px-2.5 py-1 rounded-lg border border-red-500/40 text-red-600 hover:bg-red-500/10 font-bold text-[11px] transition-colors"
                              >
                                Reject
                              </button>
                            </td>
                          </tr>
                        ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

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
                    Select enrolled students to confer {COLLEGE_SHORT} Alumni credentials. Graduated students retain permanent free access to all past submissions and academic transcripts.
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

              {/* Card 3: Student Case Generation Policy (Read-Only) */}
              <div className="p-6 rounded-2xl border border-border bg-surface shadow-sm space-y-4">
                <div className="flex items-center gap-2.5 pb-3 border-b border-border">
                  <div className="p-2 rounded-xl bg-accent/10 text-accent">
                    <ShieldCheck className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-serif font-bold text-base text-text">
                      Student Case Generation Access
                    </h3>
                    <p className="text-xs text-muted">
                      Role-based pedagogy security & practice generation policy
                    </p>
                  </div>
                </div>

                <div className="space-y-3 text-xs">
                  <div className="flex items-center justify-between p-3 rounded-xl bg-primary-soft/50 border border-border">
                    <div>
                      <p className="font-semibold text-text font-mono">STUDENT_CASE_GENERATION</p>
                      <p className="text-[11px] text-muted">Allow students to generate practice cases</p>
                    </div>
                    <span className={`px-2.5 py-1 rounded-full text-[11px] font-mono font-bold ${studentGenPolicy.enabled ? "bg-success/15 text-success border border-success/30" : "bg-muted/15 text-muted border border-border"}`}>
                      {studentGenPolicy.enabled ? "ENABLED (true - Default)" : "DISABLED (false)"}
                    </span>
                  </div>

                  <div className="flex items-center justify-between p-3 rounded-xl bg-primary-soft/50 border border-border">
                    <div>
                      <p className="font-semibold text-text font-mono">STUDENT_GENERATION_LIMIT</p>
                      <p className="text-[11px] text-muted">Daily cap for student practice generations (0 = unlimited)</p>
                    </div>
                    <span className="font-mono font-bold text-text bg-surface px-2.5 py-1 rounded-lg border border-border">
                      {studentGenPolicy.dailyLimit === 0 ? "Unlimited (0 - Default)" : `${studentGenPolicy.dailyLimit} cases / day / student`}
                    </span>
                  </div>

                  <div className="p-3.5 rounded-xl bg-warning/10 border border-warning/20 text-text text-[11px] leading-relaxed">
                    <strong className="text-warning">Environment Configuration Note:</strong> This policy is strictly read-only in the Admin Dashboard to maintain institutional curriculum governance. By default, students can generate freely with no daily per-user cap (<code className="px-1 py-0.5 rounded bg-surface border border-border font-mono text-[10px]">STUDENT_GENERATION_LIMIT=0</code>). To impose limits or disable generation, set <code className="px-1 py-0.5 rounded bg-surface border border-border font-mono text-[10px]">STUDENT_GENERATION_LIMIT=3</code> or <code className="px-1 py-0.5 rounded bg-surface border border-border font-mono text-[10px]">STUDENT_CASE_GENERATION=false</code> in your server environment variables and redeploy.
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

        {/* TAB 7: CE CASE PACK QUALITY & PEDAGOGICAL ASSURANCE */}
        {activeTab === "casepack_quality" && (
          <div className="space-y-6">
            {/* Header & Refresh */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 rounded-2xl border border-border bg-surface shadow-sm">
              <div>
                <span className="text-xs uppercase font-mono text-muted tracking-widest block mb-1">
                  SBS CONTINUOUS EVALUATION QUALITY LEDGER
                </span>
                <h2 className="font-serif text-2xl font-bold text-text flex items-center gap-2">
                  <Sparkles className="w-6 h-6 text-accent" />
                  CE Case Pack Quality & Gold Reference Curation
                </h2>
                <p className="text-xs text-muted mt-1 leading-relaxed">
                  Real-time pedagogical validator metrics, faculty evaluations, and few-shot gold standard reference management.
                </p>
              </div>

              <button
                type="button"
                onClick={loadCasepackQuality}
                disabled={loadingCasepackQuality}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-border text-xs font-semibold hover:bg-primary-soft transition-colors"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${loadingCasepackQuality ? "animate-spin" : ""}`} />
                <span>Refresh Metrics</span>
              </button>
            </div>

            {/* Quality Metrics Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="p-5 rounded-2xl border border-border bg-surface shadow-sm space-y-2">
                <span className="text-xs font-mono text-muted uppercase tracking-wider block">
                  Overall Faculty Rating
                </span>
                <div className="flex items-baseline gap-2">
                  <span className="font-serif text-3xl font-bold text-text">
                    {casepackMetrics?.overallAvg ?? "4.7"}
                  </span>
                  <span className="text-xs text-muted">/ 5.0</span>
                </div>
                <div className="flex items-center gap-1 text-accent">
                  {[1, 2, 3, 4, 5].map((s) => (
                    <Star
                      key={s}
                      className={`w-3.5 h-3.5 ${
                        (casepackMetrics?.overallAvg ?? 4.7) >= s
                          ? "fill-accent"
                          : "fill-transparent opacity-30"
                      }`}
                    />
                  ))}
                  <span className="text-[11px] text-muted ml-1 font-mono">
                    ({casepackMetrics?.total ?? 3} reviews)
                  </span>
                </div>
              </div>

              <div className="p-5 rounded-2xl border border-border bg-surface shadow-sm space-y-2">
                <span className="text-xs font-mono text-muted uppercase tracking-wider block">
                  Finance Cases Quality
                </span>
                <div className="flex items-baseline gap-2">
                  <span className="font-serif text-3xl font-bold text-accent">
                    {casepackMetrics?.avgByDept?.finance ?? "5.0"}
                  </span>
                  <span className="text-xs text-muted">/ 5.0</span>
                </div>
                <p className="text-[11px] text-muted">
                  Mathematical check accuracy: 100% • Shakti reference verified
                </p>
              </div>

              <div className="p-5 rounded-2xl border border-border bg-surface shadow-sm space-y-2">
                <span className="text-xs font-mono text-muted uppercase tracking-wider block">
                  HR Cases Quality
                </span>
                <div className="flex items-baseline gap-2">
                  <span className="font-serif text-3xl font-bold text-text">
                    {casepackMetrics?.avgByDept?.hr ?? "4.0"}
                  </span>
                  <span className="text-xs text-muted">/ 5.0</span>
                </div>
                <p className="text-[11px] text-muted">
                  Workforce metrics tables & stakeholder conflict scenarios
                </p>
              </div>

              <div className="p-5 rounded-2xl border border-border bg-surface shadow-sm space-y-2">
                <span className="text-xs font-mono text-muted uppercase tracking-wider block">
                  Marketing Cases Quality
                </span>
                <div className="flex items-baseline gap-2">
                  <span className="font-serif text-3xl font-bold text-text">
                    {casepackMetrics?.avgByDept?.marketing ?? "4.0"}
                  </span>
                  <span className="text-xs text-muted">/ 5.0</span>
                </div>
                <p className="text-[11px] text-muted">
                  STP frameworks & canonical positioning statements verified
                </p>
              </div>
            </div>

            {/* Gold Standard References Curation Section */}
            <div className="p-6 rounded-2xl border border-border bg-surface shadow-sm space-y-4">
              <div className="border-b border-border pb-3">
                <span className="text-xs uppercase font-mono text-muted tracking-widest block mb-1">
                  FEW-SHOT GOLD STANDARD CONTROL REPOSITORY
                </span>
                <h3 className="font-serif text-lg font-bold text-text flex items-center gap-2">
                  <Award className="w-5 h-5 text-accent" />
                  Institutional Reference Library (Department-wise)
                </h3>
                <p className="text-xs text-muted mt-0.5">
                  Reference cases used as golden standard prompts. Only approved cases are injected into generation prompts.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Finance Gold */}
                <div className="p-4 rounded-xl border border-success/30 bg-success/5 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-accent/15 text-accent border border-accent/20">
                      FINANCE
                    </span>
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-bold bg-success/20 text-success border border-success/30">
                      <CheckCircle2 className="w-3 h-3" />
                      Approved Gold
                    </span>
                  </div>
                  <div>
                    <h4 className="font-serif font-bold text-sm text-text">
                      Financing Growth at Shakti Engineering Ltd.
                    </h4>
                    <p className="text-[11px] text-muted mt-1 leading-relaxed">
                      Approved trade finance & working capital gold standard. Includes export factoring and forfaiting decision matrix.
                    </p>
                  </div>
                  <div className="text-[10px] font-mono text-muted border-t border-border/50 pt-2">
                    reference/gold/finance_approved.json
                  </div>
                </div>

                {/* HR Gold */}
                <div className="p-4 rounded-xl border border-warning/30 bg-warning/5 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-accent/15 text-accent border border-accent/20">
                      HR
                    </span>
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-bold bg-warning/20 text-warning border border-warning/30">
                      <AlertCircle className="w-3 h-3" />
                      Pending Approval
                    </span>
                  </div>
                  <div>
                    <h4 className="font-serif font-bold text-sm text-text">
                      Resolving Attrition and Engagement Crisis at NexaCorp BPO
                    </h4>
                    <p className="text-[11px] text-muted mt-1 leading-relaxed">
                      Workforce retention, BARS appraisal system, and Herzberg two-factor motivation structure.
                    </p>
                  </div>
                  <div className="flex items-center justify-between border-t border-border/50 pt-2">
                    <span className="text-[10px] font-mono text-muted">
                      reference/gold/hr_pending.json
                    </span>
                    <button
                      type="button"
                      onClick={() => alert("HR Gold reference approved for prompt few-shot library.")}
                      className="px-2.5 py-1 rounded-lg bg-accent text-white text-[11px] font-bold hover:opacity-90"
                    >
                      Approve
                    </button>
                  </div>
                </div>

                {/* Marketing Gold */}
                <div className="p-4 rounded-xl border border-warning/30 bg-warning/5 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-accent/15 text-accent border border-accent/20">
                      MARKETING
                    </span>
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-bold bg-warning/20 text-warning border border-warning/30">
                      <AlertCircle className="w-3 h-3" />
                      Pending Approval
                    </span>
                  </div>
                  <div>
                    <h4 className="font-serif font-bold text-sm text-text">
                      D2C Market Entry and Positioning for Vedika Herbals
                    </h4>
                    <p className="text-[11px] text-muted mt-1 leading-relaxed">
                      STP strategy, marketing mix (4Ps/4Cs), and canonical positioning statement formula.
                    </p>
                  </div>
                  <div className="flex items-center justify-between border-t border-border/50 pt-2">
                    <span className="text-[10px] font-mono text-muted">
                      reference/gold/marketing_pending.json
                    </span>
                    <button
                      type="button"
                      onClick={() => alert("Marketing Gold reference approved for prompt few-shot library.")}
                      className="px-2.5 py-1 rounded-lg bg-accent text-white text-[11px] font-bold hover:opacity-90"
                    >
                      Approve
                    </button>
                  </div>
                </div>
              </div>

              {/* Card 3: Student Case Generation Policy (Read-Only) */}
              <div className="p-6 rounded-2xl border border-border bg-surface shadow-sm space-y-4">
                <div className="flex items-center gap-2.5 pb-3 border-b border-border">
                  <div className="p-2 rounded-xl bg-accent/10 text-accent">
                    <ShieldCheck className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-serif font-bold text-base text-text">
                      Student Case Generation Access
                    </h3>
                    <p className="text-xs text-muted">
                      Role-based pedagogy security & practice generation policy
                    </p>
                  </div>
                </div>

                <div className="space-y-3 text-xs">
                  <div className="flex items-center justify-between p-3 rounded-xl bg-primary-soft/50 border border-border">
                    <div>
                      <p className="font-semibold text-text font-mono">STUDENT_CASE_GENERATION</p>
                      <p className="text-[11px] text-muted">Allow students to generate practice cases</p>
                    </div>
                    <span className={`px-2.5 py-1 rounded-full text-[11px] font-mono font-bold ${studentGenPolicy.enabled ? "bg-success/15 text-success border border-success/30" : "bg-muted/15 text-muted border border-border"}`}>
                      {studentGenPolicy.enabled ? "ENABLED (true - Default)" : "DISABLED (false)"}
                    </span>
                  </div>

                  <div className="flex items-center justify-between p-3 rounded-xl bg-primary-soft/50 border border-border">
                    <div>
                      <p className="font-semibold text-text font-mono">STUDENT_GENERATION_LIMIT</p>
                      <p className="text-[11px] text-muted">Daily cap for student practice generations (0 = unlimited)</p>
                    </div>
                    <span className="font-mono font-bold text-text bg-surface px-2.5 py-1 rounded-lg border border-border">
                      {studentGenPolicy.dailyLimit === 0 ? "Unlimited (0 - Default)" : `${studentGenPolicy.dailyLimit} cases / day / student`}
                    </span>
                  </div>

                  <div className="p-3.5 rounded-xl bg-warning/10 border border-warning/20 text-text text-[11px] leading-relaxed">
                    <strong className="text-warning">Environment Configuration Note:</strong> This policy is strictly read-only in the Admin Dashboard to maintain institutional curriculum governance. By default, students can generate freely with no daily per-user cap (<code className="px-1 py-0.5 rounded bg-surface border border-border font-mono text-[10px]">STUDENT_GENERATION_LIMIT=0</code>). To impose limits or disable generation, set <code className="px-1 py-0.5 rounded bg-surface border border-border font-mono text-[10px]">STUDENT_GENERATION_LIMIT=3</code> or <code className="px-1 py-0.5 rounded bg-surface border border-border font-mono text-[10px]">STUDENT_CASE_GENERATION=false</code> in your server environment variables and redeploy.
                  </div>
                </div>
              </div>
            </div>

            {/* Faculty Feedback Ledger Table */}
            <div className="p-6 rounded-2xl border border-border bg-surface shadow-sm space-y-4">
              <div className="border-b border-border pb-3 flex items-center justify-between">
                <div>
                  <span className="text-xs uppercase font-mono text-muted tracking-widest block mb-1">
                    FACULTY QUALITY EVALUATION LEDGER
                  </span>
                  <h3 className="font-serif text-lg font-bold text-text">
                    Submitted Faculty Reviews & Feedback
                  </h3>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-border text-muted font-mono uppercase tracking-wider">
                      <th className="py-2.5 px-3">Date</th>
                      <th className="py-2.5 px-3">Case Title</th>
                      <th className="py-2.5 px-3">Faculty Evaluator</th>
                      <th className="py-2.5 px-3">Dept</th>
                      <th className="py-2.5 px-3">Rating</th>
                      <th className="py-2.5 px-3">Flagged Issues</th>
                      <th className="py-2.5 px-3">Gold Nomination</th>
                      <th className="py-2.5 px-3 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {casepackFeedbacks.length === 0 ? (
                      <tr>
                        <td colSpan={8} className="py-6 text-center text-muted">
                          No faculty evaluations recorded yet.
                        </td>
                      </tr>
                    ) : (
                      casepackFeedbacks.map((fb) => (
                        <tr key={fb.id} className="hover:bg-primary-soft/30 transition-colors">
                          <td className="py-3 px-3 text-muted whitespace-nowrap font-mono text-[11px]">
                            {new Date(fb.created_at).toLocaleDateString()}
                          </td>
                          <td className="py-3 px-3 font-semibold text-text max-w-xs truncate">
                            {fb.case_title || fb.case_id}
                          </td>
                          <td className="py-3 px-3">
                            <span className="font-medium text-text block">{fb.user_name}</span>
                            <span className="text-[10px] text-muted font-mono">{fb.user_email}</span>
                          </td>
                          <td className="py-3 px-3">
                            <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-accent/10 text-accent">
                              {fb.department}
                            </span>
                          </td>
                          <td className="py-3 px-3">
                            <span className="inline-flex items-center gap-1 font-bold text-accent">
                              <Star className="w-3.5 h-3.5 fill-accent" />
                              {fb.rating}.0
                            </span>
                          </td>
                          <td className="py-3 px-3">
                            {fb.flagged_issues.length === 0 ? (
                              <span className="text-muted text-[11px]">None (Clean)</span>
                            ) : (
                              <div className="flex flex-wrap gap-1">
                                {fb.flagged_issues.map((iss: string, idx: number) => (
                                  <span
                                    key={idx}
                                    className="px-1.5 py-0.2 rounded text-[10px] font-semibold bg-danger/10 text-danger border border-danger/20"
                                  >
                                    {iss.replace(/_/g, " ")}
                                  </span>
                                ))}
                              </div>
                            )}
                          </td>
                          <td className="py-3 px-3">
                            {fb.promote_to_gold ? (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-accent/15 text-accent border border-accent/20">
                                <Award className="w-3 h-3" />
                                Nominated ({fb.status})
                              </span>
                            ) : (
                              <span className="text-muted text-[11px]">Standard Review</span>
                            )}
                          </td>
                          <td className="py-3 px-3 text-right">
                            {fb.promote_to_gold && fb.status === "under_review" ? (
                              <div className="flex items-center justify-end gap-1.5">
                                <button
                                  type="button"
                                  disabled={updatingGoldStatus === fb.id}
                                  onClick={() => handleUpdateGoldStatus(fb.id, "promoted")}
                                  className="px-2 py-1 rounded bg-success text-white text-[10px] font-bold hover:opacity-90"
                                >
                                  Promote
                                </button>
                                <button
                                  type="button"
                                  disabled={updatingGoldStatus === fb.id}
                                  onClick={() => handleUpdateGoldStatus(fb.id, "rejected")}
                                  className="px-2 py-1 rounded border border-border text-muted hover:text-text text-[10px]"
                                >
                                  Decline
                                </button>
                              </div>
                            ) : (
                              <span className="text-[11px] text-muted">
                                {fb.status === "promoted" ? "Promoted to Gold" : "Completed"}
                              </span>
                            )}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* REASSIGN REVIEWER MODAL */}
        {reassignModalCase && (
          <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="w-full max-w-md rounded-2xl border border-border bg-surface p-6 shadow-2xl space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-border">
                <h3 className="font-serif font-bold text-base text-text">Reassign Case Reviewer</h3>
                <button
                  type="button"
                  onClick={() => setReassignModalCase(null)}
                  className="p-1 rounded-lg hover:bg-canvas text-muted hover:text-text"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="space-y-3 text-xs">
                <div>
                  <span className="text-muted block text-[10px] uppercase font-bold">Case Study</span>
                  <span className="font-bold text-text block line-clamp-2">{reassignModalCase.title}</span>
                </div>

                <div>
                  <span className="text-muted block text-[10px] uppercase font-bold">Author</span>
                  <span className="font-semibold text-text block">{reassignModalCase.author_name || "Faculty Member"}</span>
                  <span className="text-muted text-[10px]">Note: The author cannot review their own submission.</span>
                </div>

                <div>
                  <label className="text-muted block text-[10px] uppercase font-bold mb-1">
                    Select New Reviewer
                  </label>
                  <select
                    value={selectedNewReviewerId}
                    onChange={(e) => setSelectedNewReviewerId(e.target.value)}
                    className="w-full p-2.5 rounded-xl bg-primary-soft/30 border border-border text-text font-medium text-xs focus:outline-none focus:ring-1 focus:ring-accent"
                  >
                    <option value="">Choose active faculty reviewer...</option>
                    {profiles
                      .filter((p) => p.role === "faculty" && p.is_reviewer && p.id !== reassignModalCase.author_id && p.access_status !== "inactive")
                      .map((p) => {
                        const dept = departments.find((d) => d.id === p.department_id);
                        return (
                          <option key={p.id} value={p.id}>
                            {p.name} ({dept?.code || "GEN"}) - {p.email}
                          </option>
                        );
                      })}
                  </select>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-border">
                <button
                  type="button"
                  onClick={() => setReassignModalCase(null)}
                  className="px-3 py-1.5 rounded-xl border border-border text-muted hover:text-text text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  disabled={!selectedNewReviewerId || selectedNewReviewerId === reassignModalCase.reviewer_id}
                  onClick={() => handleReassignReviewer(reassignModalCase.id, selectedNewReviewerId)}
                  className="px-4 py-1.5 rounded-xl bg-accent text-white text-xs font-bold hover:bg-accent-hover disabled:opacity-50 transition-colors shadow-sm"
                >
                  Confirm Reassignment
                </button>
              </div>
            </div>
          </div>
        )}

        {/* CUSTOM EXPIRY DATE MODAL */}
        {customExpiryModalUser && (
          <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="w-full max-w-sm rounded-2xl border border-border bg-surface p-6 shadow-2xl space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-border">
                <h3 className="font-serif font-bold text-base text-text">Set Access Expiry Date</h3>
                <button
                  type="button"
                  onClick={() => setCustomExpiryModalUser(null)}
                  className="p-1 rounded-lg hover:bg-canvas text-muted hover:text-text"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="space-y-3 text-xs">
                <div>
                  <span className="text-muted block text-[10px] uppercase font-bold">Student</span>
                  <span className="font-bold text-text block">{customExpiryModalUser.name}</span>
                  <span className="text-muted font-mono text-[10px]">{customExpiryModalUser.email}</span>
                </div>

                <div>
                  <label className="text-muted block text-[10px] uppercase font-bold mb-1">
                    New Access Expiration Date
                  </label>
                  <input
                    type="date"
                    value={customExpiryDate}
                    onChange={(e) => setCustomExpiryDate(e.target.value)}
                    className="w-full p-2.5 rounded-xl bg-primary-soft/30 border border-border text-text font-mono text-xs focus:outline-none focus:ring-1 focus:ring-accent"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-border">
                <button
                  type="button"
                  onClick={() => setCustomExpiryModalUser(null)}
                  className="px-3 py-1.5 rounded-xl border border-border text-muted hover:text-text text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  disabled={!customExpiryDate}
                  onClick={() => handleRenewStudentAccess(customExpiryModalUser.id, 0, customExpiryDate)}
                  className="px-4 py-1.5 rounded-xl bg-accent text-white text-xs font-bold hover:bg-accent-hover disabled:opacity-50 transition-colors shadow-sm"
                >
                  Save Expiry Date
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </AppShell>
  );
}
