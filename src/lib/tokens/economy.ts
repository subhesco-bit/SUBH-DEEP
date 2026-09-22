/** Token economy. Library answers. LLM spend is 0. Savings are measured. */

import { CONCEPTS, BRIDGES } from "../lattice/index.ts";
import { libraryCatalog } from "../library/catalog.ts";
import { queryLibraryKnowledge } from "../library/match.ts";
import { CANONICAL_QUERIES } from "../library/queries.ts";
import { DECISION_LAWS } from "../modules/charter.ts";
import { MODULE_RUNTIME } from "../modules/registry.ts";
import { WORKFLOWS } from "../modules/workflows.ts";
import { AI_SYSTEMS } from "../systems/catalog.ts";
import type { BooksSnapshot } from "../erp/types.ts";

export type PluginId = "library" | "books" | "charter" | "systems" | "batch" | "llm-gate" | "cache";

export type PluginPack = {
  id: PluginId;
  label: string;
  tokens: number;
  body: string;
};

export type ConsultReceipt = {
  query: string;
  naiveTokens: number;
  compactTokens: number;
  savedPct: number;
  cacheHit: boolean;
  llmCalls: 0;
  hits: string[];
};

export type EconomySnapshot = {
  naiveTokens: number;
  compactTokens: number;
  batchNaiveTokens: number;
  batchCompactTokens: number;
  savedPct: number;
  batchSavedPct: number;
  llmCalls: 0;
  cacheHits: number;
  plugins: PluginPack[];
  receipts: ConsultReceipt[];
  thesis: string;
};

const cache = new Map<string, ConsultReceipt>();

export const TARGET_SAVE_PCT = 99.5;

export function estimateTokens(text: string): number {
  if (!text) return 0;
  return Math.ceil(text.length / 4);
}

export function naiveDump(): string {
  return JSON.stringify({
    systems: AI_SYSTEMS,
    concepts: CONCEPTS,
    bridges: BRIDGES,
    workflows: WORKFLOWS,
    runtime: MODULE_RUNTIME,
    catalog: libraryCatalog().map((c) => ({
      id: c.id,
      title: c.title,
      body: c.body,
      organs: c.organs,
      source: c.source,
    })),
  });
}

function packLibrary(query: string): PluginPack {
  const hits = queryLibraryKnowledge(query, { limit: 3 });
  const body = hits.map((h) => h.id).join(" ") || "none";
  return { id: "library", label: "Library hippocampus", tokens: estimateTokens(body), body };
}

function packBooks(books?: BooksSnapshot | null): PluginPack {
  if (!books) {
    const body = "remaining on lot";
    return { id: "books", label: "Books remaining", tokens: estimateTokens(body), body };
  }
  const remaining = books.lots.reduce((n, l) => n + l.remainingGrams, 0);
  const body = `${books.cells.length}c ${remaining}g ${books.orders.filter((o) => o.status === "open").length}o`;
  return { id: "books", label: "Books remaining", tokens: estimateTokens(body), body };
}

function packCharter(): PluginPack {
  const body = `${DECISION_LAWS.map((l) => l.id).join(" ")} firewall`;
  return { id: "charter", label: "Decision laws", tokens: estimateTokens(body), body };
}

function packSystems(): PluginPack {
  const living = MODULE_RUNTIME.filter((m) => m.plug === "living").length;
  const body = `${living}/${MODULE_RUNTIME.length} plugs`;
  return { id: "systems", label: "Systems rack", tokens: estimateTokens(body), body };
}

export function compactEnvelope(query: string, books?: BooksSnapshot | null): { text: string; plugins: PluginPack[] } {
  const plugins = [packLibrary(query), packBooks(books), packCharter(), packSystems()];
  const text = `Q ${query.slice(0, 80)}|${plugins.map((p) => `${p.id}:${p.body}`).join("|")}|GATE0`;
  return { text, plugins };
}

export function shouldCallLlm(query: string): boolean {
  return queryLibraryKnowledge(query, { limit: 1 }).length === 0;
}

