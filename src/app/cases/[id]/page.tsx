"use client";

import { useEffect, useState, use, useRef, useMemo } from "react";
import Link from "next/link";
import { AppShell } from "@/components/AppShell";
import { StateLoading } from "@/components/StateLoading";
import { StateError } from "@/components/StateError";
import {
  COLLEGE_NAME,
  COLLEGE_NAME_WITH_SHORT,
  COLLEGE_SHORT,
  AI_ENGINE_LABEL,
} from "@/config/college";
import {
  CaseStudy,
  CaseContent,
  KeyDataRow,
  CaseVersion,
  Profile,
  Rubric,
  RubricCriterion,
  StudentAnswer,
  Grade,
  AuditLog,
  CaseVisibility,
} from "@/lib/types";
import {
  ArrowLeft,
  Edit3,
  Save,
  CheckCircle2,
  AlertTriangle,
  BookOpen,
  Table,
  HelpCircle,
  GraduationCap,
  Clock,
  Sparkles,
  Layers,
  Printer,
  Plus,
  Trash2,
  Download,
  Play,
  Pause,
  RotateCcw,
  Send,
  Check,
  Share2,
  History,
  FileDown,
  Building,
  ShieldCheck,
  MessageSquare,
  X,
  Award,
  Lock,
  PenTool,
  ClipboardCheck,
  BarChart2,
  CheckCircle,
  Users,
  Copy,
  Maximize2,
  Globe,
  GitCompare,
  RotateCw,
  Type,
  Eye,
} from "lucide-react";
import dynamic from "next/dynamic";
import { getCachedUser } from "@/lib/auth-client";

const AudioBriefPlayer = dynamic(
  () => import("@/components/AudioBriefPlayer").then((mod) => mod.AudioBriefPlayer),
  { ssr: false }
);
const PractitionerReflectionsSection = dynamic(
  () => import("@/components/PractitionerReflectionsSection").then((mod) => mod.PractitionerReflectionsSection),
  { ssr: false }
);
const IntegrityReportBadge = dynamic(
  () => import("@/components/IntegrityReportBadge").then((mod) => mod.IntegrityReportBadge),
  { ssr: false }
);
const InteractiveFinancialExhibit = dynamic(
  () => import("@/components/InteractiveFinancialExhibit").then((mod) => mod.InteractiveFinancialExhibit),
  { ssr: false }
);
import { CaseNarrativeView } from "@/components/CaseNarrativeView";

