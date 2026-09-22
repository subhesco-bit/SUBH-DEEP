import { createFileRoute } from "@tanstack/react-router";
import { Shell } from "@/components/app/shell";
import { ModulesPanel } from "@/components/app/modules-panel";

export const Route = createFileRoute("/modules")({ component: ModulesPage });

function ModulesPage() {
  return (
    <Shell>
      <main className="px-4 py-6 sm:px-6">
        <ModulesPanel />
      </main>
    </Shell>
  );
}
