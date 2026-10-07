"use strict";

const assert = require("node:assert/strict");
const { describe, it } = require("node:test");
const {
  DUAL_TRUTH,
  PRIMARY_NAV,
  NAMED_MISSING,
  REFUSED,
  completionScore,
  mayInventRupee,
} = require("../afreraComplete");

describe("AFRERA honest completion overlay", () => {
  it("does not paint GitHub 100% or invent a rupee", () => {
    const score = completionScore();
    assert.equal(score.complete, true);
    assert.equal(score.classified, 133);
    assert.equal(score.githubPct, 7);
    assert.ok(score.latticePct < 40);
    assert.equal(score.sapParity, false);
    assert.equal(score.aiParity, false);
    assert.equal(score.githubLivingPlugs, 0);
    assert.equal(score.rupeeWrite, false);
    assert.equal(mayInventRupee(), false);
    assert.equal(DUAL_TRUTH.githubPlatform.livingPlugs, 0);
  });

  it("keeps six primary doors and named missing", () => {
    assert.equal(PRIMARY_NAV.length, 6);
    assert.ok(PRIMARY_NAV.some((d) => d.to === "/"));
    assert.ok(PRIMARY_NAV.some((d) => d.to === "/os"));
    assert.ok(NAMED_MISSING.includes("agriculture-finance"));
    assert.ok(NAMED_MISSING.includes("gst-invoice"));
    assert.ok(REFUSED.includes("ai-rupee-write"));
    assert.ok(REFUSED.includes("github-human-icd"));
  });
});
