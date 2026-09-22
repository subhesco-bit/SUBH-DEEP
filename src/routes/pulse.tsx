import { createFileRoute } from "@tanstack/react-router";
import { Shell } from "@/components/app/shell";
import { PulseWalk } from "@/components/app/pulse-walk";

export const Route = createFileRoute("/pulse")({ component: PulsePage });

function PulsePage() {
  return (
    <Shell>
      <main className="px-4 py-6 sm:px-6">
        <PulseWalk />
      </main>
    </Shell>
  );
}
