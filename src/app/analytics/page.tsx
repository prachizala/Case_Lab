"use client";

import { useEffect, useState, useMemo } from "react";
import Link from "next/link";
import { AppShell } from "@/components/AppShell";
import { StateLoading } from "@/components/StateLoading";
import { OutcomeAttainment } from "@/lib/types";
import { THEME_TOKENS } from "@/config/theme";
import {
  BarChart3,
  TrendingUp,
  Download,
  AlertCircle,
  CheckCircle2,
  BookOpen,
  Users,
  Award,
  Sliders,
  Sparkles,
  PieChart,
  Target,
  FileSpreadsheet,
} from "lucide-react";

interface AnalyticsData {
  casesByIndustry: Record<string, number>;
  casesByFunction: Record<string, number>;
  participationPerCourse: Array<{
    courseId: string;
    courseCode: string;
    courseName: string;
    semester: string;
    enrolledStudents: number;
    submittedAnswers: number;
    participationRate: number;
  }>;
  averageScore: number;
  weakTopics: Array<{
    criterionName: string;
    averagePercentage: number;
    evaluationsCount: number;
  }>;
  trendOverTime: Array<{
    period: string;
    submissionsCount: number;
    averageScore: number;
  }>;
  totalCases: number;
  pendingReviews: number;
  submissionsToGrade: number;
}

