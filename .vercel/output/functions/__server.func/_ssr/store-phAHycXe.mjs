import { n as create, t as persist } from "../_libs/zustand.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/store-phAHycXe.js
var useLattice = create()(persist((set, get) => ({
	selectedConceptId: "farmer",
	selectedBridgeId: null,
	statusFilter: "all",
	kindFilter: "all",
	roleFilter: "all",
	query: "",
	proposed: [],
	showMesh: true,
	selectConcept: (id) => set({
		selectedConceptId: id,
		selectedBridgeId: id ? get().selectedBridgeId : null
	}),
	selectBridge: (id) => set({ selectedBridgeId: id }),
	setStatusFilter: (statusFilter) => set({ statusFilter }),
	setKindFilter: (kindFilter) => set({ kindFilter }),
	setRoleFilter: (roleFilter) => set({ roleFilter }),
	setQuery: (query) => set({ query }),
	toggleProposed: (id) => {
		const cur = get().proposed;
		set({ proposed: cur.includes(id) ? cur.filter((x) => x !== id) : [...cur, id] });
	},
	setShowMesh: (showMesh) => set({ showMesh })
}), {
	name: "afrera-lattice",
	partialize: (s) => ({
		proposed: s.proposed,
		showMesh: s.showMesh
	})
}));
//#endregion
export { useLattice as t };
