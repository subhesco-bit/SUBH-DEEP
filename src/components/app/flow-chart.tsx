import { cn } from "@/lib/utils";
import type { FlowDef, FlowNode, NodeAct } from "@/lib/flows";


function VArrow({ dashed }: { dashed?: boolean }) {
  return (
    <div className="flex justify-center py-0.5" aria-hidden>
      <svg width="12" height="28" viewBox="0 0 12 28" className={dashed ? "text-gap" : "text-live"}>
        <line
          x1="6"
          y1="2"
          x2="6"
          y2="20"
          stroke="currentColor"
          strokeWidth="1"
          strokeDasharray={dashed ? "3 3" : undefined}
          opacity="0.55"
        />
        <polyline
          points="2,16 6,22 10,16"
          fill="none"
          stroke="currentColor"
          strokeWidth="1"
          opacity="0.55"
        />
      </svg>
    </div>
  );
}

function NodeBox({
  node,
  result,
  onFire,
}: {
  node: FlowNode;
  result?: NodeAct;
  onFire: () => void;
}) {
  const d = result?.decision;
  const shape = node.shape ?? (node.status === "missing" ? "missing" : "process");
  const diamond = shape === "decision";
  const klass =
    d === "pass"
      ? "border-live/50 text-live"
      : d === "block" || d === "refuse"
        ? "border-gap/50 text-gap"
        : d === "named" || d === "defer" || d === "propose"
          ? "border-partial/50 text-partial"
          : node.status === "missing"
            ? "border-dashed border-gap/40 text-muted"
            : node.status === "partial"
              ? "border-dashed border-partial/40 text-foreground"
              : "border-border text-foreground hover:border-foreground";

  return (
    <button
      type="button"
      data-qa={`flow-node-${node.id}`}
      onClick={onFire}
      className={cn(
        "relative w-full min-h-11 rounded-md border bg-surface px-3 py-2.5 text-left transition-[border-color,background-color] duration-150",
        diamond && "rounded-sm",
        klass,
      )}
    >
      {diamond ? (
        <span
          className="absolute left-2 top-1/2 size-2 -translate-y-1/2 rotate-45 border border-current opacity-70"
          aria-hidden
        />
      ) : null}
      <span className={cn("block text-sm font-medium", diamond && "pl-4")}>{node.name}</span>
      <span className={cn("mt-0.5 block font-mono text-[10px] uppercase tracking-[0.12em] text-muted", diamond && "pl-4")}>
        {result?.decision ?? node.status} · {node.algorithm}
      </span>
    </button>
  );
}

function Stack({
  nodes,
  byNode,
  onFire,
}: {
  nodes: FlowNode[];
  byNode: Map<string, NodeAct>;
  onFire: (id: string) => void;
}) {
  return (
    <ol className="mx-auto flex w-full max-w-md flex-col">
      {nodes.map((node, i) => (
        <li key={node.id}>
          {i > 0 ? <VArrow dashed={node.status !== "living"} /> : null}
          <NodeBox node={node} result={byNode.get(node.id)} onFire={() => onFire(node.id)} />
        </li>
      ))}
    </ol>
  );
}

function Row({
  nodes,
  byNode,
  onFire,
  refuse,
}: {
  nodes: FlowNode[];
  byNode: Map<string, NodeAct>;
  onFire: (id: string) => void;
  refuse?: boolean;
}) {
  const cols =
    nodes.length >= 5
      ? "sm:grid-cols-3 lg:grid-cols-5"
      : nodes.length === 4
        ? "sm:grid-cols-2 lg:grid-cols-4"
        : nodes.length === 3
          ? "sm:grid-cols-3"
          : "sm:grid-cols-2";
  return (
    <ol className={cn("grid grid-cols-1 gap-2", cols)}>
      {nodes.map((node) => (
        <li key={node.id}>
          <NodeBox
            node={refuse && !node.shape ? { ...node, shape: "decision" } : node}
            result={byNode.get(node.id)}
            onFire={() => onFire(node.id)}
          />
        </li>
      ))}
    </ol>
  );
}

function LaneChart({
  def,
  byNode,
  onFire,
}: {
  def: FlowDef;
  byNode: Map<string, NodeAct>;
  onFire: (id: string) => void;
}) {
  const lanes = [
    { id: "material", label: "Material" },
    { id: "payment", label: "Payment" },
    { id: "command", label: "Command" },
  ] as const;
  return (
    <div className="grid gap-4 lg:grid-cols-3">
      {lanes.map((lane) => {
        const nodes = def.nodes.filter((n) => n.lane === lane.id);
        if (!nodes.length) return null;
        return (
          <div key={lane.id} className="rounded-xl border border-border bg-background p-3">
            <p className="mb-3 text-center text-[11px] font-medium uppercase tracking-[0.14em] text-muted">
              {lane.label}
            </p>
            <Stack nodes={nodes} byNode={byNode} onFire={onFire} />
          </div>
        );
      })}
    </div>
  );
}

export function FlowChart({
  def,
  byNode,
  onFire,
}: {
  def: FlowDef;
  byNode: Map<string, NodeAct>;
  onFire: (id: string) => void;
}) {
  if (def.layout === "lanes") {
    return (
      <div data-qa="flow-chart" className="mt-5">
        <LaneChart def={def} byNode={byNode} onFire={onFire} />
      </div>
    );
  }

  const byId = new Map(def.nodes.map((n) => [n.id, n]));
  const groups = def.groups ?? [{ label: def.name, ids: def.nodes.map((n) => n.id), kind: "stack" as const }];

  return (
    <div data-qa="flow-chart" className="mt-5 rounded-xl border border-border bg-background px-3 py-4 sm:px-4">
      {groups.map((group, gi) => {
        const nodes = group.ids.map((id) => byId.get(id)).filter((n): n is FlowNode => Boolean(n));
        if (!nodes.length) return null;
        return (
          <div key={group.label}>
            {gi > 0 ? <VArrow dashed={nodes.some((n) => n.status !== "living")} /> : null}
            <p className="mb-2 text-center text-[11px] font-medium uppercase tracking-[0.14em] text-muted">
              {group.label}
            </p>
            {group.kind === "stack" ? (
              <Stack nodes={nodes} byNode={byNode} onFire={onFire} />
            ) : (
              <Row nodes={nodes} byNode={byNode} onFire={onFire} refuse={group.kind === "refuse"} />
            )}
          </div>
        );
      })}
    </div>
  );
}

export function FlowLegend() {
  const items = [
    { label: "Living", klass: "border-live/50 text-live" },
    { label: "Partial", klass: "border-dashed border-partial/50 text-partial" },
    { label: "Missing", klass: "border-dashed border-gap/50 text-gap" },
    { label: "Refuse", klass: "border-gap/50 text-gap" },
  ];
  return (
    <ul className="mt-4 flex flex-wrap gap-3">
      {items.map((item) => (
        <li key={item.label} className={cn("flex items-center gap-2 text-[11px] uppercase tracking-[0.12em]", item.klass)}>
          <span className={cn("size-2 rounded-sm border", item.klass)} />
          {item.label}
        </li>
      ))}
    </ul>
  );
}
