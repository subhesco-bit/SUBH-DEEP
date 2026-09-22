import { create } from "zustand";
import { getPlatform, processDeclared } from "./fns";
import { useBooks } from "./store";
import type { PlatformSnapshot } from "./platform";

type PlatformClient = {
  ready: boolean;
  busy: boolean;
  error: string | null;
  snapshot: PlatformSnapshot | null;
  hydrate: (snapshot: PlatformSnapshot) => void;
  refresh: () => Promise<void>;
  process: (input: { lotId: string; kind: string; lossKg: string; note?: string }) => Promise<boolean>;
};

export const usePlatform = create<PlatformClient>((set) => ({
  ready: false,
  busy: false,
  error: null,
  snapshot: null,
  hydrate: (snapshot) => set({ snapshot, ready: true, error: null }),
  refresh: async () => {
    const res = await getPlatform();
    if (!res.ok) {
      set({ error: res.error ?? "platform unread", ready: true });
      return;
    }
    set({ snapshot: res, ready: true, error: null });
  },
  process: async (input) => {
    set({ busy: true, error: null });
    const res = await processDeclared({ data: input });
    if (!res.ok) {
      set({ busy: false, error: res.error ?? "process failed" });
      return false;
    }
    set({ busy: false, snapshot: res, ready: true, error: null });
    useBooks.getState().hydrate(res);
    return true;
  },
}));
