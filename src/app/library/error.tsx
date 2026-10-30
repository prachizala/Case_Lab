"use client";

import { useEffect } from "react";
import { AppShell } from "@/components/AppShell";
import { StateError } from "@/components/StateError";

export default function LibraryError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Library page error:", error);
  }, [error]);

  return (
    <AppShell>
      <div className="max-w-4xl mx-auto py-12">
        <StateError
          title="Case Library Encountered an Error"
          message={error.message || "Failed to query the repository. Please verify your connection or try again."}
          onRetry={reset}
          backHref="/dashboard"
          backText="Return to Dashboard"
        />
      </div>
    </AppShell>
  );
}
