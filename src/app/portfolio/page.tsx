"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { AppShell } from "@/components/AppShell";
import { StateEmpty } from "@/components/StateEmpty";
import { StateLoading } from "@/components/StateLoading";
import { StateError } from "@/components/StateError";
import { Profile } from "@/lib/types";
import { COLLEGE_NAME_WITH_SHORT, COLLEGE_SHORT } from "@/config/college";
import {
  Award,
  Share2,
  Check,
  Download,
  ExternalLink,
  ShieldCheck,
  BookOpen,
  Calendar,
  Building,
  GraduationCap,
  Sparkles,
  Lock,
  Globe,
  CheckCircle2,
} from "lucide-react";

export default function StudentPortfolioPage() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [answers, setAnswers] = useState<any[]>([]);
  const [isPublic, setIsPublic] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [toggling, setToggling] = useState(false);

  const loadPortfolio = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/portfolio");
      if (!res.ok) {
        throw new Error(`Failed to load portfolio (HTTP ${res.status})`);
      }
      const data = await res.json();
      if (data.profile) {
        setProfile(data.profile);
        setIsPublic(Boolean(data.isPublic));
      }
      if (data.answers) {
        setAnswers(data.answers);
      }
    } catch (err: unknown) {
      console.error("Portfolio error:", err);
      setError(err instanceof Error ? err.message : "Failed to load portfolio.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPortfolio();
  }, []);

  const handleTogglePublic = async (newState: boolean) => {
    setToggling(true);
    try {
      const res = await fetch("/api/portfolio", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "toggle-public",
          isPublic: newState,
          studentId: profile?.id,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setIsPublic(data.isPublic);
      }
    } catch (err) {
      console.error("Toggle public error:", err);
      alert("Failed to update portfolio visibility.");
    } finally {
      setToggling(false);
    }
  };

  const getPublicUrl = () => {
    if (typeof window === "undefined" || !profile) return "";
    return `${window.location.origin}/portfolio/${profile.id}`;
  };

  const handleCopyLink = () => {
    const url = getPublicUrl();
    if (navigator.clipboard) {
      navigator.clipboard.writeText(url).then(() => {
        setCopied(true);
        setTimeout(() => setCopied(false), 3000);
      });
    }
  };

  const gradedCases = answers.filter((a) => a.grade && a.grade.final_marks !== null);
  const totalScore = gradedCases.reduce((sum, a) => sum + (a.grade?.final_marks || 0), 0);
  const avgScore = gradedCases.length > 0 ? Math.round(totalScore / gradedCases.length) : 0;
  const highHonorsCount = gradedCases.filter((a) => (a.grade?.final_marks || 0) >= 90).length;

  return (
    <AppShell>
      <div className="max-w-6xl mx-auto space-y-6 pb-16">
        {/* HEADER */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-5">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold text-accent uppercase tracking-wider mb-1">
              <Award className="w-4 h-4 text-accent" />
              <span>Executive Case Portfolio</span>
              <span>•</span>
              <span>{COLLEGE_NAME_WITH_SHORT}</span>
            </div>
            <h1 className="font-serif text-3xl font-bold text-text tracking-tight">
              Academic Credentials & Case Portfolio
            </h1>
            <p className="text-sm text-muted mt-1">
              Verified analytical case solutions, faculty evaluations, and downloadable completion certificates.
            </p>
          </div>

          <div className="flex items-center gap-2.5">
            <a
              href="/api/student/export-all"
              download
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-border bg-surface text-text text-xs font-semibold hover:border-accent hover:text-accent transition-all shadow-sm"
              title="Download permanent academic bundle of all answers and certificates (available anytime, including for alumni)"
            >
              <Download className="w-4 h-4 text-accent" />
              <span>Download Archive</span>
            </a>
          </div>
        </div>

        {/* PROFILE CREDENTIAL BANNER & PUBLIC SHARE TOGGLE */}
        <div className="p-6 md:p-8 rounded-2xl border border-border bg-surface shadow-sm space-y-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-2xl bg-primary text-on-primary font-serif font-black text-2xl flex items-center justify-center shadow-md">
                {profile?.name ? profile.name.slice(0, 2).toUpperCase() : "ST"}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="font-serif text-2xl font-bold text-text">
                    {profile?.name || `${COLLEGE_SHORT} Student`}
                  </h2>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-primary-soft text-text border border-border">
                    {profile?.plan === "lifetime" ? "Alumnus" : "Student Candidate"}
                  </span>
                </div>
                <p className="text-xs text-muted mt-1">
                  {profile?.email} • Finance & Economics Dept • {COLLEGE_SHORT} Cohort
                </p>
              </div>
            </div>

            {/* PUBLIC SHARE TOGGLE CARD */}
            <div className="p-4 rounded-xl border border-border bg-primary-soft/30 space-y-2.5 min-w-[280px]">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5 text-xs font-bold text-text">
                  <Globe className="w-4 h-4 text-accent" />
                  <span>Public Portfolio Link</span>
                </div>

                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isPublic}
                    disabled={toggling}
                    onChange={(e) => handleTogglePublic(e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-border peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-border after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-accent"></div>
                </label>
              </div>

              {isPublic ? (
                <div className="space-y-1.5">
                  <div className="flex items-center gap-1.5">
                    <input
                      type="text"
                      readOnly
                      value={getPublicUrl()}
                      className="flex-1 px-2.5 py-1 text-[11px] rounded-lg border border-border bg-surface text-text select-all"
                    />
                    <button
                      type="button"
                      onClick={handleCopyLink}
                      className="px-2.5 py-1 text-[11px] font-bold rounded-lg bg-accent hover:bg-accent-hover text-accent-text hover:shadow-sm"
                    >
                      {copied ? <Check className="w-3.5 h-3.5 text-accent-text" /> : <Share2 className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                  <p className="text-[10px] text-success font-semibold flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3" />
                    <span>Publicly accessible to employers & colleagues</span>
                  </p>
                </div>
              ) : (
                <p className="text-[11px] text-muted italic">
                  Portfolio is currently private. Toggle on to share your credentials publicly.
                </p>
              )}
            </div>
          </div>

          {/* METRIC STRIP */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-4 border-t border-border text-center">
            <div>
              <span className="block text-[10px] uppercase font-bold text-muted">Cases Evaluated</span>
              <span className="font-serif text-2xl font-bold text-text">
                {gradedCases.length}
              </span>
            </div>
            <div>
              <span className="block text-[10px] uppercase font-bold text-muted">Cumulative GPA / Score</span>
              <span className="font-serif text-2xl font-bold text-success">
                {avgScore}%
              </span>
            </div>
            <div>
              <span className="block text-[10px] uppercase font-bold text-muted">High Honors Awards</span>
              <span className="font-serif text-2xl font-bold text-accent">
                {highHonorsCount}
              </span>
            </div>
            <div>
              <span className="block text-[10px] uppercase font-bold text-muted">Certificates Issued</span>
              <span className="font-serif text-2xl font-bold text-text">
                {gradedCases.length}
              </span>
            </div>
          </div>
        </div>

        {/* GRADED CASES & CERTIFICATES DIRECTORY */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-serif font-bold text-xl text-text">
              Completed Case Studies & Verified Credentials
            </h3>
            <span className="text-xs text-muted">
              {gradedCases.length} Accredited Submission{gradedCases.length === 1 ? "" : "s"}
            </span>
          </div>

          {loading ? (
            <div className="p-12 rounded-2xl border border-border bg-surface shadow-sm">
              <StateLoading
                title="Loading Academic Portfolio..."
                subtitle="Verifying completed case studies and generating credential seals."
              />
            </div>
          ) : error ? (
            <div className="p-12 rounded-2xl border border-border bg-surface shadow-sm">
              <StateError
                title="Failed to Load Portfolio"
                message={error}
                onRetry={loadPortfolio}
              />
            </div>
          ) : gradedCases.length === 0 ? (
            <div className="p-12 rounded-2xl border border-border bg-surface shadow-sm">
              <StateEmpty
                title="No Completed Case Studies Yet"
                description="Once faculty grades and publishes your case analysis, your verified credentials and downloadable completion certificates will appear here."
                actionText="Explore Case Library"
                actionHref="/library"
              />
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {gradedCases.map((item) => {
                const finalMarks = item.grade?.final_marks || 0;
                const isHighHonors = finalMarks >= 90;

                return (
                  <div
                    key={item.id}
                    className="p-6 rounded-2xl border border-border bg-surface shadow-sm hover:shadow-md transition-all flex flex-col justify-between space-y-4"
                  >
                    <div className="space-y-3">
                      <div className="flex items-center justify-between gap-2">
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-primary-soft text-text border border-border">
                          {isHighHonors ? "High Honors" : "Accredited Pass"}
                        </span>

                        <span className="font-mono text-base font-bold text-success">
                          {finalMarks} / 100
                        </span>
                      </div>

                      <h4 className="font-serif font-bold text-lg text-text leading-snug">
                        {item.case_title}
                      </h4>

                      <div className="flex items-center gap-3 text-xs text-muted">
                        <span>{item.case_industry || "General Management"}</span>
                        <span>•</span>
                        <span>Level: {item.case_level || "MBA"}</span>
                      </div>

                      {/* Faculty Commendation */}
                      {item.grade?.faculty_comment && (
                        <div className="p-3 rounded-xl bg-primary-soft/30 border border-border text-xs text-text italic">
                          "{item.grade.faculty_comment}"
                        </div>
                      )}
                    </div>

                    <div className="pt-4 border-t border-border flex items-center justify-between gap-2">
                      <span className="text-[11px] text-muted">
                        Published {new Date(item.grade?.published_at || item.updated_at).toLocaleDateString()}
                      </span>

                      {/* Download PDF Certificate Button */}
                      <a
                        href={`/api/portfolio/${profile?.id}/certificate/${item.case_id}`}
                        download
                        className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-accent hover:bg-accent-hover text-accent-text font-serif font-bold text-xs hover:shadow-sm transition-all"
                        title={`Download official branded ${COLLEGE_SHORT} Certificate (PDF)`}
                      >
                        <Award className="w-3.5 h-3.5 text-accent-text" />
                        <span>Download Certificate (PDF)</span>
                      </a>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </AppShell>
  );
}
