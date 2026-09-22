import { createServerFn } from "@tanstack/react-start";
import { getSql } from "@/lib/db";
import { parseKg, parseRupeePerKg } from "./money";
import { parseAcresCenti } from "./kernel";
import type { BooksResult, InputKind } from "./types";
import type { RunContext } from "@/lib/modules/types";

export type { BooksResult, BooksSnapshot } from "./types";

async function pulse(signal: string, ctx: Omit<RunContext, "workflowId">) {
  try {
    const { trackErpSignal } = await import("@/lib/modules/boot.server");
    await trackErpSignal(signal, ctx);
  } catch {
    // Tracking never rolls back village books.
  }
}

function parseFreightPaise(raw: string): number | null {
  const t = String(raw).replace(/,/g, "").replace(/^₹/, "").trim();
  if (t === "") return 400;
  const n = Number(t);
  if (!Number.isFinite(n) || n < 0) return null;
  return Math.round(n * 100);
}

function emptyKpis(message: string): BooksResult["kpis"] {
  return {
    cells: 0,
    lots: 0,
    kgInWarehouse: 0,
    kgMinted: 0,
    kgRemaining: 0,
    openPaise: 0,
    settledPaise: 0,
    farmgatePaise: 0,
    pendingPayouts: 0,
    avgHoursToPay: null,
    journalBalanced: true,
    villageTcoPaise: 0,
    spoilageGrams: 0,
    giMinted: 0,
    integrityNote: message,
  };
}

function fail(message: string): BooksResult {
  return {
    ok: false,
    error: message,
    fpo: null,
    kpis: emptyKpis(message),
    cells: [],
    lots: [],
    receipts: [],
    orders: [],
    journal: [],
    inputs: [],
    payouts: [],
    poolable: [],
    kitchen: [],
    contracts: [],
    plantings: [],
    giChain: [],
    villageLedger: [],
  };
}

export const getBooks = createServerFn({ method: "GET" }).handler(async (): Promise<BooksResult> => {
  const { ensureBooks } = await import("./boot.server");
  try {
    const snapshot = await ensureBooks();
    return { ok: true, ...snapshot };
  } catch (err) {
    return fail(err instanceof Error ? err.message : "books unread");
  }
});

export const recordHarvest = createServerFn({ method: "POST" })
  .validator((input: { cellId: string; variety: string; commodity: string; kg: string; moisture?: string; gi?: boolean }) => ({
    cellId: String(input?.cellId ?? ""),
    variety: String(input?.variety ?? "").trim().slice(0, 80),
    commodity: String(input?.commodity ?? "paddy").trim().slice(0, 40),
    kg: String(input?.kg ?? ""),
    moisture: String(input?.moisture ?? ""),
    gi: Boolean(input?.gi),
  }))
  .handler(async ({ data }): Promise<BooksResult> => {
    const grams = parseKg(data.kg);
    if (!data.cellId) return fail("Name the farmer cell.");
    if (!data.variety) return fail("Variety is required.");
    if (!grams) return fail("Declared kilograms are required.");
    const moistureBp = data.moisture ? Math.round(Number(data.moisture) * 100) : null;
    if (data.moisture && (moistureBp == null || Number.isNaN(moistureBp))) return fail("Moisture must be a number.");
    const { ensureBooks, mintLot, readBooks } = await import("./boot.server");
    await ensureBooks();
    const sql = await getSql();
    try {
      const lotId = await mintLot(sql, {
        cellId: data.cellId,
        variety: data.variety,
        commodity: data.commodity || "paddy",
        grams,
        grade: data.gi ? "GI" : "A",
        giMarker: data.gi ? "GI-AS-CHAKHAO" : null,
        moistureBp,
      });
      await pulse("harvest.completed", {
        lotId,
        cellId: data.cellId,
        variety: data.variety,
        grams,
        remainingGrams: grams,
        giMarker: data.gi ? "GI-AS-CHAKHAO" : null,
        query: "harvest.completed",
      });
      return { ok: true, ...(await readBooks()) };
    } catch (err) {
      return fail(err instanceof Error ? err.message : "harvest failed");
    }
  });

export const intakeLot = createServerFn({ method: "POST" })
  .validator((input: { lotId: string; facility?: string }) => ({
    lotId: String(input?.lotId ?? ""),
    facility: String(input?.facility ?? "Langthasa godown").trim().slice(0, 80),
  }))
  .handler(async ({ data }): Promise<BooksResult> => {
    if (!data.lotId) return fail("Lot id required.");
    const { ensureBooks, inwardReceipt, readBooks } = await import("./boot.server");
    await ensureBooks();
    const sql = await getSql();
    try {
      await inwardReceipt(sql, { lotId: data.lotId, facility: data.facility || "Langthasa godown" });
      await pulse("warehouse.intake", { lotId: data.lotId, query: "warehouse.intake" });
      return { ok: true, ...(await readBooks()) };
    } catch (err) {
      return fail(err instanceof Error ? err.message : "intake failed");
    }
  });

