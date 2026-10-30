"use client";

import { useEffect } from "react";
import { StateError } from "@/components/StateError";
import { AppShell } from "@/components/AppShell";

export default function DashboardError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Dashboard Error:", error);
  }, [error]);

  return (
    <AppShell>
      <div className="max-w-4xl mx-auto py-12">
        <StateError
          title="Dashboard Compilation Error"
          message={error.message || "Failed to load dashboard metrics."}
          onRetry={reset}
          backHref="/cases"
          backText="Go to Case Library"
        />
      </div>
    </AppShell>
  );
}
