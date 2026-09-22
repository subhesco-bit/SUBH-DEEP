/** Pure rural-ERP bone. No SQL. Mass is grams; money is paise. */

import { paiseFromKgPrice } from "./money.ts";

export const DEFAULT_FREIGHT_PAISE_PER_KG = 400; // declared ₹4 / kg

export type JournalDraft = {
  organId: string;
  account: string;
  side: "debit" | "credit";
  amountPaise: number;
  memo: string;
};

export function remainingAfterCommit(mintedGrams: number, committedGrams: number): number {
  if (mintedGrams < 0 || committedGrams < 0) throw new Error("Mass cannot be negative.");
  const left = mintedGrams - committedGrams;
  if (left < 0) throw new Error("Committed mass exceeds the lot body.");
  return left;
}

export function assertCanSell(status: string, pledgedCount: number): void {
  if (status === "pledged" || pledgedCount > 0) {
    throw new Error("Pledged receipts cannot sell until the lien is cleared.");
  }
  if (status === "settled") {
    throw new Error("Settled lot has already left the books as stock.");
  }
}

export function settlementAmounts(
  qtyGrams: number,
  pricePaisePerKg: number,
  freightPaisePerKg: number,
): { gross: number; freight: number; farmgate: number } {
  if (qtyGrams <= 0) throw new Error("Declared quantity is required.");
  if (pricePaisePerKg <= 0) throw new Error("salePricePerUnit is required — never invented.");
  if (freightPaisePerKg < 0) throw new Error("Freight must be declared as zero or more.");
  const gross = paiseFromKgPrice(qtyGrams, pricePaisePerKg);
  const freight = paiseFromKgPrice(qtyGrams, freightPaisePerKg);
  if (freight > gross) throw new Error("Declared freight exceeds declared sale.");
  return { gross, freight, farmgate: gross - freight };
}

export function settlementJournal(input: {
  variety: string;
  hoursToPay: number;
  gross: number;
  freight: number;
  farmgate: number;
}): JournalDraft[] {
  return [
    {
      organId: "rupee",
      account: "cash",
      side: "debit",
      amountPaise: input.gross,
      memo: `Settled ${input.variety} @ declared price`,
    },
    {
      organId: "rupee",
      account: "farmgate",
      side: "credit",
      amountPaise: input.farmgate,
      memo: `Farmgate to cell · ${input.hoursToPay}h to pay`,
    },
    {
      organId: "logistics",
      account: "freight",
      side: "credit",
      amountPaise: input.freight,
      memo: "Freight deduction, declared",
    },
  ];
}

export function inputJournal(kind: string, amountPaise: number, memo: string, organId: string): JournalDraft[] {
  return [
    { organId, account: kind, side: "debit", amountPaise, memo },
    { organId: "rupee", account: "cash", side: "credit", amountPaise, memo },
  ];
}

export function journalBalances(lines: { side: "debit" | "credit"; amountPaise: number }[]): boolean {
  const debit = lines.filter((l) => l.side === "debit").reduce((n, l) => n + l.amountPaise, 0);
  const credit = lines.filter((l) => l.side === "credit").reduce((n, l) => n + l.amountPaise, 0);
  return debit === credit;
}

export function allocateFifo(
  lots: { id: string; remainingGrams: number }[],
  wantGrams: number,
): { lotId: string; qtyGrams: number }[] {
  if (wantGrams <= 0) throw new Error("Declared quantity is required.");
  const out: { lotId: string; qtyGrams: number }[] = [];
  let left = wantGrams;
  for (const lot of lots) {
    if (left <= 0) break;
    if (lot.remainingGrams <= 0) continue;
    const take = Math.min(lot.remainingGrams, left);
    out.push({ lotId: lot.id, qtyGrams: take });
    left -= take;
  }
  if (left > 0) throw new Error("Not enough remaining mass in the godown.");
  return out;
}

export type CostedLot = {
  id: string;
  remainingGrams: number;
  /** Declared remaining cost of this body. Required — never invented. */
  costPaise: number;
};

