import { BRIDGES } from "./bridges.ts";
import { CONCEPTS } from "./concepts.ts";
import type { Bridge, BridgeKind, BridgeStatus, Concept, ConceptRole } from "./types.ts";

export * from "./types.ts";
export { CONCEPTS } from "./concepts.ts";
export { BRIDGES } from "./bridges.ts";
export { WALK, WALK_TITLE, WALK_LEDE } from "./walk.ts";

export const CONCEPT_BY_ID: Record<string, Concept> = Object.fromEntries(
  CONCEPTS.map((c) => [c.id, c]),
);

export const BRIDGE_BY_ID: Record<string, Bridge> = Object.fromEntries(
  BRIDGES.map((b) => [b.id, b]),
);

export function conceptRole(c: Concept): ConceptRole {
  return c.role ?? "organ";
}

export function bridgesFor(conceptId: string): Bridge[] {
  return BRIDGES.filter((b) => b.from === conceptId || b.to === conceptId);
}

export function conceptStatusVariant(status: Concept["status"]) {
  if (status === "living") return "live" as const;
  if (status === "partial") return "partial" as const;
  return "gap" as const;
}

export function bridgeStatusVariant(status: BridgeStatus) {
  if (status === "living") return "live" as const;
  if (status === "partial") return "partial" as const;
  return "gap" as const;
}

export type LatticeStats = {
  organs: number;
  bridgeConcepts: number;
  missingOrgans: number;
  bridges: number;
  living: number;
  partial: number;
  missing: number;
  technical: number;
  thoughtful: number;
  integrity: number;
  isolated: number;
  weak: number;
};

export function degreeMap(): Record<string, number> {
  const deg: Record<string, number> = {};
  for (const c of CONCEPTS) deg[c.id] = 0;
  for (const b of BRIDGES) {
    if (deg[b.from] !== undefined) deg[b.from] += 1;
    if (deg[b.to] !== undefined) deg[b.to] += 1;
  }
  return deg;
}

export function livingDegreeMap(): Record<string, number> {
  const deg: Record<string, number> = {};
  for (const c of CONCEPTS) deg[c.id] = 0;
  for (const b of BRIDGES) {
    if (b.status === "missing") continue;
    if (deg[b.from] !== undefined) deg[b.from] += 1;
    if (deg[b.to] !== undefined) deg[b.to] += 1;
  }
  return deg;
}

export function isolatedConcepts(): Concept[] {
  const deg = livingDegreeMap();
  return CONCEPTS.filter((c) => (deg[c.id] ?? 0) === 0);
}

export function weakConcepts(): Concept[] {
  const deg = livingDegreeMap();
  return CONCEPTS.filter((c) => (deg[c.id] ?? 0) > 0 && (deg[c.id] ?? 0) <= 2);
}

export function latticeStats(): LatticeStats {
  const missingOrgans = CONCEPTS.filter((c) => c.status === "missing").length;
  const living = BRIDGES.filter((b) => b.status === "living").length;
  const partial = BRIDGES.filter((b) => b.status === "partial").length;
  const missing = BRIDGES.filter((b) => b.status === "missing").length;
  const weighted = living * 1 + partial * 0.45;
  const integrity = BRIDGES.length ? Math.round((weighted / BRIDGES.length) * 100) : 0;
  const liveDeg = livingDegreeMap();
  const isolated = CONCEPTS.filter((c) => (liveDeg[c.id] ?? 0) === 0).length;
  const weak = CONCEPTS.filter((c) => {
    const d = liveDeg[c.id] ?? 0;
    return d > 0 && d <= 2;
  }).length;
  return {
    organs: CONCEPTS.filter((c) => conceptRole(c) === "organ").length,
    bridgeConcepts: CONCEPTS.filter((c) => conceptRole(c) === "bridge").length,
    missingOrgans,
    bridges: BRIDGES.length,
    living,
    partial,
    missing,
    technical: BRIDGES.filter((b) => b.kind === "technical").length,
    thoughtful: BRIDGES.filter((b) => b.kind === "thoughtful").length,
    integrity,
    isolated,
    weak,
  };
}

export function filterBridges(opts: {
  status: "all" | BridgeStatus;
  kind: "all" | BridgeKind;
  query: string;
  conceptId?: string | null;
}): Bridge[] {
  const q = opts.query.trim().toLowerCase();
  return BRIDGES.filter((b) => {
    if (opts.status !== "all" && b.status !== opts.status) return false;
    if (opts.kind !== "all" && b.kind !== opts.kind) return false;
    if (opts.conceptId && b.from !== opts.conceptId && b.to !== opts.conceptId) return false;
    if (!q) return true;
    const from = CONCEPT_BY_ID[b.from];
    const to = CONCEPT_BY_ID[b.to];
    const hay =
      `${b.name} ${b.signal} ${b.thought} ${b.contract} ${from?.name ?? ""} ${to?.name ?? ""}`.toLowerCase();
    return hay.includes(q);
  });
}

/** Ligaments page: Living, then Missing, then Partial. */
export const LIGAMENT_STATUS_ORDER: Array<"all" | BridgeStatus> = ["living", "missing", "partial", "all"];

export function groupBridges(rows: Bridge[]): Array<{ status: BridgeStatus; rows: Bridge[] }> {
  const order: BridgeStatus[] = ["living", "missing", "partial"];
  return order
    .map((status) => ({ status, rows: rows.filter((b) => b.status === status) }))
    .filter((g) => g.rows.length > 0);
}

export const VIEWBOX = { w: 1000, h: 640 };

export function bindTargets(c: Concept): Concept[] {
  return (c.binds ?? []).map((id) => CONCEPT_BY_ID[id]).filter(Boolean) as Concept[];
}
