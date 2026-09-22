//#region node_modules/.nitro/vite/services/ssr/assets/db-C3Cj9Z-X.js
var _0002_lattice_organism_default = "-- AFRERA organism schema: lattice + AI-integrated library + event spine.\n-- Auth is off. Rows are unowned world state (doctrine, not personal data).\n\ncreate table if not exists organs (\n  id text primary key,\n  name text not null,\n  short text not null,\n  dora text not null,\n  layer text not null,\n  status text not null,\n  role text not null default 'organ',\n  thesis text not null,\n  silo text not null,\n  prosperity text not null,\n  x integer not null,\n  y integer not null,\n  binds jsonb not null default '[]'::jsonb\n);\n\ncreate table if not exists ligaments (\n  id text primary key,\n  from_id text not null,\n  to_id text not null,\n  name text not null,\n  kind text not null,\n  status text not null,\n  signal text not null,\n  today text not null,\n  contract text not null,\n  thought text not null\n);\n\ncreate table if not exists library_cards (\n  id text primary key,\n  kind text not null,\n  title text not null,\n  body text not null,\n  source text not null,\n  signal text,\n  organ_ids jsonb not null default '[]'::jsonb,\n  indexed_at timestamptz not null default now()\n);\n\ncreate table if not exists library_bindings (\n  card_id text not null references library_cards(id) on delete cascade,\n  organ_id text not null,\n  relevance real not null default 1,\n  primary key (card_id, organ_id)\n);\n\ncreate table if not exists spine_events (\n  id serial primary key,\n  signal text not null,\n  organ_id text,\n  ligament_id text,\n  payload jsonb not null default '{}'::jsonb,\n  created_at timestamptz not null default now()\n);\n\ncreate table if not exists ai_pulses (\n  id serial primary key,\n  kind text not null,\n  query text not null,\n  reading text not null,\n  card_ids jsonb not null default '[]'::jsonb,\n  organ_id text,\n  source text not null default 'library',\n  created_at timestamptz not null default now()\n);\n\ncreate table if not exists organism_state (\n  id integer primary key default 1 check (id = 1),\n  booted_at timestamptz,\n  library_cards integer not null default 0,\n  bindings integer not null default 0,\n  auto_op text not null default 'missing',\n  last_pulse_at timestamptz,\n  last_error text\n);\n\ncreate index if not exists ligaments_from_idx on ligaments (from_id);\ncreate index if not exists ligaments_to_idx on ligaments (to_id);\ncreate index if not exists ligaments_status_idx on ligaments (status);\ncreate index if not exists library_cards_kind_idx on library_cards (kind);\ncreate index if not exists library_bindings_organ_idx on library_bindings (organ_id);\ncreate index if not exists spine_events_created_idx on spine_events (created_at desc);\ncreate index if not exists ai_pulses_created_idx on ai_pulses (created_at desc);\n\ninsert into organism_state (id, auto_op)\nvalues (1, 'missing')\non conflict (id) do nothing;\n";
var _0003_library_auto_op_default = "-- Repair pass for the AI-integrated library.\n-- 0002 was the organism schema, but it was edited after some previews had\n-- already recorded it in _migrations, so library tables never appeared.\n-- GitHub M645100 initialize() also defaulted syncDatabase to false — the\n-- catalog lived in memory, the spine never published, auto-op stayed missing.\n-- Every statement here is idempotent.\n\ncreate table if not exists organs (\n  id text primary key,\n  name text not null,\n  short text not null,\n  dora text not null,\n  layer text not null,\n  status text not null,\n  role text not null default 'organ',\n  thesis text not null,\n  silo text not null,\n  prosperity text not null,\n  x integer not null,\n  y integer not null,\n  binds jsonb not null default '[]'::jsonb\n);\n\nalter table organs add column if not exists role text not null default 'organ';\nalter table organs add column if not exists binds jsonb not null default '[]'::jsonb;\nalter table organs add column if not exists thesis text not null default '';\nalter table organs add column if not exists silo text not null default '';\nalter table organs add column if not exists prosperity text not null default '';\n\ncreate table if not exists ligaments (\n  id text primary key,\n  from_id text not null,\n  to_id text not null,\n  name text not null,\n  kind text not null,\n  status text not null,\n  signal text not null,\n  today text not null,\n  contract text not null,\n  thought text not null\n);\n\ncreate table if not exists library_cards (\n  id text primary key,\n  kind text not null,\n  title text not null,\n  body text not null,\n  source text not null,\n  signal text,\n  organ_ids jsonb not null default '[]'::jsonb,\n  indexed_at timestamptz not null default now()\n);\n\nalter table library_cards add column if not exists signal text;\nalter table library_cards add column if not exists organ_ids jsonb not null default '[]'::jsonb;\nalter table library_cards add column if not exists indexed_at timestamptz not null default now();\n\ncreate table if not exists library_bindings (\n  card_id text not null references library_cards(id) on delete cascade,\n  organ_id text not null,\n  relevance real not null default 1,\n  primary key (card_id, organ_id)\n);\n\ncreate table if not exists spine_events (\n  id serial primary key,\n  signal text not null,\n  organ_id text,\n  ligament_id text,\n  payload jsonb not null default '{}'::jsonb,\n  created_at timestamptz not null default now()\n);\n\ncreate table if not exists ai_pulses (\n  id serial primary key,\n  kind text not null,\n  query text not null,\n  reading text not null,\n  card_ids jsonb not null default '[]'::jsonb,\n  organ_id text,\n  source text not null default 'library',\n  created_at timestamptz not null default now()\n);\n\ncreate table if not exists organism_state (\n  id integer primary key default 1 check (id = 1),\n  booted_at timestamptz,\n  library_cards integer not null default 0,\n  bindings integer not null default 0,\n  auto_op text not null default 'missing',\n  last_pulse_at timestamptz,\n  last_error text\n);\n\nalter table organism_state add column if not exists booted_at timestamptz;\nalter table organism_state add column if not exists library_cards integer not null default 0;\nalter table organism_state add column if not exists bindings integer not null default 0;\nalter table organism_state add column if not exists auto_op text not null default 'missing';\nalter table organism_state add column if not exists last_pulse_at timestamptz;\nalter table organism_state add column if not exists last_error text;\n\ncreate index if not exists ligaments_from_idx on ligaments (from_id);\ncreate index if not exists ligaments_to_idx on ligaments (to_id);\ncreate index if not exists ligaments_status_idx on ligaments (status);\ncreate index if not exists library_cards_kind_idx on library_cards (kind);\ncreate index if not exists library_bindings_organ_idx on library_bindings (organ_id);\ncreate index if not exists spine_events_created_idx on spine_events (created_at desc);\ncreate index if not exists ai_pulses_created_idx on ai_pulses (created_at desc);\n\ninsert into organism_state (id, auto_op)\nvalues (1, 'missing')\non conflict (id) do nothing;\n";
var _0004_rural_erp_default = "-- AFRERA rural ERP: bone of the organism.\n-- Unowned village books. Amounts are integer paise; mass is integer grams.\n-- Prices are always declared by a clerk — never invented by AI.\n\ncreate table if not exists erp_fpo (\n  id text primary key,\n  name text not null,\n  village text not null,\n  district text not null,\n  split_rule text not null default 'qty_weighted'\n);\n\ncreate table if not exists erp_cells (\n  id text primary key,\n  name text not null,\n  household text not null,\n  fpo_id text not null references erp_fpo(id),\n  village text not null,\n  acres_centi integer not null default 0,\n  notes text not null default ''\n);\n\ncreate table if not exists erp_lots (\n  id text primary key,\n  cell_id text not null references erp_cells(id),\n  fpo_id text not null references erp_fpo(id),\n  variety text not null,\n  commodity text not null,\n  grams integer not null,\n  grade text,\n  gi_marker text,\n  moisture_bp integer,\n  status text not null,\n  minted_at timestamptz not null default now()\n);\n\ncreate table if not exists erp_receipts (\n  id text primary key,\n  lot_id text not null references erp_lots(id),\n  facility text not null,\n  qty_grams integer not null,\n  status text not null,\n  lender text,\n  pledged_at timestamptz,\n  created_at timestamptz not null default now()\n);\n\ncreate table if not exists erp_receipt_events (\n  id serial primary key,\n  receipt_id text not null references erp_receipts(id) on delete cascade,\n  event text not null,\n  note text,\n  created_at timestamptz not null default now()\n);\n\ncreate table if not exists erp_orders (\n  id text primary key,\n  lot_id text not null references erp_lots(id),\n  buyer text not null,\n  qty_grams integer not null,\n  price_paise_per_kg integer not null,\n  status text not null,\n  hours_to_pay integer,\n  settled_at timestamptz,\n  payment_ref text,\n  created_at timestamptz not null default now()\n);\n\ncreate table if not exists erp_journal (\n  id serial primary key,\n  entry_id text not null,\n  cell_id text,\n  lot_id text,\n  organ_id text not null,\n  account text not null,\n  side text not null,\n  amount_paise integer not null,\n  memo text not null,\n  created_at timestamptz not null default now()\n);\n\ncreate table if not exists erp_inputs (\n  id serial primary key,\n  cell_id text not null references erp_cells(id),\n  kind text not null,\n  qty integer not null,\n  unit text not null,\n  amount_paise integer not null,\n  memo text not null,\n  created_at timestamptz not null default now()\n);\n\ncreate table if not exists erp_payouts (\n  id serial primary key,\n  fpo_id text not null references erp_fpo(id),\n  cell_id text not null references erp_cells(id),\n  order_id text not null references erp_orders(id),\n  qty_grams integer not null,\n  amount_paise integer not null,\n  status text not null,\n  payment_ref text,\n  created_at timestamptz not null default now()\n);\n\ncreate index if not exists erp_lots_cell_idx on erp_lots (cell_id);\ncreate index if not exists erp_lots_status_idx on erp_lots (status);\ncreate index if not exists erp_receipts_lot_idx on erp_receipts (lot_id);\ncreate index if not exists erp_orders_lot_idx on erp_orders (lot_id);\ncreate index if not exists erp_journal_cell_idx on erp_journal (cell_id);\ncreate index if not exists erp_journal_lot_idx on erp_journal (lot_id);\ncreate index if not exists erp_payouts_cell_idx on erp_payouts (cell_id);\n";
var _0005_rural_erp_remaining_default = "-- Honest remaining mass, declared freight, pooled FPO offtake.\n-- Never edit 0004; remaining is a tissue of the same lot body.\n\nalter table erp_lots add column if not exists remaining_grams integer;\nupdate erp_lots set remaining_grams = grams where remaining_grams is null;\n\nalter table erp_receipts add column if not exists remaining_grams integer;\nupdate erp_receipts set remaining_grams = qty_grams where remaining_grams is null;\n\nalter table erp_orders add column if not exists pool_id text;\nalter table erp_orders add column if not exists freight_paise_per_kg integer;\nupdate erp_orders set freight_paise_per_kg = 400 where freight_paise_per_kg is null;\n\ncreate index if not exists erp_orders_pool_idx on erp_orders (pool_id);\n";
var _0006_schema_integrity_default = "-- Repair remaining mass, declared freight, journal rules, and the indexes the books query.\n-- 0005 added remaining_grams as nullable. NULL minus grams poisons the lot body.\n-- Never edit 0002–0005; they are already recorded in _migrations.\n\n-- Remaining mass is a tissue of the same lot / receipt body.\nupdate erp_lots set remaining_grams = grams where remaining_grams is null;\nupdate erp_receipts set remaining_grams = qty_grams where remaining_grams is null;\nalter table erp_lots alter column remaining_grams set default 0;\nalter table erp_lots alter column remaining_grams set not null;\nalter table erp_receipts alter column remaining_grams set default 0;\nalter table erp_receipts alter column remaining_grams set not null;\n\nalter table erp_lots drop constraint if exists erp_lots_remaining_ck;\nalter table erp_lots add constraint erp_lots_remaining_ck\n  check (remaining_grams >= 0 and remaining_grams <= grams);\n\nalter table erp_receipts drop constraint if exists erp_receipts_remaining_ck;\nalter table erp_receipts add constraint erp_receipts_remaining_ck\n  check (remaining_grams >= 0 and remaining_grams <= qty_grams);\n\n-- Freight is declared. Null means zero, never an invented ₹4/kg.\nupdate erp_orders set freight_paise_per_kg = 0 where freight_paise_per_kg is null;\nalter table erp_orders alter column freight_paise_per_kg set default 0;\nalter table erp_orders alter column freight_paise_per_kg set not null;\n\nalter table erp_lots drop constraint if exists erp_lots_status_ck;\nalter table erp_lots add constraint erp_lots_status_ck\n  check (status in ('minted', 'in_warehouse', 'listed', 'pledged', 'settled'));\n\nalter table erp_receipts drop constraint if exists erp_receipts_status_ck;\nalter table erp_receipts add constraint erp_receipts_status_ck\n  check (status in ('inward', 'pledged', 'released'));\n\nalter table erp_orders drop constraint if exists erp_orders_status_ck;\nalter table erp_orders add constraint erp_orders_status_ck\n  check (status in ('open', 'settled'));\n\nalter table erp_payouts drop constraint if exists erp_payouts_status_ck;\nalter table erp_payouts add constraint erp_payouts_status_ck\n  check (status in ('pending', 'paid'));\n\nalter table erp_journal drop constraint if exists erp_journal_side_ck;\nalter table erp_journal add constraint erp_journal_side_ck\n  check (side in ('debit', 'credit'));\n\nalter table erp_journal drop constraint if exists erp_journal_amount_ck;\nalter table erp_journal add constraint erp_journal_amount_ck\n  check (amount_paise >= 0);\n\nalter table organism_state add column if not exists reflexes_answered integer not null default 0;\n\ncreate index if not exists erp_journal_entry_idx on erp_journal (entry_id);\ncreate index if not exists erp_orders_status_idx on erp_orders (status);\ncreate index if not exists erp_receipts_status_idx on erp_receipts (status);\ncreate index if not exists ai_pulses_kind_idx on ai_pulses (kind);\ncreate index if not exists spine_events_signal_idx on spine_events (signal);\n\nalter table library_bindings drop constraint if exists library_bindings_organ_fk;\nalter table library_bindings add constraint library_bindings_organ_fk\n  foreign key (organ_id) references organs(id) on delete cascade;\n";
var _0007_module_os_default = "-- Module OS: one bus, named workflows, decision tracks.\n-- AI may propose. It may not write rupees. Commands require a human.\n\ncreate table if not exists module_state (\n  id integer primary key default 1 check (id = 1),\n  booted_at timestamptz,\n  living_plugs integer not null default 0,\n  last_run_id text,\n  last_error text\n);\n\ninsert into module_state (id) values (1) on conflict (id) do nothing;\n\ncreate table if not exists module_runs (\n  id text primary key,\n  workflow_id text not null,\n  organ_id text not null,\n  lot_id text,\n  status text not null,\n  started_at timestamptz not null default now(),\n  finished_at timestamptz\n);\n\ncreate table if not exists module_steps (\n  id serial primary key,\n  run_id text not null references module_runs(id) on delete cascade,\n  seq integer not null,\n  module_id text not null,\n  step_code text not null,\n  kind text not null,\n  organ_id text not null,\n  decision text not null,\n  reason text not null,\n  algorithm text,\n  rupee_write boolean not null default false,\n  payload jsonb not null default '{}'::jsonb,\n  created_at timestamptz not null default now()\n);\n\ncreate table if not exists module_messages (\n  id serial primary key,\n  run_id text not null references module_runs(id) on delete cascade,\n  from_module text not null,\n  to_module text not null,\n  signal text not null,\n  envelope jsonb not null default '{}'::jsonb,\n  created_at timestamptz not null default now()\n);\n\nalter table module_runs drop constraint if exists module_runs_status_ck;\nalter table module_runs add constraint module_runs_status_ck\n  check (status in ('running', 'passed', 'blocked', 'deferred'));\n\nalter table module_steps drop constraint if exists module_steps_decision_ck;\nalter table module_steps add constraint module_steps_decision_ck\n  check (decision in ('pass', 'block', 'defer', 'propose'));\n\ncreate index if not exists module_runs_workflow_idx on module_runs (workflow_id, started_at desc);\ncreate index if not exists module_steps_run_idx on module_steps (run_id, seq);\ncreate index if not exists module_messages_run_idx on module_messages (run_id);\n";
var _0008_erp_platform_default = "-- Rural ERP platform: season, documents, declared process (harvest → saleable).\n-- Losses are clerk-declared. Remaining mass stays on the same lot body.\n\ncreate table if not exists erp_seasons (\n  id text primary key,\n  name text not null,\n  village text not null,\n  status text not null default 'open',\n  opened_at timestamptz not null default now(),\n  closed_at timestamptz\n);\n\ninsert into erp_seasons (id, name, village, status)\nvalues ('magh-2026', 'Magh 2026', 'Langthasa', 'open')\non conflict (id) do nothing;\n\ncreate table if not exists erp_documents (\n  id text primary key,\n  kind text not null,\n  ref_id text not null,\n  cell_id text,\n  lot_id text,\n  title text not null,\n  body text not null,\n  created_at timestamptz not null default now()\n);\n\ncreate table if not exists erp_process (\n  id text primary key,\n  lot_id text not null references erp_lots(id),\n  kind text not null,\n  in_grams integer not null,\n  loss_grams integer not null,\n  out_grams integer not null,\n  note text not null default '',\n  created_at timestamptz not null default now(),\n  check (in_grams > 0),\n  check (loss_grams >= 0),\n  check (out_grams >= 0),\n  check (in_grams = out_grams + loss_grams)\n);\n\ncreate index if not exists erp_documents_kind_idx on erp_documents (kind, created_at desc);\ncreate index if not exists erp_process_lot_idx on erp_process (lot_id);\n\nalter table erp_seasons drop constraint if exists erp_seasons_status_ck;\nalter table erp_seasons add constraint erp_seasons_status_ck\n  check (status in ('open', 'closed'));\n\nalter table erp_documents drop constraint if exists erp_documents_kind_ck;\nalter table erp_documents add constraint erp_documents_kind_ck\n  check (kind in ('harvest', 'warehouse', 'offtake', 'settle', 'process', 'statement'));\n\nalter table erp_process drop constraint if exists erp_process_kind_ck;\nalter table erp_process add constraint erp_process_kind_ck\n  check (kind in ('drying', 'milling', 'cleaning', 'grading'));\n";
/**
* Migration bookkeeping shared by the two appliers — `scripts/migrate.mjs`
* (deploy, `readdir`) and `src/lib/db.ts` (PGLite preview, `import.meta.glob`).
*
* Applied files are keyed by BASENAME, so the same file applies once no matter
* which directory it is globbed from. That is what makes the auth schema safe to
* copy from `migrations/auth/` into `migrations/` when an app turns sign-in on:
* a database that already has `0001_auth.sql` will not re-run it.
*
* Neither applier descends into subdirectories, so `migrations/auth/*.sql` is
* out of scope for both until it is copied up.
*/
/**
* The `_migrations` key for a migration path (or bare filename).
* @param {string} path
* @returns {string}
*/
function migrationName(path) {
	return path.split("/").pop() ?? path;
}
/**
* @param {string} path
* @returns {boolean}
*/
function isMigrationFile(path) {
	return path.endsWith(".sql");
}
/**
* Migrations in `paths` that are not yet in `applied`, in apply order.
* Non-`.sql` entries (a `readdir` also yields `migrations/auth/`) are dropped.
* @param {Iterable<string>} paths
* @param {Iterable<string>} applied
* @returns {Array<{ name: string, path: string }>}
*/
function pendingMigrations(paths, applied) {
	const done = new Set(applied);
	return [...paths].filter(isMigrationFile).map((path) => ({
		name: migrationName(path),
		path
	})).sort((a, b) => a.name.localeCompare(b.name)).filter(({ name }) => !done.has(name));
}
var rawDatabaseUrl = typeof process !== "undefined" ? process.env.DATABASE_URL : void 0;
var databaseUrl = rawDatabaseUrl && rawDatabaseUrl.trim() ? rawDatabaseUrl : void 0;
/**
* Active backend: real **Neon** when `DATABASE_URL` is set (deployed / configured
* sandbox), otherwise a local embedded **PGLite** (Postgres compiled to WASM) so
* the app has a working database even with nothing configured — the live preview
* included. Swap in Neon later by just setting `DATABASE_URL`; no code changes.
*/
var dbSource = databaseUrl ? "neon" : "pglite";
/**
* Init state lives on globalThis as promises: dev HMR creates new instances of
* this module, and two instances racing module-level state would open a second
* pool or run two concurrent PGLite migration passes (whose duplicate
* `_migrations` insert rejects — and would get memoized, poisoning every later
* `getSql()`). A failed init clears its slot so the next call retries.
*/
var globalRef = globalThis;
/**
* Result-type parity: Postgres sends every value as text plus a type OID — the
* JS value is the DRIVER's parsing choice, and pg and PGLite disagree (pg:
* int8 -> string, date -> local-midnight Date; PGLite: int8 -> BigInt, which
* JSON.stringify rejects, date -> UTC Date). Normalize both so preview and
* production return identical, JSON-safe shapes:
*   int8/bigint (incl. count(*)) -> number (past 2^53 loses precision — cast
*                                   `::text` if you ever need huge integers)
*   date                         -> 'YYYY-MM-DD' string
*   interval                     -> Postgres interval text
* numeric already comes back as a string on both (arbitrary precision).
*/
var OID_INT8 = 20;
var OID_DATE = 1082;
var OID_INTERVAL = 1186;
var identity = (v) => v;
/** Wrap a query runner in the tagged-template + `.query()` `Sql` surface. */
function toSql(run) {
	const sql = (async (strings, ...values) => {
		let text = strings[0];
		for (let i = 0; i < values.length; i += 1) text += `$${i + 1}${strings[i + 1]}`;
		return run(text, values);
	});
	sql.query = (text, params = []) => run(text, params);
	return sql;
}
function createNeonSql() {
	globalRef.__pgSqlPromise__ ??= (async () => {
		const { Pool, types } = await import("../_libs/pg.mjs").then((n) => n.t);
		types.setTypeParser(OID_INT8, Number);
		types.setTypeParser(OID_DATE, identity);
		types.setTypeParser(OID_INTERVAL, identity);
		const pool = new Pool({ connectionString: databaseUrl });
		return toSql(async (text, params) => {
			return (await pool.query(text, params)).rows;
		});
	})().catch((err) => {
		globalRef.__pgSqlPromise__ = void 0;
		throw err;
	});
	return globalRef.__pgSqlPromise__;
}
async function createPgliteSql() {
	globalRef.__pgliteInstance__ ??= (async () => {
		const { PGlite } = await import("../_libs/electric-sql__pglite.mjs").then((n) => n.t);
		const pg = new PGlite({ parsers: {
			[OID_INT8]: Number,
			[OID_DATE]: identity,
			[OID_INTERVAL]: identity
		} });
		await pg.waitReady;
		await pg.exec("create table if not exists _migrations (name text primary key, applied_at timestamptz not null default now())");
		return pg;
	})().catch((err) => {
		globalRef.__pgliteInstance__ = void 0;
		throw err;
	});
	const pg = await globalRef.__pgliteInstance__;
	const migrate = async () => {
		const migrations = /* #__PURE__ */ Object.assign({
			"/migrations/0002_lattice_organism.sql": _0002_lattice_organism_default,
			"/migrations/0003_library_auto_op.sql": _0003_library_auto_op_default,
			"/migrations/0004_rural_erp.sql": _0004_rural_erp_default,
			"/migrations/0005_rural_erp_remaining.sql": _0005_rural_erp_remaining_default,
			"/migrations/0006_schema_integrity.sql": _0006_schema_integrity_default,
			"/migrations/0007_module_os.sql": _0007_module_os_default,
			"/migrations/0008_erp_platform.sql": _0008_erp_platform_default
		});
		const done = (await pg.query("select name from _migrations")).rows.map((r) => r.name);
		for (const { name, path } of pendingMigrations(Object.keys(migrations), done)) await pg.transaction(async (tx) => {
			await tx.exec(migrations[path]);
			await tx.query("insert into _migrations (name) values ($1)", [name]);
		});
	};
	const pass = (globalRef.__pgliteMigrateChain__ ?? Promise.resolve()).catch(() => void 0).then(migrate);
	globalRef.__pgliteMigrateChain__ = pass;
	await pass;
	return toSql(async (text, params) => {
		return (await pg.query(text, params)).rows;
	});
}
var sqlPromise = null;
async function createSql() {
	if (typeof window !== "undefined") throw new Error("@/lib/db is server-only — call getSql() from a createServerFn handler or a server route loader, never from client code.");
	return dbSource === "neon" ? createNeonSql() : createPgliteSql();
}
/**
* Get the shared, **server-only** SQL client. Neon when `DATABASE_URL` is set,
* otherwise the local PGLite fallback. Memoized — safe to call per request.
*
* Schema comes from `migrations/*.sql` (0002–0006), auto-applied before the first query on
* both backends — define tables there, never inline in server functions.
*/
function getSql() {
	sqlPromise ??= createSql().catch((err) => {
		sqlPromise = null;
		throw err;
	});
	return sqlPromise;
}
/**
* Finish DB bootstrap before the server handles traffic.
*
* - **PGLite** (preview / no `DATABASE_URL`): open the in-memory DB and apply
*   `migrations/*.sql`. Idempotent — concurrent callers share one promise.
* - **Neon**: no-op (pool is created lazily on first query).
*
* Vite `configureServer` awaits this at dev startup; production imports of this
* module kick it off immediately (see bottom of file).
*/
function ensureDbReady() {
	if (dbSource !== "pglite") return Promise.resolve();
	return getSql().then(() => void 0);
}
var globalBoot = globalThis;
if (typeof window === "undefined" && dbSource === "pglite") globalBoot.__pgBootstrapPromise__ ??= ensureDbReady().catch((err) => {
	globalBoot.__pgBootstrapPromise__ = void 0;
	console.error("[db] PGLite bootstrap failed:", err);
	throw err;
});
//#endregion
export { getSql as t };
