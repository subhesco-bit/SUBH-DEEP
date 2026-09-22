import { useEffect, useMemo, useState } from "react";
import { Link } from "@tanstack/react-router";
import {
  Brain,
  Eye,
  GitMerge,
  Hand,
  Landmark,
  Network,
  Package,
  Route,
  Scale,
  Spline,
  Waypoints,
} from "lucide-react";
import {
  FLOWS,
  FLOW_BY_ID,
  defaultFlowFacts,
  flowStats,
  runAllFlows,
  runFlow,
  runNode,
  type FlowFacts,
  type FlowId,
  type FlowWalk,
  type NodeAct,
} from "@/lib/flows";
import { FlowChart, FlowLegend } from "@/components/app/flow-chart";
import { useVillageBooks } from "@/components/erp/books-boot";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const ICONS: Record<FlowId, typeof Waypoints> = {
  strategy: Scale,
  work: Hand,
  process: GitMerge,
  payment: Landmark,
  material: Package,
  vision: Eye,
  decision: Brain,
  command: Route,
  coordination: Network,
  algorithms: Spline,
  supply: Waypoints,
};

function klass(s: string) {
  if (s === "living" || s === "pass" || s === "done") return "live" as const;
  if (s === "partial" || s === "defer" || s === "propose" || s === "named") return "partial" as const;
  return "gap" as const;
}

