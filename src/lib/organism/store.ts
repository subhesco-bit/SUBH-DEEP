import { create } from "zustand";
import {
  bootOrganism,
  consultLibrary,
  getOrganism,
  publishSpineEvent,
  type OrganismSnapshot,
} from "./fns";

type OrganismClient = {
  ready: boolean;
  booting: boolean;
  consulting: boolean;
  snapshot: OrganismSnapshot | null;
  error: string | null;
  lastConsult: { reading: string; source: string } | null;
  hydrate: (snapshot: OrganismSnapshot) => void;
  boot: () => Promise<void>;
  refresh: () => Promise<void>;
  consult: (query: string, organId?: string | null) => Promise<void>;
  publish: (signal: string, organId?: string | null, ligamentId?: string | null) => Promise<void>;
};

export const useOrganism = create<OrganismClient>((set, get) => ({
  ready: false,
  booting: false,
  consulting: false,
  snapshot: null,
  error: null,
  lastConsult: null,
  hydrate: (snapshot) => {
    set({
      snapshot,
      ready: snapshot.autoOp === "living",
      error: snapshot.lastError,
      booting: false,
    });
  },
  boot: async () => {
    if (get().booting) return;
    if (get().ready && get().snapshot) return;
    set({ booting: true, error: null });
    try {
      const result = await bootOrganism();
      if (!result.ok) {
        set({ booting: false, error: result.error ?? result.lastError, snapshot: result, ready: false });
        return;
      }
      set({ booting: false, ready: result.autoOp === "living", snapshot: result, error: null });
    } catch (err) {
      set({
        booting: false,
        error: err instanceof Error ? err.message : "boot failed",
      });
    }
  },
  refresh: async () => {
    try {
      const result = await getOrganism();
      if (result.ok) {
        set({
          snapshot: result,
          ready: result.autoOp === "living",
          error: result.lastError,
        });
      }
    } catch {
      // keep last snapshot
    }
  },
  consult: async (query, organId) => {
    set({ consulting: true, error: null });
    try {
      const result = await consultLibrary({ data: { query, organId: organId ?? null } });
      if (!result.ok) {
        set({ consulting: false, error: result.error });
        return;
      }
      const snap = get().snapshot;
      set({
        consulting: false,
        lastConsult: { reading: result.reading, source: result.source },
        snapshot: snap
          ? { ...snap, pulses: result.pulses, events: result.events, lastPulseAt: new Date().toISOString() }
          : snap,
      });
    } catch (err) {
      set({
        consulting: false,
        error: err instanceof Error ? err.message : "consult failed",
      });
    }
  },
  publish: async (signal, organId, ligamentId) => {
    try {
      const result = await publishSpineEvent({
        data: { signal, organId: organId ?? null, ligamentId: ligamentId ?? null },
      });
      if (result.ok) {
        const snap = get().snapshot;
        if (snap) set({ snapshot: { ...snap, events: result.events } });
      }
    } catch {
      // spine publish is best-effort
    }
  },
}));
