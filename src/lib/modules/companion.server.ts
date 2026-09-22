import { ensureBooks } from "@/lib/erp/boot.server";
import { exceptions } from "@/lib/erp/platform";
import { proposeCompanion, type CompanionReading } from "./companion";

export async function readCompanion(): Promise<CompanionReading> {
  const books = await ensureBooks();
  const gates = exceptions({
    journalBalanced: books.kpis.journalBalanced,
    lots: books.lots,
    receipts: books.receipts,
    orders: books.orders,
    payouts: books.payouts,
  });
  return proposeCompanion(books, gates);
}
