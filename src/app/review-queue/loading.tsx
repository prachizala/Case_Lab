import { AppShell } from "@/components/AppShell";
import { StateLoading } from "@/components/StateLoading";

export default function ReviewQueueLoading() {
  return (
    <AppShell>
      <div className="py-12">
        <StateLoading
          title="Loading Curriculum Review Queue..."
          subtitle="Fetching peer review submissions, reviewer feedback, and audit trails."
        />
      </div>
    </AppShell>
  );
}
