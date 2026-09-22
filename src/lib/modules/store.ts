import { create } from "zustand";
import { consultModule, getModuleOs, runModuleWorkflow } from "./fns";
import type { ModuleOsSnapshot } from "./types";

type ModuleClient = {
  ready: boolean;
  busy: boolean;
  error: string | null;
  snapshot: ModuleOsSnapshot | null;
  hydrate: (snapshot: ModuleOsSnapshot) => void;
  refresh: () => Promise<void>;
  run: (workflowId: string, lotId?: string) => Promise<boolean>;
  consult: (query: string) => Promise<boolean>;
};

export const useModuleOs = create<ModuleClient>((set) => ({
  ready: false,
  busy: false,
  error: null,
  snapshot: null,
  hydrate: (snapshot) => set({ snapshot, ready: true, error: snapshot.lastError }),
  refresh: async () => {
    const res = await getModuleOs();
    if (!res.ok) {
      set({ error: res.error ?? "module OS unread", snapshot: res, ready: true });
      return;
    }
    set({ snapshot: res, ready: true, error: null });
  },
  run: async (workflowId, lotId) => {
    set({ busy: true, error: null });
    const res = await runModuleWorkflow({ data: { workflowId, lotId } });
    if (!res.ok) {
      set({ busy: false, error: res.error ?? "workflow failed", snapshot: res });
      return false;
    }
    set({ busy: false, snapshot: res, ready: true, error: null });
    return true;
  },
  consult: async (query) => {
    set({ busy: true, error: null });
    const res = await consultModule({ data: { query } });
    if (!res.ok) {
      set({ busy: false, error: res.error ?? "consult failed", snapshot: res });
      return false;
    }
    set({ busy: false, snapshot: res, ready: true, error: null });
    return true;
  },
}));
