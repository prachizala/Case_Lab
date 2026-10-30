"use client";

import { AppShell } from "@/components/AppShell";
import { StateError } from "@/components/StateError";

export default function ReviewQueueError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <AppShell>
      <div className="max-w-4xl mx-auto py-12">
        <StateError
          title="Review Queue Unavailable"
          message={error.message || "An error occurred while loading the curriculum review queue."}
          onRetry={reset}
          backHref="/dashboard"
          backText="Return to Dashboard"
        />
      </div>
    </AppShell>
  );
}
