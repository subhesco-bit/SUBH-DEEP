import { createFileRoute } from "@tanstack/react-router";
import { Shell } from "@/components/app/shell";
import { WarehouseBoard } from "@/components/erp/warehouse-board";

export const Route = createFileRoute("/warehouse")({ component: WarehousePage });

function WarehousePage() {
  return (
    <Shell>
      <main className="px-4 py-6 sm:px-6">
        <WarehouseBoard />
      </main>
    </Shell>
  );
}
