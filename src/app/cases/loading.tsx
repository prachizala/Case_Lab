import { AppShell } from "@/components/AppShell";
import { StateLoading } from "@/components/StateLoading";

export default function CasesLoading() {
  return (
    <AppShell>
      <div className="max-w-6xl mx-auto py-8">
        <StateLoading
          title="Loading Case Library..."
          subtitle="Cataloging executive cases, flash simulations, and multilingual curricula."
        />
      </div>
    </AppShell>
  );
}
