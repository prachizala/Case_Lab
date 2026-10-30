"use client";

import { useEffect } from "react";
import { StateError } from "@/components/StateError";
import { AppShell } from "@/components/AppShell";

export default function CaseViewError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Case View Error:", error);
  }, [error]);

  return (
    <AppShell>
      <div className="max-w-4xl mx-auto py-12">
        <StateError
          title="Case Dossier Render Failure"
          message={error.message || "Structured case data was malformed or failed to load. Click below to retry parsing."}
          onRetry={reset}
          backHref="/cases"
          backText="Return to Case Library"
        />
      </div>
    </AppShell>
  );
}
