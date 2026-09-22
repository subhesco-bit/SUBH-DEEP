import { ArrowRight } from "lucide-react";
import {
  CONCEPT_BY_ID,
  bridgeStatusVariant,
  filterBridges,
} from "@/lib/lattice";
import { useLattice } from "@/lib/lattice/store";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function LigamentCatalog() {
  const statusFilter = useLattice((s) => s.statusFilter);
  const kindFilter = useLattice((s) => s.kindFilter);
  const query = useLattice((s) => s.query);
  const selectedBridgeId = useLattice((s) => s.selectedBridgeId);
  const selectBridge = useLattice((s) => s.selectBridge);
  const selectConcept = useLattice((s) => s.selectConcept);
  const proposed = useLattice((s) => s.proposed);
  const toggleProposed = useLattice((s) => s.toggleProposed);

  const rows = filterBridges({
    status: statusFilter,
    kind: kindFilter,
    query,
  });

  const selected = rows.find((b) => b.id === selectedBridgeId) ?? rows[0];

  return (
    <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
      <ul className="space-y-2">
        {rows.map((b) => {
          const from = CONCEPT_BY_ID[b.from];
          const to = CONCEPT_BY_ID[b.to];
          const active = selected?.id === b.id;
          return (
            <li key={b.id}>
              <button
                type="button"
                onClick={() => {
                  selectBridge(b.id);
                  selectConcept(b.from);
                }}
                className={cn(
                  "flex w-full items-start gap-3 rounded-xl border px-4 py-3 text-left transition-colors duration-150",
                  active ? "border-foreground bg-surface" : "border-border hover:bg-surface",
                )}
              >
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <Badge variant={bridgeStatusVariant(b.status)}>{b.status}</Badge>
                    <Badge>{b.kind}</Badge>
                    {proposed.includes(b.id) ? <Badge variant="solid">proposed</Badge> : null}
                  </div>
                  <p className="mt-2 font-display text-lg leading-snug">{b.name}</p>
                  <p className="mt-1 flex flex-wrap items-center gap-1 text-xs text-muted">
                    {from?.name}
                    <ArrowRight className="size-3" />
                    {to?.name}
                  </p>
                </div>
              </button>
            </li>
          );
        })}
        {rows.length === 0 ? (
          <li className="rounded-xl border border-border px-4 py-8 text-center text-sm text-muted">
            No ligaments match those filters.
          </li>
        ) : null}
      </ul>
      {selected ? (
        <article className="h-fit rounded-2xl border border-border bg-surface p-6">
          <div className="flex flex-wrap gap-2">
            <Badge variant={bridgeStatusVariant(selected.status)}>{selected.status}</Badge>
            <Badge>{selected.kind}</Badge>
          </div>
          <h2 className="mt-3 font-display text-2xl font-medium tracking-tight">{selected.name}</h2>
          <p className="mt-1 text-sm text-muted">
            {CONCEPT_BY_ID[selected.from]?.name} → {CONCEPT_BY_ID[selected.to]?.name}
          </p>
          <p className="mt-4 font-mono text-xs leading-relaxed text-partial">{selected.signal}</p>
          <Section title="Today" body={selected.today} />
          <Section title="Intended contract" body={selected.contract} />
          <blockquote className="mt-4 border-l-2 border-border pl-4 text-sm italic leading-relaxed">
            {selected.thought}
          </blockquote>
          {selected.status !== "living" ? (
            <Button
              className="mt-6 w-full"
              variant={proposed.includes(selected.id) ? "default" : "outline"}
              onClick={() => toggleProposed(selected.id)}
            >
              {proposed.includes(selected.id)
                ? "Proposed ligament saved"
                : "Propose this ligament"}
            </Button>
          ) : null}
        </article>
      ) : null}
    </div>
  );
}

function Section({ title, body }: { title: string; body: string }) {
  return (
    <section className="mt-4">
      <h3 className="text-[11px] font-medium uppercase tracking-[0.16em] text-muted">{title}</h3>
      <p className="mt-1.5 text-sm leading-relaxed">{body}</p>
    </section>
  );
}