/**
 * Weighted average cost in paise per kg.
 * Only when every lot in the pool carries a declared remaining cost.
 * Identity of the sack stays FIFO; WAC blends the rupee, not the body.
 */
export function weightedAverageCostPaisePerKg(lots: CostedLot[]): number {
  const grams = lots.reduce((n, l) => n + l.remainingGrams, 0);
  const paise = lots.reduce((n, l) => n + l.costPaise, 0);
  if (grams <= 0) throw new Error("Pool has no mass.");
  if (paise < 0) throw new Error("Declared cost cannot be negative.");
  if (lots.some((l) => l.costPaise < 0 || l.remainingGrams < 0)) {
    throw new Error("Declared cost and mass cannot be negative.");
  }
  return Math.round(paise / (grams / 1000));
}

/** Blend a declared intake into a godown pool. Both mass and rupee must be declared. */
export function intakeWac(
  poolGrams: number,
  poolCostPaise: number,
  inGrams: number,
  inCostPaise: number,
): { remainingGrams: number; costPaise: number; wacPaisePerKg: number } {
  if (inGrams <= 0) throw new Error("Declared quantity is required.");
  if (inCostPaise < 0 || poolCostPaise < 0) throw new Error("Declared cost cannot be negative.");
  if (poolGrams < 0) throw new Error("Mass cannot be negative.");
  const remainingGrams = poolGrams + inGrams;
  const costPaise = poolCostPaise + inCostPaise;
  return {
    remainingGrams,
    costPaise,
    wacPaisePerKg: Math.round(costPaise / (remainingGrams / 1000)),
  };
}

/**
 * Issue mass FIFO (same sack identity) and cost it at pool WAC.
 * Last line absorbs the paise remainder so issued cost sums exactly.
 */
export function issueAtWac(
  lots: CostedLot[],
  wantGrams: number,
): {
  take: { lotId: string; qtyGrams: number; costPaise: number }[];
  wacPaisePerKg: number;
  issuedCostPaise: number;
} {
  const live = lots.filter((l) => l.remainingGrams > 0);
  const wacPaisePerKg = weightedAverageCostPaisePerKg(live);
  const fifo = allocateFifo(live, wantGrams);
  const issuedCostPaise = paiseFromKgPrice(wantGrams, wacPaisePerKg);
  let allocated = 0;
  const take = fifo.map((t, i) => {
    const costPaise =
      i === fifo.length - 1 ? issuedCostPaise - allocated : paiseFromKgPrice(t.qtyGrams, wacPaisePerKg);
    allocated += costPaise;
    return { lotId: t.lotId, qtyGrams: t.qtyGrams, costPaise };
  });
  return { take, wacPaisePerKg, issuedCostPaise };
}

/** Last cell absorbs the paise remainder so the FPO split sums to farmgate. */
export function splitQtyWeighted(
  parts: { cellId: string; qtyGrams: number }[],
  farmgatePaise: number,
): { cellId: string; qtyGrams: number; amountPaise: number }[] {
  const total = parts.reduce((n, p) => n + p.qtyGrams, 0);
  if (total <= 0) throw new Error("Pool has no mass.");
  if (parts.length === 0) return [];
  let allocated = 0;
  return parts.map((p, i) => {
    const amount =
      i === parts.length - 1 ? farmgatePaise - allocated : Math.round((farmgatePaise * p.qtyGrams) / total);
    allocated += amount;
    return { cellId: p.cellId, qtyGrams: p.qtyGrams, amountPaise: amount };
  });
}

export function parseAcresCenti(raw: string): number | null {
  const n = Number(String(raw).replace(/,/g, "").trim());
  if (!Number.isFinite(n) || n <= 0) return null;
  return Math.round(n * 100);
}

/** Declared Langthasa godown master policy. Premium unknown — never invented. */
export const LANGTHASA_MASTER_POLICY = "POL-LANGTHASA-GODOWN";
export const CURRENT_SEASON = "Magh 2026";
export const NEXT_SEASON = "Magh 2027";
export const GI_GEO = "Langthasa, Karbi Anglong";

