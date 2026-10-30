import { AppShell } from "@/components/AppShell";

export default function CreateLoading() {
  return (
    <AppShell>
      <div className="space-y-8 animate-pulse">
        {/* Header Skeleton */}
        <div className="space-y-3 pb-6 border-b border-border">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="h-8 w-64 bg-border/80 rounded" />
              <div className="h-4 w-96 max-w-full bg-border/40 rounded mt-2" />
            </div>
            <div className="flex gap-2">
              <div className="h-9 w-28 bg-border/50 rounded-xl" />
              <div className="h-9 w-28 bg-border/40 rounded-xl" />
            </div>
          </div>
        </div>

        {/* 2-Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Form Fields */}
          <div className="lg:col-span-2 space-y-6">
            {/* Format toggle card */}
            <div className="p-6 rounded-2xl bg-surface border border-border shadow-xs space-y-4">
              <div className="h-5 w-44 bg-border/70 rounded" />
              <div className="grid grid-cols-2 gap-4">
                <div className="h-20 bg-border/40 rounded-xl" />
                <div className="h-20 bg-border/40 rounded-xl" />
              </div>
            </div>

            {/* Industry selector */}
            <div className="p-6 rounded-2xl bg-surface border border-border shadow-xs space-y-4">
              <div className="h-5 w-48 bg-border/70 rounded" />
              <div className="flex flex-wrap gap-2">
                {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
                  <div key={i} className="h-8 w-28 bg-border/40 rounded-full" />
                ))}
              </div>
            </div>

            {/* Course & outcomes */}
            <div className="p-6 rounded-2xl bg-surface border border-border shadow-xs space-y-4">
              <div className="h-5 w-40 bg-border/70 rounded" />
              <div className="grid grid-cols-2 gap-4">
                <div className="h-10 bg-border/40 rounded-xl" />
                <div className="h-10 bg-border/40 rounded-xl" />
              </div>
              <div className="h-24 bg-border/30 rounded-xl" />
            </div>
          </div>

          {/* Blueprint Sidebar */}
          <div className="space-y-6">
            <div className="p-6 rounded-2xl bg-surface border border-border shadow-xs space-y-4">
              <div className="h-5 w-48 bg-border/70 rounded" />
              <div className="h-3 w-full bg-border/40 rounded" />
              <div className="space-y-3 pt-2">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="flex justify-between items-center py-2 border-b border-border/30 last:border-0">
                    <div className="h-3 w-24 bg-border/50 rounded" />
                    <div className="h-3 w-20 bg-border/60 rounded" />
                  </div>
                ))}
              </div>
              <div className="h-11 w-full bg-border/60 rounded-xl mt-4" />
            </div>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
