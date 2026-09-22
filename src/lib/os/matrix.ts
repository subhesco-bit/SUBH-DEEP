/** 16-link concept-to-runtime matrix. The missing single source of truth. */

import { OS_ITEMS } from "./catalog.ts";
import type { OsItem, RuntimeChain } from "./types.ts";

export const MATRIX_LINKS = [
  "concept",
  "module",
  "feature",
  "user",
  "workflow",
  "rules",
  "database",
  "service",
  "api",
  "authorization",
  "ai",
  "erp",
  "page",
  "component",
  "test",
  "telemetry",
] as const;

const PAGE_COMPONENT: Record<string, string> = {
  "/": "BooksHome",
  "/lots": "LotsBoard",
  "/warehouse": "WarehouseBoard",
  "/trade": "TradeBoard",
  "/ledger": "LedgerBoard",
  "/cells": "CellsBoard",
  "/platform": "AtlasBoard + PlatformBoard",
  "/pulse": "PulseWalk",
  "/modules": "ModulesPanel",
  "/charter": "CharterBoard",
  "/companion": "CompanionPanel",
  "/nerve": "NervePanel",
  "/library": "LibraryPanel",
  "/os": "OsBoard",
  "/economy": "EconomyPanel",
  "/organism": "OrganismMap",
  "/brain": "AiAtlas + BrainBoard",
};

const PAGE_WORKFLOW: Record<string, string> = {
  "/lots": "harvest-mint",
  "/warehouse": "warehouse-intake",
  "/trade": "offtake-settle",
  "/nerve": "nerve-consult",
  "/modules": "platform-bus",
  "/companion": "harvest-mint",
  "/pulse": "harvest-mint",
  "/platform": "platform-bus",
  "/charter": "platform-bus",
  "/os": "os.classify",
};

function bound(x: OsItem) {
  return x.kernel === "verified" || x.kernel === "partial";
}

function userFor(x: OsItem): string {
  if (x.organs.includes("farmer") || x.organs.includes("household")) return "cell / clerk";
  if (x.organs.includes("fpo")) return "FPO clerk";
  return "operator";
}

export function chainFor(id: string): RuntimeChain | null {
  const x = OS_ITEMS.find((r) => r.id === id);
  if (!x) return null;
  const live = bound(x);
  return {
    concept: x.name,
    module: x.organs.join(" · "),
    feature: x.present,
    user: userFor(x),
    workflow: PAGE_WORKFLOW[x.href] ?? (live ? "named" : "unbound"),
    rules: x.next,
    database: live ? "erp_* remaining_grams / journal" : "unbound",
    service: live ? "kernel server fn" : "unbound",
    api: live ? "createServerFn clerk write" : "none",
    authorization: "Clerk. Auth off for visitors. GitHub JWT disconnected.",
    ai: x.level >= 5 || x.organs.includes("ai") ? "library / companion / firewall" : "none",
    erp: x.area === "erp" || x.organs.includes("erp") || x.organs.includes("rupee") ? "village journal" : "n/a",
    page: x.href,
    component: PAGE_COMPONENT[x.href] ?? "OsBoard",
    test: x.todo === "done" ? "kernel tests" : "named",
    telemetry: "lotId on the bus",
  };
}
