import { useMemo, useState } from "react";
import { Link } from "@tanstack/react-router";
import { composeCharter, type CheckStatus, type CriterionId, type ModuleCharter } from "@/lib/modules/charter";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

const VIEWS = ["laws", "concepts", "modules", "matrix", "coordination"] as const;
type View = (typeof VIEWS)[number];

function variant(status: CheckStatus | string) {
  if (status === "living") return "live" as const;
  if (status === "partial") return "partial" as const;
  return "gap" as const;
}

export function CharterBoard() {
  const charter = useMemo(() => composeCharter(), []);
  const [view, setView] = useState<View>("modules");
  const [query, setQuery] = useState("");
  const [family, setFamily] = useState("all");
  const [openId, setOpenId] = useState<string | null>("agentic");
  const q = query.trim().toLowerCase();

  const modules = charter.modules.filter((m) => {
    if (family !== "all" && m.family !== family) return false;
    if (!q) return true;
    return `${m.id} ${m.name} ${m.enterprise} ${m.organs.join(" ")} ${m.workflows.join(" ")}`.toLowerCase().includes(q);
  });

  const concepts = charter.concepts.filter((c) => {
    if (!q) return true;
    return `${c.id} ${c.name} ${c.thesis} ${c.silo} ${c.modules.join(" ")}`.toLowerCase().includes(q);
  });

  const families = ["all", ...new Set(charter.modules.map((m) => m.family))];

  return (
    <div className="space-y-6">
      <section className="rounded-2xl border border-border bg-surface p-5 sm:p-6">
        <p className="text-[11px] font-medium uppercase tracking-[0.16em] text-muted">
          Charter · 18 criteria · 12 laws · no invented ₹
        </p>
        <h2 className="mt-2 font-display text-3xl font-medium tracking-tight">Nothing missed — named</h2>
        <p className="mt-2 max-w-2xl text-sm leading-relaxed text-muted">
          Every lattice concept and every named AI module is scored against AI,
          ERP algorithm, communication, workflow, operational flow, process,
          tracking, decision criteria and boundary, how a decision is made,
          spoken, coordinated, and implemented. GitHub remains WIRED skeletons.
          This organism runs the bus. Completeness is a count of living checks,
          not a badge.
        </p>
        <div className="mt-6 grid grid-cols-2 gap-3 lg:grid-cols-4">
          <Kpi label="Living checks" value={charter.moduleLivingChecks} live />
          <Kpi label="Partial checks" value={charter.modulePartialChecks} />
          <Kpi label="Missing checks" value={charter.moduleMissingChecks} gap />
          <Kpi label="Lattice integrity" value={`${charter.lattice.integrity}%`} />
        </div>
        <p className="mt-4 text-[11px] uppercase tracking-[0.14em] text-muted">
          {charter.modules.length} modules · {charter.concepts.length} concepts · {charter.isolated} isolated ·{" "}
          {charter.bridgesMissing} missing bridges · {charter.unpluggedOrgans.length} organs with no module
        </p>
        <div className="mt-5 flex flex-wrap gap-2">
          {VIEWS.map((v) => (
            <Button
              key={v}
              type="button"
              size="sm"
              variant={view === v ? "default" : "outline"}
              className="whitespace-nowrap capitalize"
              onClick={() => setView(v)}
            >
              {v}
            </Button>
          ))}
          <Button asChild size="sm" variant="outline">
            <Link to="/modules">Modules OS</Link>
          </Button>
          <Button asChild size="sm" variant="outline">
            <Link to="/companion">Companion</Link>
          </Button>
        </div>
        {view === "modules" || view === "concepts" ? (
          <div className="mt-4 flex flex-col gap-3 sm:flex-row">
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={view === "modules" ? "Filter modules" : "Filter concepts"}
              aria-label="Filter charter"
            />
            {view === "modules" ? (
              <select
                className="flex h-11 rounded-md border border-border bg-background px-3 text-sm"
                value={family}
                onChange={(e) => setFamily(e.target.value)}
                aria-label="Family"
              >
                {families.map((f) => (
                  <option key={f} value={f}>
                    {f}
                  </option>
                ))}
              </select>
            ) : null}
          </div>
        ) : null}
      </section>

      {view === "laws" ? <Laws charter={charter} /> : null}
      {view === "concepts" ? <Concepts list={concepts} /> : null}
      {view === "modules" ? (
        <Modules list={modules} openId={openId} onOpen={setOpenId} />
      ) : null}
      {view === "matrix" ? <Matrix charter={charter} modules={modules} /> : null}
      {view === "coordination" ? <Coordination charter={charter} /> : null}
    </div>
  );
}

