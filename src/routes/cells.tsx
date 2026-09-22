import { createFileRoute } from "@tanstack/react-router";
import { Shell } from "@/components/app/shell";
import { CellsBoard } from "@/components/erp/cells-board";

export const Route = createFileRoute("/cells")({ component: CellsPage });

function CellsPage() {
  return (
    <Shell>
      <main className="px-4 py-6 sm:px-6">
        <CellsBoard />
      </main>
    </Shell>
  );
}
