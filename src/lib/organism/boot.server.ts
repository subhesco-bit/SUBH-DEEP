import { getSql, type Sql } from "@/lib/db";
import { CONCEPTS } from "@/lib/lattice/concepts";
import { BRIDGES } from "@/lib/lattice/bridges";
import {
  CANONICAL_QUERIES,
  CANONICAL_QUERY_COUNT,
  composeLibraryReading,
  diagnose,
  libraryCatalog,
  queryLibraryKnowledge,
} from "@/lib/library";
import type { AutoOp, EventRow, OrganismSnapshot, PulseRow } from "./types";

type StateRow = {
  auto_op: string;
  booted_at: string | null;
  library_cards: number;
  bindings: number;
  last_pulse_at: string | null;
  last_error: string | null;
};

type PulseDb = {
  id: number;
  kind: string;
  query: string;
  reading: string;
  card_ids: unknown;
  organ_id: string | null;
  source: string;
  created_at: string | Date;
};

type EventDb = {
  id: number;
  signal: string;
  organ_id: string | null;
  ligament_id: string | null;
  created_at: string | Date;
};

const CHUNK = 16;

/** In-flight seed so boot, GET, and the vite plugin never double-index. */
let seedChain: Promise<void> | null = null;

export function asTime(value: unknown): string {
  if (typeof value === "string") return value;
  if (value instanceof Date) return value.toISOString();
  return String(value ?? "");
}

export function asIds(value: unknown): string[] {
  if (Array.isArray(value)) return value.map(String);
  if (typeof value === "string") {
    try {
      const parsed = JSON.parse(value) as unknown;
      return Array.isArray(parsed) ? parsed.map(String) : [];
    } catch {
      return [];
    }
  }
  return [];
}

/** `$1,$2::jsonb,$3` rows for a bulk insert. Casts[i] is a suffix such as `::jsonb`. */
export function valuePlaceholders(rows: number, casts: Array<string | "">): string {
  const cols = casts.length;
  const parts: string[] = [];
  for (let r = 0; r < rows; r += 1) {
    const cells = casts.map((cast, c) => `$${r * cols + c + 1}${cast}`);
    parts.push(`(${cells.join(",")})`);
  }
  return parts.join(",");
}

function emptySnapshot(error: string | null, autoOp: AutoOp = "missing"): OrganismSnapshot {
  return {
    autoOp,
    bootedAt: null,
    libraryCards: 0,
    bindings: 0,
    lastPulseAt: null,
    lastError: error,
    diagnosis: diagnose(),
    pulses: [],
    events: [],
    reflexesAnswered: 0,
  };
}

async function readPulses(sql: Sql, limit = 32): Promise<PulseRow[]> {
  const rows = await sql.query<PulseDb>(
    "select id, kind, query, reading, card_ids, organ_id, source, created_at from ai_pulses order by created_at desc, id desc limit $1",
    [limit],
  );
  return rows.map((r) => ({
    id: r.id,
    kind: r.kind,
    query: r.query,
    reading: r.reading,
    cardIds: asIds(r.card_ids),
    organId: r.organ_id,
    source: r.source,
    createdAt: asTime(r.created_at),
  }));
}

async function readEvents(sql: Sql, limit = 20): Promise<EventRow[]> {
  const rows = await sql.query<EventDb>(
    "select id, signal, organ_id, ligament_id, created_at from spine_events order by created_at desc, id desc limit $1",
    [limit],
  );
  return rows.map((r) => ({
    id: r.id,
    signal: r.signal,
    organId: r.organ_id,
    ligamentId: r.ligament_id,
    createdAt: asTime(r.created_at),
  }));
}

async function insertChunks(
  sql: Sql,
  rowCount: number,
  build: (offset: number, count: number) => { text: string; params: unknown[] },
): Promise<void> {
  for (let offset = 0; offset < rowCount; offset += CHUNK) {
    const count = Math.min(CHUNK, rowCount - offset);
    const { text, params } = build(offset, count);
    await sql.query(text, params);
  }
}

export async function readOrganismSnapshot(): Promise<OrganismSnapshot> {
  const sql = await getSql();
  const rows = await sql.query<StateRow>(
    "select auto_op, booted_at, library_cards, bindings, last_pulse_at, last_error from organism_state where id = 1",
  );
  const row = rows[0];
  const reflexCount = await sql.query<{ n: number }>(
    "select count(*)::int as n from ai_pulses where kind = 'reflex'",
  );
  return {
    autoOp: (row?.auto_op as AutoOp) || "missing",
    bootedAt: row?.booted_at ? asTime(row.booted_at) : null,
    libraryCards: row?.library_cards ?? 0,
    bindings: row?.bindings ?? 0,
    lastPulseAt: row?.last_pulse_at ? asTime(row.last_pulse_at) : null,
    lastError: row?.last_error ?? null,
    diagnosis: diagnose(),
    pulses: await readPulses(sql),
    events: await readEvents(sql),
    reflexesAnswered: reflexCount[0]?.n ?? 0,
  };
}

