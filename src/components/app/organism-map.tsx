import { useMemo } from "react";
import {
  BRIDGES,
  CONCEPTS,
  CONCEPT_BY_ID,
  VIEWBOX,
  conceptRole,
  type Bridge,
} from "@/lib/lattice";
import { useLattice } from "@/lib/lattice/store";
import { cn } from "@/lib/utils";

function curve(a: { x: number; y: number }, b: { x: number; y: number }) {
  const mx = (a.x + b.x) / 2;
  const my = (a.y + b.y) / 2;
  const dx = b.x - a.x;
  const dy = b.y - a.y;
  const nx = -dy * 0.18;
  const ny = dx * 0.18;
  return `M ${a.x} ${a.y} Q ${mx + nx} ${my + ny} ${b.x} ${b.y}`;
}

function strokeFor(b: Bridge) {
  if (b.status === "living") return "var(--color-live)";
  if (b.status === "partial") return "var(--color-partial)";
  return "var(--color-gap)";
}

export function OrganismMap() {
  const selectedConceptId = useLattice((s) => s.selectedConceptId);
  const selectedBridgeId = useLattice((s) => s.selectedBridgeId);
  const statusFilter = useLattice((s) => s.statusFilter);
  const kindFilter = useLattice((s) => s.kindFilter);
  const roleFilter = useLattice((s) => s.roleFilter);
  const query = useLattice((s) => s.query);
  const proposed = useLattice((s) => s.proposed);
  const showMesh = useLattice((s) => s.showMesh);
  const selectConcept = useLattice((s) => s.selectConcept);
  const selectBridge = useLattice((s) => s.selectBridge);

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase();
    return BRIDGES.filter((b) => {
      if (statusFilter !== "all" && b.status !== statusFilter) return false;
      if (kindFilter !== "all" && b.kind !== kindFilter) return false;
      if (!showMesh && b.status === "missing" && selectedBridgeId !== b.id) {
        if (
          selectedConceptId !== b.from &&
          selectedConceptId !== b.to
        ) {
          return false;
        }
      }
      if (!q) return true;
      const from = CONCEPT_BY_ID[b.from];
      const to = CONCEPT_BY_ID[b.to];
      return `${b.name} ${from?.name} ${to?.name}`.toLowerCase().includes(q);
    });
  }, [
    statusFilter,
    kindFilter,
    query,
    showMesh,
    selectedBridgeId,
    selectedConceptId,
  ]);

  const connected = useMemo(() => {
    if (!selectedConceptId) return new Set<string>();
    const ids = new Set<string>([selectedConceptId]);
    for (const b of BRIDGES) {
      if (b.from === selectedConceptId) ids.add(b.to);
      if (b.to === selectedConceptId) ids.add(b.from);
    }
    const self = CONCEPT_BY_ID[selectedConceptId];
    for (const id of self?.binds ?? []) ids.add(id);
    return ids;
  }, [selectedConceptId]);

  const nodes = CONCEPTS.filter((c) => {
    if (roleFilter !== "all" && conceptRole(c) !== roleFilter) return false;
    return true;
  });

  return (
    <div className="relative overflow-hidden rounded-2xl border border-border bg-surface">
      <div
        className="pointer-events-none absolute inset-0 opacity-40"
        style={{
          backgroundImage:
            "linear-gradient(to right, color-mix(in oklab, var(--color-foreground) 6%, transparent) 1px, transparent 1px), linear-gradient(to bottom, color-mix(in oklab, var(--color-foreground) 6%, transparent) 1px, transparent 1px)",
          backgroundSize: "48px 48px",
        }}
      />
      <div className="relative min-h-[420px] w-full overflow-hidden">
        <div
          className="relative mx-auto w-full"
          style={{ aspectRatio: `${VIEWBOX.w} / ${VIEWBOX.h}` }}
        >
          <svg
            viewBox={`0 0 ${VIEWBOX.w} ${VIEWBOX.h}`}
            className="absolute inset-0 h-full w-full"
            role="img"
            aria-label="AFRERA organism with concept ligaments"
          >
            {visible.map((b) => {
              const from = CONCEPT_BY_ID[b.from];
              const to = CONCEPT_BY_ID[b.to];
              if (!from || !to) return null;
              const active =
                selectedBridgeId === b.id ||
                selectedConceptId === b.from ||
                selectedConceptId === b.to;
              const dim = selectedConceptId && !active;
              return (
                <path
                  key={b.id}
                  d={curve(from, to)}
                  fill="none"
                  stroke={strokeFor(b)}
                  strokeWidth={active ? 2.4 : b.status === "missing" ? 1.05 : 1.35}
                  strokeDasharray={
                    b.status === "missing"
                      ? "5 6"
                      : b.status === "partial"
                        ? "10 6"
                        : undefined
                  }
                  strokeLinecap="round"
                  opacity={dim ? 0.1 : active ? 0.95 : b.status === "missing" ? 0.38 : 0.55}
                  className="cursor-pointer"
                  onClick={(e) => {
                    e.stopPropagation();
                    selectBridge(b.id);
                    selectConcept(b.from);
                  }}
                />
              );
            })}
            {proposed.map((id) => {
              const b = visible.find((x) => x.id === id);
              if (!b) return null;
              const from = CONCEPT_BY_ID[b.from];
              const to = CONCEPT_BY_ID[b.to];
              if (!from || !to) return null;
              return (
                <path
                  key={`p-${id}`}
                  d={curve(from, to)}
                  fill="none"
                  stroke="var(--color-foreground)"
                  strokeWidth={0.6}
                  opacity={0.35}
                />
              );
            })}
          </svg>

          {nodes.map((c) => {
            const dim =
              selectedConceptId !== null && !connected.has(c.id) && query.length === 0;
            const selected = selectedConceptId === c.id;
            const bridge = conceptRole(c) === "bridge";
            return (
              <button
                key={c.id}
                type="button"
                onClick={() => selectConcept(c.id)}
                className={cn(
                  "absolute -translate-x-1/2 -translate-y-1/2 text-left transition-[opacity,background-color,border-color,transform] duration-200 ease-[var(--ease-smooth-out)]",
                  bridge
                    ? "rounded-md border px-2.5 py-1"
                    : "rounded-full border px-3 py-1.5",
                  c.status === "missing"
                    ? "border-dashed border-gap/70 bg-background text-muted"
                    : "border-border bg-background text-foreground",
                  selected && "border-foreground bg-accent text-foreground",
                  dim && "opacity-25",
                )}
                style={{
                  left: `${(c.x / VIEWBOX.w) * 100}%`,
                  top: `${(c.y / VIEWBOX.h) * 100}%`,
                }}
              >
                <span
                  className={cn(
                    "block font-display leading-tight tracking-tight",
                    bridge ? "text-xs" : "text-sm",
                  )}
                >
                  {c.short}
                </span>
                <span className="block text-[10px] uppercase tracking-[0.12em] text-muted">
                  {bridge ? "bridge" : c.dora.split("/")[0].trim()}
                </span>
              </button>
            );
          })}
        </div>
      </div>
      <div className="flex flex-wrap gap-4 border-t border-border px-4 py-3 text-[11px] uppercase tracking-[0.12em] text-muted">
        <Legend swatch="bg-live" label="Living" solid />
        <Legend swatch="bg-partial" label="Partial" />
        <Legend swatch="bg-gap" label="Missing" dashed />
        <span className="ml-auto normal-case tracking-normal">
          Squares are bridge concepts. Dashed threads are the missing mesh.
        </span>
      </div>
    </div>
  );
}

function Legend({
  swatch,
  label,
  solid,
  dashed,
}: {
  swatch: string;
  label: string;
  solid?: boolean;
  dashed?: boolean;
}) {
  return (
    <span className="inline-flex items-center gap-2">
      <span
        className={cn("h-px w-6", swatch, dashed && "opacity-80")}
        style={{
          borderTopWidth: 2,
          borderStyle: dashed ? "dashed" : solid ? "solid" : "dotted",
          borderColor: "currentColor",
          background: "transparent",
          height: 0,
          width: 22,
        }}
      />
      {label}
    </span>
  );
}
