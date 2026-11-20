"use client";

import { useState, useMemo, useEffect, useRef, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { AppShell } from "@/components/AppShell";
import { StateLoading } from "@/components/StateLoading";
import { StrategicProfile } from "@/components/StrategicProfile";
import { FileSourceImporter } from "@/components/FileSourceImporter";
import { VoiceDictationButton } from "@/components/VoiceDictationButton";
import { CaseNarrativeView } from "@/components/CaseNarrativeView";
import { CECasePackView } from "@/components/casepack/CECasePackView";
import { CECasePack } from "@/lib/casepack/schema";
import { CasePackValidationReport, validateCasePackComplete } from "@/lib/casepack/validate";
import { getDepartmentProfile, getAllDepartmentProfiles } from "@/config/casepack/departments";
import { TOP_CASE_COMPANIES, CaseCompanyPreset } from "@/config/companies";
import {
  CaseBloomsLevel,
  CaseDifficulty,
  CaseDomain,
  CaseFormat,
  CaseSignal,
  CaseStudy,
  CaseTargetAudience,
  CaseTone,
  CaseType,
  Course,
  Department,
  CaseCategory,
  Profile,
  TokenBudgetInfo,
} from "@/lib/types";
import {
  AI_ENGINE_LABEL,
  COLLEGE_NAME_WITH_SHORT,
  COLLEGE_SHORT,
  ENABLE_DEMO_PERSONA_SWITCHER,
} from "@/config/college";
import {
  Sparkles,
  ChevronDown,
  ChevronUp,
  FileText,
  AlertTriangle,
  RefreshCw,
  Zap,
  BookOpen,
  Sliders,
  Check,
  Send,
  HelpCircle,
  Plus,
  Trash2,
  X,
  Tag,
  Building,
  Target,
  FileSpreadsheet,
  Clock,
  Cpu,
  Layers,
  ArrowRight,
  Eye,
  Upload,
  Paperclip,
  CheckCircle2,
  Bookmark,
  Share2,
  RotateCcw,
  ShieldAlert,
  KeyRound,
  Download,
  Copy,
  Lock,
  Landmark,
  TrendingUp,
  Users,
  Truck,
  BarChart3,
  Cog,
} from "lucide-react";
import { DOMAINS, getDomainByName, getTopicsForDomain, DOMAIN_NAMES, DomainConfig } from "@/config/domains";

const DIFFICULTIES: CaseDifficulty[] = ["Beginner", "Intermediate", "Advanced"];

const TARGET_AUDIENCES: CaseTargetAudience[] = [
  "Undergraduate",
  "MBA",
  "Executive",
];

const TONES: CaseTone[] = ["Academic", "Journalistic", "Executive Briefing"];

const BLOOMS_LEVELS: { id: CaseBloomsLevel; label: string; desc: string }[] = [
  {
    id: "Remember & Understand",
    label: "Remember & Understand",
    desc: "Foundational conceptual recall and operational comprehension",
  },
  {
    id: "Apply & Analyze",
    label: "Apply & Analyze",
    desc: "Managerial application, data dissection, and dilemma diagnosis",
  },
  {
    id: "Evaluate & Create",
    label: "Evaluate & Create",
    desc: "Executive appraisal, strategic trade-off valuation, and policy synthesis",
  },
];

const POPULAR_INDUSTRIES = [
  "Fintech & Banking",
  "Renewable Energy & Solar",
  "Semiconductors & DeepTech",
  "Textiles & Manufacturing",
  "Agri-Tech & Supply Chains",
  "Healthcare & Life Sciences",
];

const MORE_INDUSTRIES = [
  "Automotive & Electric Vehicles",
  "E-Commerce & Quick Commerce",
  "Chemicals & Petrochemicals",
  "Infrastructure & Maritime Ports",
  "Telecommunications & 5G",
  "Venture Capital & Private Equity",
  "EdTech & Enterprise SaaS",
];

const FUNCTIONAL_FOCUSES = [
  "Strategic Finance & Capital Allocation",
  "Operations & Supply Chain Resilience",
  "Disruptive Marketing & Brand Positioning",
  "Enterprise Leadership & Governance",
  "AI Integration & Product Strategy",
  "Mergers, Acquisitions & Alliances",
];

const SUGGESTED_OBJECTIVES = [
  "Assess capital allocation trade-offs under high regulatory uncertainty.",
  "Evaluate operational unit economics and break-even thresholds.",
  "Analyze multi-stakeholder governance conflicts between founders and investors.",
  "Formulate a 100-day executive restructuring roadmap for the board of directors.",
];

function getDomainIcon(name: string) {
  switch (name) {
    case "Finance":
      return Landmark;
    case "Marketing":
      return TrendingUp;
    case "HR":
      return Users;
    case "IT":
      return Cpu;
    case "Supply Chain":
      return Truck;
    case "Strategy":
      return Target;
    case "Analytics":
      return BarChart3;
    case "Operations":
      return Cog;
    default:
      return Layers;
  }
}

function CreateCaseContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Core Configuration State
  const [type, setType] = useState<CaseType>("ce_pack");
  const [format, setFormat] = useState<CaseFormat>("hypothetical");
  const [budgetInfo, setBudgetInfo] = useState<TokenBudgetInfo | null>(null);

  // Institutional Lookup & Repository Metadata State
  const [departmentsList, setDepartmentsList] = useState<Department[]>([]);
  const [coursesList, setCoursesList] = useState<Course[]>([]);
  const [categoriesList, setCategoriesList] = useState<CaseCategory[]>([]);
  const [selectedDepartmentId, setSelectedDepartmentId] = useState<string>("");
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>("");
  const [pageTarget, setPageTarget] = useState<5 | 10>(5);
  const [keywords, setKeywords] = useState<string[]>(["Strategy", "Decision-Making", "Operations"]);
  const [keywordInput, setKeywordInput] = useState<string>("");

  // CE Case Pack Configuration State
  const [department, setDepartment] = useState<string>("finance");
  const [selectedTopics, setSelectedTopics] = useState<string[]>([
    "Factoring (Recourse vs. Non-Recourse)",
    "Forfaiting & Export Receivables Financing",
    "Leasing (Operating vs. Financial / Lease vs. Buy)",
    "Hire Purchase Financing & Asset Ownership",
    "Credit Rating Mechanisms & Sovereign/Corporate Methodologies",
  ]);
  const [includeAnswerKey, setIncludeAnswerKey] = useState<boolean>(true);
  const [casePackLength, setCasePackLength] = useState<"standard" | "short">("standard");
  const [generatedCasePack, setGeneratedCasePack] = useState<CECasePack | null>(null);
  const [casePackValidation, setCasePackValidation] = useState<CasePackValidationReport | null>(null);
  const [isAutoFixing, setIsAutoFixing] = useState<boolean>(false);
  const [isSavingCasePack, setIsSavingCasePack] = useState<boolean>(false);
  const [saveCasePackSuccess, setSaveCasePackSuccess] = useState<boolean>(false);
  const [streamingProgress, setStreamingProgress] = useState<number>(0);
  const [streamingStepName, setStreamingStepName] = useState<string>("");
  const [streamingText, setStreamingText] = useState<string>("");

  // Syllabus Upload & Extraction State
  const [uploadingSyllabus, setUploadingSyllabus] = useState<boolean>(false);
  const [syllabusFileName, setSyllabusFileName] = useState<string | null>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [uploadedUnits, setUploadedUnits] = useState<any[] | null>(null);
  const [syllabusMessage, setSyllabusMessage] = useState<string | null>(null);

  const handleSyllabusUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingSyllabus(true);
    setSyllabusMessage(null);
    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("department", department);

      const res = await fetch("/api/casepack/syllabus", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Failed to parse syllabus");
      }

      const data = await res.json();
      setSyllabusFileName(file.name);
      setUploadedUnits(data.units || []);
      if (data.suggestedConcepts && data.suggestedConcepts.length > 0) {
        setSelectedTopics(data.suggestedConcepts.slice(0, 4));
      }
      setSyllabusMessage(`Syllabus grounded: ${data.unitsCount} units parsed from ${file.name}`);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Syllabus parsing failed";
      setSyllabusMessage(`Error: ${msg}`);
    } finally {
      setUploadingSyllabus(false);
    }
  };

  // Phase 2: Domain, Difficulty, Audience
  const [domain, setDomain] = useState<CaseDomain>("Finance");
  const [difficulty, setDifficulty] = useState<CaseDifficulty>("Intermediate");
  const [targetAudience, setTargetAudience] = useState<CaseTargetAudience>("MBA");

  const currentDomainConfig = useMemo(() => {
    return getDomainByName(domain) || DOMAINS[0];
  }, [domain]);

  // Phase 2: Enterprise & Dilemma Fields
  const [selectedCompanyId, setSelectedCompanyId] = useState<string>("tata-motors-ev");
  const [isCustomCompany, setIsCustomCompany] = useState<boolean>(false);
  const [companyPresetNotice, setCompanyPresetNotice] = useState<string | null>(null);

  const groupedCompanies = useMemo(() => {
    const groups: Record<string, CaseCompanyPreset[]> = {};
    TOP_CASE_COMPANIES.forEach((item) => {
      if (!groups[item.category]) groups[item.category] = [];
      groups[item.category].push(item);
    });
    return groups;
  }, []);

  const handleCompanySelect = (companyId: string) => {
    setSelectedCompanyId(companyId);
    if (companyId === "custom") {
      setIsCustomCompany(true);
      setCompanyPresetNotice(null);
      return;
    }
    setIsCustomCompany(false);
    const preset = TOP_CASE_COMPANIES.find((c) => c.id === companyId);
    if (preset) {
      setPrimaryCompany(preset.name);
      setLocationMarket(preset.location);
      setCentralDilemma(preset.dilemma);
      setKeyDecisionMaker(preset.decisionMaker);
      setProtagonists(preset.protagonists);
      if (preset.industry) setIndustry(preset.industry);
      if (preset.functionalFocus) setFunctionalFocus(preset.functionalFocus);
      if (preset.domain) setDomain(preset.domain);
      if (preset.learningObjectives && preset.learningObjectives.length > 0) {
        setLearningObjectives([...preset.learningObjectives]);
      }
      setCompanyPresetNotice(`✨ Auto-filled real-world MBA case blueprint for ${preset.name}`);
      setTimeout(() => setCompanyPresetNotice(null), 4000);
    }
  };

  const [primaryCompany, setPrimaryCompany] = useState<string>("Tata Motors Passenger Vehicles & EV");
  const [locationMarket, setLocationMarket] = useState<string>("Ahmedabad & Surat, Gujarat / Pan-India");
  const [centralDilemma, setCentralDilemma] = useState<string>(
    "Whether to invest ₹2,500 Cr into proprietary battery cell manufacturing or partner with global battery OEMs amid shifting EV subsidy regulations."
  );
  const [keyDecisionMaker, setKeyDecisionMaker] = useState<string>("Shailesh Chandra, Managing Director");
  const [protagonists, setProtagonists] = useState<string>("Chief Technology Officer, VP Supply Chain, Head of Government Affairs");

  // Phase 2: Dynamic Learning Objectives List
  const [learningObjectives, setLearningObjectives] = useState<string[]>([
    "Evaluate capital allocation risk in capital-intensive green mobility sectors.",
    "Formulate strategic vendor partnerships under changing regulatory subsidy regimes.",
  ]);
  const [newObjectiveText, setNewObjectiveText] = useState<string>("");

  // Step 1: Industry
  const [industry, setIndustry] = useState<string>("Automotive & Electric Vehicles");
  const [customIndustry, setCustomIndustry] = useState<string>("");

  // Step 2: Functional Focus
  const [functionalFocus, setFunctionalFocus] = useState<string>(FUNCTIONAL_FOCUSES[0]);

  // Step 3: Academic Mapping
  const [courses, setCourses] = useState<Course[]>([]);
  const [selectedCourseId, setSelectedCourseId] = useState<string>("");
  const [semester, setSemester] = useState<string>("Fall 2026");
  const [level, setLevel] = useState<string>("MBA / Intermediate");
  const [learningOutcomes, setLearningOutcomes] = useState<string>("");

  // Complexity & Length
  const [complexity, setComplexity] = useState<number>(7);
  const [targetLength, setTargetLength] = useState<"short" | "medium" | "comprehensive">("medium");

  // Source Material Section (Paste, Upload, Signals)
  const [sourceTab, setSourceTab] = useState<"paste" | "upload" | "signal">("paste");
  const [sourceNotes, setSourceNotes] = useState<string>("");
  const [availableSignals, setAvailableSignals] = useState<CaseSignal[]>([]);
  const [signalsModalOpen, setSignalsModalOpen] = useState<boolean>(false);
  const [loadingSignals, setLoadingSignals] = useState<boolean>(false);

  // Generation Options
  const [tone, setTone] = useState<CaseTone>("Academic");
  const [includeFinancials, setIncludeFinancials] = useState<boolean>(true);
  const [includeOrgChart, setIncludeOrgChart] = useState<boolean>(true);
  const [includeMarketData, setIncludeMarketData] = useState<boolean>(true);
  const [includeTeachingNote, setIncludeTeachingNote] = useState<boolean>(true);
  const [bloomsLevel, setBloomsLevel] = useState<string>("Apply & Analyze");

  // Generation & Progress State
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [generationStep, setGenerationStep] = useState<number>(1);
  const abortControllerRef = useRef<AbortController | null>(null);
  const [generationError, setGenerationError] = useState<{
    message: string;
    retryable: boolean;
    isRateLimit?: boolean;
  } | null>(null);

  // Generated Case Preview State
  const [generatedCase, setGeneratedCase] = useState<CaseStudy | null>(null);
  const [previewTab, setPreviewTab] = useState<"text" | "exhibits" | "teaching_note" | "questions">("text");
  const [savingDraft, setSavingDraft] = useState<boolean>(false);
  const [submittingReview, setSubmittingReview] = useState<boolean>(false);
  const [regeneratingSection, setRegeneratingSection] = useState<string | null>(null);
  const [previewFeedback, setPreviewFeedback] = useState<string | null>(null);
  const [activeWarnings, setActiveWarnings] = useState<string[]>([]);

  // Testing hooks
  const [simulateBadJson, setSimulateBadJson] = useState<boolean>(false);

  // User Authentication & Monthly Free/Fair-Use Quota State
  const [currentUser, setCurrentUser] = useState<Profile | null>(null);
  const [otpModalOpen, setOtpModalOpen] = useState<boolean>(false);
  const [freeLimitModalOpen, setFreeLimitModalOpen] = useState<boolean>(false);
  const [fairUseModalOpen, setFairUseModalOpen] = useState<boolean>(false);
  const [otpInput, setOtpInput] = useState<string>("");
  const [otpMessage, setOtpMessage] = useState<string | null>(null);
  const [otpError, setOtpError] = useState<string | null>(null);
  const [otpVerifying, setOtpVerifying] = useState<boolean>(false);
  const [otpResending, setOtpResending] = useState<boolean>(false);
  const [exportedSuccess, setExportedSuccess] = useState<boolean>(false);

  // Load authenticated profile
  const fetchCurrentUser = () => {
    fetch("/api/auth")
      .then((r) => r.json())
      .then((data) => {
        if (data.user) {
          setCurrentUser(data.user);
        }
      })
      .catch((err) => console.error("Error loading user profile:", err));
  };

  useEffect(() => {
    fetchCurrentUser();
    fetch("/api/lookup")
      .then((r) => r.json())
      .then((res) => {
        if (res.success && res.data) {
          setDepartmentsList(res.data.departments || []);
          setCoursesList(res.data.courses || []);
          setCategoriesList(res.data.categories || []);
          if (res.data.departments?.length > 0) {
            setSelectedDepartmentId((prev) => prev || res.data.departments[0].id);
          }
          if (res.data.categories?.length > 0) {
            setSelectedCategoryId((prev) => prev || res.data.categories[0].id);
          }
        }
      })
      .catch((err) => console.error("Error loading institutional lookups:", err));
  }, []);

  useEffect(() => {
    if (currentUser) {
      if (currentUser.department_id) {
        setSelectedDepartmentId(currentUser.department_id);
      }
      if (currentUser.course_id) {
        setSelectedCourseId(currentUser.course_id);
      }
    }
  }, [currentUser]);

  const handleAddKeyword = () => {
    const trimmed = keywordInput.trim();
    if (trimmed && !keywords.includes(trimmed) && keywords.length < 8) {
      setKeywords([...keywords, trimmed]);
      setKeywordInput("");
    }
  };

  const handleRemoveKeyword = (kwToRemove: string) => {
    if (keywords.length <= 3) {
      alert("At least 3 keywords are required for institutional repository indexing.");
      return;
    }
    setKeywords(keywords.filter((k) => k !== kwToRemove));
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setOtpError(null);
    setOtpMessage(null);
    if (!otpInput || otpInput.trim().length !== 6) {
      setOtpError("Please enter the complete 6-digit code.");
      return;
    }
    setOtpVerifying(true);
    try {
      const res = await fetch("/api/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "verify-otp",
          email: currentUser?.email,
          otp: otpInput.trim(),
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to verify OTP.");
      }
      setOtpMessage("Email verified successfully! You can now generate cases.");
      if (data.user) {
        setCurrentUser(data.user);
      }
      setTimeout(() => {
        setOtpModalOpen(false);
        setOtpMessage(null);
        setOtpInput("");
      }, 1500);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to verify OTP.";
      setOtpError(msg);
    } finally {
      setOtpVerifying(false);
    }
  };

  const handleResendOtp = async () => {
    if (!currentUser?.email) return;
    setOtpError(null);
    setOtpMessage(null);
    setOtpResending(true);
    try {
      const res = await fetch("/api/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "request-otp",
          email: currentUser.email,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to resend code.");
      }
      setOtpMessage("A new 6-digit verification code has been dispatched.");
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to resend code.";
      setOtpError(msg);
    } finally {
      setOtpResending(false);
    }
  };

  // Safe Export handler - preserves all form fields in React state while saving brief
  const handleExportWork = () => {
    const briefData = {
      exported_at: new Date().toISOString(),
      type,
      format,
      industry: activeIndustry,
      functionalFocus,
      domain,
      difficulty,
      targetAudience,
      primaryCompany,
      locationMarket,
      centralDilemma,
      keyDecisionMaker,
      protagonists,
      learningObjectives,
      tone,
      bloomsLevel,
      language: "en",
      complexity,
      targetLength,
      sourceNotes,
      selectedCourseName,
    };
    const jsonStr = JSON.stringify(briefData, null, 2);
    const blob = new Blob([jsonStr], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `sbs-case-brief-${primaryCompany ? primaryCompany.toLowerCase().replace(/[^a-z0-9]/g, "-") : "draft"}.json`;
    a.click();
    URL.revokeObjectURL(url);
    if (typeof navigator !== "undefined" && navigator?.clipboard?.writeText) {
      navigator.clipboard.writeText(jsonStr).catch(() => {});
    }
    setExportedSuccess(true);
    setTimeout(() => setExportedSuccess(false), 3000);
  };

  // Fetch available courses and budget in parallel
  useEffect(() => {
    Promise.all([
      fetch("/api/admin")
        .then((res) => res.json())
        .catch((err) => {
          console.error("Error loading courses:", err);
          return {};
        }),
      fetch("/api/admin/budget")
        .then((r) => r.json())
        .catch(() => null),
    ]).then(([adminData, budgetData]) => {
      if (adminData?.courses && adminData.courses.length > 0) {
        setCourses(adminData.courses);
        setSelectedCourseId(adminData.courses[0].id);
      }
      if (budgetData?.budget) {
        setBudgetInfo(budgetData.budget);
      }
    });
  }, []);

  // Fetch trending signals for quick source select
  useEffect(() => {
    fetch("/api/signals?limit=12")
      .then((r) => r.json())
      .then((data) => {
        if (data.signals) setAvailableSignals(data.signals);
      })
      .catch(() => {});
  }, []);

  // Prefill from Case Signals query params if provided
  useEffect(() => {
    if (!searchParams) return;
    const formatParam = searchParams.get("format");
    const industryParam = searchParams.get("industry");
    const titleParam = searchParams.get("title");
    const notesParam = searchParams.get("sourceNotes");
    const regionParam = searchParams.get("region");

    if (formatParam === "real_signal" || formatParam === "hypothetical") {
      setFormat(formatParam as CaseFormat);
    }
    if (industryParam) {
      if (POPULAR_INDUSTRIES.includes(industryParam) || MORE_INDUSTRIES.includes(industryParam)) {
        setIndustry(industryParam);
      } else {
        setCustomIndustry(industryParam);
      }
    }
    if (regionParam) {
      setLocationMarket(regionParam);
    }
    if (notesParam || titleParam) {
      const combined = [
        titleParam ? `CASE SIGNAL HEADLINE:\n${titleParam}` : "",
        notesParam ? `SOURCE NOTES & REGULATORY CONTEXT:\n${notesParam}` : "",
      ]
        .filter(Boolean)
        .join("\n\n");
      setSourceNotes(combined);
      if (titleParam) {
        setCentralDilemma(`Addressing operational disruption related to: ${titleParam}`);
      }
    }
  }, [searchParams]);

  const selectedCourseName = useMemo(() => {
    const found = courses.find((c) => c.id === selectedCourseId);
    return found ? `${found.code}: ${found.name}` : "General Management";
  }, [courses, selectedCourseId]);

  const activeIndustry = customIndustry.trim() || industry;

  // Selected exhibits array
  const includeExhibits = useMemo(() => {
    const list: ("financials" | "org_chart" | "market_data")[] = [];
    if (includeFinancials) list.push("financials");
    if (includeOrgChart) list.push("org_chart");
    if (includeMarketData) list.push("market_data");
    return list;
  }, [includeFinancials, includeOrgChart, includeMarketData]);

  // Pre-generation Resource Estimator
  const resourceEstimates = useMemo(() => {
    const isResearch = type === "research";
    const isShort = type === "short" || type === "flash";
    const baseTokens = isResearch ? 5200 : isShort ? 1600 : targetLength === "short" ? 2400 : targetLength === "comprehensive" ? 4800 : 3600;
    const exhibitTokens = includeExhibits.length * 400;
    const notesBonus = includeTeachingNote ? 600 : 0;
    const totalTokens = baseTokens + exhibitTokens + notesBonus;
    const estSeconds = isResearch ? 50 : isShort ? 18 : 35;

    return {
      tokens: totalTokens,
      seconds: estSeconds,
    };
  }, [type, targetLength, includeExhibits, includeTeachingNote]);

  // Real-time Validation Warnings
  const validationWarnings = useMemo(() => {
    const list: string[] = [];

    if (format === "real_signal") {
      const comp = (primaryCompany || "").toLowerCase().trim();
      const fictionalWords = ["acme", "xyz", "abc corp", "sample", "fictional", "fake", "placeholder", "test corp"];
      if (!comp || fictionalWords.some((w) => comp.includes(w))) {
        list.push("Factual Warning: 'Real Signal' mode is active, but the company name looks fictional or generic. Please provide an authentic corporate entity.");
      }
    }

    if (centralDilemma.trim().length > 0 && centralDilemma.trim().length < 30) {
      list.push("Pedagogical Warning: Central dilemma is very brief (< 30 characters). Expand on the operational or strategic tension.");
    }

    if (learningObjectives.length === 0) {
      list.push("Curricular Warning: No learning objectives configured. Add at least 1 outcome for institutional assessment mapping.");
    }

    return list;
  }, [format, primaryCompany, centralDilemma, learningObjectives]);

  // Configured steps count (for profile panel)
  const configuredStepsCount = useMemo(() => {
    let count = 0;
    if (activeIndustry) count++;
    if (domain) count++;
    if (primaryCompany && centralDilemma) count++;
    if (learningObjectives.length > 0) count++;
    if (includeExhibits.length > 0) count++;
    return count;
  }, [activeIndustry, domain, primaryCompany, centralDilemma, learningObjectives, includeExhibits]);

  // Objective management handlers
  const handleAddObjective = (textToAdd?: string) => {
    const text = (textToAdd || newObjectiveText).trim();
    if (!text) return;
    if (!learningObjectives.includes(text)) {
      setLearningObjectives((prev) => [...prev, text]);
    }
    setNewObjectiveText("");
  };

  const handleRemoveObjective = (indexToRemove: number) => {
    setLearningObjectives((prev) => prev.filter((_, idx) => idx !== indexToRemove));
  };

  // Signal selection handler
  const handleSelectSignal = (sig: CaseSignal) => {
    setPrimaryCompany(sig.title.split(":")[0]?.trim() || sig.title.slice(0, 30));
    setIndustry(sig.industry || "Fintech & Banking");
    setCentralDilemma(sig.summary || `Strategic implications of: ${sig.title}`);
    setSourceNotes((prev) =>
      prev
        ? `${prev}\n\nSIGNAL HEADLINE: ${sig.title}\nSOURCE: ${sig.source} (${sig.published_at})\n${sig.summary}`
        : `SIGNAL HEADLINE: ${sig.title}\nSOURCE: ${sig.source} (${sig.published_at})\n${sig.summary}`
    );
    setFormat("real_signal");
    setSignalsModalOpen(false);
  };

  // Domain & Curricular Handlers (Single Source of Truth)
  const handleDomainSelect = (chosenDomainName: CaseDomain) => {
    setDomain(chosenDomainName);
    const dConfig = getDomainByName(chosenDomainName);
    if (!dConfig) return;
    setDepartment(dConfig.id);

    // Initial selected topics from unit 1
    const unit1Topics = dConfig.units[0]?.topics || [];
    setSelectedTopics(unit1Topics.slice(0, 5));

    if (chosenDomainName === "Finance") {
      setIndustry("Industrial Machinery & Manufacturing");
      setFunctionalFocus("Strategic Finance & Capital Allocation");
    } else if (chosenDomainName === "HR") {
      setIndustry("Modern Retail & Omnichannel Commerce");
      setFunctionalFocus("Enterprise Leadership & Governance");
    } else if (chosenDomainName === "Marketing") {
      setIndustry("Organic Consumer Goods & FMCG");
      setFunctionalFocus("Disruptive Marketing & Brand Positioning");
    } else if (chosenDomainName === "IT") {
      setIndustry("EdTech & Enterprise SaaS");
      setFunctionalFocus("AI Integration & Product Strategy");
    } else if (chosenDomainName === "Supply Chain") {
      setIndustry("Agri-Tech & Supply Chains");
      setFunctionalFocus("Operations & Supply Chain Resilience");
    } else if (chosenDomainName === "Strategy") {
      setIndustry("Automotive & Electric Vehicles");
      setFunctionalFocus("Mergers, Acquisitions & Alliances");
    } else if (chosenDomainName === "Analytics") {
      setIndustry("Fintech & Banking");
      setFunctionalFocus("AI Integration & Product Strategy");
    } else if (chosenDomainName === "Operations") {
      setIndustry("Textiles & Manufacturing");
      setFunctionalFocus("Operations & Supply Chain Resilience");
    }
  };

  const handleDepartmentChange = (dept: string) => {
    const dConfig = getDomainByName(dept);
    if (dConfig) {
      handleDomainSelect(dConfig.name);
    }
  };

  const handleToggleTopic = (topic: string) => {
    setSelectedTopics((prev) =>
      prev.includes(topic) ? (prev.length > 1 ? prev.filter((t) => t !== topic) : prev) : [...prev, topic]
    );
  };

  const handleToggleUnitTopics = (unitTopics: string[]) => {
    const allSelected = unitTopics.every((t) => selectedTopics.includes(t));
    if (allSelected) {
      const remaining = selectedTopics.filter((t) => !unitTopics.includes(t));
      setSelectedTopics(remaining.length > 0 ? remaining : [unitTopics[0]]);
    } else {
      setSelectedTopics((prev) => Array.from(new Set([...prev, ...unitTopics])));
    }
  };

  const handleRerunChecks = () => {
    if (generatedCasePack) {
      const rep = validateCasePackComplete(generatedCasePack);
      setCasePackValidation(rep);
    }
  };

  const handleAutoFix = async () => {
    if (!generatedCasePack) return;
    setIsAutoFixing(true);
    try {
      const res = await fetch("/api/casepack/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          department,
          topic: selectedTopics,
          concepts: selectedTopics,
          length: casePackLength,
          include_rubric: includeAnswerKey,
          industry: activeIndustry,
          geography: locationMarket,
          course_id: selectedCourseId,
          custom_notes: `Auto-fix requested. Please remediate the following failures: ${casePackValidation?.criticalFailures.join(", ") || "none"}. Warnings: ${casePackValidation?.warnings.join("; ") || "none"}`,
        }),
      });
      if (!res.ok) throw new Error("Auto-fix generation failed");
      const reader = res.body?.getReader();
      const decoder = new TextDecoder();
      if (!reader) return;
      let buffer = "";
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });
        const parts = buffer.split("\n\n");
        buffer = parts.pop() || "";
        for (const part of parts) {
          if (part.includes("event: complete")) {
            const dataLine = part.split("\n").find((l) => l.startsWith("data: "));
            if (dataLine) {
              const parsed = JSON.parse(dataLine.replace("data: ", ""));
              if (parsed.casePack) {
                setGeneratedCasePack(parsed.casePack);
                setCasePackValidation(validateCasePackComplete(parsed.casePack));
              }
            }
          }
        }
      }
    } catch (err) {
      console.error("Auto-fix failed:", err);
      alert("Auto-fix could not complete.");
    } finally {
      setIsAutoFixing(false);
    }
  };

  const handleSaveCasePack = async () => {
    if (!generatedCasePack) return;
    setIsSavingCasePack(true);
    setSaveCasePackSuccess(false);
    try {
      const newCaseId = `case-ce-${Date.now()}`;
      const res = await fetch("/api/cases", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: newCaseId,
          title: generatedCasePack.case.title,
          type: "ce_pack",
          format,
          industry: activeIndustry,
          function: functionalFocus,
          language: "en",
          complexity,
          level,
          content: generatedCasePack,
          status: "draft",
          visibility: "sbs_only",
          department_id: selectedDepartmentId || currentUser?.department_id || null,
          course_id: selectedCourseId || currentUser?.course_id || null,
          case_category_id: selectedCategoryId || null,
          page_target: pageTarget,
          keywords: keywords.length >= 3 ? keywords : ["Management", "Strategy", "Operations"],
        }),
      });
      if (!res.ok) throw new Error("Failed to save CE Case Pack");
      setSaveCasePackSuccess(true);
      setTimeout(() => router.push(`/cases/${newCaseId}`), 1200);
    } catch (err) {
      console.error("Save CE Case Pack error:", err);
      alert("Failed to save Case Pack.");
    } finally {
      setIsSavingCasePack(false);
    }
  };

  // Cancel generation handler
  const handleCancelGeneration = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    setIsGenerating(false);
    setGenerationStep(1);
  };

  // Generate Case handler
  const handleGenerate = async (forceRetry = false) => {
    setGenerationError(null);
    setIsGenerating(true);
    setGenerationStep(1);
    setGeneratedCase(null);

    const controller = new AbortController();
    abortControllerRef.current = controller;

    // CE Case Pack Generation with SSE Streaming
    if (type === "ce_pack") {
      setStreamingText("");
      setStreamingProgress(5);
      setStreamingStepName("1. Drafting Teaching Case Narrative...");
      setGeneratedCasePack(null);
      setCasePackValidation(null);

      try {
        const payload = {
          department,
          topic: selectedTopics,
          concepts: selectedTopics,
          length: casePackLength,
          include_rubric: includeAnswerKey,
          industry: activeIndustry,
          geography: locationMarket,
          course_id: selectedCourseId,
          custom_notes: sourceNotes,
        };

        const res = await fetch("/api/casepack/generate", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
          signal: controller.signal,
        });

        if (!res.ok) {
          const errData = await res.json().catch(() => ({}));
          throw new Error(errData.error || `Generation failed with status ${res.status}`);
        }

        const reader = res.body?.getReader();
        const decoder = new TextDecoder();
        if (!reader) throw new Error("No response stream available.");

        let buffer = "";
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          buffer += decoder.decode(value, { stream: true });
          const parts = buffer.split("\n\n");
          buffer = parts.pop() || "";

          for (const part of parts) {
            const lines = part.split("\n");
            const eventLine = lines.find((l) => l.startsWith("event: "));
            const dataLine = lines.find((l) => l.startsWith("data: "));
            if (!eventLine || !dataLine) continue;

            const eventType = eventLine.replace("event: ", "").trim();
            const dataRaw = dataLine.replace("data: ", "").trim();

            if (eventType === "progress") {
              try {
                const prog = JSON.parse(dataRaw);
                setGenerationStep(prog.step || 1);
                setStreamingProgress(prog.percent || 0);
                setStreamingStepName(prog.message || prog.step_name || "");
              } catch {}
            } else if (eventType === "text_delta") {
              try {
                const delta = JSON.parse(dataRaw);
                setStreamingText((prev) => prev + (delta.delta || ""));
              } catch {}
            } else if (eventType === "complete") {
              try {
                const completeData = JSON.parse(dataRaw);
                if (completeData.casePack) {
                  setGeneratedCasePack(completeData.casePack);
                  const valReport = validateCasePackComplete(completeData.casePack);
                  setCasePackValidation(valReport);
                }
              } catch {}
            } else if (eventType === "error") {
              try {
                const errJson = JSON.parse(dataRaw);
                throw new Error(errJson.message || "Generation stream error.");
              } catch (e: any) {
                throw new Error(e.message || "Generation stream error.");
              }
            }
          }
        }
      } catch (err: unknown) {
        if (err instanceof Error && err.name === "AbortError") {
          console.log("CE Case Pack generation canceled by user.");
          return;
        }
        const isNetworkErr = err instanceof TypeError && (err.message.includes("fetch") || err.message.includes("network"));
        const msg = isNetworkErr
          ? "Unable to reach the server. Please verify the local CaseLab server is running on port 3000 and try again."
          : err instanceof Error
          ? err.message
          : "Failed to generate CE Case Pack.";
        setGenerationError({
          message: msg,
          retryable: true,
        });
      } finally {
        setIsGenerating(false);
      }
      return;
    }

    // Simulate multi-step progress transitions
    const stepTimer1 = setTimeout(() => setGenerationStep(2), 2500);
    const stepTimer2 = setTimeout(() => setGenerationStep(3), 5500);
    const stepTimer3 = setTimeout(() => setGenerationStep(4), 9000);
    const stepTimer4 = setTimeout(() => setGenerationStep(5), 13000);

    try {
      const payload = {
        type,
        format,
        industry: activeIndustry,
        functionalFocus,
        domain,
        difficulty,
        targetAudience,
        primaryCompany,
        locationMarket,
        centralDilemma,
        keyDecisionMaker,
        protagonists,
        learningObjectives,
        tone,
        includeExhibits,
        includeTeachingNote,
        bloomsLevel,
        courseId: selectedCourseId,
        courseName: selectedCourseName,
        semester,
        level,
        learningOutcomes,
        contextRegion: locationMarket,
        language: "en",
        complexity,
        targetLength,
        sourceNotes,
        department_id: selectedDepartmentId || currentUser?.department_id || null,
        course_id: selectedCourseId || currentUser?.course_id || null,
        case_category_id: selectedCategoryId || null,
        page_target: pageTarget,
        keywords: keywords.length >= 3 ? keywords : ["Management", "Strategy", "Operations"],
        simulateBadJson: forceRetry ? false : simulateBadJson,
      };

      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
        signal: controller.signal,
      });

      const data = await res.json();

      if (!res.ok) {
        if (data.error_code === "UNVERIFIED_EMAIL" || (res.status === 403 && data.error_code === "UNVERIFIED_EMAIL")) {
          setOtpModalOpen(true);
          setGenerationError({
            message: data.error || "Email verification required before generating cases.",
            retryable: false,
          });
          return;
        }
        if (data.error_code === "LIMIT_REACHED") {
          setFreeLimitModalOpen(true);
          return;
        }
        if (data.error_code === "FAIR_USE_LIMIT_REACHED") {
          setFairUseModalOpen(true);
          return;
        }
        if (res.status === 429) {
          setGenerationError({
            message: data.error || "Hourly limit reached: 10 generations per user per hour.",
            retryable: false,
            isRateLimit: true,
          });
          return;
        }
        throw new Error(data.error || "Generation encountered an unexpected failure.");
      }

      if (data.monthlyQuota) {
        setCurrentUser((prev) =>
          prev
            ? {
                ...prev,
                free_cases_used_this_month: data.monthlyQuota.used,
                monthly_generations_used: data.monthlyQuota.used,
              }
            : prev
        );
      }

      if (data.warnings && data.warnings.length > 0) {
        setActiveWarnings(data.warnings);
      }

      if (data.caseStudy) {
        setGeneratedCase(data.caseStudy);
      }
    } catch (err: unknown) {
      if (err instanceof Error && err.name === "AbortError") {
        console.log("Generation canceled by user.");
        return;
      }
      const isNetworkErr = err instanceof TypeError && (err.message.includes("fetch") || err.message.includes("network"));
      const msg = isNetworkErr
        ? "Unable to reach the server. Please verify the local CaseLab server is running on port 3000 and try again."
        : err instanceof Error
        ? err.message
        : "Failed to generate case study.";
      setGenerationError({
        message: msg,
        retryable: true,
      });
    } finally {
      clearTimeout(stepTimer1);
      clearTimeout(stepTimer2);
      clearTimeout(stepTimer3);
      clearTimeout(stepTimer4);
      setIsGenerating(false);
      setGenerationStep(1);
    }
  };

  // Preview Action: Save as Draft
  const handleSaveDraft = async () => {
    if (!generatedCase) return;
    setSavingDraft(true);
    setPreviewFeedback(null);
    try {
      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "save-draft",
          caseId: generatedCase.id,
          updatedContent: generatedCase.content,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setPreviewFeedback("Case study successfully saved as Draft in your library.");
        setTimeout(() => setPreviewFeedback(null), 4000);
      } else {
        alert(data.error || "Failed to save draft.");
      }
    } catch {
      alert("Error saving draft.");
    } finally {
      setSavingDraft(false);
    }
  };

  // Preview Action: Submit for Institutional Review
  const handleSubmitReview = async () => {
    if (!generatedCase) return;
    if (!confirm("Submit this case study to the Academic Review Committee for approval?")) return;
    setSubmittingReview(true);
    setPreviewFeedback(null);
    try {
      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "submit-review",
          caseId: generatedCase.id,
          updatedContent: generatedCase.content,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setPreviewFeedback("Submitted! Case is now In Review by Faculty Reviewers.");
        if (data.caseStudy) setGeneratedCase(data.caseStudy);
        setTimeout(() => {
          router.push(`/cases/${generatedCase.id}`);
        }, 1500);
      } else {
        alert(data.error || "Failed to submit for review.");
      }
    } catch {
      alert("Error submitting case for review.");
    } finally {
      setSubmittingReview(false);
    }
  };

  // Preview Action: Regenerate Section
  const handleRegenerateSection = async (section: "exhibits" | "dilemma" | "teaching_note" | "questions") => {
    if (!generatedCase) return;
    setRegeneratingSection(section);
    setPreviewFeedback(null);
    try {
      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "regenerate-section",
          caseId: generatedCase.id,
          sectionToRegenerate: section,
          type,
          format,
          industry: activeIndustry,
          functionalFocus,
          domain,
          primaryCompany,
          locationMarket,
          centralDilemma,
          keyDecisionMaker,
          protagonists,
          learningObjectives,
          tone,
          includeExhibits,
          includeTeachingNote,
          bloomsLevel,
          language: "en",
        }),
      });
      const data = await res.json();
      if (data.success && data.caseStudy) {
        setGeneratedCase(data.caseStudy);
        setPreviewFeedback(`Section "${section.replace("_", " ").toUpperCase()}" successfully refreshed with new pedagogical parameters.`);
        setTimeout(() => setPreviewFeedback(null), 4000);
      }
    } catch {
      alert("Failed to regenerate section.");
    } finally {
      setRegeneratingSection(null);
    }
  };

  return (
    <AppShell>
      <div className="space-y-6 md:space-y-8">
        {/* Page Title & Compact Usage Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 border-b border-border pb-4">
          <div>
            <div className="flex items-center gap-1.5 text-[11px] font-semibold text-muted uppercase tracking-wider mb-0.5">
              <span>{COLLEGE_SHORT} Curriculum Studio</span>
              <span>•</span>
              <span>{AI_ENGINE_LABEL}</span>
            </div>
            <h1 className="font-serif text-2xl md:text-3xl font-bold text-text tracking-tight">
              Generate Case Studio
            </h1>
            <p className="text-xs text-muted mt-0.5">
              Author curriculum-aligned business cases and synchronized classroom teaching notes.
            </p>
          </div>

          <div className="flex items-center flex-wrap gap-2.5 shrink-0">
            {currentUser && (() => {
              const used = currentUser.free_cases_used_this_month ?? currentUser.monthly_generations_used ?? 0;
              const limit = currentUser.monthly_generation_limit ?? (currentUser.role === "admin" ? 100 : currentUser.role === "faculty" ? 15 : 10);
              const remaining = Math.max(0, limit - used);
              return (
                <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-surface border border-border text-xs shadow-2xs">
                  <Sparkles className="w-3.5 h-3.5 text-accent" />
                  <span className="text-muted">Quota:</span>
                  <span className="font-semibold text-text">
                    <strong className="text-accent font-bold text-sm">{remaining}</strong> cases remaining
                  </span>
                  <span className="text-[11px] text-muted hidden sm:inline font-mono">
                    ({used} / {limit} used)
                  </span>
                  <span className="text-[10px] text-muted hidden md:inline">
                    • Resets 1st
                  </span>
                  {!currentUser.email_verified_at && (
                    <button
                      type="button"
                      onClick={() => setOtpModalOpen(true)}
                      className="ml-1 text-warning hover:underline font-semibold text-[11px] flex items-center gap-1"
                    >
                      <ShieldAlert className="w-3 h-3 text-warning" />
                      <span>Verify</span>
                    </button>
                  )}
                </div>
              );
            })()}
          </div>
        </div>

        {/* UNVERIFIED EMAIL PROMINENT BANNER */}
        {currentUser && !currentUser.email_verified_at && (
          <div className="p-4 rounded-2xl border border-warning/40 bg-warning/10 text-text flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-xs">
            <div className="flex items-start gap-3">
              <div className="p-2 bg-warning text-white rounded-xl shadow-xs shrink-0 mt-0.5">
                <ShieldAlert className="w-5 h-5" />
              </div>
              <div className="space-y-0.5">
                <p className="font-serif font-bold text-sm tracking-wide">
                  Email Verification Required for Case Generation
                </p>
                <p className="text-xs text-muted leading-relaxed">
                  All accounts require verified email before generating case studies. A 6-digit OTP code has been generated for your email ({currentUser.email}).
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setOtpModalOpen(true)}
              className="px-4 py-2 rounded-xl bg-accent hover:bg-accent-hover text-accent-text font-serif font-bold text-xs shadow-sm transition-all shrink-0"
            >
              Verify Email Now
            </button>
          </div>
        )}

        {/* 2-Column Responsive Layout: 8 cols Form / 4 cols Strategic Profile */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-start">
          {/* LEFT COLUMN: GENERATION CONFIGURATOR (8 Cols) */}
          <div className="lg:col-span-8 space-y-6">

            {/* 1. CASE TYPE DROPDOWN & TEMPLATES */}
            <div className="p-5 rounded-2xl border border-border bg-surface shadow-sm space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-primary text-on-primary font-bold text-xs flex items-center justify-center">
                    1
                  </span>
                  <h3 className="font-serif text-sm font-bold text-text">
                    Case Format & Department
                  </h3>
                </div>
                <span className="text-xs text-muted font-medium">Step 1 of 5</span>
              </div>

              {/* Case Type 4-Way Selector */}
              <div className="space-y-2">
                <label className="text-xs font-semibold text-text block">
                  Choose Case Format
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
                  {[
                    {
                      id: "ce_pack" as CaseType,
                      title: "CE Case Pack",
                      badge: "Case + Solutions",
                      desc: "Comprehensive Teaching Case + Analysis Questions + Model Solutions & Discussion Notes.",
                    },
                    {
                      id: "full" as CaseType,
                      title: "Full Case Study",
                      badge: "8-10 Pages",
                      desc: "Comprehensive Harvard/Ivey standard. Deep institutional context, multi-stage teaching note.",
                    },
                    {
                      id: "short" as CaseType,
                      title: "Short Case",
                      badge: "~2-3 Pages",
                      desc: "Rapid boardroom crisis drill (20-30 min class). High-intensity operational tension.",
                    },
                    {
                      id: "flash" as CaseType,
                      title: "Flash Case",
                      badge: "1-2 Pages",
                      desc: "Micro-case simulation designed for quick classroom debate and instant decision-making.",
                    },
                  ].map((ct) => (
                    <button
                      key={ct.id}
                      type="button"
                      onClick={() => setType(ct.id)}
                      className={`p-3.5 rounded-xl border text-left transition-all relative ${
                        type === ct.id
                          ? "bg-primary text-white border-primary shadow-md"
                          : "bg-surface border-border text-text hover:border-primary/50"
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1.5 gap-1.5">
                        <span className={`font-bold text-xs ${type === ct.id ? "text-white" : "text-text"}`}>
                          {ct.title}
                        </span>
                        <span
                          className={`text-[11px] px-2 py-0.5 rounded font-medium border ${
                            type === ct.id
                              ? "bg-white/15 text-white border-white/40"
                              : "bg-primary-soft/40 text-muted border-border/80"
                          }`}
                        >
                          {ct.badge}
                        </span>
                      </div>
                      <p className={`text-[11px] leading-relaxed ${type === ct.id ? "text-white/80" : "text-muted"}`}>
                        {ct.desc}
                      </p>
                    </button>
                  ))}
                </div>
              </div>

              {/* CE Case Pack Department & Syllabus Configuration */}
              {type === "ce_pack" && (
                <div className="mt-3 p-4 rounded-xl border border-primary/20 bg-primary-soft/30 dark:bg-primary-soft/10 space-y-4">
                  <div className="space-y-3 pb-3 border-b border-border/60">
                    <div>
                      <span className="text-xs font-bold text-text block">
                        Academic Domain & Syllabus Alignment
                      </span>
                      <p className="text-xs text-muted">
                        Select one of the 8 business domains to configure syllabus units, frameworks, and pedagogical rules.
                      </p>
                    </div>

                    {/* 8 Business Domains Grid Selector */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                      {DOMAINS.map((d) => {
                        const IconComponent = getDomainIcon(d.name);
                        const isSelected = domain === d.name;
                        return (
                          <button
                            key={d.id}
                            type="button"
                            onClick={() => handleDomainSelect(d.name)}
                            className={`p-3 rounded-xl border text-left transition-all flex flex-col justify-between ${
                              isSelected
                                ? "bg-primary text-white border-primary shadow-xs ring-1 ring-primary"
                                : "bg-surface border-border hover:border-accent/60 text-text hover:bg-surface/80"
                            }`}
                          >
                            <div className="flex items-center justify-between w-full mb-1">
                              <div className="flex items-center gap-1.5 min-w-0">
                                <IconComponent className={`w-4 h-4 shrink-0 ${isSelected ? "text-white" : "text-accent"}`} />
                                <span className={`text-xs font-bold truncate ${isSelected ? "text-white" : "text-text"}`}>
                                  {d.name}
                                </span>
                              </div>
                              {isSelected && (
                                <span className="w-4 h-4 rounded-full bg-white/20 flex items-center justify-center shrink-0 ml-1">
                                  <Check className="w-2.5 h-2.5 text-white stroke-[3]" />
                                </span>
                              )}
                            </div>
                            <p className={`text-[10px] leading-snug line-clamp-2 ${isSelected ? "text-white/85 font-medium" : "text-muted"}`}>
                              {d.shortDescription}
                            </p>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Syllabus Document Grounding (PDF/DOCX) */}
                  <div className="p-3.5 rounded-xl border border-border/80 bg-surface/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="space-y-0.5">
                      <div className="flex items-center gap-1.5 text-xs font-bold text-text">
                        <Paperclip className="w-3.5 h-3.5 text-accent" />
                        <span>Ground in Faculty Syllabus Document</span>
                      </div>
                      <p className="text-[11px] text-muted">
                        Upload your syllabus (PDF, DOCX, TXT) to automatically parse unit topics and map Bloom levels.
                      </p>
                      {syllabusMessage && (
                        <p className={`text-[11px] font-semibold ${syllabusMessage.startsWith("Error") ? "text-danger" : "text-success"}`}>
                          {syllabusMessage}
                        </p>
                      )}
                    </div>

                    <label className="shrink-0 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-border bg-primary-soft hover:bg-surface text-xs font-semibold text-text cursor-pointer transition-colors">
                      <Upload className="w-3.5 h-3.5 text-accent" />
                      <span>{uploadingSyllabus ? "Parsing..." : syllabusFileName ? "Change Syllabus" : "Upload Syllabus"}</span>
                      <input
                        type="file"
                        accept=".pdf,.docx,.txt"
                        className="hidden"
                        onChange={handleSyllabusUpload}
                        disabled={uploadingSyllabus}
                      />
                    </label>
                  </div>

                  {/* Units & Topics Multi-Select */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between text-xs font-semibold text-text">
                      <span>Curricular Topics (Grouped by Unit)</span>
                      <span className="text-[11px] text-muted">
                        {selectedTopics.length} selected
                      </span>
                    </div>

                    <div className="space-y-2.5 max-h-60 overflow-y-auto pr-1">
                      {/* Uploaded custom syllabus units if any */}
                      {uploadedUnits && uploadedUnits.length > 0 && (
                        <div className="p-3 rounded-lg border border-accent/40 bg-accent/5 space-y-2">
                          <div className="flex items-center justify-between text-xs">
                            <span className="font-bold text-accent">
                              Extracted from {syllabusFileName}:
                            </span>
                            <span className="px-1.5 py-0.5 rounded text-[10px] font-mono font-bold bg-accent/15 text-accent">
                              Custom Syllabus
                            </span>
                          </div>
                          {uploadedUnits.map((u, uIdx) => (
                            <div key={uIdx} className="space-y-1.5 pt-1">
                              <span className="text-[11px] font-semibold text-text block">
                                {u.name}
                              </span>
                              <div className="flex flex-wrap gap-1.5">
                                {u.topics.map((t: string) => {
                                  const isSelected = selectedTopics.includes(t);
                                  return (
                                    <button
                                      key={t}
                                      type="button"
                                      onClick={() => handleToggleTopic(t)}
                                      className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-all border ${
                                        isSelected
                                          ? "bg-accent/15 border-accent text-accent font-semibold"
                                          : "bg-surface border-border text-muted hover:text-text"
                                      }`}
                                    >
                                      {isSelected && <span className="mr-1">✓</span>}
                                      {t}
                                    </button>
                                  );
                                })}
                              </div>
                            </div>
                          ))}
                        </div>
                      )}

                      {getDepartmentProfile(department).units.map((u) => (
                        <div key={u.unit} className="p-3 rounded-lg border border-border/70 bg-surface/90 space-y-2">
                          <div className="flex items-center justify-between text-xs">
                            <span className="font-bold text-text">
                              Unit {u.unit}: {u.title}
                            </span>
                            {u.quantitative && (
                              <span className="px-1.5 py-0.5 rounded text-[10px] font-mono font-bold bg-warning/15 text-warning border border-warning/30">
                                Quantitative
                              </span>
                            )}
                          </div>
                          <div className="flex flex-wrap gap-1.5">
                            {u.topics.map((t) => {
                              const isSelected = selectedTopics.includes(t);
                              return (
                                <button
                                  key={t}
                                  type="button"
                                  onClick={() => handleToggleTopic(t)}
                                  className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-all border ${
                                    isSelected
                                      ? "bg-accent/15 border-accent text-accent font-semibold"
                                      : "bg-surface border-border text-muted hover:text-text"
                                  }`}
                                >
                                  {isSelected && <span className="mr-1">✓</span>}
                                  {t}
                                </button>
                              );
                            })}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* CE Pack Controls: Answer Key Toggle & Target Length */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-3 border-t border-border/60 text-xs">
                    <div className="flex items-center justify-between p-3 rounded-xl bg-surface border border-border">
                      <div>
                        <span className="font-bold text-text block">
                          Include Model Answer Key
                        </span>
                        <span className="text-[11px] text-muted">
                          Faculty/Admin only (hidden from students)
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={() => setIncludeAnswerKey(!includeAnswerKey)}
                        className={`w-11 h-6 rounded-full transition-colors relative p-0.5 ${
                          includeAnswerKey ? "bg-accent" : "bg-muted/40"
                        }`}
                      >
                        <div
                          className={`w-5 h-5 rounded-full bg-white transition-transform ${
                            includeAnswerKey ? "translate-x-5" : "translate-x-0"
                          }`}
                        />
                      </button>
                    </div>

                    <div className="flex items-center justify-between p-3 rounded-xl bg-surface border border-border">
                      <div>
                        <span className="font-bold text-text block">
                          Target Length
                        </span>
                        <span className="text-[11px] text-muted">
                          {casePackLength === "standard" ? "Standard (~1,200 words)" : "Short (~600 words)"}
                        </span>
                      </div>
                      <div className="inline-flex p-0.5 bg-primary-soft rounded-lg border border-border">
                        <button
                          type="button"
                          onClick={() => setCasePackLength("standard")}
                          className={`px-2.5 py-1 rounded-md text-xs font-semibold ${
                            casePackLength === "standard"
                              ? "bg-surface text-text shadow-xs"
                              : "text-muted hover:text-text"
                          }`}
                        >
                          Standard
                        </button>
                        <button
                          type="button"
                          onClick={() => setCasePackLength("short")}
                          className={`px-2.5 py-1 rounded-md text-xs font-semibold ${
                            casePackLength === "short"
                              ? "bg-surface text-text shadow-xs"
                              : "text-muted hover:text-text"
                          }`}
                        >
                          Short
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Factual Basis Toggle: Hypothetical vs Real Signal */}
              <div className="pt-2 border-t border-border flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                <div>
                  <span className="text-xs font-semibold text-text block">Case Data Source</span>
                  <span className="text-[11px] text-muted">
                    {format === "real_signal"
                      ? "Grounded in live macro signals with mandatory fact-verification banner."
                      : "Plausibly anonymized enterprise scenario for pure analytical inquiry."}
                  </span>
                </div>
                <div className="inline-flex p-1 bg-primary-soft rounded-xl border border-border shrink-0">
                  <button
                    type="button"
                    onClick={() => setFormat("hypothetical")}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                      format === "hypothetical"
                        ? "bg-primary text-white shadow-xs"
                        : "text-muted hover:text-text font-medium"
                    }`}
                  >
                    {format === "hypothetical" && <Check className="w-3.5 h-3.5 text-white shrink-0" />}
                    <span>Hypothetical</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setFormat("real_signal")}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                      format === "real_signal"
                        ? "bg-primary text-white shadow-xs"
                        : "text-muted hover:text-text font-medium"
                    }`}
                  >
                    {format === "real_signal" && <Check className="w-3.5 h-3.5 text-white shrink-0" />}
                    <span>Real Signal</span>
                  </button>
                </div>
              </div>

              {/* Institutional Department, Course & Category Alignment */}
              <div className="pt-4 border-t border-border space-y-4">
                <div className="flex items-center gap-2">
                  <Building className="w-4 h-4 text-accent" />
                  <span className="text-xs font-bold text-text">Institutional Academic Alignment</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {/* Department */}
                  <div className="space-y-1">
                    <label className="text-[11px] font-semibold text-text block">
                      Academic Department
                    </label>
                    <select
                      value={selectedDepartmentId}
                      onChange={(e) => {
                        const newDeptId = e.target.value;
                        setSelectedDepartmentId(newDeptId);
                        const matchedCourses = coursesList.filter((c) => c.department_id === newDeptId);
                        if (matchedCourses.length > 0) {
                          setSelectedCourseId(matchedCourses[0].id);
                        }
                      }}
                      className="w-full p-2.5 rounded-xl border border-border bg-surface text-text text-xs focus:outline-none focus:border-accent"
                    >
                      {departmentsList.map((d) => (
                        <option key={d.id} value={d.id}>
                          {d.name} ({d.code})
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Course */}
                  <div className="space-y-1">
                    <label className="text-[11px] font-semibold text-text block">
                      Target Course / Program
                    </label>
                    <select
                      value={selectedCourseId}
                      onChange={(e) => setSelectedCourseId(e.target.value)}
                      className="w-full p-2.5 rounded-xl border border-border bg-surface text-text text-xs focus:outline-none focus:border-accent"
                    >
                      {(coursesList.filter((c) => !selectedDepartmentId || c.department_id === selectedDepartmentId).length > 0
                        ? coursesList.filter((c) => !selectedDepartmentId || c.department_id === selectedDepartmentId)
                        : coursesList
                      ).map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.name} ({c.code})
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Category */}
                  <div className="space-y-1">
                    <label className="text-[11px] font-semibold text-text block">
                      Curriculum Category
                    </label>
                    <select
                      value={selectedCategoryId}
                      onChange={(e) => setSelectedCategoryId(e.target.value)}
                      className="w-full p-2.5 rounded-xl border border-border bg-surface text-text text-xs focus:outline-none focus:border-accent"
                    >
                      {categoriesList.map((cat) => (
                        <option key={cat.id} value={cat.id}>
                          {cat.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Target Length & Page Budget */}
                <div className="space-y-1.5 pt-1">
                  <label className="text-[11px] font-semibold text-text block">
                    Page Budget Target ({pageTarget} Pages / ~{pageTarget === 5 ? "2,250" : "4,500"} words)
                  </label>
                  <div className="grid grid-cols-2 gap-2.5">
                    <button
                      type="button"
                      onClick={() => setPageTarget(5)}
                      className={`p-2.5 rounded-xl border text-xs font-semibold text-left transition-all ${
                        pageTarget === 5
                          ? "bg-accent/15 border-accent text-accent"
                          : "bg-surface border-border text-muted hover:text-text"
                      }`}
                    >
                      <div className="font-bold">5 Pages (~2,250 words)</div>
                      <div className="text-[10px] opacity-80">Standard institutional teaching case</div>
                    </button>
                    <button
                      type="button"
                      onClick={() => setPageTarget(10)}
                      className={`p-2.5 rounded-xl border text-xs font-semibold text-left transition-all ${
                        pageTarget === 10
                          ? "bg-accent/15 border-accent text-accent"
                          : "bg-surface border-border text-muted hover:text-text"
                      }`}
                    >
                      <div className="font-bold">10 Pages (~4,500 words)</div>
                      <div className="text-[10px] opacity-80">Comprehensive executive/Ivey-length study</div>
                    </button>
                  </div>
                </div>

                {/* Keywords Chips (3 to 8 chips) */}
                <div className="space-y-2 pt-1">
                  <div className="flex items-center justify-between text-[11px]">
                    <label className="font-semibold text-text flex items-center gap-1.5">
                      <Tag className="w-3.5 h-3.5 text-accent" />
                      <span>Keywords & Indexing Tags (Required: 3 to 8)</span>
                    </label>
                    <span className={`font-mono text-[10px] ${keywords.length >= 3 && keywords.length <= 8 ? "text-success font-bold" : "text-danger"}`}>
                      {keywords.length} of 8 keywords ({keywords.length < 3 ? `Add ${3 - keywords.length} more` : "Valid"})
                    </span>
                  </div>

                  <div className="flex flex-wrap items-center gap-1.5 p-2 rounded-xl border border-border bg-surface min-h-10">
                    {keywords.map((kw) => (
                      <span
                        key={kw}
                        className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-primary-soft text-text text-xs border border-border font-medium"
                      >
                        <span>{kw}</span>
                        <button
                          type="button"
                          onClick={() => handleRemoveKeyword(kw)}
                          className="text-muted hover:text-danger ml-0.5"
                          title="Remove keyword"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </span>
                    ))}
                    {keywords.length < 8 && (
                      <div className="flex items-center gap-1 flex-1 min-w-[140px]">
                        <input
                          type="text"
                          value={keywordInput}
                          placeholder={keywords.length < 3 ? "Type tag & hit Enter..." : "Add tag..."}
                          onChange={(e) => setKeywordInput(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === "Enter") {
                              e.preventDefault();
                              handleAddKeyword();
                            }
                          }}
                          className="flex-1 bg-transparent border-none text-xs text-text placeholder:text-muted/60 focus:outline-none p-1"
                        />
                        {keywordInput.trim() && (
                          <button
                            type="button"
                            onClick={handleAddKeyword}
                            className="px-2 py-0.5 rounded bg-accent text-accent-text text-[10px] font-bold"
                          >
                            Add
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* 2. PEDAGOGICAL DOMAIN & ENTERPRISE FIELDS */}
            <div className="p-5 rounded-2xl border border-border bg-surface shadow-sm space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-primary text-on-primary font-bold text-xs flex items-center justify-center">
                    2
                  </span>
                  <h3 className="font-serif text-sm font-bold text-text">
                    Domain, Difficulty & Primary Entity
                  </h3>
                </div>
                <span className="text-xs text-muted font-medium">Step 2 of 5</span>
              </div>

              {/* 8 Business Domains Selector */}
              <div className="space-y-3">
                <div>
                  <label className="text-xs font-semibold text-text block">
                    Academic Domain Focus
                  </label>
                  <p className="text-[11px] text-muted">
                    Choose from the 8 core business disciplines. Topics adjust dynamically.
                  </p>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                  {DOMAINS.map((d) => {
                    const IconComponent = getDomainIcon(d.name);
                    const isSelected = domain === d.name;
                    return (
                      <button
                        key={d.id}
                        type="button"
                        onClick={() => handleDomainSelect(d.name)}
                        className={`p-3 rounded-xl border text-left transition-all flex flex-col justify-between ${
                          isSelected
                            ? "bg-primary text-white border-primary shadow-xs ring-1 ring-primary"
                            : "bg-surface border-border hover:border-accent/60 text-text hover:bg-surface/80"
                        }`}
                      >
                        <div className="flex items-center justify-between w-full mb-1">
                          <div className="flex items-center gap-1.5 min-w-0">
                            <IconComponent className={`w-4 h-4 shrink-0 ${isSelected ? "text-white" : "text-accent"}`} />
                            <span className={`text-xs font-bold truncate ${isSelected ? "text-white" : "text-text"}`}>
                              {d.name}
                            </span>
                          </div>
                          {isSelected && (
                            <span className="w-4 h-4 rounded-full bg-white/20 flex items-center justify-center shrink-0 ml-1">
                              <Check className="w-2.5 h-2.5 text-white stroke-[3]" />
                            </span>
                          )}
                        </div>
                        <p className={`text-[10px] leading-snug line-clamp-2 ${isSelected ? "text-white/85 font-medium" : "text-muted"}`}>
                          {d.shortDescription}
                        </p>
                      </button>
                    );
                  })}
                </div>

                {/* Topics Grouped by Unit */}
                <div className="pt-1 space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-text">
                      Curricular Topics ({domain}) — {selectedTopics.length} selected
                    </span>
                  </div>
                  <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                    {currentDomainConfig?.units.map((unit) => (
                      <div key={unit.unit} className="p-2.5 rounded-lg border border-border/80 bg-surface/60 space-y-1.5">
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-[11px] font-bold text-text">
                            {unit.title}
                          </span>
                          <button
                            type="button"
                            onClick={() => handleToggleUnitTopics(unit.topics)}
                            className="text-[10px] font-semibold text-accent hover:underline"
                          >
                            {unit.topics.every((t) => selectedTopics.includes(t)) ? "Deselect Unit" : "Select Unit"}
                          </button>
                        </div>
                        <div className="flex flex-wrap gap-1.5">
                          {unit.topics.map((t) => {
                            const isSelected = selectedTopics.includes(t);
                            return (
                              <button
                                key={t}
                                type="button"
                                onClick={() => handleToggleTopic(t)}
                                className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-all border ${
                                  isSelected
                                    ? "bg-accent/15 border-accent text-accent font-semibold"
                                    : "bg-surface border-border text-muted hover:text-text hover:border-accent/40"
                                }`}
                              >
                                {isSelected && <span className="mr-1">✓</span>}
                                {t}
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Difficulty & Target Audience */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                <div>
                  <label className="text-[11px] font-semibold text-muted mb-1 block">
                    Pedagogical Difficulty
                  </label>
                  <div className="grid grid-cols-3 gap-1 p-1 bg-primary-soft rounded-xl border border-border">
                    {DIFFICULTIES.map((diff) => (
                      <button
                        key={diff}
                        type="button"
                        onClick={() => setDifficulty(diff)}
                        className={`py-1.5 rounded-lg text-xs font-bold text-center transition-all ${
                          difficulty === diff
                            ? "bg-surface text-text shadow-sm"
                            : "text-muted hover:text-text"
                        }`}
                      >
                        {diff}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="text-[11px] font-semibold text-muted mb-1 block">
                    Target Student Cohort
                  </label>
                  <div className="grid grid-cols-3 gap-1 p-1 bg-primary-soft rounded-xl border border-border">
                    {TARGET_AUDIENCES.map((aud) => (
                      <button
                        key={aud}
                        type="button"
                        onClick={() => setTargetAudience(aud)}
                        className={`py-1.5 rounded-lg text-xs font-bold text-center transition-all ${
                          targetAudience === aud
                            ? "bg-surface text-text shadow-sm"
                            : "text-muted hover:text-text"
                        }`}
                      >
                        {aud}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Top Case Study Companies Dropdown & Quick Selector */}
              <div className="p-3.5 rounded-2xl bg-surface border border-border shadow-xs space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <Building className="w-4 h-4 text-accent" />
                    <label className="text-xs font-bold text-text">
                      Select Target Company (Top Market Case Subjects)
                    </label>
                  </div>
                  <span className="text-[10px] text-muted">
                    Choose from 18+ real-world market leaders or enter custom
                  </span>
                </div>

                {/* Categorized Dropdown Selector */}
                <div className="relative">
                  <select
                    value={isCustomCompany ? "custom" : selectedCompanyId}
                    onChange={(e) => handleCompanySelect(e.target.value)}
                    className="w-full text-xs font-semibold p-2.5 rounded-xl bg-surface-raised border border-border text-text focus:outline-none focus:ring-2 focus:ring-accent cursor-pointer"
                  >
                    <option value="" disabled>-- Select a top market enterprise --</option>
                    {Object.entries(groupedCompanies).map(([category, companies]) => (
                      <optgroup key={category} label={category}>
                        {companies.map((comp) => (
                          <option key={comp.id} value={comp.id}>
                            {comp.name} {comp.badge ? `(${comp.badge})` : ""} — {comp.industry}
                          </option>
                        ))}
                      </optgroup>
                    ))}
                    <optgroup label="Custom / Free-form">
                      <option value="custom">✏️ Custom Enterprise (Enter manually below)</option>
                    </optgroup>
                  </select>
                </div>

                {/* Quick Trending Chips */}
                <div className="flex items-center gap-1.5 flex-wrap pt-0.5">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-muted mr-1">
                    Trending:
                  </span>
                  {[
                    { id: "tata-motors-ev", label: "⚡ Tata Motors EV" },
                    { id: "zomato-blinkit", label: "🍔 Zomato & Blinkit" },
                    { id: "amul-gcmmf", label: "🥛 Amul (GCMMF)" },
                    { id: "surat-lab-grown-diamonds", label: "💎 Surat Diamonds" },
                    { id: "zerodha", label: "📈 Zerodha" },
                    { id: "reliance-retail", label: "🛒 Reliance Retail" },
                    { id: "zoho-corporation", label: "💻 Zoho Corp" },
                  ].map((chip) => (
                    <button
                      key={chip.id}
                      type="button"
                      onClick={() => handleCompanySelect(chip.id)}
                      className={`text-[11px] px-2.5 py-1 rounded-lg border transition-all ${
                        selectedCompanyId === chip.id && !isCustomCompany
                          ? "bg-primary text-white border-primary font-bold shadow-2xs"
                          : "bg-surface-raised border-border text-text hover:border-accent hover:text-accent font-medium"
                      }`}
                    >
                      {chip.label}
                    </button>
                  ))}
                </div>

                {/* Feedback Toast Banner when a preset is selected */}
                {companyPresetNotice && (
                  <div className="p-2.5 rounded-xl bg-accent/15 border border-accent/30 text-accent text-xs font-semibold flex items-center gap-2 animate-fadeIn">
                    <Sparkles className="w-4 h-4 text-accent shrink-0" />
                    <span>{companyPresetNotice}</span>
                  </div>
                )}

                {/* Editable Company Name & Location Fields */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1 border-t border-border/40">
                  <div>
                    <label className="text-[11px] font-semibold text-muted mb-1 flex items-center justify-between">
                      <span>Enterprise Name (Editable)</span>
                      {format === "real_signal" && (
                        <span className="text-[10px] text-accent font-medium">Real entity active</span>
                      )}
                    </label>
                    <input
                      type="text"
                      value={primaryCompany}
                      onChange={(e) => {
                        setPrimaryCompany(e.target.value);
                        setIsCustomCompany(true);
                      }}
                      placeholder="e.g. Tata Motors Passenger Vehicles Ltd"
                      className="w-full text-xs p-2.5 rounded-xl bg-surface border border-border text-text focus:outline-none focus:ring-1 focus:ring-accent"
                    />
                  </div>

                  <div>
                    <label className="text-[11px] font-semibold text-muted mb-1 block">
                      Location & Market Geography
                    </label>
                    <input
                      type="text"
                      value={locationMarket}
                      onChange={(e) => setLocationMarket(e.target.value)}
                      placeholder="e.g. Ahmedabad & Surat, Gujarat / Pan-India"
                      className="w-full text-xs p-2.5 rounded-xl bg-surface border border-border text-text focus:outline-none focus:ring-1 focus:ring-accent"
                    />
                  </div>
                </div>
              </div>

              {/* Central Dilemma with Live Character Warning */}
              <div className="space-y-1">
                <div className="flex items-center justify-between text-xs font-semibold">
                  <label className="text-text">
                    Central Management Dilemma & Operational Tension
                  </label>
                  <span
                    className={`font-mono text-[11px] ${
                      centralDilemma.length < 30 ? "text-warning font-bold" : "text-muted"
                    }`}
                  >
                    {centralDilemma.length} chars {centralDilemma.length < 30 ? "(< 30 minimum)" : ""}
                  </span>
                </div>
                <textarea
                  rows={3}
                  value={centralDilemma}
                  onChange={(e) => setCentralDilemma(e.target.value)}
                  placeholder="State the explicit crossroad dilemma facing the protagonist (e.g. whether to allocate ₹2,500 Cr into proprietary battery cell manufacturing or enter a long-term OEM alliance)..."
                  className="w-full text-xs p-3 rounded-xl bg-surface border border-border text-text focus:outline-none focus:ring-1 focus:ring-accent"
                />
              </div>

              {/* Key Decision Maker & Protagonists */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] font-semibold text-muted mb-1 block">
                    Key Decision Maker (Protagonist 1)
                  </label>
                  <input
                    type="text"
                    value={keyDecisionMaker}
                    onChange={(e) => setKeyDecisionMaker(e.target.value)}
                    placeholder="e.g. Shailesh Chandra, Managing Director"
                    className="w-full text-xs p-2.5 rounded-xl bg-surface border border-border text-text focus:outline-none focus:ring-1 focus:ring-accent"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-semibold text-muted mb-1 block">
                    Key Protagonists & Stakeholders
                  </label>
                  <input
                    type="text"
                    value={protagonists}
                    onChange={(e) => setProtagonists(e.target.value)}
                    placeholder="e.g. Chief Technology Officer, VP Logistics, Labor Union Head"
                    className="w-full text-xs p-2.5 rounded-xl bg-surface border border-border text-text focus:outline-none focus:ring-1 focus:ring-accent"
                  />
                </div>
              </div>

              {/* Learning Objectives Add/Remove List */}
              <div className="space-y-2 pt-2 border-t border-border">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-semibold text-text flex items-center gap-1.5">
                    <Target className="w-3.5 h-3.5 text-accent" />
                    <span>Learning Objectives ({learningObjectives.length})</span>
                  </label>
                  {learningObjectives.length === 0 && (
                    <span className="text-[11px] text-warning font-semibold">
                      At least 1 required
                    </span>
                  )}
                </div>

                {/* Input with Add Button */}
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={newObjectiveText}
                    onChange={(e) => setNewObjectiveText(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        handleAddObjective();
                      }
                    }}
                    placeholder="Enter an outcome (e.g. Assess capital allocation trade-offs under regulatory uncertainty)..."
                    className="flex-1 text-xs p-2.5 rounded-xl bg-surface border border-border text-text focus:outline-none focus:ring-1 focus:ring-accent"
                  />
                  <button
                    type="button"
                    onClick={() => handleAddObjective()}
                    className="px-3.5 py-2.5 rounded-xl bg-primary text-on-primary text-xs font-bold hover:opacity-90 flex items-center gap-1 shrink-0"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add</span>
                  </button>
                </div>

                {/* Rendered Objectives List */}
                {learningObjectives.length > 0 ? (
                  <div className="space-y-1.5 pt-1">
                    {learningObjectives.map((obj, idx) => (
                      <div
                        key={idx}
                        className="flex items-center justify-between p-2.5 rounded-xl bg-primary-soft/50 border border-border text-xs text-text group"
                      >
                        <div className="flex items-start gap-2 pr-2">
                          <span className="w-4 h-4 rounded-full bg-accent text-accent-text text-[10px] font-bold flex items-center justify-center shrink-0 mt-0.5">
                            {idx + 1}
                          </span>
                          <span className="leading-relaxed">{obj}</span>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleRemoveObjective(idx)}
                          className="text-muted hover:text-danger p-1 rounded transition-colors shrink-0"
                          title="Remove objective"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-[11px] text-muted italic">
                    No learning objectives specified. Add one above or select from suggestions below.
                  </p>
                )}

                {/* Quick Add Suggestions */}
                <div className="pt-1">
                  <span className="text-[10px] uppercase font-bold text-muted block mb-1">
                    Quick Suggestion Chips:
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {SUGGESTED_OBJECTIVES.map((sug, i) => (
                      <button
                        key={i}
                        type="button"
                        onClick={() => handleAddObjective(sug)}
                        className="px-2.5 py-1 rounded-lg bg-surface border border-border hover:border-accent text-[11px] text-muted hover:text-text transition-colors text-left"
                      >
                        + {sug}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* 3. SOURCE MATERIAL (PASTE, UPLOAD, TRENDING SIGNALS) */}
            <div className="p-5 rounded-2xl border border-border bg-surface shadow-sm space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-primary text-on-primary font-bold text-xs flex items-center justify-center">
                    3
                  </span>
                  <h3 className="font-serif text-sm font-bold text-text">
                    Source Material & Macro Signals
                  </h3>
                </div>
                <span className="text-xs text-muted font-medium">Step 3 of 5</span>
              </div>

              {/* 3 Source Tabs */}
              <div className="grid grid-cols-3 gap-1 p-1 bg-primary-soft rounded-xl border border-border">
                <button
                  type="button"
                  onClick={() => setSourceTab("paste")}
                  className={`py-2 px-3 rounded-lg text-xs font-bold transition-all ${
                    sourceTab === "paste"
                      ? "bg-surface text-text shadow-sm"
                      : "text-muted hover:text-text"
                  }`}
                >
                  Paste Notes
                </button>
                <button
                  type="button"
                  onClick={() => setSourceTab("upload")}
                  className={`py-2 px-3 rounded-lg text-xs font-bold transition-all ${
                    sourceTab === "upload"
                      ? "bg-surface text-text shadow-sm"
                      : "text-muted hover:text-text"
                  }`}
                >
                  Upload File
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setSourceTab("signal");
                    setSignalsModalOpen(true);
                  }}
                  className={`py-2 px-3 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1 ${
                    sourceTab === "signal"
                      ? "bg-surface text-text shadow-sm"
                      : "text-muted hover:text-text"
                  }`}
                >
                  <Zap className="w-3.5 h-3.5 text-accent" />
                  <span>Trending Signals</span>
                </button>
              </div>

              {/* Tab 1: Paste Text */}
              {sourceTab === "paste" && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-[11px] text-muted">
                    <span>Paste press releases, annual reports, or executive interview transcripts:</span>
                    <VoiceDictationButton
                      onTranscript={(spokenText) => {
                        setSourceNotes((prev) => (prev ? `${prev} ${spokenText}` : spokenText));
                      }}
                    />
                  </div>
                  <textarea
                    rows={5}
                    value={sourceNotes}
                    onChange={(e) => setSourceNotes(e.target.value)}
                    placeholder="Paste regulatory filings, Gujarat gazette notifications, internal financial statements, or raw news notes..."
                    className="w-full text-xs p-3 rounded-xl bg-surface border border-border text-text focus:outline-none focus:ring-1 focus:ring-accent font-mono"
                  />
                  <div className="flex justify-between text-[11px] text-muted">
                    <span>{AI_ENGINE_LABEL} will weave empirical data into the narrative.</span>
                    <span>{sourceNotes.split(/\s+/).filter(Boolean).length} words</span>
                  </div>
                </div>
              )}

              {/* Tab 2: Upload File (PDF, DOCX, TXT) */}
              {sourceTab === "upload" && (
                <div className="space-y-3">
                  <FileSourceImporter
                    onExtracted={(extractedText, filename) => {
                      setSourceNotes((prev) =>
                        prev
                          ? `${prev}\n\n[FILE ATTACHED: ${filename}]\n${extractedText}`
                          : `[FILE ATTACHED: ${filename}]\n${extractedText}`
                      );
                    }}
                  />
                  {sourceNotes && (
                    <div className="p-3 rounded-xl bg-primary-soft/50 border border-border text-xs">
                      <span className="font-semibold text-text block mb-1">Extracted Source Buffer:</span>
                      <p className="text-[11px] text-muted line-clamp-3 font-mono">
                        {sourceNotes}
                      </p>
                    </div>
                  )}
                </div>
              )}

              {/* Tab 3 / Modal: Select from Trending Signals */}
              {signalsModalOpen && (
                <div className="p-4 rounded-xl border border-accent/40 bg-accent/5 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-accent uppercase tracking-wider flex items-center gap-1.5">
                      <Zap className="w-3.5 h-3.5" />
                      <span>Select Live Case Signal</span>
                    </span>
                    <button
                      type="button"
                      onClick={() => setSignalsModalOpen(false)}
                      className="text-muted hover:text-text p-1 text-xs"
                    >
                      Close
                    </button>
                  </div>
                  <p className="text-xs text-muted">
                    Click any live signal to auto-populate company name, domain, dilemma, and source notes:
                  </p>
                  <div className="max-h-60 overflow-y-auto space-y-2 pr-1">
                    {availableSignals.map((sig) => (
                      <div
                        key={sig.id}
                        onClick={() => handleSelectSignal(sig)}
                        className="p-3 rounded-xl bg-surface border border-border hover:border-accent cursor-pointer transition-all hover:shadow-sm"
                      >
                        <div className="flex items-center justify-between text-xs font-bold text-text mb-1">
                          <span className="truncate pr-2">{sig.title}</span>
                          <span className="px-2 py-0.5 rounded-full bg-accent/15 text-accent text-[10px] shrink-0 font-mono">
                            Score {sig.potential_score}/10
                          </span>
                        </div>
                        <p className="text-[11px] text-muted line-clamp-2">{sig.summary}</p>
                        <div className="mt-1.5 flex items-center gap-2 text-[10px] text-muted">
                          <span className="font-semibold text-text">{sig.industry}</span>
                          <span>•</span>
                          <span>{sig.source}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* 4. GENERATION OPTIONS & PEDAGOGICAL CONTROLS */}
            <div className="p-5 rounded-2xl border border-border bg-surface shadow-sm space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-primary text-on-primary font-bold text-xs flex items-center justify-center">
                    4
                  </span>
                  <h3 className="font-serif text-sm font-bold text-text">
                    Tone, Exhibits & Bloom&apos;s Level
                  </h3>
                </div>
                <span className="text-xs text-muted font-medium">Step 4 of 5</span>
              </div>

              {/* Tone Selection */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-text block">
                  Narrative Tone & Voice
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {TONES.map((t) => (
                    <button
                      key={t}
                      type="button"
                      onClick={() => setTone(t)}
                      className={`p-2.5 rounded-xl text-xs font-semibold border transition-all text-center ${
                        tone === t
                          ? "bg-primary text-on-primary border-primary shadow-sm"
                          : "bg-surface border-border text-text hover:border-accent"
                      }`}
                    >
                      {t}
                    </button>
                  ))}
                </div>
              </div>

              {/* Include Exhibits Checkboxes */}
              <div className="space-y-1.5 pt-1">
                <label className="text-xs font-semibold text-text block">
                  Quantitative & Qualitative Exhibits
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  {[
                    {
                      id: "financials",
                      label: "Financials",
                      sub: "3-Yr P&L & Margins",
                      checked: includeFinancials,
                      setter: setIncludeFinancials,
                    },
                    {
                      id: "org_chart",
                      label: "Org Chart",
                      sub: "Governance Structure",
                      checked: includeOrgChart,
                      setter: setIncludeOrgChart,
                    },
                    {
                      id: "market_data",
                      label: "Market Data",
                      sub: "Competitor Benchmark",
                      checked: includeMarketData,
                      setter: setIncludeMarketData,
                    },
                  ].map((ex) => (
                    <button
                      key={ex.id}
                      type="button"
                      onClick={() => ex.setter(!ex.checked)}
                      className={`p-2.5 rounded-xl border text-left transition-all flex items-start gap-2.5 ${
                        ex.checked
                          ? "bg-primary-soft border-accent/50 text-text"
                          : "bg-surface border-border text-muted hover:border-border"
                      }`}
                    >
                      <div
                        className={`w-4 h-4 rounded mt-0.5 flex items-center justify-center border shrink-0 ${
                          ex.checked ? "bg-accent border-accent text-accent-text" : "border-border bg-surface"
                        }`}
                      >
                        {ex.checked && <Check className="w-3 h-3 text-accent-text" />}
                      </div>
                      <div>
                        <p className="text-xs font-bold text-text">{ex.label}</p>
                        <p className="text-[10px] text-muted">{ex.sub}</p>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Teaching Note Toggle & Bloom's Level */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1 border-t border-border">
                {/* Teaching Note Toggle */}
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-text block">
                    Facilitator Teaching Note
                  </label>
                  <div className="grid grid-cols-2 gap-1 p-1 bg-primary-soft rounded-xl border border-border">
                    <button
                      type="button"
                      onClick={() => setIncludeTeachingNote(true)}
                      className={`py-1.5 rounded-lg text-xs font-bold transition-all ${
                        includeTeachingNote
                          ? "bg-surface text-text shadow-sm"
                          : "text-muted hover:text-text"
                      }`}
                    >
                      Include Note
                    </button>
                    <button
                      type="button"
                      onClick={() => setIncludeTeachingNote(false)}
                      className={`py-1.5 rounded-lg text-xs font-bold transition-all ${
                        !includeTeachingNote
                          ? "bg-surface text-text shadow-sm"
                          : "text-muted hover:text-text"
                      }`}
                    >
                      Omit Note
                    </button>
                  </div>
                  <p className="text-[10px] text-muted">
                    {includeTeachingNote ? "Generates 80-min class flow & frameworks." : "Outputs student-facing case only."}
                  </p>
                </div>

                {/* Bloom's Taxonomy Level */}
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-text block">
                    Bloom&apos;s Taxonomy Level
                  </label>
                  <select
                    value={bloomsLevel}
                    onChange={(e) => setBloomsLevel(e.target.value)}
                    className="w-full text-xs p-2 rounded-xl bg-surface border border-border text-text focus:outline-none focus:ring-1 focus:ring-accent"
                  >
                    {BLOOMS_LEVELS.map((bl) => (
                      <option key={bl.id} value={bl.id}>
                        {bl.label} ({bl.desc})
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* 5. VALIDATION WARNINGS DISPLAY */}
            {validationWarnings.length > 0 && (
              <div className="p-4 rounded-2xl border border-warning/40 bg-warning/10 space-y-2">
                <div className="flex items-center gap-2 text-warning font-serif font-bold text-xs">
                  <AlertTriangle className="w-4 h-4 shrink-0" />
                  <span>Case Rigor & Quality Safeguards:</span>
                </div>
                <div className="space-y-1 pl-6">
                  {validationWarnings.map((w, idx) => (
                    <p key={idx} className="text-xs text-text leading-relaxed">
                      • {w}
                    </p>
                  ))}
                </div>
              </div>
            )}

            {/* 6. GENERATION ESTIMATOR BANNER */}
            <div className="p-4 rounded-2xl border border-border bg-primary-soft/40 flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-primary text-on-primary flex items-center justify-center shrink-0">
                  <Cpu className="w-5 h-5 text-on-primary" />
                </div>
                <div>
                  <span className="text-xs font-bold text-text block">
                    Estimated Pre-Generation Specs
                  </span>
                  <span className="text-[11px] text-muted">
                    1 Case Study Generation • ~{resourceEstimates.seconds}s generation • {AI_ENGINE_LABEL}
                  </span>
                </div>
              </div>
              <span className="text-[10px] font-mono px-2.5 py-1 rounded-full bg-surface border border-border font-bold text-accent">
                {type.toUpperCase()} SPEC
              </span>
            </div>

            {/* 7. ERROR AND RETRY STATE DISPLAY */}
            {generationError && (
              <div className="p-4 rounded-xl border border-danger/30 bg-danger/15 text-danger space-y-3">
                <div className="flex items-start gap-2.5">
                  <AlertTriangle className="w-5 h-5 text-danger shrink-0 mt-0.5" />
                  <div className="flex-1 text-xs">
                    <p className="font-bold text-danger">
                      {generationError.isRateLimit
                        ? "Hourly Generation Limit Reached"
                        : "Case Generation Interruption"}
                    </p>
                    <p className="mt-1 leading-relaxed">{generationError.message}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3 pt-1">
                  {generationError.retryable && (
                    <button
                      type="button"
                      onClick={() => handleGenerate(true)}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-danger text-accent-text text-xs font-semibold hover:opacity-90 shadow-sm"
                    >
                      <RefreshCw className="w-3.5 h-3.5" />
                      Retry Generation
                    </button>
                  )}
                </div>
              </div>
            )}

            {/* 8. MAIN ACTION: GENERATE BUTTON & MULTI-STEP PROGRESS */}
            <div className="space-y-3">
              {isGenerating ? (
                <div className="p-5 rounded-2xl border border-accent bg-surface shadow-lg space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <RefreshCw className="w-5 h-5 text-accent animate-spin" />
                      <span className="font-serif font-bold text-sm text-text">
                        {type === "ce_pack"
                          ? `Generating CE Case Pack (${department.toUpperCase()})...`
                          : `Generating Case with ${AI_ENGINE_LABEL}...`}
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={handleCancelGeneration}
                      className="px-3 py-1 rounded-lg bg-surface border border-danger/40 text-danger text-xs font-bold hover:bg-danger/10 transition-colors"
                    >
                      Cancel Generation
                    </button>
                  </div>

                  {/* Multi-Step Progress Bar */}
                  {type === "ce_pack" ? (
                    <div className="space-y-3">
                      <div className="flex items-center justify-between text-[11px] font-semibold text-muted">
                        <span>Step {generationStep} of 4:</span>
                        <span className="text-accent font-bold">
                          {streamingStepName || (
                            generationStep === 1
                              ? "1. Case Narrative (Indian context & data tables)"
                              : generationStep === 2
                              ? "2. Case Analysis Questions (Bloom taxonomy)"
                              : generationStep === 3
                              ? "3. Model Answer Key & Teaching Notes"
                              : "4. Programmatic Checks & Quality Validation"
                          )}
                        </span>
                      </div>
                      <div className="w-full h-2.5 bg-primary-soft rounded-full overflow-hidden p-0.5 border border-border">
                        <div
                          className="h-full bg-accent rounded-full transition-all duration-300"
                          style={{
                            width: `${streamingProgress || Math.round((generationStep / 4) * 100)}%`,
                          }}
                        />
                      </div>

                      {/* Live streaming text snippet */}
                      {streamingText && (
                        <div className="mt-2 p-3 rounded-xl bg-primary-soft/60 border border-border text-xs font-mono text-muted max-h-36 overflow-y-auto whitespace-pre-wrap leading-relaxed">
                          {streamingText.slice(-600)}
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-[11px] font-semibold text-muted">
                        <span>Step {generationStep} of 5:</span>
                        <span className="text-accent font-bold">
                          {generationStep === 1 && "1. Researching & Fact Verification"}
                          {generationStep === 2 && "2. Structuring Pedagogical Architecture"}
                          {generationStep === 3 && "3. Drafting Business Dilemma & Context"}
                          {generationStep === 4 && "4. Generating Exhibits & Financial Models"}
                          {generationStep === 5 && "5. Polishing Discussion Questions & Flow"}
                        </span>
                      </div>
                      <div className="w-full h-2.5 bg-primary-soft rounded-full overflow-hidden p-0.5 border border-border">
                        <div
                          className="h-full bg-accent rounded-full transition-all duration-500"
                          style={{ width: `${(generationStep / 5) * 100}%` }}
                        />
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => handleGenerate(false)}
                  className="w-full py-4 px-6 rounded-2xl bg-accent hover:bg-accent-hover text-accent-text font-serif text-base font-bold tracking-wide hover:shadow-xl transition-all flex items-center justify-center gap-3"
                >
                  <Sparkles className="w-5 h-5 text-accent-text" />
                  <span>
                    {type === "ce_pack"
                      ? `Generate CE Case Pack (${department.toUpperCase()})`
                      : type === "short"
                      ? "Generate Short Case (~2 pp)"
                      : type === "research"
                      ? "Generate Case Research (Multi-Firm)"
                      : "Generate Full Teaching Case"}
                  </span>
                </button>
              )}
            </div>

            {/* 9A. GENERATED CE CASE PACK (TABBED RESULT VIEW) */}
            {generatedCasePack && (
              <div className="p-6 rounded-2xl border-2 border-accent bg-surface shadow-xl space-y-5">
                <CECasePackView
                  casePack={generatedCasePack}
                  isStudent={currentUser?.role === "student"}
                  validationReport={casePackValidation}
                  onRerunChecks={handleRerunChecks}
                  onAutoFix={handleAutoFix}
                  isAutoFixing={isAutoFixing}
                  onSave={handleSaveCasePack}
                  isSaving={isSavingCasePack}
                  saveSuccess={saveCasePackSuccess}
                  showExportControls={false}
                />
              </div>
            )}

            {/* 9B. GENERATED STANDARD CASE PREVIEW TABS & CONTROLS */}
            {generatedCase && (
              <div className="p-6 rounded-2xl border-2 border-accent bg-surface shadow-xl space-y-5">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border pb-4">
                  <div>
                    <span className="text-[10px] font-mono uppercase font-bold text-accent tracking-wider block">
                      Case Study Generated Successfully
                    </span>
                    <h2 className="font-serif text-xl font-bold text-text mt-0.5">
                      {generatedCase.title}
                    </h2>
                  </div>

                  {/* Action Buttons Toolbar */}
                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      type="button"
                      disabled={savingDraft}
                      onClick={handleSaveDraft}
                      className="px-3 py-1.5 rounded-xl border border-border hover:border-accent text-xs font-semibold text-text flex items-center gap-1.5 transition-colors disabled:opacity-50"
                    >
                      <Bookmark className="w-3.5 h-3.5 text-muted" />
                      <span>{savingDraft ? "Saving..." : "Save Draft"}</span>
                    </button>

                    <button
                      type="button"
                      disabled={submittingReview}
                      onClick={handleSubmitReview}
                      className="px-3.5 py-1.5 rounded-xl bg-primary text-on-primary hover:opacity-90 text-xs font-bold flex items-center gap-1.5 transition-all disabled:opacity-50"
                    >
                      <Send className="w-3.5 h-3.5 text-on-primary" />
                      <span>{submittingReview ? "Submitting..." : "Submit for Review"}</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => router.push(`/cases/${generatedCase.id}`)}
                      className="p-1.5 rounded-xl border border-border text-text hover:border-accent"
                      title="Open full interactive studio"
                    >
                      <ArrowRight className="w-4 h-4 text-accent" />
                    </button>
                  </div>
                </div>

                {/* Feedback Toast */}
                {previewFeedback && (
                  <div className="p-3 rounded-xl bg-success/15 border border-success/30 text-success text-xs font-semibold flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-success shrink-0" />
                    <span>{previewFeedback}</span>
                  </div>
                )}

                {/* Preview Navigation Tabs */}
                <div className="flex border-b border-border gap-2 text-xs font-semibold">
                  {[
                    { id: "text", label: "Case Text" },
                    { id: "exhibits", label: `Exhibits (${generatedCase.content.exhibits?.length || 0})` },
                    ...(generatedCase.content.teaching_note ? [{ id: "teaching_note", label: "Teaching Note" }] : []),
                    { id: "questions", label: `Discussion Questions (${generatedCase.content.discussion_questions?.length || 0})` },
                  ].map((tab) => (
                    <button
                      key={tab.id}
                      type="button"
                      onClick={() => setPreviewTab(tab.id as any)}
                      className={`pb-2.5 px-3 transition-colors relative ${
                        previewTab === tab.id
                          ? "text-accent border-b-2 border-accent font-bold"
                          : "text-muted hover:text-text"
                      }`}
                    >
                      {tab.label}
                    </button>
                  ))}
                </div>

                {/* Section Regeneration Dropdown */}
                <div className="flex items-center justify-between text-xs p-2.5 rounded-xl bg-primary-soft/40 border border-border">
                  <span className="text-muted">Want to refine a specific section?</span>
                  <div className="flex items-center gap-1.5">
                    {[
                      { id: "dilemma" as const, label: "Dilemma" },
                      { id: "exhibits" as const, label: "Exhibits" },
                      { id: "questions" as const, label: "Questions" },
                      ...(generatedCase.content.teaching_note ? [{ id: "teaching_note" as const, label: "Teaching Note" }] : []),
                    ].map((sec) => (
                      <button
                        key={sec.id}
                        type="button"
                        disabled={regeneratingSection !== null}
                        onClick={() => handleRegenerateSection(sec.id)}
                        className="px-2.5 py-1 rounded-lg bg-surface border border-border hover:border-accent text-[11px] font-semibold text-text flex items-center gap-1 transition-colors disabled:opacity-50"
                      >
                        <RotateCcw className={`w-3 h-3 ${regeneratingSection === sec.id ? "animate-spin text-accent" : "text-muted"}`} />
                        <span>{regeneratingSection === sec.id ? "Updating..." : `Regen ${sec.label}`}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Tab 1: Case Text */}
                {previewTab === "text" && (
                  <div className="space-y-4 text-xs leading-relaxed text-text">
                    <div>
                      <h4 className="font-serif font-bold text-sm text-text mb-1">Executive Abstract</h4>
                      <p className="text-muted">{generatedCase.content.summary}</p>
                    </div>

                    <div>
                      <h4 className="font-serif font-bold text-sm text-text mb-2">Enterprise Background & Context</h4>
                      <div className="p-4 rounded-xl bg-surface border border-border">
                        <CaseNarrativeView content={generatedCase.content.background} />
                      </div>
                    </div>

                    <div>
                      <h4 className="font-serif font-bold text-sm text-accent mb-2">Central Strategic Dilemma & Alternatives</h4>
                      <div className="p-4 rounded-xl bg-surface border border-border">
                        <CaseNarrativeView content={generatedCase.content.challenge} />
                      </div>
                    </div>

                    <div>
                      <h4 className="font-serif font-bold text-sm text-text mb-1">Board Decision Point</h4>
                      <p className="text-muted font-semibold">{generatedCase.content.decision_point}</p>
                    </div>
                  </div>
                )}

                {/* Tab 2: Exhibits */}
                {previewTab === "exhibits" && (
                  <div className="space-y-4">
                    {generatedCase.content.exhibits && generatedCase.content.exhibits.length > 0 ? (
                      generatedCase.content.exhibits.map((ex, i) => (
                        <div key={ex.id || i} className="p-4 rounded-xl border border-border bg-surface space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="font-serif font-bold text-xs text-text">{ex.title}</span>
                            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-primary-soft text-muted uppercase">
                              {ex.type}
                            </span>
                          </div>
                          {ex.description && <p className="text-[11px] text-muted">{ex.description}</p>}
                          {Array.isArray(ex.data) && (
                            <div className="overflow-x-auto pt-1">
                              <table className="w-full text-[11px] text-left border-collapse">
                                <thead>
                                  <tr className="border-b border-border text-muted">
                                    {Object.keys(ex.data[0] || {}).map((k) => (
                                      <th key={k} className="p-1.5 font-bold capitalize">
                                        {k.replace("_", " ")}
                                      </th>
                                    ))}
                                  </tr>
                                </thead>
                                <tbody>
                                  {ex.data.map((row: any, rIdx: number) => (
                                    <tr key={rIdx} className="border-b border-border/50 hover:bg-primary-soft/30">
                                      {Object.values(row).map((val: any, cIdx: number) => (
                                        <td key={cIdx} className="p-1.5 font-mono text-text">
                                          {String(val)}
                                        </td>
                                      ))}
                                    </tr>
                                  ))}
                                </tbody>
                              </table>
                            </div>
                          )}
                        </div>
                      ))
                    ) : (
                      <p className="text-xs text-muted">No exhibits attached to this case configuration.</p>
                    )}
                  </div>
                )}

                {/* Tab 3: Teaching Note */}
                {previewTab === "teaching_note" && generatedCase.content.teaching_note && (
                  <div className="space-y-4 text-xs">
                    <div>
                      <h4 className="font-serif font-bold text-sm text-text mb-2">Classroom Session Flow</h4>
                      <div className="space-y-2">
                        {generatedCase.content.teaching_note.class_flow.map((flow, i) => (
                          <div key={i} className="p-3 rounded-xl bg-primary-soft/40 border border-border flex items-start gap-3">
                            <span className="px-2 py-1 rounded bg-accent text-accent-text font-mono font-bold text-[10px] shrink-0">
                              {flow.duration_minutes}m
                            </span>
                            <div>
                              <p className="font-bold text-text">{flow.phase}</p>
                              <p className="text-muted text-[11px] mt-0.5">{flow.activity}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div>
                      <h4 className="font-serif font-bold text-sm text-text mb-2">Theoretical Frameworks</h4>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                        {generatedCase.content.teaching_note.frameworks.map((fw, i) => (
                          <div key={i} className="p-3 rounded-xl border border-border bg-surface">
                            <span className="font-bold text-text block">{fw.name}</span>
                            <span className="text-[11px] text-muted block mt-1">Application: {fw.application}</span>
                            <span className="text-[10px] font-semibold text-accent block mt-1.5">
                              Key Insight: {fw.key_takeaway}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {/* Tab 4: Discussion Questions */}
                {previewTab === "questions" && (
                  <div className="space-y-2.5">
                    {generatedCase.content.discussion_questions.map((q, idx) => (
                      <div key={idx} className="p-3 rounded-xl bg-primary-soft/50 border border-border flex items-start gap-3 text-xs">
                        <span className="w-5 h-5 rounded-full bg-accent text-accent-text font-bold text-[11px] flex items-center justify-center shrink-0 mt-0.5">
                          {idx + 1}
                        </span>
                        <p className="text-text leading-relaxed font-medium">{q}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* RIGHT COLUMN: STICKY STRATEGIC PROFILE (4 Cols) */}
          <div className="lg:col-span-4 space-y-6">
            <StrategicProfile
              type={type}
              format={format}
              industry={activeIndustry}
              functionalFocus={functionalFocus}
              domain={domain}
              difficulty={difficulty}
              targetAudience={targetAudience}
              primaryCompany={primaryCompany}
              centralDilemma={centralDilemma}
              learningObjectivesCount={learningObjectives.length}
              includeExhibitsCount={includeExhibits.length}
              tone={tone}
              bloomsLevel={bloomsLevel}
              courseName={selectedCourseName}
              semester={semester}
              level={level}
              contextRegion={locationMarket}
              complexity={complexity}
              targetLength={targetLength}
              sourceNotes={sourceNotes}
              configuredStepsCount={configuredStepsCount}
            />
          </div>
        </div>

        {/* MODAL 1: OTP EMAIL VERIFICATION MODAL */}
        {otpModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fadeIn">
            <div className="w-full max-w-md p-6 rounded-3xl bg-surface border border-border shadow-2xl space-y-5 animate-scaleUp">
              <div className="flex items-center justify-between border-b border-border/60 pb-3">
                <div className="flex items-center gap-2">
                  <div className="p-2 rounded-xl bg-accent/15 text-accent">
                    <KeyRound className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-serif font-bold text-base text-text">Verify Your Email</h3>
                    <p className="text-[11px] text-muted">Required before generating cases</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setOtpModalOpen(false);
                    setOtpError(null);
                    setOtpMessage(null);
                  }}
                  className="p-1.5 rounded-lg text-muted hover:text-text hover:bg-muted/10 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <p className="text-xs text-muted leading-relaxed">
                Enter the 6-digit verification code sent to{" "}
                <strong className="font-mono text-text">{currentUser?.email}</strong>.
              </p>

              {otpError && (
                <div className="p-3 rounded-xl border border-danger/30 bg-danger/15 text-danger text-xs flex items-center gap-2">
                  <ShieldAlert className="w-4 h-4 shrink-0" />
                  <span>{otpError}</span>
                </div>
              )}

              {otpMessage && (
                <div className="p-3 rounded-xl border border-success/30 bg-success/15 text-success text-xs flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 shrink-0" />
                  <span>{otpMessage}</span>
                </div>
              )}

              <form onSubmit={handleVerifyOtp} className="space-y-4">
                <div>
                  <input
                    type="text"
                    required
                    maxLength={6}
                    placeholder="123456"
                    value={otpInput}
                    onChange={(e) => setOtpInput(e.target.value.replace(/\D/g, ""))}
                    className="w-full py-2.5 px-3 rounded-xl border border-border bg-surface-raised text-text font-mono font-bold text-center text-xl tracking-widest focus:outline-hidden focus:ring-2 focus:ring-accent"
                  />
                </div>

                <div className="flex items-center gap-2 pt-1">
                  <button
                    type="submit"
                    disabled={otpVerifying || otpInput.length !== 6}
                    className="flex-1 py-2.5 rounded-xl bg-accent hover:bg-accent-hover text-accent-text font-serif font-bold text-xs shadow-sm transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    <span>{otpVerifying ? "Verifying..." : "Verify & Unlock"}</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    disabled={otpResending}
                    onClick={handleResendOtp}
                    className="px-3 py-2.5 rounded-xl border border-border hover:bg-muted/10 text-text text-xs font-semibold flex items-center gap-1.5 transition-colors disabled:opacity-50"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${otpResending ? "animate-spin" : ""}`} />
                    <span>{otpResending ? "Sending..." : "Resend"}</span>
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* MODAL 2: FRIENDLY FREE LIMIT REACHED MODAL */}
        {freeLimitModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fadeIn">
            <div className="w-full max-w-lg p-6 sm:p-7 rounded-3xl bg-surface border border-border shadow-2xl space-y-5 animate-scaleUp">
              <div className="flex items-start justify-between border-b border-border/60 pb-4">
                <div className="flex items-center gap-3">
                  <div className="p-3 rounded-2xl bg-accent/15 text-accent shadow-xs">
                    <Sparkles className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="font-serif font-bold text-lg text-text">
                      Free Limit Reached
                    </h3>
                    <p className="text-xs text-muted">
                      Paid plans and quota expansion coming soon
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setFreeLimitModalOpen(false)}
                  className="p-1.5 rounded-lg text-muted hover:text-text hover:bg-muted/10 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="space-y-3 text-xs leading-relaxed text-muted">
                <p>
                  You have utilized your <strong className="text-text font-semibold">3 free case study generations</strong> for this calendar month.
                </p>
                <div className="p-3.5 rounded-2xl bg-surface-raised border border-border/70 space-y-1.5">
                  <div className="flex items-center justify-between text-text text-xs font-semibold">
                    <span>Monthly Quota:</span>
                    <span className="font-mono text-accent">3 / 3 Used</span>
                  </div>
                  <div className="flex items-center justify-between text-[11px] text-muted">
                    <span>Next Reset:</span>
                    <span className="font-medium text-text">1st of next month (00:00 Asia/Kolkata)</span>
                  </div>
                </div>
                <p>
                  We are finalizing custom enterprise and academic membership tiers. In the meantime, you can export your current case brief so you never lose your configuration or ideas.
                </p>
              </div>

              {exportedSuccess && (
                <div className="p-3 rounded-xl border border-success/30 bg-success/15 text-success text-xs flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 shrink-0" />
                  <span>Brief exported! Downloaded JSON & copied to clipboard.</span>
                </div>
              )}

              <div className="flex flex-col sm:flex-row items-center justify-end gap-2.5 pt-2 border-t border-border/60">
                <button
                  type="button"
                  onClick={() => setFreeLimitModalOpen(false)}
                  className="w-full sm:w-auto px-4 py-2.5 rounded-xl border border-border hover:bg-muted/10 text-text text-xs font-semibold transition-colors"
                >
                  Close & Keep Editing
                </button>
                <button
                  type="button"
                  onClick={handleExportWork}
                  className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-accent hover:bg-accent-hover text-accent-text font-serif font-bold text-xs shadow-sm transition-all flex items-center justify-center gap-2"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Save & Export My Work</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* MODAL 3: SBS FAIR-USE CAP REACHED MODAL */}
        {fairUseModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fadeIn">
            <div className="w-full max-w-lg p-6 sm:p-7 rounded-3xl bg-surface border border-border shadow-2xl space-y-5 animate-scaleUp">
              <div className="flex items-start justify-between border-b border-border/60 pb-4">
                <div className="flex items-center gap-3">
                  <div className="p-3 rounded-2xl bg-primary/10 text-primary shadow-xs">
                    <ShieldAlert className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="font-serif font-bold text-lg text-text">
                      SBS Fair-Use Cap Reached
                    </h3>
                    <p className="text-xs text-muted">
                      30 cases / calendar month
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setFairUseModalOpen(false)}
                  className="p-1.5 rounded-lg text-muted hover:text-text hover:bg-muted/10 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="space-y-3 text-xs leading-relaxed text-muted">
                <p>
                  You have reached the <strong className="text-text font-semibold">30 case monthly fair-use cap</strong> allocated to verified Shanti Business School members.
                </p>
                <div className="p-3.5 rounded-2xl bg-surface-raised border border-border/70 space-y-1.5">
                  <div className="flex items-center justify-between text-text text-xs font-semibold">
                    <span>Allocated Quota:</span>
                    <span className="font-mono text-primary font-bold">30 / 30 Cases</span>
                  </div>
                  <div className="flex items-center justify-between text-[11px] text-muted">
                    <span>Monthly Reset:</span>
                    <span className="font-medium text-text">1st of next month (00:00 Asia/Kolkata)</span>
                  </div>
                </div>
                <p>
                  If you need additional capacity for ongoing curriculum development, please contact Dean Sharma or your institutional administrator.
                </p>
              </div>

              {exportedSuccess && (
                <div className="p-3 rounded-xl border border-success/30 bg-success/15 text-success text-xs flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 shrink-0" />
                  <span>Brief exported! Downloaded JSON & copied to clipboard.</span>
                </div>
              )}

              <div className="flex flex-col sm:flex-row items-center justify-end gap-2.5 pt-2 border-t border-border/60">
                <button
                  type="button"
                  onClick={() => setFairUseModalOpen(false)}
                  className="w-full sm:w-auto px-4 py-2.5 rounded-xl border border-border hover:bg-muted/10 text-text text-xs font-semibold transition-colors"
                >
                  Close & Keep Editing
                </button>
                <button
                  type="button"
                  onClick={handleExportWork}
                  className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-accent hover:bg-accent-hover text-accent-text font-serif font-bold text-xs shadow-sm transition-all flex items-center justify-center gap-2"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Save & Export My Work</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </AppShell>
  );
}

export default function CreateCasePage() {
  return (
    <Suspense
      fallback={
        <AppShell>
          <div className="max-w-6xl mx-auto py-12">
            <StateLoading
              title="Loading Generate Case Studio..."
              subtitle="Initializing pedagogical configuration."
            />
          </div>
        </AppShell>
      }
    >
      <CreateCaseContent />
    </Suspense>
  );
}
