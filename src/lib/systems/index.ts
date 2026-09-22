import { CONCEPTS } from "../lattice/concepts.ts";
import { AI_SYSTEMS, MODULE_DIRS_ON_DISK, NAMED_AI_MODULE_FOLDERS } from "./catalog.ts";
import type { AiSystem, SystemActual, SystemFamily, SystemStats } from "./types.ts";

export type { AiSystem, SystemActual, SystemFamily, SystemPlugStatus, SystemStats } from "./types.ts";
export { AI_SYSTEMS, MODULE_DIRS_ON_DISK, NAMED_AI_MODULE_FOLDERS } from "./catalog.ts";

const CONCEPT_BY_ID = Object.fromEntries(CONCEPTS.map((c) => [c.id, c]));

export const SYSTEM_BY_ID: Record<string, AiSystem> = Object.fromEntries(
  AI_SYSTEMS.map((s) => [s.id, s]),
);

export function systemStatusVariant(actual: SystemActual) {
  if (actual === "partial") return "partial" as const;
  if (actual === "duplicate") return "partial" as const;
  return "gap" as const;
}

export function systemStats(): SystemStats {
  const wiredButSkeleton = AI_SYSTEMS.filter(
    (s) => s.declared === "WIRED" && (s.actual === "skeleton" || s.actual === "duplicate" || !s.isComplete),
  ).length;
  const stubs = AI_SYSTEMS.filter((s) => s.bytesCanonical > 0 && s.bytesCanonical < 2000).length;
  const duplicates = AI_SYSTEMS.filter((s) => s.actual === "duplicate").length;
  return {
    systems: AI_SYSTEMS.length,
    wiredButSkeleton,
    stubs,
    duplicates,
    livingPlugs: 0,
    partialPlugs: AI_SYSTEMS.filter((s) => s.actual === "partial").length,
    missingPlugs: AI_SYSTEMS.filter((s) => s.actual !== "partial").length,
    moduleDirs: MODULE_DIRS_ON_DISK,
    namedAiModules: NAMED_AI_MODULE_FOLDERS,
  };
}

export function filterSystems(opts: {
  family: "all" | SystemFamily;
  actual: "all" | SystemActual;
  query: string;
}): AiSystem[] {
  const q = opts.query.trim().toLowerCase();
  return AI_SYSTEMS.filter((s) => {
    if (opts.family !== "all" && s.family !== opts.family) return false;
    if (opts.actual === "stub") {
      if (!(s.bytesCanonical > 0 && s.bytesCanonical < 2000)) return false;
    } else if (opts.actual !== "all" && s.actual !== opts.actual) {
      return false;
    }
    if (!q) return true;
    const hay = `${s.name} ${s.moduleId} ${s.silo} ${s.contract} ${s.path}`.toLowerCase();
    return hay.includes(q);
  });
}

export function organsForSystem(s: AiSystem) {
  return s.organs.map((id) => CONCEPT_BY_ID[id]).filter(Boolean);
}

export function systemsForOrgan(organId: string): AiSystem[] {
  return AI_SYSTEMS.filter((s) => s.organs.includes(organId));
}
