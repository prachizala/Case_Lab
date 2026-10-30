import { Loader2 } from "lucide-react";

interface StateLoadingProps {
  title?: string;
  subtitle?: string;
}

export function StateLoading({
  title = "Loading SBS CaseLab Intelligence...",
  subtitle = "Synthesizing curriculum assets and institutional data.",
}: StateLoadingProps) {
  return (
    <div className="w-full min-h-[360px] flex flex-col items-center justify-center p-8 rounded-xl border border-border bg-surface shadow-sm">
      <div className="relative mb-5">
        <div className="w-14 h-14 rounded-full border-2 border-accent/20 border-t-accent animate-spin flex items-center justify-center">
          <Loader2 className="w-6 h-6 text-accent animate-spin" />
        </div>
      </div>
      <h3 className="font-serif text-lg font-semibold text-text mb-1 tracking-wide">
        {title}
      </h3>
      <p className="text-sm text-muted max-w-sm text-center">
        {subtitle}
      </p>
      {/* Decorative skeleton bars */}
      <div className="w-full max-w-md mt-6 space-y-2.5">
        <div className="h-3 bg-border/60 rounded-full w-3/4 mx-auto" />
        <div className="h-2.5 bg-border/40 rounded-full w-1/2 mx-auto" />
      </div>
    </div>
  );
}