export const pledgeLot = createServerFn({ method: "POST" })
  .validator((input: { receiptId: string; lender: string }) => ({
    receiptId: String(input?.receiptId ?? ""),
    lender: String(input?.lender ?? "").trim().slice(0, 80),
  }))
  .handler(async ({ data }): Promise<BooksResult> => {
    if (!data.receiptId) return fail("Receipt required.");
    const { ensureBooks, pledgeReceipt, readBooks } = await import("./boot.server");
    await ensureBooks();
    const sql = await getSql();
    try {
      await pledgeReceipt(sql, data);
      return { ok: true, ...(await readBooks()) };
    } catch (err) {
      return fail(err instanceof Error ? err.message : "pledge failed");
    }
  });

export const clearLien = createServerFn({ method: "POST" })
  .validator((input: { receiptId: string }) => ({ receiptId: String(input?.receiptId ?? "") }))
  .handler(async ({ data }): Promise<BooksResult> => {
    const { ensureBooks, releaseLien, readBooks } = await import("./boot.server");
    await ensureBooks();
    const sql = await getSql();
    try {
      await releaseLien(sql, data.receiptId);
      return { ok: true, ...(await readBooks()) };
    } catch (err) {
      return fail(err instanceof Error ? err.message : "lien failed");
    }
  });

export const sellLot = createServerFn({ method: "POST" })
  .validator(
    (input: { lotId: string; buyer: string; kg: string; pricePerKg: string; freightPerKg?: string }) => ({
      lotId: String(input?.lotId ?? ""),
      buyer: String(input?.buyer ?? "").trim().slice(0, 80),
      kg: String(input?.kg ?? ""),
      pricePerKg: String(input?.pricePerKg ?? ""),
      freightPerKg: String(input?.freightPerKg ?? "4"),
    }),
  )
  .handler(async ({ data }): Promise<BooksResult> => {
    const grams = parseKg(data.kg);
    const price = parseRupeePerKg(data.pricePerKg);
    const freight = parseFreightPaise(data.freightPerKg);
    if (!data.lotId) return fail("Lot required.");
    if (!data.buyer) return fail("Buyer required.");
    if (!grams) return fail("Declared kilograms required.");
    if (!price) return fail("salePricePerUnit is required — never invented.");
    if (freight == null) return fail("Freight must be declared as zero or more.");
    const { ensureBooks, createOrder, readBooks } = await import("./boot.server");
    await ensureBooks();
    const sql = await getSql();
    try {
      await createOrder(sql, {
        lotId: data.lotId,
        buyer: data.buyer,
        qtyGrams: grams,
        pricePaisePerKg: price,
        freightPaisePerKg: freight ?? 400,
      });
      await pulse("lot.ready", {
        lotId: data.lotId,
        qtyGrams: grams,
        pricePaisePerKg: price,
        freightPaisePerKg: freight ?? 0,
        query: "lot.ready",
      });
      return { ok: true, ...(await readBooks()) };
    } catch (err) {
      return fail(err instanceof Error ? err.message : "sale failed");
    }
  });

export const settleSale = createServerFn({ method: "POST" })
  .validator((input: { orderId: string; paymentRef: string; hoursToPay: string }) => ({
    orderId: String(input?.orderId ?? ""),
    paymentRef: String(input?.paymentRef ?? "").trim().slice(0, 80),
    hoursToPay: String(input?.hoursToPay ?? "24"),
  }))
  .handler(async ({ data }): Promise<BooksResult> => {
    const hours = Number(data.hoursToPay);
    if (!data.orderId) return fail("Order required.");
    if (!data.paymentRef) return fail("paymentRef is required to mark paid.");
    if (!Number.isFinite(hours) || hours < 0) return fail("Hours-to-pay must be a number.");
    const { ensureBooks, settleOrder, readBooks } = await import("./boot.server");
    await ensureBooks();
    const sql = await getSql();
    try {
      await settleOrder(sql, { orderId: data.orderId, paymentRef: data.paymentRef, hoursToPay: Math.round(hours) });
      await pulse("order.settled", {
        paymentRef: data.paymentRef,
        hoursToPay: Math.round(hours),
        query: "order.settled",
      });
      return { ok: true, ...(await readBooks()) };
    } catch (err) {
      return fail(err instanceof Error ? err.message : "settle failed");
    }
  });

