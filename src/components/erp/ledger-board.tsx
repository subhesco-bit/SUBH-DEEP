import { useState } from "react";
import { useBooks } from "@/lib/erp/store";
import { useVillageBooks } from "@/components/erp/books-boot";
import { formatRupee } from "@/lib/erp/money";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { CONCEPT_BY_ID } from "@/lib/lattice";

const KINDS = ["seed", "fodder", "energy", "labour", "cover"] as const;

export function LedgerBoard() {
  const books = useVillageBooks();
  const journal = books?.journal ?? [];
  const inputs = books?.inputs ?? [];
  const cells = books?.cells ?? [];
  const kpis = books?.kpis;
  const busy = useBooks((s) => s.busy);
  const error = useBooks((s) => s.error);
  const inputCost = useBooks((s) => s.inputCost);
  const [cellId, setCellId] = useState(cells[0]?.id ?? "c-ronghang");
  const [kind, setKind] = useState<(typeof KINDS)[number]>("energy");
  const [qty, setQty] = useState("40");
  const [unit, setUnit] = useState("kWh");
  const [amount, setAmount] = useState("320");
  const [memo, setMemo] = useState("Drying hours, declared");

  const credit = journal.filter((j) => j.side === "credit").reduce((n, j) => n + j.amountPaise, 0);
  const debit = journal.filter((j) => j.side === "debit").reduce((n, j) => n + j.amountPaise, 0);

  return (
    <div className="grid gap-4 lg:grid-cols-[minmax(0,1.2fr)_minmax(280px,0.8fr)]">
      <section className="rounded-2xl border border-border bg-surface p-5 sm:p-6">
        <p className="text-[11px] font-medium uppercase tracking-[0.16em] text-muted">Prosperity bile</p>
        <h2 className="mt-2 font-display text-3xl font-medium tracking-tight">Rupee ledger</h2>
        <p className="mt-2 max-w-2xl text-sm leading-relaxed text-muted">
          Every line names an organ. Cash in is debit. Farmgate is credit to the cell. Freight and energy are
          the other side of the same entry.
        </p>
        {error ? <p className="mt-3 text-sm text-destructive">{error}</p> : null}
        <div className="mt-4 flex flex-wrap gap-3 font-mono text-sm">
          <span className="text-live">Credit {formatRupee(credit)}</span>
          <span className="text-gap">Debit {formatRupee(debit)}</span>
          <Badge variant={kpis?.journalBalanced ? "live" : "gap"}>
            {kpis?.journalBalanced ? "balanced" : "gap"}
          </Badge>
        </div>
        {journal.length === 0 ? (
          <p className="mt-5 text-sm text-muted">No journal yet. Settle an offtake or post a cost.</p>
        ) : (
          <ul className="mt-5 divide-y divide-border">
            {journal.map((j) => (
              <li key={j.id} className="grid gap-1 py-3 sm:grid-cols-[minmax(0,1fr)_auto_auto]">
                <div>
                  <p className="text-sm">{j.memo}</p>
                  <p className="font-mono text-[11px] text-muted">
                    {CONCEPT_BY_ID[j.organId]?.short ?? j.organId} · {j.account} · {j.lotId ?? "cell"}
                  </p>
                </div>
                <Badge variant={j.side === "credit" ? "live" : "gap"}>{j.side}</Badge>
                <p className="font-mono text-sm tabular-nums">{formatRupee(j.amountPaise)}</p>
              </li>
            ))}
          </ul>
        )}
      </section>
      <aside className="space-y-4">
        <section className="rounded-2xl border border-border bg-surface p-5">
          <h3 className="font-display text-xl">Post input cost</h3>
          <p className="mt-1 text-sm text-muted">Declared only. Energy hits RECIE; cover hits insurance.</p>
          <form
            className="mt-4 space-y-3"
            onSubmit={(e) => {
              e.preventDefault();
              void inputCost({ cellId, kind, qty, unit, amount, memo });
            }}
          >
            <select
              className="flex h-11 w-full rounded-md border border-border bg-background px-3 text-sm"
              value={cellId}
              onChange={(e) => setCellId(e.target.value)}
              aria-label="Cell"
            >
              {cells.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
            <select
              className="flex h-11 w-full rounded-md border border-border bg-background px-3 text-sm"
              value={kind}
              onChange={(e) => setKind(e.target.value as (typeof KINDS)[number])}
              aria-label="Kind"
            >
              {KINDS.map((k) => (
                <option key={k} value={k}>
                  {k}
                </option>
              ))}
            </select>
            <div className="grid grid-cols-2 gap-2">
              <Input value={qty} onChange={(e) => setQty(e.target.value)} aria-label="Qty" />
              <Input value={unit} onChange={(e) => setUnit(e.target.value)} aria-label="Unit" />
            </div>
            <Input
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              aria-label="Rupees"
              placeholder="₹ declared"
            />
            <Input value={memo} onChange={(e) => setMemo(e.target.value)} aria-label="Memo" />
            <Button type="submit" disabled={busy} className="w-full">
              Post cost
            </Button>
          </form>
        </section>
        <section className="rounded-2xl border border-border bg-surface p-5">
          <h3 className="font-display text-xl">Inputs</h3>
          {inputs.length === 0 ? (
            <p className="mt-3 text-sm text-muted">No declared costs yet.</p>
          ) : (
            <ul className="mt-3 space-y-2">
              {inputs.map((i) => (
                <li key={i.id} className="text-sm">
                  <span className="text-muted">
                    {i.cellName} · {i.kind}
                  </span>
                  <span className="ml-2 font-mono tabular-nums">{formatRupee(i.amountPaise)}</span>
                </li>
              ))}
            </ul>
          )}
        </section>
      </aside>
    </div>
  );
}