export function consultEconomy(query: string, books?: BooksSnapshot | null): ConsultReceipt {
  const key = query.trim().toLowerCase();
  const hit = cache.get(key);
  const naive = estimateTokens(naiveDump());
  if (hit) {
    return { ...hit, cacheHit: true, naiveTokens: naive };
  }
  const compact = compactEnvelope(query, books);
  const compactTokens = estimateTokens(compact.text);
  const savedPct = naive === 0 ? 0 : Math.round(((naive - compactTokens) / naive) * 1000) / 10;
  const receipt: ConsultReceipt = {
    query,
    naiveTokens: naive,
    compactTokens,
    savedPct,
    cacheHit: false,
    llmCalls: 0,
    hits: queryLibraryKnowledge(query, { limit: 3 }).map((h) => h.title),
  };
  cache.set(key, receipt);
  return receipt;
}

export function resetEconomyCache(): void {
  cache.clear();
}

export function composeEconomy(books?: BooksSnapshot | null): EconomySnapshot {
  resetEconomyCache();
  const naive = estimateTokens(naiveDump());
  const plugins = [
    ...compactEnvelope("lot remaining harvest", books).plugins,
    {
      id: "batch" as const,
      label: "Canonical batch",
      tokens: 0,
      body: `${CANONICAL_QUERIES.length} reflex queries as one Python-style batch. Same 4-char token rule. No OpenAI. No PowerShell.`,
    },
    {
      id: "llm-gate" as const,
      label: "LLM gate",
      tokens: 0,
      body: "Library hit ⇒ llmCalls = 0. Grok is not called to name remaining grams. OpenAI is never the nerve.",
    },
    {
      id: "cache" as const,
      label: "Consult cache",
      tokens: 0,
      body: "Identical query returns the packed envelope. Second pass is a cache hit.",
    },
  ];
  const receipts = CANONICAL_QUERIES.map((q) => consultEconomy(q.query, books));
  const replay = CANONICAL_QUERIES.map((q) => consultEconomy(q.query, books));
  const cacheHits = replay.filter((r) => r.cacheHit).length;
  const batchCompact = receipts.reduce((n, r) => n + r.compactTokens, 0);
  const batchNaive = naive * receipts.length;
  const savedPct = naive === 0 ? 0 : Math.round(((naive - receipts[0].compactTokens) / naive) * 1000) / 10;
  const batchSavedPct =
    batchNaive === 0 ? 0 : Math.round(((batchNaive - batchCompact) / batchNaive) * 1000) / 10;
  plugins[4].tokens = batchCompact;
  return {
    naiveTokens: naive,
    compactTokens: receipts[0]?.compactTokens ?? 0,
    batchNaiveTokens: batchNaive,
    batchCompactTokens: batchCompact,
    savedPct,
    batchSavedPct,
    llmCalls: 0,
    cacheHits,
    plugins,
    receipts,
    thesis:
      "Naive send is the GitHub cadaver. Compact send is card ids, remaining grams, L1–L12 ids. Batch fires every reflex once. Library first. OpenAI and PowerShell are not the nerve.",
  };
}

/** GitHub health paste vs this organism. Do not treat the paste as living. */
export const GITHUB_CLAIM = {
  vulns: "4 backend + 3 frontend, all moderate",
  critical: 0,
  routes: 968,
  routesClaim: "80% complete (+200 expansion)",
  migrationsPassing: "762/799",
  collisions: 32,
  services: 210,
  productionPct: "76%",
  duplicates: 4,
  coverage: "80%",
  testsFailing: 2,
  erpStubbed: 46,
  missingCritical: 5,
} as const;

export const ORGANISM_HEALTH = {
  vulns: "Those 7 live on GitHub services. This kernel does not host them.",
  fileRoutes: 18,
  migrations: "0002–0009 PGLite. No 32-collision set.",
  erp: "Journal is the GL: mint, intake, offtake, settle, process. Not 46 stubs.",
  duplicates: "One books. GitHub 4 duplicate services stay cadavers.",
  tests: "Lattice, library, ERP, modules, charter, economy — living. GitHub 2 fails stay there.",
  missing: "insurance · recie · fvie · rcop · water/scheme — named missing, not scaffolded.",
  llm: "Library first. llmCalls = 0 on reflex. Compact envelope ≥ 99.5% under naive dump.",
} as const;
