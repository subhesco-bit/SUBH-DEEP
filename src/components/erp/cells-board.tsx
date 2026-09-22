import { useState } from "react";
import { useBooks } from "@/lib/erp/store";
import { useVillageBooks } from "@/components/erp/books-boot";
import { formatKg, formatRupee } from "@/lib/erp/money";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export function CellsBoard() {
  const books = useVillageBooks();
  const cells = books?.cells ?? [];
  const fpo = books?.fpo;
  const plantings = books?.plantings ?? [];
  const busy = useBooks((s) => s.busy);
  const error = useBooks((s) => s.error);
  const enroll = useBooks((s) => s.enroll);
  const [name, setName] = useState("");
  const [household, setHousehold] = useState("");
  const [acres, setAcres] = useState("");
  const [notes, setNotes] = useState("");

  return (
    <div className="grid gap-4 lg:grid-cols-[minmax(0,1.2fr)_minmax(280px,0.8fr)]">
      <section className="rounded-2xl border border-border bg-surface p-5 sm:p-6">
        <p className="text-[11px] font-medium uppercase tracking-[0.16em] text-muted">Habitat</p>
        <h2 className="mt-2 font-display text-3xl font-medium tracking-tight">Farmer cells</h2>
        <p className="mt-2 max-w-2xl text-sm leading-relaxed text-muted">
          Not a role list. Each row is a life in {fpo?.village ?? "the village"} — household, acres, remaining
          mass, farmgate.
        </p>
        {error ? <p className="mt-3 text-sm text-destructive">{error}</p> : null}
        {cells.length === 0 ? (
          <p className="mt-6 text-sm text-muted">No cells on the books yet.</p>
        ) : (
          <ul className="mt-6 divide-y divide-border">
            {cells.map((c) => (
              <li
                key={c.id}
                className="grid gap-2 py-4 sm:grid-cols-[minmax(0,1.3fr)_repeat(3,minmax(0,0.55fr))] sm:items-center"
              >
                <div>
                  <p className="font-medium">{c.name}</p>
                  <p className="text-xs text-muted">
                    {c.household} · {(c.acresCenti / 100).toFixed(1)} acres
                  </p>
                  <p className="mt-1 text-xs text-muted">{c.notes}</p>
                  {plantings
                    .filter((p) => p.cellId === c.id)
                    .map((p) => (
                      <p key={p.id} className="mt-1 font-mono text-[11px] text-partial">
                        {p.variety} · {p.season} · {p.status} · {p.plotName}
                      </p>
                    ))}
                  {(books?.herd ?? [])
                    .filter((h) => h.cellId === c.id)
                    .map((h) => (
                      <p key={h.id} className="mt-1 font-mono text-[11px] text-live">
                        {h.kind} · {h.head} head · {h.policyId ?? "cover gap"}
                      </p>
                    ))}
                </div>
                <div>
                  <Badge>{c.lotCount} lots</Badge>
                  <p className="mt-1 font-mono text-[11px] text-muted">{formatKg(c.remainingGrams)} left</p>
                </div>
                <p className="font-mono text-sm tabular-nums">{formatKg(c.kgOnBooks)}</p>
                <div>
                  <p className="font-mono text-sm tabular-nums text-live">{formatRupee(c.rupeeCreditPaise)}</p>
                  <p className="font-mono text-[11px] text-gap">{formatRupee(c.rupeeDebitPaise)} cost</p>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>
      <aside className="rounded-2xl border border-border bg-surface p-5">
        <h3 className="font-display text-xl">Enroll a cell</h3>
        <p className="mt-1 text-sm text-muted">A household enters the FPO as a life, not a login.</p>
        <form
          className="mt-4 space-y-3"
          onSubmit={(e) => {
            e.preventDefault();
            void enroll({ name, household, acres, notes }).then((ok) => {
              if (ok) {
                setName("");
                setHousehold("");
                setAcres("");
                setNotes("");
              }
            });
          }}
        >
          <label className="block">
            <span className="text-[11px] uppercase tracking-[0.14em] text-muted">Name</span>
            <Input className="mt-1.5" value={name} onChange={(e) => setName(e.target.value)} required />
          </label>
          <label className="block">
            <span className="text-[11px] uppercase tracking-[0.14em] text-muted">Household</span>
            <Input
              className="mt-1.5"
              value={household}
              onChange={(e) => setHousehold(e.target.value)}
              placeholder="House · persons"
              required
            />
          </label>
          <label className="block">
            <span className="text-[11px] uppercase tracking-[0.14em] text-muted">Acres</span>
            <Input
              className="mt-1.5"
              inputMode="decimal"
              value={acres}
              onChange={(e) => setAcres(e.target.value)}
              required
            />
          </label>
          <label className="block">
            <span className="text-[11px] uppercase tracking-[0.14em] text-muted">Notes</span>
            <Input className="mt-1.5" value={notes} onChange={(e) => setNotes(e.target.value)} />
          </label>
          <Button type="submit" disabled={busy} className="w-full">
            Enroll cell
          </Button>
        </form>
      </aside>
    </div>
  );
}
