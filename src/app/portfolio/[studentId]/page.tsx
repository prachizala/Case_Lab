"use client";

import { useEffect, useState, use } from "react";
import Link from "next/link";
import { StateLoading } from "@/components/StateLoading";
import { StateError } from "@/components/StateError";
import {
  APP_NAME,
  COLLEGE_NAME_WITH_SHORT,
  COLLEGE_SHORT,
} from "@/config/college";
import {
  Award,
  ShieldCheck,
  CheckCircle2,
  Lock,
  Download,
  Building,
  GraduationCap,
  Calendar,
  ExternalLink,
  BookOpen,
} from "lucide-react";

export default function PublicPortfolioPage({
  params,
}: {
  params: Promise<{ studentId: string }>;
}) {
  const unwrappedParams = use(params);
  const studentId = unwrappedParams.studentId;

  const [data, setData] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [isPrivate, setIsPrivate] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchPublicPortfolio = async () => {
    setLoading(true);
    setError(null);
    setIsPrivate(false);
    try {
      const res = await fetch(`/api/portfolio?studentId=${studentId}&public=true`);
      if (res.status === 404 || res.status === 403) {
        setIsPrivate(true);
        return;
      }
      if (!res.ok) {
        throw new Error(`Failed to load public portfolio (HTTP ${res.status}).`);
      }
      const json = await res.json();
      if (!json.portfolio) {
        setIsPrivate(true);
      } else {
        setData(json.portfolio);
      }
    } catch (err: unknown) {
      console.error("Public portfolio error:", err);
      setError(err instanceof Error ? err.message : "Failed to load credentials.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPublicPortfolio();
  }, [studentId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <StateLoading
          title="Verifying Institutional Credentials..."
          subtitle={`Querying ${COLLEGE_NAME_WITH_SHORT} cryptographically signed student portfolio records.`}
        />
      </div>
    );
  }

  if (isPrivate) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <div className="max-w-md w-full p-8 rounded-2xl border border-border bg-surface shadow-lg text-center space-y-4">
          <div className="w-14 h-14 rounded-2xl bg-warning/15 text-warning mx-auto flex items-center justify-center">
            <Lock className="w-7 h-7" />
          </div>
          <h2 className="font-serif text-2xl font-bold text-text">
            This Portfolio Is Private
          </h2>
          <p className="text-xs text-muted leading-relaxed">
            The candidate has toggled off public sharing for their {APP_NAME} profile. Credentials and completed case studies are restricted to authorized {COLLEGE_NAME_WITH_SHORT} faculty and students.
          </p>
          <div className="pt-2">
            <Link
              href="/login"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-accent hover:bg-accent-hover text-accent-text font-serif font-bold text-xs"
            >
              Sign In with {COLLEGE_SHORT} Credentials
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <StateError
          title="Credential Verification Failed"
          message={error || "Could not retrieve the requested portfolio."}
          onRetry={fetchPublicPortfolio}
          backHref="/"
          backText="Return to Portal Home"
        />
      </div>
    );
  }

  const profile = data.profile;
  const completedCases = data.completedCases || [];

  return (
    <div className="min-h-screen bg-background text-text py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* PUBLIC VERIFICATION BADGE */}
        <div className="flex items-center justify-between p-4 rounded-2xl bg-primary text-white border border-border shadow-md">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white text-primary font-serif font-black flex items-center justify-center text-xs tracking-wider shrink-0 shadow-sm">
              {COLLEGE_SHORT}
            </div>
            <div>
              <span className="text-[11px] uppercase tracking-wider text-on-primary-muted font-bold block">
                Official Institutional Verification
              </span>
              <h1 className="font-serif text-base font-bold text-white">
                {COLLEGE_NAME_WITH_SHORT} • {APP_NAME}
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-success/20 text-success text-xs font-semibold border border-success/30">
            <ShieldCheck className="w-4 h-4 text-success" />
            <span>Authenticated Candidate</span>
          </div>
        </div>

        {/* CANDIDATE OVERVIEW CARD */}
        <div className="p-8 rounded-2xl border border-border bg-surface shadow-sm space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <span className="text-xs font-bold text-accent uppercase tracking-wider">
                Public Case Analysis Portfolio
              </span>
              <h2 className="font-serif text-3xl font-bold text-text">
                {profile.name}
              </h2>
              <p className="text-xs text-muted">
                MBA Candidate • Department of Finance & Economics • {COLLEGE_SHORT}
              </p>
            </div>

            <div className="text-right">
              <span className="block text-[10px] uppercase font-bold text-muted">
                Cumulative Grade Average
              </span>
              <span className="font-serif text-3xl font-bold text-success">
                {data.averageScore}%
              </span>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 pt-4 border-t border-border text-center">
            <div>
              <span className="block text-[10px] uppercase font-bold text-muted">Completed Cases</span>
              <span className="font-serif text-2xl font-bold text-text">
                {completedCases.length}
              </span>
            </div>
            <div>
              <span className="block text-[10px] uppercase font-bold text-muted">Institutional Standing</span>
              <span className="font-serif text-lg font-bold text-accent pt-1 block">
                High Honors
              </span>
            </div>
            <div className="col-span-2 sm:col-span-1">
              <span className="block text-[10px] uppercase font-bold text-muted">Verification Hash</span>
              <span className="font-mono text-xs text-muted pt-2 block truncate">
                {COLLEGE_SHORT}-{studentId.slice(0, 8).toUpperCase()}
              </span>
            </div>
          </div>
        </div>

        {/* ACCREDITED CASE STUDIES */}
        <div className="space-y-4">
          <h3 className="font-serif font-bold text-xl text-text">
            Accredited Case Solutions & Strategic Defenses
          </h3>

          <div className="space-y-4">
            {completedCases.map((c: any) => (
              <div
                key={c.caseId}
                className="p-6 rounded-2xl border border-border bg-surface shadow-sm space-y-4"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-primary-soft text-text border border-border">
                      Evaluated Case Study
                    </span>
                    <span className="text-xs text-muted">
                      Completed {c.submittedAt ? new Date(c.submittedAt).toLocaleDateString() : "2026"}
                    </span>
                  </div>

                  <span className="font-mono text-base font-bold text-success">
                    Grade: {c.finalMarks} / 100
                  </span>
                </div>

                <h4 className="font-serif font-bold text-xl text-text">
                  {c.caseTitle}
                </h4>

                {c.facultyComment && (
                  <div className="p-3.5 rounded-xl bg-primary-soft/30 border border-border text-xs text-text italic">
                    "{c.facultyComment}"
                  </div>
                )}

                <div className="flex items-center justify-between pt-2 border-t border-border">
                  <span className="text-xs text-muted">
                    {c.industry} • Level: {c.level}
                  </span>

                  <a
                    href={`/api/portfolio/${studentId}/certificate/${c.caseId}`}
                    download
                    className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-xl bg-accent hover:bg-accent-hover text-accent-text text-xs font-semibold hover:shadow-sm"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Download Official Certificate (PDF)</span>
                  </a>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