export default function CaseDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const unwrappedParams = use(params);
  const caseId = unwrappedParams.id;

  const [caseStudy, setCaseStudy] = useState<CaseStudy | null>(null);
  const [currentUser, setCurrentUser] = useState<Profile | null>(null);
  const [versions, setVersions] = useState<CaseVersion[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Editing state
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [editedTitle, setEditedTitle] = useState("");
  const [editedContent, setEditedContent] = useState<CaseContent | null>(null);
  const [editChangeSummary, setEditChangeSummary] = useState("");

  // Workflow states
  const [isWorkflowLoading, setIsWorkflowLoading] = useState(false);
  const [workflowMessage, setWorkflowMessage] = useState<string | null>(null);
  const [requestChangesModalOpen, setRequestChangesModalOpen] = useState(false);
  const [reviewerCommentInput, setReviewerCommentInput] = useState("");

  // Version history modal state
  const [versionModalOpen, setVersionModalOpen] = useState(false);
  const [previewVersion, setPreviewVersion] = useState<CaseVersion | null>(null);
  const [diffMode, setDiffMode] = useState(false);
  const [isRestoringVersion, setIsRestoringVersion] = useState(false);

  // Reading View Typography & Controls
  const [fontSize, setFontSize] = useState<"sm" | "base" | "lg" | "xl">("base");
  const [lineSpacing, setLineSpacing] = useState<"normal" | "relaxed" | "loose">("relaxed");
  const [activeSection, setActiveSection] = useState<string>("summary");
  const [copyMarkdownCopied, setCopyMarkdownCopied] = useState(false);

  // Exhibit Expansion Modal State
  const [expandExhibitModalOpen, setExpandExhibitModalOpen] = useState(false);
  const [tableCopied, setTableCopied] = useState(false);

  // 30s Case Autosave State
  const [isAutosavingCase, setIsAutosavingCase] = useState(false);
  const [lastAutosavedTime, setLastAutosavedTime] = useState<string | null>(null);

  // Case Audit Trail State
  const [auditModalOpen, setAuditModalOpen] = useState(false);
  const [caseAuditLogs, setCaseAuditLogs] = useState<AuditLog[]>([]);
  const [loadingAuditLogs, setLoadingAuditLogs] = useState(false);

  // Publish Modal State
  const [publishModalOpen, setPublishModalOpen] = useState(false);
  const [publishVisibility, setPublishVisibility] = useState<CaseVisibility>("sbs_only");

  // Share state
  const [shareCopied, setShareCopied] = useState(false);

  // Rubric state
  const [rubric, setRubric] = useState<Rubric | null>(null);
  const [rubricModalOpen, setRubricModalOpen] = useState(false);
  const [editedCriteria, setEditedCriteria] = useState<RubricCriterion[]>([]);
  const [isSuggestingRubric, setIsSuggestingRubric] = useState(false);
  const [isSavingRubric, setIsSavingRubric] = useState(false);

  // Student Answering & Autosave state
  const [studentAnswer, setStudentAnswer] = useState<StudentAnswer | null>(null);
  const [answerText, setAnswerText] = useState("");
  const [wordCount, setWordCount] = useState(0);
  const [autosaveStatus, setAutosaveStatus] = useState<string>("Draft ready");
  const [isSubmittingAnswer, setIsSubmittingAnswer] = useState(false);
  const [studentGrade, setStudentGrade] = useState<Grade | null>(null);
  const autosaveTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Faculty Cohort Grading state
  const [caseSubmissions, setCaseSubmissions] = useState<any[]>([]);
  const [selectedSubmission, setSelectedSubmission] = useState<any | null>(null);
  const [gradingModalOpen, setGradingModalOpen] = useState(false);
  const [isGradingLoading, setIsGradingLoading] = useState(false);
  const [facultyScoresInput, setFacultyScoresInput] = useState<Record<string, number>>({});
  const [facultyTotalMarksInput, setFacultyTotalMarksInput] = useState<number>(85);
  const [facultyCommentInput, setFacultyCommentInput] = useState<string>("");

  // FlashCase Classroom Simulation Live Timer (25 Minutes)
  const [simActive, setSimActive] = useState(false);
  const [simSecondsLeft, setSimSecondsLeft] = useState(25 * 60);

  // Simulation timer interval
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    if (simActive && simSecondsLeft > 0) {
      interval = setInterval(() => {
        setSimSecondsLeft((prev) => Math.max(0, prev - 1));
      }, 1000);
    } else if (simSecondsLeft === 0) {
      setSimActive(false);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [simActive, simSecondsLeft]);

  // Load current user
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

  // Load case versions
  const loadVersions = async () => {
    try {
      const res = await fetch(`/api/cases/${caseId}/versions`);
      const data = await res.json();
      if (data.versions) {
        setVersions(data.versions);
      }
    } catch (err) {
      console.error("Failed to load versions:", err);
    }
  };

  // Load Rubric
  const loadRubric = async () => {
    try {
      const res = await fetch(`/api/cases/${caseId}/rubric`);
      const data = await res.json();
      if (data.rubric) {
        setRubric(data.rubric);
        setEditedCriteria(data.rubric.criteria);
      }
    } catch (err) {
      console.error("Failed to load rubric:", err);
    }
  };

  // Load Student Answer (or Submissions if Faculty)
  const loadStudentAnswerOrSubmissions = async () => {
    try {
      const res = await fetch(`/api/answers?caseId=${caseId}`);
      const data = await res.json();
      if (data.answer) {
        setStudentAnswer(data.answer);
        setAnswerText(data.answer.text);
        setWordCount(data.answer.word_count || (data.answer.text ? data.answer.text.split(/\s+/).length : 0));
        // Check for grade
        if (data.answer.id) {
          const ansRes = await fetch(`/api/answers/${data.answer.id}`);
          const ansData = await ansRes.json();
          if (ansData.grade) setStudentGrade(ansData.grade);
        }
      }
      if (data.answers) {
        setCaseSubmissions(data.answers);
      }
    } catch (err) {
      console.error("Failed to load answers for case:", err);
    }
  };

  // Fetch case dossier
  const fetchCase = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/cases/${caseId}`);
      if (res.status === 403) {
        throw new Error(
          "Access restricted: This case study is pending faculty curriculum review and is not accessible to students."
        );
      }
      if (!res.ok) {
        throw new Error(`Failed to load case dossier (HTTP ${res.status}).`);
      }
      const data = await res.json();
      if (!data.caseStudy) {
        throw new Error("Case study not found in institutional repository.");
      }

      setCaseStudy(data.caseStudy);
      setEditedTitle(data.caseStudy.title);
      setEditedContent(data.caseStudy.content);
    } catch (err: unknown) {
      console.error("Fetch case error:", err);
      const msg = err instanceof Error ? err.message : "Failed to load case data.";
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    Promise.all([
      loadUser(),
      fetchCase(),
      loadVersions(),
      loadRubric(),
      loadStudentAnswerOrSubmissions(),
    ]);
  }, [caseId]);

  // Save edits handler
  const handleSaveDraft = async () => {
    if (!caseStudy || !editedContent) return;
    setIsSaving(true);
    setSaveSuccess(false);

    try {
      const payload: Partial<CaseStudy> & { change_summary?: string } = {
        title: editedTitle,
        content: editedContent,
        change_summary:
          editChangeSummary.trim() ||
          `Updated case sections (v${(caseStudy.version || 1) + (caseStudy.status === "approved" ? 1 : 0)})`,
      };

      const res = await fetch(`/api/cases/${caseId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        throw new Error("Failed to save changes to database.");
      }

      const data = await res.json();
      setCaseStudy(data.caseStudy);
      setIsEditing(false);
      setSaveSuccess(true);
      setEditChangeSummary("");
      loadVersions();
      setTimeout(() => setSaveSuccess(false), 4000);
    } catch (err: unknown) {
      console.error("Save error:", err);
      alert(err instanceof Error ? err.message : "Failed to save draft.");
    } finally {
      setIsSaving(false);
    }
  };

  // Workflow: Submit for Approval
  const handleSubmitForApproval = async () => {
    if (!caseStudy) return;
    setIsWorkflowLoading(true);
    try {
      const res = await fetch(`/api/cases/${caseId}/workflow`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "submit-approval" }),
      });
      const data = await res.json();
      if (data.success && data.caseStudy) {
        setCaseStudy(data.caseStudy);
        setWorkflowMessage("Case submitted for peer review.");
        setTimeout(() => setWorkflowMessage(null), 4000);
      } else {
        alert(data.error || "Failed to submit case.");
      }
    } catch (err) {
      console.error("Submit approval error:", err);
      alert("Workflow request failed.");
    } finally {
      setIsWorkflowLoading(false);
    }
  };

  // Workflow: Approve Case
  const handleApproveCase = async () => {
    if (!caseStudy) return;
    setIsWorkflowLoading(true);
    try {
      const res = await fetch(`/api/cases/${caseId}/workflow`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "approve",
          reviewerId: currentUser?.id || "usr-faculty-2",
        }),
      });
      const data = await res.json();
      if (data.success && data.caseStudy) {
        setCaseStudy(data.caseStudy);
        loadVersions();
        setWorkflowMessage("Case officially approved and published to students!");
        setTimeout(() => setWorkflowMessage(null), 4000);
      } else {
        alert(data.error || "Failed to approve case.");
      }
    } catch (err) {
      console.error("Approve case error:", err);
      alert("Workflow request failed.");
    } finally {
      setIsWorkflowLoading(false);
    }
  };

  // Workflow: Request Changes
  const handleRequestChanges = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!caseStudy || !reviewerCommentInput.trim()) return;

    setIsWorkflowLoading(true);
    try {
      const res = await fetch(`/api/cases/${caseId}/workflow`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "request-changes",
          reviewerId: currentUser?.id || "usr-faculty-2",
          comment: reviewerCommentInput.trim(),
        }),
      });
      const data = await res.json();
      if (data.success && data.caseStudy) {
        setCaseStudy(data.caseStudy);
        setRequestChangesModalOpen(false);
        setReviewerCommentInput("");
        setWorkflowMessage("Changes requested. Returned to author with feedback.");
        setTimeout(() => setWorkflowMessage(null), 4000);
      } else {
        alert(data.error || "Failed to request changes.");
      }
    } catch (err) {
      console.error("Request changes error:", err);
      alert("Workflow request failed.");
    } finally {
      setIsWorkflowLoading(false);
    }
  };

  // Share Case Link
  const handleShareCase = () => {
    if (typeof window !== "undefined") {
      const shareUrl = window.location.href;
      navigator.clipboard.writeText(shareUrl).then(() => {
        setShareCopied(true);
        setTimeout(() => setShareCopied(false), 3000);
      });
    }
  };

  // 30-second automated autosave interval when editing case
  useEffect(() => {
    if (!isEditing || !editedContent) return;

    const interval = setInterval(async () => {
      try {
        setIsAutosavingCase(true);
        const res = await fetch(`/api/cases/${caseId}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            title: editedTitle,
            content: editedContent,
            change_summary: `Autosaved draft edits at ${new Date().toLocaleTimeString()}`,
          }),
        });
        if (res.ok) {
          const now = new Date();
          setLastAutosavedTime(
            now.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" })
          );
        }
      } catch (err) {
        console.error("Case autosave error:", err);
      } finally {
        setIsAutosavingCase(false);
      }
    }, 30000);

    return () => clearInterval(interval);
  }, [isEditing, editedTitle, editedContent, caseId]);

  // Version Restoration Handler
  const handleRestoreVersion = async (versionNumber: number) => {
    if (
      !confirm(
        `Restore Version ${versionNumber}? Your current live state will be preserved as a historical snapshot before restoration.`
      )
    ) {
      return;
    }

    setIsRestoringVersion(true);
    try {
      const res = await fetch(`/api/cases/${caseId}/versions`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "restore", versionNumber }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Failed to restore version.");
      }

      setCaseStudy(data.caseStudy);
      setEditedTitle(data.caseStudy.title);
      setEditedContent(data.caseStudy.content);
      setPreviewVersion(null);
      setVersionModalOpen(false);
      loadVersions();
      setWorkflowMessage(`Restored Version ${versionNumber} (Saved as active v${data.caseStudy.version})`);
      setTimeout(() => setWorkflowMessage(null), 4000);
    } catch (err) {
      console.error("Restore version error:", err);
      alert(err instanceof Error ? err.message : "Failed to restore version.");
    } finally {
      setIsRestoringVersion(false);
    }
  };

  // Copy Plain Text / Markdown Handler
  const handleCopyMarkdown = () => {
    const activeContent = isEditing ? editedContent : caseStudy?.content;
    if (!caseStudy || !activeContent) return;
    const md = `# ${caseStudy.title}
Institution: ${COLLEGE_NAME_WITH_SHORT}
Type: ${caseStudy.type.toUpperCase()} | Format: ${caseStudy.format}
Industry: ${caseStudy.industry} | Function: ${caseStudy.function}

## Executive Summary
${activeContent.summary}

## Background & Context
${activeContent.background}

## The Operational Challenge
${activeContent.challenge}

## Key Indicators
${activeContent.key_data.map((k) => `- ${k.metric}: ${k.value} (${k.period || "Current"})`).join("\n")}

## Decision Point
${activeContent.decision_point}

## Discussion Questions
${activeContent.discussion_questions.map((q, i) => `${i + 1}. ${q}`).join("\n")}
`;
    navigator.clipboard.writeText(md).then(() => {
      setCopyMarkdownCopied(true);
      setTimeout(() => setCopyMarkdownCopied(false), 3000);
    });
  };

  // Copy Key Data Table
  const handleCopyTable = () => {
    const activeContent = isEditing ? editedContent : caseStudy?.content;
    if (!activeContent?.key_data) return;
    const header = "Metric\tValue\tPeriod\tNotes\n";
    const rows = activeContent.key_data
      .map((r) => `${r.metric}\t${r.value}\t${r.period || ""}\t${r.notes || ""}`)
      .join("\n");
    navigator.clipboard.writeText(header + rows).then(() => {
      setTableCopied(true);
      setTimeout(() => setTableCopied(false), 3000);
    });
  };

  // Download Exhibit CSV
  const handleDownloadExhibitCSV = () => {
    const activeContent = isEditing ? editedContent : caseStudy?.content;
    if (!activeContent?.key_data || !caseStudy) return;
    const header = "Metric,Value,Period,Notes\n";
    const rows = activeContent.key_data
      .map(
        (r) =>
          `"${r.metric.replace(/"/g, '""')}","${r.value.replace(/"/g, '""')}","${(r.period || "").replace(/"/g, '""')}","${(r.notes || "").replace(/"/g, '""')}"`
      )
      .join("\n");
    const blob = new Blob([header + rows], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${caseStudy.title.replace(/[^a-zA-Z0-9]/g, "_").slice(0, 30)}_exhibit_1.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Fetch Case Audit Logs
  const loadCaseAuditLogs = async () => {
    setLoadingAuditLogs(true);
    try {
      const res = await fetch(`/api/cases/${caseId}/audit`);
      if (res.ok) {
        const data = await res.json();
        setCaseAuditLogs(data.auditLogs || []);
      }
    } catch (err) {
      console.error("Fetch audit error:", err);
    } finally {
      setLoadingAuditLogs(false);
    }
  };

  // Publish Case Action
  const handlePublishCase = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!caseStudy) return;
    setIsWorkflowLoading(true);
    try {
      const res = await fetch(`/api/cases/${caseId}/workflow`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "publish", visibility: publishVisibility }),
      });
      const data = await res.json();
      if (data.success && data.caseStudy) {
        setCaseStudy(data.caseStudy);
        setPublishModalOpen(false);
        setWorkflowMessage(
          `Case published to ${publishVisibility === "public" ? "public repository" : "SBS student directory"}!`
        );
        setTimeout(() => setWorkflowMessage(null), 4000);
      } else {
        alert(data.error || "Failed to publish case.");
      }
    } catch (err) {
      console.error("Publish error:", err);
      alert("Failed to publish case.");
    } finally {
      setIsWorkflowLoading(false);
    }
  };

  // Reading time and word count metric
  const wordMetrics = useMemo(() => {
    const activeContent = isEditing ? editedContent : caseStudy?.content;
    if (!activeContent) return { words: 0, minutes: 1 };
    const text = [
      activeContent.summary || "",
      activeContent.background || "",
      activeContent.challenge || "",
      activeContent.decision_point || "",
      ...(activeContent.discussion_questions || []),
    ].join(" ");
    const words = text.trim() ? text.trim().split(/\s+/).length : 0;
    const minutes = Math.max(1, Math.ceil(words / 200));
    return { words, minutes };
  }, [isEditing, editedContent, caseStudy]);

  // Dynamic typography classes based on user preference
  const typographyClass = useMemo(() => {
    let size = "text-xs md:text-sm";
    if (fontSize === "sm") size = "text-xs";
    else if (fontSize === "base") size = "text-xs md:text-sm";
    else if (fontSize === "lg") size = "text-sm md:text-base";
    else if (fontSize === "xl") size = "text-base md:text-lg";

    let leading = "leading-relaxed";
    if (lineSpacing === "normal") leading = "leading-normal";
    else if (lineSpacing === "relaxed") leading = "leading-relaxed";
    else if (lineSpacing === "loose") leading = "leading-loose";

    return `${size} ${leading}`;
  }, [fontSize, lineSpacing]);

  // ==========================================
  // RUBRIC HANDLERS
  // ==========================================
  const handleSuggestRubric = async () => {
    setIsSuggestingRubric(true);
    try {
      const res = await fetch("/api/rubric/suggest", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ caseId }),
      });
      const data = await res.json();
      if (data.success && data.criteria) {
        setEditedCriteria(data.criteria);
      }
    } catch (err) {
      console.error("Suggest rubric error:", err);
      alert("Failed to suggest rubric.");
    } finally {
      setIsSuggestingRubric(false);
    }
  };

  const handleSaveRubric = async () => {
    setIsSavingRubric(true);
    try {
      const res = await fetch(`/api/cases/${caseId}/rubric`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ criteria: editedCriteria }),
      });
      const data = await res.json();
      if (data.success && data.rubric) {
        setRubric(data.rubric);
        setRubricModalOpen(false);
        setWorkflowMessage("Curriculum evaluation rubric saved.");
        setTimeout(() => setWorkflowMessage(null), 4000);
      } else {
        alert(data.error || "Failed to save rubric.");
      }
    } catch (err) {
      console.error("Save rubric error:", err);
      alert("Failed to save rubric.");
    } finally {
      setIsSavingRubric(false);
    }
  };

  // ==========================================
  // STUDENT ANSWER AUTOSAVE & SUBMISSION
  // ==========================================
  const handleAnswerTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const text = e.target.value;
    setAnswerText(text);
    const count = text.trim() ? text.trim().split(/\s+/).length : 0;
    setWordCount(count);
    setAutosaveStatus("Saving draft...");

    if (autosaveTimeoutRef.current) {
      clearTimeout(autosaveTimeoutRef.current);
    }

    autosaveTimeoutRef.current = setTimeout(async () => {
      try {
        const res = await fetch("/api/answers", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            action: "draft",
            caseId,
            text,
          }),
        });
        const data = await res.json();
        if (data.success && data.answer) {
          setStudentAnswer(data.answer);
          const now = new Date();
          setAutosaveStatus(
            `Draft autosaved at ${now.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" })}`
          );
        } else if (data.error) {
          setAutosaveStatus(data.error);
        }
      } catch {
        setAutosaveStatus("Autosave offline");
      }
    }, 1200);
  };

  const handleSubmitStudentAnswer = async () => {
    if (!answerText.trim() || wordCount < 30) {
      if (!confirm("Your analysis has fewer than 30 words. Are you sure you wish to submit?")) {
        return;
      }
    }

    if (
      !confirm(
        "CRITICAL: Once submitted, your analysis will be locked and cannot be edited. Proceed to submit for faculty review?"
      )
    ) {
      return;
    }

    setIsSubmittingAnswer(true);
    try {
      const res = await fetch("/api/answers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "submit",
          caseId,
          text: answerText,
          answerId: studentAnswer?.id,
        }),
      });
      const data = await res.json();
      if (data.success && data.answer) {
        setStudentAnswer(data.answer);
        alert("Your strategic analysis has been submitted and locked successfully!");
      } else {
        alert(data.error || "Failed to submit answer.");
      }
    } catch (err) {
      console.error("Submit answer error:", err);
      alert("Submission error.");
    } finally {
      setIsSubmittingAnswer(false);
    }
  };

  // ==========================================
  // FACULTY GRADING HANDLERS
  // ==========================================
  const handleOpenGradingModal = (sub: any) => {
    setSelectedSubmission(sub);
    const existingScores: Record<string, number> = sub.grade?.criterion_scores || sub.grade?.ai_marks || {};
    setFacultyScoresInput(existingScores);
    setFacultyTotalMarksInput(sub.grade?.final_marks || 85);
    setFacultyCommentInput(sub.grade?.faculty_comment || "");
    setGradingModalOpen(true);
  };

  const handleRunAIGrading = async () => {
    if (!selectedSubmission) return;
    setIsGradingLoading(true);
    try {
      const res = await fetch("/api/grade", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "ai-grade",
          answerId: selectedSubmission.id,
        }),
      });
      const data = await res.json();
      if (data.success && data.grade) {
        selectedSubmission.grade = data.grade;
        setFacultyScoresInput(data.grade.ai_marks || {});
        // Sum total
        const total = Object.values(data.grade.ai_marks || {}).reduce(
          (sum: number, val: any) => sum + Number(val || 0),
          0
        );
        setFacultyTotalMarksInput(total);
        if (data.grade.ai_feedback && !facultyCommentInput) {
          setFacultyCommentInput(data.grade.ai_feedback);
        }
      }
    } catch (err) {
      console.error("AI grade error:", err);
      alert("AI grading failed.");
    } finally {
      setIsGradingLoading(false);
    }
  };

  const handlePublishGrade = async () => {
    if (!selectedSubmission) return;
    setIsGradingLoading(true);
    try {
      const res = await fetch("/api/grade", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "publish",
          answerId: selectedSubmission.id,
          finalMarks: facultyTotalMarksInput,
          facultyComment: facultyCommentInput,
          criterionScores: facultyScoresInput,
        }),
      });
      const data = await res.json();
      if (data.success && data.grade) {
        selectedSubmission.grade = data.grade;
        setGradingModalOpen(false);
        loadStudentAnswerOrSubmissions();
        setWorkflowMessage("Final marks and feedback officially published to student!");
        setTimeout(() => setWorkflowMessage(null), 4000);
      } else {
        alert(data.error || "Failed to publish grade.");
      }
    } catch (err) {
      console.error("Publish grade error:", err);
      alert("Publish grade error.");
    } finally {
      setIsGradingLoading(false);
    }
  };

  // Export as Markdown
  const exportAsMarkdown = () => {
    if (!caseStudy || !content) return;
    const md = `# ${caseStudy.title}
**Institution:** ${COLLEGE_NAME_WITH_SHORT}  
**Scope:** ${caseStudy.type.toUpperCase()} Case | **Format:** ${caseStudy.format.replace("_", " ")}  
**Industry:** ${caseStudy.industry} | **Functional Focus:** ${caseStudy.function}  
**Language:** ${caseStudy.language.toUpperCase()} | **Complexity:** Level ${caseStudy.complexity}/10  

---

## Executive Summary
${content.summary}

## Background & Context
${content.background}

## The Core Challenge
${content.challenge}

## Exhibit 1: Operating Metrics
| Metric | Value | Period | Notes |
|---|---|---|---|
${content.key_data.map((k) => `| ${k.metric} | ${k.value} | ${k.period || "-"} | ${k.notes || "illustrative"} |`).join("\n")}

*${content.figures_disclaimer || "All figures are illustrative pedagogical models for classroom analysis."}*

## Strategic Decision Point
> ${content.decision_point}

## Classroom Discussion Questions
${content.discussion_questions.map((q, i) => `${i + 1}. ${q}`).join("\n")}

---

${
  content.teaching_note
    ? `## Facilitator Teaching Note (Confidential)
### Pedagogical Objectives
${content.teaching_note.objectives.map((o) => `- ${o}`).join("\n")}

### Recommended Class Flow
${content.teaching_note.class_flow.map((f) => `- **${f.phase}** (${f.duration_minutes} min): ${f.activity}`).join("\n")}

### Theoretical Frameworks
${content.teaching_note.frameworks.map((f) => `#### ${f.name}\n- **Application:** ${f.application}\n- **Key Takeaway:** ${f.key_takeaway}`).join("\n\n")}`
    : ""
}
`;
    const blob = new Blob([md], { type: "text/markdown;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${caseStudy.title.replace(/[^a-zA-Z0-9]/g, "_").slice(0, 40)}.md`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Export as JSON
  const exportAsJSON = () => {
    if (!caseStudy) return;
    const jsonStr = JSON.stringify(caseStudy, null, 2);
    const blob = new Blob([jsonStr], { type: "application/json;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${caseStudy.title.replace(/[^a-zA-Z0-9]/g, "_").slice(0, 40)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Key Data row handlers
  const handleKeyDataChange = (
    index: number,
    field: keyof KeyDataRow,
    value: string
  ) => {
    if (!editedContent) return;
    const updatedRows = [...editedContent.key_data];
    updatedRows[index] = { ...updatedRows[index], [field]: value };
    setEditedContent({ ...editedContent, key_data: updatedRows });
  };

  const handleAddKeyDataRow = () => {
    if (!editedContent) return;
    setEditedContent({
      ...editedContent,
      key_data: [
        ...editedContent.key_data,
        { metric: "New Metric", value: "TBD", period: "FY26", notes: "illustrative" },
      ],
    });
  };

  const handleDeleteKeyDataRow = (index: number) => {
    if (!editedContent) return;
    const updated = editedContent.key_data.filter((_, i) => i !== index);
    setEditedContent({ ...editedContent, key_data: updated });
  };

  const handleQuestionChange = (index: number, value: string) => {
    if (!editedContent) return;
    const updated = [...editedContent.discussion_questions];
    updated[index] = value;
    setEditedContent({ ...editedContent, discussion_questions: updated });
  };

  // Format timer MM:SS
  const formatTimer = (totalSeconds: number) => {
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    return `${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
  };

  const getSimulationPhase = (secondsLeft: number) => {
    const elapsed = 25 * 60 - secondsLeft;
    if (elapsed <= 5 * 60) return { name: "Phase 1: Emergency Briefing", color: "text-info" };
    if (elapsed <= 15 * 60) return { name: "Phase 2: War Room Team Deliberation", color: "text-warning" };
    return { name: "Phase 3: Executive Defense Pitch", color: "text-success" };
  };

  if (loading) {
    return (
      <AppShell>
        <div className="max-w-5xl mx-auto py-12">
          <StateLoading
            title="Loading Case Dossier..."
            subtitle="Synthesizing structured pedagogical exhibits and facilitator frameworks."
          />
        </div>
      </AppShell>
    );
  }

  // Student restriction check: Students CANNOT see draft or in_review cases!
  const isStudent = currentUser?.role === "student";
  if (isStudent && caseStudy && caseStudy.status !== "approved") {
    return (
      <AppShell>
        <div className="max-w-4xl mx-auto py-12">
          <StateError
            title="Access Restricted: Under Faculty Review"
            message="This case study is currently under faculty curriculum review or author revision and is not yet approved for student distribution."
            backHref="/library"
            backText="Return to Approved Case Library"
          />
        </div>
      </AppShell>
    );
  }

  if (error || !caseStudy || !editedContent) {
    return (
      <AppShell>
        <div className="max-w-4xl mx-auto py-12">
          <StateError
            title="Case Dossier Failed to Load"
            message={error || "Case study was malformed or missing."}
            onRetry={fetchCase}
            backHref="/library"
            backText="Return to Case Library"
          />
        </div>
      </AppShell>
    );
  }

  const content = isEditing ? editedContent : caseStudy.content;
  const isRealSignal = caseStudy.format === "real_signal" || content.verify_facts_flag;
  const isFlash = caseStudy.type === "flash";
  const currentPhase = getSimulationPhase(simSecondsLeft);

  const isAuthor = currentUser?.id === caseStudy.author_id;
  const isReviewer = currentUser?.role === "admin";
  const isApproved = caseStudy.status === "approved";
  const isInReview = caseStudy.status === "in_review";
  const isChangesRequested = caseStudy.status === "changes_requested";

  const isAnswerLocked = studentAnswer?.status === "submitted";

  return (
    <AppShell>
      <div className="max-w-5xl mx-auto space-y-6 pb-20">
        {/* TOP BAR / NAVIGATION & ACTIONS */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-4">
          <Link
            href="/library"
            className="inline-flex items-center gap-2 text-xs font-semibold text-muted hover:text-accent transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Case Library</span>
          </Link>

          <div className="flex flex-wrap items-center gap-2">
            {saveSuccess && (
              <div className="flex items-center gap-1.5 text-xs text-success bg-success/15 px-3 py-1.5 rounded-lg border border-success/30">
                <CheckCircle2 className="w-4 h-4" />
                <span className="font-semibold">Case Saved Successfully</span>
              </div>
            )}

            {workflowMessage && (
              <div className="flex items-center gap-1.5 text-xs text-accent bg-primary-soft px-3 py-1.5 rounded-lg border border-border">
                <Sparkles className="w-4 h-4 text-accent" />
                <span className="font-semibold">{workflowMessage}</span>
              </div>
            )}

            {/* Rubric Button (Faculty/Admin can edit, Student can view) */}
            <button
              type="button"
              onClick={() => setRubricModalOpen(true)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-border text-xs font-semibold text-text hover:border-accent hover:text-accent transition-colors"
              title="View or configure curriculum evaluation rubric"
            >
              <ClipboardCheck className="w-3.5 h-3.5 text-accent" />
              <span>Rubric ({rubric?.criteria.length || 4} Criteria)</span>
            </button>

            {/* Version History Button */}
            <button
              type="button"
              onClick={() => setVersionModalOpen(true)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-border text-xs font-semibold text-text hover:border-accent hover:text-accent transition-colors"
              title="View immutable revision history"
            >
              <History className="w-3.5 h-3.5" />
              <span>Version History ({versions.length || 1})</span>
            </button>

            {/* Share Button */}
            <button
              type="button"
              onClick={handleShareCase}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-border text-xs font-semibold text-text hover:border-accent hover:text-accent transition-colors"
              title={`Copy share link for authenticated ${COLLEGE_SHORT} users`}
            >
              {shareCopied ? (
                <Check className="w-3.5 h-3.5 text-success" />
              ) : (
                <Share2 className="w-3.5 h-3.5" />
              )}
              <span>{shareCopied ? "Link Copied!" : "Share Link"}</span>
            </button>

            {/* Copy Plain Text / Markdown */}
            <button
              type="button"
              onClick={handleCopyMarkdown}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-border text-xs font-semibold text-text hover:border-accent hover:text-accent transition-colors"
              title="Copy formatted case text and discussion questions"
            >
              {copyMarkdownCopied ? (
                <Check className="w-3.5 h-3.5 text-success" />
              ) : (
                <Copy className="w-3.5 h-3.5" />
              )}
              <span>{copyMarkdownCopied ? "Copied!" : "Copy Text"}</span>
            </button>

            {/* Audit Trail Button */}
            {!isStudent && (
              <button
                type="button"
                onClick={() => {
                  setAuditModalOpen(true);
                  loadCaseAuditLogs();
                }}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-border text-xs font-semibold text-muted hover:text-text hover:border-text transition-colors"
                title="View compliance and workflow audit records"
              >
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Audit Trail</span>
              </button>
            )}

            {/* PDF Server-Side Export */}
            <a
              href={`/api/cases/${caseId}/export/pdf`}
              download
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-accent hover:bg-accent-hover text-accent-text text-xs font-semibold shadow-sm transition-all"
              title={`Download ${COLLEGE_SHORT} branded PDF with key data table`}
            >
              <FileDown className="w-3.5 h-3.5" />
              <span>Export PDF</span>
            </a>

            {/* DOCX Server-Side Export */}
            <a
              href={`/api/cases/${caseId}/export/docx`}
              download
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-border text-xs font-semibold text-text hover:border-accent hover:text-accent transition-colors"
              title="Download editable Word Document (.docx)"
            >
              <FileDown className="w-3.5 h-3.5" />
              <span>Export DOCX</span>
            </a>

            {/* Launch Live Socratic Room (Faculty & Admin) */}
            {isApproved && !isStudent && (
              <Link
                href={`/cases/${caseId}/live`}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-success hover:opacity-90 text-white text-xs font-bold shadow-sm transition-all"
                title="Launch Live Socratic Classroom & Cold-Call Wheel"
              >
                <Users className="w-3.5 h-3.5" />
                <span>Live Room</span>
              </Link>
            )}

            {/* Print View */}
            <button
              type="button"
              onClick={() => window.print()}
              className="p-1.5 rounded-lg border border-border text-muted hover:text-text"
              title="Print view"
            >
              <Printer className="w-4 h-4" />
            </button>

            {/* Edit / Save controls for faculty/author */}
            {!isStudent && (
              isEditing ? (
                <div className="flex items-center gap-2 pl-2 border-l border-border">
                  <div className="flex items-center gap-1.5 text-[11px] text-muted font-mono">
                    <Clock className="w-3 h-3 text-accent" />
                    <span>
                      {isAutosavingCase
                        ? "Autosaving..."
                        : lastAutosavedTime
                        ? `Saved at ${lastAutosavedTime}`
                        : "Autosave (30s)"}
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setIsEditing(false)}
                    className="px-2.5 py-1.5 rounded-lg border border-border text-xs font-semibold text-text"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    disabled={isSaving}
                    onClick={handleSaveDraft}
                    className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-success hover:opacity-90 text-white text-xs font-semibold shadow-sm"
                  >
                    <Save className="w-3.5 h-3.5" />
                    <span>{isSaving ? "Saving..." : isApproved ? "Save New Version" : "Save Changes"}</span>
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => setIsEditing(true)}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-border text-xs font-semibold text-text hover:border-accent"
                >
                  <Edit3 className="w-3.5 h-3.5" />
                  <span>Edit Inline</span>
                </button>
              )
            )}
          </div>
        </div>

        {/* WORKFLOW STATUS & ACTION BANNER (FACULTY / ADMIN) */}
        {!isStudent && (
          <div className="p-4 rounded-2xl border border-border bg-surface shadow-sm space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-2.5">
                {isApproved && (
                  <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full bg-success" />
                    <span className="font-serif font-bold text-sm text-text">
                      Curriculum Status: Accredited & Published
                    </span>
                    <span className="text-xs px-2 py-0.5 rounded-full bg-success/15 text-success font-bold">
                      Version {caseStudy.version || 1}
                    </span>
                  </div>
                )}
                {isInReview && (
                  <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full bg-warning animate-pulse" />
                    <span className="font-serif font-bold text-sm text-text">
                      Curriculum Status: Under Faculty Peer Review
                    </span>
                  </div>
                )}
                {isChangesRequested && (
                  <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full bg-danger" />
                    <span className="font-serif font-bold text-sm text-danger">
                      Curriculum Status: Revisions Requested by Peer Reviewer
                    </span>
                  </div>
                )}
                {caseStudy.status === "draft" && (
                  <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full bg-muted" />
                    <span className="font-serif font-bold text-sm text-text">
                      Curriculum Status: Author Draft
                    </span>
                  </div>
                )}
              </div>

              {/* Action Buttons based on User Role & Status */}
              <div className="flex flex-wrap items-center gap-2">
                {(caseStudy.status === "draft" || isChangesRequested) && (
                  <button
                    type="button"
                    disabled={isWorkflowLoading}
                    onClick={handleSubmitForApproval}
                    className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-xl bg-accent hover:bg-accent-hover text-accent-text font-serif font-bold text-xs hover:shadow-md transition-all"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>Submit for Curriculum Approval</span>
                  </button>
                )}

                {isInReview && isReviewer && (
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      disabled={isWorkflowLoading}
                      onClick={() => setRequestChangesModalOpen(true)}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-danger/30 text-danger text-xs font-semibold hover:bg-danger/15"
                    >
                      <MessageSquare className="w-3.5 h-3.5" />
                      <span>Request Changes</span>
                    </button>
                    <button
                      type="button"
                      disabled={isWorkflowLoading}
                      onClick={handleApproveCase}
                      className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-xl bg-success hover:opacity-90 text-white font-serif font-bold text-xs shadow-sm"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Approve & Publish Case</span>
                    </button>
                  </div>
                )}
              </div>
            </div>

            {isChangesRequested && caseStudy.reviewer_comment && (
              <div className="p-3.5 rounded-xl border border-danger/30 bg-danger/15 text-danger text-xs space-y-1">
                <div className="font-bold flex items-center gap-1.5 text-danger">
                  <AlertTriangle className="w-4 h-4 text-danger" />
                  <span>Reviewer Feedback:</span>
                </div>
                <p className="leading-relaxed pl-5 italic">
                  "{caseStudy.reviewer_comment}"
                </p>
              </div>
            )}
          </div>
        )}

        {/* CASE HEADER DOSSIER CARD */}
        <div className="p-6 md:p-8 rounded-2xl border border-border bg-surface shadow-sm space-y-4">
          <div className="flex flex-wrap items-center gap-2">
            <span className="px-2.5 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider bg-primary text-on-primary">
              {caseStudy.type === "flash" ? "⚡ FlashCase Simulation" : "Full Teaching Case"}
            </span>

            <span className="px-2.5 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider bg-primary-soft text-text">
              {caseStudy.format.replace("_", " ")}
            </span>

            <span className="px-2.5 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider bg-primary-soft text-text border border-border">
              Language: {caseStudy.language.toUpperCase()}
            </span>

            {caseStudy.version && (
              <span className="px-2.5 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider bg-success/15 text-success border border-success/30">
                v{caseStudy.version}
              </span>
            )}
          </div>

          {/* Title */}
          {isEditing ? (
            <div>
              <label className="block text-xs font-bold text-muted mb-1">
                Case Study Title
              </label>
              <input
                type="text"
                value={editedTitle}
                onChange={(e) => setEditedTitle(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-border bg-surface text-text font-serif text-2xl font-bold focus:border-accent focus:outline-none"
              />
            </div>
          ) : (
            <h1 className="font-serif text-2xl md:text-3xl font-bold text-text leading-tight">
              {caseStudy.title}
            </h1>
          )}

          {/* Metadata Specifications Strip */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-3 border-t border-border text-xs">
            <div>
              <span className="block text-[10px] uppercase font-bold text-muted">Industry</span>
              <span className="font-semibold text-text">{caseStudy.industry}</span>
            </div>
            <div>
              <span className="block text-[10px] uppercase font-bold text-muted">Functional Focus</span>
              <span className="font-semibold text-text">{caseStudy.function}</span>
            </div>
            <div>
              <span className="block text-[10px] uppercase font-bold text-muted">Target Level</span>
              <span className="font-semibold text-text">{caseStudy.level}</span>
            </div>
            <div>
              <span className="block text-[10px] uppercase font-bold text-muted">Strategic Complexity</span>
              <span className="font-semibold text-accent">
                Level {caseStudy.complexity} / 10
              </span>
            </div>
          </div>
        </div>

        {/* READING PREFERENCES & VISIBILITY STRIP */}
        <div className="p-3.5 rounded-2xl border border-border bg-surface shadow-sm flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex flex-wrap items-center gap-3">
            {/* Reading Time Pill */}
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-primary-soft text-text font-medium">
              <Clock className="w-3.5 h-3.5 text-accent" />
              <span>~{wordMetrics.minutes} min read</span>
              <span className="text-muted text-[11px]">({wordMetrics.words} words)</span>
            </div>

            {/* Visibility Badge */}
            <div className="flex items-center gap-1.5">
              {caseStudy.visibility === "public" ? (
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-success/15 text-success border border-success/30">
                  <Globe className="w-3 h-3" />
                  <span>Public Access</span>
                </span>
              ) : caseStudy.visibility === "private" ? (
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-muted/20 text-muted border border-border">
                  <Lock className="w-3 h-3" />
                  <span>Private Draft</span>
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-primary text-on-primary">
                  <Building className="w-3 h-3 text-on-primary" />
                  <span>{COLLEGE_SHORT} Campus Only</span>
                </span>
              )}

              {!isStudent && (
                <button
                  type="button"
                  onClick={() => {
                    setPublishVisibility(caseStudy.visibility || "sbs_only");
                    setPublishModalOpen(true);
                  }}
                  className="text-[11px] font-semibold text-accent hover:underline ml-1"
                >
                  Change
                </button>
              )}
            </div>
          </div>

          {/* Typography Controls: Font Size & Spacing */}
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1 bg-primary-soft p-1 rounded-xl border border-border">
              <span className="text-[10px] uppercase font-bold text-muted px-1.5">Size</span>
              {(["sm", "base", "lg", "xl"] as const).map((sz) => (
                <button
                  key={sz}
                  type="button"
                  onClick={() => setFontSize(sz)}
                  className={`px-2 py-0.5 rounded-lg text-xs font-bold transition-all ${
                    fontSize === sz
                      ? "bg-primary text-on-primary shadow-sm"
                      : "text-muted hover:text-text"
                  }`}
                >
                  {sz === "sm" ? "A-" : sz === "xl" ? "A+" : sz.toUpperCase()}
                </button>
              ))}
            </div>

            <div className="flex items-center gap-1 bg-primary-soft p-1 rounded-xl border border-border">
              <span className="text-[10px] uppercase font-bold text-muted px-1.5">Spacing</span>
              {(["normal", "relaxed", "loose"] as const).map((sp) => (
                <button
                  key={sp}
                  type="button"
                  onClick={() => setLineSpacing(sp)}
                  className={`px-2 py-0.5 rounded-lg text-xs font-bold transition-all capitalize ${
                    lineSpacing === sp
                      ? "bg-primary text-on-primary shadow-sm"
                      : "text-muted hover:text-text"
                  }`}
                >
                  {sp}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* MAIN CASE 2-COLUMN LAYOUT: STICKY TOC ON DESKTOP + SECTIONS */}
        <div className="flex flex-col lg:flex-row gap-6 items-start">
          {/* DESKTOP STICKY TOC RAIL */}
          <aside className="hidden lg:block lg:w-56 shrink-0 sticky top-20 self-start p-3.5 rounded-2xl border border-border bg-surface shadow-sm space-y-2 text-xs">
            <div className="flex items-center gap-2 pb-2 border-b border-border font-serif font-bold text-text">
              <BookOpen className="w-4 h-4 text-accent" />
              <span>Table of Contents</span>
            </div>
            <nav className="space-y-1">
              <a
                href="#summary"
                className="block px-2.5 py-1.5 rounded-lg font-medium text-muted hover:text-text hover:bg-primary-soft transition-colors"
              >
                1. Executive Summary
              </a>
              <a
                href="#background"
                className="block px-2.5 py-1.5 rounded-lg font-medium text-muted hover:text-text hover:bg-primary-soft transition-colors"
              >
                2. Institutional Context
              </a>
              <a
                href="#challenge"
                className="block px-2.5 py-1.5 rounded-lg font-medium text-muted hover:text-text hover:bg-primary-soft transition-colors"
              >
                3. Market Challenge
              </a>
              <a
                href="#exhibits"
                className="block px-2.5 py-1.5 rounded-lg font-medium text-muted hover:text-text hover:bg-primary-soft transition-colors"
              >
                4. Exhibit 1 (Metrics)
              </a>
              <a
                href="#decision-point"
                className="block px-2.5 py-1.5 rounded-lg font-medium text-muted hover:text-text hover:bg-primary-soft transition-colors"
              >
                5. Decision Point
              </a>
              <a
                href="#questions"
                className="block px-2.5 py-1.5 rounded-lg font-medium text-muted hover:text-text hover:bg-primary-soft transition-colors"
              >
                6. Deliberation Questions
              </a>
              {isApproved && (
                <a
                  href="#reflections"
                  className="block px-2.5 py-1.5 rounded-lg font-medium text-muted hover:text-text hover:bg-primary-soft transition-colors"
                >
                  7. Practitioner Reflections
                </a>
              )}
              {!isStudent && content.teaching_note && (
                <a
                  href="#teaching-note"
                  className="block px-2.5 py-1.5 rounded-lg font-medium text-accent hover:bg-primary-soft transition-colors"
                >
                  8. Teaching Note (Confidential)
                </a>
              )}
              {isStudent ? (
                <a
                  href="#answering"
                  className="block px-2.5 py-1.5 rounded-lg font-bold text-accent bg-primary-soft/50 hover:bg-primary-soft transition-colors"
                >
                  ✏️ Write Your Analysis
                </a>
              ) : (
                <a
                  href="#grading"
                  className="block px-2.5 py-1.5 rounded-lg font-bold text-success hover:bg-primary-soft transition-colors"
                >
                  📊 Cohort Submissions
                </a>
              )}
            </nav>
          </aside>

          {/* MAIN SECTIONS CONTAINER */}
          <div className="flex-1 min-w-0 space-y-6">
            {/* 1. EXECUTIVE SUMMARY */}
            <section id="summary" className="p-6 md:p-8 rounded-2xl border border-border bg-surface shadow-sm space-y-3">
              <div className="flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-accent" />
                <h2 className="font-serif text-xl font-bold text-text">
                  Executive Summary
                </h2>
              </div>
              {isEditing ? (
                <textarea
                  rows={4}
                  value={editedContent?.summary || ""}
                  onChange={(e) =>
                    setEditedContent({ ...editedContent!, summary: e.target.value })
                  }
                  className="w-full p-3 text-xs leading-relaxed rounded-xl border border-border bg-surface text-text focus:border-accent focus:outline-none"
                />
              ) : (
                <p className={`text-text ${typographyClass}`}>
                  {content.summary}
                </p>
              )}
            </section>

            {/* 2. BACKGROUND & CONTEXT */}
            <section id="background" className="p-6 md:p-8 rounded-2xl border border-border bg-surface shadow-sm space-y-3">
              <div className="flex items-center gap-2">
                <Building className="w-5 h-5 text-accent" />
                <h2 className="font-serif text-xl font-bold text-text">
                  Background & Institutional Context
                </h2>
              </div>
              {isEditing ? (
                <textarea
                  rows={6}
                  value={editedContent?.background || ""}
                  onChange={(e) =>
                    setEditedContent({ ...editedContent!, background: e.target.value })
                  }
                  className="w-full p-3 text-xs leading-relaxed rounded-xl border border-border bg-surface text-text focus:border-accent focus:outline-none"
                />
              ) : (
                <CaseNarrativeView content={content.background} className={typographyClass} />
              )}
            </section>

            {/* 3. THE CORE STRATEGIC CHALLENGE */}
            <section id="challenge" className="p-6 md:p-8 rounded-2xl border border-border bg-surface shadow-sm space-y-3">
              <div className="flex items-center gap-2">
                <Layers className="w-5 h-5 text-accent" />
                <h2 className="font-serif text-xl font-bold text-text">
                  The Operational & Market Challenge
                </h2>
              </div>
              {isEditing ? (
                <textarea
                  rows={6}
                  value={editedContent?.challenge || ""}
                  onChange={(e) =>
                    setEditedContent({ ...editedContent!, challenge: e.target.value })
                  }
                  className="w-full p-3 text-xs leading-relaxed rounded-xl border border-border bg-surface text-text focus:border-accent focus:outline-none"
                />
              ) : (
                <CaseNarrativeView content={content.challenge} className={typographyClass} />
              )}
            </section>

        {/* 4. EXHIBIT 1: KEY DATA TABLE */}
        <section id="exhibits" className="p-6 md:p-8 rounded-2xl border border-border bg-surface shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Table className="w-5 h-5 text-accent" />
              <h2 className="font-serif text-xl font-bold text-text">
                Exhibit 1: Key Indicators & Operating Metrics
              </h2>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setExpandExhibitModalOpen(true)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-border text-xs font-semibold text-text hover:border-accent hover:text-accent transition-colors"
                title="Expand Exhibit to full screen modal view"
              >
                <Maximize2 className="w-3.5 h-3.5" />
                <span>Expand Exhibit</span>
              </button>
              {isEditing && (
                <button
                  type="button"
                  onClick={handleAddKeyDataRow}
                  className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg border border-accent/40 text-xs font-semibold text-accent hover:bg-primary-soft/50"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add Row</span>
                </button>
              )}
            </div>
          </div>

          <div className="overflow-x-auto rounded-xl border border-border">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-primary text-on-primary font-serif">
                  <th className="p-3 font-semibold">Financial / Operating Metric</th>
                  <th className="p-3 font-semibold">Value</th>
                  <th className="p-3 font-semibold">Period</th>
                  <th className="p-3 font-semibold">Pedagogical Notes</th>
                  {isEditing && <th className="p-3 font-semibold text-right">Action</th>}
                </tr>
              </thead>
              <tbody className="divide-y divide-border bg-surface">
                {content.key_data.map((row, idx) => (
                  <tr key={idx} className="hover:bg-primary-soft/30">
                    <td className="p-3 font-medium text-text">
                      {isEditing ? (
                        <input
                          type="text"
                          value={row.metric}
                          onChange={(e) => handleKeyDataChange(idx, "metric", e.target.value)}
                          className="w-full px-2 py-1 rounded border border-border bg-surface text-text"
                        />
                      ) : (
                        row.metric
                      )}
                    </td>
                    <td className="p-3 text-text font-mono">
                      {isEditing ? (
                        <input
                          type="text"
                          value={row.value}
                          onChange={(e) => handleKeyDataChange(idx, "value", e.target.value)}
                          className="w-full px-2 py-1 rounded border border-border bg-surface text-text font-mono"
                        />
                      ) : (
                        row.value
                      )}
                    </td>
                    <td className="p-3 text-muted">
                      {isEditing ? (
                        <input
                          type="text"
                          value={row.period || ""}
                          onChange={(e) => handleKeyDataChange(idx, "period", e.target.value)}
                          className="w-full px-2 py-1 rounded border border-border bg-surface text-text"
                        />
                      ) : (
                        row.period || "—"
                      )}
                    </td>
                    <td className="p-3 text-muted italic">
                      {isEditing ? (
                        <input
                          type="text"
                          value={row.notes || ""}
                          onChange={(e) => handleKeyDataChange(idx, "notes", e.target.value)}
                          className="w-full px-2 py-1 rounded border border-border bg-surface text-text"
                        />
                      ) : (
                        row.notes || "illustrative"
                      )}
                    </td>
                    {isEditing && (
                      <td className="p-3 text-right">
                        <button
                          type="button"
                          onClick={() => handleDeleteKeyDataRow(idx)}
                          className="p-1 text-muted hover:text-danger"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Dynamic Interactive Financial Sensitivity Exhibit */}
          {content.key_data && content.key_data.length > 0 && (
            <InteractiveFinancialExhibit
              caseTitle={caseStudy?.title || "Business Case Study"}
              keyData={content.key_data}
              onInsertToAnswer={
                currentUser?.role === "student" && studentAnswer?.status !== "submitted"
                  ? (summaryText) => {
                      setAnswerText((prev) => (prev ? `${prev}\n\n${summaryText}` : summaryText));
                      setAutosaveStatus("Quantitative exhibit findings inserted into draft");
                    }
                  : undefined
              }
            />
          )}
        </section>

        {/* 5. STRATEGIC DECISION POINT */}
        <section id="decision-point" className="p-6 md:p-8 rounded-2xl border-l-4 border-accent bg-primary-soft/40 border border-border shadow-sm space-y-2">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-accent">
            <Sparkles className="w-4 h-4" />
            <span>Executive Boardroom Decision Point</span>
          </div>
          {isEditing ? (
            <textarea
              rows={4}
              value={editedContent?.decision_point || ""}
              onChange={(e) =>
                setEditedContent({ ...editedContent!, decision_point: e.target.value })
              }
              className="w-full p-3 text-xs leading-relaxed rounded-xl border border-border bg-surface text-text focus:border-accent focus:outline-none"
            />
          ) : (
            <blockquote className="font-serif text-base md:text-lg italic text-text leading-relaxed">
              "{content.decision_point}"
            </blockquote>
          )}
        </section>

        {/* 6. DISCUSSION QUESTIONS */}
        <section id="questions" className="p-6 md:p-8 rounded-2xl border border-border bg-surface shadow-sm space-y-4">
          <div className="flex items-center gap-2">
            <HelpCircle className="w-5 h-5 text-accent" />
            <h2 className="font-serif text-xl font-bold text-text">
              Classroom Deliberation Questions
            </h2>
          </div>

          <div className="space-y-3">
            {content.discussion_questions.map((q, idx) => (
              <div
                key={idx}
                className="p-4 rounded-xl border border-border bg-primary-soft/30 flex items-start gap-3"
              >
                <span className="w-6 h-6 rounded-full bg-primary text-on-primary font-bold text-xs flex items-center justify-center shrink-0 mt-0.5">
                  {idx + 1}
                </span>
                <p className="text-xs md:text-sm font-medium text-text leading-relaxed">
                  {q}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* ========================================================================= */}
        {/* STUDENT CASE ANSWERING COMPOSER: "WRITE YOUR ANSWER" WITH AUTOSAVE & WORD COUNT */}
        {/* ========================================================================= */}
        <section id="answering" className="p-6 md:p-8 rounded-2xl border border-accent/40 bg-surface shadow-md space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border pb-4">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-accent text-accent-text flex items-center justify-center font-bold">
                <PenTool className="w-5 h-5" />
              </div>
              <div>
                <h2 className="font-serif text-xl font-bold text-text">
                  Write Your Strategic Analysis & Executive Defense
                </h2>
                <p className="text-xs text-muted">
                  Draft your response to the central dilemma. Evaluated against the official {COLLEGE_SHORT} curriculum rubric.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {isAnswerLocked ? (
                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-warning/15 text-warning border border-warning/30 text-xs font-bold">
                  <Lock className="w-3.5 h-3.5" />
                  <span>Submitted & Locked</span>
                </span>
              ) : (
                <span
                  role="status"
                  aria-live="polite"
                  className="inline-flex items-center gap-1.5 text-xs text-muted bg-primary-soft px-3 py-1.5 rounded-xl font-medium"
                >
                  <Clock className="w-3.5 h-3.5 text-accent" />
                  <span>{autosaveStatus}</span>
                </span>
              )}
            </div>
          </div>

          {/* Rubric Criteria Overview Pill Strip */}
          {rubric && rubric.criteria.length > 0 && (
            <div className="p-3.5 rounded-xl bg-primary-soft/40 border border-border space-y-2">
              <span className="text-[10px] uppercase font-bold tracking-wider text-accent block">
                Evaluation Criteria ({rubric.criteria.reduce((s, c) => s + c.max_marks, 0)} Total Marks)
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2">
                {rubric.criteria.map((c, i) => (
                  <div
                    key={i}
                    className="p-2 rounded-lg bg-surface border border-border text-xs"
                  >
                    <div className="flex justify-between font-bold text-text">
                      <span className="truncate pr-1">{c.name}</span>
                      <span className="text-accent shrink-0">{c.max_marks} pts</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Published Final Grade Callout if already evaluated */}
          {studentGrade && studentGrade.is_published && studentGrade.final_marks !== null && (
            <div className="p-5 rounded-2xl border border-success/30 bg-success/15 text-text space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Award className="w-6 h-6 text-accent" />
                  <div>
                    <h3 className="font-serif font-bold text-lg">
                      Official Faculty Grade: {studentGrade.final_marks} / 100
                    </h3>
                    <span className="text-xs text-success font-semibold">
                      Published {new Date(studentGrade.published_at || "").toLocaleDateString()}
                    </span>
                  </div>
                </div>

                <a
                  href={`/api/portfolio/${currentUser?.id || "usr-student-1"}/certificate/${caseId}`}
                  download
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-accent hover:bg-accent-hover text-accent-text font-serif font-bold text-xs shadow-sm"
                >
                  <Award className="w-4 h-4 text-accent-text" />
                  <span>Download Certificate (PDF)</span>
                </a>
              </div>

              {studentGrade.faculty_comment && (
                <div className="p-3 rounded-xl bg-surface border border-border text-xs italic">
                  <strong>Faculty Feedback:</strong> "{studentGrade.faculty_comment}"
                </div>
              )}
            </div>
          )}

          {/* Student Analysis: Read-only submitted container OR Draft Textarea */}
          {isAnswerLocked ? (
            <div className="space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-3 rounded-xl bg-primary-soft/50 border border-border text-xs">
                <div className="flex items-center gap-2 font-medium text-text">
                  <Lock className="w-4 h-4 text-warning" />
                  <span>
                    Submitted on{" "}
                    {studentAnswer?.submitted_at
                      ? new Date(studentAnswer.submitted_at).toLocaleString()
                      : "Record Date"}{" "}
                    (Read-only archive)
                  </span>
                </div>
                <span className="font-mono text-accent font-bold">
                  {wordCount} words recorded
                </span>
              </div>

              <div className="w-full p-5 rounded-xl border border-border bg-primary-soft/20 text-xs md:text-sm font-mono whitespace-pre-wrap leading-relaxed text-text select-text min-h-[160px]">
                {answerText || studentAnswer?.text}
              </div>

              <div className="text-xs text-muted italic">
                This answer has been submitted and locked. You can review and download certificates anytime in your Portfolio.
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              <div className="flex items-center justify-between text-xs text-muted">
                <span className="font-bold text-text">
                  Your Executive Memorandum
                </span>
                <span className="font-mono text-accent font-bold">
                  {wordCount} words (Recommended: 300 – 600 words)
                </span>
              </div>

              <textarea
                rows={10}
                placeholder="Structure your analysis: 1. Strategic Diagnosis, 2. Quantitative Model & Tradeoffs, 3. Actionable Implementation Plan, 4. Risk Mitigation..."
                value={answerText}
                onChange={handleAnswerTextChange}
                className="w-full p-4 rounded-xl border bg-surface border-border text-text focus:border-accent text-xs md:text-sm leading-relaxed font-mono focus:outline-none transition-all"
              />

              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2">
                <span className="text-xs text-muted italic">
                  Autosave saves your progress locally and to your {COLLEGE_SHORT} profile automatically.
                </span>

                <button
                  type="button"
                  disabled={isSubmittingAnswer || wordCount === 0}
                  onClick={handleSubmitStudentAnswer}
                  className="inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl bg-accent hover:bg-accent-hover text-accent-text font-serif font-bold text-xs shadow-md transition-all disabled:opacity-50"
                >
                  <Lock className="w-4 h-4" />
                  <span>{isSubmittingAnswer ? "Submitting..." : "Submit & Lock Final Analysis"}</span>
                </button>
              </div>
            </div>
          )}
        </section>

        {/* ========================================================================= */}
        {/* FACULTY COHORT GRADING & AI EVALUATION (FOR FACULTY / ADMIN) */}
        {/* ========================================================================= */}
        {!isStudent && (
          <section id="grading" className="p-6 md:p-8 rounded-2xl border border-border bg-surface shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-border pb-4">
              <div className="flex items-center gap-2">
                <BarChart2 className="w-5 h-5 text-accent" />
                <div>
                  <h2 className="font-serif text-xl font-bold text-text">
                    Cohort Submissions & Grading Portal
                  </h2>
                  <p className="text-xs text-muted">
                    Review student answers, generate {AI_ENGINE_LABEL} criteria scores, and publish final accredited marks.
                  </p>
                </div>
              </div>
              <span className="text-xs px-2.5 py-1 rounded-full bg-primary text-on-primary font-bold">
                {caseSubmissions.length} Submissions
              </span>
            </div>

            {caseSubmissions.length === 0 ? (
              <p className="text-xs text-muted italic py-4">
                No student submissions recorded for this case study yet.
              </p>
            ) : (
              <div className="space-y-3">
                {caseSubmissions.map((sub) => {
                  const isGraded = sub.grade && sub.grade.final_marks !== null;
                  return (
                    <div
                      key={sub.id}
                      className="p-4 rounded-xl border border-border hover:border-accent transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="font-serif font-bold text-sm text-text">
                            {sub.student_name || `${COLLEGE_SHORT} Student`}
                          </span>
                          <span className="text-xs text-muted">({sub.student_email})</span>
                          {isGraded ? (
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-success/15 text-success">
                              Graded: {sub.grade.final_marks} / 100
                            </span>
                          ) : (
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-warning/15 text-warning">
                              Awaiting Evaluation
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-3 text-xs text-muted">
                          <span>{sub.word_count || sub.text.split(/\s+/).length} words</span>
                          <span>•</span>
                          <span>
                            Submitted: {sub.submitted_at ? new Date(sub.submitted_at).toLocaleString() : "Recently"}
                          </span>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() => handleOpenGradingModal(sub)}
                        className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-accent hover:bg-accent-hover text-accent-text font-serif font-bold text-xs shadow-sm"
                      >
                        <Award className="w-3.5 h-3.5" />
                        <span>{isGraded ? "Edit / Review Grade" : "Grade Submission"}</span>
                      </button>
                    </div>
                  );
                })}
              </div>
            )}
          </section>
        )}

        {/* 7. FACILITATOR TEACHING NOTE (FOR FACULTY ONLY) */}
        {!isStudent && content.teaching_note && (
          <section id="teaching-note" className="p-6 md:p-8 rounded-2xl border border-border bg-surface shadow-sm space-y-6">
            <div className="flex items-center justify-between border-b border-border pb-4">
              <div className="flex items-center gap-2">
                <GraduationCap className="w-6 h-6 text-accent" />
                <div>
                  <h2 className="font-serif text-xl font-bold text-text">
                    Facilitator Teaching Note
                  </h2>
                  <span className="text-[11px] font-bold text-accent uppercase tracking-wider">
                    Confidential • {COLLEGE_SHORT} Faculty Eyes Only
                  </span>
                </div>
              </div>
            </div>

            {/* Pedagogical Objectives */}
            <div className="space-y-2">
              <h3 className="text-xs font-bold uppercase tracking-wider text-text">
                Pedagogical Learning Objectives
              </h3>
              <ul className="space-y-1.5 text-xs text-text">
                {content.teaching_note.objectives.map((obj, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-accent shrink-0 mt-0.5" />
                    <span>{obj}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Recommended Class Flow */}
            <div className="space-y-2">
              <h3 className="text-xs font-bold uppercase tracking-wider text-text">
                Classroom Timing & Discussion Flow
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {content.teaching_note.class_flow.map((flow, i) => (
                  <div
                    key={i}
                    className="p-3.5 rounded-xl border border-border bg-primary-soft/30 space-y-1"
                  >
                    <div className="flex items-center justify-between text-xs font-bold text-text">
                      <span>{flow.phase}</span>
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-primary text-on-primary font-bold">
                        {flow.duration_minutes} min
                      </span>
                    </div>
                    <p className="text-[11px] text-muted leading-relaxed">
                      {flow.activity}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* Theoretical Frameworks */}
            <div className="space-y-2">
              <h3 className="text-xs font-bold uppercase tracking-wider text-text">
                Theoretical Frameworks Applied
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {content.teaching_note.frameworks.map((fw, i) => (
                  <div
                    key={i}
                    className="p-4 rounded-xl border border-border bg-surface space-y-2"
                  >
                    <h4 className="font-serif font-bold text-sm text-accent">
                      {fw.name}
                    </h4>
                    <p className="text-[11px] text-muted">
                      <strong>Application:</strong> {fw.application}
                    </p>
                    <p className="text-[11px] text-text font-semibold border-t border-border pt-1.5">
                      Key Takeaway: {fw.key_takeaway}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* 8. ALUMNI PRACTITIONER REFLECTIONS */}
        {isApproved && (
          <div id="reflections">
            <PractitionerReflectionsSection
              caseId={caseId}
              currentUser={currentUser}
            />
          </div>
        )}

          </div> {/* Close Main Sections Container */}
        </div> {/* Close 2-Column Layout */}

        {/* MODAL: RUBRIC MANAGER & AI SUGGESTER (FACULTY & ADMIN) */}
        {rubricModalOpen && (
          <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <div className="w-full max-w-2xl rounded-2xl bg-surface border border-border shadow-2xl p-6 space-y-4 max-h-[85vh] flex flex-col">
              <div className="flex items-center justify-between pb-3 border-b border-border">
                <div className="flex items-center gap-2">
                  <ClipboardCheck className="w-5 h-5 text-accent" />
                  <h3 className="font-serif font-bold text-lg text-text">
                    Curriculum Evaluation Rubric
                  </h3>
                </div>
                <button
                  type="button"
                  onClick={() => setRubricModalOpen(false)}
                  className="text-muted hover:text-text"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {!isStudent && (
                <div className="flex items-center justify-between p-3 rounded-xl bg-primary-soft/60 border border-border text-xs">
                  <div className="space-y-0.5">
                    <span className="font-bold text-text">
                      Automated Rubric Architect
                    </span>
                    <p className="text-[11px] text-muted">
                      Generate 4 balanced criteria customized for this case's pedagogical objectives.
                    </p>
                  </div>
                  <button
                    type="button"
                    disabled={isSuggestingRubric}
                    onClick={handleSuggestRubric}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-accent text-accent-text font-bold hover:bg-accent-hover transition-all shrink-0"
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>{isSuggestingRubric ? "Synthesizing..." : "Suggest Rubric with AI"}</span>
                  </button>
                </div>
              )}

              {/* Criteria List */}
              <div className="space-y-3 overflow-y-auto flex-1 pr-1">
                {editedCriteria.map((c, i) => (
                  <div
                    key={i}
                    className="p-3.5 rounded-xl border border-border bg-primary-soft/20 space-y-2"
                  >
                    <div className="flex items-center justify-between gap-3">
                      {!isStudent ? (
                        <input
                          type="text"
                          value={c.name}
                          onChange={(e) => {
                            const copy = [...editedCriteria];
                            copy[i].name = e.target.value;
                            setEditedCriteria(copy);
                          }}
                          className="flex-1 px-2.5 py-1 text-xs font-bold rounded-lg border border-border bg-surface text-text"
                        />
                      ) : (
                        <span className="font-bold text-xs text-text">
                          {c.name}
                        </span>
                      )}

                      <div className="flex items-center gap-1.5 shrink-0">
                        <span className="text-[10px] text-muted font-bold uppercase">Max:</span>
                        {!isStudent ? (
                          <input
                            type="number"
                            value={c.max_marks}
                            onChange={(e) => {
                              const copy = [...editedCriteria];
                              copy[i].max_marks = Number(e.target.value);
                              setEditedCriteria(copy);
                            }}
                            className="w-14 px-2 py-1 text-xs font-bold rounded-lg border border-border bg-surface text-text font-mono text-right"
                          />
                        ) : (
                          <span className="font-bold text-xs font-mono text-accent">
                            {c.max_marks} pts
                          </span>
                        )}
                        {!isStudent && (
                          <button
                            type="button"
                            onClick={() => {
                              const copy = editedCriteria.filter((_, idx) => idx !== i);
                              setEditedCriteria(copy);
                            }}
                            className="p-1 text-muted hover:text-danger"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </div>

                    {!isStudent ? (
                      <textarea
                        rows={2}
                        value={c.description}
                        onChange={(e) => {
                          const copy = [...editedCriteria];
                          copy[i].description = e.target.value;
                          setEditedCriteria(copy);
                        }}
                        className="w-full p-2 text-xs rounded-lg border border-border bg-surface text-text"
                      />
                    ) : (
                      <p className="text-xs text-muted leading-relaxed">
                        {c.description}
                      </p>
                    )}
                  </div>
                ))}
              </div>

              {!isStudent && (
                <div className="flex items-center justify-between pt-3 border-t border-border">
                  <button
                    type="button"
                    onClick={() =>
                      setEditedCriteria([
                        ...editedCriteria,
                        {
                          name: "New Analytical Dimension",
                          max_marks: 20,
                          description: "Evaluation of strategic problem solving.",
                        },
                      ])
                    }
                    className="text-xs font-bold text-accent hover:underline flex items-center gap-1"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add Dimension</span>
                  </button>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setRubricModalOpen(false)}
                      className="px-3 py-1.5 rounded-lg border border-border text-muted hover:bg-primary-soft text-xs font-semibold"
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      disabled={isSavingRubric}
                      onClick={handleSaveRubric}
                      className="px-4 py-1.5 rounded-lg bg-accent hover:bg-accent-hover text-accent-text font-serif font-bold text-xs shadow-sm"
                    >
                      {isSavingRubric ? "Saving..." : "Save Rubric"}
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* MODAL: FACULTY GRADING & AI EVALUATION MODAL */}
        {gradingModalOpen && selectedSubmission && (
          <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <div className="w-full max-w-3xl rounded-2xl bg-surface border border-border shadow-2xl p-6 space-y-4 max-h-[85vh] flex flex-col">
              <div className="flex items-center justify-between pb-3 border-b border-border">
                <div className="flex items-center gap-2">
                  <Award className="w-5 h-5 text-accent" />
                  <div>
                    <h3 className="font-serif font-bold text-base text-text">
                      Grade Submission: {selectedSubmission.student_name}
                    </h3>
                    <span className="text-xs text-muted">{selectedSubmission.student_email}</span>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setGradingModalOpen(false)}
                  className="text-muted hover:text-text"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Student Essay Viewer */}
              <div className="space-y-1">
                <span className="text-[10px] font-bold uppercase tracking-wider text-muted">
                  Student Essay Text ({selectedSubmission.word_count || selectedSubmission.text.split(/\s+/).length} words)
                </span>
                <div className="max-h-36 overflow-y-auto p-3.5 rounded-xl bg-primary-soft/30 border border-border font-mono text-xs leading-relaxed text-text">
                  {selectedSubmission.text}
                </div>
              </div>

              {/* Academic Integrity & Grounding Score */}
              <IntegrityReportBadge answerId={selectedSubmission.id} />

              {/* AI Grading Trigger */}
              <div className="p-3.5 rounded-xl bg-primary-soft/60 border border-border flex items-center justify-between gap-3">
                <div className="space-y-0.5">
                  <span className="text-xs font-bold text-text">
                    {AI_ENGINE_LABEL} Rubric Assessment
                  </span>
                  <p className="text-[11px] text-muted">
                    Calculates provisional criteria scores strictly within rubric bounds and drafts constructive feedback.
                  </p>
                </div>
                <button
                  type="button"
                  disabled={isGradingLoading}
                  onClick={handleRunAIGrading}
                  className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-accent text-accent-text font-bold text-xs hover:bg-accent-hover transition-all shrink-0"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>{isGradingLoading ? "Analyzing..." : "Run AI Evaluation"}</span>
                </button>
              </div>

              {/* Rubric Criteria Override Scores */}
              <div className="space-y-3 overflow-y-auto flex-1 pr-1">
                <span className="text-[10px] font-bold uppercase tracking-wider text-muted block">
                  Criterion Scoring & Overrides
                </span>
                {rubric?.criteria.map((c, i) => {
                  const score = facultyScoresInput[c.name] ?? 0;
                  return (
                    <div
                      key={i}
                      className="p-3 rounded-xl border border-border flex items-center justify-between gap-3"
                    >
                      <div className="min-w-0 flex-1">
                        <span className="font-bold text-xs text-text block truncate">
                          {c.name}
                        </span>
                        <span className="text-[11px] text-muted">Max Points: {c.max_marks}</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <input
                          type="number"
                          max={c.max_marks}
                          min={0}
                          value={score}
                          onChange={(e) => {
                            const val = Math.max(0, Math.min(c.max_marks, Number(e.target.value)));
                            const updated = { ...facultyScoresInput, [c.name]: val };
                            setFacultyScoresInput(updated);
                            // Recalculate total
                            const sum = Object.values(updated).reduce((s, v) => s + v, 0);
                            setFacultyTotalMarksInput(sum);
                          }}
                          className="w-16 px-2.5 py-1 text-xs font-bold font-mono rounded border border-border bg-surface text-text text-right"
                        />
                        <span className="text-xs text-muted">/ {c.max_marks}</span>
                      </div>
                    </div>
                  );
                })}

                {/* Faculty Comment Input */}
                <div className="space-y-1 pt-1">
                  <label className="block text-xs font-bold text-text">
                    Faculty Commendation & Feedback (Published to Student)
                  </label>
                  <textarea
                    rows={3}
                    placeholder="Enter final comments, commendations, or strategic pointers for the student..."
                    value={facultyCommentInput}
                    onChange={(e) => setFacultyCommentInput(e.target.value)}
                    className="w-full p-2.5 text-xs rounded-xl border border-border bg-surface text-text"
                  />
                </div>
              </div>

              {/* Publish Footer */}
              <div className="flex items-center justify-between pt-3 border-t border-border">
                <div className="flex items-center gap-2">
                  <span className="text-xs text-muted font-bold uppercase">Total Final Marks:</span>
                  <span className="font-serif font-bold text-lg text-success">
                    {facultyTotalMarksInput} / {rubric?.criteria.reduce((s, c) => s + c.max_marks, 0) || 100}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setGradingModalOpen(false)}
                    className="px-3 py-1.5 rounded-lg border border-border text-muted hover:bg-primary-soft text-xs font-semibold"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    disabled={isGradingLoading}
                    onClick={handlePublishGrade}
                    className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-xl bg-success hover:bg-success/90 text-white font-serif font-bold text-xs shadow-sm"
                  >
                    <CheckCircle className="w-3.5 h-3.5" />
                    <span>{isGradingLoading ? "Publishing..." : "Publish Final Grade"}</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* MODAL: VERSION HISTORY DRAWER / DIFF VIEWER */}
        {versionModalOpen && (
          <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <div className="w-full max-w-4xl rounded-2xl bg-surface border border-border shadow-2xl p-6 space-y-4 max-h-[85vh] flex flex-col">
              <div className="flex items-center justify-between pb-3 border-b border-border">
                <div className="flex items-center gap-2 text-text">
                  <History className="w-5 h-5 text-accent" />
                  <div>
                    <h3 className="font-serif font-bold text-lg">Case Study Version History</h3>
                    <p className="text-xs text-muted">
                      Audit immutable curriculum revisions, inspect side-by-side changes, or rollback safely.
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setVersionModalOpen(false);
                    setPreviewVersion(null);
                    setDiffMode(false);
                  }}
                  className="text-muted hover:text-text"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {previewVersion ? (
                <div className="space-y-4 overflow-y-auto flex-1 pr-2">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 rounded-xl bg-primary-soft/60 border border-border">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-accent">
                          Previewing Version {previewVersion.version_number}
                        </span>
                        <span className="text-[11px] text-muted">
                          • Archived {new Date(previewVersion.created_at).toLocaleString()}
                        </span>
                      </div>
                      <p className="text-xs text-text italic mt-0.5">
                        "{previewVersion.change_summary || "Curriculum update"}"
                      </p>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => setDiffMode(!diffMode)}
                        className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-bold transition-all ${
                          diffMode
                            ? "bg-accent text-accent-text border-accent"
                            : "border-border text-text hover:border-accent"
                        }`}
                      >
                        <GitCompare className="w-3.5 h-3.5" />
                        <span>{diffMode ? "Exit Diff" : "Side-by-side Diff"}</span>
                      </button>

                      {!isStudent && (
                        <button
                          type="button"
                          disabled={isRestoringVersion}
                          onClick={() => handleRestoreVersion(previewVersion.version_number)}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-warning hover:bg-warning/90 text-navy font-bold text-xs shadow-sm transition-all"
                        >
                          <RotateCw className={`w-3.5 h-3.5 ${isRestoringVersion ? "animate-spin" : ""}`} />
                          <span>{isRestoringVersion ? "Restoring..." : "Restore This Version"}</span>
                        </button>
                      )}

                      <button
                        type="button"
                        onClick={() => setPreviewVersion(null)}
                        className="px-3 py-1.5 rounded-lg bg-primary text-on-primary text-xs font-bold"
                      >
                        Back
                      </button>
                    </div>
                  </div>

                  {diffMode ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                      {/* Left: Historical Snapshot */}
                      <div className="p-4 rounded-xl border border-border bg-primary-soft/20 space-y-3">
                        <div className="flex items-center justify-between pb-2 border-b border-border font-bold">
                          <span className="text-muted uppercase text-[10px]">Version {previewVersion.version_number} (Historical)</span>
                        </div>
                        <div>
                          <span className="text-[10px] uppercase font-bold text-muted">Title:</span>
                          <h4 className="font-serif font-bold text-sm text-text">{previewVersion.title}</h4>
                        </div>
                        <div>
                          <span className="text-[10px] uppercase font-bold text-muted">Executive Summary:</span>
                          <p className="text-text leading-relaxed mt-1">{previewVersion.content.summary}</p>
                        </div>
                        <div>
                          <span className="text-[10px] uppercase font-bold text-muted">Core Challenge:</span>
                          <p className="text-text leading-relaxed mt-1">{previewVersion.content.challenge}</p>
                        </div>
                        <div>
                          <span className="text-[10px] uppercase font-bold text-muted">Decision Point:</span>
                          <blockquote className="italic text-text border-l-2 border-muted pl-2 mt-1">
                            "{previewVersion.content.decision_point}"
                          </blockquote>
                        </div>
                      </div>

                      {/* Right: Current Live Version */}
                      <div className="p-4 rounded-xl border border-success/40 bg-success/5 space-y-3">
                        <div className="flex items-center justify-between pb-2 border-b border-border font-bold">
                          <span className="text-success uppercase text-[10px]">Version {caseStudy.version || 1} (Current Live)</span>
                        </div>
                        <div>
                          <span className="text-[10px] uppercase font-bold text-muted">Title:</span>
                          <h4 className="font-serif font-bold text-sm text-text">{caseStudy.title}</h4>
                        </div>
                        <div>
                          <span className="text-[10px] uppercase font-bold text-muted">Executive Summary:</span>
                          <p className="text-text leading-relaxed mt-1">{caseStudy.content.summary}</p>
                        </div>
                        <div>
                          <span className="text-[10px] uppercase font-bold text-muted">Core Challenge:</span>
                          <p className="text-text leading-relaxed mt-1">{caseStudy.content.challenge}</p>
                        </div>
                        <div>
                          <span className="text-[10px] uppercase font-bold text-muted">Decision Point:</span>
                          <blockquote className="italic text-text border-l-2 border-success pl-2 mt-1">
                            "{caseStudy.content.decision_point}"
                          </blockquote>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="p-4 rounded-xl border border-border space-y-4 text-xs">
                      <div>
                        <span className="text-[10px] uppercase font-bold text-muted">Title</span>
                        <h4 className="font-serif font-bold text-base text-text">{previewVersion.title}</h4>
                      </div>
                      <div>
                        <span className="text-[10px] uppercase font-bold text-muted">Executive Summary</span>
                        <p className="text-text leading-relaxed mt-1">{previewVersion.content.summary}</p>
                      </div>
                      <div>
                        <span className="text-[10px] uppercase font-bold text-muted">Core Challenge</span>
                        <p className="text-text leading-relaxed mt-1">{previewVersion.content.challenge}</p>
                      </div>
                      <div>
                        <span className="text-[10px] uppercase font-bold text-muted">Decision Point</span>
                        <blockquote className="font-serif italic text-text border-l-2 border-accent pl-3 mt-1">
                          "{previewVersion.content.decision_point}"
                        </blockquote>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="space-y-3 overflow-y-auto flex-1 pr-1">
                  {/* Live Version Card */}
                  <div className="p-4 rounded-xl border border-success/40 bg-success/10 flex items-center justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-success text-white uppercase">
                          Current Live Version
                        </span>
                        <span className="font-bold text-xs text-text">
                          Version {caseStudy.version || 1}
                        </span>
                      </div>
                      <p className="text-xs text-muted mt-1">
                        {caseStudy.title}
                      </p>
                    </div>
                    <span className="text-xs font-bold text-success">Active</span>
                  </div>

                  {versions.length === 0 ? (
                    <p className="text-xs text-muted italic p-4 text-center">
                      No archived revisions yet. Previous versions are preserved automatically upon curriculum updates.
                    </p>
                  ) : (
                    versions.map((ver) => (
                      <div
                        key={ver.id}
                        className="p-4 rounded-xl border border-border flex items-center justify-between gap-3"
                      >
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-primary text-on-primary">
                              Version {ver.version_number}
                            </span>
                            <span className="text-[11px] text-muted">
                              {new Date(ver.created_at).toLocaleString()}
                            </span>
                          </div>
                          <h5 className="font-serif font-bold text-xs text-text">
                            {ver.title}
                          </h5>
                          {ver.change_summary && (
                            <p className="text-[11px] text-muted italic">
                              "{ver.change_summary}"
                            </p>
                          )}
                        </div>

                        <button
                          type="button"
                          onClick={() => setPreviewVersion(ver)}
                          className="px-3 py-1.5 rounded-lg border border-border text-text hover:border-accent hover:text-accent text-xs font-semibold"
                        >
                          Inspect / Diff
                        </button>
                      </div>
                    ))
                  )}
                </div>
              )}
            </div>
          </div>
        )}

        {/* MODAL: EXHIBIT EXPANSION (FULL SCREEN VIEW) */}
        {expandExhibitModalOpen && (
          <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <div className="w-full max-w-4xl rounded-2xl bg-surface border border-border shadow-2xl p-6 space-y-4 max-h-[90vh] flex flex-col">
              <div className="flex items-center justify-between pb-3 border-b border-border">
                <div className="flex items-center gap-2">
                  <Table className="w-5 h-5 text-accent" />
                  <div>
                    <h3 className="font-serif font-bold text-lg text-text">
                      Exhibit 1: Key Indicators & Operating Metrics
                    </h3>
                    <p className="text-xs text-muted">
                      Full analytical dataset for quantitative modeling and spreadsheet export.
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setExpandExhibitModalOpen(false)}
                  className="text-muted hover:text-text"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={handleCopyTable}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-border text-xs font-semibold text-text hover:border-accent hover:text-accent transition-colors"
                >
                  {tableCopied ? (
                    <Check className="w-3.5 h-3.5 text-success" />
                  ) : (
                    <Copy className="w-3.5 h-3.5" />
                  )}
                  <span>{tableCopied ? "Copied TSV!" : "Copy Table (TSV)"}</span>
                </button>

                <button
                  type="button"
                  onClick={handleDownloadExhibitCSV}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-accent hover:bg-accent-hover text-accent-text text-xs font-semibold shadow-sm transition-all"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download CSV</span>
                </button>
              </div>

              <div className="overflow-x-auto rounded-xl border border-border flex-1">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-primary text-on-primary font-serif">
                      <th className="p-3 font-semibold">Financial / Operating Metric</th>
                      <th className="p-3 font-semibold">Value</th>
                      <th className="p-3 font-semibold">Period</th>
                      <th className="p-3 font-semibold">Pedagogical Notes</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border bg-surface">
                    {content.key_data.map((row, idx) => (
                      <tr key={idx} className="hover:bg-primary-soft/30">
                        <td className="p-3 font-medium text-text">{row.metric}</td>
                        <td className="p-3 text-text font-mono font-bold">{row.value}</td>
                        <td className="p-3 text-muted">{row.period || "—"}</td>
                        <td className="p-3 text-muted italic">{row.notes || "illustrative"}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="flex justify-end pt-2">
                <button
                  type="button"
                  onClick={() => setExpandExhibitModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-primary text-on-primary text-xs font-bold"
                >
                  Close Exhibit
                </button>
              </div>
            </div>
          </div>
        )}

        {/* MODAL: CASE AUDIT TRAIL */}
        {auditModalOpen && (
          <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <div className="w-full max-w-2xl rounded-2xl bg-surface border border-border shadow-2xl p-6 space-y-4 max-h-[85vh] flex flex-col">
              <div className="flex items-center justify-between pb-3 border-b border-border">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-5 h-5 text-accent" />
                  <div>
                    <h3 className="font-serif font-bold text-lg text-text">
                      Case Governance & Audit Trail
                    </h3>
                    <p className="text-xs text-muted">
                      Immutable record of lifecycle changes, approvals, and curriculum actions.
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setAuditModalOpen(false)}
                  className="text-muted hover:text-text"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-3 overflow-y-auto flex-1 pr-1">
                {loadingAuditLogs ? (
                  <div className="py-8 text-center text-xs text-muted">
                    Loading compliance audit trail...
                  </div>
                ) : caseAuditLogs.length === 0 ? (
                  <div className="py-8 text-center text-xs text-muted italic">
                    No audit records registered for this case study yet.
                  </div>
                ) : (
                  caseAuditLogs.map((log) => (
                    <div
                      key={log.id}
                      className="p-3.5 rounded-xl border border-border bg-primary-soft/20 space-y-1 text-xs"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-mono font-bold text-[11px] uppercase px-2 py-0.5 rounded bg-primary text-on-primary">
                          {log.action.replace("_", " ")}
                        </span>
                        <span className="text-muted text-[11px]">
                          {new Date(log.created_at).toLocaleString()}
                        </span>
                      </div>
                      <p className="text-text pt-1">
                        <strong>Actor:</strong> {log.actor_name || log.actor_id}
                      </p>
                      {log.details && (
                        <p className="text-muted text-[11px] italic">
                          {log.details}
                        </p>
                      )}
                    </div>
                  ))
                )}
              </div>

              <div className="flex justify-end pt-2 border-t border-border">
                <button
                  type="button"
                  onClick={() => setAuditModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-primary text-on-primary text-xs font-bold"
                >
                  Close Trail
                </button>
              </div>
            </div>
          </div>
        )}

        {/* MODAL: PUBLISH / VISIBILITY SETTINGS */}
        {publishModalOpen && (
          <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <div className="w-full max-w-md rounded-2xl bg-surface border border-border shadow-2xl p-6 space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-border">
                <div className="flex items-center gap-2">
                  <Globe className="w-5 h-5 text-accent" />
                  <h3 className="font-serif font-bold text-base text-text">
                    Curriculum Visibility & Publishing
                  </h3>
                </div>
                <button
                  type="button"
                  onClick={() => setPublishModalOpen(false)}
                  className="text-muted hover:text-text"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handlePublishCase} className="space-y-4 text-xs">
                <p className="text-muted leading-relaxed">
                  Select the institutional distribution scope for this case study. Students can only access cases set to {COLLEGE_SHORT} Campus Only or Public.
                </p>

                <div className="space-y-2">
                  <label className={`p-3 rounded-xl border flex items-start gap-3 cursor-pointer transition-all ${
                    publishVisibility === "sbs_only"
                      ? "border-accent bg-primary-soft/60"
                      : "border-border hover:bg-primary-soft/20"
                  }`}>
                    <input
                      type="radio"
                      name="visibility"
                      value="sbs_only"
                      checked={publishVisibility === "sbs_only"}
                      onChange={() => setPublishVisibility("sbs_only")}
                      className="mt-0.5 text-accent"
                    />
                    <div>
                      <div className="font-bold text-text flex items-center gap-1.5">
                        <Building className="w-3.5 h-3.5 text-accent" />
                        <span>{COLLEGE_SHORT} Campus Only (Recommended)</span>
                      </div>
                      <p className="text-[11px] text-muted mt-0.5">
                        Accessible to all authenticated {COLLEGE_SHORT} students and faculty.
                      </p>
                    </div>
                  </label>

                  <label className={`p-3 rounded-xl border flex items-start gap-3 cursor-pointer transition-all ${
                    publishVisibility === "public"
                      ? "border-accent bg-primary-soft/60"
                      : "border-border hover:bg-primary-soft/20"
                  }`}>
                    <input
                      type="radio"
                      name="visibility"
                      value="public"
                      checked={publishVisibility === "public"}
                      onChange={() => setPublishVisibility("public")}
                      className="mt-0.5 text-accent"
                    />
                    <div>
                      <div className="font-bold text-text flex items-center gap-1.5">
                        <Globe className="w-3.5 h-3.5 text-success" />
                        <span>Public Institutional Repository</span>
                      </div>
                      <p className="text-[11px] text-muted mt-0.5">
                        Indexed for global academia and external guest researchers.
                      </p>
                    </div>
                  </label>

                  <label className={`p-3 rounded-xl border flex items-start gap-3 cursor-pointer transition-all ${
                    publishVisibility === "private"
                      ? "border-accent bg-primary-soft/60"
                      : "border-border hover:bg-primary-soft/20"
                  }`}>
                    <input
                      type="radio"
                      name="visibility"
                      value="private"
                      checked={publishVisibility === "private"}
                      onChange={() => setPublishVisibility("private")}
                      className="mt-0.5 text-accent"
                    />
                    <div>
                      <div className="font-bold text-text flex items-center gap-1.5">
                        <Lock className="w-3.5 h-3.5 text-muted" />
                        <span>Private Author Draft</span>
                      </div>
                      <p className="text-[11px] text-muted mt-0.5">
                        Restricted strictly to the authoring faculty member and dean admins.
                      </p>
                    </div>
                  </label>
                </div>

                <div className="flex items-center justify-end gap-2 pt-2 border-t border-border">
                  <button
                    type="button"
                    onClick={() => setPublishModalOpen(false)}
                    className="px-4 py-2 rounded-xl border border-border text-muted hover:bg-primary-soft font-semibold"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isWorkflowLoading}
                    className="px-4 py-2 rounded-xl bg-accent hover:bg-accent-hover text-accent-text font-serif font-bold shadow-sm transition-all"
                  >
                    {isWorkflowLoading ? "Updating..." : "Save Visibility & Publish"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* MODAL: REQUEST CHANGES DIALOG */}
        {requestChangesModalOpen && (
          <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <div className="w-full max-w-lg rounded-2xl bg-surface border border-border shadow-2xl p-6 space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-border">
                <div className="flex items-center gap-2 text-danger">
                  <AlertTriangle className="w-5 h-5" />
                  <h3 className="font-serif font-bold text-base text-text">
                    Request Curriculum Revisions
                  </h3>
                </div>
                <button
                  type="button"
                  onClick={() => setRequestChangesModalOpen(false)}
                  className="text-muted hover:text-text"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleRequestChanges} className="space-y-4">
                <textarea
                  rows={4}
                  required
                  placeholder="Specify required revisions..."
                  value={reviewerCommentInput}
                  onChange={(e) => setReviewerCommentInput(e.target.value)}
                  className="w-full p-3 text-xs rounded-xl border border-border bg-surface text-text"
                />
                <div className="flex items-center justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setRequestChangesModalOpen(false)}
                    className="px-4 py-2 rounded-xl border border-border text-muted hover:bg-primary-soft text-xs font-semibold"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 rounded-xl bg-danger hover:bg-danger/90 text-white font-serif font-bold text-xs"
                  >
                    Send Feedback
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