export async function publishEvent(
  signal: string,
  organId: string | null,
  ligamentId: string | null,
  payload: Record<string, unknown>,
): Promise<EventRow[]> {
  const sql = await getSql();
  await sql.query(
    "insert into spine_events (signal, organ_id, ligament_id, payload) values ($1, $2, $3, $4::jsonb)",
    [signal, organId, ligamentId, JSON.stringify(payload)],
  );
  return readEvents(sql);
}

async function seedLibrary(sql: Sql): Promise<{ cards: number; bindings: number }> {
  const cards = libraryCatalog();

  if (CONCEPTS.length) {
    const casts: Array<string | ""> = Array(13).fill("");
    casts[12] = "::jsonb";
    await insertChunks(sql, CONCEPTS.length, (offset, count) => {
      const slice = CONCEPTS.slice(offset, offset + count);
      const params: unknown[] = [];
      for (const c of slice) {
        params.push(
          c.id,
          c.name,
          c.short,
          c.dora,
          c.layer,
          c.status,
          c.role ?? "organ",
          c.thesis,
          c.silo,
          c.prosperity,
          c.x,
          c.y,
          JSON.stringify(c.binds ?? []),
        );
      }
      return {
        text: `insert into organs (id, name, short, dora, layer, status, role, thesis, silo, prosperity, x, y, binds)
         values ${valuePlaceholders(count, casts)}
         on conflict (id) do update set
           name = excluded.name, short = excluded.short, dora = excluded.dora,
           layer = excluded.layer, status = excluded.status, role = excluded.role,
           thesis = excluded.thesis, silo = excluded.silo, prosperity = excluded.prosperity,
           x = excluded.x, y = excluded.y, binds = excluded.binds`,
        params,
      };
    });
  }

  if (BRIDGES.length) {
    await insertChunks(sql, BRIDGES.length, (offset, count) => {
      const slice = BRIDGES.slice(offset, offset + count);
      const params: unknown[] = [];
      for (const b of slice) {
        params.push(b.id, b.from, b.to, b.name, b.kind, b.status, b.signal, b.today, b.contract, b.thought);
      }
      return {
        text: `insert into ligaments (id, from_id, to_id, name, kind, status, signal, today, contract, thought)
         values ${valuePlaceholders(count, Array(10).fill(""))}
         on conflict (id) do update set
           from_id = excluded.from_id, to_id = excluded.to_id, name = excluded.name,
           kind = excluded.kind, status = excluded.status, signal = excluded.signal,
           today = excluded.today, contract = excluded.contract, thought = excluded.thought`,
        params,
      };
    });
  }

  await sql.query("delete from library_bindings", []);

  if (cards.length) {
    await insertChunks(sql, cards.length, (offset, count) => {
      const slice = cards.slice(offset, offset + count);
      const params: unknown[] = [];
      for (const card of slice) {
        params.push(
          card.id,
          card.kind,
          card.title,
          card.body,
          card.source,
          card.signal ?? null,
          JSON.stringify(card.organs),
        );
      }
      const rows: string[] = [];
      for (let r = 0; r < count; r += 1) {
        const o = r * 7;
        rows.push(`($${o + 1},$${o + 2},$${o + 3},$${o + 4},$${o + 5},$${o + 6},$${o + 7}::jsonb, now())`);
      }
      return {
        text: `insert into library_cards (id, kind, title, body, source, signal, organ_ids, indexed_at)
         values ${rows.join(",")}
         on conflict (id) do update set
           kind = excluded.kind, title = excluded.title, body = excluded.body,
           source = excluded.source, signal = excluded.signal, organ_ids = excluded.organ_ids,
           indexed_at = now()`,
        params,
      };
    });

    const bindRows = cards.flatMap((card) => card.organs.map((organId) => [card.id, organId] as const));
    if (bindRows.length) {
      await insertChunks(sql, bindRows.length, (offset, count) => {
        const slice = bindRows.slice(offset, offset + count);
        const params: unknown[] = [];
        for (const [cardId, organId] of slice) params.push(cardId, organId);
        return {
          text: `insert into library_bindings (card_id, organ_id)
           values ${valuePlaceholders(count, ["", ""])}
           on conflict (card_id, organ_id) do nothing`,
          params,
        };
      });
    }
  }

  const bindCount = await sql.query<{ n: number }>("select count(*)::int as n from library_bindings");
  return { cards: cards.length, bindings: bindCount[0]?.n ?? 0 };
}

async function fireReflexes(sql: Sql): Promise<number> {
  const existing = await sql.query<{ query: string }>("select query from ai_pulses where kind = 'reflex'");
  const have = new Set(existing.map((r) => r.query));
  const diagnosis = diagnose();
  let inserted = 0;

  for (const q of CANONICAL_QUERIES) {
    if (have.has(q.query)) continue;
    const hits = queryLibraryKnowledge(q.query, { limit: 6 });
    const reading = composeLibraryReading(q.query, hits, diagnosis);
    await sql.query(
      `insert into ai_pulses (kind, query, reading, card_ids, organ_id, source)
       values ($1,$2,$3,$4::jsonb,$5,$6)`,
      ["reflex", q.query, reading, JSON.stringify(hits.map((h) => h.id)), q.organId, "library"],
    );
    inserted += 1;
  }

  if (inserted > 0) {
    await sql.query(
      "insert into spine_events (signal, organ_id, ligament_id, payload) values ($1, $2, $3, $4::jsonb)",
      ["library.reflex", "ai", null, JSON.stringify({ answered: existing.length + inserted, total: CANONICAL_QUERY_COUNT })],
    );
  }
  return existing.length + inserted;
}

