import { AppShell } from "@/components/AppShell";

export default function AnalyticsLoading() {
  return (
    <AppShell>
      <div className="space-y-8 animate-pulse">
        {/* Header Skeleton */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-border">
          <div>
            <div className="h-8 w-80 bg-border/80 rounded" />
            <div className="h-4 w-96 max-w-full bg-border/40 rounded mt-2" />
          </div>
          <div className="flex gap-3">
            <div className="h-10 w-36 bg-border/60 rounded-xl" />
          </div>
        </div>

        {/* 4 Stat Metric Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="p-5 rounded-xl bg-surface border border-border shadow-xs space-y-3">
              <div className="flex justify-between items-center">
                <div className="h-3 w-28 bg-border/50 rounded" />
                <div className="w-8 h-8 rounded-lg bg-border/40" />
              </div>
              <div className="h-7 w-16 bg-border/80 rounded" />
              <div className="h-3 w-24 bg-border/30 rounded" />
            </div>
          ))}
        </div>

        {/* 2-Column Chart Placeholders */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="p-6 rounded-2xl bg-surface border border-border shadow-xs space-y-4">
            <div className="h-5 w-48 bg-border/70 rounded" />
            <div className="h-48 bg-border/30 rounded-xl" />
          </div>
          <div className="p-6 rounded-2xl bg-surface border border-border shadow-xs space-y-4">
            <div className="h-5 w-48 bg-border/70 rounded" />
            <div className="h-48 bg-border/30 rounded-xl" />
          </div>
        </div>

        {/* Attainment Table Placeholder */}
        <div className="p-6 rounded-2xl bg-surface border border-border shadow-xs space-y-4">
          <div className="h-5 w-56 bg-border/70 rounded" />
          <div className="space-y-3">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-12 bg-border/30 rounded-lg" />
            ))}
          </div>
        </div>
      </div>
    </AppShell>
  );
}
