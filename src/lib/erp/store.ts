import { create } from "zustand";
import {
  clearLien,
  enrollFarmer,
  getBooks,
  intakeLot,
  pledgeLot,
  poolSell,
  recordHarvest,
  recordInput,
  sellLot,
  settlePoolSale,
  settleSale,
  acceptSeason,
  declareSpoilage,
  declareWeather,
  declareIot,
  declareWindowKwh,
} from "./fns";
import type { BooksSnapshot } from "./types";

type BooksClient = {
  ready: boolean;
  busy: boolean;
  error: string | null;
  books: BooksSnapshot | null;
  hydrate: (snapshot: BooksSnapshot) => void;
  refresh: () => Promise<void>;
  harvest: (input: {
    cellId: string;
    variety: string;
    commodity: string;
    kg: string;
    moisture?: string;
    gi?: boolean;
  }) => Promise<boolean>;
  intake: (lotId: string) => Promise<boolean>;
  pledge: (receiptId: string, lender: string) => Promise<boolean>;
  unpledge: (receiptId: string) => Promise<boolean>;
  sell: (input: {
    lotId: string;
    buyer: string;
    kg: string;
    pricePerKg: string;
    freightPerKg?: string;
  }) => Promise<boolean>;
  settle: (orderId: string, paymentRef: string, hoursToPay: string) => Promise<boolean>;
  inputCost: (input: {
    cellId: string;
    kind: string;
    qty: string;
    unit: string;
    amount: string;
    memo: string;
  }) => Promise<boolean>;
  enroll: (input: { name: string; household: string; acres: string; notes?: string }) => Promise<boolean>;
  pool: (input: {
    commodity: string;
    buyer: string;
    kg: string;
    pricePerKg: string;
    freightPerKg?: string;
  }) => Promise<boolean>;
  settlePool: (poolId: string, paymentRef: string, hoursToPay: string) => Promise<boolean>;
  acceptContract: (contractId: string, pricePerKg: string) => Promise<boolean>;
  spoil: (lotId: string, kg: string, cause: string) => Promise<boolean>;
  weather: (input: { village: string; hazard: string; windowNote: string }) => Promise<boolean>;
  iot: (input: { entityId: string; cellId: string; kind: string; value: string; unit: string; note: string }) => Promise<boolean>;
  energyKwh: (windowId: string, kwh: string) => Promise<boolean>;
};

function apply(
  set: (p: Partial<BooksClient>) => void,
  result: { ok: boolean; error?: string } & Partial<BooksSnapshot>,
) {
  if (!result.ok) {
    set({ busy: false, error: result.error ?? "books failed" });
    return false;
  }
  set({ busy: false, error: null, ready: true, books: result as BooksSnapshot });
  return true;
}

export const useBooks = create<BooksClient>((set) => ({
  ready: false,
  busy: false,
  error: null,
  books: null,
  hydrate: (snapshot) => set({ books: snapshot, ready: true, error: null }),
  refresh: async () => {
    try {
      const result = await getBooks();
      apply(set, result);
    } catch {
      // keep last books
    }
  },
  harvest: async (input) => {
    set({ busy: true, error: null });
    try {
      return apply(set, await recordHarvest({ data: input }));
    } catch (err) {
      set({ busy: false, error: err instanceof Error ? err.message : "harvest failed" });
      return false;
    }
  },
  intake: async (lotId) => {
    set({ busy: true, error: null });
    try {
      return apply(set, await intakeLot({ data: { lotId } }));
    } catch (err) {
      set({ busy: false, error: err instanceof Error ? err.message : "intake failed" });
      return false;
    }
  },
  pledge: async (receiptId, lender) => {
    set({ busy: true, error: null });
    try {
      return apply(set, await pledgeLot({ data: { receiptId, lender } }));
    } catch (err) {
      set({ busy: false, error: err instanceof Error ? err.message : "pledge failed" });
      return false;
    }
  },
  unpledge: async (receiptId) => {
    set({ busy: true, error: null });
    try {
      return apply(set, await clearLien({ data: { receiptId } }));
    } catch (err) {
      set({ busy: false, error: err instanceof Error ? err.message : "lien failed" });
      return false;
    }
  },
  sell: async (input) => {
    set({ busy: true, error: null });
    try {
      return apply(set, await sellLot({ data: input }));
    } catch (err) {
      set({ busy: false, error: err instanceof Error ? err.message : "sale failed" });
      return false;
    }
  },
  settle: async (orderId, paymentRef, hoursToPay) => {
    set({ busy: true, error: null });
    try {
      return apply(set, await settleSale({ data: { orderId, paymentRef, hoursToPay } }));
    } catch (err) {
      set({ busy: false, error: err instanceof Error ? err.message : "settle failed" });
      return false;
    }
  },
  inputCost: async (input) => {
    set({ busy: true, error: null });
    try {
      return apply(set, await recordInput({ data: input }));
    } catch (err) {
      set({ busy: false, error: err instanceof Error ? err.message : "input failed" });
      return false;
    }
  },
  enroll: async (input) => {
    set({ busy: true, error: null });
    try {
      return apply(set, await enrollFarmer({ data: input }));
    } catch (err) {
      set({ busy: false, error: err instanceof Error ? err.message : "enroll failed" });
      return false;
    }
  },
  pool: async (input) => {
    set({ busy: true, error: null });
    try {
      return apply(set, await poolSell({ data: input }));
    } catch (err) {
      set({ busy: false, error: err instanceof Error ? err.message : "pool failed" });
      return false;
    }
  },
  settlePool: async (poolId, paymentRef, hoursToPay) => {
    set({ busy: true, error: null });
    try {
      return apply(set, await settlePoolSale({ data: { poolId, paymentRef, hoursToPay } }));
    } catch (err) {
      set({ busy: false, error: err instanceof Error ? err.message : "pool settle failed" });
      return false;
    }
  },
  acceptContract: async (contractId, pricePerKg) => {
    set({ busy: true, error: null });
    try {
      return apply(set, await acceptSeason({ data: { contractId, pricePerKg } }));
    } catch (err) {
      set({ busy: false, error: err instanceof Error ? err.message : "contract failed" });
      return false;
    }
  },
  spoil: async (lotId, kg, cause) => {
    set({ busy: true, error: null });
    try {
      return apply(set, await declareSpoilage({ data: { lotId, kg, cause } }));
    } catch (err) {
      set({ busy: false, error: err instanceof Error ? err.message : "spoilage failed" });
      return false;
    }
  },
  weather: async (input) => {
    set({ busy: true, error: null });
    try {
      return apply(set, await declareWeather({ data: input }));
    } catch (err) {
      set({ busy: false, error: err instanceof Error ? err.message : "weather failed" });
      return false;
    }
  },
  iot: async (input) => {
    set({ busy: true, error: null });
    try {
      return apply(set, await declareIot({ data: input }));
    } catch (err) {
      set({ busy: false, error: err instanceof Error ? err.message : "reading failed" });
      return false;
    }
  },
  energyKwh: async (windowId, kwh) => {
    set({ busy: true, error: null });
    try {
      return apply(set, await declareWindowKwh({ data: { windowId, kwh } }));
    } catch (err) {
      set({ busy: false, error: err instanceof Error ? err.message : "energy failed" });
      return false;
    }
  },
}));
