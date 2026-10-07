import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { ATLAS_NAV, NAV_GROUPS, NAV_ITEMS, PRIMARY_NAV, isNavActive, navItemFor } from "./nav.ts";
import { PAGES } from "./os/completion.ts";

describe("operator navigation", () => {
  it("covers every wired page exactly once", () => {
    const tos = NAV_ITEMS.map((item) => item.to);
    assert.equal(tos.length, new Set(tos).size);
    assert.equal(NAV_ITEMS.length, PAGES.length);
    for (const href of PAGES) {
      assert.ok(
        NAV_ITEMS.some((item) => item.to === href),
        `missing nav for ${href}`,
      );
    }
  });

  it("keeps six primary doors and an atlas of the rest", () => {
    assert.equal(PRIMARY_NAV.length, 6);
    assert.equal(ATLAS_NAV.length, NAV_ITEMS.length - PRIMARY_NAV.length);
    assert.equal(NAV_GROUPS.length, 4);
    assert.ok(PRIMARY_NAV.some((item) => item.to === "/"));
    assert.ok(PRIMARY_NAV.some((item) => item.to === "/os"));
  });

  it("resolves nested paths without lighting Books on every page", () => {
    assert.equal(isNavActive("/", "/"), true);
    assert.equal(isNavActive("/", "/lots"), false);
    assert.equal(navItemFor("/lots")?.label, "Lots");
    assert.equal(navItemFor("/")?.label, "Books");
  });
});
