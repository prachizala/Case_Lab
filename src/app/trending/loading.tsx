import { AppShell } from "@/components/AppShell";

export default function TrendingLoading() {
  return (
    <AppShell>
      <div className="space-y-8 animate-pulse">
        {/* Header Skeleton */}
        <div className="pb-6 border-b border-border space-y-3">
          <div className="h-8 w-80 bg-border/80 rounded" />
          <div className="h-4 w-96 max-w-full bg-border/40 rounded" />
        </div>

        {/* Difficulty Brackets & Filter Bar */}
        <div className="space-y-4">
          <div className="flex flex-wrap gap-2">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-9 w-44 bg-border/40 rounded-xl" />
            ))}
          </div>
          <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
            <div className="h-10 w-full sm:w-80 bg-border/40 rounded-lg" />
            <div className="h-10 w-44 bg-border/40 rounded-lg" />
          </div>
        </div>

        {/* Grid of Trending Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="p-6 rounded-2xl bg-surface border border-border shadow-xs space-y-4">
              <div className="flex justify-between items-center">
                <div className="h-5 w-24 bg-border/60 rounded-full" />
                <div className="h-5 w-16 bg-border/40 rounded-full" />
              </div>
              <div className="h-6 w-3/4 bg-border/80 rounded" />
              <div className="space-y-2">
                <div className="h-3 w-full bg-border/40 rounded" />
                <div className="h-3 w-4/5 bg-border/30 rounded" />
              </div>
              <div className="pt-4 border-t border-border/40 flex justify-between items-center">
                <div className="h-4 w-28 bg-border/40 rounded" />
                <div className="h-4 w-14 bg-border/50 rounded" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </AppShell>
  );
}
