import { createFileRoute } from "@tanstack/react-router";
import { Shell } from "@/components/app/shell";
import { SystemsPanel } from "@/components/app/systems-panel";

export const Route = createFileRoute("/systems")({ component: SystemsPage });

function SystemsPage() {
  return (
    <Shell>
      <main className="px-4 py-6 sm:px-6">
        <SystemsPanel />
      </main>
    </Shell>
  );
}
