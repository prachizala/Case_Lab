import { BookOpen, PlusCircle } from "lucide-react";
import Link from "next/link";

interface StateEmptyProps {
  title?: string;
  description?: string;
  message?: string;
  actionText?: string;
  actionLabel?: string;
  actionHref?: string;
  onAction?: () => void;
  icon?: React.ReactNode;
}

export function StateEmpty({
  title = "No Case Studies Found",
  description,
  message,
  actionText,
  actionLabel,
  actionHref = "/create",
  onAction,
  icon,
}: StateEmptyProps) {
  const displayDescription =
    description ||
    message ||
    "No entries match your search criteria. Begin by authoring a new teaching case or adjust your filters.";
  const displayActionText = actionText || actionLabel || "Generate New Case";
  return (
    <div className="w-full min-h-[380px] flex flex-col items-center justify-center p-8 rounded-xl border border-dashed border-border bg-primary-soft/30 text-center">
      <div className="w-16 h-16 rounded-2xl bg-primary-soft border border-border flex items-center justify-center text-primary mb-4 shadow-sm">
        {icon || <BookOpen className="w-7 h-7" />}
      </div>
      <h3 className="font-serif text-xl font-bold text-text mb-2">
        {title}
      </h3>
      <p className="text-sm text-muted max-w-md mb-6 leading-relaxed">
        {displayDescription}
      </p>

      {onAction ? (
        <button
          onClick={onAction}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-accent hover:bg-accent-hover text-accent-text font-medium text-sm transition-all shadow-sm"
        >
          <PlusCircle className="w-4 h-4" />
          {displayActionText}
        </button>
      ) : actionHref ? (
        <Link
          href={actionHref}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-accent hover:bg-accent-hover text-accent-text font-medium text-sm transition-all shadow-sm"
        >
          <PlusCircle className="w-4 h-4" />
          {displayActionText}
        </Link>
      ) : null}
    </div>
  );
}
