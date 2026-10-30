"use client";

import { useEffect } from "react";
import { StateError } from "@/components/StateError";
import { AppShell } from "@/components/AppShell";

export default function CasesError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Case Library Error:", error);
  }, [error]);

  return (
    <AppShell>
      <div className="max-w-4xl mx-auto py-12">
        <StateError
          title="Case Library Retrieval Failure"
          message={error.message || "Failed to retrieve case studies from repository."}
          onRetry={reset}
          backHref="/dashboard"
          backText="Return to Dashboard"
        />
      </div>
    </AppShell>
  );
}
