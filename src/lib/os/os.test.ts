import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { OS_ITEMS, OS_STAGES } from "./catalog.ts";
import { chainFor, composeOs, filterOs } from "./compose.ts";
import { NEED_INTENTS, rankIntents } from "./intents.ts";
import { evidencePassport } from "./passport.ts";
import { MATRIX_LINKS } from "./matrix.ts";
import { enhanceFor } from "./enhance.ts";
import { remainingWork, todoCounts, osTodos } from "./todos.ts";
import { evaluateConstitution } from "./constitution.ts";
import { envelopeFor, envelopeInventedRupee } from "./envelope.ts";
import { canAdvance, livingAgriculture, SECTOR_JOURNEYS } from "./journeys.ts";
import { livingEvents, unknownEventFails } from "./events.ts";
import { grievancesFrom } from "./grievance.ts";
import { assessSuitability } from "./suitability.ts";
import type { BooksSnapshot, LotRow } from "../erp/types.ts";

describe("digital super-organism registry", () => {
  it("classifies every catalog item — Stage 0 complete", () => {
    const os = composeOs();
    assert.ok(OS_ITEMS.length >= 90, `catalog ${OS_ITEMS.length}`);
    assert.equal(os.classified, OS_ITEMS.length);
    assert.equal(os.stage0Pct, 100);
    assert.equal(OS_STAGES.length, 7);
    const ids = OS_ITEMS.map((x) => x.id);
    assert.equal(ids.length, new Set(ids).size);
    for (const x of OS_ITEMS) {
      assert.ok(x.name.trim(), x.id);
      assert.ok(x.present.trim(), x.id);
      assert.ok(x.missing.trim(), x.id);
      assert.ok(x.next.trim(), x.id);
      assert.ok(x.organs.length >= 1, x.id);
      assert.ok(x.href.startsWith("/"), x.id);
    }
  });

  it("does not claim GitHub is the kernel", () => {
    const os = composeOs();
    assert.ok(os.kernelVerified >= 15, `verified ${os.kernelVerified}`);
    assert.ok(os.githubScaffolded >= 10);
    assert.ok(os.open >= 1);
    const auth = OS_ITEMS.find((x) => x.id === "c-auth");
    assert.equal(auth?.kernel, "verified");
    assert.equal(auth?.github, "disconnected");
  });

  it("marks living innovations as done: passport, need, exception, rules, assist, suit, grief", () => {
    for (const id of [
      "n-passport",
      "n-need",
      "n-exception",
      "n-rules",
      "n-assist",
      "g-sot",
      "b-gov",
      "n-suit",
      "n-grief",
      "n-event",
      "b-consent",
      "a-comp",
    ]) {
      assert.equal(OS_ITEMS.find((x) => x.id === id)?.todo, "done", id);
      assert.ok(["verified", "partial"].includes(OS_ITEMS.find((x) => x.id === id)?.kernel ?? ""), id);
    }
    assert.equal(OS_ITEMS.find((x) => x.id === "c-scheme")?.kernel, "missing");
    assert.equal(OS_ITEMS.find((x) => x.id === "b-off")?.kernel, "missing");
  });

  it("filters stages and traces the 16-link concept → runtime matrix", () => {
    const s0 = filterOs({ stage: 0 });
    assert.ok(s0.length >= 3);
    const chain = chainFor("n-passport");
    assert.ok(chain?.concept.includes("Passport"));
    assert.match(chain?.database ?? "", /remaining/);
    assert.equal(MATRIX_LINKS.length, 16);
    for (const k of MATRIX_LINKS) {
      assert.ok(chain && String(chain[k]).trim(), k);
    }
  });

  it("need intents are problems, not module names", () => {
    assert.ok(NEED_INTENTS.some((i) => i.id === "sell-crop"));
    assert.ok(NEED_INTENTS.some((i) => i.id === "find-loan"));
    assert.ok(NEED_INTENTS.every((i) => i.href.startsWith("/")));
    const ranked = rankIntents(null);
    assert.equal(ranked.length, NEED_INTENTS.length);
  });

  it("evidence passport never invents a premium or a price", () => {
    const lot: LotRow = {
      id: "lot-x",
      cellId: "c1",
      cellName: "Enghi",
      fpoId: "f1",
      variety: "Chakhao Poireiton",
      commodity: "rice",
      grams: 510000,
      remainingGrams: 510000,
      grade: null,
      giMarker: "GI-AS-CHAKHAO",
      moistureBp: null,
      status: "minted",
      coverStatus: "bound",
      policyId: "POL-LANGTHASA-GODOWN",
      plantingId: null,
      giMinted: true,
      mintedAt: "2026-01-01",
      fusScore: 74,
      fusComplete: false,
    };
    const books = {
      lots: [lot],
      receipts: [],
      orders: [],
      journal: [],
      giChain: [{ id: "g1", lotId: "lot-x", seq: 1, event: "mint", handler: "Biren", geo: "Langthasa", season: "Magh 2026", createdAt: "2026-01-01" }],
      kpis: { journalBalanced: true },
    } as unknown as BooksSnapshot;
    const p = evidencePassport(lot, books);
    assert.equal(p.complete, true);
    assert.ok(p.atoms.some((a) => a.kind === "cover" && a.confidence === "declared"));
    assert.ok(p.atoms.some((a) => a.kind === "paymentRef" && a.confidence === "absent"));
    assert.ok(!p.atoms.some((a) => /premium|invent/i.test(a.value)));
  });

  it("enhances every concept at four simultaneous levels", () => {
    for (const x of OS_ITEMS) {
      const levels = enhanceFor(x.id);
      assert.equal(levels?.length, 4, x.id);
      assert.deepEqual(levels?.map((l) => l.level), ["component", "industry", "rural", "future"]);
    }
  });

  it("derives a TODO list and does not fake-complete missing organs", () => {
    const counts = todoCounts();
    assert.equal(counts.total, OS_ITEMS.length);
    assert.ok(counts.open >= 1);
    const next = remainingWork(8);
    assert.ok(next.length >= 1);
    assert.ok(next.every((t) => t.status !== "done"));
    assert.ok(osTodos().some((t) => t.status !== "done" && t.stage >= 2));
  });

  it("constitution blocks inferred caste and rupee writes", () => {
    assert.equal(evaluateConstitution({}).allowed, true);
    assert.equal(evaluateConstitution({ inferredTrait: "caste" }).allowed, false);
    assert.ok(evaluateConstitution({ rupeeWrite: true }).violated.includes("E3"));
    assert.ok(evaluateConstitution({ eligibilityFromConstraint: true }).violated.includes("E4"));
  });

  it("AI envelope never writes a rupee", () => {
    const env = envelopeFor({ organ: "orders", body: "Propose settle. Clerk names paymentRef.", action: "settle" });
    assert.equal(env.humanApproval, "required");
    assert.match(env.actionBoundary, /propose/);
    assert.equal(envelopeInventedRupee(env), false);
  });

  it("agriculture journey is living; travel is named; finance cannot be skipped as living", () => {
    const agri = SECTOR_JOURNEYS.find((j) => j.id === "agriculture");
    assert.equal(agri?.status, "living");
    assert.ok(livingAgriculture().some((s) => s.id === "harvest"));
    assert.equal(canAdvance("harvest", "store"), true);
    assert.equal(canAdvance("plan", "finance"), false);
    assert.equal(SECTOR_JOURNEYS.find((j) => j.id === "travel")?.status, "named");
  });

  it("living events fire; unknown events fail; flood opens a claim window", () => {
    assert.ok(livingEvents().some((e) => e.id === "harvest.completed"));
    assert.ok(livingEvents().some((e) => e.id === "weather.alert"));
    assert.equal(unknownEventFails("weather.tornado"), true);
    assert.equal(unknownEventFails("harvest.completed"), false);
  });

  it("suitability refuses loan, travel, invented premium; cover may bind", () => {
    assert.equal(assessSuitability("loan").refuse, true);
    assert.equal(assessSuitability("travel").refuse, true);
    assert.equal(assessSuitability("insurance-quote").refuse, true);
    assert.equal(assessSuitability("price").refuse, true);
    assert.equal(assessSuitability("price", { declared: true }).suitable, true);
    assert.equal(assessSuitability("cover").suitable, true);
    assert.equal(assessSuitability("cover").refuse, false);
  });

  it("grievance spine files village gates and never invents a rupee", () => {
    const cases = grievancesFrom([
      {
        code: "G2",
        severity: "defer",
        title: "1 offtake waits on paymentRef",
        body: "Clerk names the payment.",
        href: "/trade",
        impact: "cell",
        owner: "clerk",
        action: "Name paymentRef.",
      },
      {
        code: "G9",
        severity: "note",
        title: "AI cannot write rupees",
        body: "Firewall.",
        href: "/modules",
        impact: "policy",
        owner: "spine",
        action: "Keep the firewall.",
      },
    ]);
    assert.equal(cases.length, 1);
    assert.equal(cases[0].source, "G2");
    assert.equal(cases[0].inventsRupee, false);
    assert.equal(cases[0].stage, "ack");
  });
});