export const recordInput = createServerFn({ method: "POST" })
  .validator((input: { cellId: string; kind: string; qty: string; unit: string; amount: string; memo: string }) => ({
    cellId: String(input?.cellId ?? ""),
    kind: String(input?.kind ?? "seed") as InputKind,
    qty: String(input?.qty ?? "1"),
    unit: String(input?.unit ?? "unit").slice(0, 20),
    amount: String(input?.amount ?? ""),
    memo: String(input?.memo ?? "").slice(0, 160),
  }))
  .handler(async ({ data }): Promise<BooksResult> => {
    const amountPaise = parseRupeePerKg(data.amount);
    const qty = Number(data.qty);
    if (!data.cellId) return fail("Cell required.");
    if (!amountPaise) return fail("Declared rupees required.");
    if (!Number.isFinite(qty) || qty <= 0) return fail("Quantity required.");
    const kind = (["seed", "fodder", "energy", "labour", "cover", "water"] as InputKind[]).includes(data.kind)
      ? data.kind
      : "seed";
    const { ensureBooks, postInput, readBooks } = await import("./boot.server");
    await ensureBooks();
    const sql = await getSql();
    try {
      await postInput(sql, {
        cellId: data.cellId,
        kind,
        qty: Math.round(qty),
        unit: data.unit,
        amountPaise,
        memo: data.memo || `${kind} (declared)`,
      });
      return { ok: true, ...(await readBooks()) };
    } catch (err) {
      return fail(err instanceof Error ? err.message : "input failed");
    }
  });

export const enrollFarmer = createServerFn({ method: "POST" })
  .validator((input: { name: string; household: string; acres: string; notes?: string }) => ({
    name: String(input?.name ?? "").trim().slice(0, 80),
    household: String(input?.household ?? "").trim().slice(0, 80),
    acres: String(input?.acres ?? ""),
    notes: String(input?.notes ?? "").trim().slice(0, 160),
  }))
  .handler(async ({ data }): Promise<BooksResult> => {
    const acresCenti = parseAcresCenti(data.acres);
    if (!data.name) return fail("Cell name is required.");
    if (!data.household) return fail("Household is required.");
    if (!acresCenti) return fail("Declared acres are required.");
    const { ensureBooks, enrollCell, readBooks } = await import("./boot.server");
    await ensureBooks();
    const sql = await getSql();
    try {
      await enrollCell(sql, { name: data.name, household: data.household, acresCenti, notes: data.notes });
      return { ok: true, ...(await readBooks()) };
    } catch (err) {
      return fail(err instanceof Error ? err.message : "enroll failed");
    }
  });

export const poolSell = createServerFn({ method: "POST" })
  .validator(
    (input: { commodity: string; buyer: string; kg: string; pricePerKg: string; freightPerKg?: string }) => ({
      commodity: String(input?.commodity ?? "").trim().slice(0, 40),
      buyer: String(input?.buyer ?? "").trim().slice(0, 80),
      kg: String(input?.kg ?? ""),
      pricePerKg: String(input?.pricePerKg ?? ""),
      freightPerKg: String(input?.freightPerKg ?? "4"),
    }),
  )
  .handler(async ({ data }): Promise<BooksResult> => {
    const grams = parseKg(data.kg);
    const price = parseRupeePerKg(data.pricePerKg);
    const freight = parseFreightPaise(data.freightPerKg);
    if (!data.commodity) return fail("Commodity required.");
    if (!data.buyer) return fail("Buyer required.");
    if (!grams) return fail("Declared kilograms required.");
    if (!price) return fail("salePricePerUnit is required — never invented.");
    if (freight == null) return fail("Freight must be declared as zero or more.");
    const { ensureBooks, poolOfftake, readBooks } = await import("./boot.server");
    await ensureBooks();
    const sql = await getSql();
    try {
      await poolOfftake(sql, {
        commodity: data.commodity,
        buyer: data.buyer,
        qtyGrams: grams,
        pricePaisePerKg: price,
        freightPaisePerKg: freight ?? 400,
      });
      return { ok: true, ...(await readBooks()) };
    } catch (err) {
      return fail(err instanceof Error ? err.message : "pool offtake failed");
    }
  });

