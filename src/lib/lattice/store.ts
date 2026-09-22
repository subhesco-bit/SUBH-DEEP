import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { BridgeKind, BridgeStatus, ConceptRole } from "./types";

type LatticeState = {
  selectedConceptId: string | null;
  selectedBridgeId: string | null;
  statusFilter: "all" | BridgeStatus;
  kindFilter: "all" | BridgeKind;
  roleFilter: "all" | ConceptRole;
  query: string;
  proposed: string[];
  showMesh: boolean;
  selectConcept: (id: string | null) => void;
  selectBridge: (id: string | null) => void;
  setStatusFilter: (v: LatticeState["statusFilter"]) => void;
  setKindFilter: (v: LatticeState["kindFilter"]) => void;
  setRoleFilter: (v: LatticeState["roleFilter"]) => void;
  setQuery: (q: string) => void;
  toggleProposed: (id: string) => void;
  setShowMesh: (v: boolean) => void;
};

export const useLattice = create<LatticeState>()(
  persist(
    (set, get) => ({
      selectedConceptId: "farmer",
      selectedBridgeId: null,
      statusFilter: "all",
      kindFilter: "all",
      roleFilter: "all",
      query: "",
      proposed: [],
      showMesh: true,
      selectConcept: (id) =>
        set({
          selectedConceptId: id,
          selectedBridgeId: id ? get().selectedBridgeId : null,
        }),
      selectBridge: (id) => set({ selectedBridgeId: id }),
      setStatusFilter: (statusFilter) => set({ statusFilter }),
      setKindFilter: (kindFilter) => set({ kindFilter }),
      setRoleFilter: (roleFilter) => set({ roleFilter }),
      setQuery: (query) => set({ query }),
      toggleProposed: (id) => {
        const cur = get().proposed;
        set({
          proposed: cur.includes(id) ? cur.filter((x) => x !== id) : [...cur, id],
        });
      },
      setShowMesh: (showMesh) => set({ showMesh }),
    }),
    { name: "afrera-lattice", partialize: (s) => ({ proposed: s.proposed, showMesh: s.showMesh }) },
  ),
);
