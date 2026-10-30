"use client";

import { useEffect, useState } from "react";
import { IntegrityReport } from "@/lib/types";
import {
  ShieldCheck,
  AlertTriangle,
  CheckCircle2,
  FileCheck,
  Sparkles,
  BarChart,
  Layers,
  ChevronDown,
  ChevronUp,
} from "lucide-react";

export function IntegrityReportBadge({ answerId }: { answerId: string }) {
  const [report, setReport] = useState<IntegrityReport | null>(null);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState(false);

  useEffect(() => {
    fetch(`/api/answers/${answerId}/integrity`)
      .then((res) => res.json())
      .then((data) => {
        if (data.report) setReport(data.report);
      })
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, [answerId]);

  if (loading || !report) return null;

  return (
    <div className="p-3 rounded-xl bg-primary-soft/40 border border-border space-y-2">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-lg bg-success/15 text-success flex items-center justify-center">
            <ShieldCheck className="w-4 h-4" />
          </div>
          <div>
            <span className="text-xs font-bold text-text block">
              Academic Integrity & Grounding: {report.verdict}
            </span>
            <span className="text-[10px] text-muted">
              Originality: <strong className="text-success">{report.originality_score}%</strong> • Case Grounding: <strong className="text-info">{report.case_citation_density}%</strong>
            </span>
          </div>
        </div>

        <button
          onClick={() => setExpanded(!expanded)}
          className="text-xs text-muted hover:text-text flex items-center gap-1 font-semibold"
        >
          {expanded ? "Less" : "Details"}
          {expanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
        </button>
      </div>

      {expanded && (
        <div className="pt-2 border-t border-border space-y-2 text-xs">
          <div className="grid grid-cols-3 gap-2 text-center">
            <div className="p-2 rounded-lg bg-surface border border-border">
              <span className="text-[10px] text-muted block uppercase">Originality</span>
              <span className="font-bold text-success font-mono text-sm">
                {report.originality_score}%
              </span>
            </div>
            <div className="p-2 rounded-lg bg-surface border border-border">
              <span className="text-[10px] text-muted block uppercase">Case Citations</span>
              <span className="font-bold text-info font-mono text-sm">
                {report.case_citation_density}%
              </span>
            </div>
            <div className="p-2 rounded-lg bg-surface border border-border">
              <span className="text-[10px] text-muted block uppercase">AI Probability</span>
              <span className="font-bold text-text font-mono text-sm">
                {report.ai_probability_score}%
              </span>
            </div>
          </div>

          <div>
            <span className="text-[10px] font-bold text-muted uppercase tracking-widest block mb-1">
              Frameworks Detected:
            </span>
            <div className="flex flex-wrap gap-1">
              {report.key_frameworks_detected.map((fw, idx) => (
                <span
                  key={idx}
                  className="px-2 py-0.5 rounded-full bg-primary-soft text-text text-[10px] font-medium"
                >
                  {fw}
                </span>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
