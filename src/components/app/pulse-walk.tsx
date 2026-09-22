import { useEffect, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { CONCEPT_BY_ID, WALK, WALK_LEDE, WALK_TITLE, BRIDGE_BY_ID } from "@/lib/lattice";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useLattice } from "@/lib/lattice/store";
import { bridgeStatusVariant, conceptStatusVariant } from "@/lib/lattice";
import { useOrganism } from "@/lib/organism/store";

export function PulseWalk() {
  const [step, setStep] = useState(0);
  const hop = WALK[step];
  const organ = CONCEPT_BY_ID[hop.organId];
  const bridge = hop.bridgeId ? BRIDGE_BY_ID[hop.bridgeId] : undefined;
  const selectConcept = useLattice((s) => s.selectConcept);
  const selectBridge = useLattice((s) => s.selectBridge);
  const toggleProposed = useLattice((s) => s.toggleProposed);
  const proposed = useLattice((s) => s.proposed);
  const publish = useOrganism((s) => s.publish);
  const ready = useOrganism((s) => s.ready);

  const go = (n: number) => {
    const next = Math.max(0, Math.min(WALK.length - 1, n));
    setStep(next);
    const h = WALK[next];
    selectConcept(h.organId);
    selectBridge(h.bridgeId);
  };

  useEffect(() => {
    if (!ready) return;
    void publish(hop.signal, hop.organId, hop.bridgeId);
  }, [hop.id, hop.signal, hop.organId, hop.bridgeId, ready, publish]);

  return (
    <div className="grid gap-6 lg:grid-cols-[220px_minmax(0,1fr)]">
      <ol className="hidden lg:block">
        {WALK.map((h, i) => (
          <li key={h.id}>
            <button
              type="button"
              onClick={() => go(i)}
              className={cn(
                "flex w-full items-start gap-3 border-l py-2 pl-3 text-left text-sm transition-colors duration-150",
                i === step
                  ? "border-foreground text-foreground"
                  : "border-border text-muted hover:text-foreground",
              )}
            >
              <span className="font-mono text-[11px] tabular-nums">
                {String(i + 1).padStart(2, "0")}
              </span>
              <span>{h.title}</span>
            </button>
          </li>
        ))}
      </ol>
      <article className="rounded-2xl border border-border bg-surface p-5 sm:p-8">
        <p className="text-[11px] font-medium uppercase tracking-[0.16em] text-muted">
          Pulse walk
        </p>
        <h2 className="mt-2 font-display text-3xl font-medium tracking-tight">{WALK_TITLE}</h2>
        <p className="mt-2 max-w-2xl text-sm leading-relaxed text-muted">{WALK_LEDE}</p>

        <div className="mt-6 flex items-center justify-between gap-3">
          <Button
            variant="outline"
            size="icon"
            aria-label="Previous hop"
            disabled={step === 0}
            onClick={() => go(step - 1)}
          >
            <ChevronLeft className="size-4" />
          </Button>
          <p className="font-mono text-xs tabular-nums text-muted">
            {step + 1} / {WALK.length}
          </p>
          <Button
            variant="outline"
            size="icon"
            aria-label="Next hop"
            disabled={step === WALK.length - 1}
            onClick={() => go(step + 1)}
          >
            <ChevronRight className="size-4" />
          </Button>
        </div>

        <div className="mt-6">
          <div className="flex h-1.5 overflow-hidden rounded-full bg-accent">
            <div
              className="bg-primary transition-[width] duration-300 ease-[var(--ease-smooth-out)]"
              style={{ width: `${((step + 1) / WALK.length) * 100}%` }}
            />
          </div>
        </div>

        <h3 className="mt-8 font-display text-2xl tracking-tight">{hop.title}</h3>
        <div className="mt-3 flex flex-wrap gap-2">
          {organ ? (
            <Badge variant={conceptStatusVariant(organ.status)}>{organ.short}</Badge>
          ) : null}
          {bridge ? (
            <Badge variant={bridgeStatusVariant(bridge.status)}>{bridge.name}</Badge>
          ) : null}
        </div>
        <p className="mt-5 font-mono text-xs leading-relaxed text-partial">{hop.signal}</p>
        <section className="mt-6 grid gap-4 sm:grid-cols-2">
          <div className="rounded-xl border border-border bg-background p-4">
            <h4 className="text-[11px] font-medium uppercase tracking-[0.16em] text-gap">
              Today — the signal dies
            </h4>
            <p className="mt-2 text-sm leading-relaxed">{hop.today}</p>
          </div>
          <div className="rounded-xl border border-border bg-background p-4">
            <h4 className="text-[11px] font-medium uppercase tracking-[0.16em] text-live">
              Should — the ligament
            </h4>
            <p className="mt-2 text-sm leading-relaxed">{hop.should}</p>
          </div>
        </section>
        {bridge ? (
          <blockquote className="mt-6 border-l-2 border-border pl-4 text-sm italic leading-relaxed">
            {bridge.thought}
          </blockquote>
        ) : null}
        {bridge && bridge.status !== "living" ? (
          <Button
            className="mt-6"
            variant={proposed.includes(bridge.id) ? "default" : "outline"}
            onClick={() => toggleProposed(bridge.id)}
          >
            {proposed.includes(bridge.id) ? "Proposed ligament saved" : "Propose this ligament"}
          </Button>
        ) : null}
      </article>
    </div>
  );
}
