/** ERP platform composed from village books. No invented ₹. */

import { nestedRemaining, atlasScore } from "./atlas.ts";
import { remainingAfterCommit } from "./kernel.ts";
import type {
  BooksSnapshot,
  CellRow,
  InputRow,
  JournalRow,
  LotRow,
  OrderRow,
  PayoutRow,
  ReceiptRow,
} from "./types.ts";

export type AccountLine = {
  account: string;
  organId: string;
  debitPaise: number;
  creditPaise: number;
  netPaise: number;
};

export type CellStatement = {
  cellId: string;
  name: string;
  household: string;
  harvestGrams: number;
  remainingGrams: number;
  farmgatePaise: number;
  inputPaise: number;
  payoutPaise: number;
  netPaise: number;
};

export type FpoPnl = {
  grossPaise: number;
  freightPaise: number;
  farmgatePaise: number;
  inputPaise: number;
  netToCellsPaise: number;
};

export type PlatformException = {
  code: string;
  severity: "block" | "defer" | "note";
  title: string;
  body: string;
  href: string;
  impact: "cell" | "lot" | "journal" | "policy";
  owner: "clerk" | "companion" | "spine";
  action: string;
};

export type ProcessKind = "drying" | "milling" | "cleaning" | "grading";

export type DocumentKind = "harvest" | "warehouse" | "offtake" | "settle" | "process" | "statement";

export type DocumentRow = {
  id: string;
  kind: DocumentKind;
  refId: string;
  cellId: string | null;
  lotId: string | null;
  title: string;
  body: string;
  createdAt: string;
};

export type ProcessRow = {
  id: string;
  lotId: string;
  kind: ProcessKind;
  inGrams: number;
  lossGrams: number;
  outGrams: number;
  note: string;
  createdAt: string;
};

export type SeasonRow = {
  id: string;
  name: string;
  village: string;
  status: "open" | "closed";
};

export function processMass(remainingGrams: number, lossGrams: number): { saleableGrams: number } {
  if (lossGrams < 0) throw new Error("Declared loss cannot be negative.");
  return { saleableGrams: remainingAfterCommit(remainingGrams, lossGrams) };
}

export function trialBalance(journal: JournalRow[]): AccountLine[] {
  const map = new Map<string, AccountLine>();
  for (const line of journal) {
    const key = `${line.account}::${line.organId}`;
    const row = map.get(key) ?? {
      account: line.account,
      organId: line.organId,
      debitPaise: 0,
      creditPaise: 0,
      netPaise: 0,
    };
    if (line.side === "debit") row.debitPaise += line.amountPaise;
    else row.creditPaise += line.amountPaise;
    row.netPaise = row.debitPaise - row.creditPaise;
    map.set(key, row);
  }
  return [...map.values()].sort((a, b) => a.account.localeCompare(b.account));
}

export function cellStatements(
  cells: CellRow[],
  journal: JournalRow[],
  inputs: InputRow[],
  payouts: PayoutRow[],
): CellStatement[] {
  return cells.map((c) => {
    const farmgatePaise = journal
      .filter((j) => j.cellId === c.id && j.account === "farmgate" && j.side === "credit")
      .reduce((n, j) => n + j.amountPaise, 0);
    const inputPaise = inputs.filter((i) => i.cellId === c.id).reduce((n, i) => n + i.amountPaise, 0);
    const payoutPaise = payouts.filter((p) => p.cellId === c.id).reduce((n, p) => n + p.amountPaise, 0);
    return {
      cellId: c.id,
      name: c.name,
      household: c.household,
      harvestGrams: c.kgOnBooks,
      remainingGrams: c.remainingGrams,
      farmgatePaise,
      inputPaise,
      payoutPaise,
      netPaise: farmgatePaise - inputPaise,
    };
  });
}

export function fpoPnl(journal: JournalRow[], inputs: InputRow[]): FpoPnl {
  const grossPaise = journal.filter((j) => j.account === "cash" && j.side === "debit").reduce((n, j) => n + j.amountPaise, 0);
  const freightPaise = journal.filter((j) => j.account === "freight" && j.side === "credit").reduce((n, j) => n + j.amountPaise, 0);
  const farmgatePaise = journal.filter((j) => j.account === "farmgate" && j.side === "credit").reduce((n, j) => n + j.amountPaise, 0);
  const inputPaise = inputs.reduce((n, i) => n + i.amountPaise, 0);
  return {
    grossPaise,
    freightPaise,
    farmgatePaise,
    inputPaise,
    netToCellsPaise: farmgatePaise - inputPaise,
  };
}

