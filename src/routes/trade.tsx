import { createFileRoute } from "@tanstack/react-router";
import { Shell } from "@/components/app/shell";
import { TradeBoard } from "@/components/erp/trade-board";

export const Route = createFileRoute("/trade")({ component: TradePage });

function TradePage() {
  return (
    <Shell>
      <main className="px-4 py-6 sm:px-6">
        <TradeBoard />
      </main>
    </Shell>
  );
}
