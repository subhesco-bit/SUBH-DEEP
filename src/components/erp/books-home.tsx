import { Link } from "@tanstack/react-router";
import { useBooks } from "@/lib/erp/store";
import { useVillageBooks } from "@/components/erp/books-boot";
import { formatKg, formatRupee, paiseFromKgPrice } from "@/lib/erp/money";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { HarvestForm } from "./harvest-form";
import { LotActions } from "./lot-actions";
import { useModuleOs } from "@/lib/modules/store";
import { CompanionPanel } from "@/components/app/companion-panel";
import { NeedNav } from "@/components/app/need-nav";
import { exceptions } from "@/lib/erp/platform";
import { proposeCompanion } from "@/lib/modules/companion";

const FLOW = [
  { n: "01", label: "Mint", hint: "Harvest names a cell" },
  { n: "02", label: "Godown", hint: "Same lot body inwards" },
  { n: "03", label: "Offtake", hint: "Declared ₹ / kg" },
  { n: "04", label: "Paid", hint: "paymentRef required" },
  { n: "05", label: "Farmgate", hint: "Hours-to-pay on the cell" },
];

export function BooksHome() {
  const books = useVillageBooks();
  const error = useBooks((s) => s.error);
  const kpis = books?.kpis;
  const fpo = books?.fpo;
  const copilot = useModuleOs((s) => s.snapshot?.copilot);
  const companion = books
    ? proposeCompanion(
        books,
        exceptions({
          journalBalanced: books.kpis.journalBalanced,
          lots: books.lots,
          receipts: books.receipts,
          orders: books.orders,
          payouts: books.payouts,
        }),
      )
    : null;

  return (
    <div className="space-y-4">
      <section className="rounded-2xl border border-border bg-surface p-5 sm:p-6">
        <p className="text-[11px] font-medium uppercase tracking-[0.16em] text-muted">
          Rural ERP · {fpo?.village ?? "Langthasa"}
        </p>
        <h2 className="mt-2 font-display text-3xl font-medium tracking-tight">Books of the cell</h2>
        <p className="mt-2 max-w-2xl text-sm leading-relaxed text-muted">
          Farmer is a cell. A harvest mints one lot. Warehouse takes the same body.
          Settlement credits the cell with a declared price — never invented ₹.
          Remaining mass stays on the lot. ERP is bone; the nerve may read, not write.
        </p>
        {fpo ? (
          <p className="mt-3 font-mono text-[11px] text-partial">
            {fpo.name} · {fpo.district} · split {fpo.splitRule}
          </p>
        ) : null}
        {error ? <p className="mt-3 text-sm text-destructive">{error}</p> : null}
        {companion ? (
          <div className="mt-4">
            <CompanionPanel reading={companion} compact />
          </div>
        ) : copilot ? (
          <p className="mt-3 rounded-xl border border-live/30 bg-background px-4 py-3 text-sm text-live">
            Copilot · {copilot}
          </p>
        ) : null}
        {books ? (
          <div className="mt-5">
            <NeedNav books={books} />
          </div>
        ) : null}
        <ol className="mt-5 grid grid-cols-2 gap-2 sm:grid-cols-5">
          {FLOW.map((step) => (
            <li key={step.n} className="rounded-xl border border-border bg-background px-3 py-3">
              <p className="font-mono text-[10px] text-muted">{step.n}</p>
              <p className="mt-1 text-sm font-medium">{step.label}</p>
              <p className="mt-0.5 text-[11px] text-muted">{step.hint}</p>
            </li>
          ))}
        </ol>
      </section>

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <Kpi label="Cells" value={String(kpis?.cells ?? "—")} />
        <Kpi label="Lots on books" value={String(kpis?.lots ?? "—")} />
        <Kpi label="In godown" value={kpis ? formatKg(kpis.kgInWarehouse) : "—"} />
        <Kpi
          label="Open offtake"
          value={kpis ? formatRupee(kpis.openPaise) : "—"}
          hint={kpis?.avgHoursToPay != null ? `${kpis.avgHoursToPay}h to pay` : "no settlement yet"}
        />
      </div>

      <div className="grid gap-4 lg:grid-cols-[minmax(0,1.1fr)_minmax(280px,0.9fr)]">
        <section className="rounded-2xl border border-border bg-surface p-5">
          <h3 className="font-display text-xl">Record harvest</h3>
          <p className="mt-1 text-sm text-muted">
            Publishes lot.mint and harvest.completed on the spine. Mass is declared.
          </p>
          <div className="mt-4">
            <HarvestForm />
          </div>
        </section>
        <section className="rounded-2xl border border-border bg-surface p-5">
          <h3 className="font-display text-xl">Rupee path</h3>
          <p className="mt-1 text-sm text-muted">Settled farmgate vs open offtake. Remaining mass is still a body.</p>
          <ul className="mt-4 space-y-2 text-sm">
            <li className="flex justify-between gap-3">
              <span className="text-muted">Farmgate paid</span>
              <span className="font-mono tabular-nums text-live">
                {kpis ? formatRupee(kpis.farmgatePaise) : "—"}
              </span>
            </li>
            <li className="flex justify-between gap-3">
              <span className="text-muted">Gross settled</span>
              <span className="font-mono tabular-nums text-live">{kpis ? formatRupee(kpis.settledPaise) : "—"}</span>
            </li>
            <li className="flex justify-between gap-3">
              <span className="text-muted">Open</span>
              <span className="font-mono tabular-nums text-gap">{kpis ? formatRupee(kpis.openPaise) : "—"}</span>
            </li>
            <li className="flex justify-between gap-3">
              <span className="text-muted">Remaining mass</span>
              <span className="font-mono tabular-nums">{kpis ? formatKg(kpis.kgRemaining) : "—"}</span>
            </li>
            <li className="flex justify-between gap-3">
              <span className="text-muted">Journal</span>
              <span className={kpis?.journalBalanced ? "text-live" : "text-gap"}>
                {kpis ? (kpis.journalBalanced ? "balanced" : "gap") : "—"}
              </span>
            </li>
          </ul>
          <p className="mt-4 text-xs leading-relaxed text-muted">{kpis?.integrityNote}</p>
          <div className="mt-4 flex flex-wrap gap-2">
            <Button asChild variant="outline" size="sm">
              <Link to="/ledger">Ledger</Link>
            </Button>
            <Button asChild variant="outline" size="sm">
              <Link to="/trade">Trade</Link>
            </Button>
            <Button asChild variant="outline" size="sm">
              <Link to="/platform">Platform</Link>
            </Button>
          </div>
        </section>
      </div>

      <section className="rounded-2xl border border-border bg-surface p-5">
        <div className="flex flex-wrap items-end justify-between gap-2">
          <h3 className="font-display text-xl">Living lots</h3>
          <Button asChild variant="ghost" size="sm">
            <Link to="/lots">All lots</Link>
          </Button>
        </div>
        {(books?.lots ?? []).length === 0 ? (
          <p className="mt-4 text-sm text-muted">No lots on the books. Mint a harvest from a farmer cell.</p>
        ) : (
          <ul className="mt-3 divide-y divide-border">
            {(books?.lots ?? []).slice(0, 6).map((lot) => {
              const open = books?.orders.find((o) => o.lotId === lot.id && o.status === "open");
              return (
                <li key={lot.id} className="flex flex-col gap-2 py-3 sm:flex-row sm:items-center sm:justify-between">
                  <div className="min-w-0">
                    <p className="font-medium">
                      {lot.variety}{" "}
                      <span className="font-mono text-[11px] text-muted">
                        {formatKg(lot.remainingGrams)}
                        {lot.remainingGrams !== lot.grams ? ` of ${formatKg(lot.grams)}` : ""}
                      </span>
                    </p>
                    <p className="text-xs text-muted">
                      {lot.cellName} · {lot.commodity}
                      {lot.giMarker ? ` · ${lot.giMarker}` : ""}
                    </p>
                  </div>
                  <div className="flex flex-wrap items-center gap-2">
                    <Badge variant={lotStatus(lot.status)}>{lot.status.replace("_", " ")}</Badge>
                    {open ? (
                      <span className="font-mono text-[11px] text-partial">
                        {formatRupee(paiseFromKgPrice(open.qtyGrams, open.pricePaisePerKg))} open
                      </span>
                    ) : null}
                    <LotActions lot={lot} compact />
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </section>
    </div>
  );
}

function Kpi({ label, value, hint }: { label: string; value: string; hint?: string }) {
  return (
    <div className="rounded-xl border border-border bg-surface px-3 py-3">
      <div className="text-[10px] uppercase tracking-[0.14em] text-muted">{label}</div>
      <div className="mt-1 font-mono text-lg tabular-nums">{value}</div>
      {hint ? <div className="mt-1 text-[11px] text-muted">{hint}</div> : null}
    </div>
  );
}

function lotStatus(status: string) {
  if (status === "settled") return "live" as const;
  if (status === "minted") return "gap" as const;
  if (status === "pledged") return "partial" as const;
  return "partial" as const;
}
