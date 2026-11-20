"use client";

import React, { useState } from "react";
import { CECasePack } from "@/lib/casepack/schema";
import { CasePackValidationReport, validateCasePackComplete } from "@/lib/casepack/validate";
import {
  BookOpen,
  HelpCircle,
  KeyRound,
  GraduationCap,
  ShieldCheck,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  RefreshCw,
  Sparkles,
  Download,
  Save,
  Check,
  Copy,
  ChevronDown,
  FileDown,
  Layers,
  Award,
  Star,
  Send,
  ThumbsUp,
} from "lucide-react";

export interface CECasePackViewProps {
  casePack: CECasePack;
  isStudent?: boolean;
  validationReport?: CasePackValidationReport | null;
  onRerunChecks?: () => void;
  onAutoFix?: () => void;
  isAutoFixing?: boolean;
  onSave?: () => void;
  isSaving?: boolean;
  saveSuccess?: boolean;
  caseId?: string;
  showExportControls?: boolean;
}

export function CECasePackView({
  casePack,
  isStudent = false,
  validationReport: initialReport,
  onRerunChecks,
  onAutoFix,
  isAutoFixing = false,
  onSave,
  isSaving = false,
  saveSuccess = false,
  caseId,
  showExportControls = true,
}: CECasePackViewProps) {
  // Tabs: Case | Questions | Model Answer Key (faculty) | Teaching Notes (faculty) | Checks (faculty)
  type TabType = "case" | "questions" | "answers" | "teaching_notes" | "checks";
  const [activeTab, setActiveTab] = useState<TabType>("case");
  const [exportDropdownOpen, setExportDropdownOpen] = useState(false);
  const [copiedText, setCopiedText] = useState(false);

  // Fallback to client-side complete validation if report not provided
  const report = initialReport ?? (isStudent ? null : validateCasePackComplete(casePack));

  const handleCopyQuestions = () => {
    const text = casePack.questions
      .map((q, idx) => `Q${idx + 1} (${q.marks || 20} Marks - ${q.bloom_verb}):\n${q.text}\n`)
      .join("\n");
    navigator.clipboard?.writeText(text);
    setCopiedText(true);
    setTimeout(() => setCopiedText(false), 2500);
  };

  // Faculty Review & Quality Feedback state
  const [rating, setRating] = useState<number>(5);
  const [hoverRating, setHoverRating] = useState<number>(0);
  const [flaggedIssues, setFlaggedIssues] = useState<string[]>([]);
  const [feedbackComment, setFeedbackComment] = useState<string>("");
  const [promoteToGold, setPromoteToGold] = useState<boolean>(false);
  const [feedbackSubmitted, setFeedbackSubmitted] = useState<boolean>(false);
  const [submittingFeedback, setSubmittingFeedback] = useState<boolean>(false);

  const toggleIssue = (issue: string) => {
    setFlaggedIssues((prev) =>
      prev.includes(issue) ? prev.filter((i) => i !== issue) : [...prev, issue]
    );
  };

  const handleFeedbackSubmit = async () => {
    setSubmittingFeedback(true);
    try {
      const res = await fetch("/api/casepack/feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          case_id: caseId || casePack.case.title.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
          case_title: casePack.case.title,
          department: casePack.meta.department,
          rating,
          flagged_issues: flaggedIssues,
          comments: feedbackComment,
          promote_to_gold: promoteToGold,
        }),
      });
      if (res.ok) {
        setFeedbackSubmitted(true);
      }
    } catch (e) {
      console.error("Failed to submit feedback:", e);
    } finally {
      setSubmittingFeedback(false);
    }
  };

  return (
    <div className="w-full space-y-6">
      {/* EXAM / CASE PACK HEADER BANNER */}
      <div className="p-6 rounded-2xl border border-border bg-surface shadow-sm space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-border">
          <div>
            <div className="flex flex-wrap items-center gap-2 mb-2">
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider bg-accent/15 text-accent border border-accent/20">
                {casePack.meta.department.toUpperCase()} CASE PACK
              </span>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-primary-soft text-text">
                {casePack.meta.course_code || "CE-3"}
              </span>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-primary-soft text-text">
                Set {casePack.meta.set || "A"}
              </span>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-primary-soft text-text">
                Max Marks: {casePack.meta.max_marks || 40}
              </span>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-primary-soft text-text">
                {casePack.meta.level || "MBA / PGDM"}
              </span>
            </div>
            <h1 className="font-serif text-2xl md:text-3xl font-bold text-text leading-tight">
              {casePack.case.title}
            </h1>
            <p className="text-xs text-muted mt-1">
              Curricular Concepts: {casePack.meta.concepts.join(" • ")}
            </p>
          </div>

          {/* ACTIONS: SAVE & EXPORT */}
          <div className="flex items-center gap-2 shrink-0">
            {onSave && (
              <button
                type="button"
                onClick={onSave}
                disabled={isSaving}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-accent hover:bg-accent-hover text-accent-text text-xs font-bold shadow-sm transition-all disabled:opacity-50"
              >
                {saveSuccess ? (
                  <>
                    <Check className="w-4 h-4 text-success" />
                    <span>Saved!</span>
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4" />
                    <span>{isSaving ? "Saving..." : "Save Case Pack"}</span>
                  </>
                )}
              </button>
            )}

            {showExportControls && (
              isStudent ? (
                <div
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-border bg-surface/50 text-muted text-xs font-medium cursor-not-allowed"
                  title="Download will be available after purchase (coming soon)"
                >
                  <Download className="w-3.5 h-3.5 opacity-40" />
                  <span>Download will be available after purchase (coming soon)</span>
                </div>
              ) : (
                <div className="relative">
                  <button
                    type="button"
                    onClick={() => setExportDropdownOpen(!exportDropdownOpen)}
                    className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-border bg-surface text-text hover:border-accent text-xs font-semibold transition-all shadow-sm"
                  >
                    <Download className="w-3.5 h-3.5 text-accent" />
                    <span>Export Case Pack</span>
                    <ChevronDown className="w-3 h-3 text-muted" />
                  </button>

                  {exportDropdownOpen && (
                    <div className="absolute right-0 mt-2 w-64 rounded-xl border border-border bg-surface p-1 shadow-xl z-50 text-xs">
                      <div className="px-3 py-1.5 font-bold text-[10px] uppercase text-muted tracking-wider">
                        Complete Case Pack (With Solutions)
                      </div>
                      <a
                        href={caseId ? `/api/cases/${caseId}/export/docx?mode=full` : "#"}
                        onClick={() => setExportDropdownOpen(false)}
                        className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-primary-soft text-text"
                      >
                        <FileDown className="w-3.5 h-3.5 text-accent" />
                        <span>Full Case Pack (DOCX)</span>
                      </a>
                      <a
                        href={caseId ? `/api/cases/${caseId}/export/pdf?mode=full` : "#"}
                        onClick={() => setExportDropdownOpen(false)}
                        className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-primary-soft text-text"
                      >
                        <FileDown className="w-3.5 h-3.5 text-accent" />
                        <span>Full Case Pack (PDF)</span>
                      </a>
                      <div className="my-1 border-t border-border" />

                      <div className="px-3 py-1.5 font-bold text-[10px] uppercase text-muted tracking-wider">
                        Student Case Handout
                      </div>
                      <a
                        href={caseId ? `/api/cases/${caseId}/export/docx?mode=student` : "#"}
                        onClick={() => setExportDropdownOpen(false)}
                        className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-primary-soft text-text"
                      >
                        <FileDown className="w-3.5 h-3.5 text-muted" />
                        <span>Student Handout (DOCX)</span>
                      </a>
                      <a
                        href={caseId ? `/api/cases/${caseId}/export/pdf?mode=student` : "#"}
                        onClick={() => setExportDropdownOpen(false)}
                        className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-primary-soft text-text"
                      >
                        <FileDown className="w-3.5 h-3.5 text-muted" />
                        <span>Student Handout (PDF)</span>
                      </a>
                    </div>
                  )}
                </div>
              )
            )}
          </div>
        </div>

        {/* TAB NAVIGATION STRIP */}
        <div className="flex items-center gap-1 border-b border-border overflow-x-auto pb-1">
          <button
            type="button"
            onClick={() => setActiveTab("case")}
            className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-lg text-xs font-bold transition-all border-b-2 ${
              activeTab === "case"
                ? "border-accent text-accent bg-accent/5"
                : "border-transparent text-muted hover:text-text hover:bg-primary-soft"
            }`}
          >
            <BookOpen className="w-4 h-4" />
            <span>Case Narrative</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("questions")}
            className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-lg text-xs font-bold transition-all border-b-2 ${
              activeTab === "questions"
                ? "border-accent text-accent bg-accent/5"
                : "border-transparent text-muted hover:text-text hover:bg-primary-soft"
            }`}
          >
            <HelpCircle className="w-4 h-4" />
            <span>Analysis Questions ({casePack.questions.length})</span>
          </button>

          {/* FACULTY / ADMIN TABS (STRICTLY EXCLUDED FOR STUDENTS) */}
          {!isStudent && casePack.answers && casePack.answers.length > 0 && (
            <button
              type="button"
              onClick={() => setActiveTab("answers")}
              className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-lg text-xs font-bold transition-all border-b-2 ${
                activeTab === "answers"
                  ? "border-accent text-accent bg-accent/5"
                  : "border-transparent text-muted hover:text-text hover:bg-primary-soft"
              }`}
            >
              <KeyRound className="w-4 h-4 text-warning" />
              <span>Model Answer Key (Faculty)</span>
            </button>
          )}

          {!isStudent && casePack.teaching_notes && (
            <button
              type="button"
              onClick={() => setActiveTab("teaching_notes")}
              className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-lg text-xs font-bold transition-all border-b-2 ${
                activeTab === "teaching_notes"
                  ? "border-accent text-accent bg-accent/5"
                  : "border-transparent text-muted hover:text-text hover:bg-primary-soft"
              }`}
            >
              <GraduationCap className="w-4 h-4" />
              <span>Teaching Notes</span>
            </button>
          )}

          {!isStudent && (
            <button
              type="button"
              onClick={() => setActiveTab("checks")}
              className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-lg text-xs font-bold transition-all border-b-2 ${
                activeTab === "checks"
                  ? "border-accent text-accent bg-accent/5"
                  : "border-transparent text-muted hover:text-text hover:bg-primary-soft"
              }`}
            >
              <ShieldCheck className="w-4 h-4" />
              <span>Pedagogical Checks</span>
              {report && (
                <span
                  className={`ml-1 px-1.5 py-0.5 rounded-full text-[10px] font-bold ${
                    report.valid ? "bg-success/20 text-success" : "bg-danger/20 text-danger"
                  }`}
                >
                  {report.score}%
                </span>
              )}
            </button>
          )}
        </div>
      </div>

      {/* ===================================================================== */}
      {/* TAB 1: CASE NARRATIVE                                                 */}
      {/* ===================================================================== */}
      {activeTab === "case" && (
        <div className="space-y-6">
          <div className="p-8 rounded-2xl border border-border bg-surface shadow-sm space-y-6 max-w-4xl mx-auto">
            <div className="border-b border-border pb-4">
              <span className="text-xs uppercase font-mono text-muted tracking-widest block mb-1">
                TEACHING CASE STUDY • {casePack.case.word_count || 1200} WORDS
              </span>
              <h2 className="font-serif text-2xl font-bold text-text">
                {casePack.case.title}
              </h2>
            </div>

            {/* SECTIONS */}
            <div className="space-y-6 text-sm leading-relaxed text-text">
              {casePack.case.sections.map((sec, sIdx) => (
                <section key={sIdx} className="space-y-3">
                  <h3 className="font-serif font-bold text-base text-accent border-b border-border/50 pb-1">
                    {sec.heading}
                  </h3>
                  {sec.paragraphs.map((p, pIdx) => (
                    <p key={pIdx} className="text-justify font-serif text-[15px] leading-relaxed">
                      {p}
                    </p>
                  ))}
                  {sec.bullets && sec.bullets.length > 0 && (
                    <ul className="list-disc pl-5 space-y-1.5 text-[14px]">
                      {sec.bullets.map((b, bIdx) => (
                        <li key={bIdx}>{b}</li>
                      ))}
                    </ul>
                  )}
                </section>
              ))}

              {/* DATA TABLES / EXHIBITS */}
              {casePack.case.data_tables && casePack.case.data_tables.length > 0 && (
                <div className="space-y-6 pt-4 border-t border-border">
                  <h3 className="font-serif font-bold text-base text-text">
                    Case Exhibits & Quantitative Data
                  </h3>
                  {casePack.case.data_tables.map((table, tIdx) => (
                    <div
                      key={tIdx}
                      className="rounded-xl border border-border bg-primary-soft/30 overflow-hidden shadow-sm"
                    >
                      <div className="p-3 bg-primary-soft border-b border-border font-serif font-bold text-xs text-text">
                        {table.title}
                      </div>
                      <div className="overflow-x-auto">
                        <table className="w-full text-left text-xs border-collapse">
                          <thead>
                            <tr className="bg-primary-soft/60 border-b border-border">
                              {table.columns.map((col, cIdx) => (
                                <th key={cIdx} className="p-3 font-bold text-text whitespace-nowrap">
                                  {col}
                                </th>
                              ))}
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-border">
                            {table.rows.map((row, rIdx) => (
                              <tr key={rIdx} className="hover:bg-primary-soft/40 transition-colors">
                                {row.map((cell, cIdx) => (
                                  <td key={cIdx} className="p-3 font-mono text-muted text-[13px]">
                                    {cell}
                                  </td>
                                ))}
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ===================================================================== */}
      {/* TAB 2: EXAM QUESTIONS                                                 */}
      {/* ===================================================================== */}
      {activeTab === "questions" && (
        <div className="p-8 rounded-2xl border border-border bg-surface shadow-sm space-y-6 max-w-4xl mx-auto">
          <div className="flex items-center justify-between border-b border-border pb-4">
            <div>
              <span className="text-xs uppercase font-mono text-muted tracking-widest block mb-1">
                PROBLEM ANALYSIS & DISCUSSION QUESTIONS
              </span>
              <h2 className="font-serif text-2xl font-bold text-text">
                Case Analysis & Critical Thinking Questions
              </h2>
            </div>
            <button
              type="button"
              onClick={handleCopyQuestions}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-border text-xs font-semibold text-text hover:border-accent hover:text-accent transition-colors"
            >
              {copiedText ? (
                <Check className="w-3.5 h-3.5 text-success" />
              ) : (
                <Copy className="w-3.5 h-3.5" />
              )}
              <span>{copiedText ? "Copied" : "Copy Questions"}</span>
            </button>
          </div>

          <div className="space-y-6">
            {casePack.questions.map((q, idx) => (
              <div
                key={q.id || idx}
                className="p-6 rounded-xl border border-border bg-primary-soft/20 space-y-3"
              >
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="w-7 h-7 rounded-lg bg-accent text-accent-text flex items-center justify-center font-bold text-xs">
                      Q{idx + 1}
                    </span>
                    <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-accent/15 text-accent border border-accent/20">
                      {q.bloom_verb}
                    </span>
                    {q.k_level && (
                      <span className="px-2 py-0.5 rounded-full text-[11px] font-mono bg-primary-soft text-muted font-bold">
                        {q.k_level}
                      </span>
                    )}
                  </div>
                  <span className="px-3 py-1 rounded-full text-xs font-bold bg-primary-soft text-text border border-border">
                    {q.marks || 20} Marks
                  </span>
                </div>

                <p className="font-serif text-base font-semibold text-text leading-relaxed pt-1">
                  {q.text}
                </p>

                {q.concepts && q.concepts.length > 0 && (
                  <div className="flex flex-wrap items-center gap-1.5 pt-2 text-xs">
                    <span className="text-muted font-mono text-[11px]">Mapped Concepts:</span>
                    {q.concepts.map((c, cIdx) => (
                      <span
                        key={cIdx}
                        className="px-2 py-0.5 rounded-md bg-surface border border-border text-text text-[11px]"
                      >
                        {c}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ===================================================================== */}
      {/* TAB 3: MODEL ANSWER KEY (FACULTY / ADMIN ONLY)                       */}
      {/* ===================================================================== */}
      {!isStudent && activeTab === "answers" && (
        <div className="p-8 rounded-2xl border border-warning/30 bg-surface shadow-sm space-y-6 max-w-4xl mx-auto">
          <div className="flex items-center gap-3 border-b border-border pb-4">
            <div className="w-10 h-10 rounded-xl bg-warning/15 text-warning flex items-center justify-center font-bold">
              <KeyRound className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[11px] uppercase font-bold text-warning tracking-wider block">
                FACULTY CONFIDENTIAL • BENCHMARK EVALUATION RUBRICS
              </span>
              <h2 className="font-serif text-2xl font-bold text-text">
                Model Answer Key & Analytical Solutions
              </h2>
            </div>
          </div>

          <div className="space-y-8">
            {casePack.answers.map((ans, aIdx) => {
              const matchedQ = casePack.questions.find((q) => q.id === ans.question_id);
              return (
                <div
                  key={aIdx}
                  className="p-6 rounded-2xl border border-border bg-primary-soft/10 space-y-5"
                >
                  <div className="border-b border-border pb-3">
                    <span className="text-xs font-bold text-accent uppercase font-mono">
                      Answer Key for {ans.question_id} ({matchedQ?.bloom_verb || "Evaluation"})
                    </span>
                    {matchedQ && (
                      <p className="font-serif text-sm italic text-muted mt-1">
                        &quot;{matchedQ.text}&quot;
                      </p>
                    )}
                  </div>

                  {/* INTRODUCTION */}
                  <div className="space-y-1.5">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-muted font-mono">
                      1. Framing & Introduction
                    </h4>
                    <p className="font-serif text-sm leading-relaxed text-text text-justify">
                      {ans.introduction}
                    </p>
                  </div>

                  {/* SECTIONS */}
                  {ans.sections.map((sec, sIdx) => (
                    <div key={sIdx} className="space-y-2 pt-2 border-t border-border/60">
                      <h4 className="font-serif font-bold text-sm text-text">
                        {sec.heading}
                      </h4>
                      {sec.points && sec.points.length > 0 && (
                        <ul className="list-disc pl-5 space-y-1 text-sm text-text">
                          {sec.points.map((pt, pIdx) => (
                            <li key={pIdx}>{pt}</li>
                          ))}
                        </ul>
                      )}
                      {sec.evaluation && sec.evaluation.length > 0 && (
                        <div className="space-y-1 pl-3 border-l-2 border-accent">
                          <span className="text-[11px] font-bold uppercase tracking-wider text-accent font-mono block">
                            Evaluations
                          </span>
                          {sec.evaluation.map((ev, eIdx) => (
                            <p key={eIdx} className="text-xs text-text leading-relaxed">
                              • {ev}
                            </p>
                          ))}
                        </div>
                      )}
                      {sec.limitation && (
                        <div className="p-3 rounded-lg bg-warning/10 border border-warning/30 text-xs text-text">
                          <span className="font-bold text-warning mr-1">Limitation / Risk:</span>
                          {sec.limitation}
                        </div>
                      )}
                    </div>
                  ))}

                  {/* COMPARISON TABLE */}
                  {ans.comparison_table && (
                    <div className="space-y-2 pt-2 border-t border-border/60">
                      <h4 className="font-serif font-bold text-sm text-text">
                        Comprehensive Comparative Matrix
                      </h4>
                      <div className="rounded-xl border border-border bg-surface overflow-hidden">
                        <table className="w-full text-left text-xs">
                          <thead>
                            <tr className="bg-primary-soft border-b border-border font-bold">
                              {ans.comparison_table.columns.map((c, cIdx) => (
                                <th key={cIdx} className="p-2.5">
                                  {c}
                                </th>
                              ))}
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-border">
                            {ans.comparison_table.rows.map((row, rIdx) => (
                              <tr key={rIdx} className="hover:bg-primary-soft/30">
                                {row.map((cell, cIdx) => (
                                  <td
                                    key={cIdx}
                                    className={`p-2.5 text-xs ${cIdx === 0 ? "font-bold text-text" : "text-muted"}`}
                                  >
                                    {cell}
                                  </td>
                                ))}
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}

                  {/* OVERALL ASSESSMENT */}
                  {ans.overall_assessment && (
                    <div className="p-4 rounded-xl bg-accent/5 border border-accent/20 space-y-1">
                      <span className="text-[11px] font-bold uppercase tracking-wider text-accent font-mono block">
                        Overall Strategic Assessment & Verdict
                      </span>
                      <p className="font-serif text-sm leading-relaxed text-text">
                        {ans.overall_assessment}
                      </p>
                    </div>
                  )}

                  {/* CONCLUSION */}
                  <div className="space-y-1.5 pt-2 border-t border-border/60">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-muted font-mono">
                      Synthesis & Conclusion
                    </h4>
                    <p className="font-serif text-sm leading-relaxed text-text text-justify">
                      {ans.conclusion}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ===================================================================== */}
      {/* TAB 4: TEACHING NOTES (FACULTY / ADMIN ONLY)                           */}
      {/* ===================================================================== */}
      {!isStudent && activeTab === "teaching_notes" && casePack.teaching_notes && (
        <div className="p-8 rounded-2xl border border-border bg-surface shadow-sm space-y-6 max-w-4xl mx-auto">
          <div className="flex items-center gap-3 border-b border-border pb-4">
            <div className="w-10 h-10 rounded-xl bg-accent/15 text-accent flex items-center justify-center font-bold">
              <GraduationCap className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[11px] uppercase font-bold text-accent tracking-wider block">
                FACULTY INSTRUCTIONAL MANUAL
              </span>
              <h2 className="font-serif text-2xl font-bold text-text">
                Teaching Plan & Pedagogical Roadmap
              </h2>
            </div>
          </div>

          <div className="space-y-6 text-sm text-text leading-relaxed">
            {/* SYNOPSIS */}
            <div className="p-4 rounded-xl bg-primary-soft/40 border border-border space-y-1.5">
              <span className="text-xs font-bold uppercase text-accent font-mono block">
                Case Synopsis
              </span>
              <p className="font-serif text-[15px]">{casePack.teaching_notes.synopsis}</p>
            </div>

            {/* OBJECTIVES */}
            <div className="space-y-2">
              <h4 className="font-serif font-bold text-base text-text">
                Core Learning Objectives
              </h4>
              <ul className="list-disc pl-5 space-y-1">
                {casePack.teaching_notes.objectives.map((obj, idx) => (
                  <li key={idx}>{obj}</li>
                ))}
              </ul>
            </div>

            {/* TEACHING APPROACH */}
            <div className="space-y-2">
              <h4 className="font-serif font-bold text-base text-text">
                Classroom Delivery Roadmap
              </h4>
              <p className="font-serif text-[14px]">{casePack.teaching_notes.teaching_approach}</p>
            </div>

            {/* FRAMEWORKS */}
            {casePack.teaching_notes.frameworks && casePack.teaching_notes.frameworks.length > 0 && (
              <div className="space-y-2">
                <h4 className="font-serif font-bold text-base text-text">
                  Applicable Analytical Frameworks
                </h4>
                <div className="flex flex-wrap gap-2">
                  {casePack.teaching_notes.frameworks.map((fw, idx) => (
                    <span
                      key={idx}
                      className="px-3 py-1 rounded-full text-xs font-semibold bg-accent/10 text-accent border border-accent/20"
                    >
                      {fw}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* COMMON MISTAKES */}
            {casePack.teaching_notes.common_mistakes && casePack.teaching_notes.common_mistakes.length > 0 && (
              <div className="space-y-2">
                <h4 className="font-serif font-bold text-base text-text">
                  Common Student Pitfalls & Misconceptions
                </h4>
                <ul className="list-disc pl-5 space-y-1 text-muted">
                  {casePack.teaching_notes.common_mistakes.map((mis, idx) => (
                    <li key={idx}>{mis}</li>
                  ))}
                </ul>
              </div>
            )}

            {/* MARKING SCHEME */}
            {casePack.teaching_notes.marking_scheme && casePack.teaching_notes.marking_scheme.length > 0 && (
              <div className="space-y-2">
                <h4 className="font-serif font-bold text-base text-text">
                  Curricular Marking Scheme Breakdown
                </h4>
                <div className="rounded-xl border border-border bg-surface overflow-hidden">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="bg-primary-soft border-b border-border font-bold">
                        <th className="p-2.5">Evaluation Criterion</th>
                        <th className="p-2.5 w-24 text-right">Marks</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                      {casePack.teaching_notes.marking_scheme.map((crit, idx) => (
                        <tr key={idx} className="hover:bg-primary-soft/30">
                          <td className="p-2.5 text-text font-medium">{crit.criterion}</td>
                          <td className="p-2.5 text-right font-mono font-bold text-accent">
                            {crit.marks}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ===================================================================== */}
      {/* TAB 5: CHECKS & QUALITY (FACULTY / ADMIN ONLY)                       */}
      {/* ===================================================================== */}
      {!isStudent && activeTab === "checks" && (
        <div className="p-8 rounded-2xl border border-border bg-surface shadow-sm space-y-6 max-w-4xl mx-auto">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-4">
            <div>
              <span className="text-xs uppercase font-mono text-muted tracking-widest block mb-1">
                DETERMINISTIC VALIDATION SUITE • 10 PROGRAMMATIC CHECKS
              </span>
              <h2 className="font-serif text-2xl font-bold text-text">
                Pedagogical Quality Controls & Integrity
              </h2>
            </div>

            <div className="flex items-center gap-2">
              {onRerunChecks && (
                <button
                  type="button"
                  onClick={onRerunChecks}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-border text-xs font-semibold hover:border-accent"
                >
                  <RefreshCw className="w-3.5 h-3.5 text-accent" />
                  <span>Re-run Checks</span>
                </button>
              )}

              {report && !report.valid && onAutoFix && (
                <button
                  type="button"
                  onClick={onAutoFix}
                  disabled={isAutoFixing}
                  className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-accent text-accent-text text-xs font-bold shadow-sm hover:bg-accent-hover transition-all"
                >
                  <Sparkles className="w-3.5 h-3.5 animate-spin" />
                  <span>{isAutoFixing ? "Auto-fixing..." : "Auto-fix with AI"}</span>
                </button>
              )}
            </div>
          </div>

          {/* SCORE BANNER */}
          {report && (
            <div
              className={`p-5 rounded-2xl border flex items-center justify-between gap-4 ${
                report.valid
                  ? "bg-success/10 border-success/30"
                  : "bg-warning/10 border-warning/30"
              }`}
            >
              <div className="flex items-center gap-3">
                {report.valid ? (
                  <CheckCircle2 className="w-8 h-8 text-success shrink-0" />
                ) : (
                  <AlertTriangle className="w-8 h-8 text-warning shrink-0" />
                )}
                <div>
                  <h3 className="font-serif font-bold text-base text-text">
                    {report.valid
                      ? "Institutional Case Pack Verified: 100% Quality Standards Attained"
                      : "Quality Alerts Detected: Remediation Recommended"}
                  </h3>
                  <p className="text-xs text-muted">
                    {report.valid
                      ? "Case narrative, Bloom questions, model answer architectures, and math calculations all pass."
                      : `${report.criticalFailures.length} critical requirement(s) failed.`}
                  </p>
                </div>
              </div>
              <div className="text-right">
                <span className="text-3xl font-serif font-bold text-text">
                  {report.score}%
                </span>
                <span className="block text-[10px] uppercase font-bold text-muted">Score</span>
              </div>
            </div>
          )}

          {/* CHECK DETAILS LIST */}
          {report && (
            <div className="space-y-3">
              {report.checks.map((chk, idx) => (
                <div
                  key={idx}
                  className="p-4 rounded-xl border border-border bg-primary-soft/20 flex items-start justify-between gap-3"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-serif font-bold text-sm text-text">
                        {chk.name}
                      </span>
                      {chk.critical && (
                        <span className="px-1.5 py-0.2 rounded text-[10px] font-bold bg-danger/10 text-danger border border-danger/20">
                          Critical
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-muted leading-relaxed">
                      {chk.message}
                    </p>
                  </div>
                  <span
                    className={`shrink-0 inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold ${
                      chk.passed
                        ? "bg-success/15 text-success border border-success/30"
                        : "bg-danger/15 text-danger border border-danger/30"
                    }`}
                  >
                    {chk.passed ? (
                      <>
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>PASS</span>
                      </>
                    ) : (
                      <>
                        <XCircle className="w-3.5 h-3.5" />
                        <span>FAIL</span>
                      </>
                    )}
                  </span>
                </div>
              ))}
            </div>
          )}

          {/* FACULTY QUALITY EVALUATION & FEEDBACK LOOP */}
          <div className="mt-8 pt-6 border-t border-border space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-xs uppercase font-mono text-muted tracking-widest block">
                  SBS CONTINUOUS IMPROVEMENT LOOP
                </span>
                <h3 className="font-serif text-lg font-bold text-text flex items-center gap-2">
                  <Star className="w-5 h-5 text-accent fill-accent" />
                  Faculty Quality Assessment & Gold Reference Nomination
                </h3>
              </div>
              {feedbackSubmitted && (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-success/20 text-success border border-success/30">
                  <Check className="w-3.5 h-3.5" />
                  Feedback Recorded in Ledger
                </span>
              )}
            </div>

            {feedbackSubmitted ? (
              <div className="p-4 rounded-xl border border-success/30 bg-success/10 text-success text-xs font-medium flex items-center gap-2">
                <ThumbsUp className="w-4 h-4 shrink-0" />
                Thank you! Your pedagogical assessment has been registered in the CaseLab Quality Ledger.
              </div>
            ) : (
              <div className="space-y-4 bg-primary-soft/30 p-5 rounded-xl border border-border">
                {/* 1-5 Star Rating */}
                <div>
                  <label className="block text-xs font-bold text-text mb-1.5">
                    Overall Pedagogical Quality Rating (1 to 5 Stars):
                  </label>
                  <div className="flex items-center gap-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => setRating(star)}
                        onMouseEnter={() => setHoverRating(star)}
                        onMouseLeave={() => setHoverRating(0)}
                        className="p-1 text-muted hover:text-accent transition-colors"
                      >
                        <Star
                          className={`w-6 h-6 ${
                            (hoverRating || rating) >= star
                              ? "text-accent fill-accent"
                              : "text-muted"
                          }`}
                        />
                      </button>
                    ))}
                    <span className="ml-3 text-xs font-mono font-bold text-text">
                      {rating} / 5 Stars
                    </span>
                  </div>
                </div>

                {/* Flagged issues */}
                <div>
                  <label className="block text-xs font-bold text-text mb-1.5">
                    Flag Any Specific Pedagogical Defects (Optional):
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                    {[
                      { id: "math_discrepancy", label: "Math / Calculation formula discrepancy" },
                      { id: "missing_table", label: "Financial / Workforce data table missing" },
                      { id: "bloom_verb", label: "Weak question or Bloom verb mismatch" },
                      { id: "answer_depth", label: "Answer key lacking depth or limitations" },
                      { id: "unrealistic_figures", label: "Unrealistic numbers or metrics" },
                      { id: "formatting", label: "Formatting or layout defects" },
                    ].map((iss) => (
                      <label
                        key={iss.id}
                        className={`flex items-center gap-2 p-2.5 rounded-lg border cursor-pointer transition-all ${
                          flaggedIssues.includes(iss.id)
                            ? "border-accent bg-accent/10 text-accent font-semibold"
                            : "border-border bg-surface text-muted hover:text-text"
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={flaggedIssues.includes(iss.id)}
                          onChange={() => toggleIssue(iss.id)}
                          className="rounded border-border text-accent focus:ring-accent"
                        />
                        <span>{iss.label}</span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Faculty Comments */}
                <div>
                  <label className="block text-xs font-bold text-text mb-1.5">
                    Evaluator Feedback & Qualitative Notes:
                  </label>
                  <textarea
                    rows={2}
                    value={feedbackComment}
                    onChange={(e) => setFeedbackComment(e.target.value)}
                    placeholder="Enter any faculty observations or suggestions for future model iterations..."
                    className="w-full text-xs p-3 rounded-lg border border-border bg-surface text-text focus:outline-none focus:ring-2 focus:ring-accent"
                  />
                </div>

                {/* Nominate for Gold Reference */}
                <div className="p-3.5 rounded-lg border border-accent/30 bg-accent/5 flex items-start gap-3">
                  <input
                    type="checkbox"
                    id="nominate_gold"
                    checked={promoteToGold}
                    onChange={(e) => setPromoteToGold(e.target.checked)}
                    className="mt-0.5 rounded border-accent text-accent focus:ring-accent"
                  />
                  <label htmlFor="nominate_gold" className="text-xs cursor-pointer">
                    <span className="font-bold text-text block">
                      Nominate for SBS Gold Standard Reference Library
                    </span>
                    <span className="text-muted leading-relaxed">
                      Check this box if this case pack exemplifies ideal classroom and exam standards. It will be sent to the Admin Quality review queue for promotion to institutional few-shot examples.
                    </span>
                  </label>
                </div>

                {/* Submit button */}
                <div className="flex justify-end pt-2">
                  <button
                    type="button"
                    onClick={handleFeedbackSubmit}
                    disabled={submittingFeedback}
                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-xs bg-accent text-white hover:opacity-95 disabled:opacity-50 transition-all shadow-sm"
                  >
                    {submittingFeedback ? (
                      <>
                        <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                        <span>Submitting Evaluation...</span>
                      </>
                    ) : (
                      <>
                        <Send className="w-3.5 h-3.5" />
                        <span>Submit Faculty Quality Evaluation</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