export function FlowBoard() {
  const books = useVillageBooks();
  const lot = books?.lots[0];
  const order = books?.orders.find((o) => o.status === "open") ?? books?.orders[0];
  const facts = useMemo<FlowFacts>(
    () =>
      defaultFlowFacts({
        remainingGrams: lot?.remainingGrams ?? 180000,
        mintedGrams: lot?.grams ?? 180000,
        qtyGrams: order?.qtyGrams && order.qtyGrams > 0 ? order.qtyGrams : 40000,
        pricePaisePerKg: order?.pricePaisePerKg && order.pricePaisePerKg > 0 ? order.pricePaisePerKg : 8500,
        freightPaisePerKg: order?.freightPaisePerKg ?? 400,
        paymentRef: order?.paymentRef ?? null,
        cellId: lot?.cellId ?? books?.cells[0]?.id ?? "c-enghi",
        lotId: lot?.id ?? "lot-chakhao",
        variety: lot?.variety ?? "Chakhao Poireiton",
        giMarker: lot ? lot.giMarker : "GI-CHAKHAO",
        giChainLength: lot ? (lot.giMinted ? 1 : 0) : 1,
        journalBalanced: books?.kpis.journalBalanced ?? true,
        outage: (books?.energyWindows ?? []).some((w) => w.active && w.status === "outage"),
        alert: (books?.weatherAlerts ?? []).some((a) => a.claimOpen),
        iotTempC: books?.iotReadings.find((r) => r.unit === "C" || /temp/i.test(r.kind))?.valueNum ?? null,
        kwh: (books?.energyWindows ?? []).find((w) => w.kwh != null)?.kwh ?? null,
        hoursToPay: order?.hoursToPay ?? null,
      }),
    [books, lot, order],
  );

  const [flowId, setFlowId] = useState<FlowId>("supply");
  const [walk, setWalk] = useState<FlowWalk | null>(null);
  const [focus, setFocus] = useState<NodeAct | null>(null);
  const [all, setAll] = useState<FlowWalk[] | null>(null);
  const def = FLOW_BY_ID[flowId];
  const Icon = ICONS[flowId];
  const stats = flowStats();
  const byNode = new Map((walk?.steps ?? []).map((s) => [s.nodeId, s]));

  useEffect(() => {
    const next = runFlow(flowId, facts);
    setWalk(next);
    setFocus((prev) => {
      if (!prev || prev.nodeId && !next.steps.some((s) => s.nodeId === prev.nodeId)) {
        return next.steps[0] ?? null;
      }
      return next.steps.find((s) => s.nodeId === prev.nodeId) ?? next.steps[0] ?? null;
    });
  }, [flowId, facts]);

  function walkAll(id: FlowId) {
    setFlowId(id);
    const next = runFlow(id, facts);
    setWalk(next);
    setFocus(next.steps[0] ?? null);
  }

  function fireOne(nodeId: string) {
    const n = runNode(flowId, nodeId, facts);
    setFocus(n);
    setWalk((prev) => {
      const base = prev?.flowId === flowId ? prev : runFlow(flowId, facts);
      return {
        ...base,
        steps: base.steps.map((s) => (s.nodeId === nodeId ? n : s)),
      };
    });
  }

  function walkEleven() {
    const rows = runAllFlows(facts);
    setAll(rows);
    const current = rows.find((r) => r.flowId === flowId) ?? rows[0];
    setWalk(current);
    setFocus(current.steps[0] ?? null);
  }

  return (
    <div className="space-y-6">
      <section className="rounded-2xl border border-border bg-surface p-5 sm:p-6">
        <p className="text-[11px] font-medium uppercase tracking-[0.16em] text-muted">
          Flow charts · strategy to supply chain · no invented ₹
        </p>
        <h2 className="mt-2 font-display text-3xl font-medium tracking-tight">How the village actually moves</h2>
        <p className="mt-2 max-w-2xl text-sm leading-relaxed text-muted">
          Eleven executable charts. Each box is a kernel gate: remaining grams,
          declared ₹, mill muscle, clerk command, brain passport. Finance, procure,
          bank rails, and 3-way match stay named missing. Tourism stays refused.
        </p>
        <div className="mt-6 grid grid-cols-2 gap-3 lg:grid-cols-4">
          <Kpi label="Flows" value={stats.flows} live />
          <Kpi label="Living nodes" value={stats.living} live />
          <Kpi label="Partial" value={stats.partial} />
          <Kpi label="Named missing" value={stats.missing} />
        </div>
        <FlowLegend />
      </section>

      <section className="rounded-2xl border border-border bg-surface p-5">
        <p className="text-[11px] font-medium uppercase tracking-[0.16em] text-muted">Eleven charts</p>
        <ul className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-4">
          {FLOWS.map((f) => {
            const FIcon = ICONS[f.id];
            const summary = all?.find((w) => w.flowId === f.id);
            return (
              <li key={f.id}>
                <button
                  type="button"
                  data-qa={`flow-chip-${f.id}`}
                  onClick={() => walkAll(f.id)}
                  className={cn(
                    "flex min-h-11 w-full flex-col items-start gap-1 rounded-md border px-3 py-2.5 text-left transition-[color,background-color,border-color] duration-150",
                    flowId === f.id
                      ? "border-foreground bg-accent text-foreground"
                      : "border-border text-muted hover:text-foreground",
                  )}
                >
                  <span className="flex items-center gap-2 text-sm">
                    <FIcon className="size-4 shrink-0" strokeWidth={1.75} />
                    {f.name}
                  </span>
                  <span className="flex flex-wrap gap-1">
                    {f.nodes.map((n) => (
                      <span
                        key={n.id}
                        className={cn(
                          "size-1.5 rounded-full",
                          n.status === "living" ? "bg-live" : n.status === "partial" ? "bg-partial" : "bg-gap",
                        )}
                      />
                    ))}
                  </span>
                  {summary ? (
                    <span className="font-mono text-[10px] uppercase tracking-[0.12em] text-muted">
                      {summary.passed}p {summary.blocked}b {summary.named}n
                    </span>
                  ) : null}
                </button>
              </li>
            );
          })}
        </ul>
      </section>

      <div className="grid gap-4 lg:grid-cols-[minmax(0,1.15fr)_minmax(0,0.85fr)]">
        <section className="rounded-2xl border border-border bg-surface p-5">
          <p className="text-[11px] font-medium uppercase tracking-[0.16em] text-muted">
            {def.human} · {def.layout} · {def.nodes.length} nodes
          </p>
          <h3 className="mt-2 font-display text-xl">{def.name} chart</h3>
          <p className="mt-2 text-sm leading-relaxed text-muted">{def.thesis}</p>
          <p className="mt-2 text-sm text-muted">Missing: {def.missing}</p>

          <FlowChart def={def} byNode={byNode} onFire={fireOne} />

          <div className="mt-5 flex flex-wrap gap-2">
            <Button data-qa="flow-walk" onClick={() => walkAll(flowId)}>
              <Icon className="size-4" strokeWidth={1.75} />
              Walk {def.name.toLowerCase()}
            </Button>
            <Button data-qa="flow-walk-all" variant="outline" onClick={walkEleven}>
              Walk all eleven
            </Button>
            <Button asChild variant="outline">
              <Link to={def.href as never}>Open organ</Link>
            </Button>
          </div>
        </section>

        <section className="rounded-2xl border border-border bg-surface p-5">
          <p className="text-[11px] font-medium uppercase tracking-[0.16em] text-muted">Result</p>
          <h3 className="mt-2 font-display text-xl">{focus?.name ?? "Waiting on a walk"}</h3>
          {focus ? (
            <>
              <div className="mt-2 flex flex-wrap gap-2">
                <Badge variant={klass(focus.decision)}>{focus.decision}</Badge>
                <Badge variant={klass(focus.status)}>{focus.status}</Badge>
              </div>
              <p className="mt-3 font-mono text-[11px] text-muted">{focus.algorithm}</p>
              <p data-qa="flow-result" className="mt-3 text-sm leading-relaxed text-foreground">
                {focus.reason}
              </p>
            </>
          ) : (
            <p className="mt-3 text-sm text-muted">Walk a flow or tap a node. Missing stay named.</p>
          )}
          {walk ? (
            <p className="mt-4 rounded-xl border border-border bg-background px-3 py-3 text-sm text-muted">
              {walk.reason}
            </p>
          ) : null}
        </section>
      </div>

      {all ? (
        <section className="rounded-2xl border border-border bg-surface p-5">
          <p className="text-[11px] font-medium uppercase tracking-[0.16em] text-muted">All charts</p>
          <h3 className="mt-2 font-display text-xl">Walk of the eleven</h3>
          <div className="mt-4 overflow-x-auto">
            <table data-qa="flow-all-result" className="w-full min-w-[28rem] text-left text-sm">
              <thead className="text-[11px] uppercase tracking-[0.12em] text-muted">
                <tr>
                  <th className="pb-2 font-medium">Chart</th>
                  <th className="pb-2 font-medium">Pass</th>
                  <th className="pb-2 font-medium">Block</th>
                  <th className="pb-2 font-medium">Defer</th>
                  <th className="pb-2 font-medium">Named</th>
                  <th className="pb-2 font-medium">Refuse</th>
                </tr>
              </thead>
              <tbody>
                {all.map((row) => (
                  <tr key={row.flowId} className="border-t border-border">
                    <td className="py-2">
                      <button
                        type="button"
                        className="text-left hover:text-live"
                        onClick={() => walkAll(row.flowId)}
                      >
                        {row.name}
                      </button>
                    </td>
                    <td className="py-2 font-mono text-live">{row.passed}</td>
                    <td className="py-2 font-mono text-gap">{row.blocked}</td>
                    <td className="py-2 font-mono text-partial">{row.deferred}</td>
                    <td className="py-2 font-mono text-partial">{row.named}</td>
                    <td className="py-2 font-mono text-gap">{row.refused}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="mt-3 text-sm text-muted">₹ null on every walk. Finance and procure stay named.</p>
        </section>
      ) : null}
    </div>
  );
}

function Kpi({ label, value, live }: { label: string; value: string | number; live?: boolean }) {
  return (
    <div className="rounded-xl border border-border bg-background px-3 py-2">
      <div className="text-[10px] uppercase tracking-[0.14em] text-muted">{label}</div>
      <div className={cn("font-mono text-lg tabular-nums", live ? "text-live" : "text-foreground")}>{value}</div>
    </div>
  );
}
