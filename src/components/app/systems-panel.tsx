import { useMemo, useState } from "react";
import { Link } from "@tanstack/react-router";
import { ArrowRight } from "lucide-react";
import {
  AI_SYSTEMS,
  filterSystems,
  organsForSystem,
  systemStats,
  systemStatusVariant,
  type AiSystem,
  type SystemActual,
  type SystemFamily,
} from "@/lib/systems";
import { useLattice } from "@/lib/lattice/store";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

const FAMILIES: Array<"all" | SystemFamily> = ["all", "core", "agent", "domain", "mouth"];
const ACTUALS: Array<"all" | SystemActual> = [
  "all",
  "skeleton",
  "stub",
  "duplicate",
  "partial",
  "unplugged",
];

export function SystemsPanel() {
  const stats = systemStats();
  const [family, setFamily] = useState<"all" | SystemFamily>("all");
  const [actual, setActual] = useState<"all" | SystemActual>("all");
  const [query, setQuery] = useState("");
  const [selectedId, setSelectedId] = useState("agentic");
  const selectConcept = useLattice((s) => s.selectConcept);

  const list = useMemo(
    () => filterSystems({ family, actual, query }),
    [family, actual, query],
  );
  const selected = AI_SYSTEMS.find((s) => s.id === selectedId) ?? list[0] ?? AI_SYSTEMS[0];

  return (
    <div className="space-y-8">
      <section className="rounded-2xl border border-border bg-surface p-5 sm:p-6">
        <p className="text-[11px] font-medium uppercase tracking-[0.16em] text-muted">
          AI systems · module contract
        </p>
        <h2 className="mt-2 font-display text-3xl font-medium tracking-tight">Systems</h2>
        <p className="mt-2 max-w-2xl text-sm leading-relaxed text-muted">
          Agentic, copilot, backbone, fabric, gateway, brain — each was meant to
          be a module of one nervous system. On GitHub they are sibling files.
          module.json says WIRED. analysis.isComplete is false. Canonical paths
          are one-kilobyte re-exports of legacy/. None of them plugs into a harvest.
          This organism's library is the living hippocampus they were meant to
          consult.
        </p>
        <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <Callout label="Named AI systems" value={stats.systems} body="Files, folders, and mouths. Not a spinal cord." />
          <Callout
            label="WIRED but unfinished"
            value={stats.wiredButSkeleton}
            body="module.json says WIRED. analysis.isComplete is false."
            warn
          />
          <Callout
            label="Stub re-exports"
            value={stats.stubs}
            body="Canonical service under 2KB. Logic still in legacy/."
            warn
          />
          <Callout
            label="GitHub plugs"
            value={`${stats.livingPlugs} of ${stats.systems}`}
            body={`${stats.moduleDirs} module directories. Phase 2 of the factory never ran.`}
            warn
          />
        </div>
        <p className="mt-4 text-sm text-muted">
          <Link to="/library" className="underline decoration-border underline-offset-4 hover:text-foreground">
            Library auto-op
          </Link>
          <span> answers the agentic query without these files. </span>
          <Link to="/nerve" className="underline decoration-border underline-offset-4 hover:text-foreground">
            Nerve
          </Link>
          <span> consults memory. </span>
          <Link to="/modules" className="underline decoration-border underline-offset-4 hover:text-foreground">
            Module OS
          </Link>
          <span> is the living bus these files were meant to be. </span>
          <Link to="/charter" className="underline decoration-border underline-offset-4 hover:text-foreground">
            Charter
          </Link>
          <span> scores every module against eighteen criteria.</span>
        </p>
      </section>

      <section className="flex flex-col gap-3">
        <Input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search agentic, copilot, fabric, module id"
          aria-label="Search AI systems"
          className="lg:max-w-sm"
        />
        <div className="flex flex-wrap items-center gap-3">
          <ChipRow label="Family" value={family} options={FAMILIES} onChange={setFamily} />
          <ChipRow label="Actual" value={actual} options={ACTUALS} onChange={setActual} />
        </div>
      </section>

      <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(300px,0.9fr)]">
        <ul className="grid gap-3 sm:grid-cols-2">
          {list.map((s) => (
            <li key={s.id}>
              <button
                type="button"
                onClick={() => setSelectedId(s.id)}
                className={cn(
                  "h-full w-full rounded-2xl border p-5 text-left transition-colors duration-150",
                  selected?.id === s.id
                    ? "border-foreground bg-accent"
                    : "border-border bg-surface hover:bg-accent",
                )}
              >
                <div className="flex flex-wrap items-center gap-2">
                  <Badge variant={systemStatusVariant(s.actual)}>{s.actual}</Badge>
                  <Badge variant={s.declared === "WIRED" ? "partial" : "default"}>
                    declared {s.declared}
                  </Badge>
                </div>
                <h3 className="mt-3 font-display text-xl tracking-tight">{s.name}</h3>
                <p className="mt-1 font-mono text-[11px] text-muted">{s.moduleId}</p>
                <p className="mt-3 text-sm leading-relaxed text-foreground/90">{s.silo}</p>
                <p className="mt-3 text-[11px] uppercase tracking-[0.12em] text-muted">
                  {s.liveCallers} live callers · {kb(s.bytesCanonical)} canonical
                  {s.bytesLegacy ? ` · ${kb(s.bytesLegacy)} legacy` : ""}
                </p>
              </button>
            </li>
          ))}
        </ul>

        {selected ? <SystemDetail system={selected} onSelectOrgan={selectConcept} /> : null}
      </div>
    </div>
  );
}

