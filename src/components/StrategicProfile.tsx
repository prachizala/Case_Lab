"use client";

import { useMemo } from "react";
import { CaseBloomsLevel, CaseDifficulty, CaseDomain, CaseFormat, CaseTargetAudience, CaseTone, CaseType } from "@/lib/types";
import {
  Compass,
  Gauge,
  Clock,
  Layers,
  FileCheck,
  AlertTriangle,
  Sparkles,
  Building,
  Target,
  FileSpreadsheet,
  Cpu,
} from "lucide-react";

interface StrategicProfileProps {
  type: CaseType;
  format: CaseFormat;
  industry: string;
  functionalFocus: string;
  domain?: CaseDomain;
  difficulty?: CaseDifficulty;
  targetAudience?: CaseTargetAudience;
  primaryCompany?: string;
  centralDilemma?: string;
  learningObjectivesCount?: number;
  includeExhibitsCount?: number;
  tone?: CaseTone;
  bloomsLevel?: string;
  courseName: string;
  semester: string;
  level: string;
  contextRegion: string;
  complexity: number;
  targetLength: "short" | "medium" | "comprehensive";
  sourceNotes: string;
  configuredStepsCount: number;
}

export function StrategicProfile({
  type,
  format,
  industry,
  functionalFocus,
  domain = "Strategy",
  difficulty = "Intermediate",
  targetAudience = "MBA",
  primaryCompany,
  centralDilemma,
  learningObjectivesCount = 0,
  includeExhibitsCount = 0,
  tone = "Academic",
  bloomsLevel = "Apply & Analyze",
  courseName,
  semester,
  level,
  contextRegion,
  complexity,
  targetLength,
  sourceNotes,
  configuredStepsCount,
}: StrategicProfileProps) {
  // Complexity classification
  const complexityTier = useMemo(() => {
    if (complexity <= 3) return { label: "Foundational Undergrad", color: "text-success", bar: "bg-success" };
    if (complexity <= 6) return { label: "Standard MBA Core", color: "text-info", bar: "bg-info" };
    if (complexity <= 8) return { label: "Advanced Executive / Elective", color: "text-warning", bar: "bg-warning" };
    return { label: "Doctoral / High-Stakes Boardroom", color: "text-danger", bar: "bg-danger" };
  }, [complexity]);

  // Estimated stats
  const metrics = useMemo(() => {
    const isShort = type === "short" || type === "flash";
    const isResearch = type === "research";
    const baseWords = isResearch ? 5200 : isShort ? 1600 : targetLength === "short" ? 2400 : targetLength === "comprehensive" ? 4800 : 3600;
    const estDuration = isResearch ? "90 mins" : isShort ? "30 mins" : "80 mins";
    const baseTokens = isResearch ? 5200 : isShort ? 1600 : 3800;
    const estTokens = baseTokens + includeExhibitsCount * 400;
    const estSeconds = isResearch ? 50 : isShort ? 18 : 35;
    const notesWordCount = sourceNotes ? sourceNotes.trim().split(/\s+/).filter(Boolean).length : 0;

    return {
      targetWords: baseWords,
      estDuration,
      estTokens,
      estSeconds,
      notesWordCount,
    };
  }, [type, targetLength, includeExhibitsCount, sourceNotes]);

  const typeLabels: Record<CaseType, string> = {
    short: "Short Case (~2 pp)",
    full: "Full Case Study (8-10 pp)",
    research: "Case Research (Multi-Firm)",
    flash: "FlashCase (Rapid)",
    ce_pack: "CE Case Pack (Continuous Eval)",
  };

  return (
    <div className="lg:sticky lg:top-24 rounded-2xl border border-border bg-surface shadow-md p-5 space-y-4 transition-all">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-border pb-3">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-primary text-on-primary flex items-center justify-center shrink-0 shadow-xs">
            <Compass className="w-4 h-4 text-white" />
          </div>
          <div>
            <h3 className="font-serif text-sm font-bold text-text">
              Case Summary
            </h3>
            <p className="text-xs text-muted">
              Live configuration overview
            </p>
          </div>
        </div>

        <div className="px-2.5 py-1 rounded-full bg-primary-soft border border-border text-xs font-medium text-text">
          Draft Spec
        </div>
      </div>

      {/* Complexity Gauge */}
      <div className="p-3.5 rounded-xl bg-primary-soft/40 border border-border space-y-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5 text-xs font-semibold text-text">
            <Gauge className="w-4 h-4 text-primary" />
            <span>Complexity Level</span>
          </div>
          <span className="font-mono text-sm font-bold text-text">
            {complexity} / 10
          </span>
        </div>

        {/* Visual Gauge Bar */}
        <div className="w-full h-2.5 bg-border/60 rounded-full overflow-hidden p-0.5">
          <div
            className={`h-full rounded-full transition-all duration-300 ${complexityTier.bar}`}
            style={{ width: `${(complexity / 10) * 100}%` }}
          />
        </div>

        <p className="text-xs text-muted flex items-center justify-between">
          <span>Tier: <strong className="text-text font-semibold">{complexityTier.label}</strong></span>
          <span>{difficulty}</span>
        </p>
      </div>

      {/* Clean Structured Summary List */}
      <div className="space-y-2.5 text-xs">
        <div className="flex items-start justify-between py-1.5 border-b border-border/50 gap-2">
          <span className="text-muted font-medium shrink-0">Format:</span>
          <span className="font-semibold text-text text-right truncate">
            {typeLabels[type] || `${type} Case`}
          </span>
        </div>

        <div className="flex items-start justify-between py-1.5 border-b border-border/50 gap-2">
          <span className="text-muted font-medium shrink-0">Department:</span>
          <span className="font-semibold text-text text-right">
            {domain}
          </span>
        </div>

        <div className="flex items-start justify-between py-1.5 border-b border-border/50 gap-2">
          <span className="text-muted font-medium shrink-0">Audience:</span>
          <span className="font-semibold text-text text-right">
            {targetAudience}
          </span>
        </div>

        {primaryCompany && (
          <div className="flex items-start justify-between py-1.5 border-b border-border/50 gap-2">
            <span className="text-muted font-medium shrink-0">Entity:</span>
            <span className="font-semibold text-text text-right truncate max-w-[170px]">
              {primaryCompany}
            </span>
          </div>
        )}

        <div className="flex items-start justify-between py-1.5 border-b border-border/50 gap-2">
          <span className="text-muted font-medium shrink-0 flex items-center gap-1">
            <Clock className="w-3.5 h-3.5 text-muted" /> Class Time:
          </span>
          <span className="font-semibold text-text text-right">
            {metrics.estDuration} <span className="text-muted font-normal">(~{metrics.targetWords.toLocaleString()} words)</span>
          </span>
        </div>

        <div className="flex items-start justify-between py-1.5 border-b border-border/50 gap-2">
          <span className="text-muted font-medium shrink-0 flex items-center gap-1">
            <Cpu className="w-3.5 h-3.5 text-muted" /> AI Estimate:
          </span>
          <span className="font-mono font-bold text-text text-right">
            ~{metrics.estTokens.toLocaleString()} tokens <span className="text-muted font-sans font-normal text-[11px]">(~{metrics.estSeconds}s)</span>
          </span>
        </div>

        <div className="flex items-start justify-between py-1.5 gap-2">
          <span className="text-muted font-medium shrink-0">Source Basis:</span>
          <span className="font-semibold text-text text-right capitalize">
            {format === "real_signal" ? "Real Signal" : "Hypothetical"}
          </span>
        </div>
      </div>

      {/* Target Focus Synopsis */}
      <div className="space-y-2 text-xs border-t border-border pt-3">
        {primaryCompany && (
          <div className="flex justify-between items-center text-muted">
            <span className="flex items-center gap-1">
              <Building className="w-3 h-3 text-muted" /> Company:
            </span>
            <span className="font-semibold text-text max-w-[150px] truncate text-right">
              {primaryCompany}
            </span>
          </div>
        )}

        <div className="flex justify-between items-center text-muted">
          <span>Target Industry:</span>
          <span className="font-semibold text-text max-w-[150px] truncate text-right">
            {industry || "Not selected"}
          </span>
        </div>

        <div className="flex justify-between items-center text-muted">
          <span>Tone & Rigor:</span>
          <span className="font-semibold text-text max-w-[150px] truncate text-right">
            {tone} ({bloomsLevel})
          </span>
        </div>

        <div className="flex justify-between items-center text-muted">
          <span className="flex items-center gap-1">
            <FileSpreadsheet className="w-3 h-3 text-muted" /> Exhibits:
          </span>
          <span className="font-semibold text-text max-w-[150px] truncate text-right">
            {includeExhibitsCount} selected
          </span>
        </div>

        <div className="flex justify-between items-center text-muted">
          <span className="flex items-center gap-1">
            <Target className="w-3 h-3 text-muted" /> Objectives:
          </span>
          <span className="font-semibold text-text max-w-[150px] truncate text-right">
            {learningObjectivesCount} defined
          </span>
        </div>

        <div className="flex justify-between items-center text-muted">
          <span>Location / Market:</span>
          <span className="font-semibold text-text max-w-[150px] truncate text-right">
            {contextRegion || "Gujarat, India"}
          </span>
        </div>
      </div>

      {/* Real Signal Flag Alert */}
      {format === "real_signal" && (
        <div className="p-2.5 rounded-lg bg-warning/10 border border-warning/30 flex items-start gap-2 text-[11px] text-warning">
          <AlertTriangle className="w-4 h-4 text-warning shrink-0 mt-0.5" />
          <span>
            <strong>Real Signal Mode:</strong> Includes fact-verification protocol for empirical corporate filings.
          </span>
        </div>
      )}

      {/* Source Notes Status */}
      <div className="flex items-center justify-between text-xs p-2.5 rounded-lg bg-primary-soft/50 border border-border">
        <div className="flex items-center gap-1.5 text-muted">
          <FileCheck className="w-3.5 h-3.5 text-accent" />
          <span>Source Notes:</span>
        </div>
        <span className="font-semibold text-text">
          {metrics.notesWordCount > 0
            ? `${metrics.notesWordCount} words supplied`
            : "None attached"}
        </span>
      </div>
    </div>
  );
}
