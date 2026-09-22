import { ArrowRight } from "lucide-react";
import { Link } from "@tanstack/react-router";
import {
  CONCEPTS,
  CONCEPT_BY_ID,
  BRIDGES,
  bindTargets,
  conceptRole,
  conceptStatusVariant,
  isolatedConcepts,
  livingDegreeMap,
  latticeStats,
  weakConcepts,
} from "@/lib/lattice";
import { useLattice } from "@/lib/lattice/store";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function MeshPanel() {
  const stats = latticeStats();
  const isolated = isolatedConcepts();
  const weak = weakConcepts();
  const liveDeg = livingDegreeMap();
  const selectConcept = useLattice((s) => s.selectConcept);
  const selectBridge = useLattice((s) => s.selectBridge);
  const toggleProposed = useLattice((s) => s.toggleProposed);
  const proposed = useLattice((s) => s.proposed);

  const bridges = CONCEPTS.filter((c) => conceptRole(c) === "bridge");
  const missingTech = BRIDGES.filter((b) => b.kind === "technical" && b.status === "missing");
  const missingThought = BRIDGES.filter((b) => b.kind === "thoughtful" && b.status === "missing");

  const firstBinders = missingTech.filter((b) => {
    const fromLive = liveDeg[b.from] ?? 0;
    const toLive = liveDeg[b.to] ?? 0;
    return fromLive <= 2 || toLive <= 2;
  });

  return (
    <div className="space-y-8">
      <section className="grid gap-3 sm:grid-cols-3">
        <Callout
          label="Living ligaments"
          value={`${stats.living} of ${stats.bridges}`}
          body="Foreign keys and checkout. Necessary, not an organism."
        />
        <Callout
          label="Isolated in runtime"
          value={stats.isolated}
          body="No living or partial ligament. The node exists only as a file, a spec, or a fringe organ."
          warn
        />
        <Callout
          label="Weakly attached"
          value={stats.weak}
          body="At most two real ligaments. Still a silo with a handshake."
          warn
        />
      </section>

      <section>
        <h2 className="font-display text-2xl font-medium tracking-tight">Bridge concepts</h2>
        <p className="mt-2 max-w-2xl text-sm leading-relaxed text-muted">
          These are not more modules. They exist only to join organs that currently
          pretend to be complete alone. On GitHub they are missing platforms,
          a stub event bus, or a sentence in DORA. AI systems that were meant to
          be modules of the nerve are catalogued separately — they are still
          sibling files with a WIRED badge.
        </p>
        <p className="mt-3 text-sm">
          <Link to="/systems" className="underline decoration-border underline-offset-4 hover:text-foreground">
            See the AI module rack
          </Link>
        </p>
        <ul className="mt-5 grid gap-3 md:grid-cols-2">
          {bridges.map((c) => {
            const binds = bindTargets(c);
            return (
              <li key={c.id}>
                <button
                  type="button"
                  onClick={() => selectConcept(c.id)}
                  className="h-full w-full rounded-2xl border border-border bg-surface p-5 text-left hover:bg-accent"
                >
                  <div className="flex flex-wrap items-center gap-2">
                    <Badge variant={conceptStatusVariant(c.status)}>{c.status}</Badge>
                    <Badge variant="solid">bridge</Badge>
                  </div>
                  <h3 className="mt-3 font-display text-xl tracking-tight">{c.name}</h3>
                  <p className="mt-1 text-xs uppercase tracking-[0.14em] text-muted">{c.dora}</p>
                  <p className="mt-3 text-sm leading-relaxed text-foreground/90">{c.thesis}</p>
                  <p className="mt-3 flex flex-wrap items-center gap-1 text-xs text-muted">
                    Binds
                    {binds.map((o) => (
                      <span key={o.id} className="rounded-full border border-border px-2 py-0.5">
                        {o.short}
                      </span>
                    ))}
                  </p>
                </button>
              </li>
            );
          })}
        </ul>
      </section>

      <section className="grid gap-6 lg:grid-cols-2">
        <div>
          <h2 className="font-display text-2xl font-medium tracking-tight">Runtime isolation</h2>
          <p className="mt-2 text-sm text-muted">
            Living + partial ligaments only. Missing contracts do not count — that is the honest map of consolidated/final.
          </p>
          <OrganColumn
            title="No runtime ligament"
            items={isolated}
            deg={liveDeg}
            onSelect={selectConcept}
          />
          <OrganColumn
            title="At most two runtime ligaments"
            items={weak}
            deg={liveDeg}
            onSelect={selectConcept}
          />
        </div>
        <div>
          <h2 className="font-display text-2xl font-medium tracking-tight">Bind first</h2>
          <p className="mt-2 text-sm text-muted">
            Missing technical contracts that would lift a weakly attached organ. Propose the ones to build on the spine next.
          </p>
          <ul className="mt-4 space-y-2">
            {firstBinders.slice(0, 14).map((b) => {
              const from = CONCEPT_BY_ID[b.from];
              const to = CONCEPT_BY_ID[b.to];
              return (
                <li key={b.id}>
                  <div className="rounded-xl border border-border bg-surface p-4">
                    <button
                      type="button"
                      className="w-full text-left"
                      onClick={() => {
                        selectBridge(b.id);
                        selectConcept(b.from);
                      }}
                    >
                      <p className="font-display text-lg leading-snug">{b.name}</p>
                      <p className="mt-1 flex flex-wrap items-center gap-1 text-xs text-muted">
                        {from?.name}
                        <ArrowRight className="size-3" />
                        {to?.name}
                      </p>
                      <p className="mt-2 font-mono text-[11px] text-partial">{b.signal}</p>
                    </button>
                    <Button
                      className="mt-3 w-full"
                      size="sm"
                      variant={proposed.includes(b.id) ? "default" : "outline"}
                      onClick={() => toggleProposed(b.id)}
                    >
                      {proposed.includes(b.id) ? "Proposed" : "Propose this ligament"}
                    </Button>
                  </div>
                </li>
              );
            })}
          </ul>
        </div>
      </section>

      <section>
        <h2 className="font-display text-2xl font-medium tracking-tight">Two kinds of missing link</h2>
        <div className="mt-4 grid gap-4 md:grid-cols-2">
          <KindCard
            title="Technical"
            count={missingTech.length}
            body="Events, schemas, and UX contracts that do not exist: harvest.completed never leaves the portal, eventBus.js is an in-memory stub, crop_plantings still collides with farm_plots, FDI does not reprice cover."
          />
          <KindCard
            title="Thoughtful"
            count={missingThought.length}
            body="The consolidated branch still thinks in roles, SKUs, megawatts, and PDFs. Farmer is a cell. Village is an economy. Lot is one body. Scheme is blood. A chatbot is not a reflex. Time is a dimension."
          />
        </div>
      </section>
    </div>
  );
}

