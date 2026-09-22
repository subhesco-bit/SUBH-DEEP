import { createFileRoute } from "@tanstack/react-router";
import { Shell } from "@/components/app/shell";
import { FlowBoard } from "@/components/app/flow-board";

export const Route = createFileRoute("/flows")({
  component: FlowsPage,
});

function FlowsPage() {
  return (
    <Shell>
      <main className="px-4 py-6 sm:px-6">
        <FlowBoard />
      </main>
    </Shell>
  );
}
