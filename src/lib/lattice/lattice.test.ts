import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { CORE_BRIDGES } from "./bridges-core.ts";
import { MESH_BRIDGES } from "./bridges-mesh.ts";
import { CONCEPTS } from "./concepts.ts";
import { WALK } from "./walk.ts";

const BRIDGES = [...CORE_BRIDGES, ...MESH_BRIDGES];
const CONCEPT_BY_ID = Object.fromEntries(CONCEPTS.map((c) => [c.id, c]));

describe("AFRERA lattice", () => {
  it("every bridge points at known concepts", () => {
    for (const b of BRIDGES) {
      assert.ok(CONCEPT_BY_ID[b.from], `unknown from: ${b.id} ${b.from}`);
      assert.ok(CONCEPT_BY_ID[b.to], `unknown to: ${b.id} ${b.to}`);
      assert.notEqual(b.from, b.to, `self-loop ${b.id}`);
    }
  });

  it("bridge ids are unique", () => {
    const ids = BRIDGES.map((b) => b.id);
    assert.equal(ids.length, new Set(ids).size);
  });

  it("concept ids are unique", () => {
    const ids = CONCEPTS.map((c) => c.id);
    assert.equal(ids.length, new Set(ids).size);
  });

  it("bridge concepts declare binds that exist", () => {
    const bridges = CONCEPTS.filter((x) => (x.role ?? "organ") === "bridge");
    for (const c of bridges) {
      assert.ok((c.binds ?? []).length >= 2, `${c.id} should bind at least two organs`);
      for (const id of c.binds ?? []) {
        assert.ok(CONCEPT_BY_ID[id], `${c.id} binds unknown ${id}`);
      }
    }
  });

  it("walk hops resolve", () => {
    for (const hop of WALK) {
      assert.ok(CONCEPT_BY_ID[hop.organId], hop.organId);
      if (hop.bridgeId) {
        assert.ok(
          BRIDGES.some((b) => b.id === hop.bridgeId),
          hop.bridgeId,
        );
      }
    }
  });

  it("mesh is denser than the original silo set", () => {
    const thoughtful = BRIDGES.filter((b) => b.kind === "thoughtful").length;
    const technical = BRIDGES.filter((b) => b.kind === "technical").length;
    const living = BRIDGES.filter((b) => b.status === "living").length;
    const partial = BRIDGES.filter((b) => b.status === "partial").length;
    const integrity = Math.round(((living * 1 + partial * 0.45) / BRIDGES.length) * 100);
    const bridgeConcepts = CONCEPTS.filter((c) => (c.role ?? "organ") === "bridge").length;
    assert.ok(BRIDGES.length >= 90, `expected dense mesh, got ${BRIDGES.length}`);
    assert.ok(thoughtful >= 20, `thoughtful ${thoughtful}`);
    assert.ok(technical >= 50, `technical ${technical}`);
    assert.ok(bridgeConcepts >= 8, `bridge concepts ${bridgeConcepts}`);
    assert.ok(integrity < 40, `integrity ${integrity} should still read as unintegrated`);
  });
});
