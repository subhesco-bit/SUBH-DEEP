/** Evidence passport. Every lot carries provenance. Missing stays absent — never invented. */

import { journalBalances } from "../erp/kernel.ts";
import type { BooksSnapshot, LotRow } from "../erp/types.ts";
import type { EvidenceAtom, EvidencePassport } from "./types.ts";

export function evidencePassport(lot: LotRow, books: BooksSnapshot): EvidencePassport {
  const receipts = books.receipts.filter((r) => r.lotId === lot.id);
  const orders = books.orders.filter((o) => o.lotId === lot.id);
  const gi = books.giChain?.filter((g) => g.lotId === lot.id) ?? [];
  const lines = books.journal.filter((j) => j.lotId === lot.id || j.memo.includes(lot.variety));
  const atoms: EvidenceAtom[] = [
    atom("lot", lot.id, "erp_lots.id", "declared"),
    atom("cell", lot.cellName, "erp_cells", "declared"),
    atom("mass", `${lot.grams} g minted`, "erp_lots.grams", "declared"),
    atom("remaining", `${lot.remainingGrams} g`, "erp_lots.remaining_grams", "calculated"),
    atom("gi", lot.giMarker ?? "none", "erp_lots.gi_marker", lot.giMarker ? "declared" : "absent"),
    atom("gi-mint", lot.giMinted ? `${gi.length} mint(s)` : "unminted", "erp_gi_chain", lot.giMinted ? "declared" : "absent"),
    atom("cover", lot.policyId ?? "gap", "erp_lots.policy_id", lot.coverStatus === "bound" ? "declared" : "absent"),
    atom("godown", receipts[0]?.facility ?? "not inward", "erp_receipts", receipts.length ? "declared" : "absent"),
    atom("paymentRef", orders.map((o) => o.paymentRef).filter(Boolean).join(" ") || "none", "erp_orders.payment_ref", orders.some((o) => o.paymentRef) ? "declared" : "absent"),
    atom("journal", journalBalances(lines) ? "balanced" : lines.length ? "unbalanced or empty" : "no lines", "erp_journal", lines.length ? "calculated" : "absent"),
  ];
  const needed = ["lot", "cell", "mass", "remaining"];
  const complete = needed.every((k) => atoms.find((a) => a.kind === k)?.confidence !== "absent");
  return { lotId: lot.id, variety: lot.variety, remainingGrams: lot.remainingGrams, atoms, complete };
}

function atom(kind: string, value: string, source: string, confidence: EvidenceAtom["confidence"]): EvidenceAtom {
  return { kind, value, source, confidence };
}

export function passportsFor(books: BooksSnapshot): EvidencePassport[] {
  return books.lots.map((lot) => evidencePassport(lot, books));
}
