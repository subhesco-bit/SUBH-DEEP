import { t as CONCEPTS } from "./concepts-b3GZTvML.mjs";
import { t as AI_SYSTEMS } from "./catalog-BIfdppeO.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/systems-CVrwklEg.js
var CONCEPT_BY_ID = Object.fromEntries(CONCEPTS.map((c) => [c.id, c]));
var SYSTEM_BY_ID = Object.fromEntries(AI_SYSTEMS.map((s) => [s.id, s]));
function systemStatusVariant(actual) {
	if (actual === "partial") return "partial";
	if (actual === "duplicate") return "partial";
	return "gap";
}
function systemStats() {
	const wiredButSkeleton = AI_SYSTEMS.filter((s) => s.declared === "WIRED" && (s.actual === "skeleton" || s.actual === "duplicate" || !s.isComplete)).length;
	const stubs = AI_SYSTEMS.filter((s) => s.bytesCanonical > 0 && s.bytesCanonical < 2e3).length;
	const duplicates = AI_SYSTEMS.filter((s) => s.actual === "duplicate").length;
	return {
		systems: AI_SYSTEMS.length,
		wiredButSkeleton,
		stubs,
		duplicates,
		livingPlugs: 0,
		partialPlugs: AI_SYSTEMS.filter((s) => s.actual === "partial").length,
		missingPlugs: AI_SYSTEMS.filter((s) => s.actual !== "partial").length,
		moduleDirs: 544,
		namedAiModules: 18
	};
}
function filterSystems(opts) {
	const q = opts.query.trim().toLowerCase();
	return AI_SYSTEMS.filter((s) => {
		if (opts.family !== "all" && s.family !== opts.family) return false;
		if (opts.actual === "stub") {
			if (!(s.bytesCanonical > 0 && s.bytesCanonical < 2e3)) return false;
		} else if (opts.actual !== "all" && s.actual !== opts.actual) return false;
		if (!q) return true;
		return `${s.name} ${s.moduleId} ${s.silo} ${s.contract} ${s.path}`.toLowerCase().includes(q);
	});
}
function organsForSystem(s) {
	return s.organs.map((id) => CONCEPT_BY_ID[id]).filter(Boolean);
}
//#endregion
export { systemStatusVariant as a, systemStats as i, filterSystems as n, organsForSystem as r, SYSTEM_BY_ID as t };
