"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { AppShell } from "@/components/AppShell";
import { StateEmpty } from "@/components/StateEmpty";
import { StateLoading } from "@/components/StateLoading";
import { StateError } from "@/components/StateError";
import { StudentAnswer, Profile } from "@/lib/types";
import { COLLEGE_SHORT } from "@/config/college";
import {
  FileText,
  Clock,
  CheckCircle2,
  Lock,
  ArrowRight,
  Download,
  Award,
  BookOpen,
  Calendar,
  Layers,
  Sparkles,
  FileCheck,
} from "lucide-react";

export default function MyAnswersPage() {
  const [answers, setAnswers] = useState<any[]>([]);
  const [currentUser, setCurrentUser] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadData = async () => {
    setLoading(true);
    setError(null);
    try {
      const userRes = await fetch("/api/auth");
      const userData = await userRes.json();
      if (userData.user) setCurrentUser(userData.user);

      const answersRes = await fetch("/api/answers");
      if (!answersRes.ok) {
        throw new Error(`Failed to load answers (HTTP ${answersRes.status})`);
      }
      const answersData = await answersRes.json();
      if (answersData.answers) {
        setAnswers(answersData.answers);
      }
    } catch (err: unknown) {
      console.error("Failed to load my answers:", err);
      setError(err instanceof Error ? err.message : "Failed to load submissions.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const totalSubmitted = answers.filter((a) => a.status === "submitted").length;
  const totalDrafts = answers.filter((a) => a.status === "draft").length;
  const gradedAnswers = answers.filter((a) => a.grade && a.grade.final_marks !== null);
  const avgScore =
    gradedAnswers.length > 0
      ? Math.round(
          gradedAnswers.reduce((sum, a) => sum + (a.grade?.final_marks || 0), 0) /
            gradedAnswers.length
        )
      : null;

  return (
    <AppShell>
      <div className="max-w-6xl mx-auto space-y-6">
        {/* HEADER */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-5">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold text-accent uppercase tracking-wider mb-1">
              <FileCheck className="w-3.5 h-3.5" />
              <span>Student Academic Records</span>
              <span>•</span>
              <span>{COLLEGE_SHORT} Curriculum</span>
            </div>
            <h1 className="font-serif text-3xl font-bold text-text tracking-tight">
              My Case Submissions & Answers
            </h1>
            <p className="text-sm text-muted mt-1">
              Track your strategic analysis drafts, submitted essays, locked submissions, and published faculty grades.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <a
              href="/api/student/export-all"
              download
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-border bg-surface text-text text-xs font-semibold hover:border-accent hover:text-accent transition-all shadow-sm"
              title="Download academic archive of all your analyses and grades (available anytime, including for alumni)"
            >
              <Download className="w-4 h-4 text-accent" />
              <span>Export All My Answers</span>
            </a>
          </div>
        </div>

        {/* SUMMARY STATS BAR */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="p-4 rounded-2xl border border-border bg-surface shadow-sm space-y-1">
            <span className="text-[10px] font-bold uppercase tracking-wider text-muted">
              Total Analyses
            </span>
            <div className="text-2xl font-serif font-bold text-text">
              {answers.length}
            </div>
          </div>

          <div className="p-4 rounded-2xl border border-border bg-surface shadow-sm space-y-1">
            <span className="text-[10px] font-bold uppercase tracking-wider text-muted">
              Submitted & Locked
            </span>
            <div className="text-2xl font-serif font-bold text-warning">
              {totalSubmitted}
            </div>
          </div>

          <div className="p-4 rounded-2xl border border-border bg-surface shadow-sm space-y-1">
            <span className="text-[10px] font-bold uppercase tracking-wider text-muted">
              Active Drafts
            </span>
            <div className="text-2xl font-serif font-bold text-muted">
              {totalDrafts}
            </div>
          </div>

          <div className="p-4 rounded-2xl border border-border bg-surface shadow-sm space-y-1">
            <span className="text-[10px] font-bold uppercase tracking-wider text-muted">
              Average Grade
            </span>
            <div className="text-2xl font-serif font-bold text-success">
              {avgScore !== null ? `${avgScore}%` : "—"}
            </div>
          </div>
        </div>

        {/* SUBMISSIONS LIST */}
        {loading ? (
          <div className="p-12 rounded-2xl border border-border bg-surface shadow-sm">
            <StateLoading
              title="Loading Student Submissions..."
              subtitle="Querying your draft analyses, locked submissions, and published faculty grades."
            />
          </div>
        ) : error ? (
          <div className="p-12 rounded-2xl border border-border bg-surface shadow-sm">
            <StateError
              title="Failed to Load Answers"
              message={error}
              onRetry={loadData}
              backHref="/library"
              backText="Return to Case Library"
            />
          </div>
        ) : answers.length === 0 ? (
          <div className="p-12 rounded-2xl border border-border bg-surface shadow-sm">
            <StateEmpty
              title="No Case Analyses Yet"
              description="You have not started or submitted any case studies yet. Browse the accredited Case Library to select a teaching case and author your strategic recommendation."
              actionText="Browse Case Library"
              actionHref="/library"
            />
          </div>
        ) : (
          <div className="space-y-4">
            {answers.map((ans) => {
              const isLocked = ans.status === "submitted";
              const grade = ans.grade;
              const isGraded = grade && grade.final_marks !== null;

              return (
                <div
                  key={ans.id}
                  className="p-6 rounded-2xl border border-border bg-surface shadow-sm hover:shadow-md transition-all space-y-4"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border pb-3">
                    <div className="flex flex-wrap items-center gap-2">
                      {isLocked ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-warning/15 text-warning">
                          <Lock className="w-3 h-3" />
                          <span>Submitted & Locked</span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-primary-soft text-text">
                          <Clock className="w-3 h-3" />
                          <span>Autosaved Draft</span>
                        </span>
                      )}

                      {isGraded ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-success/15 text-success">
                          <Award className="w-3 h-3" />
                          <span>Graded: {grade.final_marks} / 100</span>
                        </span>
                      ) : isLocked ? (
                        <span className="text-xs text-muted italic">
                          Awaiting faculty review & publication
                        </span>
                      ) : null}
                    </div>

                    <div className="flex items-center gap-3 text-xs text-muted">
                      <span>{ans.word_count || ans.text.split(/\s+/).length} words</span>
                      <span>•</span>
                      <span>
                        {ans.submitted_at
                          ? `Submitted ${new Date(ans.submitted_at).toLocaleDateString()}`
                          : `Modified ${new Date(ans.updated_at).toLocaleDateString()}`}
                      </span>
                    </div>
                  </div>

                  <div>
                    <h3 className="font-serif font-bold text-lg text-text">
                      {ans.case_title}
                    </h3>
                    <p className="text-xs text-muted mt-2 line-clamp-3 leading-relaxed font-mono bg-primary-soft/30 p-3 rounded-xl border border-border">
                      {ans.text || "Draft is empty."}
                    </p>
                  </div>

                  {/* Faculty Comment & Published Grade Callout */}
                  {isGraded && grade.faculty_comment && (
                    <div className="p-3.5 rounded-xl border border-success/30 bg-success/10 text-text text-xs space-y-1">
                      <div className="font-bold flex items-center gap-1.5 text-success">
                        <CheckCircle2 className="w-4 h-4 text-success" />
                        <span>Faculty Commendation:</span>
                      </div>
                      <p className="leading-relaxed pl-5 italic">
                        "{grade.faculty_comment}"
                      </p>
                    </div>
                  )}

                  <div className="flex items-center justify-between pt-2">
                    <span className="text-xs text-muted">
                      {ans.case_industry ? `${ans.case_industry} • ` : ""}
                      {ans.case_level || "MBA Curriculum"}
                    </span>

                    <div className="flex items-center gap-2">
                      {isGraded && (
                        <a
                          href={`/api/portfolio/${currentUser?.id || ans.student_id}/certificate/${ans.case_id}`}
                          download
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-border text-accent text-xs font-semibold hover:bg-primary-soft"
                        >
                          <Award className="w-3.5 h-3.5 text-accent" />
                          <span>Certificate (PDF)</span>
                        </a>
                      )}

                      <Link
                        href={`/cases/${ans.case_id}`}
                        className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-xl bg-accent hover:bg-accent-hover text-accent-text text-xs font-semibold hover:shadow-sm transition-all"
                      >
                        <span>{isLocked ? "View Analysis" : "Continue Draft"}</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </Link>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </AppShell>
  );
}
