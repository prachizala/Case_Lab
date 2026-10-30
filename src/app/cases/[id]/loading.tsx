import { AppShell } from "@/components/AppShell";

export default function CaseDetailLoading() {
  return (
    <AppShell>
      <div className="max-w-5xl mx-auto space-y-8 animate-pulse">
        {/* Top Navigation & Meta */}
        <div className="flex items-center justify-between pb-4 border-b border-border">
          <div className="h-4 w-32 bg-border/50 rounded" />
          <div className="flex gap-2">
            <div className="h-8 w-24 bg-border/50 rounded-lg" />
            <div className="h-8 w-24 bg-border/40 rounded-lg" />
          </div>
        </div>

        {/* Case Header */}
        <div className="p-8 rounded-2xl bg-surface border border-border shadow-xs space-y-5">
          <div className="flex flex-wrap gap-2">
            <div className="h-6 w-28 bg-border/60 rounded-full" />
            <div className="h-6 w-24 bg-border/50 rounded-full" />
            <div className="h-6 w-32 bg-border/40 rounded-full" />
          </div>
          <div className="h-9 w-4/5 bg-border/80 rounded" />
          <div className="flex items-center gap-4 pt-2">
            <div className="h-4 w-36 bg-border/50 rounded" />
            <div className="h-4 w-28 bg-border/40 rounded" />
            <div className="h-4 w-20 bg-border/30 rounded" />
          </div>
        </div>

        {/* Main Content Body Skeleton */}
        <div className="p-8 rounded-2xl bg-surface border border-border shadow-xs space-y-6">
          <div className="h-6 w-44 bg-border/70 rounded" />
          <div className="space-y-3">
            <div className="h-4 w-full bg-border/50 rounded" />
            <div className="h-4 w-full bg-border/40 rounded" />
            <div className="h-4 w-5/6 bg-border/40 rounded" />
          </div>

          <div className="h-6 w-52 bg-border/70 rounded pt-4" />
          <div className="space-y-3">
            <div className="h-4 w-full bg-border/50 rounded" />
            <div className="h-4 w-full bg-border/40 rounded" />
            <div className="h-4 w-11/12 bg-border/40 rounded" />
            <div className="h-4 w-4/5 bg-border/30 rounded" />
          </div>

          {/* Table / Exhibit Skeleton */}
          <div className="p-4 rounded-xl border border-border/60 space-y-3 mt-6">
            <div className="h-5 w-40 bg-border/60 rounded" />
            <div className="h-28 bg-border/20 rounded-lg" />
          </div>
        </div>
      </div>
    </AppShell>
  );
}
