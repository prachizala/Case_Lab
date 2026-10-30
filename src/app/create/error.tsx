"use client";

import { useEffect } from "react";
import { StateError } from "@/components/StateError";
import { AppShell } from "@/components/AppShell";

export default function CreateError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Case Creation Error:", error);
  }, [error]);

  return (
    <AppShell>
      <div className="max-w-4xl mx-auto py-12">
        <StateError
          title="Case Studio Initialization Failed"
          message={error.message || "An unexpected error occurred while loading the case creation engine."}
          onRetry={reset}
          backHref="/dashboard"
          backText="Back to Dashboard"
        />
      </div>
    </AppShell>
  );
}
