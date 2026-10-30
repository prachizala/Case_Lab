"use client";

import { useEffect } from "react";
import { StateError } from "@/components/StateError";
import { AppShell } from "@/components/AppShell";

export default function AdminError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Admin Error:", error);
  }, [error]);

  return (
    <AppShell>
      <div className="max-w-4xl mx-auto py-12">
        <StateError
          title="Administrative Portal Error"
          message={error.message || "Failed to load administration dataset."}
          onRetry={reset}
          backHref="/dashboard"
          backText="Return to Dashboard"
        />
      </div>
    </AppShell>
  );
}