export default function AnalyticsPage() {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [attainment, setAttainment] = useState<OutcomeAttainment[]>([]);
  const [targetThreshold, setTargetThreshold] = useState<number>(60);
  const [loading, setLoading] = useState(true);
  const [filterType, setFilterType] = useState<"ALL" | "CO" | "PO">("ALL");

  const loadAnalytics = (threshold: number) => {
    fetch(`/api/analytics?threshold=${threshold}`)
      .then((res) => res.json())
      .then((resData) => {
        if (resData.analytics) setData(resData.analytics);
        if (resData.attainment) setAttainment(resData.attainment);
      })
      .catch((err) => console.error("Error loading analytics:", err))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadAnalytics(targetThreshold);
  }, [targetThreshold]);

  const filteredAttainment = useMemo(() => {
    if (filterType === "ALL") return attainment;
    return attainment.filter((a) => a.type === filterType);
  }, [attainment, filterType]);

  const handleExportCsv = () => {
    window.location.href = `/api/analytics/export-obe-csv?threshold=${targetThreshold}`;
  };

  if (loading && !data) {
    return (
      <AppShell>
        <div className="max-w-6xl mx-auto py-12">
          <StateLoading
            title="Assembling Curriculum Intelligence..."
            subtitle="Synthesizing NBA/NAAC attainment metrics, course participation rates, and rubric criteria evaluations."
          />
        </div>
      </AppShell>
    );
  }

  const totalIndustryCases = data
    ? Object.values(data.casesByIndustry).reduce((a, b) => a + b, 0)
    : 1;

  const totalFunctionCases = data
    ? Object.values(data.casesByFunction).reduce((a, b) => a + b, 0)
    : 1;

  return (
    <AppShell>
      <div className="space-y-8 pb-12">
        {/* HEADER */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-border pb-5">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary-soft text-primary border border-border text-xs font-bold uppercase tracking-wider mb-2">
              <BarChart3 className="w-3.5 h-3.5 text-accent" />
              <span>Pedagogical & Accreditation Intelligence</span>
            </div>
            <h1 className="font-serif text-3xl md:text-4xl font-extrabold text-text tracking-tight">
              Curriculum & Cohort Analytics
            </h1>
            <p className="text-xs md:text-sm text-muted mt-1">
              Real-time telemetry on student case discussions, rubric criteria mastery, and NBA/NAAC outcome attainment.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={handleExportCsv}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-accent hover:bg-accent-hover text-accent-text border border-accent text-xs font-serif font-bold shadow-md hover:shadow-lg transition-all"
            >
              <FileSpreadsheet className="w-4 h-4 text-accent-text" />
              <span>Export NAAC / NBA Report (CSV)</span>
            </button>
          </div>
        </div>

        {/* TOP LEVEL METRIC CARDS */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-5 rounded-2xl border border-border bg-surface shadow-sm space-y-2">
            <div className="flex items-center justify-between text-muted">
              <span className="text-[10px] uppercase font-bold tracking-wider">Total Teaching Cases</span>
              <BookOpen className="w-4 h-4 text-accent" />
            </div>
            <p className="font-serif text-3xl font-extrabold text-text">
              {data?.totalCases || 0}
            </p>
            <p className="text-[11px] text-muted">Across Full & FlashCase formats</p>
          </div>

          <div className="p-5 rounded-2xl border border-border bg-surface shadow-sm space-y-2">
            <div className="flex items-center justify-between text-muted">
              <span className="text-[10px] uppercase font-bold tracking-wider">Cohort Average GPA</span>
              <Award className="w-4 h-4 text-success" />
            </div>
            <p className="font-serif text-3xl font-extrabold text-success">
              {data?.averageScore || 0}%
            </p>
            <p className="text-[11px] text-muted">Based on published faculty evaluations</p>
          </div>

          <div className="p-5 rounded-2xl border border-border bg-surface shadow-sm space-y-2">
            <div className="flex items-center justify-between text-muted">
              <span className="text-[10px] uppercase font-bold tracking-wider">Pending Peer Reviews</span>
              <TrendingUp className="w-4 h-4 text-warning" />
            </div>
            <p className="font-serif text-3xl font-extrabold text-warning">
              {data?.pendingReviews || 0}
            </p>
            <p className="text-[11px] text-muted">Submitted cases in editorial review</p>
          </div>

          <div className="p-5 rounded-2xl border border-border bg-surface shadow-sm space-y-2">
            <div className="flex items-center justify-between text-muted">
              <span className="text-[10px] uppercase font-bold tracking-wider">Submissions to Grade</span>
              <Users className="w-4 h-4 text-info" />
            </div>
            <p className="font-serif text-3xl font-extrabold text-info">
              {data?.submissionsToGrade || 0}
            </p>
            <p className="text-[11px] text-muted">Student answers awaiting final marks</p>
          </div>
        </div>

        {/* SECTION 1: CHARTS FOR INDUSTRY AND FUNCTION */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* CASES BY INDUSTRY */}
          <div className="p-6 rounded-2xl border border-border bg-surface shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <PieChart className="w-4 h-4 text-accent" />
                <h3 className="font-serif text-base font-bold text-text">
                  Cases by Industry Sector
                </h3>
              </div>
              <span className="text-[10px] uppercase font-bold text-muted">
                {Object.keys(data?.casesByIndustry || {}).length} Sectors
              </span>
            </div>

            <div className="space-y-3 pt-2">
              {Object.entries(data?.casesByIndustry || {}).map(([ind, count], idx) => {
                const pct = Math.round((count / totalIndustryCases) * 100);
                const barColor = THEME_TOKENS.charts[idx % THEME_TOKENS.charts.length];
                return (
                  <div key={ind} className="space-y-1">
                    <div className="flex items-center justify-between text-xs font-semibold">
                      <span className="text-text flex items-center gap-1.5">
                        <span
                          className="w-2.5 h-2.5 rounded-sm inline-block shrink-0"
                          style={{ backgroundColor: barColor }}
                        />
                        <span>{ind}</span>
                      </span>
                      <span className="font-mono text-muted">
                        {count} ({pct}%)
                      </span>
                    </div>
                    <div className="w-full h-2 rounded-full bg-border/50 overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all duration-500"
                        style={{ width: `${pct}%`, backgroundColor: barColor }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* CASES BY FUNCTION */}
          <div className="p-6 rounded-2xl border border-border bg-surface shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <BarChart3 className="w-4 h-4 text-accent" />
                <h3 className="font-serif text-base font-bold text-text">
                  Cases by Functional Discipline
                </h3>
              </div>
              <span className="text-[10px] uppercase font-bold text-muted">
                {Object.keys(data?.casesByFunction || {}).length} Disciplines
              </span>
            </div>

            <div className="space-y-3 pt-2">
              {Object.entries(data?.casesByFunction || {}).map(([func, count], idx) => {
                const pct = Math.round((count / totalFunctionCases) * 100);
                const barColor = THEME_TOKENS.charts[idx % THEME_TOKENS.charts.length];
                return (
                  <div key={func} className="space-y-1">
                    <div className="flex items-center justify-between text-xs font-semibold">
                      <span className="text-text flex items-center gap-1.5">
                        <span
                          className="w-2.5 h-2.5 rounded-sm inline-block shrink-0"
                          style={{ backgroundColor: barColor }}
                        />
                        <span>{func}</span>
                      </span>
                      <span className="font-mono text-muted">
                        {count} ({pct}%)
                      </span>
                    </div>
                    <div className="w-full h-2 rounded-full bg-border/50 overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all duration-500"
                        style={{ width: `${pct}%`, backgroundColor: barColor }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* SECTION 2: PARTICIPATION PER COURSE & WEAK TOPICS */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* PARTICIPATION PER COURSE (2 COLS) */}
          <div className="lg:col-span-2 p-6 rounded-2xl border border-border bg-surface shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4 text-success" />
                <h3 className="font-serif text-base font-bold text-text">
                  Cohort Participation per Course
                </h3>
              </div>
              <span className="text-[10px] uppercase font-bold text-muted">
                Active Enrolled Semesters
              </span>
            </div>

            <div className="divide-y divide-border">
              {data?.participationPerCourse.map((c) => (
                <div key={c.courseId} className="py-3.5 space-y-2 first:pt-0 last:pb-0">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-xs font-bold text-text">
                        {c.courseCode}: {c.courseName}
                      </span>
                      <p className="text-[11px] text-muted">{c.semester}</p>
                    </div>
                    <div className="text-right">
                      <span className="font-mono text-xs font-bold text-text">
                        {c.submittedAnswers} / {c.enrolledStudents} Submissions
                      </span>
                      <p className="text-[11px] text-success font-semibold">
                        {c.participationRate}% Active
                      </p>
                    </div>
                  </div>
                  <div className="w-full h-2 rounded-full bg-border/50 overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${
                        c.participationRate >= 70
                          ? "bg-success"
                          : c.participationRate >= 40
                          ? "bg-warning"
                          : "bg-muted"
                      }`}
                      style={{ width: `${Math.max(5, c.participationRate)}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* WEAK TOPICS (LOWEST CRITERIA AVERAGES) (1 COL) */}
          <div className="p-6 rounded-2xl border border-border bg-surface shadow-sm space-y-4">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-warning" />
              <div>
                <h3 className="font-serif text-base font-bold text-text">
                  Curricular Weak Topics
                </h3>
                <p className="text-[11px] text-muted">Lowest Criteria Averages</p>
              </div>
            </div>

            <div className="space-y-3 pt-2">
              {data?.weakTopics.length === 0 ? (
                <p className="text-xs text-muted py-4 text-center">
                  No criteria evaluation data logged yet.
                </p>
              ) : (
                data?.weakTopics.map((topic, idx) => (
                  <div
                    key={topic.criterionName}
                    className={`p-3.5 rounded-xl border ${
                      idx === 0
                        ? "border-warning/40 bg-warning/10"
                        : "border-border bg-surface"
                    } space-y-1.5`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <span className="text-xs font-bold text-text font-serif">
                        {topic.criterionName}
                      </span>
                      <span
                        className={`text-xs font-mono font-bold shrink-0 ${
                          topic.averagePercentage < 70
                            ? "text-warning"
                            : "text-success"
                        }`}
                      >
                        {topic.averagePercentage}% Avg
                      </span>
                    </div>
                    <p className="text-[10px] text-muted">
                      Evaluated across {topic.evaluationsCount} student submissions.
                      {idx === 0 && " (Recommended for classroom review)"}
                    </p>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* SECTION 3: TREND OVER TIME */}
        {data?.trendOverTime && data.trendOverTime.length > 0 && (
          <div className="p-6 rounded-2xl border border-border bg-surface shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-accent" />
                <h3 className="font-serif text-base font-bold text-text">
                  Performance & Submission Trajectory
                </h3>
              </div>
              <span className="text-[10px] uppercase font-bold text-muted">
                Monthly Aggregates
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
              {data.trendOverTime.map((trend) => (
                <div
                  key={trend.period}
                  className="p-4 rounded-xl border border-border bg-surface/50 space-y-1"
                >
                  <span className="text-[10px] uppercase font-bold text-muted">
                    {trend.period}
                  </span>
                  <div className="flex items-baseline justify-between">
                    <p className="font-serif text-2xl font-bold text-text">
                      {trend.averageScore}%
                    </p>
                    <span className="text-xs font-mono text-muted">
                      {trend.submissionsCount} cases graded
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* SECTION 4: CO/PO ATTAINMENT TABLE (NAAC / NBA COMPLIANCE) */}
        <div className="p-6 rounded-3xl border border-border bg-surface shadow-md space-y-6">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-border pb-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2 text-accent">
                <Target className="w-5 h-5 text-accent" />
                <h2 className="font-serif text-xl font-bold text-text">
                  NBA / NAAC Outcome Attainment Matrix
                </h2>
              </div>
              <p className="text-xs text-muted">
                Course Outcomes (CO) and Program Outcomes (PO) calculated via rubric criteria mappings against the institutional benchmark threshold.
              </p>
            </div>

            {/* THRESHOLD CONTROLLER */}
            <div className="flex flex-wrap items-center gap-4 bg-primary-soft p-3 rounded-2xl border border-border">
              <div className="flex items-center gap-2 text-xs font-bold text-text">
                <Sliders className="w-4 h-4 text-accent" />
                <span>Target Threshold:</span>
                <span className="px-2 py-0.5 rounded-md bg-accent text-accent-text font-mono">
                  {targetThreshold}%
                </span>
              </div>

              <div className="flex items-center gap-1.5">
                {[50, 60, 70, 75].map((t) => (
                  <button
                    key={t}
                    onClick={() => setTargetThreshold(t)}
                    className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all ${
                      targetThreshold === t
                        ? "bg-accent text-accent-text shadow-sm"
                        : "bg-surface text-text hover:bg-border"
                    }`}
                  >
                    {t}%
                  </button>
                ))}
              </div>

              <input
                type="range"
                min="40"
                max="90"
                step="5"
                value={targetThreshold}
                onChange={(e) => setTargetThreshold(Number(e.target.value))}
                className="w-24 accent-accent cursor-pointer"
              />
            </div>
          </div>

          {/* FILTER PILLS */}
          <div className="flex items-center gap-2">
            {(["ALL", "CO", "PO"] as const).map((type) => (
              <button
                key={type}
                onClick={() => setFilterType(type)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  filterType === type
                    ? "bg-accent text-accent-text"
                    : "bg-primary-soft text-text hover:bg-border"
                }`}
              >
                {type === "ALL" ? "All Outcomes" : type === "CO" ? "Course Outcomes (CO)" : "Program Outcomes (PO)"}
              </button>
            ))}
          </div>

          {/* ATTAINMENT TABLE */}
          <div className="overflow-x-auto rounded-2xl border border-border">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-primary-soft border-b border-border text-text font-serif">
                  <th className="py-3 px-4 font-bold">Course</th>
                  <th className="py-3 px-4 font-bold">Code</th>
                  <th className="py-3 px-4 font-bold">Type</th>
                  <th className="py-3 px-4 font-bold max-w-xs">Outcome Description</th>
                  <th className="py-3 px-4 font-bold text-center">Evaluated</th>
                  <th className="py-3 px-4 font-bold text-center">≥ {targetThreshold}%</th>
                  <th className="py-3 px-4 font-bold text-center">Attainment %</th>
                  <th className="py-3 px-4 font-bold text-center">Avg Score</th>
                  <th className="py-3 px-4 font-bold text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filteredAttainment.map((row) => {
                  const isAttained = row.status === "Attained";
                  return (
                    <tr
                      key={row.outcome_id}
                      className="hover:bg-primary-soft/30 transition-colors"
                    >
                      <td className="py-3 px-4 font-semibold text-text">
                        {row.course_code}
                      </td>
                      <td className="py-3 px-4 font-mono font-bold text-accent">
                        {row.code}
                      </td>
                      <td className="py-3 px-4">
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            row.type === "CO"
                              ? "bg-info/15 text-info"
                              : "bg-primary-soft text-primary"
                          }`}
                        >
                          {row.type}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-text max-w-xs leading-relaxed">
                        {row.description}
                      </td>
                      <td className="py-3 px-4 text-center font-mono text-muted">
                        {row.total_students_evaluated}
                      </td>
                      <td className="py-3 px-4 text-center font-mono font-semibold text-text">
                        {row.students_meeting_target}
                      </td>
                      <td className="py-3 px-4 text-center">
                        <span
                          className={`font-mono font-bold text-xs ${
                            isAttained
                              ? "text-success"
                              : "text-warning"
                          }`}
                        >
                          {row.attainment_percentage}%
                        </span>
                      </td>
                      <td className="py-3 px-4 text-center font-mono text-muted">
                        {row.average_score_percentage}%
                      </td>
                      <td className="py-3 px-4 text-right">
                        <span
                          className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                            isAttained
                              ? "bg-success/15 text-success"
                              : "bg-warning/15 text-warning"
                          }`}
                        >
                          {isAttained ? (
                            <CheckCircle2 className="w-3 h-3 text-success" />
                          ) : (
                            <AlertCircle className="w-3 h-3 text-warning" />
                          )}
                          <span>{row.status}</span>
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