export type CoverVerdict = { status: "bound" | "gap"; signal: "storage.covered" | "cover.gap"; policyId: string | null };

export function evaluateCover(facility: string, policyId?: string | null): CoverVerdict {
  const named = (policyId ?? "").trim();
  if (named) return { status: "bound", signal: "storage.covered", policyId: named };
  if (/langthasa/i.test(facility)) {
    return { status: "bound", signal: "storage.covered", policyId: LANGTHASA_MASTER_POLICY };
  }
  return { status: "gap", signal: "cover.gap", policyId: null };
}

export type KitchenEdge = { dish: string; variety: string; festival: string };

export function kitchenImplies(edges: KitchenEdge[], variety: string): KitchenEdge[] {
  const v = variety.trim().toLowerCase();
  if (!v) return [];
  return edges.filter((e) => {
    const ev = e.variety.toLowerCase();
    return v.includes(ev) || ev.includes(v) || v.split(/\s+/)[0] === ev.split(/\s+/)[0];
  });
}

export function offerNextSeason(qtyGrams: number, season = CURRENT_SEASON): { qtyGrams: number; season: string; pricePaisePerKg: null } {
  if (qtyGrams <= 0) throw new Error("Declared quantity is required to offer next season.");
  return { qtyGrams, season: season === CURRENT_SEASON ? NEXT_SEASON : season, pricePaisePerKg: null };
}

export function remainingAfterSpoilage(remainingGrams: number, lossGrams: number): number {
  if (lossGrams <= 0) throw new Error("Declared spoilage kilograms are required.");
  if (remainingGrams < 0) throw new Error("Mass cannot be negative.");
  const left = remainingGrams - lossGrams;
  if (left < 0) throw new Error("Spoilage exceeds remaining mass.");
  return left;
}

export type GiBirth = {
  event: "mint";
  handler: string;
  geo: string;
  season: string;
  seq: 1;
};

export function mintGiBirth(input: {
  giMarker: string | null;
  handler: string;
  geo: string;
  season: string;
}): GiBirth | null {
  if (!input.giMarker) return null;
  const handler = input.handler.trim();
  const geo = input.geo.trim();
  if (!handler || !geo) throw new Error("GI mint needs a handler and a geography.");
  return { event: "mint", handler, geo, season: input.season, seq: 1 };
}

export function assertGiClaim(giMarker: string | null, mintCount: number): void {
  if (!giMarker) return;
  if (mintCount <= 0) throw new Error("No GI claim without a mint.");
}

export type VillagePost = {
  organId: string;
  account: "spoilage" | "energy" | "water" | "cover" | "freight";
  side: "debit" | "credit";
  amountPaise: number;
  qtyGrams: number;
  cause: string;
};

export function villageSpoilagePost(lossGrams: number, amountPaise: number, cause: string): VillagePost {
  if (lossGrams <= 0) throw new Error("Declared spoilage kilograms are required.");
  if (amountPaise < 0) throw new Error("Declared loss cannot be negative.");
  return {
    organId: "rcop",
    account: "spoilage",
    side: "debit",
    amountPaise,
    qtyGrams: lossGrams,
    cause,
  };
}

export function villageCostPost(
  kind: "energy" | "water" | "cover" | "freight",
  amountPaise: number,
  qtyGrams: number,
  cause: string,
): VillagePost {
  if (amountPaise <= 0) throw new Error("Declared amount is required.");
  if (qtyGrams < 0) throw new Error("Mass cannot be negative.");
  const organId = kind === "energy" ? "recie" : kind === "water" ? "water" : kind === "cover" ? "insurance" : "logistics";
  return { organId, account: kind, side: "debit", amountPaise, qtyGrams, cause };
}

/** ₹/kg from declared paise and grams. Null when either is missing — never invented. */
export function declaredCostPerKg(amountPaise: number, grams: number): number | null {
  if (amountPaise <= 0 || grams <= 0) return null;
  return Math.round(amountPaise / (grams / 1000));
}
