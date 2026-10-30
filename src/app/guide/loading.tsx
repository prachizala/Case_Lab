import { AppShell } from "@/components/AppShell";

export default function GuideLoading() {
  return (
    <AppShell>
      <div className="space-y-8 animate-pulse">
        {/* Header Skeleton */}
        <div className="pb-6 border-b border-border space-y-3">
          <div className="h-8 w-80 bg-border/80 rounded" />
          <div className="h-4 w-96 max-w-full bg-border/40 rounded" />
          <div className="flex gap-2 pt-2">
            <div className="h-9 w-36 bg-border/50 rounded-xl" />
            <div className="h-9 w-36 bg-border/40 rounded-xl" />
            <div className="h-9 w-36 bg-border/40 rounded-xl" />
          </div>
        </div>

        {/* 2-Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content Area */}
          <div className="lg:col-span-2 space-y-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="p-6 rounded-2xl bg-surface border border-border shadow-xs space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-border/50" />
                  <div className="h-6 w-52 bg-border/70 rounded" />
                </div>
                <div className="space-y-2">
                  <div className="h-3.5 w-full bg-border/40 rounded" />
                  <div className="h-3.5 w-5/6 bg-border/40 rounded" />
                  <div className="h-3.5 w-4/6 bg-border/30 rounded" />
                </div>
              </div>
            ))}
          </div>

          {/* Right Assistant Sidebar */}
          <div className="space-y-4">
            <div className="p-6 rounded-2xl bg-surface border border-border shadow-xs h-[480px] flex flex-col justify-between">
              <div className="space-y-4">
                <div className="h-5 w-40 bg-border/60 rounded" />
                <div className="p-4 rounded-xl bg-border/20 space-y-2">
                  <div className="h-3 w-full bg-border/40 rounded" />
                  <div className="h-3 w-4/5 bg-border/30 rounded" />
                </div>
              </div>
              <div className="h-10 w-full bg-border/40 rounded-xl" />
            </div>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
