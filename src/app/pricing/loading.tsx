import { AppShell } from "@/components/AppShell";

export default function PricingLoading() {
  return (
    <AppShell>
      <div className="max-w-6xl mx-auto space-y-10 animate-pulse py-4">
        {/* Header */}
        <div className="text-center space-y-3 max-w-2xl mx-auto">
          <div className="h-9 w-72 bg-border/80 rounded mx-auto" />
          <div className="h-4 w-96 max-w-full bg-border/40 rounded mx-auto" />
        </div>

        {/* 3 Pricing Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {[1, 2, 3].map((i) => (
            <div key={i} className="p-8 rounded-2xl bg-surface border border-border shadow-xs space-y-6 flex flex-col justify-between">
              <div className="space-y-4">
                <div className="h-5 w-32 bg-border/60 rounded" />
                <div className="h-10 w-28 bg-border/80 rounded" />
                <div className="h-4 w-full bg-border/40 rounded" />
                <div className="space-y-2.5 pt-4">
                  {[1, 2, 3, 4].map((j) => (
                    <div key={j} className="flex items-center gap-2">
                      <div className="w-4 h-4 rounded-full bg-border/50 shrink-0" />
                      <div className="h-3 w-5/6 bg-border/40 rounded" />
                    </div>
                  ))}
                </div>
              </div>
              <div className="h-11 w-full bg-border/60 rounded-xl mt-6" />
            </div>
          ))}
        </div>
      </div>
    </AppShell>
  );
}
