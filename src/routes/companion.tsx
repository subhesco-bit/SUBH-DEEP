import { createFileRoute } from "@tanstack/react-router";
import { Shell } from "@/components/app/shell";
import { CompanionPanel } from "@/components/app/companion-panel";
import { useVillageBooks } from "@/components/erp/books-boot";
import { exceptions } from "@/lib/erp/platform";
import { proposeCompanion } from "@/lib/modules/companion";

export const Route = createFileRoute("/companion")({
  component: CompanionPage,
});

function CompanionPage() {
  const books = useVillageBooks();
  const reading = books
    ? proposeCompanion(
        books,
        exceptions({
          journalBalanced: books.kpis.journalBalanced,
          lots: books.lots,
          receipts: books.receipts,
          orders: books.orders,
          payouts: books.payouts,
        }),
      )
    : null;

  return (
    <Shell>
      <main className="px-4 py-6 sm:px-6">
        <CompanionPanel reading={reading} />
      </main>
    </Shell>
  );
}
