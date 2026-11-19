"use client";

import { useState, useEffect, useMemo, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { ThemeToggle } from "@/components/ThemeToggle";
import { validateEmailDomain } from "@/lib/auth";
import {
  ALLOWED_EMAIL_DOMAIN,
  COLLEGE_NAME_WITH_SHORT,
  COLLEGE_SHORT,
  APP_NAME,
  isSbsDomain,
} from "@/config/college";
import {
  ShieldAlert,
  CheckCircle2,
  Lock,
  Mail,
  User,
  ArrowRight,
  Sparkles,
  Building2,
  GraduationCap,
  Phone,
  BadgeAlert,
  Clock,
  Check,
  Eye,
  EyeOff,
  AlertCircle,
} from "lucide-react";
import { Department, Course, AcademicBatch, FacultyType } from "@/lib/types";

function SignUpForm() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const initialEmail = searchParams.get("email") || "";
  const initialName = searchParams.get("name") || "";
  const errorParam = searchParams.get("error");
  const initialError = errorParam || null;

  const [step, setStep] = useState<"form" | "pending_approval">("form");
  const [userType, setUserType] = useState<"student" | "faculty">("student");

  // Common fields
  const [name, setName] = useState(initialName);
  const [email, setEmail] = useState(initialEmail);
  const [personalEmail, setPersonalEmail] = useState("");
  const [mobile, setMobile] = useState("");
  const [enrollmentNo, setEnrollmentNo] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Student specific fields
  const [courseId, setCourseId] = useState("");
  const [batchId, setBatchId] = useState("");
  const [rollNo, setRollNo] = useState("");

  // Faculty specific fields
  const [departmentId, setDepartmentId] = useState("");
  const [facultyTypeId, setFacultyTypeId] = useState("");

  // DPDP Consent (Mandatory unchecked by default)
  const [dpdpConsent, setDpdpConsent] = useState(false);

  // Lookup data from API
  const [departments, setDepartments] = useState<Department[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [batches, setBatches] = useState<AcademicBatch[]>([]);
  const [facultyTypes, setFacultyTypes] = useState<FacultyType[]>([]);

  const [error, setError] = useState<string | null>(initialError);
  const [loading, setLoading] = useState(false);

  // Filter student courses strictly to PGDM, BBA, BCA (fallback to all courses if none match)
  const studentCourses = useMemo(() => {
    const targetCodes = ["PGDM", "BBA", "BCA"];
    const filtered = courses.filter((c) =>
      targetCodes.includes(c.code?.toUpperCase()) || targetCodes.includes(c.name?.toUpperCase())
    );
    return filtered.length > 0 ? filtered : courses;
  }, [courses]);

  // Determine current selected course code
  const selectedCourseCode = useMemo(() => {
    const found = studentCourses.find((c) => c.id === courseId) || courses.find((c) => c.id === courseId);
    return (found?.code || found?.name || "").toUpperCase();
  }, [studentCourses, courses, courseId]);

  // Dynamically filter batches based on chosen course:
  // PGDM -> 25-26, 26-27 (2025-26, 2026-27)
  // BBA  -> 24-27, 25-28, 26-29 (2024-27, 2025-28, 2026-29)
  // BCA  -> 24-27, 25-28, 26-29 (2024-27, 2025-28, 2026-29)
  const availableBatches = useMemo(() => {
    if (selectedCourseCode.includes("PGDM")) {
      return batches.filter(
        (b) =>
          b.label === "2025-26" ||
          b.label === "2026-27" ||
          b.label === "25-26" ||
          b.label === "26-27"
      );
    }
    if (selectedCourseCode.includes("BBA") || selectedCourseCode.includes("BCA")) {
      return batches.filter(
        (b) =>
          b.label === "2024-27" ||
          b.label === "2025-28" ||
          b.label === "2026-29" ||
          b.label === "24-27" ||
          b.label === "25-28" ||
          b.label === "26-29"
      );
    }
    return batches;
  }, [selectedCourseCode, batches]);

  // Ensure batchId is kept valid when availableBatches changes
  useEffect(() => {
    if (availableBatches.length > 0) {
      if (!availableBatches.some((b) => b.id === batchId)) {
        setBatchId(availableBatches[0].id);
      }
    }
  }, [availableBatches, batchId]);

  useEffect(() => {
    async function loadLookupData() {
      try {
        const res = await fetch("/api/lookup");
        if (res.ok) {
          const json = await res.json();
          if (json.data) {
            setDepartments(json.data.departments || []);
            setCourses(json.data.courses || []);
            setBatches(json.data.batches || []);
            setFacultyTypes(json.data.facultyTypes || []);
            
            // Default course to PGDM (or first course)
            const targetCourse = (json.data.courses || []).find((c: any) =>
              ["PGDM", "BBA", "BCA"].includes((c.code || c.name || "").toUpperCase())
            ) || json.data.courses?.[0];
            if (targetCourse) setCourseId(targetCourse.id);

            if (json.data.departments?.length > 0) setDepartmentId(json.data.departments[0].id);
            if (json.data.facultyTypes?.length > 0) setFacultyTypeId(json.data.facultyTypes[0].id);
          }
        }
      } catch (err) {
        console.error("Failed to fetch academic lookups:", err);
      }
    }
    loadLookupData();
  }, []);

  const trimmedEmail = email.trim().toLowerCase();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // 1. Consent Validation
    if (!dpdpConsent) {
      setError("Statutory consent under DPDP Act 2023 is mandatory to register an academic repository account.");
      return;
    }

    // 2. Passwords Match
    if (password !== confirmPassword) {
      setError("Passwords do not match. Please re-enter your password.");
      return;
    }

    // 3. Email Check
    const check = validateEmailDomain(email);
    if (!check.isValid) {
      setError(check.errorMessage || "Please provide a valid official SBS email address.");
      return;
    }

    // 4. Personal Email Check
    if (!personalEmail || !personalEmail.includes("@")) {
      setError("A valid personal email address (e.g. Gmail/Outlook) is required for alumni access.");
      return;
    }

    if (isSbsDomain(personalEmail)) {
      setError("Personal email must be an external address, not an official @shantibschool.edu.in address.");
      return;
    }

    // 5. Mobile Check (Strictly 10 digits starting with 6-9)
    const cleanMobile = mobile.replace(/\D/g, "");
    if (!cleanMobile || cleanMobile.length !== 10) {
      setError("Please provide a valid 10-digit Indian mobile number.");
      return;
    }
    if (!/^[6-9]\d{9}$/.test(cleanMobile)) {
      setError("Indian mobile number must start with 6, 7, 8, or 9 and contain exactly 10 digits.");
      return;
    }

    setLoading(true);

    try {
      const payload: any = {
        action: "signup",
        user_type: userType,
        role: userType,
        name: name.trim(),
        email: trimmedEmail,
        personal_email: personalEmail.trim().toLowerCase(),
        mobile: cleanMobile,
        enrollment_no: enrollmentNo.trim() || null,
        password,
        confirm_password: confirmPassword,
        dpdp_consent: true,
        course_id: courseId,
      };

      if (userType === "student") {
        payload.batch_id = batchId;
        payload.roll_no = rollNo.trim() || null;
      } else {
        payload.department_id = departmentId;
        payload.faculty_type_id = facultyTypeId;
      }

      const res = await fetch("/api/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to submit registration.");
      }

      setStep("pending_approval");
    } catch (err: unknown) {
      console.error("Signup error:", err);
      const msg = err instanceof Error ? err.message : "Registration failed.";
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background text-text flex flex-col justify-between p-4 sm:p-8">
      {/* Top Brand Nav */}
      <div className="flex items-center justify-between max-w-4xl mx-auto w-full">
        <Link href="/" className="flex items-center gap-3">
          <div className="h-10 px-2.5 py-1 rounded-xl bg-white border border-border shadow-xs flex items-center justify-center shrink-0">
            <img
              src="/sbs-logo.png"
              alt="Shanti Business School Logo"
              className="h-8 w-auto object-contain"
            />
          </div>
          <div>
            <span className="font-bold text-sm tracking-tight text-text block leading-tight">
              {COLLEGE_NAME_WITH_SHORT}
            </span>
            <span className="text-xs text-text-muted">Academic Case Study Repository</span>
          </div>
        </Link>
        <div className="flex items-center gap-3">
          <ThemeToggle />
          <Link
            href="/login"
            className="px-4 py-2 rounded-xl text-xs font-semibold text-text-muted hover:text-text transition-colors"
          >
            Sign In
          </Link>
        </div>
      </div>

      {/* Main Container */}
      <div className="max-w-2xl w-full mx-auto my-8">
        {step === "pending_approval" ? (
          <div className="bg-surface rounded-3xl border border-border p-8 sm:p-10 shadow-lg text-center">
            <div className="w-16 h-16 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-600 dark:text-amber-400 flex items-center justify-center mx-auto mb-6">
              <Clock className="w-8 h-8" />
            </div>

            <h2 className="text-2xl font-bold text-text mb-3">
              Registration Submitted for Institutional Approval
            </h2>
            <p className="text-sm text-text-muted max-w-md mx-auto mb-6 leading-relaxed">
              Your account has been created in <span className="font-semibold text-text">Pending</span> status. Dean Academics / Case Centre Administrator reviews each registration to maintain repository integrity.
            </p>

            <div className="bg-surface-hover/50 rounded-2xl p-5 border border-border text-left text-xs space-y-2 mb-8 max-w-md mx-auto">
              <div className="flex justify-between py-1 border-b border-border">
                <span className="text-text-muted">Full Name</span>
                <span className="font-semibold text-text">{name}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-border">
                <span className="text-text-muted">Role</span>
                <span className="font-semibold text-text capitalize">{userType}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-border">
                <span className="text-text-muted">Official SBS Email</span>
                <span className="font-semibold text-text">{trimmedEmail}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-border">
                <span className="text-text-muted">Personal Email</span>
                <span className="font-semibold text-text">{personalEmail}</span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-text-muted">{userType === "student" ? "Batch & Program" : "Department"}</span>
                <span className="font-semibold text-text">
                  {userType === "student"
                    ? `${batches.find((b) => b.id === batchId)?.label || "2024-27"}`
                    : `${departments.find((d) => d.id === departmentId)?.name || "Faculty"}`}
                </span>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link
                href="/login"
                className="px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-medium text-sm transition-colors shadow-xs"
              >
                Go to Sign In
              </Link>
              <a
                href="mailto:admin@shantibschool.edu.in?subject=CaseLab%20Registration%20Verification"
                className="px-6 py-2.5 rounded-xl bg-surface border border-border hover:bg-surface-hover text-text text-sm transition-colors"
              >
                Contact Case Centre
              </a>
            </div>
          </div>
        ) : (
          <div className="bg-surface rounded-3xl border border-border p-6 sm:p-10 shadow-lg">
            <div className="text-center mb-8">
              <span className="text-xs font-semibold uppercase tracking-wider text-blue-600 dark:text-blue-400 bg-blue-500/10 px-3 py-1 rounded-full">
                Institutional Access
              </span>
              <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-text mt-3">
                Register for SBS CaseLab
              </h2>
              <p className="text-xs sm:text-sm text-text-muted mt-1.5">
                Create teaching cases, participate in blind peer reviews, and publish to the repository.
              </p>
            </div>

            {error && (
              <div className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/30 text-red-600 dark:text-red-400 text-xs sm:text-sm flex items-start gap-3">
                <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Step 1: Role Selector - First Field */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-text mb-2">
                  I am a: <span className="text-red-500">*</span>
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setUserType("student")}
                    className={`flex items-center justify-center gap-2.5 py-3 px-4 rounded-xl border text-sm font-semibold transition-all ${
                      userType === "student"
                        ? "bg-blue-600 text-white border-blue-600 shadow-sm"
                        : "bg-surface border-border text-text-muted hover:border-text-muted"
                    }`}
                  >
                    <GraduationCap className="w-4 h-4" />
                    <span>Student</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setUserType("faculty")}
                    className={`flex items-center justify-center gap-2.5 py-3 px-4 rounded-xl border text-sm font-semibold transition-all ${
                      userType === "faculty"
                        ? "bg-blue-600 text-white border-blue-600 shadow-sm"
                        : "bg-surface border-border text-text-muted hover:border-text-muted"
                    }`}
                  >
                    <Building2 className="w-4 h-4" />
                    <span>Faculty Member</span>
                  </button>
                </div>
              </div>

              {/* Common Fields */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-text mb-1">
                    Full Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Zala Prachi / Ms. Reena Paswan"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-surface border border-border text-sm text-text focus:outline-none focus:ring-2 focus:ring-blue-600"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-text mb-1">
                    Official SBS Email <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder={`name@${ALLOWED_EMAIL_DOMAIN}`}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-surface border border-border text-sm text-text focus:outline-none focus:ring-2 focus:ring-blue-600"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-text mb-1">
                    Personal Email (Gmail / Yahoo / Outlook) <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="email"
                    required
                    value={personalEmail}
                    onChange={(e) => setPersonalEmail(e.target.value)}
                    placeholder="personal.email@gmail.com"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-surface border border-border text-sm text-text focus:outline-none focus:ring-2 focus:ring-blue-600"
                  />
                  <span className="text-[11px] text-text-muted mt-0.5 block">
                    Used for password recovery and alumni communications.
                  </span>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-text mb-1">
                    Indian Mobile Number <span className="text-red-500">*</span>
                  </label>
                  <div className="flex rounded-xl bg-surface border border-border focus-within:ring-2 focus-within:ring-blue-600 focus-within:border-transparent overflow-hidden">
                    <span className="inline-flex items-center px-3.5 bg-surface-hover/50 border-r border-border text-xs font-semibold text-text-muted select-none">
                      +91
                    </span>
                    <input
                      type="tel"
                      inputMode="numeric"
                      pattern="[0-9]{10}"
                      maxLength={10}
                      required
                      value={mobile}
                      onChange={(e) => {
                        const clean = e.target.value.replace(/\D/g, "");
                        const digits = (clean.length === 12 && clean.startsWith("91"))
                          ? clean.slice(2, 12)
                          : (clean.length === 11 && clean.startsWith("0"))
                            ? clean.slice(1, 11)
                            : clean.slice(0, 10);
                        setMobile(digits);
                      }}
                      onKeyDown={(e) => {
                        if (
                          !/^\d$/.test(e.key) &&
                          !["Backspace", "Delete", "Tab", "ArrowLeft", "ArrowRight", "ArrowUp", "ArrowDown", "Enter"].includes(e.key) &&
                          !e.ctrlKey &&
                          !e.metaKey
                        ) {
                          e.preventDefault();
                        }
                      }}
                      placeholder="9876543210"
                      className="w-full px-3.5 py-2.5 bg-transparent text-sm text-text focus:outline-none font-mono"
                    />
                  </div>
                </div>
              </div>

              {/* Student-Only Fields */}
              {userType === "student" && (
                <div className="p-4 rounded-2xl bg-surface-hover/40 border border-border space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-text mb-1">
                        Academic Course / Program <span className="text-red-500">*</span>
                      </label>
                      <select
                        value={courseId}
                        onChange={(e) => setCourseId(e.target.value)}
                        className="w-full px-3.5 py-2.5 rounded-xl bg-surface border border-border text-sm text-text focus:outline-none focus:ring-2 focus:ring-blue-600"
                      >
                        {studentCourses.map((c) => (
                          <option key={c.id} value={c.id}>
                            {c.name}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-text mb-1">
                        Academic Batch <span className="text-red-500">*</span>
                      </label>
                      <select
                        value={batchId}
                        onChange={(e) => setBatchId(e.target.value)}
                        className="w-full px-3.5 py-2.5 rounded-xl bg-surface border border-border text-sm text-text focus:outline-none focus:ring-2 focus:ring-blue-600"
                      >
                        {availableBatches.map((b) => (
                          <option key={b.id} value={b.id}>
                            {b.label.startsWith("Batch") ? b.label : `Batch ${b.label}`}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>
              )}

              {/* Faculty-Only Fields */}
              {userType === "faculty" && (
                <div className="p-4 rounded-2xl bg-surface-hover/40 border border-border space-y-4">
                  <div>
                    <label className="block text-xs font-semibold text-text mb-1">
                      Academic Department ("What do you teach?") <span className="text-red-500">*</span>
                    </label>
                    <select
                      value={departmentId}
                      onChange={(e) => setDepartmentId(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-surface border border-border text-sm text-text focus:outline-none focus:ring-2 focus:ring-blue-600"
                    >
                      {departments.map((d) => (
                        <option key={d.id} value={d.id}>
                          {d.name} ({d.code})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-text mb-1">
                        Primary Course <span className="text-red-500">*</span>
                      </label>
                      <select
                        value={courseId}
                        onChange={(e) => setCourseId(e.target.value)}
                        className="w-full px-3.5 py-2.5 rounded-xl bg-surface border border-border text-sm text-text focus:outline-none focus:ring-2 focus:ring-blue-600"
                      >
                        {courses.map((c) => (
                          <option key={c.id} value={c.id}>
                            {c.name}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-text mb-1">
                        Faculty Appointment Type <span className="text-red-500">*</span>
                      </label>
                      <select
                        value={facultyTypeId}
                        onChange={(e) => setFacultyTypeId(e.target.value)}
                        className="w-full px-3.5 py-2.5 rounded-xl bg-surface border border-border text-sm text-text focus:outline-none focus:ring-2 focus:ring-blue-600"
                      >
                        {facultyTypes.map((ft) => (
                          <option key={ft.id} value={ft.id}>
                            {ft.name}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>
              )}

              {/* Password Fields */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-text mb-1">
                    Password (8+ characters) <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? "text" : "password"}
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full px-3.5 py-2.5 rounded-xl bg-surface border border-border text-sm text-text focus:outline-none focus:ring-2 focus:ring-blue-600 pr-10"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-3 text-text-muted hover:text-text"
                      aria-label={showPassword ? "Hide password" : "Show password"}
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-text mb-1">
                    Confirm Password <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <input
                      type={showConfirmPassword ? "text" : "password"}
                      required
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full px-3.5 py-2.5 rounded-xl bg-surface border border-border text-sm text-text focus:outline-none focus:ring-2 focus:ring-blue-600 pr-10"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3 top-3 text-text-muted hover:text-text"
                      aria-label={showConfirmPassword ? "Hide confirm password" : "Show confirm password"}
                    >
                      {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
              </div>

              {/* DPDP Consent Checkbox - Default Unchecked */}
              <div className="p-4 rounded-2xl bg-surface-hover/30 border border-border">
                <label className="flex items-start gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={dpdpConsent}
                    onChange={(e) => setDpdpConsent(e.target.checked)}
                    className="mt-1 h-4 w-4 rounded border-border text-blue-600 focus:ring-blue-600 shrink-0"
                  />
                  <div className="text-xs text-text-muted leading-relaxed">
                    <span className="font-semibold text-text">
                      Statutory Consent under Digital Personal Data Protection (DPDP) Act 2023:
                    </span>{" "}
                    I consent to Shanti Business School collecting my institutional email, personal email, and Indian mobile number. This data is processed strictly for case study authoring, blind peer reviews, academic accreditation, and alumni access. Information is accessible solely to me and the institutional administrator, and consent may be withdrawn at any time in accordance with Section 11 of the DPDP Act.
                  </div>
                </label>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading || !dpdpConsent}
                className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-medium text-sm transition-all shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <span>{loading ? "Submitting Registration..." : "Complete Registration"}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>

            <div className="mt-6 text-center text-xs text-text-muted">
              Already have an institutional account?{" "}
              <Link href="/login" className="text-blue-600 dark:text-blue-400 font-semibold hover:underline">
                Sign In
              </Link>
            </div>
          </div>
        )}
      </div>

      {/* Footer */}
      <footer className="text-center py-4 text-xs text-text-muted border-t border-border">
        {COLLEGE_NAME_WITH_SHORT} • Institutional Case Repository Portal
      </footer>
    </div>
  );
}

export default function SignUpPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-background" />}>
      <SignUpForm />
    </Suspense>
  );
}