export function exceptions(input: {
  journalBalanced: boolean;
  lots: LotRow[];
  receipts: ReceiptRow[];
  orders: OrderRow[];
  payouts: PayoutRow[];
}): PlatformException[] {
  const out: PlatformException[] = [];
  if (!input.journalBalanced) {
    out.push({
      code: "G1",
      severity: "block",
      title: "Journal does not balance",
      body: "Cash in must equal farmgate + freight. Do not close the season.",
      href: "/ledger",
      impact: "journal",
      owner: "clerk",
      action: "Open the ledger. Do not invent a balancing line.",
    });
  }
  const open = input.orders.filter((o) => o.status === "open");
  if (open.length) {
    out.push({
      code: "G2",
      severity: "defer",
      title: `${open.length} offtake${open.length === 1 ? "" : "s"} wait on paymentRef`,
      body: "An offtake stays open until a clerk names the payment.",
      href: "/trade",
      impact: "cell",
      owner: "clerk",
      action: "Name paymentRef. Companion will not invent one.",
    });
  }
  const pending = input.payouts.filter((p) => p.status === "pending");
  if (pending.length) {
    out.push({
      code: "G3",
      severity: "defer",
      title: `${pending.length} FPO payout${pending.length === 1 ? "" : "s"} pending`,
      body: "Qty-weighted split is posted. The cell has not been marked paid.",
      href: "/trade",
      impact: "cell",
      owner: "clerk",
      action: "Mark the cell paid after the split posts.",
    });
  }
  const pledged = input.receipts.filter((r) => r.status === "pledged");
  if (pledged.length) {
    out.push({
      code: "G4",
      severity: "block",
      title: `${pledged.length} pledged receipt${pledged.length === 1 ? "" : "s"}`,
      body: "Clear the lien before the sack may sell.",
      href: "/warehouse",
      impact: "lot",
      owner: "clerk",
      action: "Clear the lien. Do not sell a pledged sack.",
    });
  }
  const waitingGodown = input.lots.filter((l) => l.status === "minted" && l.remainingGrams > 0);
  if (waitingGodown.length) {
    out.push({
      code: "G5",
      severity: "note",
      title: `${waitingGodown.length} minted lot${waitingGodown.length === 1 ? "" : "s"} not in the godown`,
      body: "The harvest named a cell. The same body has not inwards.",
      href: "/lots",
      impact: "lot",
      owner: "companion",
      action: "Propose intake. Clerk approves the same lot body.",
    });
  }
  out.push({
    code: "G9",
    severity: "note",
    title: "AI cannot write rupees",
    body: "Module OS may propose. A clerk declares price, freight, and loss.",
    href: "/modules",
    impact: "policy",
    owner: "spine",
    action: "Keep the firewall. No rupee write from AI.",
  });
  return out;
}

export function composePlatform(books: BooksSnapshot, extra: {
  season: SeasonRow | null;
  documents: DocumentRow[];
  processes: ProcessRow[];
}) {
  const tb = trialBalance(books.journal);
  const statements = cellStatements(books.cells, books.journal, books.inputs, books.payouts);
  const pnl = fpoPnl(books.journal, books.inputs);
  const gates = exceptions({
    journalBalanced: books.kpis.journalBalanced,
    lots: books.lots,
    receipts: books.receipts,
    orders: books.orders,
    payouts: books.payouts,
  });
  const nested = nestedRemaining(books.cells, books.lots, books.kitchen);
  const atlas = atlasScore();
  return {
    season: extra.season,
    trialBalance: tb,
    statements,
    pnl,
    exceptions: gates,
    documents: extra.documents,
    processes: extra.processes,
    blocking: gates.filter((g) => g.severity === "block").length,
    deferred: gates.filter((g) => g.severity === "defer").length,
    nested,
    atlas,
  };
}

export type PlatformView = ReturnType<typeof composePlatform>;
export type PlatformSnapshot = PlatformView & BooksSnapshot;
