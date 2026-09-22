import { getSql, type Sql } from "@/lib/db";
import { nid } from "./ids";
import { assertCanSell } from "./kernel";
import { composePlatform, processMass } from "./platform";
import type {
  DocumentKind,
  DocumentRow,
  PlatformSnapshot,
  ProcessKind,
  ProcessRow,
  SeasonRow,
} from "./platform";
import { ensureBooks, readBooks } from "./boot.server";
import type { BooksSnapshot } from "./types";

function asTime(value: unknown): string {
  if (typeof value === "string") return value;
  if (value instanceof Date) return value.toISOString();
  return String(value ?? "");
}

async function issueDocument(
  sql: Sql,
  doc: {
    id?: string;
    kind: DocumentKind;
    refId: string;
    cellId: string | null;
    lotId: string | null;
    title: string;
    body: string;
  },
): Promise<void> {
  const existing = await sql.query<{ n: number }>(
    "select count(*)::int as n from erp_documents where kind = $1 and ref_id = $2",
    [doc.kind, doc.refId],
  );
  if ((existing[0]?.n ?? 0) > 0) return;
  await sql.query(
    `insert into erp_documents (id, kind, ref_id, cell_id, lot_id, title, body)
     values ($1,$2,$3,$4,$5,$6,$7)`,
    [doc.id ?? nid("doc"), doc.kind, doc.refId, doc.cellId, doc.lotId, doc.title, doc.body],
  );
}

async function backfillDocuments(sql: Sql, books: BooksSnapshot): Promise<void> {
  await sql.query(
    `insert into erp_seasons (id, name, village, status)
     values ('magh-2026','Magh 2026',$1,'open')
     on conflict (id) do nothing`,
    [books.fpo?.village ?? "Langthasa"],
  );
  for (const lot of books.lots) {
    await issueDocument(sql, {
      kind: "harvest",
      refId: lot.id,
      cellId: lot.cellId,
      lotId: lot.id,
      title: `Harvest note · ${lot.variety}`,
      body: `${lot.cellName} minted ${lot.grams} g of ${lot.variety} (${lot.commodity}). Remaining ${lot.remainingGrams} g on the same body. Grade ${lot.grade ?? "—"}. GI ${lot.giMarker ?? "none"}.`,
    });
  }
  for (const wr of books.receipts) {
    await issueDocument(sql, {
      kind: "warehouse",
      refId: wr.id,
      cellId: null,
      lotId: wr.lotId,
      title: `Warehouse receipt · ${wr.id}`,
      body: `${wr.qtyGrams} g of ${wr.variety} inwards at ${wr.facility} for ${wr.cellName}. Status ${wr.status}. Lender ${wr.lender ?? "none"}.`,
    });
  }
  for (const order of books.orders) {
    await issueDocument(sql, {
      kind: order.status === "settled" ? "settle" : "offtake",
      refId: order.id,
      cellId: null,
      lotId: order.lotId,
      title: `${order.status === "settled" ? "Farmgate advice" : "Offtake note"} · ${order.id}`,
      body: `${order.qtyGrams} g of ${order.variety} to ${order.buyer} at ${order.pricePaisePerKg} paise/kg, freight ${order.freightPaisePerKg} paise/kg. paymentRef ${order.paymentRef ?? "open"}.`,
    });
  }
}

async function readExtras(): Promise<{
  season: SeasonRow | null;
  documents: DocumentRow[];
  processes: ProcessRow[];
}> {
  const sql = await getSql();
  const seasons = await sql.query<{
    id: string;
    name: string;
    village: string;
    status: "open" | "closed";
  }>("select id, name, village, status from erp_seasons order by opened_at desc limit 1");
  const docs = await sql.query<{
    id: string;
    kind: DocumentKind;
    ref_id: string;
    cell_id: string | null;
    lot_id: string | null;
    title: string;
    body: string;
    created_at: string | Date;
  }>("select id, kind, ref_id, cell_id, lot_id, title, body, created_at from erp_documents order by created_at desc limit 40");
  const procs = await sql.query<{
    id: string;
    lot_id: string;
    kind: ProcessKind;
    in_grams: number;
    loss_grams: number;
    out_grams: number;
    note: string;
    created_at: string | Date;
  }>("select id, lot_id, kind, in_grams, loss_grams, out_grams, note, created_at from erp_process order by created_at desc limit 20");
  return {
    season: seasons[0]
      ? { id: seasons[0].id, name: seasons[0].name, village: seasons[0].village, status: seasons[0].status }
      : null,
    documents: docs.map((d) => ({
      id: d.id,
      kind: d.kind,
      refId: d.ref_id,
      cellId: d.cell_id,
      lotId: d.lot_id,
      title: d.title,
      body: d.body,
      createdAt: asTime(d.created_at),
    })),
    processes: procs.map((p) => ({
      id: p.id,
      lotId: p.lot_id,
      kind: p.kind,
      inGrams: p.in_grams,
      lossGrams: p.loss_grams,
      outGrams: p.out_grams,
      note: p.note,
      createdAt: asTime(p.created_at),
    })),
  };
}

export async function ensurePlatform(): Promise<PlatformSnapshot> {
  const books = await ensureBooks();
  const sql = await getSql();
  await backfillDocuments(sql, books);
  const extras = await readExtras();
  return { ...books, ...composePlatform(books, extras) };
}

export async function processLot(
  sql: Sql,
  input: { lotId: string; kind: ProcessKind; lossGrams: number; note: string },
): Promise<string> {
  const lot = await sql.query<{
    remaining_grams: number;
    status: string;
    variety: string;
    cell_id: string;
  }>("select remaining_grams, status, variety, cell_id from erp_lots where id = $1", [input.lotId]);
  if (!lot[0]) throw new Error("Unknown lot.");
  const pledged = await sql.query<{ n: number }>(
    "select count(*)::int as n from erp_receipts where lot_id = $1 and status = 'pledged'",
    [input.lotId],
  );
  assertCanSell(lot[0].status, pledged[0]?.n ?? 0);
  const inGrams = lot[0].remaining_grams;
  if (inGrams <= 0) throw new Error("No remaining mass to process.");
  const { saleableGrams } = processMass(inGrams, input.lossGrams);
  const id = nid("prc");
  await sql.query("update erp_lots set remaining_grams = $2 where id = $1", [input.lotId, saleableGrams]);
  await sql.query(
    `insert into erp_process (id, lot_id, kind, in_grams, loss_grams, out_grams, note)
     values ($1,$2,$3,$4,$5,$6,$7)`,
    [id, input.lotId, input.kind, inGrams, input.lossGrams, saleableGrams, input.note.slice(0, 160)],
  );
  await issueDocument(sql, {
    kind: "process",
    refId: id,
    cellId: lot[0].cell_id,
    lotId: input.lotId,
    title: `${input.kind} · ${lot[0].variety}`,
    body: `In ${inGrams} g. Declared ${input.kind} loss ${input.lossGrams} g. Saleable ${saleableGrams} g remains on the same body. ${input.note}`.trim(),
  });
  await sql.query(
    `insert into spine_events (signal, organ_id, ligament_id, payload)
     values ($1,'lot','b-lot-birth',$2::jsonb)`,
    ["lot.process", JSON.stringify({ lotId: input.lotId, kind: input.kind, lossGrams: input.lossGrams, saleableGrams })],
  );
  return id;
}

export async function readPlatform(): Promise<PlatformSnapshot> {
  const books = await readBooks();
  const extras = await readExtras();
  return { ...books, ...composePlatform(books, extras) };
}
