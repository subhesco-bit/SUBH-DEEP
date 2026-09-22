import { useMemo, useState } from "react";
import { Link } from "@tanstack/react-router";
import { MODULE_RUNTIME, WORKFLOWS, workflowsForModule } from "@/lib/modules";
import { useModuleOs } from "@/lib/modules/store";
import { SYSTEM_BY_ID } from "@/lib/systems";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import type { DecisionCode, WorkflowRun } from "@/lib/modules/types";

const WORKFLOW_IDS = ["all", ...WORKFLOWS.map((w) => w.id)] as const;

function decisionVariant(d: DecisionCode) {
  if (d === "pass") return "live" as const;
  if (d === "propose") return "partial" as const;
  if (d === "defer") return "partial" as const;
  return "gap" as const;
}

export function ModulesPanel() {
  const snapshot = useModuleOs((s) => s.snapshot);
  const busy = useModuleOs((s) => s.busy);
  const error = useModuleOs((s) => s.error);
  const run = useModuleOs((s) => s.run);
  const consult = useModuleOs((s) => s.consult);
  const [workflowFilter, setWorkflowFilter] = useState<string>("harvest-mint");
  const [selectedId, setSelectedId] = useState("agentic");
  const [query, setQuery] = useState("Why does harvest.completed mint a lot?");
  const selected = MODULE_RUNTIME.find((m) => m.id === selectedId) ?? MODULE_RUNTIME[0];
  const selectedSystem = SYSTEM_BY_ID[selected.id];

  const runs = snapshot?.runs ?? [];
  const activeRun: WorkflowRun | undefined =
    runs.find((r) => r.workflowId === workflowFilter) ?? runs[0];
  const workflow = WORKFLOWS.find((w) => w.id === (activeRun?.workflowId ?? workflowFilter));

  const list = useMemo(() => {
    if (workflowFilter === "all") return MODULE_RUNTIME;
    return MODULE_RUNTIME.filter((m) => m.workflowIds.includes(workflowFilter));
  }, [workflowFilter]);

  return (
    <div className="space-y-6">
      <section className="rounded-2xl border border-border bg-surface p-5 sm:p-6">
        <p className="text-[11px] font-medium uppercase tracking-[0.16em] text-muted">
          Module OS · middleware · workflows · decisions
        </p>
        <h2 className="mt-2 font-display text-3xl font-medium tracking-tight">Modules</h2>
        <p className="mt-2 max-w-2xl text-sm leading-relaxed text-muted">
          Each named AI is now a module of one bus: domain, algorithm, workflow,
          decision, middleware, API, service, UI. GitHub files stay skeletons.
          This organism runs the process. AI may propose. It may not write ₹.
        </p>
        <div className="mt-6 grid grid-cols-2 gap-3 lg:grid-cols-4">
          <Callout label="Living plugs" value={snapshot?.livingPlugs ?? 0} live />
          <Callout label="Workflows" value={snapshot?.workflows ?? WORKFLOWS.length} />
          <Callout label="Runs on the bus" value={runs.length} />
          <Callout label="Last status" value={activeRun?.status ?? "—"} live={activeRun?.status === "passed"} />
        </div>
        {snapshot?.copilot ? (
          <p className="mt-4 rounded-xl border border-live/30 bg-background px-4 py-3 text-sm text-live">
            Copilot · {snapshot.copilot}
          </p>
        ) : null}
        {error ? <p className="mt-3 text-sm text-destructive">{error}</p> : null}
        <div className="mt-5 flex flex-wrap gap-2">
          <Button type="button" size="sm" disabled={busy} onClick={() => void run("harvest-mint")}>
            Run harvest walk
          </Button>
          <Button type="button" size="sm" variant="outline" disabled={busy} onClick={() => void run("offtake-settle")}>
            Run offtake gate
          </Button>
          <Button type="button" size="sm" variant="outline" disabled={busy} onClick={() => void run("platform-bus")}>
            Run platform bus
          </Button>
          <Button asChild size="sm" variant="outline">
            <Link to="/charter">Charter</Link>
          </Button>
          <Button asChild size="sm" variant="outline">
            <Link to="/systems">GitHub rack</Link>
          </Button>
        </div>
        <form
          className="mt-4 flex flex-col gap-2 sm:flex-row"
          onSubmit={(e) => {
            e.preventDefault();
            void consult(query);
          }}
        >
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            aria-label="Consult the module bus"
            placeholder="Consult: harvest, remaining, EMI"
          />
          <Button type="submit" variant="outline" disabled={busy} className="sm:w-auto">
            Consult
          </Button>
        </form>
      </section>

      <section className="flex flex-wrap items-center gap-2">
        <p className="text-[11px] uppercase tracking-[0.14em] text-muted">Workflow</p>
        {WORKFLOW_IDS.map((id) => (
          <button
            key={id}
            type="button"
            onClick={() => setWorkflowFilter(id)}
            className={cn(
              "h-10 whitespace-nowrap rounded-full border px-3 text-sm",
              workflowFilter === id
                ? "border-foreground bg-accent text-foreground"
                : "border-border text-muted hover:text-foreground",
            )}
          >
            {id === "all" ? "all modules" : id}
          </button>
        ))}
      </section>

      {workflow && activeRun ? (
        <section className="rounded-2xl border border-border bg-surface p-5">
          <div className="flex flex-wrap items-baseline justify-between gap-3">
            <div>
              <h3 className="font-display text-xl">{workflow.name}</h3>
              <p className="mt-1 max-w-2xl text-sm text-muted">{workflow.thesis}</p>
            </div>
            <Badge variant={activeRun.status === "passed" ? "live" : activeRun.status === "blocked" ? "gap" : "partial"}>
              {activeRun.status}
            </Badge>
          </div>
          <ol className="mt-5 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
            {activeRun.steps.map((step, i) => (
              <li key={`${step.code}-${i}`}>
                <button
                  type="button"
                  onClick={() => setSelectedId(step.moduleId)}
                  className="h-full w-full rounded-xl border border-border bg-background px-3 py-3 text-left"
                >
                  <div className="flex items-center justify-between gap-2">
                    <p className="font-mono text-[10px] text-muted">{step.code}</p>
                    <Badge variant={decisionVariant(step.decision)}>{step.decision}</Badge>
                  </div>
                  <p className="mt-1 text-sm font-medium">{step.name || step.moduleId}</p>
                  <p className="mt-1 font-mono text-[11px] text-partial">{step.moduleId}</p>
                  <p className="mt-2 text-[12px] leading-relaxed text-muted">{step.reason}</p>
                </button>
              </li>
            ))}
          </ol>
        </section>
      ) : null}

      <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(280px,0.85fr)]">
        <ul className="grid gap-3 sm:grid-cols-2">
          {list.map((m) => {
            const sys = SYSTEM_BY_ID[m.id];
            return (
              <li key={m.id}>
                <button
                  type="button"
                  onClick={() => setSelectedId(m.id)}
                  className={cn(
                    "h-full w-full rounded-2xl border p-5 text-left transition-colors duration-150",
                    selected.id === m.id ? "border-foreground bg-accent" : "border-border bg-surface hover:bg-accent",
                  )}
                >
                  <div className="flex flex-wrap gap-2">
                    <Badge variant="live">{m.plug}</Badge>
                    <Badge>{m.layers[0]}</Badge>
                  </div>
                  <h3 className="mt-3 font-display text-xl tracking-tight">{sys?.name ?? m.id}</h3>
                  <p className="mt-1 font-mono text-[11px] text-muted">{sys?.moduleId}</p>
                  <p className="mt-3 text-sm leading-relaxed">{m.enterprise}</p>
                  <p className="mt-3 text-[11px] uppercase tracking-[0.12em] text-muted">
                    {m.workflowIds.join(" · ")}
                  </p>
                </button>
              </li>
            );
          })}
        </ul>

        <aside className="space-y-4">
          <section className="rounded-2xl border border-border bg-surface p-5">
            <Badge variant="live">{selected.plug}</Badge>
            <h3 className="mt-3 font-display text-2xl">{selectedSystem?.name ?? selected.id}</h3>
            <p className="mt-1 font-mono text-xs text-muted">{selectedSystem?.path}</p>
            <h4 className="mt-5 text-[11px] uppercase tracking-[0.14em] text-muted">Layers</h4>
            <p className="mt-2 flex flex-wrap gap-2">
              {selected.layers.map((l) => (
                <Badge key={l}>{l}</Badge>
              ))}
            </p>
            <h4 className="mt-5 text-[11px] uppercase tracking-[0.14em] text-muted">Enterprise</h4>
            <p className="mt-2 text-sm leading-relaxed">{selected.enterprise}</p>
            <h4 className="mt-5 text-[11px] uppercase tracking-[0.14em] text-muted">GitHub still says</h4>
            <p className="mt-2 text-sm leading-relaxed text-muted">{selectedSystem?.silo}</p>
            <h4 className="mt-5 text-[11px] uppercase tracking-[0.14em] text-muted">Workflows</h4>
            <ul className="mt-2 space-y-1 text-sm">
              {workflowsForModule(selected.id).map((w) => (
                <li key={w.id}>
                  <button type="button" className="text-partial hover:text-foreground" onClick={() => setWorkflowFilter(w.id)}>
                    {w.name}
                  </button>
                </li>
              ))}
            </ul>
          </section>

          {activeRun ? (
            <section className="rounded-2xl border border-border bg-surface p-5">
              <h4 className="text-[11px] uppercase tracking-[0.14em] text-muted">Bus</h4>
              <ol className="mt-3 space-y-2">
                {activeRun.messages.slice(0, 10).map((msg, i) => (
                  <li key={`${msg.signal}-${i}`} className="font-mono text-[11px] text-muted">
                    <span className="text-foreground">{msg.from}</span>
                    {" → "}
                    <span className="text-foreground">{msg.to}</span>
                    <span className="block text-partial">{msg.signal}</span>
                  </li>
                ))}
              </ol>
            </section>
          ) : null}
        </aside>
      </div>
    </div>
  );
}

function Callout({
  label,
  value,
  live,
}: {
  label: string;
  value: string | number;
  live?: boolean;
}) {
  return (
    <div className="rounded-xl border border-border bg-background px-4 py-3">
      <p className="text-[11px] uppercase tracking-[0.14em] text-muted">{label}</p>
      <p className={cn("mt-1 font-display text-2xl", live && "text-live")}>{value}</p>
    </div>
  );
}
