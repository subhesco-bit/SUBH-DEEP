/** Living agentic companion. Proposes. A clerk approves. Never writes ₹. */

import type { BooksSnapshot, LotRow, OrderRow } from "../erp/types.ts";
import type { PlatformException } from "../erp/platform.ts";
import { queryLibraryKnowledge } from "../library/match.ts";

export type CompanionAction = "intake" | "settle" | "process" | "harvest" | "consult";

export type CompanionProposal = {
  id: string;
  moduleId: "agentic" | "copilot" | "erp-agents" | "advisory";
  action: CompanionAction;
  title: string;
  body: string;
  href: string;
  organ: string;
  lotId: string | null;
  orderId: string | null;
  cellId: string | null;
  severity: "block" | "defer" | "note";
};

export type CompanionReading = {
  memory: string;
  next: string;
  proposals: CompanionProposal[];
  libraryHit: string | null;
  firewall: "AI cannot write rupees";
};

function lastSettled(orders: OrderRow[]): OrderRow | undefined {
  return orders.filter((o) => o.status === "settled").sort((a, b) => (b.settledAt ?? "").localeCompare(a.settledAt ?? ""))[0];
}

function mintedWaiting(lots: LotRow[]): LotRow[] {
  return lots.filter((l) => l.status === "minted" && l.remainingGrams > 0);
}

function openOfftake(orders: OrderRow[]): OrderRow[] {
  return orders.filter((o) => o.status === "open");
}

export function proposeCompanion(
  books: BooksSnapshot,
  gates: PlatformException[] = [],
): CompanionReading {
  const proposals: CompanionProposal[] = [];
  const settled = lastSettled(books.orders);
  const memory = settled
    ? `Last harvest on books: ${settled.cellName} · ${settled.variety} · paymentRef ${settled.paymentRef ?? "named"}${settled.hoursToPay != null ? ` · ${settled.hoursToPay}h to pay` : ""}.`
    : "No settled harvest yet. Magh is waiting on a clerk.";

  for (const order of openOfftake(books.orders)) {
    proposals.push({
      id: `settle-${order.id}`,
      moduleId: "agentic",
      action: "settle",
      title: `Settle ${order.cellName}'s offtake`,
      body: `${order.qtyGrams} g of ${order.variety} to ${order.buyer} waits on a paymentRef. The companion will not invent one.`,
      href: "/trade",
      organ: "orders",
      lotId: order.lotId,
      orderId: order.id,
      cellId: null,
      severity: "defer",
    });
  }

  for (const lot of mintedWaiting(books.lots)) {
    proposals.push({
      id: `intake-${lot.id}`,
      moduleId: "erp-agents",
      action: "intake",
      title: `Inward ${lot.variety} for ${lot.cellName}`,
      body: `${lot.remainingGrams} g still minted, not in the godown. Same lot body. Clerk approves intake.`,
      href: "/warehouse",
      organ: "warehouse",
      lotId: lot.id,
      orderId: null,
      cellId: lot.cellId,
      severity: "note",
    });
  }

  const idle = books.cells.filter((c) => c.lotCount === 0);
  for (const cell of idle.slice(0, 1)) {
    proposals.push({
      id: `harvest-${cell.id}`,
      moduleId: "agentic",
      action: "harvest",
      title: `Mint a harvest for ${cell.name}`,
      body: `${cell.household} is on the books with no lot. The companion proposes. The clerk declares kilograms.`,
      href: "/",
      organ: "lot",
      lotId: null,
      orderId: null,
      cellId: cell.id,
      severity: "note",
    });
  }

  const processable = books.lots.filter((l) => l.remainingGrams > 0 && l.status !== "pledged" && l.status !== "settled");
  if (processable[0] && !proposals.some((p) => p.action === "process")) {
    const lot = processable[0];
    proposals.push({
      id: `process-${lot.id}`,
      moduleId: "copilot",
      action: "process",
      title: `Declare process loss on ${lot.variety}`,
      body: `${lot.remainingGrams} g remains on the same body. Drying or milling loss is declared — never guessed.`,
      href: "/platform",
      organ: "lot",
      lotId: lot.id,
      orderId: null,
      cellId: lot.cellId,
      severity: "note",
    });
  }

  const weather = gates.find((g) => g.code === "G9");
  proposals.push({
    id: "consult-firewall",
    moduleId: "advisory",
    action: "consult",
    title: "Consult the library, not a second brain",
    body: weather?.body ?? "AI may propose the next gate. A clerk declares price, freight, and loss.",
    href: "/library",
    organ: "ai",
    lotId: null,
    orderId: null,
    cellId: null,
    severity: "note",
  });

  const ranked = proposals.slice(0, 5);
  const next = ranked[0]?.title ?? "Next keystroke lives on the books.";
  const hits = queryLibraryKnowledge("agentic companion harvest lot remaining rupees", { limit: 1 });
  return {
    memory,
    next: `Companion · ${next}`,
    proposals: ranked,
    libraryHit: hits[0]?.title ?? null,
    firewall: "AI cannot write rupees",
  };
}
