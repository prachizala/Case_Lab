import { AppShell } from "@/components/AppShell";

export default function DashboardLoading() {
  return (
    <AppShell>
      <div className="space-y-8 animate-pulse">
        {/* Banner Skeleton */}
        <div className="p-8 rounded-2xl bg-surface border border-border shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-3">
            <div className="h-4 w-32 bg-border/60 rounded" />
            <div className="h-8 w-72 bg-border/80 rounded" />
            <div className="h-4 w-96 max-w-full bg-border/40 rounded" />
          </div>
          <div className="flex gap-3">
            <div className="h-10 w-32 bg-border/60 rounded-xl" />
            <div className="h-10 w-32 bg-border/40 rounded-xl" />
          </div>
        </div>

        {/* 4 Stat Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="p-5 rounded-xl bg-surface border border-border shadow-xs space-y-3">
              <div className="flex items-center justify-between">
                <div className="h-3 w-24 bg-border/50 rounded" />
                <div className="w-8 h-8 rounded-lg bg-border/40" />
              </div>
              <div className="h-7 w-16 bg-border/80 rounded" />
              <div className="h-3 w-32 bg-border/40 rounded" />
            </div>
          ))}
        </div>

        {/* 2-Column Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main List */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center justify-between">
              <div className="h-6 w-40 bg-border/70 rounded" />
              <div className="h-4 w-20 bg-border/40 rounded" />
            </div>
            {[1, 2, 3].map((i) => (
              <div key={i} className="p-5 rounded-xl bg-surface border border-border shadow-xs space-y-3">
                <div className="flex gap-2">
                  <div className="h-5 w-20 bg-border/60 rounded-full" />
                  <div className="h-5 w-28 bg-border/40 rounded-full" />
                </div>
                <div className="h-5 w-3/4 bg-border/80 rounded" />
                <div className="h-3 w-full bg-border/40 rounded" />
                <div className="h-3 w-2/3 bg-border/30 rounded" />
              </div>
            ))}
          </div>

          {/* Right Sidebar */}
          <div className="space-y-4">
            <div className="h-6 w-36 bg-border/70 rounded" />
            <div className="p-5 rounded-xl bg-surface border border-border shadow-xs space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="space-y-2 pb-3 border-b border-border/40 last:border-0 last:pb-0">
                  <div className="h-4 w-24 bg-border/60 rounded" />
                  <div className="h-4 w-full bg-border/70 rounded" />
                  <div className="h-3 w-1/2 bg-border/40 rounded" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
