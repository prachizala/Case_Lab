"use client";

import { useEffect } from "react";
import { AppShell } from "@/components/AppShell";
import { StateError } from "@/components/StateError";

export default function TrendingError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Trending cases error:", error);
  }, [error]);

  return (
    <AppShell>
      <div className="max-w-4xl mx-auto py-12">
        <StateError
          title="Failed to Load Trending Cases"
          message={error.message || "An unexpected error occurred while loading approved cases."}
          onRetry={reset}
          backHref="/library"
          backText="Return to Case Library"
        />
      </div>
    </AppShell>
  );
}
