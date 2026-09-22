import { ArrowRight } from "lucide-react";
import { Link } from "@tanstack/react-router";
import {
  BRIDGE_BY_ID,
  CONCEPT_BY_ID,
  bindTargets,
  bridgesFor,
  bridgeStatusVariant,
  conceptRole,
  conceptStatusVariant,
} from "@/lib/lattice";
import { cardsForOrgan } from "@/lib/library";
import { useLattice } from "@/lib/lattice/store";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";

export function ConceptPanel() {
  const selectedConceptId = useLattice((s) => s.selectedConceptId);
  const selectedBridgeId = useLattice((s) => s.selectedBridgeId);
  const selectBridge = useLattice((s) => s.selectBridge);
  const selectConcept = useLattice((s) => s.selectConcept);
  const proposed = useLattice((s) => s.proposed);
  const toggleProposed = useLattice((s) => s.toggleProposed);

  const concept = selectedConceptId ? CONCEPT_BY_ID[selectedConceptId] : null;
  const related = selectedConceptId ? bridgesFor(selectedConceptId) : [];
  const activeBridge = selectedBridgeId ? BRIDGE_BY_ID[selectedBridgeId] : undefined;
  const binds = concept ? bindTargets(concept) : [];
  const role = concept ? conceptRole(concept) : "organ";
  const memory = concept ? cardsForOrgan(concept.id).slice(0, 4) : [];

  return (
    <aside className="flex h-full min-h-[420px] flex-col rounded-2xl border border-border bg-surface">
      {concept ? (
        <>
          <div className="p-5 pb-4">
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant={conceptStatusVariant(concept.status)}>{concept.status}</Badge>
              <Badge>{concept.layer}</Badge>
              {role === "bridge" ? <Badge variant="solid">bridge concept</Badge> : null}
            </div>
            <h2 className="mt-3 font-display text-2xl font-medium tracking-tight">{concept.name}</h2>
            <p className="mt-1 text-xs uppercase tracking-[0.14em] text-muted">{concept.dora}</p>
          </div>
          <Separator />
          <ScrollArea className="flex-1">
            <div className="space-y-5 p-5">
              <Block title="Thesis" body={concept.thesis} />
              <Block title="How it sits in a silo" body={concept.silo} />
              <Block title="Path to farmer rupees" body={concept.prosperity} />
              {concept.id === "ai" || concept.id === "module" ? (
                <Link
                  to="/systems"
                  className="block rounded-lg border border-dashed border-gap/70 px-3 py-2 text-sm hover:bg-accent"
                >
                  AI systems rack
                  <span className="mt-0.5 block text-xs text-muted">
                    Agentic, copilot, fabric — WIRED skeletons, unplugged.
                  </span>
                </Link>
              ) : null}
              {memory.length > 0 ? (
                <div>
                  <h3 className="text-[11px] font-medium uppercase tracking-[0.16em] text-muted">
                    Library memory
                  </h3>
                  <ul className="mt-2 space-y-1.5">
                    {memory.map((card) => (
                      <li key={card.id}>
                        <Link
                          to="/library"
                          className="block rounded-lg border border-border px-3 py-2 text-sm hover:bg-accent"
                        >
                          <span className="font-medium">{card.title}</span>
                          <span className="mt-0.5 block text-xs text-muted">{card.kind}</span>
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              ) : null}
              {binds.length > 0 ? (
                <div>
                  <h3 className="text-[11px] font-medium uppercase tracking-[0.16em] text-muted">
                    Exists to bind
                  </h3>
                  <ul className="mt-2 flex flex-wrap gap-1.5">
                    {binds.map((other) => (
                      <li key={other.id}>
                        <button
                          type="button"
                          onClick={() => selectConcept(other.id)}
                          className="rounded-full border border-border px-2.5 py-1 text-xs hover:bg-accent"
                        >
                          {other.short}
                        </button>
                      </li>
                    ))}
                  </ul>
                </div>
              ) : null}
              <div>
                <h3 className="text-[11px] font-medium uppercase tracking-[0.16em] text-muted">
                  Ligaments
                </h3>
                <ul className="mt-2 space-y-1.5">
                  {related.map((b) => {
                    const otherId = b.from === concept.id ? b.to : b.from;
                    const other = CONCEPT_BY_ID[otherId];
                    const inbound = b.to === concept.id;
                    return (
                      <li key={b.id}>
                        <button
                          type="button"
                          onClick={() => selectBridge(b.id)}
                          className={cn(
                            "flex w-full items-start gap-2 rounded-lg border px-3 py-2 text-left text-sm transition-colors duration-150",
                            selectedBridgeId === b.id
                              ? "border-foreground bg-accent"
                              : "border-border hover:bg-accent",
                          )}
                        >
                          <span className="mt-0.5 shrink-0 text-[10px] uppercase tracking-wider text-muted">
                            {inbound ? "in" : "out"}
                          </span>
                          <span className="min-w-0 flex-1">
                            <span className="flex flex-wrap items-center gap-1.5 font-medium">
                              {inbound ? other?.short : concept.short}
                              <ArrowRight className="size-3.5 shrink-0 text-muted" />
                              {inbound ? concept.short : other?.short}
                            </span>
                            <span className="block text-xs text-muted">{b.name}</span>
                          </span>
                          <Badge variant={bridgeStatusVariant(b.status)}>{b.status}</Badge>
                        </button>
                      </li>
                    );
                  })}
                </ul>
              </div>
              {activeBridge ? (
                <BridgeDetail
                  proposed={proposed.includes(activeBridge.id)}
                  onToggle={() => toggleProposed(activeBridge.id)}
                  from={CONCEPT_BY_ID[activeBridge.from]?.short ?? activeBridge.from}
                  to={CONCEPT_BY_ID[activeBridge.to]?.short ?? activeBridge.to}
                  status={activeBridge.status}
                  kind={activeBridge.kind}
                  name={activeBridge.name}
                  signal={activeBridge.signal}
                  today={activeBridge.today}
                  contract={activeBridge.contract}
                  thought={activeBridge.thought}
                  living={activeBridge.status === "living"}
                />
              ) : null}
            </div>
          </ScrollArea>
        </>
      ) : (
        <div className="flex flex-1 items-center justify-center p-8 text-center text-sm text-muted">
          Select an organ or a bridge concept on the map.
        </div>
      )}
    </aside>
  );
}

function Block({ title, body }: { title: string; body: string }) {
  return (
    <section>
      <h3 className="text-[11px] font-medium uppercase tracking-[0.16em] text-muted">{title}</h3>
      <p className="mt-1.5 text-sm leading-relaxed text-foreground/90">{body}</p>
    </section>
  );
}

function BridgeDetail({
  proposed,
  onToggle,
  from,
  to,
  status,
  kind,
  name,
  signal,
  today,
  contract,
  thought,
  living,
}: {
  proposed: boolean;
  onToggle: () => void;
  from: string;
  to: string;
  status: "living" | "partial" | "missing";
  kind: string;
  name: string;
  signal: string;
  today: string;
  contract: string;
  thought: string;
  living: boolean;
}) {
  return (
    <section className="rounded-xl border border-border bg-background p-4">
      <div className="flex flex-wrap items-center gap-2">
        <Badge variant={bridgeStatusVariant(status)}>{status}</Badge>
        <Badge>{kind}</Badge>
      </div>
      <h3 className="mt-2 font-display text-lg">{name}</h3>
      <p className="mt-1 text-xs text-muted">
        {from} → {to}
      </p>
      <p className="mt-3 font-mono text-[11px] leading-relaxed text-partial">{signal}</p>
      <div className="mt-3">
        <Block title="Today" body={today} />
      </div>
      <div className="mt-3">
        <Block title="Intended contract" body={contract} />
      </div>
      <blockquote className="mt-3 border-l-2 border-border pl-3 text-sm italic text-foreground/90">
        {thought}
      </blockquote>
      {!living ? (
        <Button
          variant={proposed ? "default" : "outline"}
          className="mt-4 w-full"
          onClick={onToggle}
        >
          {proposed ? "Proposed ligament saved" : "Propose this ligament"}
        </Button>
      ) : null}
    </section>
  );
}
