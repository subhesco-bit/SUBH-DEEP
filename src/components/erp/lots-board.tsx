import { useBooks } from "@/lib/erp/store";
import { useVillageBooks } from "@/components/erp/books-boot";
import { formatKg } from "@/lib/erp/money";
import { Badge } from "@/components/ui/badge";
import { HarvestForm } from "./harvest-form";
import { LotActions } from "./lot-actions";
import { evidencePassport } from "@/lib/os/passport";

export function LotsBoard() {
  const books = useVillageBooks();
  const lots = books?.lots ?? [];
  const error = useBooks((s) => s.error);

  return (
    <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(280px,0.85fr)]">
      <section className="rounded-2xl border border-border bg-surface p-5 sm:p-6">
        <p className="text-[11px] font-medium uppercase tracking-[0.16em] text-muted">Genome of produce</p>
        <h2 className="mt-2 font-display text-3xl font-medium tracking-tight">Living lots</h2>
        <p className="mt-2 max-w-2xl text-sm leading-relaxed text-muted">
          One body from field to plate. Moisture, GI, warehouse remaining, and offtake are tissues of the same
          id. Selling part of a sack does not kill the rest.
        </p>
        {error ? <p className="mt-3 text-sm text-destructive">{error}</p> : null}
        {lots.length === 0 ? (
          <p className="mt-6 text-sm text-muted">No lots yet. Mint from the form.</p>
        ) : (
          <ul className="mt-6 divide-y divide-border">
            {lots.map((lot) => {
              const pass = books ? evidencePassport(lot, books) : null;
              const absent = pass?.atoms.filter((a) => a.confidence === "absent").length ?? 0;
              return (
              <li key={lot.id} className="py-4">
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <div>
                    <p className="font-medium">{lot.variety}</p>
                    <p className="font-mono text-[11px] text-muted">{lot.id}</p>
                    <p className="mt-1 text-sm text-muted">
                      {lot.cellName} · {formatKg(lot.remainingGrams)}
                      {lot.remainingGrams !== lot.grams ? ` of ${formatKg(lot.grams)}` : ""} · {lot.commodity}
                      {lot.moistureBp != null ? ` · ${(lot.moistureBp / 100).toFixed(1)}% moisture` : ""}
                    </p>
                    <div className="mt-2 flex flex-wrap gap-1.5">
                      {lot.giMinted ? <Badge variant="live">GI mint</Badge> : lot.giMarker ? <Badge variant="gap">GI unminted</Badge> : null}
                      {lot.plantingId ? <Badge variant="partial">planting closed</Badge> : null}
                      {lot.fusScore != null ? (
                        <Badge variant={lot.fusComplete ? "live" : "partial"}>FUS {lot.fusScore}</Badge>
                      ) : (
                        <Badge variant="gap">FUS unnamed</Badge>
                      )}
                      {pass ? (
                        <Badge variant={absent === 0 ? "live" : "partial"}>
                          passport {pass.atoms.length - absent}/{pass.atoms.length}
                        </Badge>
                      ) : null}
                    </div>
                  </div>
                  <Badge variant={lot.status === "settled" ? "live" : lot.status === "minted" ? "gap" : "partial"}>
                    {lot.status.replace("_", " ")}
                  </Badge>
                </div>
                <div className="mt-3">
                  <LotActions lot={lot} />
                </div>
              </li>
              );
            })}
          </ul>
        )}
      </section>
      <aside className="rounded-2xl border border-border bg-surface p-5">
        <h3 className="font-display text-xl">Mint</h3>
        <p className="mt-1 text-sm text-muted">Declared mass. The spine hears harvest.completed.</p>
        <div className="mt-4">
          <HarvestForm />
        </div>
      </aside>
    </div>
  );
}