function Kpi({
  label,
  value,
  live,
  gap,
}: {
  label: string;
  value: string | number;
  live?: boolean;
  gap?: boolean;
}) {
  return (
    <div className="rounded-xl border border-border bg-background px-4 py-3">
      <p className="text-[11px] uppercase tracking-[0.14em] text-muted">{label}</p>
      <p className={cn("mt-1 font-display text-2xl", live && "text-live", gap && "text-gap")}>{value}</p>
    </div>
  );
}

function Laws({ charter }: { charter: ReturnType<typeof composeCharter> }) {
  return (
    <section className="rounded-2xl border border-border bg-surface p-5">
      <h3 className="font-display text-xl">Decision laws</h3>
      <p className="mt-1 text-sm text-muted">
        Criteria of decision. Boundaries of decision. A module that cannot name a law is decoration.
      </p>
      <ul className="mt-4 grid gap-3 sm:grid-cols-2">
        {charter.laws.map((l) => (
          <li key={l.id} className="rounded-xl border border-border bg-background p-4">
            <div className="flex items-center justify-between gap-2">
              <p className="font-mono text-[11px] text-muted">{l.id}</p>
              <Badge>{l.organ}</Badge>
            </div>
            <p className="mt-2 text-sm leading-relaxed">{l.law}</p>
          </li>
        ))}
      </ul>
      <div className="mt-6">
        <h4 className="text-[11px] font-medium uppercase tracking-[0.14em] text-muted">Criteria across 25 modules</h4>
        <ul className="mt-3 grid gap-2 sm:grid-cols-2">
          {charter.criteria.map((c) => {
            const t = charter.criterionTotals[c.id];
            return (
              <li key={c.id} className="rounded-xl border border-border bg-background px-4 py-3">
                <div className="flex items-center justify-between gap-2">
                  <p className="text-sm font-medium">{c.label}</p>
                  <span className="font-mono text-[11px] text-muted">
                    {t.living}L · {t.partial}P · {t.missing}M
                  </span>
                </div>
                <p className="mt-1 text-sm text-muted">{c.asks}</p>
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}

function Concepts({ list }: { list: ReturnType<typeof composeCharter>["concepts"] }) {
  return (
    <section className="rounded-2xl border border-border bg-surface p-5">
      <h3 className="font-display text-xl">Concepts</h3>
      <p className="mt-1 text-sm text-muted">
        Organs and bridge-concepts. Isolated means no living ligament. Unplugged means no module names it.
      </p>
      <ul className="mt-4 grid gap-3 sm:grid-cols-2">
        {list.map((c) => (
          <li key={c.id} className="rounded-xl border border-border bg-background p-4">
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant={variant(c.status === "living" ? "living" : c.status === "partial" ? "partial" : "missing")}>
                {c.status}
              </Badge>
              <Badge>{c.role}</Badge>
              {c.isolated ? <Badge variant="gap">isolated</Badge> : null}
              <span className="ml-auto font-mono text-[11px] text-muted">deg {c.degree}</span>
            </div>
            <p className="mt-2 text-sm font-medium">{c.name}</p>
            <p className="font-mono text-[11px] text-muted">{c.id}</p>
            <p className="mt-2 text-sm leading-relaxed text-muted">{c.thesis}</p>
            <p className="mt-2 text-sm text-gap">{c.silo}</p>
            <p className="mt-3 font-mono text-[11px] text-muted">
              modules {c.modules.length ? c.modules.join(" · ") : "none"} · walks{" "}
              {c.workflows.length ? c.workflows.join(" · ") : "none"} · lib {c.library}
              {c.laws.length ? ` · laws ${c.laws.join(" ")}` : ""}
            </p>
            <Link to="/organism" className="mt-3 inline-block text-sm text-partial hover:text-foreground">
              Open map
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}

function Modules({
  list,
  openId,
  onOpen,
}: {
  list: ModuleCharter[];
  openId: string | null;
  onOpen: (id: string | null) => void;
}) {
  return (
    <section className="rounded-2xl border border-border bg-surface p-5">
      <h3 className="font-display text-xl">Modules</h3>
      <p className="mt-1 text-sm text-muted">
        Implementation is partial when the organism is living and GitHub is a skeleton. That is not a lie.
      </p>
      <ul className="mt-4 space-y-3">
        {list.map((m) => {
          const open = openId === m.id;
          return (
            <li key={m.id} className="rounded-xl border border-border bg-background">
              <button
                type="button"
                className="flex w-full flex-col gap-2 px-4 py-4 text-left sm:flex-row sm:items-center sm:justify-between"
                onClick={() => onOpen(open ? null : m.id)}
                aria-expanded={open}
              >
                <span>
                  <span className="text-sm font-medium">{m.name}</span>
                  <span className="ml-2 font-mono text-[11px] text-muted">{m.id}</span>
                </span>
                <span className="flex flex-wrap items-center gap-2">
                  <Badge variant="live">{m.living} living</Badge>
                  <Badge variant="partial">{m.partial} partial</Badge>
                  {m.missing ? <Badge variant="gap">{m.missing} missing</Badge> : null}
                  <Badge>{m.github}</Badge>
                </span>
              </button>
              {open ? (
                <div className="border-t border-border px-4 py-4">
                  <p className="text-sm leading-relaxed text-muted">{m.enterprise}</p>
                  <p className="mt-2 font-mono text-[11px] text-muted">
                    walks {m.workflows.join(" · ") || "none"} · peers {m.peers.slice(0, 6).join(" · ") || "none"}
                  </p>
                  <ul className="mt-4 grid gap-2 sm:grid-cols-2">
                    {m.checks.map((c) => (
                      <li key={c.id} className="rounded-lg border border-border px-3 py-2">
                        <div className="flex items-center justify-between gap-2">
                          <p className="text-sm">{c.label}</p>
                          <Badge variant={variant(c.status)}>{c.status}</Badge>
                        </div>
                        <p className="mt-1 text-sm text-muted">{c.evidence}</p>
                      </li>
                    ))}
                  </ul>
                </div>
              ) : null}
            </li>
          );
        })}
      </ul>
    </section>
  );
}

function Matrix({
  charter,
  modules,
}: {
  charter: ReturnType<typeof composeCharter>;
  modules: ModuleCharter[];
}) {
  return (
    <section className="rounded-2xl border border-border bg-surface p-5">
      <h3 className="font-display text-xl">Criteria matrix</h3>
      <p className="mt-1 text-sm text-muted">Living · partial · missing. Scroll sideways on a phone.</p>
      <div className="mt-4 overflow-x-auto">
        <table className="min-w-[720px] w-full text-left text-sm">
          <thead>
            <tr className="text-[11px] uppercase tracking-[0.12em] text-muted">
              <th className="sticky left-0 bg-surface pb-2 pr-3 font-medium">Module</th>
              {charter.criteria.map((c) => (
                <th key={c.id} className="px-1 pb-2 font-medium" title={c.asks}>
                  {c.label.split(" ")[0]}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {modules.map((m) => (
              <tr key={m.id} className="border-t border-border">
                <td className="sticky left-0 bg-background py-2 pr-3 font-mono text-[11px]">{m.short}</td>
                {m.checks.map((c) => (
                  <td key={c.id} className="px-1 py-2">
                    <span
                      className={cn(
                        "inline-block size-2.5 rounded-full",
                        c.status === "living" && "bg-live",
                        c.status === "partial" && "bg-partial",
                        c.status === "missing" && "bg-gap",
                      )}
                      title={`${c.label}: ${c.status} — ${c.evidence}`}
                    />
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}

function Coordination({ charter }: { charter: ReturnType<typeof composeCharter> }) {
  const byWalk = new Map<string, typeof charter.hops>();
  for (const h of charter.hops) {
    const list = byWalk.get(h.workflowId) ?? [];
    list.push(h);
    byWalk.set(h.workflowId, list);
  }
  return (
    <section className="rounded-2xl border border-border bg-surface p-5">
      <h3 className="font-display text-xl">How modules decide together</h3>
      <p className="mt-1 text-sm text-muted">
        Adjacent steps on a walk. Orchestrator routes. Coordinator consults the library.
        Fabric caps spend. Agentic proposes. A clerk implements. The bus carries the envelope.
      </p>
      <ul className="mt-4 space-y-4">
        {[...byWalk.entries()].map(([wf, hops]) => (
          <li key={wf} className="rounded-xl border border-border bg-background p-4">
            <p className="font-mono text-[11px] uppercase tracking-[0.14em] text-muted">{wf}</p>
            <ol className="mt-3 space-y-2">
              {hops.map((h, i) => (
                <li key={`${h.from}-${h.to}-${i}`} className="text-sm">
                  <span className="font-medium">{h.from}</span>
                  <span className="text-muted"> {h.fromKind} → </span>
                  <span className="font-medium">{h.to}</span>
                  <span className="text-muted"> {h.toKind}</span>
                  <span className="ml-2 font-mono text-[11px] text-partial">
                    {h.emits} · {h.organ}
                  </span>
                </li>
              ))}
            </ol>
          </li>
        ))}
      </ul>
    </section>
  );
}
