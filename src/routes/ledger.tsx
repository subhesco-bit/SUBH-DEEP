import { createFileRoute } from "@tanstack/react-router";
import { Shell } from "@/components/app/shell";
import { LedgerBoard } from "@/components/erp/ledger-board";

export const Route = createFileRoute("/ledger")({ component: LedgerPage });

function LedgerPage() {
  return (
    <Shell>
      <main className="px-4 py-6 sm:px-6">
        <LedgerBoard />
      </main>
    </Shell>
  );
}