export const settlePoolSale = createServerFn({ method: "POST" })
  .validator((input: { poolId: string; paymentRef: string; hoursToPay: string }) => ({
    poolId: String(input?.poolId ?? ""),
    paymentRef: String(input?.paymentRef ?? "").trim().slice(0, 80),
    hoursToPay: String(input?.hoursToPay ?? "24"),
  }))
  .handler(async ({ data }): Promise<BooksResult> => {
    const hours = Number(data.hoursToPay);
    if (!data.poolId) return fail("Pool required.");
    if (!data.paymentRef) return fail("paymentRef is required to mark paid.");
    if (!Number.isFinite(hours) || hours < 0) return fail("Hours-to-pay must be a number.");
    const { ensureBooks, settlePool, readBooks } = await import("./boot.server");
    await ensureBooks();
    const sql = await getSql();
    try {
      await settlePool(sql, { poolId: data.poolId, paymentRef: data.paymentRef, hoursToPay: Math.round(hours) });
      return { ok: true, ...(await readBooks()) };
    } catch (err) {
      return fail(err instanceof Error ? err.message : "pool settle failed");
    }
  });

export const getPlatform = createServerFn({ method: "GET" }).handler(async () => {
  const { ensurePlatform } = await import("./platform.server");
  try {
    const snapshot = await ensurePlatform();
    return { ok: true as const, ...snapshot };
  } catch (err) {
    return { ok: false as const, error: err instanceof Error ? err.message : "platform unread" };
  }
});

export const processDeclared = createServerFn({ method: "POST" })
  .validator((input: { lotId: string; kind: string; lossKg: string; note?: string }) => ({
    lotId: String(input?.lotId ?? ""),
    kind: String(input?.kind ?? "drying"),
    lossKg: String(input?.lossKg ?? "0"),
    note: String(input?.note ?? "").trim().slice(0, 160),
  }))
  .handler(async ({ data }) => {
    const kinds = ["drying", "milling", "cleaning", "grading"] as const;
    const kind = kinds.find((k) => k === data.kind);
    if (!data.lotId) return { ok: false as const, error: "Lot required." };
    if (!kind) return { ok: false as const, error: "Process kind required." };
    const raw = data.lossKg.replace(/,/g, "").trim();
    const n = raw === "" ? 0 : Number(raw);
    if (!Number.isFinite(n) || n < 0) return { ok: false as const, error: "Declared loss must be zero or more." };
    const lossGrams = Math.round(n * 1000);
    const { ensureBooks } = await import("./boot.server");
    const { processLot, ensurePlatform } = await import("./platform.server");
    await ensureBooks();
    const sql = await getSql();
    try {
      await processLot(sql, { lotId: data.lotId, kind, lossGrams, note: data.note });
      try {
        const { trackErpSignal } = await import("@/lib/modules/boot.server");
        await trackErpSignal("warehouse.intake", { lotId: data.lotId, query: "lot.process" });
      } catch {
        /* tracking never rolls back books */
      }
      const snapshot = await ensurePlatform();
      return { ok: true as const, ...snapshot };
    } catch (err) {
      return { ok: false as const, error: err instanceof Error ? err.message : "process failed" };
    }
  });

export const acceptSeason = createServerFn({ method: "POST" })
  .validator((input: { contractId: string; pricePerKg: string }) => ({
    contractId: String(input?.contractId ?? ""),
    pricePerKg: String(input?.pricePerKg ?? ""),
  }))
  .handler(async ({ data }): Promise<BooksResult> => {
    const price = parseRupeePerKg(data.pricePerKg);
    if (!data.contractId) return fail("Contract required.");
    if (!price) return fail("Declared ₹/kg is required — never invented.");
    const { ensureBooks, acceptContract, readBooks } = await import("./boot.server");
    await ensureBooks();
    const sql = await getSql();
    try {
      await acceptContract(sql, { contractId: data.contractId, pricePaisePerKg: price });
      await pulse("contract.offer", { query: "contract.accept" });
      return { ok: true, ...(await readBooks()) };
    } catch (err) {
      return fail(err instanceof Error ? err.message : "contract failed");
    }
  });

export const declareSpoilage = createServerFn({ method: "POST" })
  .validator((input: { lotId: string; kg: string; cause: string }) => ({
    lotId: String(input?.lotId ?? ""),
    kg: String(input?.kg ?? ""),
    cause: String(input?.cause ?? "power cut").trim().slice(0, 80),
  }))
  .handler(async ({ data }): Promise<BooksResult> => {
    const grams = parseKg(data.kg);
    if (!data.lotId) return fail("Lot required.");
    if (!grams) return fail("Declared spoilage kilograms are required.");
    if (!data.cause) return fail("Cause is required — never invented.");
    const { ensureBooks, recordSpoilage, readBooks } = await import("./boot.server");
    await ensureBooks();
    const sql = await getSql();
    try {
      await recordSpoilage(sql, { lotId: data.lotId, lossGrams: grams, cause: data.cause });
      await pulse("spoilage.event", { lotId: data.lotId, grams, query: "spoilage.event" });
      return { ok: true, ...(await readBooks()) };
    } catch (err) {
      return fail(err instanceof Error ? err.message : "spoilage failed");
    }
  });
