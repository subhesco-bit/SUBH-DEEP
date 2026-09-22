import { createFileRoute } from "@tanstack/react-router";
import { Shell } from "@/components/app/shell";
import { LotsBoard } from "@/components/erp/lots-board";

export const Route = createFileRoute("/lots")({ component: LotsPage });

function LotsPage() {
  return (
    <Shell>
      <main className="px-4 py-6 sm:px-6">
        <LotsBoard />
      </main>
    </Shell>
  );
}
