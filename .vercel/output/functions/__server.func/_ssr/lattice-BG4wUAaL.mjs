import { t as BRIDGES } from "./bridges-B9ONDsOo.mjs";
import { t as CONCEPTS } from "./concepts-b3GZTvML.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/lattice-BG4wUAaL.js
var CONCEPT_BY_ID = Object.fromEntries(CONCEPTS.map((c) => [c.id, c]));
var BRIDGE_BY_ID = Object.fromEntries(BRIDGES.map((b) => [b.id, b]));
function conceptRole(c) {
	return c.role ?? "organ";
}
function bridgesFor(conceptId) {
	return BRIDGES.filter((b) => b.from === conceptId || b.to === conceptId);
}
function conceptStatusVariant(status) {
	if (status === "living") return "live";
	if (status === "partial") return "partial";
	return "gap";
}
function bridgeStatusVariant(status) {
	if (status === "living") return "live";
	if (status === "partial") return "partial";
	return "gap";
}
function livingDegreeMap() {
	const deg = {};
	for (const c of CONCEPTS) deg[c.id] = 0;
	for (const b of BRIDGES) {
		if (b.status === "missing") continue;
		if (deg[b.from] !== void 0) deg[b.from] += 1;
		if (deg[b.to] !== void 0) deg[b.to] += 1;
	}
	return deg;
}
function isolatedConcepts() {
	const deg = livingDegreeMap();
	return CONCEPTS.filter((c) => (deg[c.id] ?? 0) === 0);
}
function weakConcepts() {
	const deg = livingDegreeMap();
	return CONCEPTS.filter((c) => (deg[c.id] ?? 0) > 0 && (deg[c.id] ?? 0) <= 2);
}
function latticeStats() {
	const missingOrgans = CONCEPTS.filter((c) => c.status === "missing").length;
	const living = BRIDGES.filter((b) => b.status === "living").length;
	const partial = BRIDGES.filter((b) => b.status === "partial").length;
	const missing = BRIDGES.filter((b) => b.status === "missing").length;
	const weighted = living * 1 + partial * .45;
	const integrity = BRIDGES.length ? Math.round(weighted / BRIDGES.length * 100) : 0;
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
		weak
	};
}
function filterBridges(opts) {
	const q = opts.query.trim().toLowerCase();
	return BRIDGES.filter((b) => {
		if (opts.status !== "all" && b.status !== opts.status) return false;
		if (opts.kind !== "all" && b.kind !== opts.kind) return false;
		if (opts.conceptId && b.from !== opts.conceptId && b.to !== opts.conceptId) return false;
		if (!q) return true;
		const from = CONCEPT_BY_ID[b.from];
		const to = CONCEPT_BY_ID[b.to];
		return `${b.name} ${b.signal} ${b.thought} ${b.contract} ${from?.name ?? ""} ${to?.name ?? ""}`.toLowerCase().includes(q);
	});
}
var VIEWBOX = {
	w: 1e3,
	h: 640
};
function bindTargets(c) {
	return (c.binds ?? []).map((id) => CONCEPT_BY_ID[id]).filter(Boolean);
}
//#endregion
export { bridgeStatusVariant as a, conceptStatusVariant as c, latticeStats as d, livingDegreeMap as f, bindTargets as i, filterBridges as l, CONCEPT_BY_ID as n, bridgesFor as o, weakConcepts as p, VIEWBOX as r, conceptRole as s, BRIDGE_BY_ID as t, isolatedConcepts as u };
