"use client";

import { AlertTriangle, RefreshCw, ArrowLeft } from "lucide-react";
import Link from "next/link";

interface StateErrorProps {
  title?: string;
  message?: string;
  onRetry?: () => void;
  backHref?: string;
  backText?: string;
}

export function StateError({
  title = "Case Synthesis Interruption",
  message = "An error occurred while processing this request or parsing structured model output.",
  onRetry,
  backHref = "/cases",
  backText = "Return to Case Library",
}: StateErrorProps) {
  return (
    <div className="w-full min-h-[380px] flex flex-col items-center justify-center p-8 rounded-xl border border-danger/30 bg-danger/10 text-center">
      <div className="w-16 h-16 rounded-2xl bg-danger/15 border border-danger/30 flex items-center justify-center text-danger mb-4 shadow-sm">
        <AlertTriangle className="w-8 h-8" />
      </div>
      <h3 className="font-serif text-xl font-bold text-text mb-2">
        {title}
      </h3>
      <p className="text-sm text-text max-w-lg mb-6 leading-relaxed bg-surface/60 p-3 rounded-lg border border-danger/20 font-mono text-xs">
        {message}
      </p>

      <div className="flex flex-wrap items-center justify-center gap-3">
        {onRetry && (
          <button
            onClick={onRetry}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-accent hover:bg-accent-hover text-accent-text font-medium text-sm transition-all shadow-sm"
          >
            <RefreshCw className="w-4 h-4" />
            Retry Request
          </button>
        )}
        {backHref && (
          <Link
            href={backHref}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg border border-border text-text font-medium text-sm hover:bg-surface transition-all"
          >
            <ArrowLeft className="w-4 h-4" />
            {backText}
          </Link>
        )}
      </div>
    </div>
  );
}