async function fireBootPulse(sql: Sql, seeded: { cards: number; bindings: number }): Promise<void> {
  const diagnosis = diagnose();
  const hits = queryLibraryKnowledge("auto-operation library boot harvest lot spine hippocampus", { limit: 8 });
  const reading = composeLibraryReading("organism.boot", hits, diagnosis);

  await sql.query(
    "insert into spine_events (signal, organ_id, ligament_id, payload) values ($1, $2, $3, $4::jsonb)",
    ["organism.booted", "ai", null, JSON.stringify({ cards: seeded.cards, bindings: seeded.bindings })],
  );
  await sql.query(
    "insert into spine_events (signal, organ_id, ligament_id, payload) values ($1, $2, $3, $4::jsonb)",
    ["library.indexed", "ai", null, JSON.stringify({ cards: seeded.cards })],
  );
  await sql.query(
    "insert into spine_events (signal, organ_id, ligament_id, payload) values ($1, $2, $3, $4::jsonb)",
    ["nerve.diagnose", "ai", null, JSON.stringify({ missing: diagnosis.missingLigaments })],
  );

  await sql.query(
    `insert into ai_pulses (kind, query, reading, card_ids, organ_id, source)
     values ($1,$2,$3,$4::jsonb,$5,$6)`,
    ["auto", "organism.boot", reading, JSON.stringify(hits.map((h) => h.id)), "ai", "library"],
  );
}

async function markLiving(
  sql: Sql,
  seeded: { cards: number; bindings: number },
  reflexes: number,
): Promise<void> {
  await sql.query(
    `insert into organism_state (id, auto_op, booted_at, library_cards, bindings, reflexes_answered, last_pulse_at, last_error)
     values (1, 'living', now(), $1, $2, $3, now(), null)
     on conflict (id) do update set
       booted_at = coalesce(organism_state.booted_at, now()),
       library_cards = excluded.library_cards,
       bindings = excluded.bindings,
       reflexes_answered = excluded.reflexes_answered,
       auto_op = 'living',
       last_pulse_at = now(),
       last_error = null`,
    [seeded.cards, seeded.bindings, reflexes],
  );
}

async function runSeed(): Promise<void> {
  const sql = await getSql();
  await sql.query(
    "insert into organism_state (id, auto_op) values (1, 'missing') on conflict (id) do nothing",
    [],
  );
  const existing = await sql.query<StateRow>(
    "select auto_op, booted_at, library_cards, bindings, last_pulse_at, last_error from organism_state where id = 1",
  );
  const already = existing[0];
  const catalogSize = libraryCatalog().length;
  const living = already?.auto_op === "living" && (already.library_cards ?? 0) >= catalogSize;

  const seeded = living
    ? { cards: already.library_cards, bindings: already.bindings }
    : await seedLibrary(sql);

  const alreadyPulsed = await sql.query<{ n: number }>(
    "select count(*)::int as n from ai_pulses where kind = 'auto' and query = 'organism.boot'",
  );
  if ((alreadyPulsed[0]?.n ?? 0) === 0) {
    await fireBootPulse(sql, seeded);
  }

  const reflexes = await fireReflexes(sql);
  await markLiving(sql, seeded, reflexes);
  try {
    const { ensureBooks } = await import("@/lib/erp/boot.server");
    await ensureBooks();
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    await sql.query("update organism_state set last_error = $1 where id = 1", [
      message.slice(0, 400),
    ]);
  }
  try {
    const { ensureModuleOs } = await import("@/lib/modules/boot.server");
    await ensureModuleOs();
  } catch {
    // Module OS is the nerve of the AI rack. Books still stand if it fails.
  }
}

/**
 * Auto-operation: migrate (via getSql), upsert organs + ligaments, index the
 * library, bind cards, publish organism.booted, fire diagnosis + every reflex.
 * Grok is not the on-switch. Safe to call on every request.
 */
export async function ensureOrganismSnapshot(): Promise<OrganismSnapshot> {
  if (!seedChain) {
    seedChain = runSeed().catch((err) => {
      seedChain = null;
      throw err;
    });
  }
  try {
    await seedChain;
  } catch {
    seedChain = runSeed().catch((err) => {
      seedChain = null;
      throw err;
    });
    await seedChain;
  }
  return readOrganismSnapshot();
}

export async function markBootError(message: string): Promise<OrganismSnapshot> {
  try {
    const sql = await getSql();
    await sql.query(
      `insert into organism_state (id, auto_op, last_error)
       values (1, 'partial', $1)
       on conflict (id) do update set auto_op = 'partial', last_error = excluded.last_error`,
      [message],
    );
    return readOrganismSnapshot();
  } catch {
    return emptySnapshot(message, "partial");
  }
}

export { emptySnapshot };
