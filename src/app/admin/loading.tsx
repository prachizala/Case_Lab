import { AppShell } from "@/components/AppShell";

export default function AdminLoading() {
  return (
    <AppShell>
      <div className="space-y-8 animate-pulse">
        {/* Header Skeleton */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-border">
          <div>
            <div className="h-8 w-80 bg-border/80 rounded" />
            <div className="h-4 w-96 max-w-full bg-border/40 rounded mt-2" />
          </div>
          <div className="flex gap-2">
            <div className="h-10 w-32 bg-border/50 rounded-xl" />
          </div>
        </div>

        {/* Tab Switcher Skeleton */}
        <div className="flex flex-wrap gap-2 border-b border-border pb-3">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="h-9 w-28 bg-border/40 rounded-lg" />
          ))}
        </div>

        {/* Search & Actions Bar */}
        <div className="p-4 rounded-xl bg-surface border border-border shadow-xs flex flex-col md:flex-row gap-4 items-center justify-between">
          <div className="h-10 w-full md:w-80 bg-border/40 rounded-lg" />
          <div className="flex gap-2 w-full md:w-auto">
            <div className="h-10 w-36 bg-border/40 rounded-lg" />
            <div className="h-10 w-28 bg-border/40 rounded-lg" />
          </div>
        </div>

        {/* Table Skeleton */}
        <div className="p-6 rounded-2xl bg-surface border border-border shadow-xs space-y-4">
          <div className="h-6 w-48 bg-border/70 rounded mb-4" />
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="flex items-center justify-between py-3 border-b border-border/30 last:border-0">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-border/40" />
                <div className="space-y-1.5">
                  <div className="h-4 w-36 bg-border/60 rounded" />
                  <div className="h-3 w-48 bg-border/30 rounded" />
                </div>
              </div>
              <div className="h-6 w-20 bg-border/40 rounded-full" />
              <div className="h-8 w-24 bg-border/40 rounded-lg" />
            </div>
          ))}
        </div>
      </div>
    </AppShell>
  );
}
