import { createFileRoute } from "@tanstack/react-router";
import { Shell } from "@/components/app/shell";
import { EconomyPanel } from "@/components/app/economy-panel";

export const Route = createFileRoute("/economy")({
  component: EconomyPage,
});

function EconomyPage() {
  return (
    <Shell>
      <main className="px-4 py-6 sm:px-6">
        <EconomyPanel />
      </main>
    </Shell>
  );
}