function SystemDetail({
  system,
  onSelectOrgan,
}: {
  system: AiSystem;
  onSelectOrgan: (id: string) => void;
}) {
  const organs = organsForSystem(system);
  return (
    <aside className="rounded-2xl border border-border bg-surface p-5 sm:p-6">
      <div className="flex flex-wrap items-center gap-2">
        <Badge variant={systemStatusVariant(system.actual)}>{system.actual}</Badge>
        <Badge>{system.family}</Badge>
        <Badge variant={system.isComplete ? "live" : "gap"}>
          {system.isComplete ? "complete" : "not complete"}
        </Badge>
      </div>
      <h3 className="mt-3 font-display text-2xl font-medium tracking-tight">{system.name}</h3>
      <p className="mt-1 font-mono text-xs text-muted">{system.path}</p>

      <dl className="mt-5 grid grid-cols-2 gap-3 text-sm">
        <Fact label="Declared" value={system.declared} />
        <Fact label="Live callers" value={String(system.liveCallers)} />
        <Fact label="Frontend" value={system.frontend ? "yes" : "no"} />
        <Fact label="Routes" value={system.routes ? "yes" : "no"} />
        <Fact label="Tests" value={system.tests ? "yes" : "no"} />
        <Fact label="analysis.isComplete" value={system.isComplete ? "true" : "false"} />
      </dl>

      <h4 className="mt-6 text-[11px] uppercase tracking-[0.14em] text-muted">Intended contract</h4>
      <p className="mt-2 text-sm leading-relaxed">{system.contract}</p>

      <h4 className="mt-6 text-[11px] uppercase tracking-[0.14em] text-muted">What it is today</h4>
      <p className="mt-2 text-sm leading-relaxed text-foreground/90">{system.silo}</p>

      <h4 className="mt-6 text-[11px] uppercase tracking-[0.14em] text-muted">Missing plug</h4>
      <p className="mt-2 font-mono text-xs leading-relaxed text-gap">{system.plug}</p>

      <h4 className="mt-6 text-[11px] uppercase tracking-[0.14em] text-muted">
        Organs it should plug into
      </h4>
      <p className="mt-2 text-sm text-muted">
        Sockets exist on the organism. The module factory never seated this system.
        Every socket below is unplugged.
      </p>
      <ul className="mt-3 flex flex-wrap gap-2">
        {organs.map((o) => (
          <li key={o.id}>
            <Link
              to="/organism"
              onClick={() => onSelectOrgan(o.id)}
              className="inline-flex h-11 items-center rounded-full border border-dashed border-gap/70 px-3 text-sm text-muted hover:border-foreground hover:text-foreground"
            >
              {o.short}
              <span className="ml-2 text-[10px] uppercase tracking-[0.12em]">unplugged</span>
            </Link>
          </li>
        ))}
      </ul>

      <p className="mt-6 text-sm text-muted">
        <Link
          to="/library"
          className="inline-flex items-center gap-2 underline decoration-border underline-offset-4 hover:text-foreground"
        >
          <ArrowRight className="size-4" strokeWidth={1.75} />
          Consult library memory for this module
        </Link>
      </p>
      <p className="mt-3 text-sm text-muted">
        <Link
          to="/organism"
          onClick={() => onSelectOrgan("module")}
          className="inline-flex items-center gap-2 underline decoration-border underline-offset-4 hover:text-foreground"
        >
          <ArrowRight className="size-4" strokeWidth={1.75} />
          Open the module-contract bridge on the organism map
        </Link>
      </p>
    </aside>
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
    <div className="rounded-2xl border border-border bg-background p-4">
      <p className="text-[11px] uppercase tracking-[0.14em] text-muted">{label}</p>
      <p className={cn("mt-1 font-display text-3xl tracking-tight", warn && "text-gap")}>{value}</p>
      <p className="mt-2 text-sm leading-relaxed text-muted">{body}</p>
    </div>
  );
}

function Fact({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-[11px] uppercase tracking-[0.12em] text-muted">{label}</dt>
      <dd className="mt-0.5 font-mono text-sm">{value}</dd>
    </div>
  );
}

function ChipRow<T extends string>({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: T;
  options: T[];
  onChange: (v: T) => void;
}) {
  return (
    <div className="flex flex-wrap items-center gap-1.5">
      <span className="mr-1 text-[11px] uppercase tracking-[0.14em] text-muted">{label}</span>
      {options.map((opt) => (
        <Button
          key={opt}
          type="button"
          size="sm"
          variant={value === opt ? "default" : "outline"}
          className="rounded-full capitalize"
          onClick={() => onChange(opt)}
        >
          {opt}
        </Button>
      ))}
    </div>
  );
}

function kb(bytes: number) {
  if (!bytes) return "folder only";
  if (bytes < 1000) return `${bytes} B`;
  return `${(bytes / 1024).toFixed(1)} KB`;
}
