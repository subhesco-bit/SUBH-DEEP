import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { CANONICAL_QUERIES } from "../library/queries.ts";
import {
  composeEconomy,
  compactEnvelope,
  consultEconomy,
  estimateTokens,
  naiveDump,
  resetEconomyCache,
} from "./economy.ts";

describe("token economy", () => {
  it("packs a consult far below the GitHub dump and never calls an LLM", () => {
    resetEconomyCache();
    const naive = estimateTokens(naiveDump());
    const compact = estimateTokens(compactEnvelope("Why did harvest die at the portal?").text);
    assert.ok(naive > 8_000, `naive dump too small to be the cadaver: ${naive}`);
    assert.ok(compact < naive * 0.05, `compact ${compact} not under 5% of naive ${naive}`);
    const saved = ((naive - compact) / naive) * 100;
    assert.ok(saved >= 95, `saved ${saved.toFixed(1)}%`);
    const r = consultEconomy("Why did harvest die at the portal?");
    assert.equal(r.llmCalls, 0);
    assert.ok(r.hits.length >= 1);
  });

  it("batches every reflex and caches the second pass", () => {
    const snap = composeEconomy();
    assert.equal(snap.receipts.length, CANONICAL_QUERIES.length);
    assert.equal(snap.llmCalls, 0);
    assert.equal(snap.cacheHits, CANONICAL_QUERIES.length);
    assert.ok(snap.batchSavedPct >= 95);
    assert.ok(snap.plugins.some((p) => p.id === "llm-gate"));
    assert.ok(snap.plugins.some((p) => p.id === "batch"));
  });
});
