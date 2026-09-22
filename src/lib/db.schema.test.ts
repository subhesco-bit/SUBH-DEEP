import assert from "node:assert/strict";
import { readdir, readFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, it } from "node:test";
import { PGlite } from "@electric-sql/pglite";
import { pendingMigrations } from "../../scripts/migration-plan.mjs";

const migrationsDir = join(dirname(fileURLToPath(import.meta.url)), "../../migrations");

async function applyAll(): Promise<PGlite> {
  const pg = new PGlite();
  await pg.waitReady;
  await pg.exec(
    "create table if not exists _migrations (name text primary key, applied_at timestamptz not null default now())",
  );
  const entries = await readdir(migrationsDir);
  const files = pendingMigrations(entries, []);
  for (const { name } of files) {
    const text = await readFile(join(migrationsDir, name), "utf8");
    await pg.transaction(async (tx) => {
      await tx.exec(text);
      await tx.query("insert into _migrations (name) values ($1)", [name]);
    });
  }
  return pg;
}

describe("database migrations", () => {
  it("applies 0002–0012 on a fresh database and locks remaining mass", async () => {
    const pg = await applyAll();
    const applied = await pg.query<{ name: string }>("select name from _migrations order by name");
    const names = applied.rows.map((r) => r.name);
    assert.ok(names.includes("0002_lattice_organism.sql"));
    assert.ok(names.includes("0003_library_auto_op.sql"));
    assert.ok(names.includes("0004_rural_erp.sql"));
    assert.ok(names.includes("0005_rural_erp_remaining.sql"));
    assert.ok(names.includes("0006_schema_integrity.sql"));
    assert.ok(names.includes("0007_module_os.sql"));
    assert.ok(names.includes("0008_erp_platform.sql"));
    assert.ok(names.includes("0010_three_stalls.sql"));
    assert.ok(names.includes("0011_pulse_remainder.sql"));
    assert.ok(names.includes("0012_named_remainder.sql"));

    const lots = await pg.query<{ is_nullable: string; column_default: string | null }>(
      `select is_nullable, column_default from information_schema.columns
       where table_name = 'erp_lots' and column_name = 'remaining_grams'`,
    );
    assert.equal(lots.rows[0]?.is_nullable, "NO");

    const freight = await pg.query<{ is_nullable: string }>(
      `select is_nullable from information_schema.columns
       where table_name = 'erp_orders' and column_name = 'freight_paise_per_kg'`,
    );
    assert.equal(freight.rows[0]?.is_nullable, "NO");

    await pg.query("insert into erp_fpo (id, name, village, district) values ('fpo','F','V','D')");
    await pg.query(
      "insert into erp_cells (id, name, household, fpo_id, village) values ('c1','N','H','fpo','V')",
    );
    await pg.query(
      `insert into erp_lots (id, cell_id, fpo_id, variety, commodity, grams, remaining_grams, status)
       values ('lot1','c1','fpo','Chakhao','black rice', 1000, 1000, 'minted')`,
    );

    await assert.rejects(
      () =>
        pg.query(
          "update erp_lots set remaining_grams = 2000 where id = 'lot1'",
        ),
      /remaining/i,
    );

    await pg.query("update erp_lots set remaining_grams = remaining_grams - 400 where id = 'lot1'");
    const left = await pg.query<{ remaining_grams: number }>(
      "select remaining_grams from erp_lots where id = 'lot1'",
    );
    assert.equal(left.rows[0]?.remaining_grams, 600);

    await pg.query("insert into organs (id, name, short, dora, layer, status, role, thesis, silo, prosperity, x, y) values ('lot','Lot','lot','d','body','gap','organ','t','s','p',1,1)");
    await pg.query(
      "insert into library_cards (id, kind, title, body, source, organ_ids) values ('lib-lot','organ','Lot','body','test','[\"lot\"]'::jsonb)",
    );
    await pg.query("insert into library_bindings (card_id, organ_id) values ('lib-lot','lot')");
    await assert.rejects(
      () => pg.query("insert into library_bindings (card_id, organ_id) values ('lib-lot','ghost')"),
      /foreign key|organs/i,
    );

    await pg.close();
  });

  it("is idempotent — a second apply of 0006 does not throw", async () => {
    const pg = await applyAll();
    const text = await readFile(join(migrationsDir, "0006_schema_integrity.sql"), "utf8");
    await pg.exec(text);
    const n = await pg.query<{ n: number }>("select count(*)::int as n from _migrations");
    assert.equal(n.rows[0]?.n, 10);
    await pg.close();
  });
});