function Callout({
  label,
  value,
  body,
  warn,
}: {
  label: string;
  value: string | number;
  body: string;
  warn?: boolean;
}) {
  return (
    <div className="rounded-2xl border border-border bg-surface p-5">
      <p className="text-[11px] uppercase tracking-[0.14em] text-muted">{label}</p>
      <p className={cn("mt-2 font-mono text-3xl tabular-nums", warn ? "text-gap" : "text-foreground")}>
        {value}
      </p>
      <p className="mt-2 text-sm leading-relaxed text-muted">{body}</p>
    </div>
  );
}

function OrganColumn({
  title,
  items,
  deg,
  onSelect,
}: {
  title: string;
  items: typeof CONCEPTS;
  deg: Record<string, number>;
  onSelect: (id: string) => void;
}) {
  return (
    <div className="mt-4">
      <h3 className="text-[11px] font-medium uppercase tracking-[0.16em] text-muted">{title}</h3>
      <ul className="mt-2 space-y-1.5">
        {items.length === 0 ? (
          <li className="text-sm text-muted">None.</li>
        ) : (
          items.map((c) => (
            <li key={c.id}>
              <button
                type="button"
                onClick={() => onSelect(c.id)}
                className="flex min-h-11 w-full items-center justify-between gap-3 rounded-lg border border-border px-3 py-2 text-left hover:bg-surface"
              >
                <span>
                  <span className="block text-sm font-medium">{c.name}</span>
                  <span className="block text-xs text-muted">
                    {conceptRole(c) === "bridge" ? "bridge concept" : c.dora}
                  </span>
                </span>
                <span className="font-mono text-xs tabular-nums text-muted">{deg[c.id] ?? 0}</span>
              </button>
            </li>
          ))
        )}
      </ul>
    </div>
  );
}

function KindCard({ title, count, body }: { title: string; count: number; body: string }) {
  return (
    <article className="rounded-2xl border border-border bg-surface p-5">
      <div className="flex items-baseline justify-between gap-3">
        <h3 className="font-display text-xl">{title}</h3>
        <p className="font-mono text-2xl tabular-nums text-gap">{count}</p>
      </div>
      <p className="mt-3 text-sm leading-relaxed text-muted">{body}</p>
    </article>
  );
}
